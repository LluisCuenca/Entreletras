# Entreletras

Web app en español con 25 niveles originales: 13 crucigramas y 12 autodefinidos, alternados. Cinco bloques de dificultad editorial, de vocabulario cotidiano a terminología especializada. La dificultad es orientativa; no está calibrada con jugadores.

## Jugar

Abre `index.html` en un navegador. Para probar la instalación y el funcionamiento sin conexión, sirve esta carpeta con `python3 -m http.server 8080` y abre http://localhost:8080.

Incluye teclado físico y táctil, pistas dentro del tablero en los autodefinidos (tocables para ampliar), comprobación, revelado de letras, deshacer, zoom, recorrido y guardado local. En tableros grandes puedes deslizar el tablero; la casilla activa sigue visible al escribir. Todos los niveles están disponibles, para poder saltar o repetir.

## Interfaz revisada

- Marca tipográfica, sin símbolo, conservando la tipografía de la cabecera. Iconos de aplicación con la inicial «e.».
- El recorrido se abre desde la cabecera y agrupa los 25 niveles por dificultad, con nombre, formato y estado.
- La lista de pistas se puede plegar en ordenador y se abre como ventana en móvil. Las definiciones completas siguen visibles bajo el tablero.
- La altura del tablero se adapta al espacio que dejan el título, la pista y el teclado. Los márgenes vacíos exteriores se recortan visualmente en crucigramas, sin cambiar coordenadas ni partidas.
- Opciones reúne la ayuda, el reinicio del nivel y la preferencia de teclado. El teclado aparece por defecto en pantallas pequeñas o táctiles y se puede activar también en ordenador.
- Deshacer revierte hasta 100 ediciones por nivel durante la sesión; las ayudas usadas siguen contando. Ctrl/⌘ Z también funciona. No se conserva el historial de deshacer al recargar.
- Se recuerda la casilla activa y la dirección. Los guardados anteriores siguen siendo compatibles. Las partidas completas se protegen de ediciones accidentales; pueden repetirse mediante Reiniciar.
- Comprobar marca errores con color y «!». Una corrección borra solo la comprobación de esa casilla. El contador de letras representa el avance escrito, sin adelantar si una respuesta es correcta.
- Los archivos sin conexión se guardan por versión y por ruta, para no mezclar aplicaciones en un mismo dominio. Las futuras actualizaciones muestran un aviso para recargar sin perder la partida.

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

`puzzles.js` contiene los 25 tableros completos, con soluciones y definiciones originales. `tools/create_puzzles.py` contiene el texto fuente y genera los cruces de forma determinista. `tools/validate_puzzles.py` comprueba los tableros, sus cruces, conectividad y posiciones de pista; ejecútalo con Python 3. `core.js` contiene las reglas de guardado, edición, deshacer y resolución; ejecuta sus pruebas con `node --test tools/test_core.cjs tools/test_sw.cjs`.

La revisión conserva los 25 tableros y las 226 respuestas. Se han probado en navegador ambos tipos de juego completos, el recorrido de los 25 niveles, las pistas móviles, la recuperación de la selección y el funcionamiento sin el servidor conectado. Se ha comprobado el diseño a 360, 390 y 1440 píxeles de ancho; esto no sustituye una prueba en dispositivos físicos.

`tools/create_icons.py` genera los iconos tipográficos con Pillow y Arial Bold de macOS. No es necesario ejecutar este script para publicar ni para jugar.

Se escriben las respuestas sin tildes. No se usa IA ni servicios externos durante el juego. Las soluciones se incluyen en el navegador, por lo que no es un juego competitivo con protección contra trampas.

Si cambias archivos de la aplicación, incrementa el identificador de caché en `sw.js`. Para ver cambios mientras desarrollas con un servidor local, recarga, deja que se instale la nueva versión y pulsa Actualizar cuando aparezca el aviso. Las revisiones de vocabulario o tableros que invaliden partidas guardadas también deben cambiar `storageKey` en `app.js` o incluir una migración.
