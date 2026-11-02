// Pure formula functions for the EngFlow public calculator. No DOM access.
// Formulas follow context.md ("EngFlow model spec").

const Calc = {
  // hourly = salary x loading_factor / hours_per_year
  hourlyCost(salary, loadingFactor, hoursPerYear) {
    return (salary * loadingFactor) / hoursPerYear;
  },

  // Engineers in projection year t (t = 1..N). Year 1 is today's headcount.
  //   engineers(t) = engineers0 x (1 + growthPct/100)^(t - 1)
  engineersInYear(engineers0, growthPct, year) {
    return engineers0 * Math.pow(1 + growthPct / 100, year - 1);
  },

  // One year of gross cost for a given headcount.
  //   dailyRuns    = engineers x runsPerEngineerPerDay x aiMultiplier
  //   waitingCost  = dailyRuns x (buildMinutes / 60) x waitingFactor x workingDays x hourly
  //   computeWaste = ciSpendPerEngineerMonth x engineers x 12 x aiMultiplier
  annualCost(p) {
    const dailyRuns = p.engineers * p.runsPerEngineerPerDay * p.aiMultiplier;
    const buildHours = p.buildMinutes / 60;
    const waitingCost = dailyRuns * buildHours * p.waitingFactor * p.workingDays * p.hourly;
    const computeWaste = p.ciSpendPerEngineerMonth * p.engineers * 12 * p.aiMultiplier;
    // Engineer hours lost per year = dailyRuns x buildHours x waitingFactor x workingDays
    const waitingHours = dailyRuns * buildHours * p.waitingFactor * p.workingDays;
    return { dailyRuns, waitingHours, waitingCost, computeWaste, total: waitingCost + computeWaste };
  },

  // recoverable = (waitingCost + computeWaste) x scenarioSavingsRate x roomToImprove
  recoverable(total, savingsRate, roomToImprove) {
    return total * savingsRate * roomToImprove;
  },

  // 4-year projection (years = 4 by default).
  //   For t = 1..years:
  //     engineers(t) = engineers0 x (1 + g)^(t - 1)         (g = headcount growth / 100, compounds yearly)
  //     gross(t)     = annualCost(engineers(t))              (salary, build minutes etc. held flat)
  //     saved(t, s)  = gross(t) x rate(s) x roomToImprove    (s = conservative | expected | optimistic)
  //   Totals are the plain sum over t, with no discounting.
  project(p, years = 4) {
    const rows = [];
    const totals = { gross: 0, conservative: 0, expected: 0, optimistic: 0 };
    for (let t = 1; t <= years; t++) {
      const engineers = Calc.engineersInYear(p.engineers, p.growthPct, t);
      const cost = Calc.annualCost({ ...p, engineers });
      const row = { year: t, engineers, ...cost };
      for (const s of ['conservative', 'expected', 'optimistic']) {
        row[s] = Calc.recoverable(cost.total, p.savingsRates[s], p.roomToImprove);
        totals[s] += row[s];
      }
      totals.gross += cost.total;
      rows.push(row);
    }
    return { rows, totals };
  },

  // Flatten CONFIG (defaults.json) + visitor inputs + Advanced overrides into formula params.
  // user: { stage, engineers, salary }
  // overrides: optional { buildMinutes, runsPerEngineerPerDay, ciSpendPerEngineerMonth, waitingFactor,
  //   workingDays, hoursPerYear, loadingFactor, roomToImprove, growthPct, aiUse, scenario,
  //   savingsRates: {conservative, expected, optimistic} }
  resolveParams(config, user, overrides = {}) {
    const i = config.inputs;
    const pick = (key, dflt) => (overrides[key] !== undefined && overrides[key] !== null ? overrides[key] : dflt);
    const aiUse = pick('aiUse', config.selections.ai_use.default);
    const scenario = pick('scenario', config.selections.scenario.default);
    const loadingFactor = pick('loadingFactor', i.loading_factor.value);
    const hoursPerYear = pick('hoursPerYear', i.hours_per_year.value);
    return {
      engineers: user.engineers,
      salary: user.salary,
      stage: user.stage,
      growthPct: pick('growthPct', i.headcount_growth_pct.values[user.stage]),
      buildMinutes: pick('buildMinutes', i.build_minutes.value),
      runsPerEngineerPerDay: pick('runsPerEngineerPerDay', i.runs_per_engineer_per_day.value),
      ciSpendPerEngineerMonth: pick('ciSpendPerEngineerMonth', i.ci_compute_spend.value),
      waitingFactor: pick('waitingFactor', i.waiting_factor.value),
      workingDays: pick('workingDays', i.working_days_per_year.value),
      hoursPerYear,
      loadingFactor,
      hourly: Calc.hourlyCost(user.salary, loadingFactor, hoursPerYear),
      roomToImprove: pick('roomToImprove', i.room_to_improve.value),
      aiUse,
      aiMultiplier: i.ai_multiplier.values[aiUse],
      scenario,
      savingsRates: { ...i.scenario_savings_rate.values, ...(overrides.savingsRates || {}) },
    };
  },

  // Full calculation. `featured` is the scenario chosen in Advanced (default "expected").
  calculate(config, user, overrides = {}) {
    const params = Calc.resolveParams(config, user, overrides);
    const { rows, totals } = Calc.project(params, 4);
    return { params, rows, totals, featured: totals[params.scenario] };
  },
};

if (typeof module !== 'undefined') module.exports = Calc;
