# Sources and defaults

Generated from defaults.json (0.3-approved). Savings rates and defaults are industry benchmarks and illustrative estimates, not EngFlow customer results.

| Input | Value | Source | Confidence | Flag |
|---|---|---|---|---|
| headcount_growth_pct | {"Seed":28,"Series A":28,"Series B":30,"Series C":14.5,"D+":16.5,"Public":11} | dataset | Seed: low (borrows Series A, no rows); Series A: low; Series B: low-moderate; Series C: low-moderate; D+: moderate; Public: good | low confidence |
| build_minutes | 2.7 | benchmark | moderate |  |
| runs_per_engineer_per_day | 4 | PLACEHOLDER | none | PLACEHOLDER |
| ci_compute_spend | 30 | benchmark | low | low confidence |
| room_to_improve | 1 | judgment constant | none | judgment constant |
| waiting_factor | 0.3 | EngFlow model spec | spec |  |
| working_days_per_year | 230 | EngFlow model spec | spec |  |
| scenario_savings_rate | {"conservative":0.27,"expected":0.5,"optimistic":0.83} | PLACEHOLDER | none-low | PLACEHOLDER |
| ai_multiplier | {"none":1,"assisted":1.24,"heavy_agentic":2} | benchmark proxy (assisted); PLACEHOLDER (heavy_agentic) | none: n/a; assisted: low; heavy_agentic: none-low | PLACEHOLDER: heavy_agentic; low confidence: assisted |
| hours_per_year | 1840 | EngFlow model spec | spec |  |
| loading_factor | 1 | judgment constant | none | judgment constant |

## Detail and URLs

### headcount_growth_pct
Company Database CSV, YoY Growth (%) = employee headcount growth. Median per bucket.
- Deliverable 1 Database Deliverable 1 - Company Database.csv (local file, no URL)

### build_minutes
CircleCI 2025 State of Software Delivery: median workflow duration 2m43s (2.72 min, rounded to 2.7). P25 and P75 corroborated by The New Stack's coverage of the report, as returned by a search extraction: 25% of teams complete workflows in under 38 seconds (0.63 min) and 75% in 8 minutes or less (the report table lists 8m7s, 8.1 min). The New Stack page body could not be fetched directly (only navigation text came back), so these quartiles are verified via search extraction only. Covers about 15 million workflows from 22,000+ organizations on CircleCI, collected in September 2024.

Note: median; mean appears higher (about 11 min, column label unconfirmed); large monorepos often longer.
- https://circleci.com/landing-pages/assets/2025-state-of-software-delivery-report.pdf
- https://circleci.com/newsroom/circleci-publishes-2025-state-of-software-delivery-report
- https://thenewstack.io/?p=22780982
- https://thenewstack.io/the-roi-of-speed-how-fast-code-delivery-saves-millions/

### runs_per_engineer_per_day
Illustrative, not sourced. To be replaced with EngFlow telemetry. No published per-engineer benchmark found (CircleCI reports 1.64 runs per project per day, not per engineer).

### ci_compute_spend
Derived by dividing team-level monthly estimates by team size. low $15 = $300/month / 20 developers (cicdcalculator.com: 20 devs, 100-150 builds/day, 8 min, hosted CI $300-1,500/month). high $75 = $1,500/month / 20 developers (same page, top of its range). typical $30 = $1,500/month / 50 developers: Semaphore (a CI vendor, 'based on our experience') estimates a high-performance 50-person team with complex pipelines pays about $1,500/month on GitHub Actions or GitLab Premium and about $2,500/month on CircleCI ($30 to $50 per engineer). Cross-check: Infratally's model gives about $900/month for 50 developers ($18 per engineer). Hosted CI only. Vendor and blog estimates, not a survey.
- https://cicdcalculator.com/
- https://semaphore.io/blog/enterprise-ci-cd-free
- https://infratally.com/articles/github-actions-vs-circleci-vs-codepipeline-cost-2026/

### room_to_improve
Neutral; full model adjusts by build system age and codebase size, dropped for the website.

### waiting_factor
Fraction of build time engineers are blocked. From the model spec in context.md.

### working_days_per_year
From the model spec in context.md.

### scenario_savings_rate
No credible population benchmark found. Each rate is a single company data point: conservative 27% = Pinterest, 'time to land code' decreased by 27% after its iOS switch to Bazel (via Mozilla's blog, 2019); expected 50% = Plaid, 'cut CI build times by 50%' after moving 150+ Go services to Bazel and adding an EngFlow remote cache (EngFlow-published case study); optimistic 83% = Dataform, average CI build time 30 min to 5 min after switching to Bazel with remote caching (via Mozilla's blog, 2019; 30 to 5 is 83%). All vendor-published or anecdotal. Not EngFlow customer results.
- https://blog.mozilla.org/nfroyd/2019/11/01/evaluating-bazel-for-building-firefox-part-2/
- https://www.engflow.com/caseStudies/plaid
- https://blog.mozilla.org/nfroyd/2019/11/01/evaluating-bazel-for-building-firefox-part-2/

### ai_multiplier
none: definition (baseline) | assisted: benchmark proxy: Microsoft study, AI coding agents linked to about +24% merged PRs per engineer per day (range +14.5% to +33.7%), as reported by TechRepublic, 2025. Verified via search extraction; site blocks automated fetch. | heavy_agentic: PLACEHOLDER: anchored to Jellyfish (average PRs per engineer +113%, 1.36 to 2.9, when adoption went from 0% to 100%; 'adoption' not defined) and Faros AI (high-adoption teams 'merge 98% more pull requests'; 47% more PRs touched per day). Vendor data.
- https://www.techrepublic.com/article/news-ai-coding-agents-microsoft-pull-requests/
- https://jellyfish.co/blog/2025-ai-metrics-in-review/
- https://www.faros.ai/blog/ai-software-engineering

### hours_per_year
230 working days x 8 hours.

### loading_factor
Multiplier from salary to fully loaded cost. 1.0 = salary only (neutral, understates true cost). Illustrative.
