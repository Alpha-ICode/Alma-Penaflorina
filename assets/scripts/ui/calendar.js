import { escapeText } from '../content/markdown.js';

const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function formatDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function sortEventsByDate(events) {
    return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function createCalendar({ events, elements }) {
    const {
        calendarTitle,
        calendarDays,
        selectedEvents,
        selectedDateLabel,
        upcomingEvents,
        prevMonth,
        nextMonth
    } = elements;

    const today = new Date();
    let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    let selectedDate = null;

    function getEventsForDate(dateString) {
        return events.filter((event) => event.date === dateString);
    }

    function renderUpcomingEvents() {
        const todayStr = today.toISOString().split('T')[0];
        const upcoming = sortEventsByDate(events)
            .filter((event) => event.date >= todayStr)
            .slice(0, 4);

        if (!upcoming.length) {
            upcomingEvents.innerHTML = '<p class="empty-state">No hay próximos eventos publicados por ahora.</p>';
            return;
        }

        upcomingEvents.innerHTML = upcoming.map((event) => `
            <div class="event-item">
                <strong>${escapeText(event.title)}</strong>
                <div>${formatDate(event.date)}</div>
                <div>${escapeText(event.time)} · ${escapeText(event.location)}</div>
            </div>
        `).join('');
    }

    function renderSelectedEvents() {
        if (!selectedDate) {
            selectedDateLabel.textContent = 'Selecciona una fecha';
            selectedEvents.innerHTML = '<p class="empty-state">Aquí aparecerán los eventos del día que selecciones en el calendario.</p>';
            return;
        }

        const items = getEventsForDate(selectedDate);
        selectedDateLabel.textContent = formatDate(selectedDate);

        if (!items.length) {
            selectedEvents.innerHTML = '<p class="empty-state">No hay eventos programados para este día.</p>';
            return;
        }

        selectedEvents.innerHTML = items.map((event) => `
            <div class="event-item">
                <strong>${escapeText(event.title)}</strong>
                <div>${escapeText(event.time)} · ${escapeText(event.location)}</div>
                <div class="event-description rich-text">${event.descriptionHtml || ''}</div>
            </div>
        `).join('');
    }

    function createDayCell(dayNumber, dateStr, muted) {
        const dayEvents = getEventsForDate(dateStr);
        const dateObj = new Date(`${dateStr}T00:00:00`);
        const isToday = today.toDateString() === dateObj.toDateString();
        const isSelected = selectedDate === dateStr;
        const preview = dayEvents.slice(0, 2).map((event) => `
            <span class="event-dot"></span>
            <div class="event-mini">${escapeText(event.title)}</div>
        `).join('');

        return `
            <div
                class="day ${muted ? 'muted' : ''} ${dayEvents.length ? 'has-event' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
                data-date="${dateStr}"
            >
                <div class="day-number">${dayNumber}</div>
                ${preview}
            </div>
        `;
    }

    function bindDaySelection() {
        document.querySelectorAll('.day').forEach((element) => {
            element.addEventListener('click', () => {
                selectedDate = element.dataset.date;
                renderCalendar();
                renderSelectedEvents();
            });
        });
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        calendarTitle.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);

        const firstWeekday = (firstDay.getDay() + 6) % 7;
        const totalDays = lastDay.getDate();
        const prevMonthDays = prevLastDay.getDate();
        const cells = [];

        for (let index = firstWeekday - 1; index >= 0; index -= 1) {
            const dayNum = prevMonthDays - index;
            const prevMonthDate = new Date(year, month - 1, dayNum);
            const dateStr = prevMonthDate.toISOString().split('T')[0];
            cells.push(createDayCell(dayNum, dateStr, true));
        }

        for (let day = 1; day <= totalDays; day += 1) {
            const dateObj = new Date(year, month, day);
            const dateStr = dateObj.toISOString().split('T')[0];
            cells.push(createDayCell(day, dateStr, false));
        }

        while (cells.length % 7 !== 0) {
            const nextDay = cells.length - (firstWeekday + totalDays) + 1;
            const nextMonthDate = new Date(year, month + 1, nextDay);
            const dateStr = nextMonthDate.toISOString().split('T')[0];
            cells.push(createDayCell(nextDay, dateStr, true));
        }

        calendarDays.innerHTML = cells.join('');
        bindDaySelection();
    }

    function changeMonth(offset) {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        renderCalendar();
    }

    prevMonth.addEventListener('click', () => changeMonth(-1));
    nextMonth.addEventListener('click', () => changeMonth(1));

    return {
        init() {
            renderUpcomingEvents();
            renderSelectedEvents();
            renderCalendar();
        }
    };
}
