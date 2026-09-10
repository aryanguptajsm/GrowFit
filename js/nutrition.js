/**
 * GrowFit — Nutrition Page (Stage 4 Implementation)
 * Allows logging food entries, viewing daily log summaries, selecting common Indian foods, and tracking protein/calories.
 */

function renderNutrition() {
  const container = document.getElementById('page-nutrition');
  const todayStr = new Date().toISOString().split('T')[0];
  const dailySummary = GrowFitStorage.getDailySummary(todayStr);
  const foodLog = GrowFitStorage.getFoodLogs(todayStr);
  const profile = GrowFitStorage.getProfile();

  const calorieGoal = profile.targetCalories || 2500;
  const proteinGoal = profile.targetProtein || 100;

  const calPercent = Math.min(100, Math.round((dailySummary.calories / calorieGoal) * 100));
  const protPercent = Math.min(100, Math.round((dailySummary.protein / proteinGoal) * 100));

  container.innerHTML = `
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Nutrition Tracker</h1>
        <p class="page-header__sub">Track meals & fuel your progress</p>
      </div>
      <button class="btn btn--primary" onclick="openLogFoodModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Log Meal
      </button>
    </div>

    <!-- Daily Progress Cards -->
    <div class="stats-grid animate-in" style="margin-bottom: var(--space-4);">
      <div class="stat-card">
        <span class="stat-card__label">Calories Today</span>
        <span class="stat-card__value">${dailySummary.calories} <span style="font-size:0.8rem; font-weight:normal;">/ ${calorieGoal} kcal</span></span>
        <div style="width: 100%; background: var(--border-color); height: 6px; border-radius: 3px; margin-top: 8px; overflow:hidden;">
          <div style="width: ${calPercent}%; background: var(--color-accent); height: 100%;"></div>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-card__label">Protein Today</span>
        <span class="stat-card__value">${dailySummary.protein} <span style="font-size:0.8rem; font-weight:normal;">/ ${proteinGoal} g</span></span>
        <div style="width: 100%; background: var(--border-color); height: 6px; border-radius: 3px; margin-top: 8px; overflow:hidden;">
          <div style="width: ${protPercent}%; background: var(--color-success); height: 100%;"></div>
        </div>
      </div>
    </div>

    <!-- Food Log List -->
    <div class="section-title animate-in" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-3);">
      <h2>Today's Food Log</h2>
      <span style="font-size:0.85rem; color:var(--text-muted);">${formatDate(todayStr)}</span>
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
        <p class="empty-state__desc">Track what you eat to ensure you're getting sufficient calories and protein!</p>
        <button class="btn btn--primary" onclick="openLogFoodModal()">Log Meal Now</button>
      </div>
    ` : `
      <div class="log-list animate-in">
        ${foodLog.slice().reverse().map(item => `
          <div class="log-item" style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-card); padding: var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-2); border: 1px solid var(--border-color);">
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">${escapeHTML(item.foodName)}</div>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">
                ${item.calories || 0} kcal · ${item.protein || 0}g protein 
                ${item.servings ? ` (${item.servings} serving${item.servings > 1 ? 's' : ''})` : ''}
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${item.mealType || 'Meal'}</div>
            </div>
            <button class="btn-icon" onclick="deleteFoodLog('${item.id}')" title="Delete entry" style="color: var(--color-danger); background:transparent; border:none; cursor:pointer;">
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
 * Open Modal to Log Food
 */
function openLogFoodModal() {
  const foods = GrowFitStorage.getFoodLibrary();
  const today = new Date().toISOString().split('T')[0];

  const html = `
    <form id="food-form" onsubmit="handleSaveFood(event)">
      <div class="form-group">
        <label class="form-label" for="food-select">Select Food / Dish</label>
        <select class="form-control" id="food-select" required onchange="handleFoodSelectChange(this)">
          <option value="">-- Choose Food from Library --</option>
          ${foods.map(f => `<option value="${escapeHTML(f.name)}" data-cal="${f.calories}" data-prot="${f.protein}">${escapeHTML(f.name)} (~${f.calories} kcal, ${f.protein}g protein)</option>`).join('')}
          <option value="CUSTOM">+ Add Custom Item</option>
        </select>
      </div>

      <div class="form-group" id="custom-food-group" style="display:none;">
        <label class="form-label" for="food-custom-name">Custom Food Name</label>
        <input type="text" class="form-control" id="food-custom-name" placeholder="e.g. Protein Smoothie">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
        <div class="form-group">
          <label class="form-label" for="food-cal">Calories (kcal)</label>
          <input type="number" class="form-control" id="food-cal" min="0" placeholder="e.g. 350" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="food-prot">Protein (g)</label>
          <input type="number" class="form-control" id="food-prot" min="0" step="0.5" placeholder="e.g. 15" required>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
        <div class="form-group">
          <label class="form-label" for="food-meal">Meal Type</label>
          <select class="form-control" id="food-meal">
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack" selected>Snack</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="food-date">Date</label>
          <input type="date" class="form-control" id="food-date" value="${today}" required>
        </div>
      </div>

      <button type="submit" class="btn btn--primary btn--full" style="margin-top: var(--space-3);">Save Food Log</button>
    </form>
  `;

  openModal('Log Meal / Food', html);
}

function handleFoodSelectChange(select) {
  const customGroup = document.getElementById('custom-food-group');
  const calInput = document.getElementById('food-cal');
  const protInput = document.getElementById('food-prot');

  if (select.value === 'CUSTOM') {
    customGroup.style.display = 'block';
    document.getElementById('food-custom-name').required = true;
    calInput.value = '';
    protInput.value = '';
  } else {
    customGroup.style.display = 'none';
    document.getElementById('food-custom-name').required = false;
    const selectedOpt = select.options[select.selectedIndex];
    if (selectedOpt && selectedOpt.dataset.cal) {
      calInput.value = selectedOpt.dataset.cal;
      protInput.value = selectedOpt.dataset.prot;
    }
  }
}

function handleSaveFood(e) {
  e.preventDefault();
  const select = document.getElementById('food-select');
  let name = select.value;
  if (name === 'CUSTOM') {
    name = document.getElementById('food-custom-name').value.trim();
  }

  if (!name) {
    showToast('Please select or enter a food name', 'error');
    return;
  }

  const foodData = {
    foodName: name,
    calories: parseInt(document.getElementById('food-cal').value) || 0,
    protein: parseFloat(document.getElementById('food-prot').value) || 0,
    mealType: document.getElementById('food-meal').value,
    date: document.getElementById('food-date').value
  };

  GrowFitStorage.addFood(foodData);
  closeModal();
  showToast('Meal logged successfully!');
  renderNutrition();
}

function deleteFoodLog(id) {
  showConfirmDialog('Are you sure you want to delete this food log entry?', () => {
    GrowFitStorage.deleteFood(id);
    showToast('Food entry deleted');
    renderNutrition();
  });
}

