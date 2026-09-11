/**
 * GrowFit — App Core
 *
 * Handles:
 *  - App initialization
 *  - Page navigation (show/hide sections)
 *  - Modal system
 *  - Toast notifications
 *  - Confirmation dialogs
 *  - Shared utility functions
 */

// ─── DOM References ──────────────────────────────────────────
const DOM = {
  pages:          document.querySelectorAll('.page'),
  navItems:       document.querySelectorAll('.nav-item'),
  modalOverlay:   document.getElementById('modal-overlay'),
  modal:          document.getElementById('modal'),
  modalTitle:     document.getElementById('modal-title'),
  modalBody:      document.getElementById('modal-body'),
  modalCloseBtn:  document.getElementById('modal-close-btn'),
  toastContainer: document.getElementById('toast-container'),
};

// Keep track of which page is showing
let currentPage = 'home';


// ─── Navigation ──────────────────────────────────────────────

/**
 * Switch to a page by name.
 * Hides all pages, shows the target, updates nav highlighting.
 * Also calls the page's render function to refresh its content.
 *
 * @param {string} pageName — 'home', 'exercise', 'nutrition', 'progress', or 'more'
 */
function navigate(pageName) {
  currentPage = pageName;

  // Hide all pages, show the target
  DOM.pages.forEach(page => {
    page.classList.remove('active');
  });
  const targetPage = document.getElementById('page-' + pageName);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  // Update nav highlighting
  DOM.navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageName);
  });

  // Render the page content
  renderPage(pageName);

  // Scroll to top
  window.scrollTo(0, 0);
}

/**
 * Call the appropriate render function for a page.
 * Wrapped in a try/catch so a JS error shows a friendly error state
 * instead of a blank page.
 */
function renderPage(pageName) {
  try {
    switch (pageName) {
      case 'home':      renderDashboard();  break;
      case 'exercise':  renderExercise();   break;
      case 'nutrition': renderNutrition();  break;
      case 'progress':  renderProgress();   break;
      case 'journal':   renderJournal();    break;
      case 'more':      renderMore();       break;
    }
  } catch (err) {
    console.error(`[GrowFit] renderPage('${pageName}') threw:`, err);
    const pageEl = document.getElementById('page-' + pageName);
    if (pageEl) {
      pageEl.innerHTML = `
        <div class="empty-state" style="padding-top:var(--space-10);">
          <div class="empty-state__icon" style="background:rgba(248,113,113,0.12);">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3 class="empty-state__title" style="color:#f87171;">Something went wrong</h3>
          <p class="empty-state__desc">Could not load this page. Try navigating away and back.</p>
          <p style="font-size:var(--font-xs); color:var(--text-muted); margin-top:var(--space-3); font-family:monospace;">${escapeHTML(err.message)}</p>
        </div>
      `;
    }
  }
}


// ─── Modal System ────────────────────────────────────────────

/**
 * Open the modal with a title and body HTML.
 *
 * @param {string} title   — Modal title text
 * @param {string} bodyHTML — HTML string for the modal body
 */
function openModal(title, bodyHTML) {
  DOM.modalTitle.textContent = title;
  DOM.modalBody.innerHTML = bodyHTML;
  DOM.modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal

  // Focus the modal for accessibility
  DOM.modal.focus();
}

/**
 * Close the modal.
 */
function closeModal() {
  DOM.modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close modal when clicking overlay background
DOM.modalOverlay.addEventListener('click', (e) => {
  if (e.target === DOM.modalOverlay) {
    closeModal();
  }
});

// Close modal with the × button
DOM.modalCloseBtn.addEventListener('click', closeModal);

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && DOM.modalOverlay.classList.contains('active')) {
    closeModal();
  }
});


// ─── Toast Notifications ─────────────────────────────────────

/**
 * Show a small notification at the top of the screen.
 *
 * @param {string} message — What to display
 * @param {'success'|'error'|'warning'|'info'} type — Style variant
 * @param {number} duration — Auto-dismiss in ms (default 3000)
 */
function showToast(message, type = 'success', duration = 3000) {
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `${icons[type] || ''}<span>${escapeHTML(message)}</span>`;

  DOM.toastContainer.appendChild(toast);

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.add('toast--exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}


// ─── Confirmation Dialog ─────────────────────────────────────

/**
 * Show a yes/no confirmation inside the modal.
 *
 * @param {string} message — What to ask
 * @param {Function} onConfirm — Called if user clicks "Yes"
 */
function showConfirmDialog(message, onConfirm) {
  const bodyHTML = `
    <div class="confirm-dialog">
      <p class="confirm-dialog__message">${escapeHTML(message)}</p>
      <div class="confirm-dialog__actions">
        <button class="btn btn--secondary btn--full" id="confirm-cancel">Cancel</button>
        <button class="btn btn--primary btn--full" id="confirm-yes">Yes</button>
      </div>
    </div>
  `;

  openModal('Confirm', bodyHTML);

  document.getElementById('confirm-cancel').addEventListener('click', closeModal);
  document.getElementById('confirm-yes').addEventListener('click', () => {
    closeModal();
    onConfirm();
  });
}


// ─── Utility Functions ───────────────────────────────────────

/**
 * Escape HTML to prevent XSS when inserting user-entered text.
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Get a time-based greeting.
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12)  return 'Good morning';
  if (hour < 17)  return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format a date string for display.
 * '2025-01-15' → 'Jan 15, 2025'
 */
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format minutes into a readable string.
 * 75 → '1h 15m'
 */
function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}


// ─── Initialization ──────────────────────────────────────────

/**
 * Boot up the app.
 */
function initApp() {
  // Initialize default data if first launch
  GrowFitStorage.init();

  // Set up nav click handlers with micro-animation
  DOM.navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Tiny scale pop feedback
      item.style.transform = 'scale(0.88)';
      requestAnimationFrame(() => {
        setTimeout(() => { item.style.transform = ''; }, 120);
      });
      navigate(item.dataset.page);
    });
  });

  // Render the home page
  renderDashboard();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
