import { describe, expect, it } from 'vitest';
import {
  countries,
  createScenarioFromCountry,
  decodeAppState,
  defaultAppState,
  economicBaselines,
  encodeAppState,
  resetScenarioGdp,
  runScenario,
  type AppState,
} from './model';

describe('demographic and economic model', () => {
  it('keeps editable starting GDP independent from starting population', () => {
    const scenario = { ...defaultAppState.a, population: 20_000_000, gdpMarketTrillions: 2.5, gdpPppTrillions: 3.25 };
    expect(economicBaselines(scenario)).toEqual({ nominal: 2.5e12, ppp: 3.25e12 });
    const start = runScenario(scenario)[0];
    expect(start.gdpNominal).toBe(2.5e12);
    expect(start.gdpPPP).toBe(3.25e12);
    expect(start.pop).toBeCloseTo(20_000_000, 6);
  });

  it('resets both GDP measures to the selected country defaults', () => {
    const scenario = {
      ...createScenarioFromCountry('japan', 'Japan custom'),
      gdpMarketTrillions: 9,
      gdpPppTrillions: 10,
      population: 1_000_000,
    };
    const reset = resetScenarioGdp(scenario);
    expect(reset.gdpMarketTrillions).toBe(countries.japan.gdpMarketTrillions);
    expect(reset.gdpPppTrillions).toBe(countries.japan.gdpPppTrillions);
    expect(reset.population).toBe(scenario.population);
  });

  it('loads a country with its starting indicators and independent GDP defaults', () => {
    const japan = createScenarioFromCountry('japan');
    expect(japan.population).toBe(countries.japan.population);
    expect(japan.gdpMarketTrillions).toBe(4.44);
    expect(japan.gdpPppTrillions).toBe(6.8372);
  });

  it('preserves GDP inputs in share links and reads older links without GDP fields', () => {
    const custom: AppState = {
      ...defaultAppState,
      a: { ...defaultAppState.a, gdpMarketTrillions: 2.75, gdpPppTrillions: 3.5 },
    };
    const decoded = decodeAppState(encodeAppState(custom));
    expect(decoded?.a.gdpMarketTrillions).toBe(2.75);
    expect(decoded?.a.gdpPppTrillions).toBe(3.5);

    const oldPayload = btoa(unescape(encodeURIComponent(JSON.stringify({
      a: { country: 'australia', population: 55_842_300, tfr: 1.48 },
      b: { country: 'model10m', population: 10_000_000, tfr: 1.4 },
      year: 2080,
      economyMode: 'market',
    }))));
    const oldLinkState = decodeAppState(`#${oldPayload}`);
    expect(oldLinkState?.a.gdpMarketTrillions).toBeCloseTo(countries.australia.gdpMarketTrillions * 2);
    expect(oldLinkState?.year).toBe(2080);
    expect(oldLinkState?.activePreset).toBeNull();
  });

  it('produces one annual point for each year from 2026 through 2126', () => {
    const result = runScenario(defaultAppState.a);
    expect(result).toHaveLength(101);
    expect(result[0].year).toBe(2026);
    expect(result.at(-1)?.year).toBe(2126);
    expect(result.every((point) => point.pop > 0 && Number.isFinite(point.support))).toBe(true);
  });
});
