// Run: node calc.test.js   (no dependencies)
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Calc = require('./calc.js');
const CONFIG = require('./config.js');

const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < 0.01, `${label}: expected ${expected}, got ${actual}`);

let n = 0;
const test = (name, fn) => { fn(); n++; console.log('ok -', name); };

// Example A (single year, hand-calculated)
// 100 engineers, salary $147,200, loading 1.0, 1840 h/yr  -> hourly = 147200 / 1840 = $80.00
// dailyRuns = 100 x 4 x 1.0 = 400
// waiting   = 400 x (4/60) x 0.30 x 230 x 80 = 26.667 x 0.30 = 8.0 h; x 230 = 1,840 h; x 80 = $147,200
// compute   = 60 x 100 x 12 x 1.0 = $72,000
// total     = $219,200
// recoverable: conservative 0.27 -> $59,184; expected 0.50 -> $109,600; optimistic 0.83 -> $181,936
test('Example A: one year, AI none', () => {
  const hourly = Calc.hourlyCost(147200, 1.0, 1840);
  close(hourly, 80, 'hourly');
  const c = Calc.annualCost({
    engineers: 100, runsPerEngineerPerDay: 4, aiMultiplier: 1.0, buildMinutes: 4,
    waitingFactor: 0.30, workingDays: 230, hourly, ciSpendPerEngineerMonth: 60,
  });
  close(c.dailyRuns, 400, 'dailyRuns');
  close(c.waitingHours, 1840, 'waitingHours'); // 400 x (1/15) x 0.30 x 230
  close(c.waitingCost, 147200, 'waitingCost');
  close(c.computeWaste, 72000, 'computeWaste');
  close(c.total, 219200, 'total');
  close(Calc.recoverable(c.total, 0.27, 1.0), 59184, 'conservative');
  close(Calc.recoverable(c.total, 0.50, 1.0), 109600, 'expected');
  close(Calc.recoverable(c.total, 0.83, 1.0), 181936, 'optimistic');
});

// Example B (4-year projection, 10% growth, AI assisted x1.24, same inputs as A)
// Year 1 gross with 1.24: waiting = 147,200 x 1.24 = 182,528; compute = 72,000 x 1.24 = 89,280; total = 271,808
// Headcount factors (1.1)^(t-1): 1, 1.1, 1.21, 1.331 -> sum = 4.641
// 4-year gross = 271,808 x 4.641
//   271,808 x 4     = 1,087,232.000
//   271,808 x 0.641 =   174,228.928
//   total           = 1,261,460.928   -> expected (x 0.50) = 630,730.464
test('Example B: 4-year projection, 10% growth, AI assisted', () => {
  const p = {
    engineers: 100, growthPct: 10, runsPerEngineerPerDay: 4, aiMultiplier: 1.24, buildMinutes: 4,
    waitingFactor: 0.30, workingDays: 230, hourly: 80, ciSpendPerEngineerMonth: 60,
    roomToImprove: 1.0, savingsRates: { conservative: 0.27, expected: 0.50, optimistic: 0.83 },
  };
  const { rows, totals } = Calc.project(p, 4);
  close(rows[0].engineers, 100, 'y1 engineers');
  close(rows[1].engineers, 110, 'y2 engineers');
  close(rows[2].engineers, 121, 'y3 engineers');
  close(rows[3].engineers, 133.1, 'y4 engineers');
  close(rows[0].total, 271808, 'y1 total');
  close(totals.gross, 1261460.928, '4y gross');
  close(totals.expected, 630730.464, '4y expected');
});

test('defaults: approved selections and sync with defaults.json', () => {
  const disk = JSON.parse(fs.readFileSync(path.join(__dirname, 'defaults.json'), 'utf8'));
  assert.deepStrictEqual(CONFIG, disk, 'config.js is stale: run node build-config.js');
  assert.strictEqual(CONFIG.selections.ai_use.default, 'none');
  assert.strictEqual(CONFIG.selections.scenario.default, 'expected');
  assert.strictEqual(CONFIG.inputs.hours_per_year.value, 1840);
  assert.strictEqual(CONFIG.inputs.loading_factor.value, 1.0);
});

test('resolveParams: Seed borrows Series A growth; overrides win', () => {
  const user = { stage: 'Seed', engineers: 10, salary: 100000 };
  assert.strictEqual(Calc.resolveParams(CONFIG, user).growthPct, 28);
  assert.strictEqual(Calc.resolveParams(CONFIG, user, { growthPct: 5 }).growthPct, 5);
});

console.log(`\n${n} tests passed`);
