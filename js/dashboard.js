/**
 * GrowFit — Dashboard Page
 *
 * Renders the home screen with:
 *  - Greeting header
 *  - Stats cards (calories, protein, exercise, weight)
 *  - Daily checklist
 *  - Quick Add buttons (food, exercise, weight, journal)
 *  - Today's food log summary
 *
 * All data is read from GrowFitStorage and re-rendered on each call
 * so the dashboard always reflects the latest saved data.
 */


// ─── Render Dashboard ────────────────────────────────────────

function renderDashboard() {
  const user  = GrowFitStorage.getUser();
  const today = getTodayDate();
  const stats = calculateTodayStats(today);

  const container = document.getElementById('page-home');
  container.innerHTML = `

    <!-- Header -->
    <div class="page-header animate-in">
      <div>
        <p class="page-header__greeting">${getGreeting()} 👋</p>
        <h1 class="page-header__name">${escapeHTML(user.name)}</h1>
      </div>
      <button class="profile-btn" aria-label="Profile" onclick="navigate('more')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      ${renderCalorieCard(stats, user)}
      ${renderProteinCard(stats, user)}
      ${renderExerciseCard(stats)}
      ${renderWeightCard()}
    </div>

    <!-- Quick Add -->
    <h2 class="section-title animate-in">
      <span class="section-title__icon">⚡</span>
      Quick Add
    </h2>
    <div class="quick-add-grid">
      <button class="quick-add-btn animate-in" onclick="openQuickAddFood()" aria-label="Add food">
        <div class="quick-add-btn__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        </div>
        <span class="quick-add-btn__label">Food</span>
      </button>

      <button class="quick-add-btn animate-in" onclick="openQuickAddExercise()" aria-label="Add exercise">
        <div class="quick-add-btn__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"/>
            <path d="M6 8a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"/>
            <line x1="8" y1="11" x2="16" y2="11"/>
            <line x1="2" y1="11" x2="4" y2="11"/>
            <line x1="20" y1="11" x2="22" y2="11"/>
          </svg>
        </div>
        <span class="quick-add-btn__label">Exercise</span>
      </button>

      <button class="quick-add-btn animate-in" onclick="openQuickAddWeight()" aria-label="Record weight">
        <div class="quick-add-btn__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a6 6 0 0 0-6 6v1h12V9a6 6 0 0 0-6-6z"/>
            <rect x="2" y="10" width="20" height="11" rx="2"/>
            <line x1="12" y1="14" x2="12" y2="18"/>
          </svg>
        </div>
        <span class="quick-add-btn__label">Weight</span>
      </button>

      <button class="quick-add-btn animate-in" onclick="openQuickAddJournal()" aria-label="Add journal entry">
        <div class="quick-add-btn__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <span class="quick-add-btn__label">Journal</span>
      </button>
    </div>

    <!-- Daily Checklist -->
    <h2 class="section-title animate-in">
      <span class="section-title__icon">📋</span>
      Today's Checklist
    </h2>
    ${renderDailyChecklist(stats, today)}

    <!-- Today's Food Log -->
    ${renderTodayFoodLog(today)}
  `;

  // Animate progress bars after DOM insertion
  requestAnimationFrame(() => {
    document.querySelectorAll('.progress-bar__fill').forEach(bar => {
      const width = bar.dataset.width;
      if (width) bar.style.width = width;
    });
  });
}


// ─── Calculate Today's Stats ─────────────────────────────────

function calculateTodayStats(today) {
  const foods     = GrowFitStorage.getFoodsForDate(today);
  const exercises = GrowFitStorage.getExercisesForDate(today);
  const journal   = GrowFitStorage.getJournalForDate(today);

  // Nutrition totals
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  foods.forEach(f => {
    totalCalories += Number(f.calories) || 0;
    totalProtein  += Number(f.protein)  || 0;
    totalCarbs    += Number(f.carbs)    || 0;
    totalFat      += Number(f.fat)      || 0;
  });

  // Exercise totals
  let totalDuration = 0;
  exercises.forEach(e => {
    totalDuration += Number(e.duration) || 0;
  });

  return {
    calories:       Math.round(totalCalories),
    protein:        Math.round(totalProtein),
    carbs:          Math.round(totalCarbs),
    fat:            Math.round(totalFat),
    exerciseCount:  exercises.length,
    exerciseDuration: totalDuration,
    foodCount:      foods.length,
    hasJournal:     !!journal,
    journalSleep:   journal ? journal.sleep : null,
  };
}


// ─── Card Renderers ──────────────────────────────────────────

function renderCalorieCard(stats, user) {
  const target = user.targetCalories || 2500;
  const pct = Math.min(Math.round((stats.calories / target) * 100), 100);
  const fillClass = pct > 100 ? 'progress-bar__fill--over'
                  : pct > 85  ? 'progress-bar__fill--warning'
                  :              '';

  return `
    <div class="card card--accent animate-in">
      <div class="card__label">
        <span class="card__label-icon">🔥</span>
        Calories
      </div>
      <div class="card__row">
        <span class="card__value">${stats.calories}</span>
        <span class="card__target">/ ${target} kcal</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar__fill ${fillClass}" data-width="${pct}%" style="width: 0%"></div>
      </div>
      <p class="card__sub">${pct}% of daily target</p>
    </div>
  `;
}

function renderProteinCard(stats, user) {
  const target = user.targetProtein || 100;
  const pct = Math.min(Math.round((stats.protein / target) * 100), 100);

  return `
    <div class="card animate-in">
      <div class="card__label">
        <span class="card__label-icon">🥚</span>
        Protein
      </div>
      <div class="card__row">
        <span class="card__value card__value--accent">${stats.protein}g</span>
        <span class="card__target">/ ${target}g</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar__fill" data-width="${pct}%" style="width: 0%"></div>
      </div>
      <p class="card__sub">${pct}% of daily target</p>
    </div>
  `;
}

function renderExerciseCard(stats) {
  return `
    <div class="card animate-in">
      <div class="card__label">
        <span class="card__label-icon">💪</span>
        Exercise
      </div>
      <span class="card__value">${stats.exerciseCount}</span>
      <p class="card__sub">
        ${stats.exerciseCount === 1 ? 'workout' : 'workouts'} today
        ${stats.exerciseDuration > 0 ? ' · ' + formatDuration(stats.exerciseDuration) : ''}
      </p>
    </div>
  `;
}

function renderWeightCard() {
  const latest = GrowFitStorage.getLatestWeight();
  const previous = GrowFitStorage.getPreviousWeight();

  let weightDisplay = '—';
  let changeHTML = '<p class="card__sub">No records yet</p>';

  if (latest) {
    weightDisplay = latest.weight + ' kg';
    if (previous) {
      const diff = (latest.weight - previous.weight).toFixed(1);
      const sign = diff > 0 ? '+' : '';
      const badgeClass = diff > 0 ? 'badge--up' : diff < 0 ? 'badge--down' : 'badge--neutral';
      const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
      changeHTML = `<span class="badge ${badgeClass}">${arrow} ${sign}${diff} kg</span>`;
    } else {
      changeHTML = '<p class="card__sub">First record ✓</p>';
    }
  }

  return `
    <div class="card animate-in">
      <div class="card__label">
        <span class="card__label-icon">⚖️</span>
        Weight
      </div>
      <span class="card__value">${weightDisplay}</span>
      ${changeHTML}
    </div>
  `;
}


// ─── Daily Checklist ─────────────────────────────────────────

function renderDailyChecklist(stats, today) {
  const exerciseDone  = stats.exerciseCount > 0;
  const nutritionDone = stats.foodCount > 0;
  const journalDone   = stats.hasJournal;
  const sleepLogged   = stats.journalSleep !== null;

  const items = [
    { label: 'Exercise',  done: exerciseDone,  status: exerciseDone  ? `${stats.exerciseCount} done` : 'Not yet' },
    { label: 'Nutrition', done: nutritionDone, status: nutritionDone ? `${stats.foodCount} items logged` : 'Not yet' },
    { label: 'Journal',   done: journalDone,   status: journalDone   ? 'Completed' : 'Not yet' },
    { label: 'Sleep',     done: sleepLogged,   status: sleepLogged   ? `${stats.journalSleep}h logged` : 'Not yet' },
  ];

  const checkSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';

  return `
    <div class="checklist">
      ${items.map(item => `
        <div class="checklist-item ${item.done ? 'checklist-item--done' : ''} animate-in">
          <div class="checklist-item__check">${checkSVG}</div>
          <span class="checklist-item__label">${item.label}</span>
          <span class="checklist-item__status">${item.status}</span>
        </div>
      `).join('')}
    </div>
  `;
}


// ─── Today's Food Log ────────────────────────────────────────

function renderTodayFoodLog(today) {
  const foods = GrowFitStorage.getFoodsForDate(today);

  if (foods.length === 0) return '';

  const mealIcons = {
    breakfast: '🌅',
    lunch:     '☀️',
    snack:     '🍪',
    dinner:    '🌙',
  };

  return `
    <h2 class="section-title animate-in">
      <span class="section-title__icon">🍽️</span>
      Today's Food
    </h2>
    <div class="meals-summary">
      ${foods.map(f => `
        <div class="meal-item animate-in">
          <div class="meal-item__info">
            <span class="meal-item__icon">${mealIcons[f.mealType] || '🍽️'}</span>
            <div>
              <div class="meal-item__name">${escapeHTML(f.name)}</div>
              <div class="meal-item__detail">${f.mealType ? f.mealType.charAt(0).toUpperCase() + f.mealType.slice(1) : ''} · P: ${f.protein}g</div>
            </div>
          </div>
          <span class="meal-item__cals">${f.calories} kcal</span>
        </div>
      `).join('')}
    </div>
  `;
}


// ═══════════════════════════════════════════════════════════════
// QUICK ADD MODALS
// ═══════════════════════════════════════════════════════════════

// ─── Quick Add: Food ─────────────────────────────────────────

function openQuickAddFood() {
  const pickerHTML = FOOD_LIBRARY.map(f =>
    `<button type="button" class="food-pick-btn" data-food='${JSON.stringify(f).replace(/'/g, "&#39;")}'>${f.name}</button>`
  ).join('');

  const bodyHTML = `
    <p class="form-hint mb-4">Tap a food to auto-fill, or enter manually below.</p>
    <div class="food-picker" id="food-picker">
      ${pickerHTML}
    </div>

    <form id="quick-add-food-form">
      <div class="form-group">
        <label class="form-label" for="food-name">Food name *</label>
        <input class="form-input" type="text" id="food-name" placeholder="e.g. Milk, Paneer, Roti" required>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="food-calories">Calories (kcal)</label>
          <input class="form-input" type="number" id="food-calories" placeholder="0" min="0">
        </div>
        <div class="form-group">
          <label class="form-label" for="food-protein">Protein (g)</label>
          <input class="form-input" type="number" id="food-protein" placeholder="0" min="0">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="food-carbs">Carbs (g)</label>
          <input class="form-input" type="number" id="food-carbs" placeholder="0" min="0">
        </div>
        <div class="form-group">
          <label class="form-label" for="food-fat">Fat (g)</label>
          <input class="form-input" type="number" id="food-fat" placeholder="0" min="0">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="food-meal">Meal type</label>
        <select class="form-select" id="food-meal">
          <option value="breakfast">🌅 Breakfast</option>
          <option value="lunch">☀️ Lunch</option>
          <option value="snack">🍪 Snack</option>
          <option value="dinner">🌙 Dinner</option>
        </select>
      </div>

      <p class="form-hint">Values are approximate estimates.</p>

      <div class="modal__footer" style="padding: var(--space-4) 0 0 0; border: none;">
        <button type="button" class="btn btn--secondary btn--full" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn--primary btn--full">Save</button>
      </div>
    </form>
  `;

  openModal('Add Food', bodyHTML);

  // Auto-select meal type based on current time
  const hour = new Date().getHours();
  const mealSelect = document.getElementById('food-meal');
  if (hour < 10)       mealSelect.value = 'breakfast';
  else if (hour < 14)  mealSelect.value = 'lunch';
  else if (hour < 17)  mealSelect.value = 'snack';
  else                 mealSelect.value = 'dinner';

  // Food picker clicks
  document.getElementById('food-picker').addEventListener('click', (e) => {
    const btn = e.target.closest('.food-pick-btn');
    if (!btn) return;
    const food = JSON.parse(btn.dataset.food);
    document.getElementById('food-name').value = food.name;
    document.getElementById('food-calories').value = food.calories;
    document.getElementById('food-protein').value = food.protein;
    document.getElementById('food-carbs').value = food.carbs;
    document.getElementById('food-fat').value = food.fat;
  });

  // Form submission
  document.getElementById('quick-add-food-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleSaveFood();
  });
}

function handleSaveFood() {
  const name     = document.getElementById('food-name').value.trim();
  const calories = Number(document.getElementById('food-calories').value) || 0;
  const protein  = Number(document.getElementById('food-protein').value)  || 0;
  const carbs    = Number(document.getElementById('food-carbs').value)    || 0;
  const fat      = Number(document.getElementById('food-fat').value)      || 0;
  const mealType = document.getElementById('food-meal').value;

  if (!name) {
    showToast('Please enter a food name', 'warning');
    return;
  }

  GrowFitStorage.addFood({
    name,
    calories,
    protein,
    carbs,
    fat,
    mealType,
    date: getTodayDate(),
  });

  closeModal();
  showToast(`${name} added!`, 'success');
  renderDashboard();
}


// ─── Quick Add: Exercise ─────────────────────────────────────

function openQuickAddExercise() {
  const pickerHTML = EXERCISE_LIBRARY.map(ex =>
    `<button type="button" class="exercise-pick-btn" data-exercise='${JSON.stringify(ex).replace(/'/g, "&#39;")}'>
      <span class="emoji">${ex.icon}</span>
      <span>${ex.name}</span>
    </button>`
  ).join('');

  const bodyHTML = `
    <p class="form-hint mb-4">Tap an exercise to auto-fill, or enter your own.</p>
    <div class="exercise-picker" id="exercise-picker">
      ${pickerHTML}
    </div>

    <form id="quick-add-exercise-form">
      <div class="form-group">
        <label class="form-label" for="exercise-name">Exercise name *</label>
        <input class="form-input" type="text" id="exercise-name" placeholder="e.g. Push-ups, Walking" required>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="exercise-sets">Sets</label>
          <input class="form-input" type="number" id="exercise-sets" placeholder="3" min="1" value="3">
        </div>
        <div class="form-group">
          <label class="form-label" for="exercise-reps">Reps</label>
          <input class="form-input" type="number" id="exercise-reps" placeholder="10" min="1" value="10">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="exercise-duration">Duration (minutes)</label>
        <input class="form-input" type="number" id="exercise-duration" placeholder="15" min="0">
      </div>

      <div class="form-group">
        <label class="form-label" for="exercise-notes">Notes (optional)</label>
        <textarea class="form-textarea" id="exercise-notes" placeholder="How did it feel?" rows="2"></textarea>
      </div>

      <div class="modal__footer" style="padding: var(--space-4) 0 0 0; border: none;">
        <button type="button" class="btn btn--secondary btn--full" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn--primary btn--full">Save</button>
      </div>
    </form>
  `;

  openModal('Add Exercise', bodyHTML);

  // Exercise picker clicks
  document.getElementById('exercise-picker').addEventListener('click', (e) => {
    const btn = e.target.closest('.exercise-pick-btn');
    if (!btn) return;
    const ex = JSON.parse(btn.dataset.exercise);
    document.getElementById('exercise-name').value = ex.name;
    document.getElementById('exercise-sets').value = ex.defaultSets;
    document.getElementById('exercise-reps').value = ex.defaultReps;
    if (ex.isDuration && ex.defaultDuration) {
      document.getElementById('exercise-duration').value = ex.defaultDuration;
    }
  });

  // Form submission
  document.getElementById('quick-add-exercise-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleSaveExercise();
  });
}

function handleSaveExercise() {
  const name     = document.getElementById('exercise-name').value.trim();
  const sets     = Number(document.getElementById('exercise-sets').value) || 0;
  const reps     = Number(document.getElementById('exercise-reps').value) || 0;
  const duration = Number(document.getElementById('exercise-duration').value) || 0;
  const notes    = document.getElementById('exercise-notes').value.trim();

  if (!name) {
    showToast('Please enter an exercise name', 'warning');
    return;
  }

  GrowFitStorage.addExercise({
    name,
    sets,
    reps,
    duration,
    notes,
    date: getTodayDate(),
  });

  closeModal();
  showToast(`${name} logged!`, 'success');
  renderDashboard();
}


// ─── Quick Add: Weight ───────────────────────────────────────

function openQuickAddWeight() {
  const latest = GrowFitStorage.getLatestWeight();
  const placeholder = latest ? latest.weight : '65';

  const bodyHTML = `
    <form id="quick-add-weight-form">
      <div class="form-group">
        <label class="form-label" for="weight-value">Weight (kg) *</label>
        <input class="form-input" type="number" id="weight-value"
               placeholder="${placeholder}" step="0.1" min="20" max="300" required
               style="font-size: var(--font-2xl); font-weight: 700; text-align: center; padding: var(--space-5);">
      </div>

      <div class="form-group">
        <label class="form-label" for="weight-notes">Notes (optional)</label>
        <textarea class="form-textarea" id="weight-notes" placeholder="e.g. Morning weight, after meal" rows="2"></textarea>
      </div>

      ${latest ? `<p class="form-hint">Last recorded: ${latest.weight} kg on ${formatDate(latest.date)}</p>` : ''}

      <div class="modal__footer" style="padding: var(--space-4) 0 0 0; border: none;">
        <button type="button" class="btn btn--secondary btn--full" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn--primary btn--full">Save</button>
      </div>
    </form>
  `;

  openModal('Log Weight', bodyHTML);

  // Auto-focus weight input
  setTimeout(() => document.getElementById('weight-value').focus(), 100);

  // Form submission
  document.getElementById('quick-add-weight-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleSaveWeight();
  });
}

function handleSaveWeight() {
  const weight = Number(document.getElementById('weight-value').value);
  const notes  = document.getElementById('weight-notes').value.trim();

  if (!weight || weight < 20 || weight > 300) {
    showToast('Please enter a valid weight', 'warning');
    return;
  }

  GrowFitStorage.addWeightRecord({
    weight,
    notes,
    date: getTodayDate(),
  });

  // Also update user's current weight
  GrowFitStorage.updateUser({ currentWeight: weight });

  closeModal();
  showToast(`Weight recorded: ${weight} kg`, 'success');
  renderDashboard();
}


// ─── Quick Add: Journal ──────────────────────────────────────

function openQuickAddJournal() {
  const today = getTodayDate();
  const existing = GrowFitStorage.getJournalForDate(today);

  const moods = [
    { value: 'great', emoji: '😄', label: 'Great' },
    { value: 'good',  emoji: '🙂', label: 'Good' },
    { value: 'okay',  emoji: '😐', label: 'Okay' },
    { value: 'low',   emoji: '😔', label: 'Low' },
    { value: 'bad',   emoji: '😫', label: 'Bad' },
  ];

  const energyLevels = [
    { value: 'high',   emoji: '⚡', label: 'High' },
    { value: 'medium', emoji: '🔋', label: 'Medium' },
    { value: 'low',    emoji: '🪫', label: 'Low' },
  ];

  const bodyHTML = `
    <form id="quick-add-journal-form">

      <div class="form-group">
        <label class="form-label">How are you feeling?</label>
        <div class="mood-selector" id="mood-selector">
          ${moods.map(m => `
            <button type="button" class="mood-btn ${existing && existing.mood === m.value ? 'selected' : ''}" data-value="${m.value}">
              <span class="emoji">${m.emoji}</span>
              <span class="label">${m.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Energy level</label>
        <div class="mood-selector" id="energy-selector">
          ${energyLevels.map(e => `
            <button type="button" class="mood-btn ${existing && existing.energy === e.value ? 'selected' : ''}" data-value="${e.value}">
              <span class="emoji">${e.emoji}</span>
              <span class="label">${e.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="journal-sleep">Sleep (hours)</label>
        <input class="form-input" type="number" id="journal-sleep"
               placeholder="8" min="0" max="24" step="0.5"
               value="${existing ? existing.sleep || '' : ''}">
      </div>

      <div class="form-group">
        <label class="form-label" for="journal-notes">Notes (optional)</label>
        <textarea class="form-textarea" id="journal-notes"
                  placeholder="How was your day? Any thoughts?"
                  rows="3">${existing ? existing.notes || '' : ''}</textarea>
      </div>

      ${existing ? '<p class="form-hint">Updating today\'s existing entry.</p>' : ''}

      <div class="modal__footer" style="padding: var(--space-4) 0 0 0; border: none;">
        <button type="button" class="btn btn--secondary btn--full" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn--primary btn--full">Save</button>
      </div>
    </form>
  `;

  openModal('Daily Journal', bodyHTML);

  // Mood selector logic
  setupSelectorGroup('mood-selector');
  setupSelectorGroup('energy-selector');

  // Form submission
  document.getElementById('quick-add-journal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleSaveJournal();
  });
}

/**
 * Make a group of mood/energy buttons behave like a single-select.
 */
function setupSelectorGroup(containerId) {
  const container = document.getElementById(containerId);
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.mood-btn');
    if (!btn) return;
    container.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
}

function handleSaveJournal() {
  const moodBtn   = document.querySelector('#mood-selector .mood-btn.selected');
  const energyBtn = document.querySelector('#energy-selector .mood-btn.selected');
  const sleep     = document.getElementById('journal-sleep').value;
  const notes     = document.getElementById('journal-notes').value.trim();

  const mood   = moodBtn   ? moodBtn.dataset.value   : null;
  const energy = energyBtn ? energyBtn.dataset.value  : null;

  if (!mood) {
    showToast('Please select your mood', 'warning');
    return;
  }

  GrowFitStorage.addJournalEntry({
    mood,
    energy,
    sleep: sleep ? Number(sleep) : null,
    notes,
    date: getTodayDate(),
  });

  closeModal();
  showToast('Journal saved!', 'success');
  renderDashboard();
}
