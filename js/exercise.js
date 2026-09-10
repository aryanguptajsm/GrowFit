/**
 * GrowFit — Exercise Page (Stage 3 Implementation)
 * Allows logging workouts, viewing history, filtering preset exercises, and adding custom exercises.
 */

function renderExercise() {
  const container = document.getElementById('page-exercise');
  const workoutLog = GrowFitStorage.getWorkouts();
  const exercisesList = GrowFitStorage.getExercises();

  // Render Page Header & Action
  container.innerHTML = `
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Exercise Tracker</h1>
        <p class="page-header__sub">Track your workouts & build consistency</p>
      </div>
      <button class="btn btn--primary" onclick="openLogWorkoutModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Log Workout
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid animate-in" style="margin-bottom: var(--space-4);">
      <div class="stat-card">
        <span class="stat-card__label">Total Workouts</span>
        <span class="stat-card__value">${workoutLog.length}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Available Exercises</span>
        <span class="stat-card__value">${exercisesList.length}</span>
      </div>
    </div>

    <!-- Workout History Section -->
    <div class="section-title animate-in" style="display:flex; justify-between; align-items:center; margin-bottom: var(--space-3);">
      <h2>Workout Log</h2>
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
        <h3 class="empty-state__title">No Workouts Recorded Yet</h3>
        <p class="empty-state__desc">Log your first exercise session to start tracking your physical progress!</p>
        <button class="btn btn--primary" onclick="openLogWorkoutModal()">Log Workout Now</button>
      </div>
    ` : `
      <div class="log-list animate-in">
        ${workoutLog.slice().reverse().map(item => `
          <div class="log-item" style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-card); padding: var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-2); border: 1px solid var(--border-color);">
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">${escapeHTML(item.exerciseName)}</div>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                ${item.sets ? `${item.sets} sets × ${item.reps || 0} reps` : ''} 
                ${item.weight ? ` @ ${item.weight} kg` : ''} 
                ${item.durationMinutes ? ` (${formatDuration(item.durationMinutes)})` : ''}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${formatDate(item.date)}</div>
            </div>
            <button class="btn-icon" onclick="deleteWorkoutLog('${item.id}')" title="Delete entry" style="color: var(--color-danger); background:transparent; border:none; cursor:pointer;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

/**
 * Open Modal to Log Workout
 */
function openLogWorkoutModal() {
  const exercises = GrowFitStorage.getExercises();
  const today = new Date().toISOString().split('T')[0];

  const html = `
    <form id="workout-form" onsubmit="handleSaveWorkout(event)">
      <div class="form-group">
        <label class="form-label" for="ex-select">Select Exercise</label>
        <select class="form-control" id="ex-select" required onchange="handleExerciseSelectChange(this)">
          <option value="">-- Choose Exercise --</option>
          ${exercises.map(ex => `<option value="${escapeHTML(ex.name)}" data-category="${ex.category}">${escapeHTML(ex.name)} (${ex.category})</option>`).join('')}
          <option value="CUSTOM">+ Add Custom Exercise</option>
        </select>
      </div>

      <div class="form-group" id="custom-ex-group" style="display:none;">
        <label class="form-label" for="ex-custom-name">Custom Exercise Name</label>
        <input type="text" class="form-control" id="ex-custom-name" placeholder="e.g. Incline Dumbbell Press">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
        <div class="form-group">
          <label class="form-label" for="ex-sets">Sets</label>
          <input type="number" class="form-control" id="ex-sets" min="1" placeholder="3">
        </div>
        <div class="form-group">
          <label class="form-label" for="ex-reps">Reps</label>
          <input type="number" class="form-control" id="ex-reps" min="1" placeholder="10">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
        <div class="form-group">
          <label class="form-label" for="ex-weight">Weight (kg)</label>
          <input type="number" class="form-control" id="ex-weight" step="0.5" min="0" placeholder="Optional">
        </div>
        <div class="form-group">
          <label class="form-label" for="ex-duration">Duration (mins)</label>
          <input type="number" class="form-control" id="ex-duration" min="1" placeholder="Optional">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="ex-date">Date</label>
        <input type="date" class="form-control" id="ex-date" value="${today}" required>
      </div>

      <button type="submit" class="btn btn--primary btn--full" style="margin-top: var(--space-3);">Save Workout</button>
    </form>
  `;

  openModal('Log Workout', html);
}

function handleExerciseSelectChange(select) {
  const customGroup = document.getElementById('custom-ex-group');
  if (select.value === 'CUSTOM') {
    customGroup.style.display = 'block';
    document.getElementById('ex-custom-name').required = true;
  } else {
    customGroup.style.display = 'none';
    document.getElementById('ex-custom-name').required = false;
  }
}

function handleSaveWorkout(e) {
  e.preventDefault();
  const select = document.getElementById('ex-select');
  let name = select.value;
  if (name === 'CUSTOM') {
    name = document.getElementById('ex-custom-name').value.trim();
  }

  if (!name) {
    showToast('Please select or enter an exercise name', 'error');
    return;
  }

  const workoutData = {
    exerciseName: name,
    sets: parseInt(document.getElementById('ex-sets').value) || null,
    reps: parseInt(document.getElementById('ex-reps').value) || null,
    weight: parseFloat(document.getElementById('ex-weight').value) || null,
    durationMinutes: parseInt(document.getElementById('ex-duration').value) || null,
    date: document.getElementById('ex-date').value
  };

  GrowFitStorage.addWorkout(workoutData);
  closeModal();
  showToast('Workout logged successfully!');
  renderExercise();
}

function deleteWorkoutLog(id) {
  showConfirmDialog('Are you sure you want to delete this workout log entry?', () => {
    GrowFitStorage.deleteWorkout(id);
    showToast('Workout entry deleted');
    renderExercise();
  });
}

