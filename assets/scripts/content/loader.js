import { markdownToHtml, parseFrontMatter, stripMarkdown } from './markdown.js';

function sortByDateDesc(items) {
    return [...items].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function sortByDateAsc(items) {
    return [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
}

async function fetchText(path) {
    const response = await fetch(path, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`No se pudo cargar ${path}`);
    }

    return response.text();
}

async function fetchJson(path) {
    const response = await fetch(path, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`No se pudo cargar ${path}`);
    }

    return response.json();
}

async function loadCollection(directory, transformItem, sorter) {
    const manifest = await fetchJson(`${directory}/index.json`);
    const files = Array.isArray(manifest.items) ? manifest.items : [];
    const items = await Promise.all(files.map(async (file) => {
        const raw = await fetchText(`${directory}/${file}`);
        const { metadata, body } = parseFrontMatter(raw);
        return transformItem({ metadata, body, file });
    }));

    return sorter(items);
}

function getSummary(metadata, body) {
    return metadata.summary || stripMarkdown(body).slice(0, 180).trim();
}

export async function loadNews() {
    return loadCollection('content/news', ({ metadata, body, file }) => ({
        id: file,
        title: metadata.title || 'Sin título',
        date: metadata.date || '',
        tag: metadata.tag || 'Noticias',
        summary: getSummary(metadata, body),
        body,
        bodyHtml: markdownToHtml(body)
    }), sortByDateDesc);
}

export async function loadEvents() {
    return loadCollection('content/events', ({ metadata, body, file }) => ({
        id: file,
        title: metadata.title || 'Sin título',
        date: metadata.date || '',
        time: metadata.time || 'Por confirmar',
        location: metadata.location || 'Lugar por confirmar',
        summary: getSummary(metadata, body),
        description: body,
        descriptionHtml: markdownToHtml(body)
    }), sortByDateAsc);
}
