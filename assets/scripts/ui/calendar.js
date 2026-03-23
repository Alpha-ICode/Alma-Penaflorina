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
        upcomingEvents,
        prevMonth,
        nextMonth,
        eventModal,
        eventModalTitle,
        eventModalBody,
        eventModalClose
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

    function openModal() {
        eventModal.hidden = false;
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        eventModal.hidden = true;
        document.body.classList.remove('modal-open');
    }
    
    function renderModalContent() {
        if (!selectedDate) {
            eventModalTitle.textContent = 'Selecciona una fecha';
            eventModalBody.innerHTML = '<p class="empty-state">Selecciona un día del calendario para ver sus actividades.</p>';
            return;
        }

        const items = getEventsForDate(selectedDate);
        eventModalTitle.textContent = formatDate(selectedDate);

        if (!items.length) {
            eventModalBody.innerHTML = '<p class="empty-state">No hay eventos programados para este día.</p>';
            return;
        }

        eventModalBody.innerHTML = items.map((event) => `
            <article class="modal-event-item">
                <div class="modal-event-title">
                    <span class="event-dot"></span>
                    <strong>${escapeText(event.title)}</strong>
                </div>
                <div class="modal-event-meta">${escapeText(event.time)} · ${escapeText(event.location)}</div>
                <p class="modal-event-summary">${escapeText(event.summary)}</p>
            </article>
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
            <button
                class="day ${muted ? 'muted' : ''} ${dayEvents.length ? 'has-event' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
                data-date="${dateStr}"
                type="button"
                aria-label="${dayEvents.length ? `${formatDate(dateStr)} con ${dayEvents.length} evento${dayEvents.length > 1 ? 's' : ''}` : formatDate(dateStr)}"
            >
                <div class="day-number">${dayNumber}</div>
                <div class="day-events">${preview}</div>
            </button>
        `;
    }

    function bindDaySelection() {
        calendarDays.querySelectorAll('.day').forEach((element) => {
            element.addEventListener('click', () => {
                selectedDate = element.dataset.date;
                renderCalendar();
                renderModalContent();
                openModal();
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
    eventModalClose.addEventListener('click', closeModal);
    eventModal.addEventListener('click', (event) => {
        if (event.target === eventModal) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !eventModal.hidden) {
            closeModal();
        }
    });

    return {
        init() {
            renderUpcomingEvents();
            renderModalContent();
            renderCalendar();
        }
    };
}
