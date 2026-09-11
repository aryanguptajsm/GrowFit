/**
 * GrowFit — Daily Journal Page (Stage 2)
 *
 * Renders:
 *  - Page header with "Write Journal" CTA
 *  - Today's entry card (if exists) pinned at top
 *  - Streak counter
 *  - Full journal history log with mood, sleep, energy, notes
 *
 * Storage: uses GrowFitStorage adapter methods
 * (getJournals, addJournal, deleteJournal)
 */

// ─── Helpers ─────────────────────────────────────────────────

const MOOD_MAP = {
  great: { emoji: '😄', label: 'Great',     color: '#4ade80' },
  good:  { emoji: '🙂', label: 'Good',      color: '#60a5fa' },
  okay:  { emoji: '😐', label: 'Okay',      color: '#fbbf24' },
  low:   { emoji: '😔', label: 'Low',       color: '#f87171' },
  bad:   { emoji: '😫', label: 'Bad',       color: '#f43f5e' },
};

function getMoodEmoji(mood) {
  return MOOD_MAP[mood] ? `${MOOD_MAP[mood].emoji} ${MOOD_MAP[mood].label}` : '📝 Note';
}

function getMoodColor(mood) {
  return MOOD_MAP[mood] ? MOOD_MAP[mood].color : 'var(--text-muted)';
}

// Compute consecutive journal day streak ending today
function computeJournalStreak(journals) {
  const dates = new Set(journals.map(j => j.date));
  let streak = 0;
  const cur  = new Date();
  while (true) {
    const d = cur.toISOString().split('T')[0];
    if (dates.has(d)) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}


// ─── Render Journal Page ──────────────────────────────────────

function renderJournal() {
  const container  = document.getElementById('page-journal');
  if (!container) return;

  const journals   = GrowFitStorage.getJournals();   // [{id, date, mood, energy, sleepHours, notes}]
  const todayStr   = getTodayDate();
  const todayEntry = journals.find(j => j.date === todayStr);
  const streak     = computeJournalStreak(journals);
  const totalDays  = journals.length;

  const trashSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>`;

  container.innerHTML = `

    <!-- ── Header ──────────────────────────────────────────── -->
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Journal</h1>
        <p class="page-header__sub">Reflect · Track mood & sleep</p>
      </div>
      <button class="btn btn--primary" id="write-journal-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        ${todayEntry ? 'Edit Today' : 'Write'}
      </button>
    </div>

    <!-- ── Stats ────────────────────────────────────────────── -->
    <div class="stats-grid animate-in" style="margin-bottom:var(--space-5);">
      <div class="stat-card">
        <span class="stat-card__label">🔥 Current Streak</span>
        <span class="stat-card__value" style="color:${streak > 0 ? 'var(--accent)' : 'var(--text-primary)'};">${streak}</span>
        <span style="font-size:var(--font-xs); color:var(--text-muted);">${streak === 1 ? 'day' : 'days'} in a row</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">📝 Total Entries</span>
        <span class="stat-card__value">${totalDays}</span>
        <span style="font-size:var(--font-xs); color:var(--text-muted);">days journalled</span>
      </div>
    </div>

    <!-- ── Today's Entry ─────────────────────────────────────── -->
    ${todayEntry ? `
      <h2 class="section-title animate-in">
        <span class="section-title__icon">✨</span>
        Today
      </h2>
      <div class="journal-card journal-card--today animate-in" style="margin-bottom:var(--space-5);">
        <div class="journal-card__header">
          <div>
            <div class="journal-card__date">${formatDate(todayStr)}</div>
            <span style="font-size:var(--font-sm); font-weight:600; color:${getMoodColor(todayEntry.mood)};">
              ${getMoodEmoji(todayEntry.mood)}
            </span>
          </div>
          <button class="btn btn--secondary" id="edit-today-btn" style="font-size:var(--font-xs);">Edit</button>
        </div>
        <div class="journal-card__stats">
          ${todayEntry.sleepHours != null ? `<span>🌙 ${todayEntry.sleepHours}h sleep</span>` : ''}
          ${todayEntry.energy ? `<span>⚡ ${todayEntry.energy} energy</span>` : ''}
        </div>
        ${todayEntry.notes ? `
          <div class="journal-card__notes">"${escapeHTML(todayEntry.notes)}"</div>
        ` : ''}
      </div>
    ` : `
      <div class="card animate-in" style="margin-bottom:var(--space-5); text-align:center; padding:var(--space-6); border-style:dashed;">
        <div style="font-size:var(--font-xl); margin-bottom:var(--space-2);">✍️</div>
        <p style="color:var(--text-muted); font-size:var(--font-sm);">No entry for today yet.</p>
        <button class="btn btn--primary" style="margin-top:var(--space-3);" id="write-today-btn">Write Today's Entry</button>
      </div>
    `}

    <!-- ── History ───────────────────────────────────────────── -->
    <div class="section-header animate-in">
      <h2>Past Entries</h2>
      <span class="section-header__label">${journals.length} total</span>
    </div>

    ${journals.length === 0 ? `
      <div class="empty-state animate-in">
        <div class="empty-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </div>
        <h3 class="empty-state__title">Start Your Journal</h3>
        <p class="empty-state__desc">Reflecting daily helps build consistent wellness habits and keeps you motivated!</p>
      </div>
    ` : `
      <div class="log-list animate-in">
        ${journals.slice().reverse()
          .filter(item => item.date !== todayStr)   // today shown above already
          .map(item => `
            <div class="journal-card animate-in">
              <div class="journal-card__header">
                <div>
                  <div class="journal-card__date">${formatDate(item.date)}</div>
                  <span style="font-size:var(--font-sm); color:${getMoodColor(item.mood)};">
                    ${getMoodEmoji(item.mood)}
                  </span>
                </div>
                <button class="btn-icon-danger" data-delete-journal="${item.id}" title="Delete">
                  ${trashSVG}
                </button>
              </div>
              <div class="journal-card__stats">
                ${item.sleepHours != null ? `<span>🌙 ${item.sleepHours}h sleep</span>` : ''}
                ${item.energy ? `<span>⚡ ${item.energy} energy</span>` : ''}
              </div>
              ${item.notes ? `<div class="journal-card__notes">${escapeHTML(item.notes)}</div>` : ''}
            </div>
          `).join('')}
      </div>
    `}
  `;

  // ── Event Listeners ────────────────────────────────────────
  document.getElementById('write-journal-btn').addEventListener('click', () => openLogJournalModal());

  const writeTodayBtn = document.getElementById('write-today-btn');
  if (writeTodayBtn) writeTodayBtn.addEventListener('click', () => openLogJournalModal());

  const editTodayBtn = document.getElementById('edit-today-btn');
  if (editTodayBtn) editTodayBtn.addEventListener('click', () => openLogJournalModal(todayEntry));

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-delete-journal]');
    if (!btn) return;
    showConfirmDialog('Delete this journal entry?', () => {
      GrowFitStorage.deleteJournal(btn.dataset.deleteJournal);
      showToast('Journal entry deleted', 'info');
      renderJournal();
    });
  });
}


// ─── Log Journal Modal ────────────────────────────────────────

const MOODS = [
  { value: 'great', emoji: '😄', label: 'Great'  },
  { value: 'good',  emoji: '🙂', label: 'Good'   },
  { value: 'okay',  emoji: '😐', label: 'Okay'   },
  { value: 'low',   emoji: '😔', label: 'Low'    },
  { value: 'bad',   emoji: '😫', label: 'Bad'    },
];

const ENERGY_LEVELS = [
  { value: 'High',   emoji: '⚡', label: 'High'   },
  { value: 'Normal', emoji: '🔋', label: 'Normal' },
  { value: 'Low',    emoji: '🪫', label: 'Low'    },
];

/**
 * @param {object|null} existing — pre-fill with existing entry if editing
 */
function openLogJournalModal(existing = null) {
  const today = getTodayDate();
  const entry = existing || GrowFitStorage.getJournals().find(j => j.date === today);

  const html = `
    <form id="journal-form">

      <div class="form-group">
        <label class="form-label">How are you feeling?</label>
        <div class="mood-selector" id="mood-selector">
          ${MOODS.map(m => `
            <button type="button" class="mood-btn ${entry && entry.mood === m.value ? 'selected' : ''}"
                    data-value="${m.value}">
              <span class="emoji">${m.emoji}</span>
              <span class="label">${m.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Energy level</label>
        <div class="mood-selector" id="energy-selector">
          ${ENERGY_LEVELS.map(e => `
            <button type="button" class="mood-btn ${entry && entry.energy === e.value ? 'selected' : ''}"
                    data-value="${e.value}">
              <span class="emoji">${e.emoji}</span>
              <span class="label">${e.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="j-sleep">Sleep last night (hours)</label>
        <input type="number" class="form-control" id="j-sleep"
               min="0" max="24" step="0.5" placeholder="7.5"
               value="${entry && entry.sleepHours != null ? entry.sleepHours : ''}">
      </div>

      <div class="form-group">
        <label class="form-label" for="j-notes">Notes / Reflection</label>
        <textarea class="form-control" id="j-notes" rows="3"
                  placeholder="What went well? Any wins or thoughts?">${entry ? escapeHTML(entry.notes || '') : ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="j-date">Date</label>
        <input type="date" class="form-control" id="j-date"
               value="${entry ? entry.date : today}" required>
      </div>

      ${entry ? '<p class="form-hint">Updating existing entry for this date.</p>' : ''}

      <div class="modal__footer" style="padding:var(--space-4) 0 0; border:none;">
        <button type="button" class="btn btn--secondary btn--full" id="journal-cancel">Cancel</button>
        <button type="submit" class="btn btn--primary btn--full">Save</button>
      </div>
    </form>
  `;

  openModal(entry ? 'Edit Journal' : 'Daily Journal', html);

  document.getElementById('journal-cancel').addEventListener('click', closeModal);

  // Mood & energy selector single-select behaviour
  ['mood-selector', 'energy-selector'].forEach(id => {
    const sel = document.getElementById(id);
    sel.addEventListener('click', e => {
      const btn = e.target.closest('.mood-btn');
      if (!btn) return;
      sel.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  document.getElementById('journal-form').addEventListener('submit', e => {
    e.preventDefault();
    const moodBtn   = document.querySelector('#mood-selector .mood-btn.selected');
    const energyBtn = document.querySelector('#energy-selector .mood-btn.selected');
    const sleep     = document.getElementById('j-sleep').value;
    const notes     = document.getElementById('j-notes').value.trim();
    const date      = document.getElementById('j-date').value;

    if (!moodBtn) {
      showToast('Please select your mood', 'warning');
      return;
    }

    GrowFitStorage.addJournal({
      mood:       moodBtn.dataset.value,
      energy:     energyBtn ? energyBtn.dataset.value : null,
      sleepHours: sleep ? Number(sleep) : null,
      sleep:      sleep ? Number(sleep) : null,
      notes,
      date,
    });

    closeModal();
    showToast('Journal saved! ✍️', 'success');

    // Refresh whichever page is visible
    if (typeof currentPage !== 'undefined' && currentPage === 'journal') {
      renderJournal();
    } else {
      renderJournal();
      renderDashboard();
    }
  });
}
