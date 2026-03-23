# Contenido editable

Este sitio ahora carga noticias y eventos desde archivos dentro de esta carpeta.

## Cómo agregar una noticia
1. Crea un archivo `.md` dentro de `content/news/`.
2. Usa este formato:

```md
---
title: Título de la noticia
date: 2026-03-23
tag: Comunidad
summary: Resumen corto que aparecerá en la tarjeta.
---
Texto de la noticia en **Markdown**.
```

3. Agrega el nombre del archivo a `content/news/index.json`.

## Cómo agregar un evento
1. Crea un archivo `.md` dentro de `content/events/`.
2. Usa este formato:

```md
---
title: Nombre del evento
date: 2026-04-20
time: 19:00 hrs
location: Peñaflor
summary: Resumen corto para listas y vista rápida.
---
Descripción del evento en **Markdown**.
```

3. Agrega el nombre del archivo a `content/events/index.json`.

## Importante
- Si el sitio se abre como archivo local (`file://`), el navegador puede bloquear la lectura de estos archivos.
- Para probarlo localmente usa un servidor simple, por ejemplo:

```bash
python3 -m http.server 4173
```

Luego abre `http://localhost:4173`.
