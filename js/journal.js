/**
 * GrowFit — Daily Journal Page (Stage 6 Implementation)
 * Log daily mood, sleep quality, energy levels, and personal wellness notes.
 */

function renderJournal() {
  const container = document.getElementById('page-journal');
  if (!container) return;

  const journals = GrowFitStorage.getJournals();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = journals.find(j => j.date === todayStr);

  container.innerHTML = `
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Daily Journal</h1>
        <p class="page-header__sub">Track mood, sleep & daily reflection</p>
      </div>
      <button class="btn btn--primary" onclick="openLogJournalModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        ${todayEntry ? 'Edit Today\'s Journal' : 'Write Journal'}
      </button>
    </div>

    ${todayEntry ? `
      <div class="card animate-in" style="background: var(--bg-card); border-radius: var(--radius-lg); padding: var(--space-4); border: 1px solid var(--border-color); margin-bottom: var(--space-4);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-2);">
          <span style="font-weight:600; color: var(--color-accent);">Today's Reflection (${formatDate(todayStr)})</span>
          <span style="font-size:1.4rem;">${getMoodEmoji(todayEntry.mood)}</span>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); margin-bottom: var(--space-3); font-size:0.85rem; color:var(--text-muted);">
          <div>⚡ Energy: <strong>${todayEntry.energy || 'Normal'}</strong></div>
          <div>🌙 Sleep: <strong>${todayEntry.sleepHours ? todayEntry.sleepHours + ' hrs' : 'Not logged'}</strong></div>
        </div>
        ${todayEntry.notes ? `
          <p style="font-size: 0.9rem; color: var(--text-primary); background: var(--bg-dark); padding: var(--space-3); border-radius: var(--radius-md); border-left: 3px solid var(--color-accent); white-space: pre-line;">
            "${escapeHTML(todayEntry.notes)}"
          </p>
        ` : ''}
      </div>
    ` : ''}

    <div class="section-title animate-in" style="display:flex; justify-between; align-items:center; margin-bottom: var(--space-3);">
      <h2>Journal Entries History</h2>
    </div>

    ${journals.length === 0 ? `
      <div class="empty-state animate-in">
        <div class="empty-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </div>
        <h3 class="empty-state__title">No Journal Entries Yet</h3>
        <p class="empty-state__desc">Reflecting daily helps build consistent wellness habits and keeps you motivated!</p>
        <button class="btn btn--primary" onclick="openLogJournalModal()">Write Your First Entry</button>
      </div>
    ` : `
      <div class="log-list animate-in">
        ${journals.slice().reverse().map(item => `
          <div class="log-item" style="background: var(--bg-card); padding: var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-2); border: 1px solid var(--border-color);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
              <div style="font-weight: 600; color: var(--text-primary); display:flex; align-items:center; gap: 8px;">
                <span>${getMoodEmoji(item.mood)}</span>
                <span>${formatDate(item.date)}</span>
              </div>
              <button class="btn-icon" onclick="deleteJournalLog('${item.id}')" title="Delete entry" style="color: var(--color-danger); background:transparent; border:none; cursor:pointer;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 6px;">
              ${item.sleepHours ? `Sleep: ${item.sleepHours} hrs` : ''} 
              ${item.sleepHours && item.energy ? ' • ' : ''}
              ${item.energy ? `Energy: ${item.energy}` : ''}
            </div>
            ${item.notes ? `<div style="font-size: 0.85rem; color: var(--text-primary); margin-top: 4px;">${escapeHTML(item.notes)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `}
  `;
}

function getMoodEmoji(mood) {
  switch (mood) {
    case 'great': return '😄 Great';
    case 'good':  return '🙂 Good';
    case 'okay':  return '😐 Okay';
    case 'low':   return '😔 Low';
    default:      return '📝 Note';
  }
}

/**
 * Open Modal to Log Journal Entry
 */
function openLogJournalModal() {
  const today = new Date().toISOString().split('T')[0];
  const journals = GrowFitStorage.getJournals();
  const existing = journals.find(j => j.date === today);

  const html = `
    <form id="journal-form" onsubmit="handleSaveJournal(event)">
      <div class="form-group">
        <label class="form-label" for="j-mood">How are you feeling today?</label>
        <select class="form-control" id="j-mood">
          <option value="great" ${existing && existing.mood === 'great' ? 'selected' : ''}>😄 Great / Energetic</option>
          <option value="good" ${!existing || existing.mood === 'good' ? 'selected' : ''}>🙂 Good / Relaxed</option>
          <option value="okay" ${existing && existing.mood === 'okay' ? 'selected' : ''}>😐 Okay / Average</option>
          <option value="low" ${existing && existing.mood === 'low' ? 'selected' : ''}>😔 Low Energy / Tired</option>
        </select>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
        <div class="form-group">
          <label class="form-label" for="j-sleep">Sleep (Hours)</label>
          <input type="number" class="form-control" id="j-sleep" min="0" max="24" step="0.5" placeholder="e.g. 7.5" value="${existing ? existing.sleepHours || '' : ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="j-energy">Energy Level</label>
          <select class="form-control" id="j-energy">
            <option value="High" ${existing && existing.energy === 'High' ? 'selected' : ''}>High</option>
            <option value="Normal" ${!existing || existing.energy === 'Normal' ? 'selected' : ''}>Normal</option>
            <option value="Low" ${existing && existing.energy === 'Low' ? 'selected' : ''}>Low</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="j-notes">Reflection / Notes</label>
        <textarea class="form-control" id="j-notes" rows="3" placeholder="What went well today? Any wins or thoughts?">${existing ? escapeHTML(existing.notes || '') : ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label" for="j-date">Date</label>
        <input type="date" class="form-control" id="j-date" value="${existing ? existing.date : today}" required>
      </div>

      <button type="submit" class="btn btn--primary btn--full" style="margin-top: var(--space-3);">Save Journal Entry</button>
    </form>
  `;

  openModal('Daily Journal & Wellness', html);
}

function handleSaveJournal(e) {
  e.preventDefault();
  const journalData = {
    mood: document.getElementById('j-mood').value,
    sleepHours: parseFloat(document.getElementById('j-sleep').value) || null,
    energy: document.getElementById('j-energy').value,
    notes: document.getElementById('j-notes').value.trim(),
    date: document.getElementById('j-date').value
  };

  GrowFitStorage.addJournal(journalData);
  closeModal();
  showToast('Journal entry saved!');
  if (currentPage === 'journal') {
    renderJournal();
  } else {
    renderDashboard();
  }
}

function deleteJournalLog(id) {
  showConfirmDialog('Are you sure you want to delete this journal entry?', () => {
    GrowFitStorage.deleteJournal(id);
    showToast('Journal entry deleted');
    renderJournal();
  });
}
