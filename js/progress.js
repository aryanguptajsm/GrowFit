/**
 * GrowFit — Progress Page (Stage 2)
 *
 * Renders:
 *  - Page header with "Log Weight" CTA
 *  - Weight stats (current, target, total gained/lost)
 *  - SVG weight trend chart with smooth curve + area fill
 *  - Workout activity summary
 *  - Weight history log
 *
 * Storage: uses GrowFitStorage adapter methods
 * (getProfile, getWeightLogs, addWeightLog, deleteWeightLog, getWorkouts)
 */

// ─── Render Progress Page ─────────────────────────────────────

function renderProgress() {
  const container  = document.getElementById('page-progress');
  const weightLogs = GrowFitStorage.getWeightLogs();          // [{id, weightKg, date}]
  const workouts   = GrowFitStorage.getWorkouts();
  const profile    = GrowFitStorage.getProfile();

  // ── Stats
  const sortedLogs   = weightLogs.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
  const latestLog    = sortedLogs[sortedLogs.length - 1] || null;
  const firstLog     = sortedLogs[0] || null;
  const currentWt    = latestLog ? latestLog.weightKg : (profile.currentWeight || null);
  const targetWt     = profile.targetWeight || profile.targetWeightKg || null;
  const startWt      = firstLog ? firstLog.weightKg : (profile.startingWeight || null);

  let gainLossHTML = '';
  if (latestLog && firstLog && latestLog.id !== firstLog.id) {
    const diff = (latestLog.weightKg - firstLog.weightKg).toFixed(1);
    const sign = diff > 0 ? '+' : '';
    const cls  = diff > 0 ? 'badge--up' : (diff < 0 ? 'badge--down' : 'badge--neutral');
    const arrow = diff > 0 ? '↑' : (diff < 0 ? '↓' : '→');
    gainLossHTML = `<span class="badge ${cls}">${arrow} ${sign}${diff} kg since start</span>`;
  }

  // ── Workout streak
  const totalWorkouts = workouts.length;
  const workoutDates  = [...new Set(workouts.map(w => w.date))].sort();
  const todayStr      = getTodayDate();
  let streak = 0;
  let checkDate = new Date(todayStr);
  while (true) {
    const d = checkDate.toISOString().split('T')[0];
    if (workoutDates.includes(d)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const trashSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>`;

  container.innerHTML = `

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Progress</h1>
        <p class="page-header__sub">Visualise your journey</p>
      </div>
      <button class="btn btn--primary" id="log-weight-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Log Weight
      </button>
    </div>

    <!-- ── Weight Stats ──────────────────────────────────────── -->
    <div class="stats-grid animate-in" style="margin-bottom:var(--space-4);">
      <div class="stat-card">
        <span class="stat-card__label">⚖️ Current Weight</span>
        <span class="stat-card__value">${currentWt != null ? currentWt + ' kg' : '—'}</span>
        ${gainLossHTML}
      </div>
      <div class="stat-card">
        <span class="stat-card__label">🎯 Target Weight</span>
        <span class="stat-card__value">${targetWt != null ? targetWt + ' kg' : '—'}</span>
        ${targetWt && currentWt != null
          ? `<span style="font-size:var(--font-xs); color:var(--text-muted);">${(targetWt - currentWt).toFixed(1)} kg to go</span>`
          : `<span style="font-size:var(--font-xs); color:var(--text-muted);">Set in More → Profile</span>`}
      </div>
    </div>

    <!-- ── Workout Summary ───────────────────────────────────── -->
    <div class="stats-grid animate-in" style="margin-bottom:var(--space-5);">
      <div class="stat-card">
        <span class="stat-card__label">💪 Total Workouts</span>
        <span class="stat-card__value">${totalWorkouts}</span>
        <span style="font-size:var(--font-xs); color:var(--text-muted);">all time</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">🔥 Current Streak</span>
        <span class="stat-card__value" style="color:${streak > 0 ? 'var(--accent)' : 'var(--text-primary)'};">${streak}</span>
        <span style="font-size:var(--font-xs); color:var(--text-muted);">${streak === 1 ? 'day' : 'days'} in a row</span>
      </div>
    </div>

    <!-- ── Weight Chart ──────────────────────────────────────── -->
    <div class="chart-container animate-in">
      <h3>Weight Trend (kg)</h3>
      ${renderWeightTrendChart(sortedLogs)}
    </div>

    <!-- ── Weight History ────────────────────────────────────── -->
    <div class="section-header animate-in">
      <h2>Weight History</h2>
      <span class="section-header__label">${weightLogs.length} records</span>
    </div>

    ${weightLogs.length === 0 ? `
      <div class="empty-state animate-in">
        <div class="empty-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3a6 6 0 0 0-6 6v1h12V9a6 6 0 0 0-6-6z"/>
            <rect x="2" y="10" width="20" height="11" rx="2"/>
          </svg>
        </div>
        <h3 class="empty-state__title">No Weight Records</h3>
        <p class="empty-state__desc">Log your weight regularly to track your progress curve over time.</p>
        <button class="btn btn--primary" style="margin-top:var(--space-4);" id="log-weight-empty-btn">Log Weight Now</button>
      </div>
    ` : `
      <div class="log-list animate-in">
        ${sortedLogs.slice().reverse().map((item, i) => {
          const prev = sortedLogs.slice().reverse()[i + 1];
          let diffHTML = '';
          if (prev) {
            const d    = (item.weightKg - prev.weightKg).toFixed(1);
            const sign = d > 0 ? '+' : '';
            const cls  = d > 0 ? 'badge--up' : (d < 0 ? 'badge--down' : 'badge--neutral');
            diffHTML = `<span class="badge ${cls}" style="font-size:10px;">${sign}${d}</span>`;
          }
          return `
            <div class="log-item animate-in">
              <div class="log-item__main">
                <div class="log-item__title">${item.weightKg} kg ${i === 0 ? '<span style="font-size:10px; color:var(--accent); margin-left:4px;">latest</span>' : ''}</div>
                <div class="log-item__meta">${formatDate(item.date)}</div>
              </div>
              <div class="log-item__right">
                ${diffHTML}
                <button class="btn-icon-danger" data-delete-weight="${item.id}" title="Delete">
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
  document.getElementById('log-weight-btn').addEventListener('click', openLogWeightModal);

  const emptyBtn = document.getElementById('log-weight-empty-btn');
  if (emptyBtn) emptyBtn.addEventListener('click', openLogWeightModal);

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-delete-weight]');
    if (!btn) return;
    showConfirmDialog('Delete this weight record?', () => {
      GrowFitStorage.deleteWeightLog(btn.dataset.deleteWeight);
      showToast('Weight entry deleted', 'info');
      renderProgress();
    });
  });
}


// ─── SVG Weight Trend Chart ───────────────────────────────────

/**
 * Render a smooth SVG line chart with area fill for weight history.
 * @param {Array} logs — sorted [{weightKg, date}]
 */
function renderWeightTrendChart(logs) {
  if (!logs || logs.length < 2) {
    return `
      <div style="text-align:center; padding:var(--space-6); color:var(--text-muted); font-size:var(--font-sm);">
        Log at least 2 weight entries to see your trend chart.
      </div>
    `;
  }

  const W = 340, H = 130, PX = 24, PY = 18;
  const weights = logs.map(l => l.weightKg);
  const minW    = Math.min(...weights) - 0.5;
  const maxW    = Math.max(...weights) + 0.5;
  const range   = maxW - minW || 1;

  const pts = logs.map((item, i) => {
    const x = PX + (i / (logs.length - 1)) * (W - 2 * PX);
    const y = H - PY - ((item.weightKg - minW) / range) * (H - 2 * PY);
    return { x, y, w: item.weightKg, date: item.date };
  });

  // Smooth curve using cubic bezier control points
  function bezierPath(points) {
    if (points.length === 0) return '';
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur  = points[i];
      const cpx  = (prev.x + cur.x) / 2;
      d += ` C ${cpx.toFixed(1)} ${prev.y.toFixed(1)}, ${cpx.toFixed(1)} ${cur.y.toFixed(1)}, ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
    }
    return d;
  }

  const linePath = bezierPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length-1].x.toFixed(1)} ${H - PY} L ${pts[0].x.toFixed(1)} ${H - PY} Z`;

  // Y-axis labels
  const yLabels = [minW.toFixed(1), ((minW + maxW) / 2).toFixed(1), maxW.toFixed(1)];

  return `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; overflow:visible;">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="rgba(74,222,128,0.25)"/>
          <stop offset="100%" stop-color="rgba(74,222,128,0)"/>
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      ${[0, 0.5, 1].map(t => {
        const gy = PY + t * (H - 2 * PY);
        return `<line x1="${PX}" y1="${gy.toFixed(1)}" x2="${W - PX}" y2="${gy.toFixed(1)}"
                  stroke="rgba(255,255,255,0.05)" stroke-dasharray="3,3"/>`;
      }).join('')}

      <!-- Y-axis labels -->
      ${yLabels.map((lbl, i) => {
        const gy = H - PY - (i / 2) * (H - 2 * PY);
        return `<text x="${PX - 4}" y="${(gy + 4).toFixed(1)}"
                  text-anchor="end" fill="rgba(255,255,255,0.3)"
                  font-size="8" font-family="Inter, sans-serif">${lbl}</text>`;
      }).join('')}

      <!-- Area fill -->
      <path d="${areaPath}" fill="url(#chartGrad)"/>

      <!-- Trend line -->
      <path d="${linePath}" fill="none" stroke="#4ade80" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Data points + labels -->
      ${pts.map((pt, i) => `
        <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="3.5"
                fill="#0a0a0a" stroke="#4ade80" stroke-width="2"/>
        ${i === pts.length - 1 || i === 0 || pts.length <= 5 ? `
          <text x="${pt.x.toFixed(1)}" y="${(pt.y - 9).toFixed(1)}"
                text-anchor="middle" fill="rgba(245,245,245,0.8)"
                font-size="8.5" font-weight="600" font-family="Inter, sans-serif">${pt.w}</text>
        ` : ''}
      `).join('')}
    </svg>
  `;
}


// ─── Log Weight Modal ─────────────────────────────────────────

function openLogWeightModal() {
  const today   = getTodayDate();
  const profile = GrowFitStorage.getProfile();
  const lastLog = GrowFitStorage.getLatestWeight();

  const html = `
    <form id="weight-form">
      <div class="form-group">
        <label class="form-label" for="weight-val">Your Weight (kg) *</label>
        <input type="number" class="form-control" id="weight-val"
               step="0.1" min="20" max="300"
               placeholder="${lastLog ? lastLog.weight : '65.0'}"
               value="${lastLog ? lastLog.weight : ''}"
               style="font-size:var(--font-2xl); font-weight:700; text-align:center; padding:var(--space-5);"
               required>
        ${lastLog ? `<p class="form-hint">Last logged: ${lastLog.weight} kg on ${formatDate(lastLog.date)}</p>` : ''}
      </div>

      <div class="form-group">
        <label class="form-label" for="weight-date">Date</label>
        <input type="date" class="form-control" id="weight-date" value="${today}" required>
      </div>

      <div class="modal__footer" style="padding:var(--space-4) 0 0; border:none;">
        <button type="button" class="btn btn--secondary btn--full" id="weight-cancel">Cancel</button>
        <button type="submit" class="btn btn--primary btn--full">Save</button>
      </div>
    </form>
  `;

  openModal('Log Body Weight', html);
  setTimeout(() => document.getElementById('weight-val').focus(), 100);

  document.getElementById('weight-cancel').addEventListener('click', closeModal);

  document.getElementById('weight-form').addEventListener('submit', e => {
    e.preventDefault();
    const weightKg = parseFloat(document.getElementById('weight-val').value);
    const date     = document.getElementById('weight-date').value;

    if (!weightKg || isNaN(weightKg) || weightKg < 20 || weightKg > 300) {
      showToast('Please enter a valid weight (20–300 kg)', 'warning');
      return;
    }

    GrowFitStorage.addWeightLog(weightKg, date);
    GrowFitStorage.updateUser({ currentWeight: weightKg });
    closeModal();
    showToast(`${weightKg} kg logged! ⚖️`, 'success');
    renderProgress();
  });
}
