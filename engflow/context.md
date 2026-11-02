# EngFlow public calculator: model context

Visitor-entered inputs (3): funding stage, headcount, average salary.
Everything else is a hidden default, editable in an Advanced panel
(waiting factor, runs per engineer per day, cost per engineer).

Full-model inputs: funding stage, engineers, cost per engineer,
headcount growth, build minutes, runs per day, cloud spend,
build system age, codebase size, AI use (none / assisted / heavy-agentic),
scenario (conservative / expected / optimistic).

Formulas:
- Daily runs = engineers × runs per engineer per day × AI multiplier
- Annual waiting cost = daily runs × build hours × 0.30 waiting factor
  × 230 working days × hourly engineer cost
- Annual compute waste = monthly cloud spend × 12 × AI multiplier
- Recoverable savings = (waiting cost + compute waste)
  × scenario savings rate × room-to-improve factor

Notes:
- Savings rates are industry benchmarks, not EngFlow customer results.
- Website UI shows a 4-year projected loss, so growth compounds yearly.
- Build system age and codebase size are NOT in any formula above.
  In the full model I believe they feed room-to-improve; on the website
  that factor becomes one fixed constant.