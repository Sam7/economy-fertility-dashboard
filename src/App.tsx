import { useEffect, useMemo, useState } from 'react';
import { LineChart, type ChartSeries } from './LineChart';
import {
  END_YEAR,
  START_YEAR,
  applyPreset,
  clamp,
  compactNumber,
  countries,
  countryGroupOrder,
  createScenarioFromCountry,
  dollarsPerPerson,
  encodeAppState,
  initialAppState,
  presets,
  requiredMigrationForFlatPopulation,
  resetScenarioGdp,
  runScenario,
  signed,
  signedPct,
  pct,
  trillions,
  type AppState,
  type EconomyMode,
  type ProjectionPoint,
  type Scenario,
  type Side,
} from './model';

const A_COLOR = '#3157d5';
const B_COLOR = '#d45f39';

function scenarioChartSeries(a: ProjectionPoint[], b: ProjectionPoint[], accessor: (point: ProjectionPoint) => number, state: AppState): ChartSeries[] {
  return [
    { name: state.a.title, color: A_COLOR, data: a.map((point) => ({ year: point.year, value: accessor(point) })) },
    { name: state.b.title, color: B_COLOR, data: b.map((point) => ({ year: point.year, value: accessor(point) })) },
  ];
}

function economyValue(point: ProjectionPoint, mode: EconomyMode, perCapita = false): number {
  if (mode === 'market') return perCapita ? point.gdppcNominal : point.gdpNominal;
  if (mode === 'index') return perCapita ? point.gdppcIndex : point.gdpIndex;
  return perCapita ? point.gdppcPPP : point.gdpPPP;
}

function economyFormat(mode: EconomyMode, perCapita = false): (value: number) => string {
  if (mode === 'index') return (value) => value.toFixed(0);
  if (perCapita) return dollarsPerPerson;
  return trillions;
}

function crossoverSummary(a: ProjectionPoint[], b: ProjectionPoint[], mode: EconomyMode): string {
  const differenceAt = (index: number) => economyValue(a[index], mode) - economyValue(b[index], mode);
  let previous = differenceAt(0);
  if (Math.abs(previous) < 1e-9) {
    for (let index = 1; index < a.length; index += 1) {
      const difference = differenceAt(index);
      if (Math.abs(difference) > 1e-9) return `${difference > 0 ? 'A' : 'B'} leads from ${a[index].year}`;
    }
    return 'Equal throughout';
  }
  for (let index = 1; index < a.length; index += 1) {
    const difference = differenceAt(index);
    if ((previous < 0 && difference >= 0) || (previous > 0 && difference <= 0)) {
      return `${difference >= 0 ? 'A' : 'B'} overtakes in ${a[index].year}`;
    }
    previous = difference;
  }
  return 'No crossover by 2126';
}

interface NumericInputProps {
  id: string;
  label: string;
  value: number;
  displayValue?: string;
  min: number;
  max: number;
  step: number;
  onCommit: (value: number) => void;
  hint?: string;
}

function NumericInput({ id, label, value, displayValue, min, max, step, onCommit, hint }: NumericInputProps) {
  const [draft, setDraft] = useState(displayValue ?? String(value));
  useEffect(() => setDraft(displayValue ?? String(value)), [displayValue, value]);

  function commit() {
    if (!draft.trim() || !Number.isFinite(Number(draft))) {
      setDraft(displayValue ?? String(value));
      return;
    }
    onCommit(clamp(min, max, Number(draft)));
  }

  return (
    <label className="mini-field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type="number"
        value={draft}
        min={min}
        max={max}
        step={step}
        aria-label={label}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }}
      />
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  );
}

interface ScenarioControlsProps {
  side: Side;
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
  onCountryChange: (countryId: string) => void;
}

function ScenarioControls({ side, scenario, onChange, onCountryChange }: ScenarioControlsProps) {
  const upperSide = side.toUpperCase();
  const country = countries[scenario.country] ?? countries.model10m;
  const firstYearMigration = scenario.population * scenario.migration / 1000;

  return (
    <article className={`scenario-compact scenario-${side}`}>
      <div className="compact-scenario-head">
        <div>
          <span className="scenario-tag">SCENARIO {upperSide}</span>
          <h2>{scenario.title}</h2>
        </div>
        <span className="scenario-dot" aria-hidden="true" />
      </div>
      <label className="compact-field country-field" htmlFor={`country-${side}`}>
        <span>Country / starting profile</span>
        <select id={`country-${side}`} value={scenario.country} aria-label={`Scenario ${upperSide} country`} onChange={(event) => onCountryChange(event.target.value)}>
          {countryGroupOrder.map((group) => {
            const entries = Object.entries(countries).filter(([, entry]) => entry.group === group);
            return entries.length ? (
              <optgroup key={group} label={group}>
                {entries.map(([key, entry]) => <option key={key} value={key}>{entry.flag} {entry.label}</option>)}
              </optgroup>
            ) : null;
          })}
        </select>
      </label>
      <div className="compact-control-grid">
        <div className="compact-control">
          <div className="control-top"><label htmlFor={`tfr-${side}`}>Fertility · TFR</label><output htmlFor={`tfr-${side}`}>{scenario.tfr.toFixed(2)}</output></div>
          <input
            id={`tfr-${side}`}
            className="range"
            type="range"
            min="0.6"
            max="6.5"
            step="0.01"
            value={scenario.tfr}
            onChange={(event) => {
              const tfr = Number(event.target.value);
              onChange({ tfr, tfr2100: tfr, title: `${country.label} · TFR ${tfr.toFixed(2)}` });
            }}
          />
          <div className="scale-labels"><span>0.6</span><span>2.1 replacement*</span><span>6.5</span></div>
        </div>
        <div className="compact-control">
          <div className="control-top"><label htmlFor={`migration-${side}`}>Net migration / 1,000 / yr</label><output htmlFor={`migration-${side}`}>{signed(scenario.migration, 1)}</output></div>
          <input
            id={`migration-${side}`}
            className="range"
            type="range"
            min="-10"
            max="20"
            step="0.1"
            value={scenario.migration}
            onChange={(event) => onChange({ migration: Number(event.target.value), title: `${country.label} · custom` })}
          />
          <div className="scale-labels"><span>−10</span><span>≈ {firstYearMigration >= 0 ? '+' : ''}{compactNumber(firstYearMigration)} people in year 1</span><span>+20</span></div>
        </div>
      </div>
    </article>
  );
}

function ScenarioAssumptions({ side, scenario, onChange, onResetGdp }: {
  side: Side;
  scenario: Scenario;
  onChange: (patch: Partial<Scenario>) => void;
  onResetGdp: () => void;
}) {
  const country = countries[scenario.country] ?? countries.model10m;
  const upperSide = side.toUpperCase();
  return (
    <section className={`advanced-side advanced-${side}`} aria-label={`Scenario ${upperSide} assumptions`}>
      <span className="scenario-tag">SCENARIO {upperSide}</span>
      <div className="advanced-fields">
        <div className="gdp-assumption-grid">
          <NumericInput id={`gdp-market-${side}`} label="Market GDP · US$T" value={scenario.gdpMarketTrillions} min={0} max={1000} step={0.01} onCommit={(value) => onChange({ gdpMarketTrillions: value })} hint="Starting total" />
          <NumericInput id={`gdp-ppp-${side}`} label="PPP GDP · Intl$T" value={scenario.gdpPppTrillions} min={0} max={1000} step={0.01} onCommit={(value) => onChange({ gdpPppTrillions: value })} hint="Starting total" />
        </div>
        <button className="gdp-reset" type="button" onClick={onResetGdp} aria-label={`Reset Scenario ${upperSide} GDP to ${country.label} defaults`}>Reset GDP defaults</button>
        <NumericInput
          id={`population-input-${side}`}
          label="Starting population (m)"
          value={scenario.population / 1e6}
          displayValue={(scenario.population / 1e6).toFixed(2).replace(/\.00$/, '')}
          min={0.1}
          max={2000}
          step={0.1}
          onCommit={(value) => onChange({ population: value * 1e6, title: `${country.label} · custom` })}
        />
        <NumericInput id={`tfr2100-${side}`} label="TFR in 2100" value={scenario.tfr2100} min={0.6} max={6.5} step={0.01} onCommit={(value) => onChange({ tfr2100: value })} />
        <NumericInput id={`life-${side}`} label="Life expectancy" value={scenario.life} min={45} max={92} step={0.1} onCommit={(value) => onChange({ life: value })} />
        <NumericInput id={`retirement-${side}`} label="Retirement age" value={scenario.retirement} min={60} max={75} step={1} onCommit={(value) => onChange({ retirement: value })} />
        <NumericInput id={`productivity-${side}`} label="Output / worker growth · yr (%)" value={scenario.productivity} min={-1} max={4} step={0.1} onCommit={(value) => onChange({ productivity: value })} />
      </div>
    </section>
  );
}

function OutcomeCard({ side, scenario, point, start }: { side: Side; scenario: Scenario; point: ProjectionPoint; start: ProjectionPoint }) {
  const upperSide = side.toUpperCase();
  return (
    <article className={`outcome-card outcome-${side}`}>
      <span className="scenario-tag">SCENARIO {upperSide} · <span>{scenario.title}</span></span>
      <div className="big-number">{compactNumber(point.pop)}</div>
      <div className="big-caption">population</div>
      <div className="metric-grid">
        <div><strong>{signedPct(point.pop / start.pop - 1)}</strong><span>vs start</span></div>
        <div><strong>{compactNumber(point.births)}</strong><span>births / yr</span></div>
        <div><strong>{pct(point.older / point.pop)}</strong><span>aged 65+</span></div>
        <div><strong>{point.support.toFixed(2)}</strong><span>workers / 65+</span></div>
      </div>
    </article>
  );
}

function ageBuckets(ages: number[]) {
  const buckets = [];
  for (let low = 0; low < 100; low += 5) {
    let total = 0;
    for (let age = low; age <= Math.min(99, low + 4); age += 1) total += ages[age];
    buckets.push({ label: `${low}–${low + 4}`, total });
  }
  buckets.push({ label: '100+', total: ages[100] });
  return buckets;
}

function AgeSummary({ point, side }: { point: ProjectionPoint; side: Side }) {
  return (
    <div className={`age-summary-${side}`}>
      <div className="age-pill"><strong>{pct(point.under15 / point.pop)}</strong><span>under 15</span></div>
      <div className="age-pill"><strong>{pct(point.working / point.pop)}</strong><span>age 20–64</span></div>
      <div className="age-pill"><strong>{pct(point.older / point.pop)}</strong><span>age 65+</span></div>
    </div>
  );
}

function AgePyramid({ a, b, state }: { a: ProjectionPoint; b: ProjectionPoint; state: AppState }) {
  const bucketsA = ageBuckets(a.ages);
  const bucketsB = ageBuckets(b.ages);
  const maxShare = Math.max(...bucketsA.map((bucket) => bucket.total / a.pop), ...bucketsB.map((bucket) => bucket.total / b.pop), 0.01);
  return (
    <div className="pyramid" role="img" aria-label={`Mirrored age profile for ${state.a.title} and ${state.b.title}`}>
      {bucketsA.map((_, index) => {
        const reverseIndex = bucketsA.length - 1 - index;
        const left = bucketsA[reverseIndex];
        const right = bucketsB[reverseIndex];
        const leftShare = left.total / a.pop;
        const rightShare = right.total / b.pop;
        return (
          <div key={left.label} className={`pyramid-row ${reverseIndex >= 13 ? 'older' : ''}`}>
            <div className="pyramid-side left"><div className="pyramid-bar" style={{ width: `${leftShare / maxShare * 100}%` }} title={`${state.a.title}: ${left.label} · ${pct(leftShare)}`} /></div>
            <div className="pyramid-age">{left.label}</div>
            <div className="pyramid-side right"><div className="pyramid-bar" style={{ width: `${rightShare / maxShare * 100}%` }} title={`${state.b.title}: ${right.label} · ${pct(rightShare)}`} /></div>
          </div>
        );
      })}
    </div>
  );
}

function EconomySection({ state, a, b, selectedA, selectedB, onModeChange }: {
  state: AppState;
  a: ProjectionPoint[];
  b: ProjectionPoint[];
  selectedA: ProjectionPoint;
  selectedB: ProjectionPoint;
  onModeChange: (mode: EconomyMode) => void;
}) {
  const mode = state.economyMode;
  const totalFormat = mode === 'index'
    ? (value: number) => value.toFixed(0)
    : (value: number) => `$${value.toFixed(value >= 10 ? 1 : 2).replace(/\.0$/, '')}T`;
  const modeCopy = mode === 'market'
    ? {
      label: 'Market USD',
      note: '2025 market-US$ starting values; future lines hold relative price/exchange-rate relationships constant and apply workforce × output-per-worker growth.',
      totalTitle: 'GDP · market USD anchor', totalUnit: '2025 US$ equivalent',
      pcTitle: 'GDP per person · market USD', pcUnit: '2025 US$ equivalent',
    }
    : mode === 'index'
      ? {
        label: 'Index',
        note: 'Each economy starts at 100. Best for isolating the demographic trajectory from differences in starting economic size.',
        totalTitle: 'GDP capacity index', totalUnit: '2026 = 100',
        pcTitle: 'GDP per capita index', pcUnit: '2026 = 100',
      }
      : {
        label: 'PPP',
        note: '2025 purchasing-power-parity starting values; a useful default for long-run real-volume comparisons because it avoids forecasting exchange rates.',
        totalTitle: 'GDP · PPP anchor', totalUnit: '2025 international-$ equivalent',
        pcTitle: 'GDP per person · PPP', pcUnit: '2025 international-$ equivalent',
      };
  const startFormat = economyFormat(mode);
  const perCapitaFormat = economyFormat(mode, true);
  const totalAccessor = (point: ProjectionPoint) => mode === 'index' ? economyValue(point, mode) : economyValue(point, mode) / 1e12;
  return (
    <section className="economy-section">
      <div className="section-heading economy-heading">
        <div><span className="section-kicker">ECONOMIC LAYER</span><h2>When does one economy overtake another?</h2></div>
        <div className="economy-intro">
          <p>Each scenario begins with its editable market and PPP GDP baseline. Future output remains transparent: starting GDP × change in effective workers × assumed output-per-worker growth.</p>
          <div className="segmented" role="group" aria-label="Economic comparison basis">
            {(['ppp', 'market', 'index'] as const).map((option) => (
              <button key={option} type="button" className={mode === option ? 'active' : ''} aria-pressed={mode === option} onClick={() => onModeChange(option)}>
                {option === 'market' ? 'Market USD' : option.toUpperCase()}
              </button>
            ))}
          </div>
          <small><strong>{modeCopy.label}</strong> · {modeCopy.note}</small>
        </div>
      </div>
      <div className="economy-summary">
        <article className="econ-scenario econ-a"><span>SCENARIO A · START → <b>{state.year}</b></span><div><strong>{startFormat(economyValue(a[0], mode))}</strong><i>→</i><strong>{startFormat(economyValue(selectedA, mode))}</strong></div></article>
        <article className="econ-crossover-card"><span>CROSSOVER</span><strong>{crossoverSummary(a, b, mode)}</strong></article>
        <article className="econ-scenario econ-b"><span>SCENARIO B · START → <b>{state.year}</b></span><div><strong>{startFormat(economyValue(b[0], mode))}</strong><i>→</i><strong>{startFormat(economyValue(selectedB, mode))}</strong></div></article>
      </div>
      <div className="economy-grid">
        <article className="chart-card economy-card">
          <div className="economy-title"><div><span>Total economic scale</span><strong>{modeCopy.totalTitle}</strong></div><small>{modeCopy.totalUnit}</small></div>
          <LineChart label="GDP projection" series={scenarioChartSeries(a, b, totalAccessor, state)} height={270} formatY={totalFormat} tooltipY={totalFormat} />
        </article>
        <article className="chart-card economy-card">
          <div className="economy-title"><div><span>Living-standard proxy</span><strong>{modeCopy.pcTitle}</strong></div><small>{modeCopy.pcUnit}</small></div>
          <LineChart label="GDP per person projection" series={scenarioChartSeries(a, b, (point) => economyValue(point, mode, true), state)} height={270} formatY={perCapitaFormat} tooltipY={perCapitaFormat} />
        </article>
      </div>
      <div className="research-row">
        <article><span>OECD 2025</span><strong>1.0% → 0.6%</strong><p>Average OECD GDP-per-capita growth could fall roughly this much by 2024–60 from demographic ageing under unchanged participation and productivity assumptions.</p></article>
        <article><span>Migration lever</span><strong>+0.13 pp</strong><p>Raising net migration to the 75th percentile of recent OECD experience was estimated to lift median GDP-per-capita growth by about 0.13 percentage points versus zero migration.</p></article>
        <article><span>Important caveat</span><strong>Not destiny</strong><p>Later retirement, higher participation, capital deepening, skills, automation and productivity can materially change the economic outcome.</p></article>
      </div>
    </section>
  );
}

const sources = [
  ['ABS · population & migration', 'https://www.abs.gov.au/statistics/people/population/national-state-and-territory-population/mar-2026'],
  ['ABS · fertility', 'https://www.abs.gov.au/statistics/people/population/births-australia/2024'],
  ['Japan Statistics Bureau · population', 'https://www.stat.go.jp/data/jinsui/new.htm'],
  ['Japan MHLW · fertility', 'https://www.mhlw.go.jp/toukei/saikin/hw/jinkou/kakutei24/index.html'],
  ['OECD · ageing & growth', 'https://www.oecd.org/en/publications/oecd-employment-outlook-2025_194a947b-en/full-report/setting-the-scene-demographic-change-economic-growth-and-intergenerational-inequalities_9d481169.html'],
  ['UN WPP 2024 · demographic dataset', 'https://population.un.org/wpp/Download/Standard/Population/'],
  ['PopulationClock · WPP-derived indicators', 'https://populationclock.org/'],
  ['UN WPP · projection methodology', 'https://population.un.org/wpp/'],
  ['World Bank WDI · market GDP', 'https://data.worldbank.org/indicator/NY.GDP.MKTP.CD'],
  ['World Bank WDI · PPP GDP', 'https://data.worldbank.org/indicator/NY.GDP.MKTP.PP.CD'],
];

export function App() {
  const [state, setState] = useState<AppState>(() => initialAppState(window.location.hash));
  const [toast, setToast] = useState('');
  const a = useMemo(() => runScenario(state.a), [state.a]);
  const b = useMemo(() => runScenario(state.b), [state.b]);
  const selectedA = a[state.year - START_YEAR];
  const selectedB = b[state.year - START_YEAR];
  const flatMigrationA = useMemo(() => requiredMigrationForFlatPopulation(state.a), [state.a]);
  const flatMigrationB = useMemo(() => requiredMigrationForFlatPopulation(state.b), [state.b]);

  useEffect(() => {
    window.history.replaceState(null, '', encodeAppState(state));
  }, [state]);

  function updateScenario(side: Side, patch: Partial<Scenario>) {
    setState((previous) => ({
      ...previous,
      [side]: { ...previous[side], ...patch },
      activePreset: null,
    }));
  }

  function changeCountry(side: Side, countryId: string) {
    const country = countries[countryId] ?? countries.model10m;
    setState((previous) => ({
      ...previous,
      [side]: createScenarioFromCountry(countryId, country.label),
      activePreset: null,
    }));
  }

  function resetGdp(side: Side) {
    setState((previous) => ({ ...previous, [side]: resetScenarioGdp(previous[side]), activePreset: null }));
  }

  function setMode(mode: EconomyMode) {
    setState((previous) => ({ ...previous, economyMode: mode }));
  }

  function copyScenario(from: Side, to: Side) {
    const source = state[from];
    setState((previous) => ({ ...previous, [to]: { ...source, title: `Copy of ${source.title}` }, activePreset: null }));
  }

  async function shareState() {
    const url = `${window.location.origin}${window.location.pathname}${encodeAppState(state)}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast('Scenario link copied');
    } catch {
      setToast('Share link is in the address bar');
    }
    window.setTimeout(() => setToast(''), 1800);
  }

  return (
    <main className="shell">
      <header className="hero">
        <div className="eyebrow">DEMOGRAPHIC FUTURES · SCENARIO PLAYGROUND</div>
        <div className="hero-grid">
          <div>
            <h1>Small fertility differences.<br /><em>Large generational consequences.</em></h1>
            <p className="lede">Compare two demographic futures over a century. Change fertility, migration and longevity, then watch population, age structure, births, workforce pressure and economic capacity compound.</p>
          </div>
          <aside className="hero-note">
            <span className="note-kicker">Start here</span>
            <strong>Try 1.8 vs 1.4.</strong>
            <span>Then turn migration on and off. The timing is the point: migration acts now; fertility acts slowly, then echoes through future generations.</span>
          </aside>
        </div>
      </header>

      <section className="preset-strip" aria-label="Quick comparisons">
        <span className="preset-label">Quick comparisons</span>
        {Object.entries(presets).slice(0, 6).map(([id, preset]) => (
          <button key={id} type="button" className={`preset ${state.activePreset === id ? 'active' : ''}`} aria-pressed={state.activePreset === id} onClick={() => setState((previous) => applyPreset(previous, id))}>{preset.label}</button>
        ))}
      </section>

      <section className="sticky-lab" aria-label="Scenario controls">
        <div className="sticky-scenarios">
          <ScenarioControls side="a" scenario={state.a} onChange={(patch) => updateScenario('a', patch)} onCountryChange={(id) => changeCountry('a', id)} />
          <div className="scenario-actions" aria-label="Scenario actions">
            <button type="button" title="Swap scenarios" aria-label="Swap scenarios" onClick={() => setState((previous) => ({ ...previous, a: previous.b, b: previous.a, activePreset: null }))}>⇄</button>
            <button type="button" title="Copy A to B" aria-label="Copy Scenario A to B" onClick={() => copyScenario('a', 'b')}>A→B</button>
            <button type="button" title="Copy B to A" aria-label="Copy Scenario B to A" onClick={() => copyScenario('b', 'a')}>B→A</button>
          </div>
          <ScenarioControls side="b" scenario={state.b} onChange={(patch) => updateScenario('b', patch)} onCountryChange={(id) => changeCountry('b', id)} />
        </div>
        <details className="sticky-advanced">
          <summary><span>More assumptions</span><small>editable GDP · population · long-run fertility · longevity · retirement · output / worker</small></summary>
          <div className="sticky-advanced-grid">
            <ScenarioAssumptions side="a" scenario={state.a} onChange={(patch) => updateScenario('a', patch)} onResetGdp={() => resetGdp('a')} />
            <ScenarioAssumptions side="b" scenario={state.b} onChange={(patch) => updateScenario('b', patch)} onResetGdp={() => resetGdp('b')} />
          </div>
        </details>
      </section>

      <section className="time-deck">
        <div><span className="section-kicker">LOOK THROUGH TIME</span><h2>What does the society look like in <strong>{state.year}</strong>?</h2></div>
        <div className="year-control">
          <label className="sr-only" htmlFor="year-slider">Selected year</label>
          <input id="year-slider" type="range" min={START_YEAR} max={END_YEAR} step="1" value={state.year} onChange={(event) => setState((previous) => ({ ...previous, year: Number(event.target.value) }))} />
          <div className="year-labels"><span>2026</span><span>2050</span><span>2075</span><span>2100</span><span>2126</span></div>
        </div>
      </section>

      <section className="outcomes" aria-label="Selected year outcomes">
        <OutcomeCard side="a" scenario={state.a} point={selectedA} start={a[0]} />
        <div className="delta-card"><span className="delta-kicker">A − B</span><strong>{`${selectedA.pop - selectedB.pop >= 0 ? '+' : ''}${compactNumber(selectedA.pop - selectedB.pop)}`}</strong><span>{selectedA.pop - selectedB.pop >= 0 ? 'more people in A' : 'fewer people in A'}</span></div>
        <OutcomeCard side="b" scenario={state.b} point={selectedB} start={b[0]} />
      </section>

      <section className="viz-section">
        <div className="section-heading"><div><span className="section-kicker">THE COMPOUNDING CURVE</span><h2>Population</h2></div><p>Fertility barely moves the population at first. The gap opens when smaller birth cohorts become smaller parent cohorts.</p></div>
        <div className="chart-card">
          <div className="legend"><span className="legend-a"><i /> <b>{state.a.title}</b></span><span className="legend-b"><i /> <b>{state.b.title}</b></span></div>
          <LineChart label="Population projection line chart" series={scenarioChartSeries(a, b, (point) => point.pop / 1e6, state)} formatY={(value) => `${value.toFixed(value >= 100 ? 0 : 1)}m`} tooltipY={(value) => `${value.toFixed(2)}m`} />
        </div>
      </section>

      <section className="viz-section">
        <div className="section-heading"><div><span className="section-kicker">THE SHAPE OF SOCIETY</span><h2>Age profile at {state.year}</h2></div><p>Each bar is the share of the population in a five-year age band. A narrow base today becomes a narrow workforce decades later.</p></div>
        <div className="chart-card pyramid-card">
          <div className="pyramid-labels"><span>{state.a.title}</span><span>share of population</span><span>{state.b.title}</span></div>
          <AgePyramid a={selectedA} b={selectedB} state={state} />
        </div>
        <div className="age-summary"><AgeSummary point={selectedA} side="a" /><AgeSummary point={selectedB} side="b" /></div>
      </section>

      <section className="viz-two">
        <article className="viz-section compact">
          <div className="section-heading compact-heading"><div><span className="section-kicker">THE GENERATIONAL ECHO</span><h2>Annual births</h2></div><p>Low fertility compounds twice: fewer children now, then fewer potential parents later.</p></div>
          <div className="chart-card"><LineChart label="Annual births projection line chart" series={scenarioChartSeries(a, b, (point) => point.births / 1000, state)} height={270} formatY={(value) => `${value.toFixed(0)}k`} tooltipY={(value) => `${value.toFixed(1)}k`} /></div>
        </article>
        <article className="viz-section compact">
          <div className="section-heading compact-heading"><div><span className="section-kicker">THE SUPPORT RATIO</span><h2>Workers per person 65+</h2></div><p>A simple pressure gauge: fewer workers supporting each older person means harder fiscal arithmetic.</p></div>
          <div className="chart-card"><LineChart label="Workers per older person line chart" series={scenarioChartSeries(a, b, (point) => point.support, state)} height={270} formatY={(value) => value.toFixed(1)} tooltipY={(value) => value.toFixed(2)} /></div>
        </article>
      </section>

      <EconomySection state={state} a={a} b={b} selectedA={selectedA} selectedB={selectedB} onModeChange={setMode} />

      <section className="insights-section">
        <div className="section-heading"><div><span className="section-kicker">COUNTERFACTUALS</span><h2>What would it take to hold the line?</h2></div><p>Useful policy questions are often easier to understand as “how much would have to change?”</p></div>
        <div className="insight-grid">
          <article className="insight insight-a"><span>Scenario A</span><strong>{signed(flatMigrationA, 1)} / 1,000</strong><p>net migration per 1,000 each year to end 2126 at the starting population, holding fertility constant.</p></article>
          <article className="insight insight-b"><span>Scenario B</span><strong>{signed(flatMigrationB, 1)} / 1,000</strong><p>net migration per 1,000 each year to end 2126 at the starting population, holding fertility constant.</p></article>
          <article className="insight neutral"><span>Why migration feels faster</span><strong>It arrives adult.</strong><p>The prototype distributes most net migrants into young-adult ages, so migration changes the workforce immediately; newborns do not enter it for roughly two decades.</p></article>
        </div>
      </section>

      <section className="methods">
        <details>
          <summary>Model, data and caveats</summary>
          <div className="methods-grid">
            <div><h3>Demographic engine</h3><p>A one-year cohort-component projection ages 101 cohorts forward annually. Births use an age-specific fertility curve scaled to the chosen TFR; survival is calibrated to the life-expectancy assumption; net migration uses a young-adult-heavy age profile. This is a simplified accounting framework for exploration.</p><p><strong>Replacement fertility is not universally 2.1.</strong> It varies with mortality and sex ratios. The 2.1 marker is an intuitive low-mortality-country benchmark.</p></div>
            <div><h3>Economic engine</h3><p>Each country starts from the market-US$ and PPP baselines shown in the assumptions. Those totals are editable in trillions and are independent of the starting population. Projections apply changes in effective workers and the explicit output-per-worker growth assumption.</p><p>Workers use a generic age-specific participation schedule. Retirement age shifts older-worker participation. Market GDP holds relative prices and exchange rates constant; it is not a forecast of future nominal exchange-rate GDP.</p></div>
            <div><h3>Preset data</h3><p>The country library includes 22 country presets plus a synthetic 10m model. International presets use UN World Population Prospects 2024-derived 2026 indicators, with broad age shares calibrated from youth and old-age dependency ratios. Australia and Japan retain more detailed starting profiles.</p><p>Most profiles are generated from broad age shares rather than a full UN single-year-age dataset. Presets are starting points, not official national forecasts. Fertility can move linearly toward a user-set 2100 TFR; migration remains a constant rate.</p></div>
          </div>
          <div className="sources">{sources.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{label}</a>)}</div>
        </details>
      </section>

      <footer><span>Demographic Futures · interactive scenario playground</span><button type="button" onClick={shareState}>Copy shareable scenario link</button></footer>
      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </main>
  );
}
