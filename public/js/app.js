/**
 * FinFriend – Global Frontend JS
 * Handles: auth state, navbar, toasts, API helpers
 */

// ── Toast Notifications ─────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ── Modal Helper ────────────────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ── API Fetch Helper (with auth) ────────────────────────
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('ff_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

// ── Auth State ──────────────────────────────────────────
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('ff_user'));
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!localStorage.getItem('ff_token');
}

function logout() {
  localStorage.removeItem('ff_token');
  localStorage.removeItem('ff_user');
  window.location.href = '/';
}

// ── Update Navbar Auth Section ──────────────────────────
function updateNavAuth() {
  const nav = document.getElementById('navAuth');
  if (!nav) return;

  if (isLoggedIn()) {
    const user = getUser();
    nav.innerHTML = `
      <a href="/dashboard" class="btn btn-ghost btn-sm">📊 Dashboard</a>
      <div style="position: relative; display: inline-block;">
        <button class="btn btn-ghost btn-sm" onclick="this.nextElementSibling.classList.toggle('hidden')" style="display: flex; align-items: center; gap: 0.4rem;">
          <div style="width:28px;height:28px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--primary);font-size:0.75rem;">${user ? user.full_name.charAt(0) : '?'}</div>
          ${user ? user.full_name.split(' ')[0] : 'User'}
        </button>
        <div class="hidden" style="position:absolute;right:0;top:100%;background:rgba(255,255,255,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.4);border-radius:var(--radius-sm);box-shadow:var(--shadow-lg);padding:0.5rem;min-width:160px;z-index:100;">
          <a href="/dashboard" style="display:block;padding:0.5rem 0.75rem;color:var(--gray-700);border-radius:4px;">📊 Dashboard</a>
          <a href="/profile" style="display:block;padding:0.5rem 0.75rem;color:var(--gray-700);border-radius:4px;">👤 Profile</a>
          <hr style="margin:0.25rem 0;border:none;border-top:1px solid var(--gray-100);">
          <a href="#" onclick="logout();return false;" style="display:block;padding:0.5rem 0.75rem;color:var(--danger);border-radius:4px;">🚪 Log Out</a>
        </div>
      </div>
    `;
  } else {
    nav.innerHTML = `
      <a href="/login" class="btn btn-outline btn-sm">Log In</a>
      <a href="/register" class="btn btn-primary btn-sm">Sign Up Free</a>
    `;
  }
}

// ── Hamburger Menu ──────────────────────────────────────
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

// ── Number formatting ───────────────────────────────────
function formatUGX(n) {
  return 'UGX ' + Number(n).toLocaleString('en-UG');
}

// ── Init ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();
  initHamburger();
});
