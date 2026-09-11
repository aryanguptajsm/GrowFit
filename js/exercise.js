/**
 * GrowFit — Exercise Tracker (Stage 3)
 *
 * Premium exercise tracking with:
 *  - Weekly activity heat-dots (7-day bar)
 *  - Today's session summary with total sets/reps/duration
 *  - Category tabs with live exercise count
 *  - Exercise library grid — colour-coded by category with muscle labels
 *  - Personal Records section
 *  - Workout history grouped by date (newest first)
 *  - Full-featured Log Workout modal with smart field toggling
 */

// ─── State ────────────────────────────────────────────────────
let exTab        = 'all';   // active category tab
let exHistoryTab = 'today'; // 'today' | 'all'

// ─── Category meta ────────────────────────────────────────────
const CAT_META = {
  strength:    { label: 'Strength',    color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  },
  core:        { label: 'Core',        color: '#fb923c', bg: 'rgba(251,146,60,0.12)'  },
  cardio:      { label: 'Cardio',      color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  flexibility: { label: 'Flexibility', color: '#c084fc', bg: 'rgba(192,132,252,0.12)' },
};

function getCatColor(cat)  { return (CAT_META[cat] || {}).color || 'var(--accent)'; }
function getCatBg(cat)     { return (CAT_META[cat] || {}).bg    || 'var(--accent-muted)'; }
function getCatLabel(cat)  { return (CAT_META[cat] || {}).label || cat; }

// ─── SVGs ─────────────────────────────────────────────────────
const TRASH_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
</svg>`;

const TROPHY_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
  <path d="M6 9H2V4h4M18 9h4V4h-4M6 9a6 6 0 1 0 12 0M12 15v4M8 19h8"/>
</svg>`;


// ─── Main Render ──────────────────────────────────────────────
function renderExercise() {
  const container  = document.getElementById('page-exercise');
  const allLogs    = GrowFitStorage.getWorkouts();
  const todayStr   = getTodayDate();
  const todayLogs  = GrowFitStorage.getWorkoutsForDate(todayStr);
  const weekAct    = GrowFitStorage.getWeeklyActivity(7);
  const weekMins   = GrowFitStorage.getWeeklyMinutes();
  const prMap      = GrowFitStorage.getPersonalRecords();

  // ── Today stats
  const todaySets  = todayLogs.reduce((s, w) => s + (Number(w.sets) || 0), 0);
  const todayReps  = todayLogs.reduce((s, w) => s + (Number(w.sets) || 0) * (Number(w.reps) || 0), 0);
  const todayMins  = todayLogs.reduce((s, w) => s + (Number(w.durationMinutes) || 0), 0);

  // ── Streak
  let streak = 0;
  const activeDates = new Set(allLogs.map(w => w.date));
  const cur = new Date();
  while (true) {
    const d = cur.toISOString().split('T')[0];
    if (activeDates.has(d)) { streak++; cur.setDate(cur.getDate() - 1); }
    else break;
  }

  // ── Category counts
  const catCounts = {};
  EXERCISE_LIBRARY.forEach(ex => {
    catCounts[ex.category] = (catCounts[ex.category] || 0) + 1;
  });

  // ── Filtered library
  const filteredLib = exTab === 'all'
    ? EXERCISE_LIBRARY
    : EXERCISE_LIBRARY.filter(ex => ex.category === exTab);

  // ── History display mode
  const historyLogs = exHistoryTab === 'today'
    ? todayLogs.slice().reverse()
    : allLogs.slice().reverse();

  // Group history by date
  const byDate = {};
  historyLogs.forEach(w => {
    if (!byDate[w.date]) byDate[w.date] = [];
    byDate[w.date].push(w);
  });
  const dateGroups = Object.entries(byDate).sort((a, b) => b[0].localeCompare(a[0]));

  container.innerHTML = `

    <!-- ═══ HEADER ════════════════════════════════════════════ -->
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Exercise</h1>
        <p class="page-header__sub">Build strength, track consistency</p>
      </div>
      <button class="btn btn--primary" id="log-workout-btn" aria-label="Log workout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Log Workout
      </button>
    </div>

    <!-- ═══ WEEKLY ACTIVITY BAR ═══════════════════════════════ -->
    <div class="ex-weekly animate-in">
      <div class="ex-weekly__header">
        <span class="ex-weekly__title">This Week</span>
        <span class="ex-weekly__stat">
          ${weekMins > 0 ? formatDuration(weekMins) + ' active' : 'No sessions yet'}
          ${streak > 1 ? ` &nbsp;·&nbsp; <span style="color:var(--accent);">&#x1F525; ${streak}-day streak</span>` : ''}
        </span>
      </div>
      <div class="ex-weekly__dots">
        ${weekAct.map(day => `
          <div class="ex-weekly__day">
            <div class="ex-weekly__dot ${day.hasWorkout ? 'ex-weekly__dot--active' : ''} ${day.isToday ? 'ex-weekly__dot--today' : ''}"></div>
            <span class="ex-weekly__label ${day.isToday ? 'ex-weekly__label--today' : ''}">${day.dayLabel}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- ═══ TODAY'S SESSION ════════════════════════════════════ -->
    <div class="ex-today animate-in">
      <div class="ex-today__row">
        <span class="ex-today__heading">Today's Session</span>
        ${todayLogs.length === 0 ? `<span class="ex-today__empty">Nothing logged yet</span>` : ''}
      </div>
      ${todayLogs.length > 0 ? `
        <div class="ex-today__chips">
          <div class="ex-today__chip">
            <span class="ex-today__chip-val">${todayLogs.length}</span>
            <span class="ex-today__chip-lbl">exercises</span>
          </div>
          <div class="ex-today__chip">
            <span class="ex-today__chip-val">${todaySets}</span>
            <span class="ex-today__chip-lbl">sets</span>
          </div>
          <div class="ex-today__chip">
            <span class="ex-today__chip-val">${todayReps}</span>
            <span class="ex-today__chip-lbl">reps</span>
          </div>
          ${todayMins > 0 ? `
            <div class="ex-today__chip">
              <span class="ex-today__chip-val">${todayMins}</span>
              <span class="ex-today__chip-lbl">mins</span>
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>

    <!-- ═══ EXERCISE LIBRARY ══════════════════════════════════ -->
    <div class="section-header animate-in" style="margin-top:var(--space-5);">
      <h2>Exercise Library</h2>
      <span class="section-header__label">${EXERCISE_LIBRARY.length} exercises</span>
    </div>

    <!-- Category Tabs -->
    <div class="ex-cat-tabs animate-in" id="ex-cat-tabs">
      <button class="ex-cat-tab ${exTab === 'all' ? 'ex-cat-tab--active' : ''}" data-tab="all">
        All <span class="ex-cat-count">${EXERCISE_LIBRARY.length}</span>
      </button>
      ${Object.entries(CAT_META).map(([key, meta]) => `
        <button class="ex-cat-tab ${exTab === key ? 'ex-cat-tab--active' : ''}"
                data-tab="${key}"
                style="${exTab === key ? `--cat-color:${meta.color}` : ''}">
          <span class="ex-cat-dot" style="background:${meta.color};"></span>
          ${meta.label}
          <span class="ex-cat-count">${catCounts[key] || 0}</span>
        </button>
      `).join('')}
    </div>

    <!-- Exercise Cards Grid -->
    <div class="ex-library-grid animate-in" id="ex-library-grid">
      ${filteredLib.map(ex => `
        <button class="ex-card" data-exercise='${JSON.stringify(ex).replace(/'/g, "&#39;")}'>
          <div class="ex-card__icon" style="background:${getCatBg(ex.category)}; color:${getCatColor(ex.category)};">
            ${ex.icon}
          </div>
          <div class="ex-card__body">
            <div class="ex-card__name">${ex.name}</div>
            <div class="ex-card__muscles">${ex.muscles || ''}</div>
            <div class="ex-card__meta">
              ${ex.isDuration
                ? `${ex.defaultSets} × ${ex.defaultDuration}s`
                : `${ex.defaultSets} × ${ex.defaultReps} reps`}
              <span class="ex-card__cat" style="color:${getCatColor(ex.category)}; background:${getCatBg(ex.category)};">
                ${getCatLabel(ex.category)}
              </span>
            </div>
          </div>
          ${prMap.has(ex.name) ? `
            <div class="ex-card__pr" title="Personal Record">${TROPHY_SVG} ${prMap.get(ex.name).weight} kg</div>
          ` : ''}
        </button>
      `).join('')}
    </div>

    <!-- ═══ PERSONAL RECORDS ════════════════════════════════ -->
    ${prMap.size > 0 ? `
      <div class="section-header animate-in" style="margin-top:var(--space-6);">
        <h2>Personal Records</h2>
        <span class="section-header__label">${prMap.size} tracked</span>
      </div>
      <div class="ex-pr-grid animate-in">
        ${[...prMap.entries()].map(([name, rec]) => `
          <div class="ex-pr-card">
            <div class="ex-pr-card__icon">${TROPHY_SVG}</div>
            <div class="ex-pr-card__body">
              <div class="ex-pr-card__name">${escapeHTML(name)}</div>
              <div class="ex-pr-card__val">${rec.weight} kg</div>
              ${rec.sets && rec.reps ? `<div class="ex-pr-card__detail">${rec.sets} × ${rec.reps} reps</div>` : ''}
            </div>
            <div class="ex-pr-card__date">${formatDate(rec.date)}</div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- ═══ WORKOUT HISTORY ═════════════════════════════════ -->
    <div class="section-header animate-in" style="margin-top:var(--space-6);">
      <h2>Workout Log</h2>
      <div class="ex-hist-tabs" id="ex-hist-tabs">
        <button class="ex-hist-tab ${exHistoryTab === 'today' ? 'active' : ''}" data-htab="today">Today</button>
        <button class="ex-hist-tab ${exHistoryTab === 'all'   ? 'active' : ''}" data-htab="all">All Time</button>
      </div>
    </div>

    ${dateGroups.length === 0 ? `
      <div class="empty-state animate-in">
        <div class="empty-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"/>
            <path d="M6 8a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"/>
            <line x1="8" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <h3 class="empty-state__title">${exHistoryTab === 'today' ? 'No workouts today yet' : 'No workouts logged'}</h3>
        <p class="empty-state__desc">Pick an exercise above or tap "Log Workout" to start.</p>
      </div>
    ` : `
      <div class="log-list animate-in" id="history-list">
        ${dateGroups.map(([date, items]) => `
          <div class="ex-date-group animate-in">
            <div class="ex-date-group__header">
              <span class="ex-date-group__date">${formatDate(date)}</span>
              <span class="ex-date-group__count">${items.length} exercise${items.length > 1 ? 's' : ''}</span>
            </div>
            ${items.map(item => {
              const exLib   = EXERCISE_LIBRARY.find(e => e.name === (item.exerciseName || item.name));
              const catKey  = exLib ? exLib.category : 'strength';
              const details = [];
              if (item.sets && item.reps) details.push(`${item.sets} × ${item.reps} reps`);
              if (item.weight)            details.push(`${item.weight} kg`);
              if (item.durationMinutes)   details.push(formatDuration(item.durationMinutes));
              const isPR = prMap.has(item.exerciseName || item.name) &&
                           prMap.get(item.exerciseName || item.name).weight === item.weight && item.weight;
              return `
                <div class="ex-log-item">
                  <div class="ex-log-item__accent" style="background:${getCatColor(catKey)};"></div>
                  <div class="ex-log-item__body">
                    <div class="ex-log-item__name">
                      ${escapeHTML(item.exerciseName || item.name || '—')}
                      ${isPR ? `<span class="ex-pr-badge">${TROPHY_SVG} PR</span>` : ''}
                    </div>
                    ${details.length ? `<div class="ex-log-item__detail">${details.join(' &nbsp;·&nbsp; ')}</div>` : ''}
                  </div>
                  <button class="btn-icon-danger" data-delete-workout="${item.id}" title="Delete">${TRASH_SVG}</button>
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    `}
  `;

  // ── Wire events ─────────────────────────────────────────────
  document.getElementById('log-workout-btn').addEventListener('click', () => openLogWorkoutModal());

  document.getElementById('ex-cat-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.ex-cat-tab');
    if (!btn) return;
    exTab = btn.dataset.tab;
    renderExercise();
  });

  document.getElementById('ex-library-grid').addEventListener('click', e => {
    const btn = e.target.closest('.ex-card');
    if (!btn) return;
    const ex = JSON.parse(btn.dataset.exercise);
    openLogWorkoutModal(ex);
  });

  document.getElementById('ex-hist-tabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-htab]');
    if (!btn) return;
    exHistoryTab = btn.dataset.htab;
    renderExercise();
  });

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-delete-workout]');
    if (!btn) return;
    showConfirmDialog('Delete this workout entry?', () => {
      GrowFitStorage.deleteWorkout(btn.dataset.deleteWorkout);
      showToast('Workout deleted', 'info');
      renderExercise();
    });
  });
}


// ─── Log Workout Modal ────────────────────────────────────────
function openLogWorkoutModal(presetEx = null) {
  const today  = getTodayDate();
  const isDur  = presetEx && presetEx.isDuration;
  const catKey = presetEx ? presetEx.category : 'strength';
  const color  = getCatColor(catKey);

  const html = `
    <form id="workout-form">

      <!-- Exercise Name + category badge -->
      <div class="form-group">
        <label class="form-label" for="ex-name">Exercise Name *</label>
        <div style="position:relative;">
          <input type="text" class="form-control" id="ex-name"
                 placeholder="e.g. Push-ups, Squat, Running…"
                 value="${presetEx ? escapeHTML(presetEx.name) : ''}" required autocomplete="off">
          ${presetEx ? `
            <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%);
                         font-size:10px; font-weight:700; padding:2px 8px; border-radius:99px;
                         background:${getCatBg(catKey)}; color:${color}; pointer-events:none;">
              ${getCatLabel(catKey)}
            </span>
          ` : ''}
        </div>
        ${presetEx && presetEx.muscles ? `<p class="form-hint" style="margin-top:6px;">Targets: ${presetEx.muscles}</p>` : ''}
      </div>

      <!-- Toggle: Sets/Reps vs Duration -->
      <div class="ex-modal-toggle" id="ex-modal-toggle">
        <button type="button" class="ex-modal-toggle__btn ${!isDur ? 'active' : ''}" data-mode="reps">Sets & Reps</button>
        <button type="button" class="ex-modal-toggle__btn ${isDur  ? 'active' : ''}" data-mode="duration">Duration</button>
      </div>

      <!-- Sets × Reps fields -->
      <div id="ex-sets-section" style="${isDur ? 'display:none;' : ''}">
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:var(--space-3);">
          <div class="form-group">
            <label class="form-label" for="ex-sets">Sets</label>
            <input type="number" class="form-control" id="ex-sets"
                   min="1" max="20" placeholder="3"
                   value="${presetEx && !isDur ? (presetEx.defaultSets || '') : ''}">
          </div>
          <div class="form-group">
            <label class="form-label" for="ex-reps">Reps</label>
            <input type="number" class="form-control" id="ex-reps"
                   min="1" max="200" placeholder="10"
                   value="${presetEx && !isDur ? (presetEx.defaultReps || '') : ''}">
          </div>
          <div class="form-group">
            <label class="form-label" for="ex-weight">kg (opt)</label>
            <input type="number" class="form-control" id="ex-weight"
                   step="0.5" min="0" max="500" placeholder="—">
          </div>
        </div>
      </div>

      <!-- Duration field -->
      <div id="ex-dur-section" style="${!isDur ? 'display:none;' : ''}">
        <div class="form-group">
          <label class="form-label" for="ex-duration">Duration (minutes) *</label>
          <input type="number" class="form-control" id="ex-duration"
                 min="1" max="480" placeholder="20"
                 value="${presetEx && isDur ? (presetEx.defaultDuration || '') : ''}">
        </div>
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label class="form-label" for="ex-notes">Notes <span style="color:var(--text-muted);">(optional)</span></label>
        <textarea class="form-control" id="ex-notes" rows="2"
                  placeholder="How did it feel? Any comments…"></textarea>
      </div>

      <!-- Date -->
      <div class="form-group">
        <label class="form-label" for="ex-date">Date</label>
        <input type="date" class="form-control" id="ex-date" value="${today}" required>
      </div>

      <div class="modal__footer" style="padding:var(--space-4) 0 0; border:none;">
        <button type="button" class="btn btn--secondary btn--full" id="workout-cancel">Cancel</button>
        <button type="submit" class="btn btn--primary btn--full">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Save Workout
        </button>
      </div>
    </form>
  `;

  openModal('Log Workout', html);

  // Sets/Reps ↔ Duration toggle
  document.getElementById('ex-modal-toggle').addEventListener('click', e => {
    const btn = e.target.closest('.ex-modal-toggle__btn');
    if (!btn) return;
    const mode = btn.dataset.mode;
    document.querySelectorAll('.ex-modal-toggle__btn').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    document.getElementById('ex-sets-section').style.display = mode === 'reps'     ? '' : 'none';
    document.getElementById('ex-dur-section').style.display  = mode === 'duration' ? '' : 'none';
  });

  document.getElementById('workout-cancel').addEventListener('click', closeModal);

  document.getElementById('workout-form').addEventListener('submit', e => {
    e.preventDefault();

    const name    = document.getElementById('ex-name').value.trim();
    const date    = document.getElementById('ex-date').value;
    const sets    = parseInt(document.getElementById('ex-sets').value)     || null;
    const reps    = parseInt(document.getElementById('ex-reps').value)     || null;
    const weight  = parseFloat(document.getElementById('ex-weight').value) || null;
    const mins    = parseInt(document.getElementById('ex-duration').value) || null;
    const notes   = document.getElementById('ex-notes').value.trim();

    const setsSec = document.getElementById('ex-sets-section');
    const isDuration = setsSec.style.display === 'none';

    if (!name) { showToast('Please enter an exercise name', 'warning'); return; }
    if (isDuration && !mins) { showToast('Please enter duration in minutes', 'warning'); return; }

    // Check for PR before saving
    const prMap = GrowFitStorage.getPersonalRecords();
    const isPR  = weight && (!prMap.has(name) || weight > prMap.get(name).weight);

    GrowFitStorage.addWorkout({
      exerciseName:    name,
      sets:            isDuration ? null : sets,
      reps:            isDuration ? null : reps,
      weight:          isDuration ? null : weight,
      durationMinutes: isDuration ? mins : null,
      notes,
      date,
    });

    closeModal();
    if (isPR) {
      showToast(`${name} — New Personal Record! ${weight} kg`, 'success');
    } else {
      showToast(`${name} logged!`, 'success');
    }
    renderExercise();
  });
}
