export const START_YEAR = 2026;
export const END_YEAR = 2126;
export const YEARS = END_YEAR - START_YEAR;
export const FEMALE_BIRTH_SHARE = 0.488;

export type Side = 'a' | 'b';
export type EconomyMode = 'ppp' | 'market' | 'index';

export interface Country {
  label: string;
  flag: string;
  group: string;
  population: number;
  tfr: number;
  netMigration: number;
  migration: number;
  life: number;
  medianAge: number;
  youthDep: number;
  oldDep: number;
  productivity: number;
  profile?: string;
  gdpMarketTrillions: number;
  gdpPppTrillions: number;
  gdpYear: number;
}

export interface Scenario {
  country: string;
  population: number;
  title: string;
  tfr: number;
  tfr2100: number;
  migration: number;
  life: number;
  productivity: number;
  retirement: number;
  gdpMarketTrillions: number;
  gdpPppTrillions: number;
}

export interface AppState {
  a: Scenario;
  b: Scenario;
  year: number;
  economyMode: EconomyMode;
  activePreset: string | null;
}

export interface Summary {
  pop: number;
  under15: number;
  working: number;
  older: number;
  effectiveWorkers: number;
}

export interface ProjectionPoint extends Summary {
  year: number;
  ages: number[];
  births: number;
  deaths: number;
  tfr: number;
  support: number;
  gdpIndex: number;
  gdppcIndex: number;
  gdpNominal: number;
  gdpPPP: number;
  gdppcNominal: number;
  gdppcPPP: number;
}

export interface Preset {
  label: string;
  a: Scenario;
  b: Scenario;
}

type CountryInput = Omit<Country, 'migration' | 'gdpMarketTrillions' | 'gdpPppTrillions' | 'gdpYear' | 'medianAge' | 'youthDep' | 'oldDep' | 'productivity'> &
  Partial<Pick<Country, 'medianAge' | 'youthDep' | 'oldDep' | 'productivity'>> & {
  migrationRate?: number;
  gdpNominal: number;
  gdpPPP: number;
  gdpYear?: number;
};

function makeCountry(input: CountryInput): Country {
  const {
    gdpNominal,
    gdpPPP,
    gdpYear = 2025,
    migrationRate,
    medianAge = 35,
    youthDep = 30,
    oldDep = 20,
    productivity = 1,
    ...rest
  } = input;
  return {
    ...rest,
    medianAge,
    youthDep,
    oldDep,
    productivity,
    migration: migrationRate == null ? (rest.netMigration / rest.population * 1000) : migrationRate,
    gdpMarketTrillions: gdpNominal,
    gdpPppTrillions: gdpPPP,
    gdpYear,
  };
}

export const countries: Record<string, Country> = {
  model10m: makeCountry({ label: '10m model population', flag: '◇', group: 'Model', population: 10_000_000, tfr: 1.8, netMigration: 0, migrationRate: 0, life: 82, medianAge: 38, youthDep: 30, oldDep: 24, productivity: 1, profile: 'model10m', gdpNominal: 1, gdpPPP: 1 }),
  australia: makeCountry({ label: 'Australia', flag: '🇦🇺', group: 'Asia-Pacific', population: 27_921_150, tfr: 1.481, netMigration: 0, migrationRate: 10.46, life: 83, medianAge: 38.3, productivity: 1, profile: 'australia', gdpNominal: 1.7985, gdpPPP: 1.9864 }),
  japan: makeCountry({ label: 'Japan', flag: '🇯🇵', group: 'Asia-Pacific', population: 122_650_000, tfr: 1.15, netMigration: 0, migrationRate: 2.75, life: 84.1, medianAge: 49.8, productivity: 1, profile: 'japan', gdpNominal: 4.44, gdpPPP: 6.8372 }),
  china: makeCountry({ label: 'China', flag: '🇨🇳', group: 'Asia-Pacific', population: 1_410_000_000, tfr: 1.03, netMigration: -232_107, life: 79, medianAge: 40.6, youthDep: 23, oldDep: 21, productivity: 1, gdpNominal: 19.498, gdpPPP: 41.2598 }),
  india: makeCountry({ label: 'India', flag: '🇮🇳', group: 'Asia-Pacific', population: 1_470_000_000, tfr: 1.93, netMigration: -440_456, life: 72.7, medianAge: 29.2, youthDep: 36, oldDep: 10, productivity: 1, gdpNominal: 3.96, gdpPPP: 17.1974 }),
  southKorea: makeCountry({ label: 'South Korea', flag: '🇰🇷', group: 'Asia-Pacific', population: 51_600_000, tfr: 0.76, netMigration: 62_644, life: 84.6, medianAge: 46.2, youthDep: 15, oldDep: 27, productivity: 1, gdpNominal: 1.8724, gdpPPP: 3.2626 }),
  indonesia: makeCountry({ label: 'Indonesia', flag: '🇮🇩', group: 'Asia-Pacific', population: 287_000_000, tfr: 2.08, netMigration: -39_472, life: 71.6, medianAge: 30.7, youthDep: 36, oldDep: 11, productivity: 1, gdpNominal: 1.45, gdpPPP: 5.0458 }),
  singapore: makeCountry({ label: 'Singapore', flag: '🇸🇬', group: 'Asia-Pacific', population: 5_900_000, tfr: 0.97, netMigration: 13_379, life: 84.1, medianAge: 36.8, youthDep: 16, oldDep: 18, productivity: 1, gdpNominal: 0.6039, gdpPPP: 0.9983 }),
  pakistan: makeCountry({ label: 'Pakistan', flag: '🇵🇰', group: 'Asia-Pacific', population: 257_000_000, tfr: 3.44, netMigration: -1_144_738, life: 68.1, medianAge: 20.8, youthDep: 62, oldDep: 7, productivity: 1, gdpNominal: 0.4073, gdpPPP: 1.6777 }),
  germany: makeCountry({ label: 'Germany', flag: '🇩🇪', group: 'Europe', population: 83_700_000, tfr: 1.46, netMigration: 158_442, life: 81.9, medianAge: 45.7, youthDep: 22, oldDep: 37, productivity: 1, gdpNominal: 5.0509, gdpPPP: 6.2958 }),
  unitedKingdom: makeCountry({ label: 'United Kingdom', flag: '🇬🇧', group: 'Europe', population: 69_700_000, tfr: 1.53, netMigration: 364_099, life: 81.7, medianAge: 40.2, youthDep: 27, oldDep: 31, productivity: 1, gdpNominal: 4, gdpPPP: 4.4893 }),
  france: makeCountry({ label: 'France', flag: '🇫🇷', group: 'Europe', population: 66_700_000, tfr: 1.64, netMigration: 88_533, life: 83.7, medianAge: 42.5, youthDep: 27, oldDep: 36, productivity: 1, gdpNominal: 3.37, gdpPPP: 4.3964 }),
  italy: makeCountry({ label: 'Italy', flag: '🇮🇹', group: 'Europe', population: 59_000_000, tfr: 1.22, netMigration: 58_272, life: 84.2, medianAge: 48.6, youthDep: 19, oldDep: 39, productivity: 1, gdpNominal: 2.55, gdpPPP: 3.7001 }),
  spain: makeCountry({ label: 'Spain', flag: '🇪🇸', group: 'Europe', population: 47_900_000, tfr: 1.24, netMigration: 85_305, life: 84.1, medianAge: 46.3, youthDep: 20, oldDep: 32, productivity: 1, gdpNominal: 1.91, gdpPPP: 2.9548 }),
  poland: makeCountry({ label: 'Poland', flag: '🇵🇱', group: 'Europe', population: 37_900_000, tfr: 1.31, netMigration: -7_971, life: 79.2, medianAge: 43, youthDep: 23, oldDep: 31, productivity: 1, gdpNominal: 1.0355, gdpPPP: 1.9771 }),
  unitedStates: makeCountry({ label: 'United States', flag: '🇺🇸', group: 'Americas', population: 348_000_000, tfr: 1.62, netMigration: 1_177_848, life: 79.8, medianAge: 38.7, youthDep: 27, oldDep: 28, productivity: 1, gdpNominal: 30.7697, gdpPPP: 30.7697 }),
  canada: makeCountry({ label: 'Canada', flag: '🇨🇦', group: 'Americas', population: 40_300_000, tfr: 1.33, netMigration: 291_403, life: 83.1, medianAge: 40.8, youthDep: 23, oldDep: 30, productivity: 1, gdpNominal: 2.3199, gdpPPP: 2.7801 }),
  brazil: makeCountry({ label: 'Brazil', flag: '🇧🇷', group: 'Americas', population: 213_000_000, tfr: 1.59, netMigration: -205_642, life: 76.4, medianAge: 35.2, youthDep: 28, oldDep: 16, productivity: 1, gdpNominal: 2.2799, gdpPPP: 4.9869 }),
  mexico: makeCountry({ label: 'Mexico', flag: '🇲🇽', group: 'Americas', population: 132_000_000, tfr: 1.85, netMigration: -109_844, life: 75.6, medianAge: 30, youthDep: 36, oldDep: 12, productivity: 1, gdpNominal: 1.83, gdpPPP: 3.4133 }),
  israel: makeCountry({ label: 'Israel', flag: '🇮🇱', group: 'Middle East & Africa', population: 9_600_000, tfr: 2.73, netMigration: 13_023, life: 82.9, medianAge: 29.3, youthDep: 46, oldDep: 21, productivity: 1, gdpNominal: 0.6108, gdpPPP: 0.6045 }),
  saudiArabia: makeCountry({ label: 'Saudi Arabia', flag: '🇸🇦', group: 'Middle East & Africa', population: 34_900_000, tfr: 2.27, netMigration: 108_660, life: 79.4, medianAge: 29.7, youthDep: 33, oldDep: 4, productivity: 1, gdpNominal: 1.2769, gdpPPP: 2.728 }),
  nigeria: makeCountry({ label: 'Nigeria', flag: '🇳🇬', group: 'Middle East & Africa', population: 240_000_000, tfr: 4.2, netMigration: -2_810, life: 55, medianAge: 18.3, youthDep: 73, oldDep: 5, productivity: 1, gdpNominal: 0.2908, gdpPPP: 2.264 }),
  niger: makeCountry({ label: 'Niger', flag: '🇳🇪', group: 'Middle East & Africa', population: 28_400_000, tfr: 5.64, netMigration: -10_620, life: 61.9, medianAge: 15.7, youthDep: 92, oldDep: 5, productivity: 1, gdpNominal: 0.02165, gdpPPP: 0.06078 }),
};

export const countryGroupOrder = ['Model', 'Asia-Pacific', 'Europe', 'Americas', 'Middle East & Africa'];

const ageProfiles: Record<string, number[]> = {
  model10m: [5.8, 6.1, 6.3, 6.5, 6.5, 6.8, 7, 6.8, 6.4, 6.2, 6.3, 6.2, 6.2, 5.4, 4.6, 3.2, 2.2, 1.4, 0.8, 0.4, 0.1],
  australia: [5.5, 6, 6.2, 6.1, 6.6, 7.4, 7.5, 7.2, 6.7, 6, 6.3, 5.6, 5.6, 5, 4.3, 3.6, 2.3, 1.3, 0.5, 0.1, 0],
  japan: [3, 3.6, 4.2, 4.5, 5, 4.8, 4.8, 5.2, 5.8, 7, 7.8, 7, 7.8, 5.9, 6.4, 5.8, 4.6, 4, 2.2, 0.5, 0.1],
};

export function clamp(min: number, max: number, value: number): number {
  return Math.max(min, Math.min(max, value));
}

function normal(x: number, mean: number, sd: number): number {
  return Math.exp(-0.5 * ((x - mean) / sd) ** 2);
}

const fertilityWeights = (() => {
  const values = Array.from({ length: 35 }, (_, i) => normal(i + 15, 31.5, 5));
  const total = values.reduce((sum, value) => sum + value, 0);
  return values.map((value) => value / total);
})();

const migrationWeights = (() => {
  const values = Array.from({ length: 101 }, (_, age) => (
    0.16 * normal(age, 8, 6) +
    0.56 * normal(age, 27, 6.5) +
    0.23 * normal(age, 38, 7) +
    0.05 * normal(age, 55, 9)
  ));
  const total = values.reduce((sum, value) => sum + value, 0);
  return values.map((value) => value / total);
})();

const profileCache = new Map<string, number[]>();

function scaleWeights(weights: number[], total: number): number[] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  return weights.map((value) => value / sum * total);
}

function syntheticProfile(country: Country): number[] {
  if (profileCache.has(country.label)) return profileCache.get(country.label)!;
  const denominator = 100 + country.youthDep + country.oldDep;
  const youthShare = 100 * country.youthDep / denominator;
  const workingShare = 100 * 100 / denominator;
  const oldShare = 100 * country.oldDep / denominator;
  const youthTrend = clamp(0.72, 1.3, 0.82 + 0.1 * country.tfr);
  const youth = scaleWeights([youthTrend ** 2, youthTrend, 1], youthShare);
  const workingPeak = clamp(24, 52, country.medianAge + 3);
  const workingRaw = Array.from({ length: 10 }, (_, i) => {
    const center = 17.5 + i * 5;
    return 0.3 + normal(center, workingPeak, 14);
  });
  const working = scaleWeights(workingRaw, workingShare);
  const oldTau = clamp(7, 19, 7 + (country.life - 65) * 0.55);
  const oldRaw = Array.from({ length: 8 }, (_, i) => {
    const center = i === 7 ? 102 : 67.5 + i * 5;
    return Math.exp(-(center - 67.5) / oldTau);
  });
  const profile = [...youth, ...working, ...scaleWeights(oldRaw, oldShare)];
  profileCache.set(country.label, profile);
  return profile;
}

function initialPopulation(scenario: Scenario): number[] {
  const country = countries[scenario.country] ?? countries.model10m;
  const profile = country.profile ? ageProfiles[country.profile] : syntheticProfile(country);
  const total = profile.reduce((a, b) => a + b, 0);
  const ages = Array<number>(101).fill(0);
  profile.forEach((share, index) => {
    const low = index === 20 ? 100 : index * 5;
    const high = index === 20 ? 100 : Math.min(100, low + 4);
    const each = scenario.population * (share / total) / (high - low + 1);
    for (let age = low; age <= high; age += 1) ages[age] = each;
  });
  return ages;
}

function baseHazard(age: number): number {
  if (age === 0) return 0.003;
  return 0.00012 + 0.000018 * Math.exp(0.098 * age);
}

function lifeExpectancyForScale(scale: number): number {
  let survivors = 1;
  let expectancy = 0;
  for (let age = 0; age <= 120; age += 1) {
    expectancy += survivors;
    const deathProbability = 1 - Math.exp(-scale * baseHazard(age));
    survivors *= 1 - deathProbability;
  }
  return expectancy;
}

function survivalForLifeExpectancy(target: number): number[] {
  let low = 0.05;
  let high = 30;
  for (let i = 0; i < 55; i += 1) {
    const mid = (low + high) / 2;
    if (lifeExpectancyForScale(mid) > target) low = mid;
    else high = mid;
  }
  const scale = (low + high) / 2;
  return Array.from({ length: 101 }, (_, age) => Math.exp(-scale * baseHazard(age)));
}

function participation(age: number, retirementAge = 65): number {
  const parsedRetirementAge = Number(retirementAge);
  const retirement = Number.isFinite(parsedRetirementAge) ? parsedRetirementAge : 65;
  if (age < 16) return 0;
  if (age < 20) return 0.35;
  if (age < 25) return 0.67;
  if (age < 55) return 0.82;
  if (age < Math.max(55, retirement - 5)) return 0.72;
  if (age < retirement) return 0.55;
  if (age < retirement + 5) return 0.25;
  if (age < retirement + 10) return 0.08;
  return 0.015;
}

function summarize(ages: number[], retirementAge = 65): Summary {
  const pop = ages.reduce((a, b) => a + b, 0);
  const under15 = ages.slice(0, 15).reduce((a, b) => a + b, 0);
  const working = ages.slice(20, 65).reduce((a, b) => a + b, 0);
  const older = ages.slice(65).reduce((a, b) => a + b, 0);
  const effectiveWorkers = ages.reduce((sum, value, age) => sum + value * participation(age, retirementAge), 0);
  return { pop, under15, working, older, effectiveWorkers };
}

export function economicBaselines(scenario: Scenario): { nominal: number; ppp: number } {
  return {
    nominal: scenario.gdpMarketTrillions * 1e12,
    ppp: scenario.gdpPppTrillions * 1e12,
  };
}

export function createScenarioFromCountry(
  countryId: string,
  title?: string,
  overrides: Partial<Scenario> = {},
): Scenario {
  const country = countries[countryId] ?? countries.model10m;
  const scenario: Scenario = {
    country: countryId in countries ? countryId : 'model10m',
    population: country.population,
    title: title ?? country.label,
    tfr: country.tfr,
    tfr2100: country.tfr,
    migration: country.migration,
    life: country.life,
    productivity: country.productivity,
    retirement: 65,
    gdpMarketTrillions: country.gdpMarketTrillions,
    gdpPppTrillions: country.gdpPppTrillions,
    ...overrides,
  };
  if (Object.hasOwn(overrides, 'tfr') && !Object.hasOwn(overrides, 'tfr2100')) {
    scenario.tfr2100 = scenario.tfr;
  }
  return scenario;
}

export function resetScenarioToCountryDefaults(scenario: Scenario): Scenario {
  return createScenarioFromCountry(scenario.country);
}

export const presets: Record<string, Preset> = {
  fourTenths: {
    label: '1.8 vs 1.4',
    a: createScenarioFromCountry('model10m', 'TFR 1.8', { tfr: 1.8, migration: 0 }),
    b: createScenarioFromCountry('model10m', 'TFR 1.4', { tfr: 1.4, migration: 0 }),
  },
  ausJapan: {
    label: 'Australia vs Japan',
    a: createScenarioFromCountry('australia', 'Australia today'),
    b: createScenarioFromCountry('japan', 'Japan today'),
  },
  chinaIndia: {
    label: 'China vs India',
    a: createScenarioFromCountry('china', 'China today'),
    b: createScenarioFromCountry('india', 'India today'),
  },
  koreaNiger: {
    label: 'South Korea vs Niger',
    a: createScenarioFromCountry('southKorea', 'South Korea · ultra-low fertility'),
    b: createScenarioFromCountry('niger', 'Niger · high fertility'),
  },
  japanIsrael: {
    label: 'Japan vs Israel',
    a: createScenarioFromCountry('japan', 'Japan today'),
    b: createScenarioFromCountry('israel', 'Israel today'),
  },
  ausMigration: {
    label: 'Australia · migration on/off',
    a: createScenarioFromCountry('australia', 'Australia · recent migration'),
    b: createScenarioFromCountry('australia', 'Australia · zero migration', { migration: 0 }),
  },
  japanReplacement: {
    label: 'Japan · replacement fertility',
    a: createScenarioFromCountry('japan', 'Japan · replacement fertility', { tfr: 2.1 }),
    b: createScenarioFromCountry('japan', 'Japan · current fertility'),
  },
  migrationTest: {
    label: 'Migration comparison',
    a: createScenarioFromCountry('model10m', 'TFR 1.5 · migration +8', { tfr: 1.5, migration: 8 }),
    b: createScenarioFromCountry('model10m', 'TFR 1.5 · zero migration', { tfr: 1.5, migration: 0 }),
  },
};

export const defaultAppState: AppState = {
  a: createScenarioFromCountry('model10m', 'Higher fertility', { tfr: 1.8, migration: 0 }),
  b: createScenarioFromCountry('model10m', 'Lower fertility', { tfr: 1.4, migration: 0 }),
  year: END_YEAR,
  economyMode: 'ppp',
  activePreset: 'fourTenths',
};

export function applyPreset(state: AppState, presetId: string): AppState {
  const preset = presets[presetId];
  if (!preset) return state;
  return { ...state, a: { ...preset.a }, b: { ...preset.b }, year: END_YEAR, activePreset: presetId };
}

export function runScenario(scenario: Scenario, overrideMigration: number | null = null): ProjectionPoint[] {
  let ages = initialPopulation(scenario);
  const survival = survivalForLifeExpectancy(Number(scenario.life));
  const timeline: ProjectionPoint[] = [];
  const retirementAge = Number(scenario.retirement ?? 65);
  const initial = summarize(ages, retirementAge);
  const baselines = economicBaselines(scenario);
  const migrationRate = overrideMigration == null ? Number(scenario.migration) : overrideMigration;

  for (let yearIndex = 0; yearIndex <= YEARS; yearIndex += 1) {
    const summary = summarize(ages, retirementAge);
    const targetTfr = Number(scenario.tfr2100 ?? scenario.tfr);
    const targetIndex = 2100 - START_YEAR;
    const tfr = yearIndex >= targetIndex
      ? targetTfr
      : Number(scenario.tfr) + (targetTfr - Number(scenario.tfr)) * (yearIndex / targetIndex);
    let births = 0;
    for (let age = 15; age <= 49; age += 1) births += ages[age] * FEMALE_BIRTH_SHARE * tfr * fertilityWeights[age - 15];
    let deaths = 0;
    for (let age = 0; age <= 100; age += 1) deaths += ages[age] * (1 - survival[age]);
    const productivity = (1 + Number(scenario.productivity) / 100) ** yearIndex;
    const gdpIndex = 100 * (summary.effectiveWorkers / initial.effectiveWorkers) * productivity;
    const gdppcIndex = gdpIndex / (summary.pop / initial.pop);
    const gdpNominal = baselines.nominal * gdpIndex / 100;
    const gdpPPP = baselines.ppp * gdpIndex / 100;
    timeline.push({
      year: START_YEAR + yearIndex,
      ages: ages.slice(),
      births,
      deaths,
      tfr,
      ...summary,
      support: summary.older > 0 ? summary.effectiveWorkers / summary.older : 0,
      gdpIndex,
      gdppcIndex,
      gdpNominal,
      gdpPPP,
      gdppcNominal: gdpNominal / summary.pop,
      gdppcPPP: gdpPPP / summary.pop,
    });
    if (yearIndex === YEARS) break;

    const next = Array<number>(101).fill(0);
    next[0] = births * survival[0];
    for (let age = 1; age < 100; age += 1) next[age] = ages[age - 1] * survival[age - 1];
    next[100] = ages[99] * survival[99] + ages[100] * survival[100];
    const netMigrants = summary.pop * migrationRate / 1000;
    if (netMigrants >= 0) {
      for (let age = 0; age <= 100; age += 1) next[age] += netMigrants * migrationWeights[age];
    } else {
      const removeTotal = -netMigrants;
      for (let age = 0; age <= 100; age += 1) next[age] = Math.max(0, next[age] - removeTotal * migrationWeights[age]);
    }
    ages = next;
  }
  return timeline;
}

export function requiredMigrationForFlatPopulation(scenario: Scenario): number {
  const startPopulation = Number(scenario.population);
  let low = -60;
  let high = 80;
  const lowDifference = runScenario(scenario, low)[YEARS].pop - startPopulation;
  const highDifference = runScenario(scenario, high)[YEARS].pop - startPopulation;
  if (lowDifference > 0) return low;
  if (highDifference < 0) return high;
  for (let i = 0; i < 28; i += 1) {
    const middle = (low + high) / 2;
    const difference = runScenario(scenario, middle)[YEARS].pop - startPopulation;
    if (difference > 0) high = middle;
    else low = middle;
  }
  return (low + high) / 2;
}

export function compactNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(value / 1e9).toFixed(abs >= 10e9 ? 1 : 2).replace(/\.0$/, '')}b`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(abs >= 10e6 ? 1 : 2).replace(/\.0$/, '')}m`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(abs >= 100e3 ? 0 : 1).replace(/\.0$/, '')}k`;
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

export function pct(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function signed(value: number, digits = 1): string {
  return `${value >= 0 ? '+' : ''}${Number(value).toFixed(digits)}`;
}

export function signedPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
}

export function trillions(value: number): string {
  return `$${(value / 1e12).toFixed(value >= 10e12 ? 1 : 2).replace(/\.0$/, '')}T`;
}

export function dollarsPerPerson(value: number): string {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(Math.abs(value) >= 100_000 ? 0 : 1).replace(/\.0$/, '')}k`;
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)}`;
}

function validNumber(value: unknown, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function scenarioFromSharedState(raw: Partial<Scenario>, fallbackTitle: string): Scenario {
  const countryId = raw.country && countries[raw.country] ? raw.country : 'model10m';
  const country = countries[countryId];
  const defaults = createScenarioFromCountry(countryId, fallbackTitle);
  const parsedPopulation = validNumber(raw.population, defaults.population);
  const population = parsedPopulation > 0 ? parsedPopulation : defaults.population;
  // Existing share links did not store GDP values. Retain their former population-scaled baseline.
  const legacyScale = population / country.population;
  const marketGdp = validNumber(raw.gdpMarketTrillions, country.gdpMarketTrillions * legacyScale);
  const pppGdp = validNumber(raw.gdpPppTrillions, country.gdpPppTrillions * legacyScale);
  return {
    ...defaults,
    ...raw,
    country: countryId,
    population,
    title: typeof raw.title === 'string' ? raw.title : fallbackTitle,
    tfr: Math.max(0, validNumber(raw.tfr, defaults.tfr)),
    tfr2100: Math.max(0, validNumber(raw.tfr2100, validNumber(raw.tfr, defaults.tfr))),
    migration: validNumber(raw.migration, defaults.migration),
    life: Math.max(0.1, validNumber(raw.life, defaults.life)),
    productivity: Math.max(-100, validNumber(raw.productivity, defaults.productivity)),
    retirement: validNumber(raw.retirement, defaults.retirement),
    gdpMarketTrillions: Math.max(0, marketGdp),
    gdpPppTrillions: Math.max(0, pppGdp),
  };
}

export function encodeAppState(state: AppState): string {
  const payload = { a: state.a, b: state.b, year: state.year, economyMode: state.economyMode };
  return `#${encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))))}`;
}

export function decodeAppState(hash: string): AppState | null {
  if (!hash || hash.length < 5) return null;
  try {
    const base64 = decodeURIComponent(hash.replace(/^#/, ''));
    const json = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(json) as { a?: Partial<Scenario>; b?: Partial<Scenario>; year?: number; economyMode?: EconomyMode };
    if (!parsed.a || !parsed.b) return null;
    return {
      a: scenarioFromSharedState(parsed.a, 'Scenario A'),
      b: scenarioFromSharedState(parsed.b, 'Scenario B'),
      year: clamp(START_YEAR, END_YEAR, validNumber(parsed.year, END_YEAR)),
      economyMode: ['ppp', 'market', 'index'].includes(String(parsed.economyMode)) ? parsed.economyMode! : 'ppp',
      activePreset: null,
    };
  } catch {
    return null;
  }
}

export function initialAppState(hash: string): AppState {
  return decodeAppState(hash) ?? {
    ...defaultAppState,
    a: { ...defaultAppState.a },
    b: { ...defaultAppState.b },
  };
}
