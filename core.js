/* Reglas independientes de la interfaz: se pueden verificar sin navegador. */
(function (root) {
  'use strict';
  function normalize(value) {
    return String(value).toUpperCase().normalize('NFD').replace(/N\u0303/g, 'Ñ').replace(/[\u0300-\u036f]/g, '');
  }
  const coord = (r, c) => `${r},${c}`;
  const positions = word => Array.from(word.answer, (_, i) => coord(word.row + (word.direction === 'V' ? i : 0), word.col + (word.direction === 'H' ? i : 0)));
  function index(level) {
    const cells = new Map();
    level.words.forEach((word, wi) => positions(word).forEach((p, i) => {
      if (!cells.has(p)) cells.set(p, { answer: word.answer[i], words: [] });
      cells.get(p).words.push(wi);
    }));
    return cells;
  }
  function solved(cells, letters) { return [...cells].every(([p, cell]) => letters[p] === cell.answer); }
  function restore(level, raw) {
    const cells = index(level), letters = {}, checked = {};
    if (raw && typeof raw === 'object') {
      for (const p of cells.keys()) {
        const value = raw.letters?.[p];
        if (typeof value === 'string' && /^[A-ZÑ]$/.test(value)) letters[p] = value;
        if (letters[p] && raw.checked?.[p] === letters[p]) checked[p] = letters[p];
      }
    }
    return { letters, checked, hints: Number.isSafeInteger(raw?.hints) && raw.hints > 0 ? raw.hints : 0,
      completed: solved(cells, letters), selectedWord: Number.isInteger(raw?.selectedWord) && level.words[raw.selectedWord] ? raw.selectedWord : 0,
      selectedCell: cells.has(raw?.selectedCell) ? raw.selectedCell : null };
  }
  function edit(game, cells, p, letter, history) {
    if (game.completed || !cells.has(p) || (letter && !/^[A-ZÑ]$/.test(letter))) return false;
    if ((game.letters[p] || '') === letter) return false;
    history.push({ letters: { ...game.letters }, checked: { ...game.checked }, selectedCell: game.selectedCell, selectedWord: game.selectedWord });
    if (history.length > 100) history.shift();
    if (letter) game.letters[p] = letter; else delete game.letters[p];
    delete game.checked[p];
    return true;
  }
  function undo(game, history) {
    if (!history.length || game.completed) return false;
    Object.assign(game, history.pop());
    return true;
  }
  const api = { normalize, coord, positions, index, solved, restore, edit, undo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.EntreletrasCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
