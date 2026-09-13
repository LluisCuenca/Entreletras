const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const core = require('../core.js');
const scope = { window: {} };
vm.runInNewContext(fs.readFileSync(require.resolve('../puzzles.js'), 'utf8'), scope);
const levels = scope.window.PUZZLES;

test('Spanish input preserves Ñ, including decomposed input, while removing accents', () => {
  assert.equal(core.normalize('niño'), 'NIÑO');
  assert.equal(core.normalize('n\u0303'), 'Ñ');
  assert.equal(core.normalize('áéíóúü'), 'AEIOUU');
});
test('Existing v1 saves retain letters and hints; stale coordinates and invalid values are removed', () => {
  const level = levels[0], cells = core.index(level), p = [...cells.keys()][0];
  const game = core.restore(level, { letters: { [p]: 'G', '999,999': 'A' }, hints: 3, completed: true, selectedWord: 999, selectedCell: '999,999' });
  assert.deepEqual(game.letters, { [p]: 'G' }); assert.equal(game.hints, 3);
  assert.equal(game.completed, false); assert.equal(game.selectedWord, 0); assert.equal(game.selectedCell, null);
  assert.doesNotThrow(() => core.restore(level, null));
  assert.equal(core.restore(level, { hints: -7 }).hints, 0);
  assert.deepEqual(core.restore(level, { letters: { [p]: '<script>' } }).letters, {});
});
test('Editing a checked crossing invalidates only that cell; undo restores the prior checked state', () => {
  const level = levels[0], cells = core.index(level), p = [...cells].find(([, cell]) => cell.words.length === 2)[0];
  const game = core.restore(level), history = [];
  game.letters[p] = cells.get(p).answer; game.checked[p] = game.letters[p]; game.selectedCell = p;
  assert.equal(core.edit(game, cells, p, 'Z', history), true); assert.equal(game.checked[p], undefined);
  assert.equal(core.undo(game, history), true); assert.equal(game.letters[p], cells.get(p).answer); assert.equal(game.checked[p], game.letters[p]);
});
test('Undoing a revealed letter does not refund the hint count', () => {
  const level = levels[0], cells = core.index(level), p = [...cells.keys()][0], game = core.restore(level), history = [];
  core.edit(game, cells, p, cells.get(p).answer, history); game.hints++;
  core.undo(game, history); assert.equal(game.letters[p], undefined); assert.equal(game.hints, 1);
});
test('All 25 levels distinguish incomplete, incorrect, and solved boards and protect completed games', () => {
  assert.equal(levels.length, 25);
  for (const level of levels) {
    const cells = core.index(level), game = core.restore(level), history = [];
    assert.equal(core.solved(cells, game.letters), false);
    for (const [p, cell] of cells) core.edit(game, cells, p, cell.answer, history);
    assert.equal(core.solved(cells, game.letters), true);
    const p = [...cells.keys()][0], answer = game.letters[p];
    game.letters[p] = answer === 'Z' ? 'X' : 'Z'; assert.equal(core.solved(cells, game.letters), false);
    game.letters[p] = answer; const restored = core.restore(level, game); assert.equal(restored.completed, true);
    assert.equal(core.edit(restored, cells, p, '', history), false); assert.equal(core.undo(restored, history), false);
  }
});
