// ============================================
// MAIN UTILITIES
// Cooperativa Provivienda "Mi Esperanza"
// ============================================

// ============================================
// DATABASE MODULE IMPORTS
// ============================================

import { 
    initDB, 
    getAll, 
    getItem, 
    addItem, 
    updateItem, 
    deleteItem, 
    clearCollection,
    getFullDB
} from './db.js';

// Hacer funciones disponibles globalmente para uso en HTML
window.db = {
    init: initDB,
    getAll: getAll,
    getItem: getItem,
    addItem: addItem,
    updateItem: updateItem,
    deleteItem: deleteItem,
    clearCollection: clearCollection,
    getFullDB: getFullDB
};

// ============================================
// DATABASE DEMO FUNCTIONS
// ============================================

/**
 * Inicializa la base de datos al cargar la página
 */
export async function initializeDatabase() {
    try {
        await initDB();
        console.log('✅ Base de datos inicializada');
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error);
        return false;
    }
}

/**
 * Ejemplo: Agregar un socio
 */
export async function demoAddSocio() {
    try {
        const nuevoSocio = {
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@example.com',
            telefono: '123456789',
            ciudad: 'Bogotá',
            estado: 'activo'
        };
        
        const socioAgregado = addItem('socios', nuevoSocio);
        console.log('✅ Socio agregado:', socioAgregado);
        return socioAgregado;
    } catch (error) {
        console.error('❌ Error al agregar socio:', error);
        throw error;
    }
}

/**
 * Ejemplo: Listar todos los socios
 */
export function demoListSocios() {
    try {
        const socios = getAll('socios');
        console.log(`📋 Total de socios: ${socios.length}`);
        console.table(socios);
        return socios;
    } catch (error) {
        console.error('❌ Error al listar socios:', error);
        throw error;
    }
}

/**
 * Ejemplo: Editar un socio
 */
export function demoEditSocio(socioId, nuevosDatos) {
    try {
        const socioActualizado = updateItem('socios', socioId, nuevosDatos);
        if (socioActualizado) {
            console.log('✅ Socio actualizado:', socioActualizado);
        } else {
            console.warn('⚠️ Socio no encontrado');
        }
        return socioActualizado;
    } catch (error) {
        console.error('❌ Error al editar socio:', error);
        throw error;
    }
}

/**
 * Ejemplo: Borrar un socio
 */
export function demoDeleteSocio(socioId) {
    try {
        const eliminado = deleteItem('socios', socioId);
        if (eliminado) {
            console.log(`✅ Socio con ID ${socioId} eliminado`);
        } else {
            console.warn(`⚠️ Socio con ID ${socioId} no encontrado`);
        }
        return eliminado;
    } catch (error) {
        console.error('❌ Error al borrar socio:', error);
        throw error;
    }
}

// Hacer funciones demo disponibles globalmente
window.demoAddSocio = demoAddSocio;
window.demoListSocios = demoListSocios;
window.demoEditSocio = demoEditSocio;
window.demoDeleteSocio = demoDeleteSocio;
window.initializeDatabase = initializeDatabase;

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
// MEMBER MANAGEMENT (Firebase)
// ============================================

async function getAllMembers() {
    try {
        const data = await readDataOnce('socios');
        if (!data) return [];
        return Object.values(data);
    } catch (error) {
        console.error('Error getting members:', error);
        return [];
    }
}

async function getMemberById(id) {
    try {
        const data = await readDataOnce(`socios/${id}`);
        return data;
    } catch (error) {
        console.error('Error getting member:', error);
        return null;
    }
}

async function saveMember(memberData) {
    try {
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
        
        const result = await saveData(`socios/${memberData.id}`, memberData);
        if (result.success && typeof showAlert === 'function') {
            showAlert('Socio registrado correctamente', 'success', 2000);
        }
        return result.success;
    } catch (error) {
        console.error('Error saving member:', error);
        return false;
    }
}

async function updateMember(id, updates) {
    try {
        // Validate admin
        if (typeof isAdmin === 'function' && !isAdmin()) {
            if (typeof showAlert === 'function') {
                showAlert('Solo administradores pueden editar socios', 'error', 3000);
            }
            return false;
        }
        
        // Use secure function if available
        const updateFn = typeof updateDataSecure === 'function' ? updateDataSecure : updateData;
        const result = await updateFn(`socios/${id}`, updates, true);
        
        if (result.success && typeof showAlert === 'function') {
            showAlert('Datos actualizados', 'success', 2000);
        }
        return result.success;
    } catch (error) {
        console.error('Error updating member:', error);
        return false;
    }
}

async function deleteMember(id) {
    try {
        // Validate admin
        if (typeof isAdmin === 'function' && !isAdmin()) {
            if (typeof showAlert === 'function') {
                showAlert('Solo administradores pueden eliminar socios', 'error', 3000);
            }
            return false;
        }
        
        // Use secure function if available
        const deleteFn = typeof deleteDataSecure === 'function' ? deleteDataSecure : deleteData;
        const result = await deleteFn(`socios/${id}`, true);
        return result.success;
    } catch (error) {
        console.error('Error deleting member:', error);
        return false;
    }
}

// ============================================
// FINANCIAL MANAGEMENT (Firebase)
// ============================================

async function getAllIncome() {
    try {
        const data = await readDataOnce('ingresos');
        if (!data) return [];
        return Object.values(data);
    } catch (error) {
        console.error('Error getting income:', error);
        return [];
    }
}

async function saveIncome(incomeData) {
    try {
        // Validate admin
        if (typeof isAdmin === 'function' && !isAdmin()) {
            if (typeof showAlert === 'function') {
                showAlert('Solo administradores pueden agregar ingresos', 'error', 3000);
            }
            return false;
        }
        
        incomeData.id = incomeData.id || generateId();
        incomeData.fecha = incomeData.fecha || new Date().toISOString();
        incomeData.timestamp = incomeData.timestamp || Date.now();
        
        // Use secure function if available
        const pushFn = typeof pushDataSecure === 'function' ? pushDataSecure : pushData;
        const result = await pushFn('ingresos', incomeData, true);
        
        if (result.success) {
            await updateBalance();
            if (typeof showAlert === 'function') {
                showAlert('Ingreso guardado correctamente', 'success', 2000);
            }
        }
        return result.success;
    } catch (error) {
        console.error('Error saving income:', error);
        return false;
    }
}

async function getAllExpenses() {
    try {
        const data = await readDataOnce('gastos');
        if (!data) return [];
        return Object.values(data);
    } catch (error) {
        console.error('Error getting expenses:', error);
        return [];
    }
}

async function saveExpense(expenseData) {
    try {
        // Validate admin
        if (typeof isAdmin === 'function' && !isAdmin()) {
            if (typeof showAlert === 'function') {
                showAlert('Solo administradores pueden agregar gastos', 'error', 3000);
            }
            return false;
        }
        
        expenseData.id = expenseData.id || generateId();
        expenseData.fecha = expenseData.fecha || new Date().toISOString();
        expenseData.timestamp = expenseData.timestamp || Date.now();
        
        // Use secure function if available
        const pushFn = typeof pushDataSecure === 'function' ? pushDataSecure : pushData;
        const result = await pushFn('gastos', expenseData, true);
        
        if (result.success) {
            await updateBalance();
            if (typeof showAlert === 'function') {
                showAlert('Gasto guardado correctamente', 'success', 2000);
            }
        }
        return result.success;
    } catch (error) {
        console.error('Error saving expense:', error);
        return false;
    }
}

async function calculateBalance() {
    try {
        const balanceData = await readDataOnce('balance');
        if (balanceData) {
            return {
                totalIncome: balanceData.ingresosTotales || 0,
                totalExpenses: balanceData.gastosTotales || 0,
                balance: balanceData.balanceActual || 0
            };
        }
        
        // Fallback: calculate from ingresos and gastos
        const incomes = await getAllIncome();
        const expenses = await getAllExpenses();
        
        const totalIncome = incomes.reduce((sum, item) => sum + parseFloat(item.monto || item.amount || 0), 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.monto || item.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        
        // Save calculated balance
        await saveData('balance', {
            ingresosTotales: totalIncome,
            gastosTotales: totalExpenses,
            balanceActual: balance,
            ultimaActualizacion: Date.now()
        });
        
        return { totalIncome, totalExpenses, balance };
    } catch (error) {
        console.error('Error calculating balance:', error);
        return { totalIncome: 0, totalExpenses: 0, balance: 0 };
    }
}

async function updateBalance() {
    try {
        // Validate admin
        if (typeof isAdmin === 'function' && !isAdmin()) {
            return false;
        }
        
        const incomes = await getAllIncome();
        const expenses = await getAllExpenses();
        
        const totalIncome = incomes.reduce((sum, item) => sum + parseFloat(item.monto || item.amount || 0), 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.monto || item.amount || 0), 0);
        const balance = totalIncome - totalExpenses;
        
        const balanceData = {
            ingresosTotales: totalIncome,
            gastosTotales: totalExpenses,
            balanceActual: balance,
            ultimaActualizacion: Date.now()
        };
        
        // Use secure function if available
        const saveFn = typeof saveDataSecure === 'function' ? saveDataSecure : saveData;
        await saveFn('balance', balanceData, true);
    } catch (error) {
        console.error('Error updating balance:', error);
    }
}

async function deleteIncome(id) {
    try {
        // Validate admin
        if (typeof isAdmin === 'function' && !isAdmin()) {
            if (typeof showAlert === 'function') {
                showAlert('Solo administradores pueden eliminar ingresos', 'error', 3000);
            }
            return false;
        }
        
        // Use secure function if available
        const deleteFn = typeof deleteDataSecure === 'function' ? deleteDataSecure : deleteData;
        const result = await deleteFn(`ingresos/${id}`, true);
        
        if (result.success) {
            await updateBalance();
        }
        return result.success;
    } catch (error) {
        console.error('Error deleting income:', error);
        return false;
    }
}

async function deleteExpense(id) {
    try {
        // Validate admin
        if (typeof isAdmin === 'function' && !isAdmin()) {
            if (typeof showAlert === 'function') {
                showAlert('Solo administradores pueden eliminar gastos', 'error', 3000);
            }
            return false;
        }
        
        // Use secure function if available
        const deleteFn = typeof deleteDataSecure === 'function' ? deleteDataSecure : deleteData;
        const result = await deleteFn(`gastos/${id}`, true);
        
        if (result.success) {
            await updateBalance();
        }
        return result.success;
    } catch (error) {
        console.error('Error deleting expense:', error);
        return false;
    }
}

// ============================================
// CHAT MANAGEMENT (Firebase)
// ============================================

async function getAllMessages() {
    try {
        const data = await readDataOnce('chat');
        if (!data) return [];
        const messages = Object.values(data);
        // Sort by timestamp and keep last MAX_CHAT_MESSAGES
        messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        return messages.slice(-MAX_CHAT_MESSAGES);
    } catch (error) {
        console.error('Error getting messages:', error);
        return [];
    }
}

async function saveMessage(messageData) {
    try {
        messageData.id = messageData.id || generateId();
        messageData.timestamp = messageData.timestamp || Date.now();
        
        const result = await pushData('chat', {
            nombre: messageData.nombre || messageData.sender || 'Anónimo',
            mensaje: messageData.mensaje || messageData.text || '',
            timestamp: messageData.timestamp
        });
        
        // Clean old messages (keep last MAX_CHAT_MESSAGES)
        if (result.success) {
            const messages = await getAllMessages();
            if (messages.length > MAX_CHAT_MESSAGES) {
                const toDelete = messages.slice(0, messages.length - MAX_CHAT_MESSAGES);
                for (const msg of toDelete) {
                    if (msg.id) {
                        await deleteData(`chat/${msg.id}`);
                    }
                }
            }
        }
        
        return result.success;
    } catch (error) {
        console.error('Error saving message:', error);
        return false;
    }
}

async function deleteMessage(id) {
    try {
        const result = await deleteData(`chat/${id}`);
        return result.success;
    } catch (error) {
        console.error('Error deleting message:', error);
        return false;
    }
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
