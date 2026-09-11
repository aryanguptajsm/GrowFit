/**
 * GrowFit — Nutrition Page (Stage 2)
 *
 * Renders:
 *  - Page header with "Log Meal" CTA
 *  - Today's calorie + protein stat cards with progress bars
 *  - Macro breakdown bar (protein / carbs / fat)
 *  - Today's food log grouped by meal type
 *
 * Storage: uses GrowFitStorage adapter methods
 * (getProfile, getDailySummary, getFoodLogs, getFoodLibrary, addFood, deleteFood)
 */

// ─── Render Nutrition Page ────────────────────────────────────

function renderNutrition() {
  const container    = document.getElementById('page-nutrition');
  const todayStr     = getTodayDate();
  const profile      = GrowFitStorage.getProfile();
  const summary      = GrowFitStorage.getDailySummary(todayStr);
  const foodLog      = GrowFitStorage.getFoodLogs(todayStr);

  const calorieGoal  = profile.targetCalories || 2500;
  const proteinGoal  = profile.targetProtein  || 100;

  const calPct  = Math.min(100, Math.round((summary.calories / calorieGoal) * 100));
  const protPct = Math.min(100, Math.round((summary.protein  / proteinGoal) * 100));

  // ── Macro bar proportions
  const macroTotal = summary.protein + summary.carbs + summary.fat || 1;
  const protW  = Math.round((summary.protein / macroTotal) * 100);
  const carbW  = Math.round((summary.carbs   / macroTotal) * 100);
  const fatW   = 100 - protW - carbW;

  // ── Group food log by meal type
  const mealOrder  = ['breakfast', 'lunch', 'snack', 'dinner'];
  const mealLabels = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', snack: '🍪 Snack', dinner: '🌙 Dinner' };
  const grouped = {};
  mealOrder.forEach(m => { grouped[m] = []; });
  foodLog.forEach(item => {
    const type = (item.mealType || 'snack').toLowerCase();
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(item);
  });

  const trashSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>`;

  container.innerHTML = `

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Nutrition</h1>
        <p class="page-header__sub">Fuel your gains every day</p>
      </div>
      <button class="btn btn--primary" id="log-food-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Log Meal
      </button>
    </div>

    <!-- ── Calorie & Protein Cards ──────────────────────────── -->
    <div class="stats-grid animate-in" style="margin-bottom:var(--space-4);">
      <div class="stat-card ${calPct >= 100 ? 'card--accent' : ''}">
        <span class="stat-card__label">🔥 Calories Today</span>
        <span class="stat-card__value">${summary.calories}
          <span style="font-size:var(--font-sm); font-weight:400; color:var(--text-muted);">/ ${calorieGoal}</span>
        </span>
        <div class="stat-card__bar">
          <div class="stat-card__bar-fill" id="cal-bar" style="width:0%"></div>
        </div>
        <span style="font-size:var(--font-xs); color:var(--text-muted);">${calPct}% of daily target</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">🥚 Protein Today</span>
        <span class="stat-card__value" style="color:var(--accent)">${summary.protein}g
          <span style="font-size:var(--font-sm); font-weight:400; color:var(--text-muted);">/ ${proteinGoal}g</span>
        </span>
        <div class="stat-card__bar">
          <div class="stat-card__bar-fill stat-card__bar-fill--protein" id="prot-bar" style="width:0%"></div>
        </div>
        <span style="font-size:var(--font-xs); color:var(--text-muted);">${protPct}% of daily target</span>
      </div>
    </div>

    <!-- ── Macro Breakdown ───────────────────────────────────── -->
    ${summary.calories > 0 ? `
      <div class="card animate-in" style="margin-bottom:var(--space-5);">
        <div class="card__label"><span class="card__label-icon">📊</span> Macros</div>
        <div class="macro-bar">
          <div class="macro-bar__segment macro-bar__segment--protein" style="width:${protW}%"></div>
          <div class="macro-bar__segment macro-bar__segment--carbs"   style="width:${carbW}%"></div>
          <div class="macro-bar__segment macro-bar__segment--fat"     style="width:${Math.max(fatW, 0)}%"></div>
        </div>
        <div class="macro-legend">
          <div class="macro-legend__item">
            <div class="macro-legend__dot macro-legend__dot--protein"></div>
            Protein ${summary.protein}g
          </div>
          <div class="macro-legend__item">
            <div class="macro-legend__dot macro-legend__dot--carbs"></div>
            Carbs ${summary.carbs}g
          </div>
          <div class="macro-legend__item">
            <div class="macro-legend__dot macro-legend__dot--fat"></div>
            Fat ${summary.fat}g
          </div>
        </div>
      </div>
    ` : ''}

    <!-- ── Today's Food Log ──────────────────────────────────── -->
    <div class="section-header animate-in">
      <h2>Today's Log</h2>
      <span class="section-header__label">${formatDate(todayStr)}</span>
    </div>

    ${foodLog.length === 0 ? `
      <div class="empty-state animate-in">
        <div class="empty-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          </svg>
        </div>
        <h3 class="empty-state__title">No Meals Logged Today</h3>
        <p class="empty-state__desc">Track what you eat to hit your calorie and protein targets.</p>
        <button class="btn btn--primary" style="margin-top:var(--space-4);" id="log-food-empty-btn">Log Your First Meal</button>
      </div>
    ` : `
      <div class="log-list animate-in" id="food-log-list">
        ${mealOrder.map(mealType => {
          const items = grouped[mealType] || [];
          if (!items.length) return '';
          const mealCals = items.reduce((s, f) => s + (Number(f.calories) || 0), 0);
          return `
            <div style="margin-bottom:var(--space-4);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
                <span style="font-size:var(--font-sm); font-weight:600; color:var(--text-secondary);">${mealLabels[mealType]}</span>
                <span style="font-size:var(--font-xs); color:var(--text-muted);">${mealCals} kcal</span>
              </div>
              ${items.map(item => `
                <div class="log-item">
                  <div class="log-item__main">
                    <div class="log-item__title">${escapeHTML(item.foodName || item.name || '—')}</div>
                    <div class="log-item__sub">
                      ${item.calories || 0} kcal · ${item.protein || 0}g P · ${item.carbs || 0}g C · ${item.fat || 0}g F
                    </div>
                  </div>
                  <div class="log-item__right">
                    <button class="btn-icon-danger" data-delete-food="${item.id}" title="Delete">
                      ${trashSVG}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      </div>
    `}
  `;

  // Animate progress bars
  requestAnimationFrame(() => {
    const calBar  = document.getElementById('cal-bar');
    const protBar = document.getElementById('prot-bar');
    if (calBar)  calBar.style.width  = calPct  + '%';
    if (protBar) protBar.style.width = protPct + '%';
  });

  // ── Event Listeners ────────────────────────────────────────
  document.getElementById('log-food-btn').addEventListener('click', openLogFoodModal);

  const emptyBtn = document.getElementById('log-food-empty-btn');
  if (emptyBtn) emptyBtn.addEventListener('click', openLogFoodModal);

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-delete-food]');
    if (!btn) return;
    showConfirmDialog('Delete this food entry?', () => {
      GrowFitStorage.deleteFood(btn.dataset.deleteFood);
      showToast('Food entry deleted', 'info');
      renderNutrition();
    });
  });
}


// ─── Log Food Modal ───────────────────────────────────────────

function openLogFoodModal() {
  const foods = GrowFitStorage.getFoodLibrary();
  const hour  = new Date().getHours();
  const defaultMeal = hour < 10 ? 'Breakfast' : hour < 14 ? 'Lunch' : hour < 17 ? 'Snack' : 'Dinner';

  const pickerHTML = foods.map(f =>
    `<button type="button" class="food-pick-btn"
       data-cal="${f.calories}" data-prot="${f.protein}"
       data-carbs="${f.carbs || 0}" data-fat="${f.fat || 0}"
       data-name="${escapeHTML(f.name)}">${escapeHTML(f.name)}</button>`
  ).join('');

  const html = `
    <p class="form-hint" style="margin-bottom:var(--space-3);">Tap a food to auto-fill, or type your own.</p>
    <div class="food-picker" id="food-picker">${pickerHTML}</div>

    <form id="food-form">
      <div class="form-group">
        <label class="form-label" for="food-name">Food / Dish Name *</label>
        <input type="text" class="form-control" id="food-name"
               placeholder="e.g. Dal, Oats, Chicken Breast…" required>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3);">
        <div class="form-group">
          <label class="form-label" for="food-cal">Calories (kcal)</label>
          <input type="number" class="form-control" id="food-cal" min="0" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label" for="food-prot">Protein (g)</label>
          <input type="number" class="form-control" id="food-prot" min="0" step="0.5" placeholder="0">
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3);">
        <div class="form-group">
          <label class="form-label" for="food-carbs">Carbs (g)</label>
          <input type="number" class="form-control" id="food-carbs" min="0" step="0.5" placeholder="0">
        </div>
        <div class="form-group">
          <label class="form-label" for="food-fat">Fat (g)</label>
          <input type="number" class="form-control" id="food-fat" min="0" step="0.5" placeholder="0">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="food-meal">Meal Type</label>
        <select class="form-control" id="food-meal">
          <option value="Breakfast" ${defaultMeal === 'Breakfast' ? 'selected' : ''}>🌅 Breakfast</option>
          <option value="Lunch"     ${defaultMeal === 'Lunch'     ? 'selected' : ''}>☀️ Lunch</option>
          <option value="Snack"     ${defaultMeal === 'Snack'     ? 'selected' : ''}>🍪 Snack</option>
          <option value="Dinner"    ${defaultMeal === 'Dinner'    ? 'selected' : ''}>🌙 Dinner</option>
        </select>
      </div>

      <p class="form-hint">Nutrition values are approximate.</p>

      <div class="modal__footer" style="padding:var(--space-4) 0 0; border:none;">
        <button type="button" class="btn btn--secondary btn--full" id="food-cancel">Cancel</button>
        <button type="submit" class="btn btn--primary btn--full">Save</button>
      </div>
    </form>
  `;

  openModal('Log Meal', html);

  document.getElementById('food-cancel').addEventListener('click', closeModal);

  // Food picker — fill in fields
  document.getElementById('food-picker').addEventListener('click', e => {
    const btn = e.target.closest('.food-pick-btn');
    if (!btn) return;
    document.getElementById('food-name').value  = btn.dataset.name;
    document.getElementById('food-cal').value   = btn.dataset.cal;
    document.getElementById('food-prot').value  = btn.dataset.prot;
    document.getElementById('food-carbs').value = btn.dataset.carbs;
    document.getElementById('food-fat').value   = btn.dataset.fat;
  });

  document.getElementById('food-form').addEventListener('submit', e => {
    e.preventDefault();
    const name     = document.getElementById('food-name').value.trim();
    const calories = Number(document.getElementById('food-cal').value)   || 0;
    const protein  = Number(document.getElementById('food-prot').value)  || 0;
    const carbs    = Number(document.getElementById('food-carbs').value) || 0;
    const fat      = Number(document.getElementById('food-fat').value)   || 0;
    const mealType = document.getElementById('food-meal').value;

    if (!name) {
      showToast('Please enter a food name', 'warning');
      return;
    }

    GrowFitStorage.addFood({
      name, foodName: name, calories, protein, carbs, fat,
      mealType: mealType.toLowerCase(),
      date: getTodayDate(),
    });

    closeModal();
    showToast(`${name} logged! 🍽️`, 'success');
    renderNutrition();
  });
}
