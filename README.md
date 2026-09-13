# Entreletras

Web app en español con 25 niveles originales: 13 crucigramas y 12 autodefinidos, alternados. Cinco bloques de dificultad editorial, de vocabulario cotidiano a terminología especializada. La dificultad es orientativa; no está calibrada con jugadores.

## Jugar

Abre `index.html` en un navegador. Para probar la instalación y el funcionamiento sin conexión, sirve esta carpeta con `python3 -m http.server 8080` y abre http://localhost:8080.

Incluye teclado físico y táctil, pistas dentro del tablero en los autodefinidos (tocables para ampliar), comprobación, revelado de letras, zoom, recorrido y guardado local. En tableros grandes puedes deslizar el tablero. Todos los niveles están disponibles, para poder saltar o repetir.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub, por ejemplo `entreletras`.
2. Sube **el contenido de esta carpeta** a la raíz del repositorio, incluido el archivo `.nojekyll`.
3. En **Settings → Pages → Build and deployment**, elige **Deploy from a branch**, rama **main**, carpeta **/(root)** y pulsa **Save**.
4. GitHub mostrará la dirección de la web al terminar la publicación: `https://TU-USUARIO.github.io/entreletras/`.

No hacen falta compilación, claves, plugins ni servidor propio. Todas las rutas son relativas para funcionar en subcarpetas de GitHub Pages.

## En el móvil

Abre la dirección publicada en Safari (iPhone) o Chrome (Android) y usa **Compartir → Añadir a pantalla de inicio** o la opción de instalación del menú. Tras una primera carga en línea, los archivos se almacenan para jugar sin conexión. La disponibilidad de instalación depende del navegador.

El progreso se almacena en el navegador del dispositivo: no se sincroniza entre móvil y ordenador y se pierde si borras sus datos. El modo privado puede impedir el guardado.

## Contenido y mantenimiento

`puzzles.js` contiene los 25 tableros completos, con soluciones y definiciones originales. `tools/create_puzzles.py` contiene el texto fuente y genera los cruces de forma determinista. `tools/validate_puzzles.py` comprueba los tableros, sus cruces, conectividad y posiciones de pista; ejecútalo con Python 3.

Se escriben las respuestas sin tildes. No se usa IA ni servicios externos durante el juego. Las soluciones se incluyen en el navegador, por lo que no es un juego competitivo con protección contra trampas.

Si cambias los archivos, incrementa el identificador de caché en `sw.js`. Las revisiones de vocabulario o tableros que invaliden partidas guardadas también deben cambiar `storageKey` en `app.js`.
