import assert from 'node:assert/strict';
import {
  lines,
  joinLine,
  clean,
  featureHistory,
  train,
  evaluate,
  extract,
  samples,
} from './app/engine.ts';
assert.equal(joinLine(lines[0]).matched, 2);
assert.equal(joinLine(lines[0]).value, 200);
assert.equal(joinLine(lines[0], 7).matched, 1);
assert.equal(joinLine(lines[3]).type, null);
assert.equal(joinLine(lines[8]).label, 'Pending');
assert.equal(joinLine(lines[4], 30, true).label, 'Sale');
assert.equal(joinLine(lines[4], 30, false).label, 'No sale');
const cleaned = clean({ duplicate: true, leak: true, mar: false, mnar: true });
assert.equal(cleaned.filter((x) => x.status === 'Removed').length, 2);
assert.equal(cleaned.find((x) => x.line === 'L06')?.supplier, 'Unknown');
assert.equal(featureHistory(lines[0]).hitRate, 0.4);
assert.equal(featureHistory(lines[0], true).hitRate, 0.7);
assert.equal(featureHistory(lines[0]).frequency, 3);
for (let fold = 0; fold < 5; fold++)
  for (const balanced of [true, false])
    for (const n of [1, 5, 9]) {
      const model = train(fold, balanced, ['hitRate', 'stock', 'price'], n);
      assert.equal(model.test.length, 4);
      assert.equal(model.training.length, balanced ? 8 : 16);
      assert.ok(
        model.test.every((t) => !model.training.some((x) => x.id === t.id)),
      );
      assert.ok(
        model.test.every(
          (t) => t.score >= 0 && t.score <= 1 && t.votes.length === n,
        ),
      );
      const m = evaluate(model.test, 0.62);
      assert.equal(m.tp + m.fp + m.fn + m.tn, 4);
      const zero = evaluate(model.test, 0);
      assert.equal(zero.tp + zero.fp, 4);
    }
const before = train(0, true, ['stock', 'price'], 5).trees;
const original = samples.map((x) => x.label);
samples.filter((x) => x.fold === 0).forEach((x) => (x.label = 1 - x.label));
assert.deepEqual(
  train(0, true, ['stock', 'price'], 5).trees,
  before,
  'Held-out labels must not change fitted trees',
);
samples.forEach((x, i) => (x.label = original[i]));
assert.equal(evaluate([{ score: 0, label: 1 }], 0.5).precision, null);
assert.deepEqual(extract('AB-12-CD 42 @aero.example', true, false).found, [
  'AB-12-CD',
  '42',
]);
assert.deepEqual(extract('AB-12-CD 42', false, true).found, ['12']);
assert.equal(extract('V1 @newair.example').account, null);
console.log(
  'Passed: joins, maturity, cleaning, temporal history, all fold/sampling/tree configurations, held-out isolation, metrics and extraction.',
);
