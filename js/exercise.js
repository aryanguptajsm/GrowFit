/**
 * GrowFit — Exercise Page (Stage 2)
 *
 * Renders:
 *  - Page header with "Log Workout" CTA
 *  - Today's quick stats
 *  - Category filter tabs (All / Strength / Cardio / Core / Flexibility)
 *  - Preset exercise quick-pick grid (filtered)
 *  - Full workout log history
 *
 * Storage: uses GrowFitStorage adapter methods (getWorkouts, addWorkout, deleteWorkout)
 */

// ─── Active tab state (persists across re-renders) ────────────
let exerciseActiveTab = 'all';

// ─── Render Exercise Page ─────────────────────────────────────

function renderExercise() {
  const container = document.getElementById('page-exercise');
  const workoutLog = GrowFitStorage.getWorkouts();
  const todayStr   = getTodayDate();
  const todayLogs  = workoutLog.filter(w => w.date === todayStr);

  // ── Stats
  const totalWorkouts = workoutLog.length;
  const todayCount    = todayLogs.length;
  const todayDuration = todayLogs.reduce((sum, w) => sum + (Number(w.durationMinutes) || 0), 0);

  // ── Category tabs
  const categories = ['All', 'Strength', 'Cardio', 'Core', 'Flexibility'];

  // ── Filter exercise library
  const filteredLibrary = exerciseActiveTab === 'all'
    ? EXERCISE_LIBRARY
    : EXERCISE_LIBRARY.filter(ex => ex.category.toLowerCase() === exerciseActiveTab);

  const trashSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>`;

  container.innerHTML = `

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Exercise</h1>
        <p class="page-header__sub">Build strength, track consistency</p>
      </div>
      <button class="btn btn--primary" id="log-workout-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Log Workout
      </button>
    </div>

    <!-- ── Today's Stats ────────────────────────────────────── -->
    <div class="stats-grid animate-in" style="margin-bottom: var(--space-5);">
      <div class="stat-card">
        <span class="stat-card__label">Today's Workouts</span>
        <span class="stat-card__value">${todayCount}</span>
        <span style="font-size:var(--font-xs); color:var(--text-muted);">
          ${todayDuration > 0 ? formatDuration(todayDuration) + ' total' : 'sets & reps'}
        </span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">All-Time Sessions</span>
        <span class="stat-card__value">${totalWorkouts}</span>
        <span style="font-size:var(--font-xs); color:var(--text-muted);">logged entries</span>
      </div>
    </div>

    <!-- ── Exercise Library Quick-Pick ──────────────────────── -->
    <h2 class="section-title animate-in">
      <span class="section-title__icon">⚡</span>
      Quick Log
    </h2>

    <!-- Category Tabs -->
    <div class="tabs animate-in" id="exercise-tabs">
      ${categories.map(cat => `
        <button class="tab-btn ${exerciseActiveTab === cat.toLowerCase() ? 'active' : ''}"
                data-tab="${cat.toLowerCase()}">${cat}</button>
      `).join('')}
    </div>

    <!-- Exercise Picker Grid -->
    <div class="exercise-picker animate-in" id="exercise-picker">
      ${filteredLibrary.map(ex => `
        <button class="exercise-pick-btn" data-exercise='${JSON.stringify(ex).replace(/'/g, "&#39;")}'>
          <span class="emoji">${ex.icon}</span>
          <span>${ex.name}</span>
        </button>
      `).join('')}
    </div>

    <!-- ── Workout History ────────────────────────────────────── -->
    <div class="section-header animate-in" style="margin-top: var(--space-2);">
      <h2>Workout Log</h2>
      <span class="section-header__label">${workoutLog.length} total</span>
    </div>

    ${workoutLog.length === 0 ? `
      <div class="empty-state animate-in">
        <div class="empty-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"/>
            <path d="M6 8a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"/>
            <line x1="8" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <h3 class="empty-state__title">No Workouts Yet</h3>
        <p class="empty-state__desc">Tap a quick-pick above or use "Log Workout" to record your first session.</p>
      </div>
    ` : `
      <div class="log-list animate-in">
        ${workoutLog.slice().reverse().map(item => {
          const detailParts = [];
          if (item.sets && item.reps)        detailParts.push(`${item.sets} × ${item.reps}`);
          if (item.weight)                   detailParts.push(`${item.weight} kg`);
          if (item.durationMinutes)          detailParts.push(formatDuration(item.durationMinutes));
          return `
            <div class="log-item animate-in">
              <div class="log-item__main">
                <div class="log-item__title">${escapeHTML(item.exerciseName || item.name || '—')}</div>
                ${detailParts.length ? `<div class="log-item__sub">${detailParts.join(' · ')}</div>` : ''}
                <div class="log-item__meta">${formatDate(item.date)}</div>
              </div>
              <div class="log-item__right">
                <button class="btn-icon-danger" data-delete-workout="${item.id}" title="Delete">
                  ${trashSVG}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  // ── Event Listeners ────────────────────────────────────────

  // Log Workout button
  document.getElementById('log-workout-btn').addEventListener('click', openLogWorkoutModal);

  // Category tabs
  document.getElementById('exercise-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    exerciseActiveTab = btn.dataset.tab;
    renderExercise();
  });

  // Quick-pick exercise buttons (pre-fill modal)
  document.getElementById('exercise-picker').addEventListener('click', e => {
    const btn = e.target.closest('.exercise-pick-btn');
    if (!btn) return;
    const ex = JSON.parse(btn.dataset.exercise);
    openLogWorkoutModal(ex);
  });

  // Delete buttons (event delegation)
  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-delete-workout]');
    if (!btn) return;
    const id = btn.dataset.deleteWorkout;
    showConfirmDialog('Delete this workout entry?', () => {
      GrowFitStorage.deleteWorkout(id);
      showToast('Workout deleted', 'info');
      renderExercise();
    });
  });
}


// ─── Log Workout Modal ────────────────────────────────────────

/**
 * Open the log workout modal, optionally pre-filled with a library exercise.
 * @param {object|null} presetEx — exercise from EXERCISE_LIBRARY
 */
function openLogWorkoutModal(presetEx = null) {
  const today = getTodayDate();

  const html = `
    <form id="workout-form">
      <div class="form-group">
        <label class="form-label" for="ex-name">Exercise Name *</label>
        <input type="text" class="form-control" id="ex-name"
               placeholder="e.g. Push-ups, Squat…"
               value="${presetEx ? escapeHTML(presetEx.name) : ''}" required>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3);">
        <div class="form-group">
          <label class="form-label" for="ex-sets">Sets</label>
          <input type="number" class="form-control" id="ex-sets"
                 min="1" placeholder="3"
                 value="${presetEx ? (presetEx.defaultSets || '') : ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="ex-reps">Reps</label>
          <input type="number" class="form-control" id="ex-reps"
                 min="1" placeholder="10"
                 value="${presetEx ? (presetEx.defaultReps || '') : ''}">
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3);">
        <div class="form-group">
          <label class="form-label" for="ex-weight">Weight (kg)</label>
          <input type="number" class="form-control" id="ex-weight"
                 step="0.5" min="0" placeholder="Optional">
        </div>
        <div class="form-group">
          <label class="form-label" for="ex-duration">Duration (mins)</label>
          <input type="number" class="form-control" id="ex-duration"
                 min="1" placeholder="Optional"
                 value="${presetEx && presetEx.defaultDuration ? presetEx.defaultDuration : ''}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="ex-date">Date</label>
        <input type="date" class="form-control" id="ex-date" value="${today}" required>
      </div>

      <div class="modal__footer" style="padding: var(--space-4) 0 0; border:none;">
        <button type="button" class="btn btn--secondary btn--full" id="workout-cancel">Cancel</button>
        <button type="submit" class="btn btn--primary btn--full">Save Workout</button>
      </div>
    </form>
  `;

  openModal('Log Workout', html);

  document.getElementById('workout-cancel').addEventListener('click', closeModal);

  document.getElementById('workout-form').addEventListener('submit', e => {
    e.preventDefault();
    const name     = document.getElementById('ex-name').value.trim();
    const sets     = parseInt(document.getElementById('ex-sets').value)     || null;
    const reps     = parseInt(document.getElementById('ex-reps').value)     || null;
    const weight   = parseFloat(document.getElementById('ex-weight').value) || null;
    const duration = parseInt(document.getElementById('ex-duration').value) || null;
    const date     = document.getElementById('ex-date').value;

    if (!name) {
      showToast('Please enter an exercise name', 'warning');
      return;
    }

    GrowFitStorage.addWorkout({ exerciseName: name, sets, reps, weight, durationMinutes: duration, date });
    closeModal();
    showToast(`${name} logged! 💪`, 'success');
    renderExercise();
  });
}
