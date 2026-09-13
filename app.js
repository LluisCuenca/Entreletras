(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const core = window.EntreletrasCore, { positions, coord } = core;
  const levels = window.PUZZLES, storageKey = 'entreletras-v1';
  const difficultyNames = ['Primeros pasos', 'Fácil', 'Intermedio', 'Difícil', 'Experto'];
  const compact = matchMedia('(max-width: 900px)');
  let saved = { level: 1, games: {}, preferences: {} }, storageUnavailable = false;
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey));
    if (raw && typeof raw === 'object' && raw.games && typeof raw.games === 'object' && !Array.isArray(raw.games)) {
      saved.level = Number(raw.level) || 1;
      saved.games = raw.games;
      saved.preferences = raw.preferences && typeof raw.preferences === 'object' ? raw.preferences : {};
    }
  } catch (_) { storageUnavailable = true; }
  // Preserve previous saves and all puzzle coordinates when updating the interface.
  for (const puzzle of levels) if (saved.games[puzzle.id]) saved.games[puzzle.id] = core.restore(puzzle, saved.games[puzzle.id]);
  let level, game, cells, selectedWord = 0, selectedCell = '', cellSize = 44, autoSize = true, bounds;
  let keyboardVisible = typeof saved.preferences.keyboard === 'boolean' ? saved.preferences.keyboard : compact.matches || matchMedia('(pointer: coarse)').matches;
  let cluesVisible = saved.preferences.clues !== false;
  const histories = new Map();
  const history = () => histories.get(level.id);
  const letters = () => [...cells.keys()].filter(p => game.letters[p]).length;
  const verified = word => positions(word).every(p => game.checked[p] === cells.get(p).answer);
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  function persist() {
    game.selectedWord = selectedWord; game.selectedCell = selectedCell;
    saved.level = level.id;
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); storageUnavailable = false; }
    catch (_) { storageUnavailable = true; }
    $('#save-warning').hidden = !storageUnavailable;
    $('#save-warning').textContent = storageUnavailable ? 'No se puede guardar en este navegador. Puedes jugar, pero tu avance podría perderse al cerrar la página.' : '';
  }
  function say(message) { $('#status').textContent = message; }
  function renderProgress() {
    const count = levels.filter(l => saved.games[l.id]?.completed).length;
    $('#total-completed').textContent = `${count} / 25`;
    $('#levels').setAttribute('aria-label', `Abrir recorrido: ${count} de 25 niveles completados`);
  }
  function load(id) {
    level = levels.find(l => l.id === id) || levels[0];
    game = core.restore(level, saved.games[level.id]); saved.games[level.id] = game;
    cells = core.index(level);
    if (!histories.has(level.id)) histories.set(level.id, []);
    selectedWord = game.selectedWord;
    selectedCell = positions(level.words[selectedWord]).includes(game.selectedCell) ? game.selectedCell : positions(level.words[selectedWord]).find(p => !game.letters[p]) || positions(level.words[selectedWord])[0];
    autoSize = true;
    $('#level-kind').textContent = `NIVEL ${String(level.id).padStart(2, '0')} / 25 · ${level.type === 'crossword' ? 'CRUCIGRAMA' : 'AUTODEFINIDO'}`;
    $('#level-title').textContent = level.title;
    document.title = `${level.title} · Entreletras`;
    $('#difficulty').textContent = difficultyNames[level.difficulty - 1];
    $('#prev-level').disabled = level.id === 1; $('#next-level').disabled = level.id === 25;
    $('#clues-title').textContent = level.type === 'crossword' ? 'Las palabras' : 'Las definiciones';
    renderBoard(); renderClues(); applyLayout(); refresh(); persist(); renderProgress();
    say(game.completed ? 'Nivel completado. Elige otro o reinícialo desde Opciones.' : 'Tu partida se guarda automáticamente.');
    requestAnimationFrame(() => { sizeBoard(); scrollCell(); });
  }
  function applyLayout() {
    const visible = cluesVisible && !compact.matches;
    $('.workspace').classList.toggle('clues-hidden', !visible);
    $('#clues-panel').hidden = !visible;
    $('#show-clues').setAttribute('aria-expanded', String(visible));
    $('#show-clues').setAttribute('aria-label', compact.matches ? 'Abrir lista de pistas' : visible ? 'Ocultar lista de pistas' : 'Mostrar lista de pistas');
    $('#keyboard').hidden = !keyboardVisible;
    document.body.classList.toggle('keyboard-shown', keyboardVisible);
    requestAnimationFrame(sizeBoard);
  }
  function sizeBoard() {
    if (!bounds) return;
    const sc = $('#board-scroll'), mobile = matchMedia('(max-width: 600px)').matches;
    const dock = $('.play-dock').getBoundingClientRect().height;
    const available = (window.visualViewport?.height || innerHeight) - (sc.getBoundingClientRect().top + scrollY) - dock - $('#board-guidance').offsetHeight - parseFloat(getComputedStyle($('#game')).paddingBottom) - 6;
    sc.style.height = `${Math.max(mobile ? 160 : 230, Math.min(720, Math.floor(available)))}px`;
    const padding = mobile ? 32 : 44;
    if (autoSize) {
      const fit = Math.floor(Math.min((sc.clientWidth - padding) / bounds.cols - 2, (sc.clientHeight - padding) / bounds.rows - 2));
      cellSize = Math.max(level.type === 'arrowword' ? 56 : 32, Math.min(level.type === 'arrowword' ? 76 : 54, fit));
    }
    $('#board').style.setProperty('--cell', `${cellSize}px`);
    $('#zoom-out').disabled = cellSize <= 28; $('#zoom-in').disabled = cellSize >= 96;
    const overflow = $('#board').offsetWidth > sc.clientWidth - padding || $('#board').offsetHeight > sc.clientHeight - padding;
    $('#board-guidance').textContent = overflow ? 'Desliza el tablero · La casilla activa te acompaña' : level.type === 'arrowword' ? 'Toca una definición para leerla completa' : 'Toca un cruce dos veces para cambiar de dirección';
  }
  function renderBoard() {
    const clues = new Map();
    if (level.type === 'arrowword') level.words.forEach((w, i) => {
      const p = coord(w.row - (w.direction === 'V' ? 1 : 0), w.col - (w.direction === 'H' ? 1 : 0));
      if (!clues.has(p)) clues.set(p, []); clues.get(p).push(i);
    });
    const coords = [...cells.keys(), ...clues.keys()].map(p => p.split(',').map(Number));
    const r0 = Math.min(...coords.map(p => p[0])), c0 = Math.min(...coords.map(p => p[1]));
    const r1 = Math.max(...coords.map(p => p[0])), c1 = Math.max(...coords.map(p => p[1]));
    bounds = { rows: r1 - r0 + 1, cols: c1 - c0 + 1 };
    const starts = new Map(level.words.map(w => [coord(w.row, w.col), w.number]));
    let html = '';
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const p = coord(r, c);
      if (cells.has(p)) html += `<button class="cell letter-cell" data-cell="${p}" aria-describedby="active-label active-text">${starts.has(p) ? `<span class="number" aria-hidden="true">${starts.get(p)}</span>` : ''}<span class="letter"></span></button>`;
      else if (clues.has(p)) html += `<div class="cell clue-cell">${clues.get(p).map(i => { const w = level.words[i]; return `<button class="clue-trigger" data-word="${i}" aria-label="${w.number} ${w.direction === 'H' ? 'horizontal' : 'vertical'}: ${escape(w.clue)}"><span><b>${w.number} ${w.direction === 'H' ? '→' : '↓'}</b> ${escape(w.clue)}</span></button>`; }).join('')}</div>`;
      else html += '<div class="cell block" aria-hidden="true"></div>';
    }
    $('#board').style.gridTemplateColumns = `repeat(${bounds.cols}, var(--cell))`;
    $('#board').innerHTML = html;
  }
  function clueHTML() {
    return ['H', 'V'].map(d => `<h3 class="clue-group">${d === 'H' ? 'HORIZONTALES →' : 'VERTICALES ↓'}</h3>` + level.words.map((w, i) => w.direction === d ? `<button class="clue-item ${i === selectedWord ? 'selected' : ''} ${verified(w) || game.completed ? 'done' : ''}" data-word="${i}" aria-pressed="${i === selectedWord}"><b>${w.number}${verified(w) || game.completed ? ' ✓' : ''}</b><span>${escape(w.clue)} <small>(${w.answer.length})</small></span></button>` : '').join('')).join('');
  }
  function renderClues() { $('#clue-list').innerHTML = clueHTML(); }
  function refresh() {
    const word = level.words[selectedWord], ps = positions(word);
    document.querySelectorAll('.letter-cell').forEach(el => {
      const p = el.dataset.cell, value = game.letters[p] || '', checked = game.checked[p] === value && !!value;
      el.querySelector('.letter').textContent = value;
      el.classList.toggle('selected', p === selectedCell); el.classList.toggle('related', ps.includes(p));
      el.classList.toggle('error', checked && value !== cells.get(p).answer); el.classList.toggle('correct', checked && value === cells.get(p).answer);
      el.setAttribute('aria-label', `Fila ${Number(p.split(',')[0]) + 1}, columna ${Number(p.split(',')[1]) + 1}: ${value || 'vacía'}${checked && value !== cells.get(p).answer ? ', incorrecta' : ''}`);
      el.setAttribute('aria-pressed', String(p === selectedCell)); el.tabIndex = p === selectedCell ? 0 : -1;
    });
    $('#clue-list').querySelectorAll('.clue-item').forEach(el => {
      const i = Number(el.dataset.word), done = verified(level.words[i]) || game.completed;
      el.classList.toggle('selected', i === selectedWord); el.classList.toggle('done', done);
      el.setAttribute('aria-pressed', String(i === selectedWord)); el.querySelector('b').textContent = `${level.words[i].number}${done ? ' ✓' : ''}`;
    });
    document.querySelectorAll('.clue-trigger').forEach(el => el.setAttribute('aria-pressed', String(Number(el.dataset.word) === selectedWord)));
    $('#active-label').textContent = `${word.number} ${word.direction === 'H' ? 'HORIZONTAL →' : 'VERTICAL ↓'} · ${word.answer.length} LETRAS`;
    $('#active-text').textContent = word.clue;
    $('#word-count').textContent = game.completed ? '✓ Completado' : `${letters()} / ${cells.size} letras`;
    $('#hint-count').textContent = game.hints ? `· ${game.hints}` : '';
    $('#undo').disabled = !history().length || game.completed;
    $('#hint').disabled = game.completed; $('#check').disabled = game.completed;
  }
  // Rectangles share viewport coordinates, unlike offsetTop across positioned ancestors.
  function scrollCell() {
    const el = $(`[data-cell="${selectedCell}"]`), sc = $('#board-scroll'); if (!el) return;
    const cell = el.getBoundingClientRect(), view = sc.getBoundingClientRect(), pad = 18;
    if (cell.left < view.left + pad) sc.scrollLeft += cell.left - view.left - pad;
    else if (cell.right > view.right - pad) sc.scrollLeft += cell.right - view.right + pad;
    if (cell.top < view.top + pad) sc.scrollTop += cell.top - view.top - pad;
    else if (cell.bottom > view.bottom - pad) sc.scrollTop += cell.bottom - view.bottom + pad;
  }
  function selectWord(i, focus = false) {
    selectedWord = (i + level.words.length) % level.words.length;
    const ps = positions(level.words[selectedWord]); selectedCell = ps.find(p => !game.letters[p]) || ps[0];
    refresh(); persist(); scrollCell(); if (focus) focusCell();
  }
  function focusCell() { $(`[data-cell="${selectedCell}"]`)?.focus({ preventScroll: true }); }
  function type(key) {
    if ($('#modal').open || game.completed) return;
    const ps = positions(level.words[selectedWord]); let i = ps.indexOf(selectedCell);
    let target = selectedCell;
    if (key === 'BACKSPACE' && !game.letters[target] && i > 0) target = ps[--i];
    const value = key === 'BACKSPACE' || key === 'DELETE' ? '' : key;
    if (value && !/^[A-ZÑ]$/.test(value)) return;
    game.selectedCell = target; game.selectedWord = selectedWord;
    core.edit(game, cells, target, value, history()); selectedCell = target;
    if (value && i < ps.length - 1) selectedCell = ps[i + 1];
    refresh(); persist(); scrollCell();
    if (document.activeElement?.matches('.letter-cell')) focusCell();
    finish();
  }
  function finish() {
    if (!core.solved(cells, game.letters) || game.completed) return;
    game.completed = true; refresh(); persist(); renderProgress();
    const all = levels.every(l => saved.games[l.id]?.completed);
    openModal(`<div class="eyebrow">${all ? 'RECORRIDO COMPLETADO' : 'TODO ENCAJA'}</div><div class="completion-mark">${all ? '25 / 25' : String(level.id).padStart(2, '0')}</div><h2 id="modal-title">${all ? 'Una aventura entre letras.' : 'Una más, bien resuelta.'}</h2><p>Has completado «${escape(level.title)}» con ${game.hints} ${game.hints === 1 ? 'letra revelada' : 'letras reveladas'}.</p><button class="primary" id="continue">${all ? 'Volver al tablero' : level.id < 25 ? 'Siguiente nivel →' : 'Ver el recorrido'}</button>`);
    $('#continue').onclick = () => { $('#modal').close(); if (!all) { if (level.id < 25) load(level.id + 1); else showLevels(); } };
  }
  function openModal(content) {
    if ($('#modal').open) $('#modal').close();
    $('#modal-content').innerHTML = content; $('#modal').showModal(); $('#modal').scrollTop = 0;
  }
  function showLevels() {
    const count = levels.filter(l => saved.games[l.id]?.completed).length;
    openModal(`<div class="eyebrow">25 DESAFÍOS · A TU RITMO</div><h2 id="modal-title">El recorrido</h2><div class="journey-progress"><span>${count} de 25 completados</span><progress aria-label="Niveles completados" max="25" value="${count}"></progress></div>` + difficultyNames.map((name, group) => `<section class="level-section"><h3>${name}<span>${String(group * 5 + 1).padStart(2, '0')} — ${group * 5 + 5}</span></h3><div class="level-map">${levels.slice(group * 5, group * 5 + 5).map(l => { const g = saved.games[l.id]; return `<button class="level-button ${l.id === level.id ? 'active' : ''}" data-level="${l.id}" ${l.id === level.id ? 'aria-current="step"' : ''}><span class="level-number">${String(l.id).padStart(2, '0')}</span><span class="level-info">${escape(l.title)}<small>${l.type === 'crossword' ? 'Crucigrama' : 'Autodefinido'} · ${l.words.length} palabras</small></span><span class="level-state">${g?.completed ? '✓ Hecho' : Object.keys(g?.letters || {}).length ? 'En curso' : '→'}</span></button>`; }).join('')}</div></section>`).join(''));
  }
  function showClues() {
    if (compact.matches) openModal(`<div class="eyebrow">${escape(level.title)}</div><h2 id="modal-title">Todas las pistas</h2><div class="clue-list">${clueHTML()}</div>`);
    else { cluesVisible = !cluesVisible; saved.preferences.clues = cluesVisible; applyLayout(); persist(); }
  }
  function showOptions() {
    openModal(`<div class="eyebrow">A TU MANERA</div><h2 id="modal-title">Opciones de juego</h2><label class="option-row"><span>Teclado en pantalla<small>Puedes usar siempre el teclado del ordenador.</small></span><input id="keyboard-toggle" type="checkbox" ${keyboardVisible ? 'checked' : ''}></label><button class="option-link" id="help">Cómo jugar</button><button class="option-link" id="restart">Reiniciar este nivel</button><p class="fine-print">El progreso se guarda en este navegador. No se sincroniza entre dispositivos.</p>`);
    $('#keyboard-toggle').onchange = e => { keyboardVisible = e.target.checked; saved.preferences.keyboard = keyboardVisible; applyLayout(); persist(); };
    $('#help').onclick = showHelp; $('#restart').onclick = confirmReset;
  }
  function showHelp() {
    openModal('<div class="eyebrow">CADA CRUCE ES UNA PISTA</div><h2 id="modal-title">Cómo jugar</h2><details class="help-section" open><summary>Escribe y conecta</summary><p>Selecciona una casilla o una definición y escribe la respuesta. No hacen falta tildes; la Ñ sí se conserva. Toca dos veces un cruce para cambiar de dirección.</p></details><details class="help-section"><summary>Crucigramas y autodefinidos</summary><p>En los crucigramas, abre Pistas para consultar las definiciones. En los autodefinidos están dentro del tablero: toca la flecha de cada pista para verla completa debajo. → indica horizontal; ↓ indica vertical.</p></details><details class="help-section"><summary>Ayudas y teclado</summary><p>Comprobar marca los errores con rojo y un signo de exclamación. Revelar letra resuelve una casilla. Puedes deshacer letras; una ayuda usada sigue contando.</p><p>Flechas: moverte. Espacio: cambiar dirección en un cruce. Intro: siguiente pista. Retroceso: borrar. Ctrl o ⌘ Z: deshacer. Pulsa Ajustar para volver al tamaño inicial del tablero.</p></details><details class="help-section"><summary>Guardar y jugar en el móvil</summary><p>Tu partida y la última casilla se guardan automáticamente en este navegador. En Opciones puedes mostrar u ocultar el teclado de pantalla.</p><p>Desde el menú de Safari o Chrome puedes añadir la web a la pantalla de inicio. Tras cargarla con conexión y guardarse sus archivos, podrás jugar sin internet.</p></details><details class="help-section"><summary>El recorrido</summary><p>Hay 25 niveles que alternan ambos formatos, agrupados en cinco grados orientativos de dificultad. Puedes jugar en el orden que prefieras. Los niveles completados se pueden consultar o reiniciar.</p></details>');
  }
  function confirmReset() {
    openModal(`<div class="eyebrow">NIVEL ${level.id}</div><h2 id="modal-title">¿Volver a empezar?</h2><p>Se borrarán las letras, las ayudas usadas y la marca de completado de «${escape(level.title)}».</p><div class="modal-buttons"><button class="secondary" id="cancel-reset">Seguir jugando</button><button class="secondary" id="confirm-reset">Reiniciar nivel</button></div>`);
    $('#cancel-reset').onclick = () => $('#modal').close();
    $('#confirm-reset').onclick = () => { delete saved.games[level.id]; histories.delete(level.id); $('#modal').close(); load(level.id); focusCell(); };
  }
  $('#modal-content').onclick = e => {
    const levelButton = e.target.closest('[data-level]'), clueButton = e.target.closest('[data-word]');
    if (levelButton) { $('#modal').close(); load(Number(levelButton.dataset.level)); focusCell(); }
    else if (clueButton) { $('#modal').close(); selectWord(Number(clueButton.dataset.word), true); }
  };
  $('.modal-close').onclick = () => $('#modal').close();
  $('#modal').addEventListener('click', e => { if (e.target !== $('#modal')) return; const r = $('#modal').getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) $('#modal').close(); });
  $('#levels').onclick = showLevels; $('#options').onclick = showOptions;
  $('#show-clues').onclick = showClues; $('#close-clues').onclick = () => { cluesVisible = false; saved.preferences.clues = false; applyLayout(); persist(); $('#show-clues').focus(); };
  $('#prev-level').onclick = () => load(level.id - 1); $('#next-level').onclick = () => load(level.id + 1);
  $('#prev-clue').onclick = () => selectWord(selectedWord - 1); $('#next-clue').onclick = () => selectWord(selectedWord + 1);
  $('#clue-list').onclick = e => { const el = e.target.closest('[data-word]'); if (el) selectWord(Number(el.dataset.word), true); };
  $('#board').onclick = e => {
    const clue = e.target.closest('[data-word]'); if (clue) { selectWord(Number(clue.dataset.word), true); return; }
    const el = e.target.closest('[data-cell]'); if (!el) return;
    const p = el.dataset.cell, ids = cells.get(p).words;
    if (p === selectedCell && ids.length > 1) selectedWord = ids[(ids.indexOf(selectedWord) + 1) % ids.length];
    else if (!ids.includes(selectedWord)) selectedWord = ids[0];
    selectedCell = p; refresh(); persist(); scrollCell();
  };
  $('#check').onclick = () => {
    let bad = 0; for (const [p, cell] of cells) if (game.letters[p]) { game.checked[p] = game.letters[p]; if (game.letters[p] !== cell.answer) bad++; }
    const empty = cells.size - letters(); refresh(); persist();
    say(bad ? `${bad} ${bad === 1 ? 'letra incorrecta' : 'letras incorrectas'}: rojo y «!». ${empty} vacías.` : empty ? `Las letras escritas encajan. Quedan ${empty} casillas.` : '¡Todo encaja!'); finish();
  };
  $('#hint').onclick = () => {
    const p = game.letters[selectedCell] !== cells.get(selectedCell).answer ? selectedCell : positions(level.words[selectedWord]).find(p => game.letters[p] !== cells.get(p).answer);
    if (!p) { say('Esta palabra ya encaja. Elige otra para revelar una letra.'); return; }
    game.selectedCell = p; game.selectedWord = selectedWord;
    if (core.edit(game, cells, p, cells.get(p).answer, history())) game.hints++;
    game.checked[p] = cells.get(p).answer; selectedCell = p; refresh(); persist(); scrollCell(); say('Una letra revelada. Puedes seguir por sus cruces.'); finish();
  };
  function undo() { if (core.undo(game, history())) { selectedCell = game.selectedCell; selectedWord = game.selectedWord; refresh(); persist(); scrollCell(); say('Última letra deshecha.'); } }
  $('#undo').onclick = undo;
  function zoom(delta) { autoSize = false; cellSize = Math.max(28, Math.min(96, cellSize + delta)); sizeBoard(); scrollCell(); }
  $('#zoom-in').onclick = () => zoom(8); $('#zoom-out').onclick = () => zoom(-8);
  $('#zoom-fit').onclick = () => { autoSize = true; sizeBoard(); scrollCell(); };
  $('#keyboard').innerHTML = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'].map((row, i) => `<div class="key-row">${[...row].map(k => `<button class="key" data-key="${k}" aria-label="Letra ${k}">${k}</button>`).join('')}${i === 2 ? '<button class="key wide" data-key="BACKSPACE" aria-label="Borrar letra">⌫</button>' : ''}</div>`).join('');
  $('#keyboard').onclick = e => { const button = e.target.closest('[data-key]'); if (button) type(button.dataset.key); };
  document.addEventListener('keydown', e => {
    if ($('#modal').open || e.altKey || e.isComposing || e.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
    if (e.ctrlKey || e.metaKey || e.key === 'Tab') return;
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('button') && !e.target.closest('.letter-cell')) return;
    const key = core.normalize(e.key);
    if (/^[A-ZÑ]$/.test(key) || key === 'BACKSPACE' || key === 'DELETE') { e.preventDefault(); type(key); }
    else if (e.key === 'Enter') { e.preventDefault(); selectWord(selectedWord + 1, true); }
    else if (e.key === ' ') { e.preventDefault(); const ids = cells.get(selectedCell).words; selectedWord = ids[(ids.indexOf(selectedWord) + 1) % ids.length]; refresh(); persist(); }
    else if (e.key.startsWith('Arrow')) {
      if (e.target === $('#board-scroll')) return;
      e.preventDefault(); const [r, c] = selectedCell.split(',').map(Number), direction = ['ArrowLeft', 'ArrowRight'].includes(e.key) ? 'H' : 'V';
      const own = cells.get(selectedCell).words.find(i => level.words[i].direction === direction); if (own !== undefined) selectedWord = own;
      const next = coord(r + (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0), c + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0));
      if (cells.has(next)) { selectedCell = next; if (!cells.get(next).words.includes(selectedWord)) selectedWord = cells.get(next).words[0]; }
      refresh(); persist(); scrollCell(); focusCell();
    }
  });
  compact.addEventListener('change', applyLayout);
  window.addEventListener('resize', () => { sizeBoard(); scrollCell(); });
  window.visualViewport?.addEventListener('resize', () => { sizeBoard(); scrollCell(); });
  const layoutObserver = new ResizeObserver(() => { sizeBoard(); scrollCell(); });
  layoutObserver.observe($('.play-dock')); layoutObserver.observe($('.game-heading'));
  load(saved.level);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const previouslyControlled = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (previouslyControlled) $('#update-notice').hidden = false;
    });
    $('#update-app').onclick = () => { persist(); location.reload(); };
    navigator.serviceWorker.register('./sw.js').catch(() => {
      if (!navigator.serviceWorker.controller) say('Puedes jugar en línea. No se ha podido activar el modo sin conexión.');
    });
  }
})();
