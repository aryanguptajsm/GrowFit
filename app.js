/* ==========================================================
   GrowFit — App
   Stage 2: Functional exercise logging + navigation
   ========================================================== */

// ─── Data Layer ────────────────────────────────────────────
// All data stored in localStorage under these keys
const STORAGE_KEYS = {
  workouts: 'growfit_workouts',     // { "2026-09-12": { exercises: [...], restDay: false } }
  weightRecords: 'growfit_weight',  // [{ date, weight, height }]
  settings: 'growfit_settings'      // { startDate: '2026-09-13', units: 'kg' }
};

function loadData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Get all workouts object
function getWorkouts() {
  return loadData(STORAGE_KEYS.workouts) || {};
}

// Save all workouts
function saveWorkouts(workouts) {
  saveData(STORAGE_KEYS.workouts, workouts);
}

// Get workout for a specific date string "YYYY-MM-DD"
function getWorkoutForDate(dateStr) {
  const workouts = getWorkouts();
  return workouts[dateStr] || null;
}

// Save a single day's workout
function saveWorkoutForDate(dateStr, workout) {
  const workouts = getWorkouts();
  workouts[dateStr] = workout;
  saveWorkouts(workouts);
}


// ─── Date Helpers ──────────────────────────────────────────
function todayStr() {
  return formatDate(new Date());
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateReadable(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}


// ─── Streak & Stats Calculations ───────────────────────────
function calculateStats() {
  const workouts = getWorkouts();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = todayStr();

  // All workout dates sorted descending
  const workedDates = Object.keys(workouts)
    .filter(d => {
      const w = workouts[d];
      return w.exercises && w.exercises.length > 0;
    })
    .sort()
    .reverse();

  const totalWorkouts = workedDates.length;

  // Current streak: count consecutive days ending at today (or yesterday if no workout today)
  let currentStreak = 0;
  let checkDate = new Date(today);

  // If today has no workout, start checking from yesterday
  if (!workedDates.includes(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = formatDate(checkDate);
    if (workedDates.includes(key)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Longest streak
  let longestStreak = 0;
  if (workedDates.length > 0) {
    const sorted = [...workedDates].sort();
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak++;
      } else {
        longestStreak = Math.max(longestStreak, streak);
        streak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, streak);
  }

  // This week count
  const monday = getMonday(today);
  let thisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = formatDate(d);
    if (workedDates.includes(key)) thisWeek++;
  }

  // This month count
  let thisMonth = 0;
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    if (workedDates.includes(formatDate(d))) thisMonth++;
  }

  return { totalWorkouts, currentStreak, longestStreak, thisWeek, thisMonth };
}


// ─── Personal Records ──────────────────────────────────────
function calculatePersonalRecords() {
  const workouts = getWorkouts();
  const records = {}; // { "Push-ups": { bestReps: 25, bestSets: 5, bestDuration: null } }

  Object.values(workouts).forEach(day => {
    if (!day.exercises) return;
    day.exercises.forEach(ex => {
      const name = ex.name;
      if (!records[name]) {
        records[name] = { bestReps: 0, bestDuration: 0 };
      }
      if (ex.reps && ex.reps > records[name].bestReps) {
        records[name].bestReps = ex.reps;
      }
      if (ex.duration && ex.duration > records[name].bestDuration) {
        records[name].bestDuration = ex.duration;
      }
    });
  });

  return records;
}


function getStartDate() {
  const settings = loadData(STORAGE_KEYS.settings) || {};
  if (!settings.startDate) {
    settings.startDate = todayStr();
    saveData(STORAGE_KEYS.settings, settings);
  }
  return new Date(settings.startDate + 'T00:00:00');
}

// ─── UUID Generator ────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}


// ─── Toast Notifications ──────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}


// ─── Modal System ──────────────────────────────────────────
function openModal(title, bodyHTML) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHTML;
  document.getElementById('modal-overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}


// ─── Initialization ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initModalEvents();
  renderHome();
  renderExercisePage();
  renderProgressPage();
});


// ─── Navigation ────────────────────────────────────────────
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPage = item.dataset.page;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      pages.forEach(p => p.classList.remove('active'));
      document.getElementById(`page-${targetPage}`).classList.add('active');

      // Refresh page content on switch
      if (targetPage === 'home') renderHome();
      else if (targetPage === 'exercise') renderExercisePage();
      else if (targetPage === 'progress') renderProgressPage();
    });
  });
}

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
    if (n.dataset.page === page) n.classList.add('active');
  });
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
}


// ─── Modal Events ──────────────────────────────────────────
function initModalEvents() {
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
}


// ════════════════════════════════════════════════════════════
//  HOME PAGE
// ════════════════════════════════════════════════════════════
function renderHome() {
  renderGreeting();
  renderTodayCard();
  renderStats();
  renderWeeklyTracker();
  renderCalendar();
}

function renderGreeting() {
  const el = document.getElementById('greeting-text');
  const hour = new Date().getHours();
  if (hour < 12) el.textContent = 'Good morning 👋';
  else if (hour < 17) el.textContent = 'Good afternoon 👋';
  else el.textContent = 'Good evening 👋';
}

function renderTodayCard() {
  const dateEl = document.getElementById('today-date');
  const statusEl = document.getElementById('today-status');
  const summaryEl = document.getElementById('workout-summary');
  const todayCard = document.getElementById('today-card');
  const btnLog = document.getElementById('btn-log-exercise');

  const now = new Date();
  dateEl.textContent = formatDateReadable(now);

  const workout = getWorkoutForDate(todayStr());
  const hasExercises = workout && workout.exercises && workout.exercises.length > 0;

  if (hasExercises) {
    todayCard.classList.add('today-card--completed');
    statusEl.innerHTML = `
      <span class="status-icon status-icon--done">✓</span>
      <span class="status-text">Exercise completed</span>
    `;
    summaryEl.classList.remove('hidden');
    document.getElementById('workout-count').textContent =
      `${workout.exercises.length} exercise${workout.exercises.length > 1 ? 's' : ''}`;
    btnLog.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Add More
    `;
  } else {
    todayCard.classList.remove('today-card--completed');
    statusEl.innerHTML = `
      <span class="status-icon status-icon--pending">○</span>
      <span class="status-text">No exercise yet</span>
    `;
    summaryEl.classList.add('hidden');
    btnLog.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Log Exercise
    `;
  }

  // Button navigates to exercise page
  btnLog.onclick = () => {
    navigateTo('exercise');
    renderExercisePage();
    openAddExerciseModal();
  };
}

function renderStats() {
  const stats = calculateStats();
  document.getElementById('stat-streak').textContent = stats.currentStreak;
  document.getElementById('stat-total').textContent = stats.totalWorkouts;
  document.getElementById('stat-week').textContent = `${stats.thisWeek} / 7`;
}


// ─── Weekly Tracker ────────────────────────────────────────
function renderWeeklyTracker() {
  const container = document.getElementById('weekly-tracker');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = getMonday(today);
  const workouts = getWorkouts();
  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const key = formatDate(d);
    const isToday = key === todayStr();
    const isFuture = d > today;
    const w = workouts[key];
    const hasExercise = w && w.exercises && w.exercises.length > 0;

    let state, icon;
    const startDate = getStartDate();
    startDate.setHours(0, 0, 0, 0);

    if (isFuture) {
      state = 'future'; icon = '○';
    } else if (hasExercise) {
      state = 'done'; icon = '✓';
    } else if (isToday) {
      state = 'future'; icon = '○'; // today not yet done
    } else if (d < startDate) {
      state = 'future'; icon = '○'; // before app install
    } else {
      state = 'missed'; icon = '✕';
    }

    const todayClass = isToday ? 'week-day--today' : '';

    html += `
      <div class="week-day week-day--${state} ${todayClass}" data-date="${key}">
        <span class="week-day__label">${dayLabels[i]}</span>
        <div class="week-day__indicator">${icon}</div>
      </div>
    `;
  }

  container.innerHTML = html;

  // Tap a day to view exercises
  container.querySelectorAll('.week-day').forEach(el => {
    el.addEventListener('click', () => {
      const dateKey = el.dataset.date;
      showDayDetail(dateKey);
    });
  });
}


// ─── Calendar ──────────────────────────────────────────────
let calendarYear, calendarMonth;

function initCalendarDate() {
  const now = new Date();
  calendarYear = now.getFullYear();
  calendarMonth = now.getMonth();
}

function renderCalendar() {
  if (calendarYear === undefined) initCalendarDate();

  const container = document.getElementById('calendar');
  const label = document.getElementById('cal-month-label');
  const workouts = getWorkouts();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  label.textContent = `${monthNames[calendarMonth]} ${calendarYear}`;

  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isCurrentMonth = today.getFullYear() === calendarYear && today.getMonth() === calendarMonth;

  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  let html = `
    <div class="calendar__day-labels">
      <span class="calendar__day-label">Mo</span>
      <span class="calendar__day-label">Tu</span>
      <span class="calendar__day-label">We</span>
      <span class="calendar__day-label">Th</span>
      <span class="calendar__day-label">Fr</span>
      <span class="calendar__day-label">Sa</span>
      <span class="calendar__day-label">Su</span>
    </div>
    <div class="calendar__grid">
  `;

  for (let i = 0; i < startOffset; i++) {
    html += `<div class="calendar__cell calendar__cell--empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(calendarYear, calendarMonth, day);
    const key = formatDate(d);
    const isToday = isCurrentMonth && d.getTime() === today.getTime();
    const isFuture = d > today;
    const w = workouts[key];
    const hasExercise = w && w.exercises && w.exercises.length > 0;

    let cellClass = 'calendar__cell';
    if (isToday) cellClass += ' calendar__cell--today';

    const startDate = getStartDate();
    startDate.setHours(0, 0, 0, 0);

    if (isFuture) {
      cellClass += ' calendar__cell--future';
    } else if (hasExercise) {
      cellClass += ' calendar__cell--done';
    } else if (d < startDate && !isToday) {
       // before app install, don't mark as missed
       cellClass += ' calendar__cell--future';
    } else if (!isToday) {
      cellClass += ' calendar__cell--missed';
    }

    html += `<div class="${cellClass}" data-date="${key}">${day}</div>`;
  }

  html += `</div>`;
  container.innerHTML = html;

  // Tap a date to view
  container.querySelectorAll('.calendar__cell:not(.calendar__cell--empty)').forEach(el => {
    el.addEventListener('click', () => {
      showDayDetail(el.dataset.date);
    });
  });

  // Nav buttons
  document.getElementById('cal-prev').onclick = () => {
    calendarMonth--;
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    renderCalendar();
  };
  document.getElementById('cal-next').onclick = () => {
    calendarMonth++;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    renderCalendar();
  };
}


// ─── Day Detail Modal ──────────────────────────────────────
function showDayDetail(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const readable = formatDateReadable(d);
  const workout = getWorkoutForDate(dateStr);

  let body = '';
  if (workout && workout.exercises && workout.exercises.length > 0) {
    body = workout.exercises.map(ex => `
      <div class="exercise-item" style="pointer-events:none;">
        <div class="exercise-item__info">
          <div class="exercise-item__name">${ex.name}</div>
          <div class="exercise-item__detail">${formatExerciseDetail(ex)}</div>
        </div>
      </div>
    `).join('');
  } else {
    body = `<p style="color: var(--text-muted); text-align: center; padding: 24px 0;">No exercises recorded.</p>`;
  }

  openModal(readable, body);
}


// ════════════════════════════════════════════════════════════
//  EXERCISE PAGE
// ════════════════════════════════════════════════════════════
function renderExercisePage() {
  const dateLabel = document.getElementById('exercise-date-label');
  const listEl = document.getElementById('exercise-list');
  const emptyEl = document.getElementById('exercise-empty');
  const restBtn = document.getElementById('btn-rest-day');

  const now = new Date();
  dateLabel.textContent = `Today — ${formatDateReadable(now)}`;

  const workout = getWorkoutForDate(todayStr());
  const exercises = (workout && workout.exercises) ? workout.exercises : [];

  if (exercises.length === 0) {
    emptyEl.classList.remove('hidden');
    // Clear any previous exercise items (but keep the empty state)
    const items = listEl.querySelectorAll('.exercise-item');
    items.forEach(i => i.remove());
  } else {
    emptyEl.classList.add('hidden');
    // Build exercise list
    let html = '';
    exercises.forEach((ex, idx) => {
      html += `
        <div class="exercise-item" data-index="${idx}">
          <div class="exercise-item__info">
            <div class="exercise-item__name">${ex.name}</div>
            <div class="exercise-item__detail">${formatExerciseDetail(ex)}</div>
            ${ex.notes ? `<div class="exercise-item__detail" style="margin-top:2px;font-style:italic;">${ex.notes}</div>` : ''}
          </div>
          <div class="exercise-item__actions">
            <button class="exercise-item__btn" onclick="editExercise(${idx})" aria-label="Edit">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
            <button class="exercise-item__btn exercise-item__btn--delete" onclick="deleteExercise(${idx})" aria-label="Delete">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>
      `;
    });

    // Replace list content but preserve the empty state element
    const existingItems = listEl.querySelectorAll('.exercise-item');
    existingItems.forEach(i => i.remove());

    emptyEl.insertAdjacentHTML('beforebegin', html);
  }

  // Rest day button
  restBtn.onclick = () => {
    const workout = getWorkoutForDate(todayStr()) || { exercises: [], restDay: false };
    workout.restDay = true;
    saveWorkoutForDate(todayStr(), workout);
    showToast('Rest day marked 🌙');
  };

  // FAB button
  document.getElementById('btn-add-exercise').onclick = openAddExerciseModal;
}

function formatExerciseDetail(ex) {
  const parts = [];
  if (ex.sets && ex.reps) {
    parts.push(`${ex.sets} sets × ${ex.reps} reps`);
  } else if (ex.sets) {
    parts.push(`${ex.sets} sets`);
  } else if (ex.reps) {
    parts.push(`${ex.reps} reps`);
  }
  if (ex.duration) {
    parts.push(`${ex.duration} min`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Logged';
}


// ─── Add Exercise Modal ────────────────────────────────────
function openAddExerciseModal(editIndex = null) {
  const isEdit = editIndex !== null;
  let existing = null;

  if (isEdit) {
    const workout = getWorkoutForDate(todayStr());
    existing = workout.exercises[editIndex];
  }

  const html = `
    <form id="exercise-form">
      <div class="form-group">
        <label class="form-label" for="ex-name">Exercise Name</label>
        <input class="form-input" id="ex-name" type="text" placeholder="e.g. Push-ups" value="${existing ? existing.name : ''}" required autocomplete="off">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="ex-sets">Sets</label>
          <input class="form-input" id="ex-sets" type="number" min="0" placeholder="3" value="${existing && existing.sets ? existing.sets : ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="ex-reps">Reps</label>
          <input class="form-input" id="ex-reps" type="number" min="0" placeholder="10" value="${existing && existing.reps ? existing.reps : ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="ex-duration">Duration (minutes, optional)</label>
        <input class="form-input" id="ex-duration" type="number" min="0" placeholder="20" value="${existing && existing.duration ? existing.duration : ''}">
      </div>
      <div class="form-group">
        <label class="form-label" for="ex-notes">Notes (optional)</label>
        <input class="form-input" id="ex-notes" type="text" placeholder="Felt strong today" value="${existing && existing.notes ? existing.notes : ''}">
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-primary">${isEdit ? 'Save Changes' : 'Add Exercise'}</button>
      </div>
    </form>
  `;

  openModal(isEdit ? 'Edit Exercise' : 'Add Exercise', html);

  // Focus the name field
  setTimeout(() => document.getElementById('ex-name').focus(), 350);

  // Handle submit
  document.getElementById('exercise-form').onsubmit = (e) => {
    e.preventDefault();

    const name = document.getElementById('ex-name').value.trim();
    if (!name) return;

    const exercise = {
      id: existing ? existing.id : uid(),
      name,
      sets: parseInt(document.getElementById('ex-sets').value) || null,
      reps: parseInt(document.getElementById('ex-reps').value) || null,
      duration: parseInt(document.getElementById('ex-duration').value) || null,
      notes: document.getElementById('ex-notes').value.trim() || null
    };

    const workout = getWorkoutForDate(todayStr()) || { exercises: [], restDay: false };

    if (isEdit) {
      workout.exercises[editIndex] = exercise;
    } else {
      workout.exercises.push(exercise);
    }

    saveWorkoutForDate(todayStr(), workout);
    closeModal();
    showToast(isEdit ? 'Exercise updated ✓' : 'Workout logged ✓');

    // Refresh everything
    renderExercisePage();
    renderHome();
  };
}

// Global functions for edit/delete buttons
function editExercise(index) {
  openAddExerciseModal(index);
}

function deleteExercise(index) {
  const workout = getWorkoutForDate(todayStr());
  if (!workout) return;

  workout.exercises.splice(index, 1);
  saveWorkoutForDate(todayStr(), workout);
  showToast('Exercise removed');
  renderExercisePage();
  renderHome();
}


// ════════════════════════════════════════════════════════════
//  PROGRESS PAGE
// ════════════════════════════════════════════════════════════
function renderProgressPage() {
  const stats = calculateStats();

  document.getElementById('prog-total').textContent = stats.totalWorkouts;
  document.getElementById('prog-current-streak').textContent = stats.currentStreak;
  document.getElementById('prog-longest-streak').textContent = stats.longestStreak;
  document.getElementById('prog-this-week').textContent = stats.thisWeek;
  document.getElementById('prog-this-month').textContent = stats.thisMonth;

  renderPersonalRecords();
  renderWeightChart();

  // Data management buttons
  document.getElementById('btn-export').onclick = exportData;
  document.getElementById('btn-import').onclick = importData;
  document.getElementById('btn-clear').onclick = clearData;
  document.getElementById('btn-log-weight').onclick = openLogWeightModal;
}

function renderPersonalRecords() {
  const records = calculatePersonalRecords();
  const container = document.getElementById('pr-list');
  const entries = Object.entries(records);

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="empty-state empty-state--small">
        <p class="empty-state__text">Your personal records will appear here as you log exercises.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = entries.map(([name, rec]) => {
    let best = '';
    if (rec.bestReps > 0) best = `${rec.bestReps} reps`;
    if (rec.bestDuration > 0) best += (best ? ' · ' : '') + `${rec.bestDuration} min`;
    if (!best) best = 'Logged';

    return `
      <div class="pr-item">
        <span class="pr-item__name">${name}</span>
        <span class="pr-item__record">${best}</span>
      </div>
    `;
  }).join('');
}


// ─── Weight Chart ──────────────────────────────────────────
function renderWeightChart() {
  const records = loadData(STORAGE_KEYS.weightRecords) || [];
  const canvas = document.getElementById('weight-chart');
  const container = document.getElementById('weight-chart-container');

  if (records.length < 2) {
    container.innerHTML = `<p class="weight-chart-empty">Log at least 2 weight entries to see your progress chart.</p>`;
    return;
  }

  // Simple canvas line chart
  const ctx = canvas.getContext('2d');
  const w = canvas.width = container.clientWidth - 32;
  const h = canvas.height = 160;

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sorted.map(r => r.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const rangeW = maxW - minW || 1;

  const padX = 40, padY = 20;
  const chartW = w - padX * 2;
  const chartH = h - padY * 2;

  ctx.clearRect(0, 0, w, h);

  // Y-axis labels
  ctx.fillStyle = '#666666';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const val = minW + (rangeW * i / 4);
    const y = h - padY - (chartH * i / 4);
    ctx.fillText(val.toFixed(1), padX - 8, y + 4);
    // Grid line
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.moveTo(padX, y);
    ctx.lineTo(w - padX, y);
    ctx.stroke();
  }

  // Line
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  sorted.forEach((r, i) => {
    const x = padX + (chartW * i / (sorted.length - 1));
    const y = h - padY - ((r.weight - minW) / rangeW) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Dots
  sorted.forEach((r, i) => {
    const x = padX + (chartW * i / (sorted.length - 1));
    const y = h - padY - ((r.weight - minW) / rangeW) * chartH;
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}


// ─── Log Weight Modal ──────────────────────────────────────
function openLogWeightModal() {
  const html = `
    <form id="weight-form">
      <div class="form-group">
        <label class="form-label" for="wt-weight">Weight (kg)</label>
        <input class="form-input" id="wt-weight" type="number" step="0.1" min="0" placeholder="42.5" required>
      </div>
      <div class="form-group">
        <label class="form-label" for="wt-height">Height (cm, optional)</label>
        <input class="form-input" id="wt-height" type="number" step="0.1" min="0" placeholder="165">
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>
  `;

  openModal('Log Weight', html);
  setTimeout(() => document.getElementById('wt-weight').focus(), 350);

  document.getElementById('weight-form').onsubmit = (e) => {
    e.preventDefault();
    const weight = parseFloat(document.getElementById('wt-weight').value);
    if (!weight) return;

    const height = parseFloat(document.getElementById('wt-height').value) || null;
    const records = loadData(STORAGE_KEYS.weightRecords) || [];
    records.push({ date: todayStr(), weight, height });
    saveData(STORAGE_KEYS.weightRecords, records);

    closeModal();
    showToast('Weight logged ✓');
    renderProgressPage();
  };
}


// ─── Data Management ───────────────────────────────────────
function exportData() {
  const data = {
    workouts: loadData(STORAGE_KEYS.workouts),
    weightRecords: loadData(STORAGE_KEYS.weightRecords),
    settings: loadData(STORAGE_KEYS.settings),
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `growfit-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported ✓');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.workouts) saveData(STORAGE_KEYS.workouts, data.workouts);
        if (data.weightRecords) saveData(STORAGE_KEYS.weightRecords, data.weightRecords);
        if (data.settings) saveData(STORAGE_KEYS.settings, data.settings);
        showToast('Data imported ✓');
        renderHome();
        renderProgressPage();
      } catch {
        showToast('Invalid file', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearData() {
  openModal('Clear All Data', `
    <p style="color: var(--text-secondary); margin-bottom: 20px;">This will permanently delete all your workout data, weight records, and settings. This cannot be undone.</p>
    <div class="form-actions" style="display:flex; gap:12px;">
      <button class="btn-secondary" style="flex:1;" onclick="closeModal()">Cancel</button>
      <button class="btn-danger" style="flex:1;" onclick="confirmClear()">Delete Everything</button>
    </div>
  `);
}

function confirmClear() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  closeModal();
  showToast('All data cleared');
  renderHome();
  renderExercisePage();
  renderProgressPage();
}

// ─── PWA Service Worker ────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}
