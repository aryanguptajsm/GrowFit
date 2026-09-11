/**
 * GrowFit — More / Settings Page (Placeholder)
 * Full implementation coming in Stage 6–7.
 */

function renderMore() {
  const user = GrowFitStorage.getUser();
  const container = document.getElementById('page-more');

  container.innerHTML = `
    <div class="page-header animate-in">
      <div>
        <h1 class="page-header__title">More</h1>
      </div>
    </div>

    <!-- Profile Card -->
    <div class="card animate-in" style="margin-bottom: var(--space-4); text-align: center;">
      <div style="width: 56px; height: 56px; border-radius: var(--radius-full); background: var(--accent-muted); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-3);">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" width="28" height="28">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <h2 style="font-size: var(--font-lg); font-weight: 700;">${escapeHTML(user.name)}</h2>
      <p class="text-muted text-sm mt-2">Member since ${formatDate(user.createdAt ? user.createdAt.split('T')[0] : getTodayDate())}</p>
      <button class="btn btn--secondary mt-4" onclick="openEditProfile()">Edit Profile</button>
    </div>

    <!-- Settings List -->
    <div class="card animate-in" style="margin-bottom: var(--space-4); padding: 0;">
      <button class="settings-item" onclick="openEditProfile()">
        <span>👤</span><span>Edit Profile</span>
      </button>
      <button class="settings-item" onclick="handleExportData()">
        <span>📤</span><span>Export Data (JSON)</span>
      </button>
      <button class="settings-item" onclick="handleImportData()">
        <span>📥</span><span>Import Data</span>
      </button>
      <button class="settings-item" style="color: var(--error);" onclick="handleResetData()">
        <span>🗑️</span><span>Reset All Data</span>
      </button>
    </div>

    <!-- About -->
    <div class="card animate-in" style="text-align: center;">
      <p style="font-size: var(--font-lg); font-weight: 700; margin-bottom: var(--space-1);">🌱 GrowFit</p>
      <p class="text-muted text-sm">Version 1.0 · Stage 2</p>
      <p class="text-muted text-sm mt-2">Track small improvements consistently.</p>
    </div>


  `;
}


// ─── Edit Profile ────────────────────────────────────────────

function openEditProfile() {
  const user = GrowFitStorage.getUser();

  const bodyHTML = `
    <form id="edit-profile-form">
      <div class="form-group">
        <label class="form-label" for="profile-name">Your Name *</label>
        <input class="form-input" type="text" id="profile-name" value="${escapeHTML(user.name)}" required>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="profile-age">Age</label>
          <input class="form-input" type="number" id="profile-age" placeholder="25" min="10" max="120"
                 value="${user.age || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="profile-height">Height (cm)</label>
          <input class="form-input" type="number" id="profile-height" placeholder="170" min="50" max="250"
                 value="${user.height || ''}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="profile-cal-target">Calorie Target</label>
          <input class="form-input" type="number" id="profile-cal-target" placeholder="2500" min="1000" max="6000"
                 value="${user.targetCalories || 2500}">
        </div>
        <div class="form-group">
          <label class="form-label" for="profile-protein-target">Protein Target (g)</label>
          <input class="form-input" type="number" id="profile-protein-target" placeholder="100" min="20" max="400"
                 value="${user.targetProtein || 100}">
        </div>
      </div>

      <div class="modal__footer" style="padding: var(--space-4) 0 0 0; border: none;">
        <button type="button" class="btn btn--secondary btn--full" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn--primary btn--full">Save</button>
      </div>
    </form>
  `;

  openModal('Edit Profile', bodyHTML);

  document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name          = document.getElementById('profile-name').value.trim();
    const age           = Number(document.getElementById('profile-age').value) || null;
    const height        = Number(document.getElementById('profile-height').value) || null;
    const targetCalories = Number(document.getElementById('profile-cal-target').value) || 2500;
    const targetProtein  = Number(document.getElementById('profile-protein-target').value) || 100;

    if (!name) {
      showToast('Please enter your name', 'warning');
      return;
    }

    GrowFitStorage.updateUser({ name, age, height, targetCalories, targetProtein });
    closeModal();
    showToast('Profile updated!', 'success');
    renderMore();
  });
}


// ─── Data Management ─────────────────────────────────────────

function handleExportData() {
  const data = GrowFitStorage.exportAll();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `growfit-backup-${getTodayDate()}.json`;
  a.click();

  URL.revokeObjectURL(url);
  showToast('Data exported!', 'success');
}

function handleImportData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        showConfirmDialog(
          'This will replace all your current data. Are you sure?',
          () => {
            GrowFitStorage.importAll(data);
            showToast('Data imported successfully!', 'success');
            renderMore();
          }
        );
      } catch {
        showToast('Invalid JSON file', 'error');
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

function handleResetData() {
  showConfirmDialog(
    'This will permanently delete ALL your GrowFit data. This cannot be undone. Are you sure?',
    () => {
      GrowFitStorage.clearAll();
      GrowFitStorage.init();
      showToast('All data has been reset', 'info');
      renderMore();
    }
  );
}
