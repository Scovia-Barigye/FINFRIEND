/**
 * FinFriend – Dashboard JS
 */

// ── Require Auth ────────────────────────────────────────
if (!isLoggedIn()) {
  window.location.href = '/login';
}

// ── Load Dashboard Data ─────────────────────────────────
async function loadDashboard() {
  try {
    const res = await apiFetch('/api/dashboard');
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();

    // Welcome message
    document.getElementById('welcomeMsg').textContent = `Welcome back, ${data.user.full_name.split(' ')[0]}! 👋`;

    // Stats
    document.getElementById('statModules').textContent = `${data.modules_completed}/${data.total_modules}`;
    document.getElementById('statXP').textContent = data.user.xp;
    document.getElementById('statBadges').textContent = data.badges.length;
    document.getElementById('statGoals').textContent = data.goals.length;

    // Expenses
    renderExpenses(data.expenses);

    // Goals
    renderGoals(data.goals);

    // Progress
    renderProgress(data.progress, data.total_modules);

    // Badges
    renderBadges(data.badges);

  } catch (err) {
    console.error('Dashboard load failed:', err);
    showToast('Failed to load dashboard data.', 'error');
  }
}

function renderExpenses(expenses) {
  const el = document.getElementById('expenseList');
  if (!expenses || !expenses.length) {
    el.innerHTML = '<p class="text-muted text-sm">No expenses this month. Start tracking!</p>';
    return;
  }
  const icons = { food: '🍛', transport: '🚌', airtime: '📱', rent: '🏠', tuition: '📖', entertainment: '🎬', other: '📦' };
  el.innerHTML = expenses.map(e => `
    <div class="expense-item">
      <span>${icons[e.category] || '📦'} ${e.category}</span>
      <strong>${formatUGX(e.total)}</strong>
    </div>
  `).join('');
}

function renderGoals(goals) {
  const el = document.getElementById('goalList');
  if (!goals || !goals.length) {
    el.innerHTML = '<p class="text-muted text-sm">No goals set yet. Create one!</p>';
    return;
  }
  el.innerHTML = goals.map(g => {
    const pct = g.target_amount > 0 ? Math.min(100, Math.round((g.saved_amount / g.target_amount) * 100)) : 0;
    return `
      <div class="goal-item">
        <h4>🎯 ${g.title}</h4>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${pct}%;"></div>
        </div>
        <div class="goal-amounts">
          <span>${formatUGX(g.saved_amount)} saved</span>
          <span>${pct}%</span>
          <span>Target: ${formatUGX(g.target_amount)}</span>
        </div>
        ${g.deadline ? `<small class="text-muted">Deadline: ${new Date(g.deadline).toLocaleDateString('en-UG')}</small>` : ''}
      </div>
    `;
  }).join('');
}

function renderProgress(progress, total) {
  const el = document.getElementById('progressList');
  if (!progress || !progress.length) {
    el.innerHTML = '<p class="text-muted text-sm">Start learning to see progress here.</p>';
    return;
  }
  el.innerHTML = progress.map(p => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--gray-100);">
      <a href="/module?slug=${p.slug}" style="color: var(--gray-900); font-weight: 500;">${p.title}</a>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        ${p.quiz_score ? `<span class="badge badge-primary">${p.quiz_score}%</span>` : ''}
        <span class="badge ${p.completed ? 'badge-accent' : 'badge-warning'}">${p.completed ? '✅ Completed' : '⏳ In Progress'}</span>
      </div>
    </div>
  `).join('');
}

function renderBadges(badges) {
  const el = document.getElementById('badgeList');
  if (!badges || !badges.length) {
    el.innerHTML = '<p class="text-muted text-sm">Complete modules to earn badges.</p>';
    return;
  }
  el.innerHTML = badges.map(b => `
    <div style="text-align: center; padding: 1rem; background: var(--gray-100); border-radius: var(--radius-sm); min-width: 100px;">
      <div style="font-size: 2rem;">${b.icon}</div>
      <div style="font-weight: 600; font-size: 0.85rem; margin-top: 0.25rem;">${b.name}</div>
      <div style="font-size: 0.75rem; color: var(--gray-500);">${b.description}</div>
    </div>
  `).join('');
}

// ── Expense Modal ───────────────────────────────────────
function openExpenseModal() {
  document.getElementById('expDate').valueAsDate = new Date();
  document.getElementById('expenseModal').classList.add('active');
}

document.getElementById('expenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    category: document.getElementById('expCategory').value,
    amount: Number(document.getElementById('expAmount').value),
    description: document.getElementById('expDesc').value,
    expense_date: document.getElementById('expDate').value
  };

  const res = await apiFetch('/api/dashboard/expenses', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (res.ok) {
    showToast('Expense added!', 'success');
    closeModal('expenseModal');
    e.target.reset();
    loadDashboard();
  } else {
    showToast('Failed to add expense.', 'error');
  }
});

// ── Goal Modal ──────────────────────────────────────────
function openGoalModal() {
  document.getElementById('goalModal').classList.add('active');
}

document.getElementById('goalForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    title: document.getElementById('goalTitle').value,
    target_amount: Number(document.getElementById('goalTarget').value),
    deadline: document.getElementById('goalDeadline').value || null
  };

  const res = await apiFetch('/api/dashboard/goals', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (res.ok) {
    showToast('Goal created!', 'success');
    closeModal('goalModal');
    e.target.reset();
    loadDashboard();
  } else {
    showToast('Failed to create goal.', 'error');
  }
});

// ── Init ────────────────────────────────────────────────
loadDashboard();

// Check for new badges on every dashboard load
apiFetch('/api/badges/check', { method: 'POST' }).then(r => r.json()).then(data => {
  if (data.awarded && data.awarded.length) {
    data.awarded.forEach(b => {
      showToast(`🏅 New badge earned: ${b.icon} ${b.name}!`, 'success');
    });
    loadDashboard();
  }
}).catch(() => {});
