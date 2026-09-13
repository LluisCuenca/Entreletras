# Entreletras

Web app en español con 100 niveles originales: 50 crucigramas y 50 autodefinidos, alternados, con 901 respuestas. Cinco bloques de 20 niveles de dificultad editorial creciente, de vocabulario cotidiano a terminología especializada. La dificultad es orientativa; no está calibrada con jugadores.

## Jugar

Abre `index.html` en un navegador. Para probar la instalación y el funcionamiento sin conexión, sirve esta carpeta con `python3 -m http.server 8080` y abre http://localhost:8080.

Incluye teclado físico y táctil, pistas dentro del tablero en los autodefinidos (tocables para ampliar), comprobación, revelado de letras, deshacer, zoom, recorrido y guardado local. En tableros grandes puedes deslizar el tablero; la casilla activa sigue visible al escribir. Todos los niveles están disponibles, para poder saltar o repetir.

## Interfaz revisada

- Marca tipográfica, sin símbolo, conservando la tipografía de la cabecera. Iconos de aplicación con la inicial «e.».
- El recorrido se abre desde la cabecera y agrupa los 100 niveles por dificultad, con nombre, formato y estado. Los cinco grupos son desplegables; el grupo del nivel activo aparece abierto.
- En escritorio la distribución utiliza todo el ancho disponible. El panel de pistas mantiene un ancho proporcional y al ocultarlo el tablero y sus controles se extienden al espacio liberado.
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

`puzzles.js` contiene los 100 tableros completos, con soluciones y definiciones originales. `tools/create_puzzles.py` contiene los 25 niveles iniciales y el generador; `tools/new_puzzles.txt` contiene las 75 incorporaciones. El generador reutiliza las cuadrículas publicadas para conservar las partidas. `tools/validate_puzzles.py` comprueba los tableros, sus cruces, conectividad, posiciones de pista, alternancia y orden de dificultad; ejecútalo con Python 3. `core.js` contiene las reglas de guardado, edición, deshacer y resolución; ejecuta sus pruebas con `node --test tools/test_core.cjs tools/test_sw.cjs`.

Los 25 tableros originales y sus 226 respuestas se conservan exactamente. Sus identificadores de guardado siguen siendo los mismos, aunque algunos cambian de número visible al intercalarse los nuevos tableros. La navegación utiliza la posición dentro del recorrido; las partidas usan el identificador estable. Una prueba de regresión verifica la integridad de los 25 tableros originales y la recuperación de sus partidas.

Verificación de esta ampliación: 100 tableros y 901 respuestas validados, diez pruebas de reglas y caché superadas, navegación completa del nivel 1 al 100 en navegador y revisión visual a 1920, 2560 y 390 píxeles de ancho. En móvil se ha comprobado también el selector desplegable y la visibilidad de la casilla activa del nivel 100.

`tools/create_icons.py` genera los iconos tipográficos con Pillow y Arial Bold de macOS. No es necesario ejecutar este script para publicar ni para jugar.

Se escriben las respuestas sin tildes. No se usa IA ni servicios externos durante el juego. Las soluciones se incluyen en el navegador, por lo que no es un juego competitivo con protección contra trampas.

Si cambias archivos de la aplicación, incrementa el identificador de caché en `sw.js`. Para ver cambios mientras desarrollas con un servidor local, recarga, deja que se instale la nueva versión y pulsa Actualizar cuando aparezca el aviso. Las revisiones de vocabulario o tableros que invaliden partidas guardadas también deben cambiar `storageKey` en `app.js` o incluir una migración.
