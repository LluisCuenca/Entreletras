"""Contenido original y generador determinista de los 100 tableros.

Los identificadores de los primeros 25 se conservan para mantener las partidas.
La posición visible es independiente del identificador persistente.
"""
import json, random, unicodedata
from pathlib import Path
DATA = '''Primeras letras
SOL|Estrella que ilumina la Tierra
CASA|Edificio donde vivimos
MESA|Mueble sobre el que comemos
GATO|Animal doméstico que maúlla
LUNA|Satélite natural de la Tierra
PAN|Alimento hecho con harina y horno
AGUA|Líquido que bebemos para hidratarnos
===En casa
SILLA|Asiento con respaldo
CAMA|Mueble para dormir
VASO|Recipiente para beber
PLATO|Pieza donde servimos la comida
SOFA|Asiento mullido para varias personas
PUERTA|Se abre para entrar en una habitación
RADIO|Aparato para escuchar emisoras
===El jardín
ROSA|Flor cuyo tallo suele tener espinas
ARBOL|Planta de tronco leñoso y copa
HOJA|Parte verde que brota de una rama
RAMA|Parte del árbol que nace del tronco
TIERRA|Suelo donde crecen las plantas
SEMILLA|Puede germinar y dar una nueva planta
REGAR|Echar agua a las plantas
===Buen provecho
ARROZ|Grano protagonista de la paella
SOPA|Plato líquido que se toma con cuchara
QUESO|Alimento obtenido al cuajar la leche
PERA|Fruta de cuello estrecho y base redondeada
SAL|Condimento que aporta sabor salado
TOMATE|Fruto rojo habitual en el gazpacho
LECHE|Bebida que se obtiene al ordeñar una vaca
===De paseo
CALLE|Vía urbana entre edificios
PARQUE|Zona pública con árboles y jardines
PLAZA|Espacio abierto rodeado de edificios
ACERA|Parte de la calle destinada a peatones
BANCO|Asiento alargado para varias personas
TIENDA|Local donde se venden productos
FAROLA|Poste de luz que ilumina una calle
===Vida animal
CONEJO|Mamífero de orejas largas que da saltos
JIRAFA|Animal africano de cuello muy largo
TORTUGA|Reptil protegido por un caparazón
PALOMA|Ave urbana que suele arrullar
CABALLO|Animal sobre el que monta un jinete
ABEJA|Insecto que produce miel
DELFIN|Mamífero marino de hocico alargado
ARDILLA|Roedor de cola poblada que trepa árboles
===Maleta lista
MALETA|Equipaje con asa para llevar ropa
BILLETE|Documento que permite viajar en un transporte
HOTEL|Establecimiento que aloja viajeros
MAPA|Representación de un territorio
PLAYA|Orilla de arena junto al mar
TREN|Transporte que circula sobre raíles
AVION|Vehículo con alas que transporta pasajeros
CAMINO|Vía por la que se puede andar
===Tiempo de jugar
PELOTA|Objeto esférico usado en muchos deportes
RAQUETA|Utensilio con cuerdas para golpear una bola
PORTERIA|Marco donde se marca un gol
CARRERA|Competición para llegar antes a una meta
EQUIPO|Grupo de jugadores del mismo bando
NATACION|Deporte que consiste en nadar
CANASTA|Aro con red del baloncesto
ARBITRO|Persona que aplica las reglas de un partido
===Entre fogones
SARTEN|Utensilio con mango para freír
CUCHARA|Cubierto para tomar caldo
HORNO|Recinto cerrado donde se asa o se hornea
RECETA|Instrucciones para preparar un plato
HARINA|Polvo obtenido al moler cereal
CEBOLLA|Hortaliza de capas que puede hacer llorar
ACEITE|Grasa líquida usada para cocinar
BATIR|Remover con energía para mezclar o airear
===Rumbo al campo
SENDERO|Camino estrecho para caminar
COLINA|Elevación del terreno menor que una montaña
PRADERA|Extensión de terreno cubierta de hierba
ARROYO|Corriente natural de agua de poco caudal
CASCADA|Caída de agua desde un desnivel
BOSQUE|Terreno con abundantes árboles
CUMBRE|Parte más alta de una montaña
VALLE|Terreno bajo entre montañas
===Palabras que cuentan
NOVELA|Narración literaria extensa en prosa
ESTROFA|Conjunto de versos de un poema
RIMA|Coincidencia de sonidos al final de versos
AUTOR|Persona que crea una obra
FABULA|Relato breve que suele acabar con una moraleja
INDICE|Lista que permite localizar partes de un libro
PORTADA|Cubierta delantera de un libro, en el uso común
DIALOGO|Conversación entre dos o más personajes
VERBO|Clase de palabra que expresa acción, estado o proceso
===El taller
MARTILLO|Herramienta para clavar y golpear
TORNILLO|Pieza roscada que sirve para sujetar
TUERCA|Pieza con orificio roscado que recibe un tornillo
ALICATE|Herramienta de dos brazos para agarrar o cortar
BARNIZ|Capa transparente que protege la madera
LIJA|Material abrasivo para alisar superficies
BROCA|Pieza del taladro que perfora
SERRUCHO|Sierra de mano con hoja ancha
BISAGRA|Herraje que permite girar una puerta
===A toda vela
BRUJULA|Instrumento cuya aguja señala el norte magnético
ESTRIBOR|Lado derecho de un barco mirando hacia proa
BABOR|Lado izquierdo de un barco mirando hacia proa
ANCLA|Pieza que fija una embarcación al fondo
TIMON|Pieza móvil con la que se gobierna el rumbo
MAREA|Ascenso y descenso periódico del nivel del mar
VELERO|Embarcación impulsada principalmente por el viento
CUBIERTA|Superficie de un barco por la que se camina
NAUFRAGIO|Pérdida de una embarcación al hundirse
===Oído fino
MELODIA|Sucesión de sonidos percibida como una unidad
COMPAS|División musical en tiempos regulares
ACORDE|Conjunto de notas que suenan simultáneamente
SOPRANO|Voz más aguda del registro femenino habitual
PARTITURA|Escritura en la que se representa una obra musical
BATUTA|Varilla con la que dirige una orquesta
SILENCIO|Signo musical que indica una pausa
OCTAVA|Intervalo entre una nota y su repetición más próxima en otro registro
TIMBRE|Cualidad sonora que distingue voces e instrumentos
===Mira al cielo
ORBITA|Trayectoria de un cuerpo alrededor de otro por gravedad
COMETA|Cuerpo helado que puede mostrar cola al acercarse al Sol
NEBULOSA|Nube interestelar de gas y polvo
ECLIPSE|Ocultación total o parcial de un astro por otro
GALAXIA|Gran sistema de estrellas, gas y polvo
CENIT|Punto del cielo situado justo sobre el observador
CRATER|Depresión circular producida, por ejemplo, por un impacto
SATELITE|Cuerpo que gira alrededor de un planeta
METEORO|Fenómeno luminoso de una partícula al entrar en la atmósfera
===Piedra y espacio
DINTEL|Pieza horizontal que cubre un vano por arriba
BOVEDA|Cubierta arquitectónica de superficie curva
COLUMNA|Soporte vertical generalmente cilíndrico
FACHADA|Cara exterior principal de un edificio
CORNISA|Remate saliente en la parte superior de un muro
CIMIENTO|Parte de una construcción que transmite su carga al terreno
CLAUSTRO|Galería que rodea un patio, habitual en monasterios
UMBRAL|Parte inferior de la entrada de una puerta
ARQUIVOLTA|Moldura que sigue la curva de un arco
ROSETON|Ventana circular ornamentada, típica del gótico
===Materia viva
CELULA|Unidad estructural y funcional básica de los seres vivos
TEJIDO|Conjunto organizado de células con una función común
ENZIMA|Catalizador biológico, generalmente proteico
NEURONA|Célula especializada en transmitir información nerviosa
GENOMA|Conjunto del material genético de un organismo
MITOSIS|División nuclear que conserva el número de cromosomas
OSMOSIS|Paso de disolvente a través de una membrana semipermeable
SIMBIOSIS|Asociación íntima y persistente entre especies distintas
ESTOMA|Poro de la epidermis vegetal que permite intercambio gaseoso
CLOROFILA|Pigmento verde que capta luz para la fotosíntesis
===El arte de decir
METAFORA|Figura que identifica una realidad con otra por semejanza
ANAFORA|Repetición de palabras al comienzo de enunciados sucesivos
HIPERBOLE|Exageración expresiva de lo que se dice
IRONIA|Expresión que deja entender algo distinto, a menudo lo contrario
ELIPSIS|Omisión de elementos que se sobreentienden
ANTITESIS|Contraposición de ideas o expresiones opuestas
SONETO|Poema de catorce versos en su forma clásica
EPITETO|Adjetivo que destaca una cualidad característica del sustantivo
PARADOJA|Idea aparentemente contradictoria que puede encerrar sentido
SINESTESIA|Figura que combina sensaciones de sentidos diferentes
===Huellas del pasado
PALEOGRAFIA|Disciplina que estudia las escrituras antiguas
NUMISMATICA|Estudio de monedas y medallas
ESTRATO|Capa de terreno distinguible de las contiguas
VESTIGIO|Indicio que queda de algo pasado
DINASTIA|Sucesión de soberanos de una misma familia
NECROPOLIS|Cementerio de gran extensión, especialmente antiguo
ANFORA|Vasija de dos asas usada en la Antigüedad
DOLMEN|Monumento megalítico con una losa sobre piedras verticales
CARTELA|Recuadro que contiene una inscripción o leyenda
PALEOLITICO|Periodo prehistórico de la piedra tallada
===Planeta inquieto
ISOBARA|Línea que une puntos con igual presión atmosférica
ALBEDO|Proporción de radiación que refleja una superficie
SOLSTICIO|Momento anual de máxima o mínima declinación solar
EQUINOCCIO|Momento en que el Sol cruza el ecuador celeste
PERMAFROST|Suelo que permanece congelado al menos dos años seguidos
ESTUARIO|Desembocadura fluvial abierta y afectada por las mareas
SEDIMENTO|Material que se deposita tras ser transportado
ACUIFERO|Formación geológica que almacena y transmite agua subterránea
FUMAROLA|Emisión de gases y vapores por una abertura volcánica
SUBDUCCION|Hundimiento de una placa tectónica bajo otra
===La lógica oculta
AXIOMA|Proposición que se acepta como punto de partida
TEOREMA|Proposición demostrada a partir de otras aceptadas
COROLARIO|Resultado que se deduce fácilmente de otro ya demostrado
ALGORITMO|Secuencia finita de instrucciones para resolver un problema
ISOMORFISMO|Correspondencia que preserva la estructura matemática
BIYECCION|Correspondencia uno a uno que cubre todo el conjunto de llegada
ASINTOTA|Recta a la que una curva se aproxima indefinidamente
TANGENTE|Recta que comparte la dirección local de una curva en un punto
ESCALAR|Magnitud expresada por un valor sin dirección
CONJETURA|Afirmación que se considera cierta pero aún no está demostrada
INVARIANTE|Propiedad que permanece bajo determinadas transformaciones
===Oficio de palabras
PALIMPSESTO|Manuscrito reutilizado tras borrar su escritura anterior
INCUNABLE|Libro impreso en Europa antes de 1501
COLOFON|Nota final de un libro con datos de su impresión
APOCRIFO|Texto cuya atribución de autoría no se considera auténtica
ECDOTICA|Disciplina que estudia la edición crítica de textos
GLOSA|Explicación o comentario de un texto oscuro
EXLIBRIS|Marca que identifica al propietario de un libro
ACROSTICO|Composición cuyas iniciales forman una palabra o frase
PARATEXTO|Elementos que acompañan al texto, como prólogos y títulos
LEXICOGRAFIA|Disciplina dedicada a elaborar y estudiar diccionarios
HAPAX|Palabra documentada una sola vez en un corpus dado
===Ideas en juego
EPISTEMOLOGIA|Estudio de los fundamentos y métodos del conocimiento científico
ONTOLOGIA|Parte de la metafísica que estudia el ser
HEURISTICA|Procedimiento que ayuda a descubrir soluciones sin garantizarlas
SILOGISMO|Razonamiento deductivo con dos premisas y una conclusión
APORIA|Dificultad racional que parece no tener salida
TELEOLOGIA|Explicación de los fenómenos por sus fines
SOLIPSISMO|Posición que solo admite con certeza la existencia del propio yo
MAYEUTICA|Método de preguntas asociado a Sócrates para alumbrar ideas
TAUTOLOGIA|Fórmula lógica verdadera bajo toda interpretación
DIALECTICA|Método de razonamiento que confronta posiciones
NOUMENO|En Kant, la cosa considerada al margen de su aparición sensible
===Gabinete de rarezas
PETRICOR|Olor característico de la lluvia al caer sobre suelo seco
ARREBOL|Color rojizo de las nubes iluminadas por el sol
NEFELIBATA|Persona soñadora que parece vivir ajena a la realidad
INEFABLE|Que no puede expresarse con palabras
ATARAXIA|Estado de serenidad e imperturbabilidad del ánimo
SERENDIPIA|Hallazgo valioso que se produce de manera accidental
LIMERENCIA|Estado de intensa atracción romántica con pensamientos intrusivos
OPALESCENCIA|Reflejo de tonos irisados semejante al del ópalo
PALINDROMO|Expresión que se lee igual en ambos sentidos
ANACRONISMO|Elemento situado en una época que no le corresponde
UBICUIDAD|Cualidad de estar presente en todas partes
===La última clave
ANFIBOLOGIA|Ambigüedad de una expresión que admite varias interpretaciones
ZEUGMA|Omisión de un término ya expresado al que se vinculan otros elementos
ENTIMEMA|Silogismo en el que se sobreentiende una premisa o la conclusión
HIPALAGE|Figura que atribuye a una palabra lo que corresponde a otra cercana
ANAGNORISIS|Reconocimiento que revela una identidad crucial en una narración
PERIPECIA|Cambio repentino de situación en una acción dramática
EPIFONEMA|Exclamación que cierra un discurso sintetizando su sentido
APOTEGMA|Dicho breve y memorable atribuido a una persona ilustre
PARONOMASIA|Juego expresivo con palabras de sonido parecido
QUIASMO|Ordenación cruzada de elementos en dos secuencias
SINCOPA|Supresión de uno o varios sonidos dentro de una palabra
METONIMIA|Designación por un término relacionado, como el autor por la obra'''

def norm(s):
    text = unicodedata.normalize('NFD', s.replace(' ', '').upper()).replace('N\u0303', 'Ñ')
    return ''.join(c for c in text if unicodedata.category(c) != 'Mn')

def generate(entries,seed):
    best=None
    for attempt in range(2000):
        if best and attempt >= 64:
            break
        rng=random.Random(seed*1000+attempt)
        todo=list(entries); rng.shuffle(todo); todo.sort(key=lambda e:-len(e[0]))
        grid={}; reserved=set(); placed=[]; dirs={}
        def valid(word,r,c,d):
            dr,dc=(0,1) if d=='H' else (1,0)
            before=(r-dr,c-dc); after=(r+dr*len(word),c+dc*len(word))
            if before in grid or after in grid:return None
            crosses=0
            for i,ch in enumerate(word):
                p=(r+dr*i,c+dc*i)
                if p in reserved:return None
                if p in grid:
                    if grid[p]!=ch or d in dirs[p]:return None
                    crosses+=1
                elif any(q in grid for q in [(p[0]+dc,p[1]+dr),(p[0]-dc,p[1]-dr)]):return None
            if placed and not crosses:return None
            coords=list(grid)+[(r,c),(r+dr*(len(word)-1),c+dc*(len(word)-1)),before]
            height=max(p[0] for p in coords)-min(p[0] for p in coords)+1
            width=max(p[1] for p in coords)-min(p[1] for p in coords)+1
            return height*width+abs(height-width)*4-crosses*8+rng.random()*5
        while todo:
            candidates=[]
            for e in todo:
                word=e[0]
                if not placed:candidates.append((0,e,0,0,'H'));continue
                for p,ch in list(grid.items()):
                    for i,wc in enumerate(word):
                        if wc!=ch:continue
                        for d in ['H','V']:
                            r,c=p[0]-(i if d=='V' else 0),p[1]-(i if d=='H' else 0)
                            score=valid(word,r,c,d)
                            if score is not None:candidates.append((score,e,r,c,d))
            if not candidates:break
            ranked = sorted(candidates, key=lambda x: x[0])
            choice = ranked[0] if attempt < 32 else rng.choice(ranked[:min(8, len(ranked))])
            _,e,r,c,d=choice;todo.remove(e)
            dr,dc=(0,1) if d=='H' else (1,0)
            reserved.add((r-dr,c-dc))
            for i,ch in enumerate(e[0]):
                p=(r+dr*i,c+dc*i);grid[p]=ch;dirs.setdefault(p,set()).add(d)
            placed.append(dict(answer=e[0],clue=e[1],row=r,col=c,direction=d))
        if todo:continue
        coords=list(grid)+list(reserved); r0=min(p[0] for p in coords);c0=min(p[1] for p in coords)
        h=max(p[0] for p in coords)-r0+1;w=max(p[1] for p in coords)-c0+1
        if best is None or h*w<best['rows']*best['cols']:
            for e in placed:e['row']-=r0;e['col']-=c0
            placed.sort(key=lambda e:(e['row'],e['col'],e['direction']))
            starts={p:i+1 for i,p in enumerate(sorted(set((e['row'],e['col']) for e in placed)))}
            for e in placed:e['number']=starts[e['row'],e['col']]
            best=dict(rows=h,cols=w,words=placed)
        if attempt>30 and best and max(h,w)<18:break
    assert best, (seed,entries)
    return best

def build():
    root = Path(__file__).resolve().parents[1]
    # Reuse shipped grids verbatim. Regenerating a published board would break saves.
    existing = {}
    output = root / 'puzzles.js'
    if output.exists():
        existing = {p['id']: p for p in json.loads(output.read_text().removeprefix('window.PUZZLES = ').strip().removesuffix(';'))}
    original = []
    for i, block in enumerate(DATA.split('===')):
        title, *lines = block.strip().splitlines()
        entries = [(norm(line.split('|')[0]), line.split('|')[1]) for line in lines]
        puzzle = existing.get(i + 1) or generate(entries, i + 1)
        puzzle.update(id=i + 1, title=title, type='crossword' if i % 2 == 0 else 'arrowword', difficulty=min(5, i // 5 + 1))
        original.append(puzzle)

    extra = []
    blocks = root.joinpath('tools/new_puzzles.txt').read_text().split('===')
    assert len(blocks) == 75, f'Expected 75 new puzzles, got {len(blocks)}'
    for i, block in enumerate(blocks):
        header, *lines = block.strip().splitlines()
        difficulty, title = header.split('|', 1)
        entries = [(norm(line.split('|')[0]), line.split('|')[1]) for line in lines]
        assert len({word for word, clue in entries}) == len(entries), title
        assert all(word.isalpha() and len(word) >= 3 and clue for word, clue in entries), title
        puzzle = existing.get(i + 26) or generate(entries, i + 26)
        puzzle.update(id=i + 26, title=title, difficulty=int(difficulty))
        extra.append(puzzle)
        print(i + 26, title, puzzle['rows'], puzzle['cols'], flush=True)

    levels = []
    for difficulty in range(1, 6):
        legacy = [p for p in original if p['difficulty'] == difficulty]
        added = [p for p in extra if p['difficulty'] == difficulty]
        assert len(legacy) == 5 and len(added) == 15
        # Start each 20-level chapter horizontally. Preserve the old puzzle formats.
        if legacy[0]['type'] == 'arrowword':
            chapter = added[:1] + legacy + added[1:]
        else:
            chapter = legacy + added
        for puzzle in chapter:
            kind = 'crossword' if len(levels) % 2 == 0 else 'arrowword'
            if puzzle['id'] <= 25:
                assert puzzle['type'] == kind
            puzzle['type'] = kind
            levels.append(puzzle)
    assert len(levels) == 100
    output.write_text('window.PUZZLES = ' + json.dumps(levels, ensure_ascii=False) + ';\n')

if __name__ == '__main__':
    build()
