# Demographic Futures — interactive prototype

A dependency-free static web prototype for comparing fertility, migration, ageing and economic-scale scenarios over 100 years.

## Run locally

The simplest option is to open `index.html` directly in a browser.

For a local server (recommended):

```bash
cd fertility-scenarios-prototype
python -m http.server 8080
```

Then open `http://localhost:8080`.

## What is implemented

- Persistent left/right Scenario A vs Scenario B comparison
- Compact sticky desktop control bar so fertility and migration remain editable while scrolling
- Collapsible advanced assumptions for population, long-run fertility, life expectancy, effective retirement age and output-per-worker growth
- 22 real-country presets plus a synthetic 10m model population
- Countries: Australia, Japan, China, India, South Korea, Indonesia, Singapore, Pakistan, Germany, United Kingdom, France, Italy, Spain, Poland, United States, Canada, Brazil, Mexico, Israel, Saudi Arabia, Nigeria and Niger
- Curated one-click contrasts including China vs India, South Korea vs Niger, Japan vs Israel and Australia with/without migration
- 100-year cohort-component demographic projection from 2026–2126
- Optional TFR path from the selected 2026 fertility rate to a user-set 2100 TFR, then held constant
- Interactive year scrubber
- Population, births, age structure and worker-support visualisations
- 2025 country GDP baselines in both market US dollars and purchasing-power-parity international dollars
- Economic view toggle: PPP (default), market-USD anchor, or normalized index
- Explicit A/B GDP crossover / overtake year when one occurs
- GDP-per-person projection alongside total GDP
- Counterfactual migration rate required to return to starting population after 100 years
- Shareable state via URL hash
- Responsive layout; no external JS/CSS dependencies

## Data/model notes

The demographic engine uses one-year age cohorts, an age-specific fertility curve, a mortality curve calibrated to life expectancy, and a young-adult-heavy migration profile. The expanded international country library uses 2026 indicators derived from **UN World Population Prospects 2024** for population, fertility, life expectancy and net migration. Starting age profiles are constrained to published youth and old-age dependency ratios. To keep the static prototype small, most countries use generated five-year age distributions that match those broad age shares rather than bundling the full UN single-age dataset. Australia and Japan retain the more detailed profiles from the original prototype.

The economic engine is deliberately transparent rather than a black-box macro forecast. Each real country starts from **World Bank WDI 2025 GDP** in both `GDP (current US$)` and `GDP, PPP (current international $)`. Future output is:

`starting GDP × change in effective workers × compound output-per-worker growth`

PPP is the default for long-run cross-country scale comparisons because it avoids having to forecast exchange rates. The market-USD view is anchored to 2025 exchange-rate valuations and then holds relative price/exchange-rate relationships constant; it should be read as a 2025-US$-equivalent scenario, not a forecast of future nominal exchange-rate GDP. The index view sets each economy to 100 at the start and isolates the trajectory from starting size.

Effective workers are estimated from an age-specific participation schedule. The user-set **effective retirement age** shifts participation at older ages. It is a scenario lever, not a country-specific statutory pension-age database. Output-per-worker growth is likewise a user assumption; the neutral default is 1% per year for all countries so demographic effects remain visible instead of being hidden inside modelled convergence assumptions.

UN WPP projections end at 2100. This explorer is not reproducing the UN medium variant. It starts from the selected profile and applies the user's assumptions through 2126. Fertility can be held constant or moved linearly to a selected 2100 TFR; migration is currently held at a constant rate per 1,000 people.

Country presets are starting points, not official national forecasts.

## Recommended production upgrades

1. Bundle/import the full UN WPP single-year-age-by-sex dataset for all countries instead of generated starting pyramids.
2. Add time-varying migration and mortality paths plus uncertainty bands.
3. Replace the generic participation schedule with country-specific age/sex labour-force participation from ILOSTAT, while retaining retirement/policy overrides.
4. Add an optional productivity-convergence model, clearly separated from the neutral demography-only baseline.
5. Add fixed-number vs rate-based migration modes and migrant age/skill composition.
6. Add fiscal modules for pensions, health and tax-base pressure.
7. Add saved named scenarios, export PNG/SVG/CSV and embeddable links.
