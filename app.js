(() => {
  'use strict';

  const START_YEAR = 2026;
  const END_YEAR = 2126;
  const YEARS = END_YEAR - START_YEAR;
  const FEMALE_BIRTH_SHARE = 0.488;
  const A_COLOR = '#3157d5';
  const B_COLOR = '#d45f39';
  const GRID_COLOR = '#ded9cf';
  const TEXT_COLOR = '#77736a';

  // Detailed five-year age profiles retained for the original prototype presets.
  // The broader country library uses a generated profile constrained to UN-WPP-derived
  // youth/old-age dependency shares, median age and life expectancy (see syntheticProfile()).
  const profiles = {
    model10m: [5.8,6.1,6.3,6.5,6.5,6.8,7.0,6.8,6.4,6.2,6.3,6.2,6.2,5.4,4.6,3.2,2.2,1.4,0.8,0.4,0.1],
    australia: [5.5,6.0,6.2,6.1,6.6,7.4,7.5,7.2,6.7,6.0,6.3,5.6,5.6,5.0,4.3,3.6,2.3,1.3,0.5,0.1,0],
    japan: [3.0,3.6,4.2,4.5,5.0,4.8,4.8,5.2,5.8,7.0,7.8,7.0,7.8,5.9,6.4,5.8,4.6,4.0,2.2,0.5,0.1]
  };

  function makeCountry({label, flag, group, population, tfr, netMigration=0, migrationRate=null, life, medianAge=35, youthDep=30, oldDep=20, productivity=1.0, profile=null, gdpNominal=1, gdpPPP=1, gdpYear=2025}) {
    return {
      label, flag, group, population, tfr, netMigration, life, medianAge, youthDep, oldDep, productivity, profile,
      gdpNominal: gdpNominal * 1e12,
      gdpPPP: gdpPPP * 1e12,
      gdpYear,
      migration: migrationRate == null ? (netMigration / population * 1000) : migrationRate
    };
  }

  // 2026 starting indicators. International presets are based on UN World Population
  // Prospects 2024-derived 2026 indicators; Australia/Japan retain the official-data
  // overrides used in the first prototype. Rates are starting assumptions, not forecasts.
  const countries = {
    model10m: makeCountry({ label:'10m model population', flag:'◇', group:'Model', population:10_000_000, tfr:1.80, migrationRate:0, life:82.0, medianAge:38, youthDep:30, oldDep:24, profile:'model10m', gdpNominal:1.0, gdpPPP:1.0 }),

    australia: makeCountry({ label:'Australia', flag:'🇦🇺', group:'Asia-Pacific', population:27_921_150, tfr:1.481, migrationRate:10.46, life:83.0, medianAge:38.3, profile:'australia', gdpNominal:1.7985, gdpPPP:1.9864 }),
    japan: makeCountry({ label:'Japan', flag:'🇯🇵', group:'Asia-Pacific', population:122_650_000, tfr:1.15, migrationRate:2.75, life:84.1, medianAge:49.8, profile:'japan', gdpNominal:4.44, gdpPPP:6.8372 }),
    china: makeCountry({ label:'China', flag:'🇨🇳', group:'Asia-Pacific', population:1_410_000_000, tfr:1.03, netMigration:-232_107, life:79.0, medianAge:40.6, youthDep:23, oldDep:21, gdpNominal:19.4980, gdpPPP:41.2598 }),
    india: makeCountry({ label:'India', flag:'🇮🇳', group:'Asia-Pacific', population:1_470_000_000, tfr:1.93, netMigration:-440_456, life:72.7, medianAge:29.2, youthDep:36, oldDep:10, gdpNominal:3.96, gdpPPP:17.1974 }),
    southKorea: makeCountry({ label:'South Korea', flag:'🇰🇷', group:'Asia-Pacific', population:51_600_000, tfr:0.76, netMigration:62_644, life:84.6, medianAge:46.2, youthDep:15, oldDep:27, gdpNominal:1.8724, gdpPPP:3.2626 }),
    indonesia: makeCountry({ label:'Indonesia', flag:'🇮🇩', group:'Asia-Pacific', population:287_000_000, tfr:2.08, netMigration:-39_472, life:71.6, medianAge:30.7, youthDep:36, oldDep:11, gdpNominal:1.45, gdpPPP:5.0458 }),
    singapore: makeCountry({ label:'Singapore', flag:'🇸🇬', group:'Asia-Pacific', population:5_900_000, tfr:0.97, netMigration:13_379, life:84.1, medianAge:36.8, youthDep:16, oldDep:18, gdpNominal:0.6039, gdpPPP:0.9983 }),
    pakistan: makeCountry({ label:'Pakistan', flag:'🇵🇰', group:'Asia-Pacific', population:257_000_000, tfr:3.44, netMigration:-1_144_738, life:68.1, medianAge:20.8, youthDep:62, oldDep:7, gdpNominal:0.4073, gdpPPP:1.6777 }),

    germany: makeCountry({ label:'Germany', flag:'🇩🇪', group:'Europe', population:83_700_000, tfr:1.46, netMigration:158_442, life:81.9, medianAge:45.7, youthDep:22, oldDep:37, gdpNominal:5.0509, gdpPPP:6.2958 }),
    unitedKingdom: makeCountry({ label:'United Kingdom', flag:'🇬🇧', group:'Europe', population:69_700_000, tfr:1.53, netMigration:364_099, life:81.7, medianAge:40.2, youthDep:27, oldDep:31, gdpNominal:4.00, gdpPPP:4.4893 }),
    france: makeCountry({ label:'France', flag:'🇫🇷', group:'Europe', population:66_700_000, tfr:1.64, netMigration:88_533, life:83.7, medianAge:42.5, youthDep:27, oldDep:36, gdpNominal:3.37, gdpPPP:4.3964 }),
    italy: makeCountry({ label:'Italy', flag:'🇮🇹', group:'Europe', population:59_000_000, tfr:1.22, netMigration:58_272, life:84.2, medianAge:48.6, youthDep:19, oldDep:39, gdpNominal:2.55, gdpPPP:3.7001 }),
    spain: makeCountry({ label:'Spain', flag:'🇪🇸', group:'Europe', population:47_900_000, tfr:1.24, netMigration:85_305, life:84.1, medianAge:46.3, youthDep:20, oldDep:32, gdpNominal:1.91, gdpPPP:2.9548 }),
    poland: makeCountry({ label:'Poland', flag:'🇵🇱', group:'Europe', population:37_900_000, tfr:1.31, netMigration:-7_971, life:79.2, medianAge:43.0, youthDep:23, oldDep:31, gdpNominal:1.0355, gdpPPP:1.9771 }),

    unitedStates: makeCountry({ label:'United States', flag:'🇺🇸', group:'Americas', population:348_000_000, tfr:1.62, netMigration:1_177_848, life:79.8, medianAge:38.7, youthDep:27, oldDep:28, gdpNominal:30.7697, gdpPPP:30.7697 }),
    canada: makeCountry({ label:'Canada', flag:'🇨🇦', group:'Americas', population:40_300_000, tfr:1.33, netMigration:291_403, life:83.1, medianAge:40.8, youthDep:23, oldDep:30, gdpNominal:2.3199, gdpPPP:2.7801 }),
    brazil: makeCountry({ label:'Brazil', flag:'🇧🇷', group:'Americas', population:213_000_000, tfr:1.59, netMigration:-205_642, life:76.4, medianAge:35.2, youthDep:28, oldDep:16, gdpNominal:2.2799, gdpPPP:4.9869 }),
    mexico: makeCountry({ label:'Mexico', flag:'🇲🇽', group:'Americas', population:132_000_000, tfr:1.85, netMigration:-109_844, life:75.6, medianAge:30.0, youthDep:36, oldDep:12, gdpNominal:1.83, gdpPPP:3.4133 }),

    israel: makeCountry({ label:'Israel', flag:'🇮🇱', group:'Middle East & Africa', population:9_600_000, tfr:2.73, netMigration:13_023, life:82.9, medianAge:29.3, youthDep:46, oldDep:21, gdpNominal:0.6108, gdpPPP:0.6045 }),
    saudiArabia: makeCountry({ label:'Saudi Arabia', flag:'🇸🇦', group:'Middle East & Africa', population:34_900_000, tfr:2.27, netMigration:108_660, life:79.4, medianAge:29.7, youthDep:33, oldDep:4, gdpNominal:1.2769, gdpPPP:2.7280 }),
    nigeria: makeCountry({ label:'Nigeria', flag:'🇳🇬', group:'Middle East & Africa', population:240_000_000, tfr:4.20, netMigration:-2_810, life:55.0, medianAge:18.3, youthDep:73, oldDep:5, gdpNominal:0.2908, gdpPPP:2.2640 }),
    niger: makeCountry({ label:'Niger', flag:'🇳🇪', group:'Middle East & Africa', population:28_400_000, tfr:5.64, netMigration:-10_620, life:61.9, medianAge:15.7, youthDep:92, oldDep:5, gdpNominal:0.02165, gdpPPP:0.06078 })
  };

  const state = {
    a: { country:'model10m', population:10_000_000, title:'Higher fertility', tfr:1.8, tfr2100:1.8, migration:0, life:82, productivity:1.0, retirement:65 },
    b: { country:'model10m', population:10_000_000, title:'Lower fertility', tfr:1.4, tfr2100:1.4, migration:0, life:82, productivity:1.0, retirement:65 },
    year:2126,
    economyMode:'ppp'
  };

  const $ = id => document.getElementById(id);
  const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
  const fmt0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

  function scenarioFromCountry(key, title=null, overrides={}) {
    const c = countries[key];
    const result = {
      country:key,
      population:c.population,
      title:title || c.label,
      tfr:c.tfr,
      tfr2100:c.tfr,
      migration:c.migration,
      life:c.life,
      productivity:c.productivity,
      retirement:65,
      ...overrides
    };
    if (Object.prototype.hasOwnProperty.call(overrides,'tfr') && !Object.prototype.hasOwnProperty.call(overrides,'tfr2100')) result.tfr2100 = overrides.tfr;
    return result;
  }

  const presets = {
    fourTenths: {
      a: scenarioFromCountry('model10m','TFR 1.8',{tfr:1.8,migration:0}),
      b: scenarioFromCountry('model10m','TFR 1.4',{tfr:1.4,migration:0})
    },
    ausJapan: {
      a: scenarioFromCountry('australia','Australia today'),
      b: scenarioFromCountry('japan','Japan today')
    },
    chinaIndia: {
      a: scenarioFromCountry('china','China today'),
      b: scenarioFromCountry('india','India today')
    },
    koreaNiger: {
      a: scenarioFromCountry('southKorea','South Korea · ultra-low fertility'),
      b: scenarioFromCountry('niger','Niger · high fertility')
    },
    japanIsrael: {
      a: scenarioFromCountry('japan','Japan today'),
      b: scenarioFromCountry('israel','Israel today')
    },
    ausMigration: {
      a: scenarioFromCountry('australia','Australia · recent migration'),
      b: scenarioFromCountry('australia','Australia · zero migration',{migration:0})
    },
    japanReplacement: {
      a: scenarioFromCountry('japan','Japan · replacement fertility',{tfr:2.10}),
      b: scenarioFromCountry('japan','Japan · current fertility')
    },
    migrationTest: {
      a: scenarioFromCountry('model10m','TFR 1.5 · migration +8',{tfr:1.50,migration:8}),
      b: scenarioFromCountry('model10m','TFR 1.5 · zero migration',{tfr:1.50,migration:0})
    }
  };

  const countryGroupOrder = ['Model','Asia-Pacific','Europe','Americas','Middle East & Africa'];

  function populateCountrySelects() {
    ['a','b'].forEach(side => {
      const select = $(`country-${side}`);
      select.innerHTML = '';
      countryGroupOrder.forEach(group => {
        const entries = Object.entries(countries).filter(([,c]) => c.group === group);
        if (!entries.length) return;
        const optgroup = document.createElement('optgroup');
        optgroup.label = group;
        entries.forEach(([key,c]) => {
          const option = document.createElement('option');
          option.value = key;
          option.textContent = `${c.flag} ${c.label}`;
          optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
      });
    });
  }

  function normal(x, mean, sd) { return Math.exp(-0.5 * ((x - mean) / sd) ** 2); }

  const fertilityWeights = (() => {
    const vals = [];
    for (let age = 15; age <= 49; age++) vals.push(normal(age, 31.5, 5.0));
    const total = vals.reduce((a,b) => a+b, 0);
    return vals.map(v => v / total);
  })();

  const migrationWeights = (() => {
    const vals = [];
    for (let age = 0; age <= 100; age++) {
      vals.push(
        0.16 * normal(age, 8, 6) +
        0.56 * normal(age, 27, 6.5) +
        0.23 * normal(age, 38, 7) +
        0.05 * normal(age, 55, 9)
      );
    }
    const total = vals.reduce((a,b) => a+b, 0);
    return vals.map(v => v / total);
  })();

  const profileCache = new Map();
  function clamp(min, max, value) { return Math.max(min, Math.min(max, value)); }

  function scaleWeights(weights, total) {
    const sum = weights.reduce((a,b)=>a+b,0) || 1;
    return weights.map(v => v / sum * total);
  }

  function syntheticProfile(c) {
    const cacheKey = c.label;
    if (profileCache.has(cacheKey)) return profileCache.get(cacheKey);

    // Dependency ratios are dependants per 100 people aged 15–64. Converting them
    // back into shares lets the generated profile match the published broad structure.
    const denominator = 100 + c.youthDep + c.oldDep;
    const youthShare = 100 * c.youthDep / denominator;
    const workingShare = 100 * 100 / denominator;
    const oldShare = 100 * c.oldDep / denominator;

    // Younger countries get a wider pyramid base; ultra-low-fertility countries
    // get a visibly narrower 0–4 cohort than their 10–14 cohort.
    const youthTrend = clamp(0.72, 1.30, 0.82 + 0.10 * c.tfr);
    const youth = scaleWeights([youthTrend ** 2, youthTrend, 1], youthShare);

    const workingPeak = clamp(24, 52, c.medianAge + 3);
    const workingRaw = Array.from({length:10}, (_,i) => {
      const center = 17.5 + i * 5;
      return 0.30 + normal(center, workingPeak, 14);
    });
    const working = scaleWeights(workingRaw, workingShare);

    const oldTau = clamp(7, 19, 7 + (c.life - 65) * 0.55);
    const oldRaw = Array.from({length:8}, (_,i) => {
      const center = i === 7 ? 102 : 67.5 + i * 5;
      return Math.exp(-(center - 67.5) / oldTau);
    });
    const old = scaleWeights(oldRaw, oldShare);

    const profile = [...youth, ...working, ...old];
    profileCache.set(cacheKey, profile);
    return profile;
  }

  function initialPopulation(scenario) {
    const c = countries[scenario.country] || countries.model10m;
    const p5 = c.profile ? profiles[c.profile] : syntheticProfile(c);
    const totalShare = p5.reduce((a,b) => a+b, 0);
    const ages = new Array(101).fill(0);
    p5.forEach((share, i) => {
      const low = i === 20 ? 100 : i * 5;
      const high = i === 20 ? 100 : Math.min(100, low + 4);
      const each = Number(scenario.population) * (share / totalShare) / (high - low + 1);
      for (let a = low; a <= high; a++) ages[a] = each;
    });
    return ages;
  }

  function baseHazard(age) {
    if (age === 0) return 0.003;
    return 0.00012 + 0.000018 * Math.exp(0.098 * age);
  }

  function lifeExpectancyForScale(scale) {
    let survivors = 1;
    let e0 = 0;
    for (let age = 0; age <= 120; age++) {
      e0 += survivors;
      const q = 1 - Math.exp(-scale * baseHazard(age));
      survivors *= (1 - q);
    }
    return e0;
  }

  function survivalForLifeExpectancy(target) {
    let lo = 0.05, hi = 30;
    for (let i = 0; i < 55; i++) {
      const mid = (lo + hi) / 2;
      if (lifeExpectancyForScale(mid) > target) lo = mid; else hi = mid;
    }
    const scale = (lo + hi) / 2;
    return Array.from({length:101}, (_, age) => Math.exp(-scale * baseHazard(age)));
  }

  function participation(age, retirementAge=65) {
    const r = clamp(60, 75, Number(retirementAge) || 65);
    if (age < 16) return 0;
    if (age < 20) return 0.35;
    if (age < 25) return 0.67;
    if (age < 55) return 0.82;
    if (age < Math.max(55, r - 5)) return 0.72;
    if (age < r) return 0.55;
    if (age < r + 5) return 0.25;
    if (age < r + 10) return 0.08;
    return 0.015;
  }

  function summarize(ages, retirementAge=65) {
    const pop = ages.reduce((a,b) => a+b, 0);
    const under15 = ages.slice(0,15).reduce((a,b)=>a+b,0);
    const working = ages.slice(20,65).reduce((a,b)=>a+b,0);
    const older = ages.slice(65).reduce((a,b)=>a+b,0);
    const effectiveWorkers = ages.reduce((sum, n, age) => sum + n * participation(age, retirementAge), 0);
    return { pop, under15, working, older, effectiveWorkers };
  }

  function fertilityAtYear(s, yearIndex) {
    const start = Number(s.tfr);
    const target = Number(s.tfr2100 ?? s.tfr);
    const targetIndex = 2100 - START_YEAR;
    if (yearIndex >= targetIndex) return target;
    return start + (target - start) * (yearIndex / targetIndex);
  }

  function economicBaselines(s) {
    const c = countries[s.country] || countries.model10m;
    const popScale = Number(s.population) / c.population;
    return {
      nominal: c.gdpNominal * popScale,
      ppp: c.gdpPPP * popScale
    };
  }

  function runScenario(s, overrideMigration = null) {
    let ages = initialPopulation(s);
    const survival = survivalForLifeExpectancy(Number(s.life));
    const timeline = [];
    const retirementAge = Number(s.retirement ?? 65);
    const initial = summarize(ages, retirementAge);
    const baselines = economicBaselines(s);
    const migrationRate = overrideMigration == null ? Number(s.migration) : overrideMigration;

    for (let y = 0; y <= YEARS; y++) {
      const summary = summarize(ages, retirementAge);
      const tfr = fertilityAtYear(s, y);
      let births = 0;
      for (let age = 15; age <= 49; age++) {
        births += ages[age] * FEMALE_BIRTH_SHARE * tfr * fertilityWeights[age - 15];
      }
      let deaths = 0;
      for (let age = 0; age <= 100; age++) deaths += ages[age] * (1 - survival[age]);
      const prod = (1 + Number(s.productivity) / 100) ** y;
      const gdpIndex = 100 * (summary.effectiveWorkers / initial.effectiveWorkers) * prod;
      const gdppcIndex = gdpIndex / (summary.pop / initial.pop);
      const gdpNominal = baselines.nominal * gdpIndex / 100;
      const gdpPPP = baselines.ppp * gdpIndex / 100;
      timeline.push({
        year: START_YEAR + y,
        ages: ages.slice(),
        births, deaths, tfr,
        ...summary,
        support: summary.older > 0 ? summary.effectiveWorkers / summary.older : 0,
        gdpIndex, gdppcIndex,
        gdpNominal, gdpPPP,
        gdppcNominal: gdpNominal / summary.pop,
        gdppcPPP: gdpPPP / summary.pop
      });
      if (y === YEARS) break;

      const next = new Array(101).fill(0);
      next[0] = births * survival[0];
      for (let age = 1; age < 100; age++) next[age] = ages[age - 1] * survival[age - 1];
      next[100] = ages[99] * survival[99] + ages[100] * survival[100];

      const netMigrants = summary.pop * migrationRate / 1000;
      if (netMigrants >= 0) {
        for (let age = 0; age <= 100; age++) next[age] += netMigrants * migrationWeights[age];
      } else {
        const removeTotal = -netMigrants;
        for (let age = 0; age <= 100; age++) {
          next[age] = Math.max(0, next[age] - removeTotal * migrationWeights[age]);
        }
      }
      ages = next;
    }
    return timeline;
  }

  function requiredMigrationForFlatPopulation(s) {
    const startPop = Number(s.population);
    let lo = -60, hi = 80;
    let fLo = runScenario(s, lo)[YEARS].pop - startPop;
    let fHi = runScenario(s, hi)[YEARS].pop - startPop;
    if (fLo > 0) return lo;
    if (fHi < 0) return hi;
    for (let i=0; i<28; i++) {
      const mid = (lo+hi)/2;
      const f = runScenario(s, mid)[YEARS].pop - startPop;
      if (f > 0) hi = mid; else lo = mid;
    }
    return (lo+hi)/2;
  }

  function compactNumber(n) {
    const abs = Math.abs(n);
    if (abs >= 1e9) return `${(n/1e9).toFixed(abs>=10e9?1:2).replace(/\.0$/,'')}b`;
    if (abs >= 1e6) return `${(n/1e6).toFixed(abs>=10e6?1:2).replace(/\.0$/,'')}m`;
    if (abs >= 1e3) return `${(n/1e3).toFixed(abs>=100e3?0:1).replace(/\.0$/,'')}k`;
    return fmt0.format(n);
  }

  function pct(n, digits=1) { return `${(n*100).toFixed(digits)}%`; }
  function signedPct(n) { return `${n>=0?'+':''}${(n*100).toFixed(1)}%`; }
  function signed(n, digits=1) { return `${n>=0?'+':''}${Number(n).toFixed(digits)}`; }
  function trillions(n) { return `$${(n/1e12).toFixed(n>=10e12?1:2).replace(/\.0$/,'')}T`; }
  function dollarsPerPerson(n) {
    if (Math.abs(n) >= 1000) return `$${(n/1000).toFixed(Math.abs(n)>=100000?0:1).replace(/\.0$/,'')}k`;
    return `$${fmt0.format(n)}`;
  }

  function syncControls(side) {
    const s = state[side];
    $(`country-${side}`).value = s.country;
    $(`title-${side}`).textContent = s.title;
    $(`tfr-${side}`).value = s.tfr;
    $(`tfr-out-${side}`).textContent = Number(s.tfr).toFixed(2);
    $(`migration-${side}`).value = s.migration;
    $(`migration-out-${side}`).textContent = signed(s.migration,1);
    $(`population-input-${side}`).value = (Number(s.population)/1e6).toFixed(2).replace(/\.00$/,'');
    $(`life-${side}`).value = s.life;
    $(`productivity-${side}`).value = s.productivity;
    $(`tfr2100-${side}`).value = Number(s.tfr2100 ?? s.tfr).toFixed(2);
    $(`retirement-${side}`).value = Number(s.retirement ?? 65);
    const base = economicBaselines(s);
    const synthetic = s.country === 'model10m' ? ' · synthetic' : '';
    $(`gdp-base-market-${side}`).textContent = `${trillions(base.nominal)}${synthetic}`;
    $(`gdp-base-ppp-${side}`).textContent = `${trillions(base.ppp)}${synthetic}`;
    const firstYearMigration = Number(s.population) * Number(s.migration) / 1000;
    $(`migration-absolute-${side}`).textContent = `≈ ${firstYearMigration>=0?'+':''}${compactNumber(firstYearMigration)} people in year 1`;
  }

  function countryChanged(side) {
    const key = $(`country-${side}`).value;
    const c = countries[key] || countries.model10m;
    state[side] = {
      ...state[side], country:key, population:c.population, title:c.label, tfr:c.tfr, tfr2100:c.tfr, migration:c.migration, life:c.life, productivity:c.productivity, retirement:65
    };
    clearPresetActive();
    syncControls(side);
    render();
  }

  function wireControls() {
    ['a','b'].forEach(side => {
      $(`country-${side}`).addEventListener('change', () => countryChanged(side));
      $(`tfr-${side}`).addEventListener('input', e => {
        state[side].tfr = Number(e.target.value); state[side].tfr2100 = state[side].tfr; state[side].title = `${countries[state[side].country].label} · TFR ${state[side].tfr.toFixed(2)}`;
        clearPresetActive(); syncControls(side); render();
      });
      $(`migration-${side}`).addEventListener('input', e => {
        state[side].migration = Number(e.target.value); state[side].title = `${countries[state[side].country].label} · custom`;
        clearPresetActive(); syncControls(side); render();
      });
      $(`population-input-${side}`).addEventListener('change', e => {
        state[side].population = Math.max(100_000, Math.min(2_000_000_000, (Number(e.target.value)||10) * 1e6)); state[side].title = `${countries[state[side].country].label} · custom`; clearPresetActive(); syncControls(side); render();
      });
      $(`life-${side}`).addEventListener('change', e => {
        state[side].life = Math.max(45, Math.min(92, Number(e.target.value)||82)); clearPresetActive(); syncControls(side); render();
      });
      $(`productivity-${side}`).addEventListener('change', e => {
        state[side].productivity = Math.max(-1, Math.min(4, Number(e.target.value)||0)); clearPresetActive(); syncControls(side); render();
      });
      $(`tfr2100-${side}`).addEventListener('change', e => {
        state[side].tfr2100 = Math.max(0.6, Math.min(6.5, Number(e.target.value)||state[side].tfr)); clearPresetActive(); syncControls(side); render();
      });
      $(`retirement-${side}`).addEventListener('change', e => {
        state[side].retirement = Math.max(60, Math.min(75, Number(e.target.value)||65)); clearPresetActive(); syncControls(side); render();
      });
    });

    $('year-slider').addEventListener('input', e => { state.year = Number(e.target.value); render(false); });
    $('swap').addEventListener('click', () => { const t = state.a; state.a = state.b; state.b = t; clearPresetActive(); syncControls('a'); syncControls('b'); render(); });
    $('copy-a-b').addEventListener('click', () => { state.b = {...state.a, title:`Copy of ${state.a.title}`}; clearPresetActive(); syncControls('b'); render(); });
    $('copy-b-a').addEventListener('click', () => { state.a = {...state.b, title:`Copy of ${state.b.title}`}; clearPresetActive(); syncControls('a'); render(); });

    document.querySelectorAll('.preset').forEach(btn => btn.addEventListener('click', () => applyPreset(btn.dataset.preset, btn)));
    document.querySelectorAll('[data-econ-mode]').forEach(btn => btn.addEventListener('click', () => {
      state.economyMode = btn.dataset.econMode;
      render(false);
      updateHash();
    }));
    $('share').addEventListener('click', shareState);
  }

  function applyPreset(name, button=null) {
    const p = presets[name];
    state.a = {...p.a}; state.b = {...p.b}; state.year = END_YEAR;
    $('year-slider').value = state.year;
    document.querySelectorAll('.preset').forEach(b=>b.classList.toggle('active', b === button || b.dataset.preset === name));
    syncControls('a'); syncControls('b'); render();
  }

  function clearPresetActive() { document.querySelectorAll('.preset').forEach(b => b.classList.remove('active')); }

  function ageBuckets(ages) {
    const buckets = [];
    for (let low=0; low<100; low+=5) {
      let total=0; for(let a=low;a<=Math.min(99,low+4);a++) total+=ages[a];
      buckets.push({ label:`${low}–${low+4}`, total });
    }
    buckets.push({label:'100+', total:ages[100]});
    return buckets;
  }

  function renderPyramid(aPoint, bPoint) {
    const a = ageBuckets(aPoint.ages), b = ageBuckets(bPoint.ages);
    const aPop = aPoint.pop, bPop = bPoint.pop;
    const shares = [...a.map(x=>x.total/aPop), ...b.map(x=>x.total/bPop)];
    const max = Math.max(...shares, 0.01);
    const root = $('age-pyramid'); root.innerHTML = '';
    for (let i=a.length-1; i>=0; i--) {
      const row = document.createElement('div'); row.className = `pyramid-row ${i>=13?'older':''}`;
      const left = document.createElement('div'); left.className='pyramid-side left';
      const lb = document.createElement('div'); lb.className='pyramid-bar'; lb.style.width=`${(a[i].total/aPop)/max*100}%`; lb.title=`${state.a.title}: ${a[i].label} · ${pct(a[i].total/aPop)}`; left.appendChild(lb);
      const age = document.createElement('div'); age.className='pyramid-age'; age.textContent=a[i].label;
      const right = document.createElement('div'); right.className='pyramid-side right';
      const rb = document.createElement('div'); rb.className='pyramid-bar'; rb.style.width=`${(b[i].total/bPop)/max*100}%`; rb.title=`${state.b.title}: ${b[i].label} · ${pct(b[i].total/bPop)}`; right.appendChild(rb);
      row.append(left, age, right); root.appendChild(row);
    }
  }

  function renderAgeSummary(side, point) {
    const el = $(`age-summary-${side}`);
    const child = point.under15/point.pop;
    const work = point.working/point.pop;
    const old = point.older/point.pop;
    el.innerHTML = `
      <div class="age-pill"><strong>${pct(child)}</strong><span>under 15</span></div>
      <div class="age-pill"><strong>${pct(work)}</strong><span>age 20–64</span></div>
      <div class="age-pill"><strong>${pct(old)}</strong><span>age 65+</span></div>`;
  }

  function makeLineChart(rootId, series, opts={}) {
    const root = $(rootId); root.innerHTML = '';
    root.parentElement.querySelectorAll(':scope > .chart-tooltip').forEach(el => el.remove());
    const W=900, H=320, m={t:24,r:24,b:42,l:62};
    const all = series.flatMap(s=>s.data.map(d=>d.value)).filter(Number.isFinite);
    let min = opts.min ?? Math.min(...all);
    let max = opts.max ?? Math.max(...all);
    if (opts.zeroFloor) min = Math.min(0,min);
    if (max === min) { max += 1; min -= 1; }
    const pad = (max-min)*0.08; max += pad; min -= pad*0.35;
    const x = year => m.l + (year-START_YEAR)/(END_YEAR-START_YEAR)*(W-m.l-m.r);
    const y = val => m.t + (max-val)/(max-min)*(H-m.t-m.b);
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
    svg.setAttribute('aria-hidden','true');

    const yTicks=5;
    for(let i=0;i<yTicks;i++){
      const v=min+(max-min)*i/(yTicks-1); const yy=y(v);
      const line=document.createElementNS(svg.namespaceURI,'line'); line.setAttribute('x1',m.l);line.setAttribute('x2',W-m.r);line.setAttribute('y1',yy);line.setAttribute('y2',yy);line.setAttribute('stroke',GRID_COLOR);line.setAttribute('stroke-width','1');svg.appendChild(line);
      const text=document.createElementNS(svg.namespaceURI,'text'); text.setAttribute('x',m.l-10);text.setAttribute('y',yy+4);text.setAttribute('text-anchor','end');text.setAttribute('font-size','11');text.setAttribute('fill',TEXT_COLOR);text.textContent=opts.formatY?opts.formatY(v):fmt.format(v);svg.appendChild(text);
    }
    [2026,2050,2075,2100,2126].forEach(yr=>{
      const text=document.createElementNS(svg.namespaceURI,'text');text.setAttribute('x',x(yr));text.setAttribute('y',H-14);text.setAttribute('text-anchor','middle');text.setAttribute('font-size','11');text.setAttribute('fill',TEXT_COLOR);text.textContent=yr;svg.appendChild(text);
    });

    series.forEach(s=>{
      const path=document.createElementNS(svg.namespaceURI,'path');
      const d=s.data.map((p,i)=>`${i?'L':'M'} ${x(p.year).toFixed(2)} ${y(p.value).toFixed(2)}`).join(' ');
      path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke',s.color);path.setAttribute('stroke-width','3');path.setAttribute('stroke-linejoin','round');path.setAttribute('stroke-linecap','round');svg.appendChild(path);
    });

    const hover=document.createElementNS(svg.namespaceURI,'line');hover.setAttribute('y1',m.t);hover.setAttribute('y2',H-m.b);hover.setAttribute('stroke','#8c877e');hover.setAttribute('stroke-dasharray','3 4');hover.style.display='none';svg.appendChild(hover);
    const dots=series.map(s=>{ const c=document.createElementNS(svg.namespaceURI,'circle');c.setAttribute('r','4');c.setAttribute('fill',s.color);c.setAttribute('stroke','#fff');c.setAttribute('stroke-width','2');c.style.display='none';svg.appendChild(c);return c; });
    root.appendChild(svg);

    const tooltip=document.createElement('div'); tooltip.className='chart-tooltip'; tooltip.style.display='none'; root.parentElement.style.position='relative'; root.parentElement.appendChild(tooltip);
    svg.addEventListener('mousemove',e=>{
      const rect=svg.getBoundingClientRect(); const px=(e.clientX-rect.left)/rect.width*W;
      const yr=Math.max(START_YEAR,Math.min(END_YEAR,Math.round(START_YEAR+(px-m.l)/(W-m.l-m.r)*(END_YEAR-START_YEAR))));
      const idx=yr-START_YEAR; const xx=x(yr); hover.setAttribute('x1',xx);hover.setAttribute('x2',xx);hover.style.display='';
      const rows=[];
      series.forEach((s,i)=>{ const p=s.data[idx]; dots[i].setAttribute('cx',xx);dots[i].setAttribute('cy',y(p.value));dots[i].style.display='';rows.push(`<span style="color:${s.color}">●</span> ${s.name}: <b>${opts.tooltipY?opts.tooltipY(p.value):fmt.format(p.value)}</b>`); });
      tooltip.innerHTML=`<b>${yr}</b><br>${rows.join('<br>')}`; tooltip.style.display='block'; tooltip.style.left=`${(xx/W)*100}%`; tooltip.style.top=`${(Math.min(...series.map((s)=>y(s.data[idx].value)))/H)*100}%`;
    });
    svg.addEventListener('mouseleave',()=>{hover.style.display='none';dots.forEach(d=>d.style.display='none');tooltip.style.display='none';});
  }

  function chartSeries(a,b, accessor) {
    return [
      {name:state.a.title,color:A_COLOR,data:a.map(p=>({year:p.year,value:accessor(p)}))},
      {name:state.b.title,color:B_COLOR,data:b.map(p=>({year:p.year,value:accessor(p)}))}
    ];
  }

  function economyValue(point, mode, perCapita=false) {
    if (mode === 'market') return perCapita ? point.gdppcNominal : point.gdpNominal;
    if (mode === 'index') return perCapita ? point.gdppcIndex : point.gdpIndex;
    return perCapita ? point.gdppcPPP : point.gdpPPP;
  }

  function economyFormat(mode, perCapita=false) {
    if (mode === 'index') return v => v.toFixed(0);
    if (perCapita) return v => dollarsPerPerson(v);
    return v => trillions(v);
  }

  function crossoverSummary(mode) {
    const accessor = p => economyValue(p, mode, false);
    let prev = accessor(cachedA[0]) - accessor(cachedB[0]);
    if (Math.abs(prev) < 1e-9) {
      for (let i=1;i<cachedA.length;i++) {
        const diff = accessor(cachedA[i]) - accessor(cachedB[i]);
        if (Math.abs(diff) > 1e-9) return `${diff>0?'A':'B'} leads from ${cachedA[i].year}`;
      }
      return 'Equal throughout';
    }
    for (let i=1;i<cachedA.length;i++) {
      const diff = accessor(cachedA[i]) - accessor(cachedB[i]);
      if ((prev < 0 && diff >= 0) || (prev > 0 && diff <= 0)) {
        return `${diff>=0?'A':'B'} overtakes in ${cachedA[i].year}`;
      }
      prev = diff;
    }
    return 'No crossover by 2126';
  }

  function renderEconomy(selectedA, selectedB) {
    const mode = state.economyMode || 'ppp';
    document.querySelectorAll('[data-econ-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.econMode === mode));

    let label, note, totalTitle, totalUnit, pcTitle, pcUnit;
    if (mode === 'market') {
      label='Market USD';
      note='2025 market-US$ starting values; future lines hold relative price/exchange-rate relationships constant and apply workforce × output-per-worker growth.';
      totalTitle='GDP · market USD anchor'; totalUnit='2025 US$ equivalent';
      pcTitle='GDP per person · market USD'; pcUnit='2025 US$ equivalent';
    } else if (mode === 'index') {
      label='Index';
      note='Each economy starts at 100. Best for isolating the demographic trajectory from differences in starting economic size.';
      totalTitle='GDP capacity index'; totalUnit='2026 = 100';
      pcTitle='GDP per capita index'; pcUnit='2026 = 100';
    } else {
      label='PPP';
      note='2025 purchasing-power-parity starting values; the best default here for long-run real-volume comparisons because it avoids forecasting exchange rates.';
      totalTitle='GDP · PPP anchor'; totalUnit='2025 international-$ equivalent';
      pcTitle='GDP per person · PPP'; pcUnit='2025 international-$ equivalent';
    }
    $('economy-mode-label').textContent=label;
    $('economy-mode-note').textContent=note;
    $('gdp-chart-title').textContent=totalTitle; $('gdp-chart-unit').textContent=totalUnit;
    $('gdppc-chart-title').textContent=pcTitle; $('gdppc-chart-unit').textContent=pcUnit;

    const totalAccessor = p => mode==='index' ? economyValue(p,mode,false) : economyValue(p,mode,false)/1e12;
    const pcAccessor = p => economyValue(p,mode,true);
    const totalFormat = mode==='index' ? (v=>v.toFixed(0)) : (v=>`$${v.toFixed(v>=10?1:2).replace(/\.0$/,'')}T`);
    const pcFormat = mode==='index' ? (v=>v.toFixed(0)) : dollarsPerPerson;
    makeLineChart('gdp-chart',chartSeries(cachedA,cachedB,totalAccessor),{formatY:totalFormat,tooltipY:totalFormat});
    makeLineChart('gdppc-chart',chartSeries(cachedA,cachedB,pcAccessor),{formatY:pcFormat,tooltipY:pcFormat});

    const startA=economyValue(cachedA[0],mode,false), startB=economyValue(cachedB[0],mode,false);
    const selectedValA=economyValue(selectedA,mode,false), selectedValB=economyValue(selectedB,mode,false);
    const startFmt=economyFormat(mode,false);
    $('econ-start-a').textContent=startFmt(startA); $('econ-start-b').textContent=startFmt(startB);
    $('econ-selected-a').textContent=startFmt(selectedValA); $('econ-selected-b').textContent=startFmt(selectedValB);
    $('econ-selected-year-a').textContent=state.year; $('econ-selected-year-b').textContent=state.year;
    $('econ-crossover').textContent=crossoverSummary(mode);
  }

  let cachedA=null, cachedB=null, lastSignature='';
  function scenarioSignature() { return JSON.stringify({a:state.a,b:state.b}); }

  function render(recompute=true) {
    const sig=scenarioSignature();
    const needsFull = recompute || sig!==lastSignature || !cachedA;
    if (needsFull) {
      cachedA=runScenario(state.a); cachedB=runScenario(state.b); lastSignature=sig;
    }
    const idx=state.year-START_YEAR; const a=cachedA[idx], b=cachedB[idx];

    $('selected-year-label').textContent=state.year; $('age-year').textContent=state.year;
    $('outcome-name-a').textContent=state.a.title; $('outcome-name-b').textContent=state.b.title;
    $('legend-a').textContent=state.a.title; $('legend-b').textContent=state.b.title;
    $('pyramid-name-a').textContent=state.a.title; $('pyramid-name-b').textContent=state.b.title;

    [['a',a,cachedA[0]],['b',b,cachedB[0]]].forEach(([side,p,start])=>{
      $(`population-${side}`).textContent=compactNumber(p.pop);
      $(`change-${side}`).textContent=signedPct(p.pop/start.pop-1);
      $(`births-${side}`).textContent=compactNumber(p.births);
      $(`older-${side}`).textContent=pct(p.older/p.pop);
      $(`support-${side}`).textContent=p.support.toFixed(2);
    });
    const delta=a.pop-b.pop; $('delta-pop').textContent=`${delta>=0?'+':''}${compactNumber(delta)}`;
    $('delta-caption').textContent=delta>=0?'more people in A':'fewer people in A';

    renderPyramid(a,b); renderAgeSummary('a',a);renderAgeSummary('b',b);

    if (needsFull) {
      makeLineChart('population-chart',chartSeries(cachedA,cachedB,p=>p.pop/1e6),{formatY:v=>`${v.toFixed(v>=100?0:1)}m`,tooltipY:v=>`${v.toFixed(2)}m`});
      makeLineChart('births-chart',chartSeries(cachedA,cachedB,p=>p.births/1000),{formatY:v=>`${v.toFixed(0)}k`,tooltipY:v=>`${v.toFixed(1)}k`});
      makeLineChart('support-chart',chartSeries(cachedA,cachedB,p=>p.support),{formatY:v=>v.toFixed(1),tooltipY:v=>v.toFixed(2)});
      const flatA=requiredMigrationForFlatPopulation(state.a), flatB=requiredMigrationForFlatPopulation(state.b);
      $('flat-migration-a').textContent=`${signed(flatA,1)} / 1,000`;
      $('flat-migration-b').textContent=`${signed(flatB,1)} / 1,000`;
      updateHash();
    }
    renderEconomy(a,b);
  }

  function updateHash() {
    const simple={a:state.a,b:state.b,year:state.year,economyMode:state.economyMode};
    history.replaceState(null,'',`#${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(simple)))) )}`);
  }

  function loadHash() {
    if (!location.hash || location.hash.length < 5) return false;
    try {
      const raw=decodeURIComponent(location.hash.slice(1));
      const decoded=decodeURIComponent(escape(atob(raw)));
      const parsed=JSON.parse(decoded);
      if(parsed.a&&parsed.b){
        state.a={...state.a,...parsed.a}; state.b={...state.b,...parsed.b};
        if(!countries[state.a.country]) state.a=scenarioFromCountry('model10m','Scenario A');
        if(!countries[state.b.country]) state.b=scenarioFromCountry('model10m','Scenario B');
        state.a.tfr2100 = Number(state.a.tfr2100 ?? state.a.tfr); state.b.tfr2100 = Number(state.b.tfr2100 ?? state.b.tfr);
        state.a.retirement = Number(state.a.retirement ?? 65); state.b.retirement = Number(state.b.retirement ?? 65);
        state.year=Math.max(START_YEAR,Math.min(END_YEAR,Number(parsed.year)||END_YEAR));
        if (['ppp','market','index'].includes(parsed.economyMode)) state.economyMode=parsed.economyMode;
        return true;
      }
    } catch(_) {}
    return false;
  }

  async function shareState() {
    updateHash();
    try { await navigator.clipboard.writeText(location.href); showToast('Scenario link copied'); }
    catch(_) { showToast('Share link is in the address bar'); }
  }
  function showToast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800);}

  populateCountrySelects();
  const loaded=loadHash();
  wireControls();
  syncControls('a');syncControls('b');
  $('year-slider').value=state.year;
  if(loaded) clearPresetActive();
  render();
})();
