/**
 * GrowFit — Progress Page (Stage 5 Implementation)
 * Renders weight trends with an SVG chart, workout consistency summary, and weight log history.
 */

function renderProgress() {
  const container = document.getElementById('page-progress');
  const weightLogs = GrowFitStorage.getWeightLogs();
  const profile = GrowFitStorage.getProfile();
  const workouts = GrowFitStorage.getWorkouts();

  const currentWeight = profile.currentWeightKg || (weightLogs.length ? weightLogs[weightLogs.length - 1].weightKg : '--');
  const targetWeight = profile.targetWeightKg || '--';
  const startWeight = profile.startingWeightKg || (weightLogs.length ? weightLogs[0].weightKg : '--');

  container.innerHTML = `
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Progress & Trends</h1>
        <p class="page-header__sub">Track physical body development & history</p>
      </div>
      <button class="btn btn--primary" onclick="openLogWeightModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Log Weight
      </button>
    </div>

    <!-- Weight Stats Summary -->
    <div class="stats-grid animate-in" style="margin-bottom: var(--space-4);">
      <div class="stat-card">
        <span class="stat-card__label">Current Weight</span>
        <span class="stat-card__value">${currentWeight} <span style="font-size:0.8rem; font-weight:normal;">kg</span></span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Target Weight</span>
        <span class="stat-card__value">${targetWeight} <span style="font-size:0.8rem; font-weight:normal;">kg</span></span>
      </div>
    </div>

    <!-- Weight Chart Section -->
    <div class="card animate-in" style="margin-bottom: var(--space-4); padding: var(--space-3); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
      <h3 style="margin-bottom: var(--space-2); font-size: 1rem; color: var(--text-primary);">Weight Trend (kg)</h3>
      ${renderWeightChart(weightLogs)}
    </div>

    <!-- Weight Log History -->
    <div class="section-title animate-in" style="display:flex; justify-between; align-items:center; margin-bottom: var(--space-3);">
      <h2>Weight History</h2>
    </div>

    ${weightLogs.length === 0 ? `
      <div class="empty-state animate-in">
        <h3 class="empty-state__title">No Weight Records</h3>
        <p class="empty-state__desc">Log your weight periodically to see your progress curve over time.</p>
        <button class="btn btn--primary" onclick="openLogWeightModal()">Log Weight Now</button>
      </div>
    ` : `
      <div class="log-list animate-in">
        ${weightLogs.slice().reverse().map(item => `
          <div class="log-item" style="display:flex; justify-content:space-between; align-items:center; background: var(--bg-card); padding: var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-2); border: 1px solid var(--border-color);">
            <div>
              <div style="font-weight: 600; color: var(--text-primary);">${item.weightKg} kg</div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${formatDate(item.date)}</div>
            </div>
            <button class="btn-icon" onclick="deleteWeightLog('${item.id}')" title="Delete record" style="color: var(--color-danger); background:transparent; border:none; cursor:pointer;">
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
 * Generate a clean, standalone responsive SVG chart line for weight history
 */
function renderWeightChart(logs) {
  if (!logs || logs.length < 2) {
    return `<div style="text-align:center; padding: var(--space-4); color: var(--text-muted); font-size: 0.85rem;">Log at least 2 weight entries to see trend chart visualization.</div>`;
  }

  const width = 300;
  const height = 120;
  const padding = 20;

  const sortedLogs = logs.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const weights = sortedLogs.map(l => l.weightKg);

  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;

  const points = sortedLogs.map((item, idx) => {
    const x = padding + (idx / (sortedLogs.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((item.weightKg - minW) / (maxW - minW || 1)) * (height - 2 * padding);
    return { x, y, weight: item.weightKg, date: item.date };
  });

  const pathD = points.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');

  return `
    <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; overflow:visible;">
      <!-- Background Grid lines -->
      <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="var(--border-color)" stroke-dasharray="2,2" />
      <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" stroke="var(--border-color)" stroke-dasharray="2,2" />
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--border-color)" stroke-dasharray="2,2" />

      <!-- Trend Line -->
      <path d="${pathD}" fill="none" stroke="var(--color-accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Data Points -->
      ${points.map(pt => `
        <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="var(--bg-dark)" stroke="var(--color-accent)" stroke-width="2" />
        <text x="${pt.x}" y="${pt.y - 8}" text-anchor="middle" fill="var(--text-muted)" font-size="9" font-weight="600">${pt.weight}</text>
      `).join('')}
    </svg>
  `;
}

/**
 * Open Modal to Log Weight
 */
function openLogWeightModal() {
  const today = new Date().toISOString().split('T')[0];
  const profile = GrowFitStorage.getProfile();

  const html = `
    <form id="weight-form" onsubmit="handleSaveWeight(event)">
      <div class="form-group">
        <label class="form-label" for="weight-val">Weight (kg)</label>
        <input type="number" class="form-control" id="weight-val" step="0.1" min="20" max="300" placeholder="e.g. 62.5" value="${profile.currentWeightKg || ''}" required>
      </div>

      <div class="form-group">
        <label class="form-label" for="weight-date">Date</label>
        <input type="date" class="form-control" id="weight-date" value="${today}" required>
      </div>

      <button type="submit" class="btn btn--primary btn--full" style="margin-top: var(--space-3);">Save Weight</button>
    </form>
  `;

  openModal('Log Body Weight', html);
}

function handleSaveWeight(e) {
  e.preventDefault();
  const weightKg = parseFloat(document.getElementById('weight-val').value);
  const date = document.getElementById('weight-date').value;

  if (!weightKg || isNaN(weightKg)) {
    showToast('Please enter a valid weight number', 'error');
    return;
  }

  GrowFitStorage.addWeightLog(weightKg, date);
  closeModal();
  showToast('Weight logged successfully!');
  renderProgress();
}

function deleteWeightLog(id) {
  showConfirmDialog('Are you sure you want to delete this weight record?', () => {
    GrowFitStorage.deleteWeightLog(id);
    showToast('Weight entry deleted');
    renderProgress();
  });
}

