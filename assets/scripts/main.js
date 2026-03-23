import { loadEvents, loadNews } from './content/loader.js';
import { escapeText } from './content/markdown.js';
import { createCalendar } from './ui/calendar.js';

function formatPublishedDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString('es-CL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function renderNews(newsItems) {
    const newsGrid = document.getElementById('newsGrid');

    if (!newsItems.length) {
        newsGrid.innerHTML = `
            <article class="card">
                <span class="news-tag">Sin noticias</span>
                <h3>Aún no hay publicaciones</h3>
                <p>Cuando agregues archivos en <strong>content/news</strong>, aparecerán aquí automáticamente.</p>
            </article>
        `;
        return;
    }

    newsGrid.innerHTML = newsItems.map((item) => `
        <article class="card">
            <span class="news-tag">${escapeText(item.tag)}</span>
            <h3>${escapeText(item.title)}</h3>
            <p>${escapeText(item.summary)}</p>
            <div class="meta">Publicado el ${formatPublishedDate(item.date)}</div>
        </article>
    `).join('');
}

function renderLoadError(message) {
    const newsGrid = document.getElementById('newsGrid');
    const upcomingEvents = document.getElementById('upcomingEvents');
    const selectedEvents = document.getElementById('selectedEvents');
    const selectedDateLabel = document.getElementById('selectedDateLabel');
    const calendarDays = document.getElementById('calendarDays');

    newsGrid.innerHTML = `
        <article class="card">
            <span class="news-tag">Error</span>
            <h3>No se pudo cargar el contenido</h3>
            <p>${escapeText(message)}</p>
        </article>
    `;

    upcomingEvents.innerHTML = `<p class="empty-state">${escapeText(message)}</p>`;
    selectedDateLabel.textContent = 'Contenido no disponible';
    selectedEvents.innerHTML = `<p class="empty-state">${escapeText(message)}</p>`;
    calendarDays.innerHTML = '<div class="calendar-error">No fue posible cargar el calendario.</div>';
}

async function init() {
    try {
        const [news, events] = await Promise.all([
            loadNews(),
            loadEvents()
        ]);

        renderNews(news);

        const calendar = createCalendar({
            events,
            elements: {
                calendarTitle: document.getElementById('calendarTitle'),
                calendarDays: document.getElementById('calendarDays'),
                selectedEvents: document.getElementById('selectedEvents'),
                selectedDateLabel: document.getElementById('selectedDateLabel'),
                upcomingEvents: document.getElementById('upcomingEvents'),
                prevMonth: document.getElementById('prevMonth'),
                nextMonth: document.getElementById('nextMonth')
            }
        });

        calendar.init();
    } catch (error) {
        console.error(error);
        renderLoadError('Revisa que el sitio se esté sirviendo desde un hosting o servidor local y que los archivos Markdown existan.');
    }
}

init();
