2.1 Website Model Inputs, Defaults & Formulas
[WEBSITE MODEL TEAM WORKSPACE]
Note: the 2.1.1 and 2.1.2 headings below are assumed (the original text only supplied 2.2). Rename to match the master spec.

2.1.1 Visitor Inputs, Hidden Defaults & Data Sources
Visitor Inputs (3): `stage` (funding stage), `engineers` (headcount), `salary` (average salary, USD). Every other model input is a hidden default, editable in the Advanced panel.
Defaults Source: all defaults live in `defaults.json` (value, source, confidence per input). `build-config.js` generates `config.js` from it, and `calc.js` reads only that config object. A test fails if `config.js` is stale.
Funding Stage Scope: funding stage changes headcount growth only. Every other default is identical across stages because the dataset gives no basis for varying them.
Headcount Growth Data: median YoY employee growth from the company database (99 rows, EngFlow excluded). D+ merges Series D, Series F and Late Stage ("Late Stage"/"Late stage" normalized). Seed has no rows and borrows Series A.
Low-Confidence Tagging: every placeholder, judgment constant, and low or no-confidence default carries an "illustrative" tag in the Advanced panel.
AI Multiplier Caveat: the AI multipliers come from studies of pull request volume per engineer, not CI runs. No study measuring CI build volume per developer was found, so the link to runs is inferred.
Dropped Inputs: build system age and codebase size are not used on the website. On the website, room-to-improve is the fixed constant 1.0.

Table of Defaults

| Input (config name) | Default | Source | Confidence | Flag |
|---|---|---|---|---|
| Headcount growth, Seed (`headcount_growth_pct`) | 28 %/yr | Dataset (borrows Series A, n=0) | Low | Low confidence |
| Headcount growth, Series A | 28 %/yr (P25-P75: -6.5 to 88.5, n=11) | Dataset | Low | Low confidence |
| Headcount growth, Series B | 30 %/yr (3 to 73, n=13) | Dataset | Low-moderate | Low confidence |
| Headcount growth, Series C | 14.5 %/yr (-1.75 to 30.5, n=12) | Dataset | Low-moderate | Low confidence |
| Headcount growth, D+ | 16.5 %/yr (2.75 to 30.25, n=24) | Dataset | Moderate | |
| Headcount growth, Public | 11 %/yr (4 to 16.5, n=39) | Dataset | Good | |
| Build minutes (`build_minutes`) | 2.7 min (P25 0.63, P75 8.1) | Benchmark: CircleCI 2025 State of Software Delivery median workflow duration 2m43s (https://circleci.com/landing-pages/assets/2025-state-of-software-delivery-report.pdf); quartiles corroborated by https://thenewstack.io/?p=22780982 via search extraction | Moderate | Median; mean appears higher (about 11 min, column label unconfirmed); large monorepos often longer |
| Runs per engineer per day (`runs_per_engineer_per_day`) | 4 | **PLACEHOLDER**: illustrative, unsourced, replace with EngFlow telemetry | None | **PLACEHOLDER** |
| CI compute spend (`ci_compute_spend`) | $30 / engineer / month (range $15 to $75) | Benchmark: Semaphore vendor estimate of about $1,500 to $2,500/month for a 50-person team (https://semaphore.io/blog/enterprise-ci-cd-free); $15 and $75 from https://cicdcalculator.com/; cross-check https://infratally.com/articles/github-actions-vs-circleci-vs-codepipeline-cost-2026/ | Low | Low confidence; vendor and blog estimates |
| Room-to-improve (`room_to_improve`) | 1.0 | Judgment constant (neutral) | None | Judgment constant |
| Waiting factor (`waiting_factor`) | 0.30 | EngFlow model spec | Spec | |
| Working days per year (`working_days_per_year`) | 230 | EngFlow model spec | Spec | |
| Hours per year (`hours_per_year`) | 1,840 (230 days x 8 hours) | EngFlow model spec | Spec | |
| Loading factor (`loading_factor`) | 1.0 | Judgment constant (salary only, understates true cost) | None | Judgment constant |
| Savings rate, conservative (`scenario_savings_rate`) | 0.27 | **PLACEHOLDER**: Pinterest time to land code -27% (via Mozilla's blog, 2019: https://blog.mozilla.org/nfroyd/2019/11/01/evaluating-bazel-for-building-firefox-part-2/) | None-low | **PLACEHOLDER** |
| Savings rate, expected | 0.50 | **PLACEHOLDER**: Plaid CI build times -50% (EngFlow-published case study: https://www.engflow.com/caseStudies/plaid) | None-low | **PLACEHOLDER** |
| Savings rate, optimistic | 0.83 | **PLACEHOLDER**: Dataform CI build 30 to 5 min (via Mozilla's blog, 2019, same URL as above) | None-low | **PLACEHOLDER** |
| AI multiplier, none (`ai_multiplier`) | 1.0 | Definition (baseline) | n/a | |
| AI multiplier, assisted | 1.24 | Benchmark proxy: Microsoft study via TechRepublic, about +24% merged PRs per engineer per day (range +14.5% to +33.7%); https://www.techrepublic.com/article/news-ai-coding-agents-microsoft-pull-requests/ (verified via search extraction; site blocks automated fetch) | Low | Low confidence; measures PR volume, not CI runs |
| AI multiplier, heavy-agentic | 2.0 | **PLACEHOLDER**: Jellyfish (+113% PRs per engineer, https://jellyfish.co/blog/2025-ai-metrics-in-review/) and Faros AI (+98% merged PRs, https://www.faros.ai/blog/ai-software-engineering), vendor data | None-low | **PLACEHOLDER**; measures PR volume, not CI runs |
| AI use default (`selections.ai_use`) | none | Approved default | n/a | Selectable in Advanced |
| Scenario default (`selections.scenario`) | expected | Approved default | n/a | Selectable in Advanced |

Savings rates are industry benchmarks and vendor case studies, not EngFlow customer results.

2.1.2 Calculation Formulas & 4-Year Projection
Hourly Cost: `hourly = salary x loading_factor / hours_per_year`
Daily Runs: `dailyRuns = engineers x runsPerEngineerPerDay x aiMultiplier`
Annual Lost Hours: `waitingHours = dailyRuns x (buildMinutes / 60) x waitingFactor x workingDays`
Annual Waiting Cost: `waitingCost = waitingHours x hourly`
Annual Compute Waste: `computeWaste = ciSpendPerEngineerMonth x engineers x 12 x aiMultiplier`
Annual Gross Cost: `total = waitingCost + computeWaste`
Recoverable Savings: `recoverable = total x scenarioSavingsRate x roomToImprove`
4-Year Projection: for year t = 1..4, `engineers(t) = engineers x (1 + growth/100)^(t - 1)`. Year 1 is today's headcount and growth first applies in year 2. Salary, build minutes, runs per engineer and CI spend are held flat, and years are summed with no discounting.
Headline Metric: gross 4-year loss = sum over t of `total(t)`. The three scenario totals (conservative, expected, optimistic) are the sums of `recoverable(t)` using each savings rate.
Worked Example (250 engineers, Series C at 14.5% growth, $150K salary, AI none, expected scenario):
- Year 1: hourly = $81.52; dailyRuns = 1,000; lost hours = 3,105; waiting cost = $253,125; compute = $90,000; total = $343,125; expected recoverable = $171,563.
- 4-year gross loss = $1,700,922. Recoverable: conservative $459,249, expected $850,461, optimistic $1,411,765.
Verification: `calc.test.js` holds two hand-calculated examples (one year with AI none, total $219,200; a 4-year projection with 10% growth and AI assisted, gross $1,261,460.93).

2.2 Website Model Frontend Interface & Interactive Lead Capture
[WEBSITE FRONTEND TEAM WORKSPACE]
Instructions: Detail the component design, visual charts, and lead capture workflows implemented on EngFlow's website.
Plaintext
+-----------------------------------------------------------------------------------+
|  ENGFLOW PUBLIC ROI & BUILD LATENCY CALCULATOR (WEBSITE INTERFACE)                |
+-----------------------------------------------------------------------------------+
|  Funding Stage: [ Series C ▼ ]   Headcount: [======|=====] 250   Salary: $150,000 |
+-----------------------------------------------------------------------------------+
|  PROJECTED 4-YEAR LOSS FROM SLOW BUILDS: $1,700,922                               |
|  [ Download Full Executive Report (PDF) ]     [ Schedule Technical Demo ]         |
+-----------------------------------------------------------------------------------+
|  RECOVERABLE SAVINGS (4 YR)   |  ANNUAL LOST HOURS    |  TOTAL FINANCIAL WASTE    |
|  $850,461 (expected)          |  3,105 hrs (year 1)   |  $343,125 (year 1)        |
|  Range: $459,249 to $1,411,765|                       |                           |
+-----------------------------------------------------------------------------------+

2.2.1 Component Layout, Real-Time Sliders & Debounce State Management
UI Controls: three visitor inputs: a dropdown for funding stage (Seed, Series A, Series B, Series C, D+, Public; D+ merges Series D, F and Late Stage), a headcount slider (5 to 2,000, step 5) paired with a number input kept in sync, and a salary number input (default $150,000). An Advanced panel exposes the hidden defaults.
Advanced Panel: editable build minutes, runs per engineer per day, CI compute spend, headcount growth, waiting factor, working days, hours per year, loading factor, room-to-improve, the three savings rates, plus AI use (none / assisted / heavy-agentic) and featured scenario (conservative / expected / optimistic) selectors. Placeholder and low-confidence fields carry an "illustrative" tag, and a reset button restores defaults.
Stage Behavior: funding stage only changes the headcount growth default. An override the visitor types into the growth field is kept when the stage changes.
Performance Optimization: 150ms debounce on the headcount slider, headcount number input and salary input prevents excessive DOM re-renders. Advanced selectors re-render immediately.
State Management: no framework. Inputs are read from the DOM on each render, `Calc.calculate(CONFIG, user, overrides)` returns the result, and only fields the visitor has edited are sent as overrides.

2.2.2 Visual Charts, Dynamic KPI Cards & PDF Lead Capture Modal
Chart Library: Chart.js 4.4.1 (loaded from CDN). A bar series shows the featured scenario's recoverable savings per year, with dashed lines for the conservative and optimistic scenarios. A table below lists engineers, waiting cost, CI compute and recoverable savings for each year.
Headline: projected 4-year loss from slow builds (gross, before any savings).
KPI Highlight Cards (3): (1) recoverable savings over 4 years for the featured scenario (expected by default), with the conservative-to-optimistic range beneath; (2) annual lost hours (year 1); (3) total financial waste (year 1: waiting cost plus CI compute).
Gated Lead Capture: both "Download Full Executive Report (PDF)" and "Schedule Technical Demo" open one modal. It captures name, work email and company, all required, with a basic email format check, before any report would be generated.
PLACEHOLDER: PDF generation is not implemented. Submitting the modal validates the fields and shows a placeholder message. Nothing is generated, stored or sent, and no demo-scheduling link is connected.
Footer Disclaimer: savings rates and defaults are industry benchmarks and illustrative estimates, not EngFlow customer results.

2.2.3 Web Page Screenshots & Mobile Responsiveness Mockups
Desktop View: [INSERT SCREENSHOT: PUBLIC WEBSITE CALCULATOR HERO SECTION]
Mobile View: [INSERT SCREENSHOT: RESPONSIVE MOBILE CALCULATOR LAYOUT]
Lead Capture Modal: [INSERT SCREENSHOT: PDF DOWNLOAD & DEMO REQUEST MODAL]
