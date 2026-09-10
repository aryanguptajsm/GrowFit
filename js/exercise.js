/**
 * GrowFit — Exercise Page (Placeholder)
 * Full implementation coming in Stage 3.
 */

function renderExercise() {
  const container = document.getElementById('page-exercise');
  container.innerHTML = `
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Exercise</h1>
      </div>
    </div>

    <div class="empty-state animate-in">
      <div class="empty-state__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"/>
          <path d="M6 8a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z"/>
          <line x1="8" y1="11" x2="16" y2="11"/>
          <line x1="2" y1="11" x2="4" y2="11"/>
          <line x1="20" y1="11" x2="22" y2="11"/>
        </svg>
      </div>
      <h2 class="empty-state__title">Exercise Tracker</h2>
      <p class="empty-state__desc">Track your workouts, build consistency, and see your progress over time.</p>
      <span class="empty-state__badge">Coming in Stage 3</span>
    </div>

    <div style="text-align: center; margin-top: var(--space-4);">
      <button class="btn btn--primary" onclick="openQuickAddExercise()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Log Exercise Now
      </button>
    </div>
  `;
}
