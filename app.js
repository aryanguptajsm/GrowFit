/* ==========================================================
   GrowFit — App (Stage 1: Visual UI)
   Only renders the UI with sample data for visual review.
   Real logic (storage, calculations) will be added later.
   ========================================================== */

// ─── Sample Data (for visual preview only) ─────────────────
const DEMO = {
  today: {
    exercised: false,
    exercises: []
  },
  streak: 5,
  totalWorkouts: 32,
  weekDays: [
    { label: 'MON', state: 'done' },
    { label: 'TUE', state: 'done' },
    { label: 'WED', state: 'missed' },
    { label: 'THU', state: 'done' },
    { label: 'FRI', state: 'done' },
    { label: 'SAT', state: 'done' },  // today
    { label: 'SUN', state: 'future' }
  ],
  // Days in September 2026 that had workouts
  workedOutDates: [1, 2, 4, 5, 7, 8, 9, 10, 12]
};


// ─── Initialization ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initGreeting();
  initTodayCard();
  initStats();
  initWeeklyTracker();
  initCalendar();
  initNavigation();
});


// ─── Greeting ──────────────────────────────────────────────
function initGreeting() {
  const el = document.getElementById('greeting-text');
  const hour = new Date().getHours();
  let greeting;

  if (hour < 12) greeting = 'Good morning 👋';
  else if (hour < 17) greeting = 'Good afternoon 👋';
  else greeting = 'Good evening 👋';

  el.textContent = greeting;
}


// ─── Today Card ────────────────────────────────────────────
function initTodayCard() {
  const dateEl = document.getElementById('today-date');
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  dateEl.textContent = now.toLocaleDateString('en-US', options);
}


// ─── Stats ─────────────────────────────────────────────────
function initStats() {
  document.getElementById('stat-streak').textContent = DEMO.streak;
  document.getElementById('stat-total').textContent = DEMO.totalWorkouts;

  // Count done days this week
  const doneDays = DEMO.weekDays.filter(d => d.state === 'done').length;
  document.getElementById('stat-week').textContent = `${doneDays} / 7`;
}


// ─── Weekly Tracker ────────────────────────────────────────
function initWeeklyTracker() {
  const container = document.getElementById('weekly-tracker');
  const todayIndex = 5; // Saturday = index 5 in our demo

  container.innerHTML = DEMO.weekDays.map((day, i) => {
    let stateClass = `week-day--${day.state}`;
    let todayClass = i === todayIndex ? 'week-day--today' : '';
    let icon = '';

    switch (day.state) {
      case 'done':   icon = '✓'; break;
      case 'missed': icon = '✕'; break;
      case 'future': icon = '○'; break;
    }

    return `
      <div class="week-day ${stateClass} ${todayClass}" data-day="${i}">
        <span class="week-day__label">${day.label}</span>
        <div class="week-day__indicator">${icon}</div>
      </div>
    `;
  }).join('');
}


// ─── Calendar ──────────────────────────────────────────────
let calendarYear = 2026;
let calendarMonth = 8; // September (0-indexed)

function initCalendar() {
  renderCalendar();

  document.getElementById('cal-prev').addEventListener('click', () => {
    calendarMonth--;
    if (calendarMonth < 0) {
      calendarMonth = 11;
      calendarYear--;
    }
    renderCalendar();
  });

  document.getElementById('cal-next').addEventListener('click', () => {
    calendarMonth++;
    if (calendarMonth > 11) {
      calendarMonth = 0;
      calendarYear++;
    }
    renderCalendar();
  });
}

function renderCalendar() {
  const container = document.getElementById('calendar');
  const label = document.getElementById('cal-month-label');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  label.textContent = `${monthNames[calendarMonth]} ${calendarYear}`;

  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const today = new Date();
  const todayDate = today.getDate();
  const isCurrentMonth = today.getFullYear() === calendarYear && today.getMonth() === calendarMonth;

  // Adjust firstDay: JS uses 0=Sun, we want 0=Mon
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  let html = `
    <div class="calendar__day-labels">
      <span class="calendar__day-label">Mon</span>
      <span class="calendar__day-label">Tue</span>
      <span class="calendar__day-label">Wed</span>
      <span class="calendar__day-label">Thu</span>
      <span class="calendar__day-label">Fri</span>
      <span class="calendar__day-label">Sat</span>
      <span class="calendar__day-label">Sun</span>
    </div>
    <div class="calendar__grid">
  `;

  // Empty cells before first day
  for (let i = 0; i < startOffset; i++) {
    html += `<div class="calendar__cell calendar__cell--empty"></div>`;
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    let cellClass = 'calendar__cell';
    const isToday = isCurrentMonth && day === todayDate;
    const isFuture = isCurrentMonth && day > todayDate;
    const isWorkedOut = DEMO.workedOutDates.includes(day);

    if (isToday) {
      cellClass += ' calendar__cell--today';
      if (isWorkedOut) cellClass += ' calendar__cell--done';
    } else if (isFuture) {
      cellClass += ' calendar__cell--future';
    } else if (isWorkedOut) {
      cellClass += ' calendar__cell--done';
    } else {
      cellClass += ' calendar__cell--missed';
    }

    html += `<div class="${cellClass}" data-date="${day}">${day}</div>`;
  }

  html += `</div>`;
  container.innerHTML = html;
}


// ─── Navigation ────────────────────────────────────────────
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPage = item.dataset.page;

      // Update nav
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Update pages
      pages.forEach(p => p.classList.remove('active'));
      document.getElementById(`page-${targetPage}`).classList.add('active');
    });
  });

  // "Log Exercise" button on home → navigates to exercise page
  document.getElementById('btn-log-exercise').addEventListener('click', () => {
    navItems.forEach(n => n.classList.remove('active'));
    document.querySelector('[data-page="exercise"]').classList.add('active');

    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('page-exercise').classList.add('active');
  });
}
