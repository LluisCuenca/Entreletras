/* Entreletras: aplicación estática, sin dependencias ni solicitudes externas. */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const levels = window.PUZZLES, storageKey = 'entreletras-v1';
const difficultyNames = ['Primeros pasos','Fácil','Intermedio','Difícil','Experto'];
let saved = {level:1, games:{}};
try { const raw = JSON.parse(localStorage.getItem(storageKey)); if(raw && raw.games && typeof raw.games==='object') saved=raw; } catch (_) {}
let level, game, cells, selectedWord=0, selectedCell='', zoom=1;
const coord=(r,c)=>`${r},${c}`;
const positions=w=>Array.from(w.answer,(_,i)=>coord(w.row+(w.direction==='V'?i:0),w.col+(w.direction==='H'?i:0)));
function persist(){ saved.level=level.id; try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch(_){$('#save-note').textContent='El navegador no permite guardar. Mantén esta página abierta.';} }
function say(text){$('#status').textContent=text;}
function wordDone(w){return positions(w).every((p,i)=>game.letters[p]===w.answer[i]);}
function renderMap(){
 $('#level-map').innerHTML=levels.map(l=>{const g=saved.games[l.id];return `<button class="level-button ${l.id===level.id?'active':''} ${g?.completed?'complete':Object.keys(g?.letters||{}).length?'in-progress':''}" data-level="${l.id}" aria-label="Nivel ${l.id}: ${l.title}${g?.completed?', completado':''}" ${l.id===level.id?'aria-current="step"':''}>${g?.completed?'✓':String(l.id).padStart(2,'0')}</button>`;}).join('');
 const count=levels.filter(l=>saved.games[l.id]?.completed).length;$('#total-completed').textContent=`${count} de 25`;$('#overall').value=count;
}
function load(id){
 level=levels.find(l=>l.id===id)||levels[0];
 game=saved.games[level.id];if(!game||!game.letters||typeof game.letters!=='object')game={letters:{},hints:0,completed:false};
 game.hints=Number(game.hints)||0;saved.games[level.id]=game;
 cells=new Map();level.words.forEach((w,wi)=>positions(w).forEach((p,i)=>{if(!cells.has(p))cells.set(p,{answer:w.answer[i],words:[]});cells.get(p).words.push(wi);}));
 selectedWord=0; selectedCell=positions(level.words[0])[0];zoom=1;
 $('#level-kind').textContent=`NIVEL ${String(level.id).padStart(2,'0')} / 25 · ${level.type==='crossword'?'CRUCIGRAMA':'AUTODEFINIDO'}`;
 $('#level-title').textContent=level.title;
 $('#difficulty').innerHTML=Array.from({length:5},(_,i)=>`<i class="${i<level.difficulty?'on':''}"></i>`).join('')+`<b>${difficultyNames[level.difficulty-1]}</b>`;
 $('#clues-title').textContent=level.type==='crossword'?'El hilo de las palabras':'Dentro de cada casilla';
 renderMap();renderBoard();renderClues();refresh();scrollCell();persist();say(game.completed?'Nivel completado. Puedes repasarlo o elegir otro.':level.type==='arrowword'?'Toca una pista del tablero para leerla completa.':'Selecciona una casilla y empieza a escribir.');
}
function sizeBoard(){
 const width=$('#board-scroll').clientWidth-24;
 const base=level.type==='arrowword'?65:Math.min(47,Math.max(29,(width-10)/level.cols-2));
 $('#board').style.setProperty('--cell',`${Math.round(base*zoom)}px`);
}
function renderBoard(){
 const clues=new Map();if(level.type==='arrowword')level.words.forEach((w,i)=>{const p=coord(w.row-(w.direction==='V'?1:0),w.col-(w.direction==='H'?1:0));if(!clues.has(p))clues.set(p,[]);clues.get(p).push(i);});
 const board=$('#board');board.style.gridTemplateColumns=`repeat(${level.cols},var(--cell))`;let html='';
 for(let r=0;r<level.rows;r++)for(let c=0;c<level.cols;c++){
 const p=coord(r,c),cell=cells.get(p);
 if(cell){const starts=level.words.filter(w=>w.row===r&&w.col===c);html+=`<button class="cell letter-cell" data-cell="${p}" aria-label="Fila ${r+1}, columna ${c+1}">${level.type==='crossword'&&starts.length?`<span class="number">${starts[0].number}</span>`:''}<span class="letter"></span></button>`;}
 else if(clues.has(p)){const ids=clues.get(p);html+=`<button class="cell clue-cell" data-clues="${ids.join(',')}" aria-label="${ids.map(i=>level.words[i].clue+' '+(level.words[i].direction==='H'?'hacia la derecha':'hacia abajo')).join('. ')}">${ids.map(i=>`<span><strong>${level.words[i].direction==='H'?'→':'↓'}</strong> ${level.words[i].clue}</span>`).join('')}</button>`;}
 else html+='<div class="cell block" aria-hidden="true"></div>';
 }board.innerHTML=html;sizeBoard();
}
function renderClues(){
 $('#clue-list').innerHTML=['H','V'].map(d=>`<h3 class="clue-group">${d==='H'?'HORIZONTALES →':'VERTICALES ↓'}</h3>`+level.words.map((w,i)=>w.direction===d?`<button class="clue-item" data-word="${i}"><b>${w.number}</b><span>${w.clue} <small>(${w.answer.length})</small></span></button>`:'').join('')).join('');
}
function refresh(){
 const w=level.words[selectedWord],ps=positions(w);
 document.querySelectorAll('.letter-cell').forEach(el=>{const p=el.dataset.cell;el.querySelector('.letter').textContent=game.letters[p]||'';el.classList.toggle('selected',p===selectedCell);el.classList.toggle('related',ps.includes(p));el.setAttribute('aria-label',`Fila ${Number(p.split(',')[0])+1}, columna ${Number(p.split(',')[1])+1}: ${game.letters[p]||'vacía'}`);el.setAttribute('aria-pressed',String(p===selectedCell));el.tabIndex=p===selectedCell?0:-1;});
 document.querySelectorAll('.clue-item').forEach(el=>{el.classList.toggle('selected',+el.dataset.word===selectedWord);el.classList.toggle('done',wordDone(level.words[+el.dataset.word]));});
 $('#active-label').textContent=`${w.number} ${w.direction==='H'?'HORIZONTAL →':'VERTICAL ↓'} · ${w.answer.length} LETRAS`;
 $('#active-text').textContent=w.clue;
 $('#word-count').textContent=`${level.words.filter(wordDone).length} / ${level.words.length} palabras`;
 $('#hint-count').textContent=game.hints?`· ${game.hints}`:'';
}
function selectWord(i,scroll=false){selectedWord=(i+level.words.length)%level.words.length;const ps=positions(level.words[selectedWord]);selectedCell=ps.find(p=>!game.letters[p])||ps[0];refresh();if(scroll)scrollCell();}
function scrollCell(){const el=$(`[data-cell="${selectedCell}"]`),sc=$('#board-scroll');if(el){const x=el.offsetLeft-$('#board').offsetLeft+($('#board').offsetLeft-sc.offsetLeft),y=el.offsetTop-$('#board').offsetTop;sc.scrollLeft=Math.max(0,x-sc.clientWidth/2);sc.scrollTop=Math.max(0,y-sc.clientHeight/2);}}
function clearFeedback(){document.querySelectorAll('.error,.correct').forEach(el=>el.classList.remove('error','correct'));}
function type(key){
 if($('#modal').open)return;
 const ps=positions(level.words[selectedWord]);let i=ps.indexOf(selectedCell);clearFeedback();
 if(key==='BACKSPACE'){if(!game.letters[selectedCell]&&i>0){i--;selectedCell=ps[i];}delete game.letters[selectedCell];}
 else if(key==='DELETE'){delete game.letters[selectedCell];}
 else if(/^[A-ZÑ]$/.test(key)){game.letters[selectedCell]=key;if(i<ps.length-1)selectedCell=ps[i+1];}
 else return;
 refresh();persist();finish();
}
function finish(){if([...cells].every(([p,c])=>game.letters[p]===c.answer)&&!game.completed){game.completed=true;persist();renderMap();const all=levels.every(l=>saved.games[l.id]?.completed);openModal(`<div class="medal">✦</div><div class="eyebrow">${all?'AVENTURA COMPLETADA':'PALABRA A PALABRA, LO CONSEGUISTE'}</div><h2>${all?'25 pequeños grandes logros.':'¡Nivel completado!'}</h2><p>Has resuelto «${level.title}» con ${game.hints} ${game.hints===1?'letra revelada':'letras reveladas'}.</p><button class="primary" id="continue">${all?'Volver al tablero':level.id<25?'Siguiente nivel →':'Volver al recorrido'}</button>`);$('#continue').onclick=()=>{$('#modal').close();if(!all)load(level.id<25?level.id+1:levels.find(l=>!saved.games[l.id]?.completed)?.id||1);};}}
function openModal(content){$('#modal-content').innerHTML=content;$('#modal').showModal();}
$('#level-map').onclick=e=>{const b=e.target.closest('[data-level]');if(b)load(+b.dataset.level);};
$('#board').onclick=e=>{const el=e.target.closest('button');if(!el)return;if(el.dataset.clues){const ids=el.dataset.clues.split(',').map(Number);selectWord(ids[(ids.indexOf(selectedWord)+1)%ids.length]);return;}const p=el.dataset.cell;if(!p)return;const ids=cells.get(p).words;if(p===selectedCell&&ids.length>1)selectedWord=ids[(ids.indexOf(selectedWord)+1)%ids.length];else if(!ids.includes(selectedWord))selectedWord=ids[0];selectedCell=p;refresh();};
$('#clue-list').onclick=e=>{const b=e.target.closest('[data-word]');if(b)selectWord(+b.dataset.word,true);};
$('#prev-clue').onclick=()=>selectWord(selectedWord-1,true);$('#next-clue').onclick=()=>selectWord(selectedWord+1,true);
$('#check').onclick=()=>{let bad=0,empty=0;clearFeedback();document.querySelectorAll('.letter-cell').forEach(el=>{const p=el.dataset.cell;if(!game.letters[p])empty++;else if(game.letters[p]!==cells.get(p).answer){bad++;el.classList.add('error');}else el.classList.add('correct');});say(bad?`${bad} ${bad===1?'letra por corregir':'letras por corregir'}, en rojo. ${empty} casillas vacías.`:empty?`¡Vas bien! Las letras escritas encajan. Quedan ${empty} casillas.`:'¡Todo encaja! Nivel completado.');finish();};
$('#hint').onclick=()=>{const ps=positions(level.words[selectedWord]);const p=game.letters[selectedCell]!==cells.get(selectedCell).answer?selectedCell:ps.find(p=>game.letters[p]!==cells.get(p).answer);if(!p){say('Esta palabra ya está resuelta. Selecciona otra para pedir una pista.');return;}clearFeedback();game.letters[p]=cells.get(p).answer;game.hints++;selectedCell=p;refresh();persist();say('Letra revelada. Sigue conectando las pistas.');finish();};
$('#restart').onclick=()=>{openModal('<h2>¿Empezar de nuevo?</h2><p>Se borrarán las letras y las pistas usadas de este nivel. Los demás niveles se conservarán.</p><div class="modal-buttons"><button class="secondary" id="cancel-reset">Seguir jugando</button><button class="secondary" id="confirm-reset">Reiniciar nivel</button></div>');$('#cancel-reset').onclick=()=>$('#modal').close();$('#confirm-reset').onclick=()=>{delete saved.games[level.id];$('#modal').close();load(level.id);};};
$('#zoom-in').onclick=()=>{zoom=Math.min(1.8,zoom+.15);sizeBoard();};$('#zoom-out').onclick=()=>{zoom=Math.max(.65,zoom-.15);sizeBoard();};
$('#help').onclick=()=>openModal('<div class="eyebrow">BIENVENIDO A ENTRELETRAS</div><h2>Todo empieza con una letra.</h2><ul><li>Elige una casilla y escribe con tu teclado o con el de la pantalla.</li><li>Toca otra vez una casilla de cruce para cambiar de dirección. También puedes elegir una pista.</li><li>En los <strong>autodefinidos</strong>, las pistas están dentro del tablero: → hacia la derecha y ↓ hacia abajo. Tócalas para leerlas completas en la franja inferior.</li><li>Usa las flechas del teclado para moverte, Intro para cambiar de pista y Retroceso para borrar.</li><li>Escribe sin tildes. La Ñ conserva su letra.</li><li>Puedes comprobar tus letras o revelar una. No hay penalizaciones ni límite de tiempo.</li></ul><p>Los 25 niveles están disponibles desde el principio, ordenados en cinco grados de dificultad. Tu avance se guarda solo en este navegador.</p><p>En el móvil puedes añadir esta web a la pantalla de inicio desde el menú del navegador. Una vez cargada en línea, también funciona sin conexión.</p>');
$('.modal-close').onclick=()=>$('#modal').close();
const keyboardRows=['QWERTYUIOP','ASDFGHJKLÑ','ZXCVBNM'];$('#keyboard').innerHTML=keyboardRows.map((row,i)=>`<div class="key-row">${[...row].map(k=>`<button class="key" data-key="${k}" aria-label="Letra ${k}">${k}</button>`).join('')}${i===2?'<button class="key wide" data-key="BACKSPACE" aria-label="Borrar letra">⌫</button>':''}</div>`).join('');
$('#keyboard').onclick=e=>{const b=e.target.closest('[data-key]');if(b)type(b.dataset.key);};
document.addEventListener('keydown',e=>{if($('#modal').open||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='Tab')return;if(e.key==='Enter'&&e.target.closest('button')&&!e.target.closest('.letter-cell'))return;
 let key=e.key.toUpperCase();if(key!=='Ñ')key=key.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(/^[A-ZÑ]$/.test(key)||key==='BACKSPACE'||key==='DELETE'){e.preventDefault();type(key);}
 else if(e.key==='Enter'){e.preventDefault();selectWord(selectedWord+1,true);}
 else if(e.key.startsWith('Arrow')){e.preventDefault();const [r,c]=selectedCell.split(',').map(Number),horizontal=['ArrowLeft','ArrowRight'].includes(e.key),dir=horizontal?'H':'V';const own=cells.get(selectedCell).words.find(i=>level.words[i].direction===dir);if(own!==undefined&&level.words[selectedWord].direction!==dir){selectedWord=own;refresh();return;}const next=coord(r+(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0),c+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0));if(cells.has(next)){selectedCell=next;if(!cells.get(next).words.includes(selectedWord))selectedWord=cells.get(next).words[0];refresh();scrollCell();}}
});
window.addEventListener('resize',sizeBoard);load(Number(saved.level)||1);
if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
