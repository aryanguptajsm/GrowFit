/**
 * GrowFit — Progress Page (Placeholder)
 * Full implementation coming in Stage 5.
 */

function renderProgress() {
  const container = document.getElementById('page-progress');
  container.innerHTML = `
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">Progress</h1>
      </div>
    </div>

    <div class="empty-state animate-in">
      <div class="empty-state__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      </div>
      <h2 class="empty-state__title">Progress Tracker</h2>
      <p class="empty-state__desc">Visualise your weight, workout consistency, and nutrition trends with charts.</p>
      <span class="empty-state__badge">Coming in Stage 5</span>
    </div>
  `;
}
