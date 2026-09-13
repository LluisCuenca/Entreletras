import json
from pathlib import Path
from create_puzzles import norm
root=Path(__file__).resolve().parents[1]
levels=json.loads((root/'puzzles.js').read_text().removeprefix('window.PUZZLES = ').strip().removesuffix(';'))
assert len(levels)==100
assert len({l['id'] for l in levels}) == 100
assert len({l['title'] for l in levels}) == 100
assert sorted(l['id'] for l in levels) == list(range(1, 101))
assert len({tuple(sorted(w['answer'] for w in l['words'])) for l in levels}) == 100
by_id = {level['id']: level for level in levels}
for i, block in enumerate((root / 'tools/new_puzzles.txt').read_text().split('===')):
 header, *lines = block.strip().splitlines()
 difficulty, title = header.split('|', 1)
 level = by_id[26 + i]
 assert level['title'] == title and level['difficulty'] == int(difficulty)
 expected = {(norm(line.split('|')[0]), line.split('|')[1]) for line in lines}
 assert {(word['answer'], word['clue']) for word in level['words']} == expected, title
for n,l in enumerate(levels,1):
 assert l['type']==('crossword' if n%2 else 'arrowword')
 assert l['difficulty']==(n-1)//20+1
 cells={}; owners={}; clues=[]; paths=[]
 for i,w in enumerate(l['words']):
  assert w['answer'].isalpha() and w['answer'].isupper() and w['clue']
  dr,dc=(0,1) if w['direction']=='H' else (1,0)
  path=[]
  for j,ch in enumerate(w['answer']):
   p=(w['row']+dr*j,w['col']+dc*j)
   assert 0<=p[0]<l['rows'] and 0<=p[1]<l['cols']
   assert p not in cells or cells[p]==ch
   cells[p]=ch;owners.setdefault(p,[]).append(i);path.append(p)
  paths.append(path);clues.append((w['row']-dr,w['col']-dc))
  assert len(w['answer'])>=3
 for p in clues:assert p not in cells and 0<=p[0]<l['rows'] and 0<=p[1]<l['cols']
 for i,w in enumerate(l['words']):
  dr,dc=(0,1) if w['direction']=='H' else (1,0)
  assert (paths[i][-1][0]+dr,paths[i][-1][1]+dc) not in cells
  assert any(len(owners[p])>1 for p in paths[i])
  for p in paths[i]:
   if len(owners[p])==1:
    assert (p[0]+dc,p[1]+dr) not in cells
    assert (p[0]-dc,p[1]-dr) not in cells
 seen={0}
 while True:
  more={i for p,ids in owners.items() if seen.intersection(ids) for i in ids}
  if more<=seen:break
  seen|=more
 assert len(seen)==len(l['words'])
 for ids in owners.values():
  assert len(ids)<=2
  assert len(set(l['words'][i]['direction'] for i in ids))==len(ids)
print(f"OK: {len(levels)} tableros, {sum(len(l['words']) for l in levels)} palabras; cruces, conectividad, límites, pistas y alternancia correctos.")
