/**
 * GrowFit — Nutrition Page (Placeholder)
 * Full implementation coming in Stage 4.
 */

function renderNutrition() {
  const container = document.getElementById('page-nutrition');
  container.innerHTML = `
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Nutrition</h1>
      </div>
    </div>

    <div class="empty-state animate-in">
      <div class="empty-state__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          <line x1="6" y1="1" x2="6" y2="4"/>
          <line x1="10" y1="1" x2="10" y2="4"/>
          <line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
      </div>
      <h2 class="empty-state__title">Nutrition Tracker</h2>
      <p class="empty-state__desc">Log your meals, track calories and protein, and build healthy eating habits.</p>
      <span class="empty-state__badge">Coming in Stage 4</span>
    </div>

    <div style="text-align: center; margin-top: var(--space-4);">
      <button class="btn btn--primary" onclick="openQuickAddFood()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Log Food Now
      </button>
    </div>
  `;
}
