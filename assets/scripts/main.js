import { events } from './data/events.js';
import { createCalendar } from './ui/calendar.js';

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
