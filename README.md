# Demographic Futures

Demographic Futures is an interactive scenario playground for exploring how fertility, migration, longevity, retirement age, and productivity assumptions can shape population and economic capacity over 100 years. It is intended for curious readers, educators, and policy or research teams who want to compare assumptions and understand how their effects compound. It is an exploratory model, not an official forecast or policy recommendation.

![Full-page desktop screenshot of Demographic Futures with the scenario assumptions open](docs/dashboard-full.png)

## Try it locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To check the production build locally:

```bash
npm run build
npm run preview
```

## Deploy to Vercel

The app is a static Vite site. Import this repository into Vercel and deploy with:

- Build command: `npm run build`
- Output directory: `dist`

The included `vercel.json` sets these values for the project. The app has no server or environment-variable requirements; its scenario sharing uses the URL hash.

## Use the playground

- Choose a starting country or synthetic profile for Scenario A and B, or start from a quick comparison.
- Adjust fertility and annual net migration with the scenario controls. Open **More assumptions** to edit starting population, 2100 fertility, life expectancy, retirement age, output-per-worker growth, and each scenario’s market and PPP GDP baselines.
- GDP entries are totals in trillions of US dollars (market) and international dollars (PPP). They stay independent when population changes. Selecting a country loads that country’s GDP defaults; **Reset GDP defaults** restores both GDP figures for the selected country.
- Use the year slider to inspect outcomes at any point from 2026 to 2126. The economic view can compare PPP, market USD, or a normalized index.
- Swap or copy scenarios, then use **Copy shareable scenario link** to share the current assumptions, selected year, and economic view.

## What the model does

The demographic projection advances 101 one-year age cohorts annually. Births use an age-specific fertility curve scaled to the selected total fertility rate; survival is calibrated to the life-expectancy input; net migration is distributed using a young-adult-heavy age profile. Fertility can stay at its current value or move linearly to the selected 2100 value, after which it remains constant. Migration is held at a constant rate per 1,000 people.

The economic projection starts from each scenario’s market and PPP GDP totals and applies the change in estimated effective workers and the assumed annual output-per-worker growth. Effective workers use a generic participation schedule that shifts at the selected retirement age. The market-USD view holds relative exchange-rate and price relationships constant; it does not forecast future exchange rates. GDP per person is a model proxy, not a living-standards forecast.

The 22 country presets use indicators derived from UN World Population Prospects 2024 and World Bank WDI data, with source links in the app. Most starting age profiles are generated to match broad dependency ratios rather than using complete single-year age data. Australia and Japan use more detailed starting profiles. Country values are rounded inputs and presets are starting points, not official country forecasts. The synthetic 10m profile uses illustrative $1T market and PPP baselines.

## Checks and screenshot

```bash
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser checks cover the mobile layout and the full-page README screenshot. Regenerate that screenshot after UI changes with:

```bash
npm run build
npm run capture:screenshot
```

The screenshot is saved to `docs/dashboard-full.png`.
