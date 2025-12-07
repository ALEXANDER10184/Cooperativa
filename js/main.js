// ============================================
// MAIN UTILITIES
// Cooperativa Provivienda "Mi Esperanza"
// ============================================

// ============================================
// CONSTANTS
// ============================================

const ADMIN_PASSWORD = 'esperanza2025';
const MEMBER_PASSWORD = 'esperanza'; // Shared code for members
const MAX_CHAT_MESSAGES = 100;

// ============================================
// LOCALSTORAGE KEYS
// ============================================

const STORAGE_KEYS = {
    MEMBERS: 'cooperativa_members',
    INCOME: 'cooperativa_income',
    EXPENSES: 'cooperativa_expenses',
    EMERGENCY_FUND: 'cooperativa_emergency_fund',
    AID_REGISTRY: 'cooperativa_aid_registry',
    CHAT_MESSAGES: 'cooperativa_chat',
    LANGUAGE: 'cooperativa_language',
    ADMIN_SESSION: 'cooperativa_admin_session',
    MEMBER_SESSION: 'cooperativa_member_session'
};

// ============================================
// LOCALSTORAGE HELPERS
// ============================================

function getFromStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return defaultValue;
    }
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error);
        return false;
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage (${key}):`, error);
        return false;
    }
}

// ============================================
// ID GENERATION
// ============================================

function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// DATE FORMATTING
// ============================================

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDateTime(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    const dateStr = formatDate(date);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${dateStr} ${hours}:${minutes}`;
}

function formatTime(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    // Remove spaces, dashes, parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Check if it's a valid phone number (at least 6 digits, can start with +)
    const re = /^\+?[\d]{6,15}$/;
    return re.test(cleaned);
}

function validateRequired(value) {
    return value !== null && value !== undefined && value.trim() !== '';
}

function validateNumber(value, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
}

// ============================================
// FORM HELPERS
// ============================================

function showError(inputElement, message) {
    inputElement.classList.add('error');

    // Remove existing error message
    const existingError = inputElement.parentElement.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }

    // Add new error message
    const errorDiv = document.createElement('span');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    inputElement.parentElement.appendChild(errorDiv);
}

function clearError(inputElement) {
    inputElement.classList.remove('error');
    const errorDiv = inputElement.parentElement.querySelector('.form-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function clearAllErrors(formElement) {
    const errorInputs = formElement.querySelectorAll('.error');
    errorInputs.forEach(input => clearError(input));
}

// ============================================
// ALERT HELPERS
// ============================================

function showAlert(message, type = 'info', duration = 5000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    // Insert at the top of the container
    const container = document.querySelector('.container, .container-sm, .container-lg');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                alertDiv.remove();
            }, duration);
        }
    }

    return alertDiv;
}

// ============================================
// NAVIGATION HELPERS
// ============================================

function navigateTo(page) {
    window.location.href = page;
}

function goBack() {
    window.history.back();
}

// ============================================
// ADMIN SESSION MANAGEMENT
// ============================================

function checkAdminPassword(password) {
    return password === ADMIN_PASSWORD;
}

function setAdminSession() {
    const sessionData = {
        authenticated: true,
        timestamp: Date.now()
    };
    saveToStorage(STORAGE_KEYS.ADMIN_SESSION, sessionData);
}

function clearAdminSession() {
    removeFromStorage(STORAGE_KEYS.ADMIN_SESSION);
}

function isAdminAuthenticated() {
    const session = getFromStorage(STORAGE_KEYS.ADMIN_SESSION, null);
    if (!session || !session.authenticated) {
        return false;
    }

    // Session expires after 2 hours
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const isExpired = (Date.now() - session.timestamp) > TWO_HOURS;

    if (isExpired) {
        clearAdminSession();
        return false;
    }

    return true;
}

function checkMemberPassword(password) {
    return password === MEMBER_PASSWORD;
}

function setMemberSession() {
    // Permanent session for simplicity on this device
    saveToStorage(STORAGE_KEYS.MEMBER_SESSION, { authenticated: true });
}

function isMemberAuthenticated() {
    const session = getFromStorage(STORAGE_KEYS.MEMBER_SESSION, null);
    return session && session.authenticated;
}

// ============================================
// MEMBER MANAGEMENT
// ============================================

function getAllMembers() {
    return getFromStorage(STORAGE_KEYS.MEMBERS, []);
}

function getMemberById(id) {
    const members = getAllMembers();
    return members.find(member => member.id === id);
}

function saveMember(memberData) {
    const members = getAllMembers();

    // Add metadata
    memberData.id = memberData.id || generateId();
    memberData.registrationDate = memberData.registrationDate || new Date().toISOString();
    memberData.function = memberData.function || '';
    memberData.payments = memberData.payments || {
        january: false,
        february: false,
        march: false,
        april: false,
        may: false,
        june: false,
        july: false,
        august: false,
        september: false,
        october: false,
        november: false,
        december: false
    };

    members.push(memberData);
    return saveToStorage(STORAGE_KEYS.MEMBERS, members);
}

function updateMember(id, updates) {
    const members = getAllMembers();
    const index = members.findIndex(member => member.id === id);

    if (index === -1) return false;

    members[index] = { ...members[index], ...updates };
    return saveToStorage(STORAGE_KEYS.MEMBERS, members);
}

function deleteMember(id) {
    const members = getAllMembers();
    const filtered = members.filter(member => member.id !== id);
    return saveToStorage(STORAGE_KEYS.MEMBERS, filtered);
}

// ============================================
// FINANCIAL MANAGEMENT
// ============================================

function getAllIncome() {
    return getFromStorage(STORAGE_KEYS.INCOME, []);
}

function saveIncome(incomeData) {
    const incomes = getAllIncome();
    incomeData.id = incomeData.id || generateId();
    incomeData.timestamp = incomeData.timestamp || new Date().toISOString();
    incomes.push(incomeData);
    return saveToStorage(STORAGE_KEYS.INCOME, incomes);
}

function getAllExpenses() {
    return getFromStorage(STORAGE_KEYS.EXPENSES, []);
}

function saveExpense(expenseData) {
    const expenses = getAllExpenses();
    expenseData.id = expenseData.id || generateId();
    expenseData.timestamp = expenseData.timestamp || new Date().toISOString();
    expenses.push(expenseData);
    return saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
}

function calculateBalance() {
    const incomes = getAllIncome();
    const expenses = getAllExpenses();

    const totalIncome = incomes.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const balance = totalIncome - totalExpenses;

    return {
        totalIncome,
        totalExpenses,
        balance
    };
}

function deleteIncome(id) {
    const incomes = getAllIncome();
    const filtered = incomes.filter(item => item.id !== id);
    return saveToStorage(STORAGE_KEYS.INCOME, filtered);
}

function deleteExpense(id) {
    const expenses = getAllExpenses();
    const filtered = expenses.filter(item => item.id !== id);
    return saveToStorage(STORAGE_KEYS.EXPENSES, filtered);
}

// ============================================
// CHAT MANAGEMENT
// ============================================

function getAllMessages() {
    return getFromStorage(STORAGE_KEYS.CHAT_MESSAGES, []);
}

function saveMessage(messageData) {
    let messages = getAllMessages();

    messageData.id = messageData.id || generateId();
    messageData.timestamp = messageData.timestamp || new Date().toISOString();

    messages.push(messageData);

    // Keep only last MAX_CHAT_MESSAGES
    if (messages.length > MAX_CHAT_MESSAGES) {
        messages = messages.slice(-MAX_CHAT_MESSAGES);
    }

    return saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, messages);
}

function deleteMessage(id) {
    const messages = getAllMessages();
    const filtered = messages.filter(msg => msg.id !== id);
    return saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, filtered);
}

// ============================================
// CSV EXPORT
// ============================================

function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showAlert(i18n.t('noData'), 'warning');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    let csvContent = headers.join(',') + '\n';

    data.forEach(row => {
        const values = headers.map(header => {
            let value = row[header];

            // Handle objects and arrays
            if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
            }

            // Escape quotes and wrap in quotes if contains comma
            value = String(value).replace(/"/g, '""');
            if (value.includes(',') || value.includes('\n')) {
                value = `"${value}"`;
            }

            return value;
        });

        csvContent += values.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// CURRENCY FORMATTING
// ============================================

function formatCurrency(amount, currency = '€') {
    const num = parseFloat(amount);
    if (isNaN(num)) return `0.00 ${currency}`;
    return `${num.toFixed(2)} ${currency}`;
}

// ============================================
// SORTING HELPERS
// ============================================

function sortByKey(array, key, ascending = true) {
    return array.sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];

        // Handle different types
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
    });
}

// ============================================
// DEBOUNCE HELPER
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// GLOBAL INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Check large text preference
    if (localStorage.getItem('largeText') === 'true') {
        document.body.classList.add('large-text-mode');
    }
});

// ============================================
// QR CODE MANAGEMENT
// ============================================

function showQRModal() {
    const modal = document.getElementById('qrModal');
    const input = document.getElementById('qrUrlInput');
    const warning = document.getElementById('localWarning');

    // Set default URL to current unless local file
    if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        input.value = "https://mi-esperanza.netlify.app"; // Better example
        if (warning) warning.classList.remove('hidden');
    } else {
        input.value = window.location.href;
        if (warning) warning.classList.add('hidden');
    }

    generateQR();
    modal.classList.remove('hidden');
}

function closeQRModal() {
    document.getElementById('qrModal').classList.add('hidden');
}

function generateQR() {
    const url = document.getElementById('qrUrlInput').value.trim();
    const cleanUrl = encodeURIComponent(url);
    const img = document.getElementById('qrImage');

    if (cleanUrl) {
        // Using external API for generation
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${cleanUrl}&color=5FAF6B&margin=10`;
    }
}

// Toggle Large Text
function toggleLargeText() {
    document.body.classList.toggle('large-text-mode');
    localStorage.setItem('largeText', document.body.classList.contains('large-text-mode'));
}

// Global initialization for large text
document.addEventListener('DOMContentLoaded', function () {
    // Check large text preference
    if (localStorage.getItem('largeText') === 'true') {
        document.body.classList.add('large-text-mode');
    }
});
