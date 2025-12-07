// ============================================
// ADMIN PANEL LOGIC
// Cooperativa Provivienda "Mi Esperanza"
// ============================================

let currentSort = { key: 'name', ascending: true };
let filters = {
  search: '',
  city: '',
  urgency: false,
  payment: false
};

document.addEventListener('DOMContentLoaded', function () {
  // Translate page
  i18n.translatePage();

  // Check if already authenticated
  if (isAdminAuthenticated()) {
    showAdminPanel();
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', handleLogin);

  // Set today's date as default for financial forms
  const today = formatDate(new Date());
  document.getElementById('incomeDate').value = today;
  document.getElementById('expenseDate').value = today;

  // Financial forms
  document.getElementById('incomeForm').addEventListener('submit', handleAddIncome);
  document.getElementById('expenseForm').addEventListener('submit', handleAddExpense);

  // Search input with debounce
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', debounce(function () {
    filters.search = this.value.toLowerCase();
    renderMembersTable();
  }, 300));

  // City filter
  document.getElementById('cityFilter').addEventListener('change', function () {
    filters.city = this.value;
    renderMembersTable();
  });
});

function showAdminPanel() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('adminPanel').classList.remove('hidden');
  showTab('members');

  // Subscribe to Data
  subscribeToAdminData();
}

function subscribeToAdminData() {
  // Listen Members
  listenData('socios', (data) => {
    dashboardState.members = data ? Object.values(data) : [];
    if (!document.getElementById('membersTab').classList.contains('hidden')) { // Check if members tab is active
      renderMembersTable();
      populateCityFilter(); // Re-populate filter as members might change
    }
  });

  // Listen Income
  listenData('ingresos', (data) => {
    dashboardState.income = data ? Object.values(data) : [];
    updateFinancialOverview(); // Update total labels if needed
    if (!document.getElementById('financialTab').classList.contains('hidden')) { // Check if financial tab is active
      renderFinancialDashboard();
    }
  });

  // Listen Expenses
  listenData('gastos', (data) => {
    dashboardState.expenses = data ? Object.values(data) : [];
    updateFinancialOverview();
    if (!document.getElementById('financialTab').classList.contains('hidden')) { // Check if financial tab is active
      renderFinancialDashboard();
    }
  });
}

function updateFinancialOverview() {
  // Only if we need global counters. Logic is mainly in renderFinancialDashboard
}

// ============================================
// LOGIN / LOGOUT
// ============================================

function handleLogin(event) {
  event.preventDefault();

  const password = document.getElementById('adminPasswordInput').value;

  if (checkAdminPassword(password)) {
    setAdminSession();
    showAdminPanel();
  } else {
    showAlert(i18n.t('incorrectPassword'), 'error');
  }
}

function logout() {
  clearAdminSession();
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('adminPanel').classList.add('hidden');
  document.getElementById('adminPasswordInput').value = '';
}

// ============================================
// TAB MANAGEMENT
// ============================================

function showTab(tabName) {
  // Update tab buttons
  document.getElementById('tabMembers').className = tabName === 'members' ? 'btn btn-primary' : 'btn btn-outline';
  document.getElementById('tabFinancial').className = tabName === 'financial' ? 'btn btn-primary' : 'btn btn-outline';

  // Show/hide tabs
  document.getElementById('membersTab').classList.toggle('hidden', tabName !== 'members');
  document.getElementById('financialTab').classList.toggle('hidden', tabName !== 'financial');

  // Render content (listeners will handle actual rendering when data changes)
  if (tabName === 'members') {
    renderMembersTable();
    populateCityFilter();
  } else if (tabName === 'financial') {
    renderFinancialDashboard();
  }
}

// ============================================
// MEMBERS TABLE
// ============================================

function renderMembersTable() {
  let members = [...dashboardState.members]; // Use data from dashboardState

  // Apply filters
  if (filters.search) {
    members = members.filter(m =>
      m.name.toLowerCase().includes(filters.search) ||
      m.lastName.toLowerCase().includes(filters.search)
    );
  }

  if (filters.city) {
    members = members.filter(m => m.city === filters.city);
  }

  if (filters.urgency) {
    members = members.filter(m => m.urgencyLevel >= 4);
  }

  if (filters.payment) {
    members = members.filter(m => {
      const payments = Object.values(m.payments || {});
      return payments.some(paid => !paid);
    });
  }

  // Sort
  members = sortByKey(members, currentSort.key, currentSort.ascending);

  // Render
  const tbody = document.getElementById('membersTableBody');
  const noDataMsg = document.getElementById('noMembersMessage');

  if (members.length === 0) {
    tbody.innerHTML = '';
    noDataMsg.classList.remove('hidden');
    return;
  }

  noDataMsg.classList.add('hidden');

  tbody.innerHTML = members.map(member => `
    <tr>
      <td><strong>${member.name} ${member.lastName}</strong></td>
      <td>${member.city}</td>
      <td style="text-align: center;">
        <span style="background: ${getUrgencyColor(member.urgencyLevel)}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600;">
          ${member.urgencyLevel}
        </span>
      </td>
      <td>
        <input type="text" class="form-input" value="${member.function || ''}" 
               onchange="updateMemberFunction('${member.id}', this.value)"
               style="min-width: 150px;">
      </td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="showPaymentChecklist('${member.id}')">
          ${getPaymentSummary(member.payments)}
        </button>
      </td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editMember('${member.id}')" title="${i18n.t('editBtn')}">
          <span class="material-icons-round" style="font-size: 1.2em;">edit</span>
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteMemberConfirm('${member.id}')" title="${i18n.t('deleteBtn')}">
          <span class="material-icons-round" style="font-size: 1.2em;">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function getUrgencyColor(level) {
  if (level >= 4) return 'var(--color-error)';
  if (level >= 3) return 'var(--color-warning)';
  return 'var(--color-success)';
}

function getPaymentSummary(payments) {
  if (!payments) return '0/12';
  const paid = Object.values(payments).filter(p => p).length;
  return `${paid}/12`;
}

function sortTable(key) {
  if (currentSort.key === key) {
    currentSort.ascending = !currentSort.ascending;
  } else {
    currentSort.key = key;
    currentSort.ascending = true;
  }
  renderMembersTable();
}

function populateCityFilter() {
  const members = getAllMembers();
  const cities = [...new Set(members.map(m => m.city))].sort();

  const select = document.getElementById('cityFilter');
  const currentValue = select.value;

  select.innerHTML = `<option value="">${i18n.t('filterByCity')}</option>` +
    cities.map(city => `<option value="${city}">${city}</option>`).join('');

  select.value = currentValue;
}

function toggleUrgencyFilter() {
  filters.urgency = !filters.urgency;
  const btn = document.getElementById('urgencyFilterBtn');
  btn.className = filters.urgency ? 'btn btn-primary' : 'btn btn-outline';
  renderMembersTable();
}

function togglePaymentFilter() {
  filters.payment = !filters.payment;
  const btn = document.getElementById('paymentFilterBtn');
  btn.className = filters.payment ? 'btn btn-primary' : 'btn btn-outline';
  renderMembersTable();
}

function clearFilters() {
  filters = { search: '', city: '', urgency: false, payment: false };
  document.getElementById('searchInput').value = '';
  document.getElementById('cityFilter').value = '';
  document.getElementById('urgencyFilterBtn').className = 'btn btn-outline';
  document.getElementById('paymentFilterBtn').className = 'btn btn-outline';
  renderMembersTable();
}

// ============================================
// MEMBER ACTIONS
// ============================================

function updateMemberFunction(memberId, functionValue) {
  updateMember(memberId, { function: functionValue });
  showAlert(i18n.t('success'), 'success', 2000);
}

function showPaymentChecklist(memberId) {
  const member = getMemberById(memberId);
  if (!member) return;

  const months = ['january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'];

  const modalContent = `
    <h4>${member.name} ${member.lastName}</h4>
    <div class="payment-checklist" style="grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));">
      ${months.map(month => `
        <div class="payment-month">
          <label>${i18n.getMonthName(months.indexOf(month))}</label>
          <input type="checkbox" class="form-checkbox" 
                 ${member.payments[month] ? 'checked' : ''}
                 onchange="updatePayment('${memberId}', '${month}', this.checked)">
        </div>
      `).join('')}
    </div>
    <div class="mt-2">
      <button class="btn btn-primary btn-block" onclick="closeEditModal()">
        ${i18n.t('saveBtn')}
      </button>
    </div>
  `;

  document.getElementById('editModalContent').innerHTML = modalContent;
  document.getElementById('editModal').classList.remove('hidden');
}

function updatePayment(memberId, month, checked) {
  const member = getMemberById(memberId);
  if (!member) return;

  member.payments[month] = checked;
  updateMember(memberId, { payments: member.payments });
}

function editMember(memberId) {
  const member = getMemberById(memberId);
  if (!member) return;

  const modalContent = `
    <form id="editMemberForm">
      <div class="form-group">
        <label class="form-label">${i18n.t('name')}</label>
        <input type="text" class="form-input" value="${member.name}" id="editName">
      </div>
      <div class="form-group">
        <label class="form-label">${i18n.t('lastName')}</label>
        <input type="text" class="form-input" value="${member.lastName}" id="editLastName">
      </div>
      <div class="form-group">
        <label class="form-label">${i18n.t('city')}</label>
        <input type="text" class="form-input" value="${member.city}" id="editCity">
      </div>
      <div class="form-group">
        <label class="form-label">${i18n.t('phone')}</label>
        <input type="tel" class="form-input" value="${member.phone}" id="editPhone">
      </div>
      <div class="form-group">
        <label class="form-label">${i18n.t('email')}</label>
        <input type="email" class="form-input" value="${member.email}" id="editEmail">
      </div>
      <div class="flex flex-gap">
        <button type="button" class="btn btn-outline" onclick="closeEditModal()">
          ${i18n.t('cancelBtn')}
        </button>
        <button type="button" class="btn btn-primary" style="flex: 1;" onclick="saveEditedMember('${memberId}')">
          ${i18n.t('saveBtn')}
        </button>
      </div>
    </form>
  `;

  document.getElementById('editModalContent').innerHTML = modalContent;
  document.getElementById('editModal').classList.remove('hidden');
}

function saveEditedMember(memberId) {
  const updates = {
    name: document.getElementById('editName').value,
    lastName: document.getElementById('editLastName').value,
    city: document.getElementById('editCity').value,
    phone: document.getElementById('editPhone').value,
    email: document.getElementById('editEmail').value
  };

  updateMember(memberId, updates);
  closeEditModal();
  renderMembersTable();
  populateCityFilter();
  showAlert(i18n.t('success'), 'success', 2000);
}

function closeEditModal() {
  document.getElementById('editModal').classList.add('hidden');
}

function deleteMemberConfirm(memberId) {
  if (confirm(i18n.t('deleteMemberConfirm'))) {
    deleteData(`socios/${memberId}`)
      .then(() => showAlert(i18n.t('deleteSuccess'), 'success'))
      .catch(err => showAlert(i18n.t('error'), 'error'));
  }
}

function exportMembers() {
  const password = prompt(i18n.t('exportPassword'));

  if (!checkAdminPassword(password)) {
    showAlert(i18n.t('incorrectPassword'), 'error');
    return;
  }

  const members = getAllMembers();

  // Flatten data for CSV
  const csvData = members.map(m => ({
    Nombre: m.name,
    Apellidos: m.lastName,
    Ciudad: m.city,
    País: m.country,
    Teléfono: m.phone,
    Email: m.email,
    Empleo: m.employmentStatus,
    Vivienda: m.housingType,
    Urgencia: m.urgencyLevel,
    Función: m.function || '',
    'Fecha Registro': m.registrationDate,
    'Pagos Realizados': getPaymentSummary(m.payments)
  }));

  exportToCSV(csvData, `cooperativa_miembros_${formatDate(new Date())}.csv`);
}

// ============================================
// FINANCIAL DASHBOARD (Firebase)
// ============================================

function renderFinancialDashboard() {
  // 1. Calculate Totals (using Realtime Data)
  const incomeList = dashboardState.income || [];
  const expenseList = dashboardState.expenses || [];

  // Sort logic
  incomeList.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
  expenseList.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));

  const totalIncome = incomeList.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalExpenses = expenseList.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const currentBalance = totalIncome - totalExpenses;

  // 2. Update UI
  document.getElementById('totalIncomeDisplay').textContent = formatCurrency(totalIncome);
  document.getElementById('totalExpensesDisplay').textContent = formatCurrency(totalExpenses);
  document.getElementById('currentBalanceDisplay').textContent = formatCurrency(currentBalance);

  // Update Emergency Fund (Example: 10% of balance)
  const emergencyFund = currentBalance * 0.10;
  document.getElementById('emergencyFundDisplay').textContent = formatCurrency(emergencyFund);

  // 3. Combine Transactions for Table
  let allTransactions = [
    ...incomeList.map(i => ({ ...i, type: 'income' })),
    ...expenseList.map(e => ({ ...e, type: 'expense' }))
  ];

  allTransactions.sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));

  // Render Table
  const tbody = document.getElementById('financialTableBody');
  tbody.innerHTML = allTransactions.map(t => {
    const dateStr = formatDate(new Date(t.date || t.timestamp));
    return `
        <tr>
            <td>${dateStr}</td>
            <td>
                <span class="badge ${t.type === 'income' ? 'badge-success' : 'badge-danger'}">
                    ${t.type === 'income' ? i18n.t('totalIncome') : i18n.t('totalExpenses')}
                </span>
            </td>
            <td>${t.source ? i18n.t('source_' + t.source) : i18n.t('category_' + t.category)}</td>
            <td><strong>${formatCurrency(t.amount)}</strong></td>
            <td>${t.description || '-'}</td>
             <td>
                <button class="btn btn-danger btn-sm" onclick="deleteTransaction('${t.type}', '${t.id}')">
                <span class="material-icons-round">delete</span>
                </button>
            </td>
        </tr>
        `;
  }).join('');
}

// Add Transaction (Generic handler for Income/Expense forms)
function handleAddTransaction(event, type) {
  event.preventDefault();
  const formId = type === 'income' ? 'incomeForm' : 'expenseForm';
  const form = document.getElementById(formId);

  // Construct data object
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Standardize fields
  const newTransaction = {
    amount: parseFloat(data.amount),
    date: data.date,
    // Income specific
    source: data.source || null,
    // Expense specific
    category: data.category || null,
    description: data.description || '',
    timestamp: new Date().toISOString()
  };

  // Firebase Push
  const path = type === 'income' ? 'ingresos' : 'gastos';

  pushData(path, newTransaction)
    .then(() => {
      showAlert('Transacción agregada correctamente', 'success');
      form.reset();
      // No need to manually re-render, listener will do it
    })
    .catch(err => showAlert('Error al guardar', 'error'));
}

function deleteTransaction(type, id) {
  if (confirm('¿Eliminar esta transacción?')) {
    const path = type === 'income' ? 'ingresos' : 'gastos';
    deleteData(`${path}/${id}`)
      .then(() => showAlert('Eliminado correctamente', 'success'))
      .catch(err => showAlert('Error al eliminar', 'error'));
  }
}

// Add small button styles
const style = document.createElement('style');
style.textContent = `
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.85em;
    min-width: auto;
  }
`;
document.head.appendChild(style);
