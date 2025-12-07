// ============================================
// FIREBASE GLOBAL WRAPPER
// Makes Firebase functions available globally for non-module scripts
// ============================================

import { 
    saveData, 
    pushData, 
    updateData, 
    deleteData, 
    listenData, 
    readDataOnce,
    isFirebaseConnected,
    onConnectionChange,
    getAdminToken,
    getSocios,
    addSocio,
    updateSocio,
    deleteSocio
} from './firebase.js';

// Admin token - will be read from Firebase
let ADMIN_TOKEN = 'esperanza2025'; // Default fallback

// Initialize admin token from Firebase
async function initializeAdminToken() {
    try {
        const configData = await readDataOnce('config');
        if (configData && configData.adminToken) {
            ADMIN_TOKEN = configData.adminToken;
        } else {
            // Initialize with default if not exists
            await saveData('config', {
                adminToken: 'esperanza2025',
                ultimaActualizacion: Date.now()
            });
        }
    } catch (error) {
        console.error('Error initializing admin token:', error);
        // Keep default token
    }
}

// Initialize on load
initializeAdminToken();

// Check if user is admin (from localStorage)
function isAdmin() {
    try {
        const adminSession = JSON.parse(localStorage.getItem('cooperativa_admin_session') || 'null');
        if (!adminSession || !adminSession.authenticated) {
            return false;
        }
        // Check if session is not expired (2 hours)
        const TWO_HOURS = 2 * 60 * 60 * 1000;
        const isExpired = (Date.now() - (adminSession.timestamp || 0)) > TWO_HOURS;
        return !isExpired;
    } catch (error) {
        return false;
    }
}

// Secure wrapper functions that add admin token when needed
async function saveDataSecure(path, data, requireAdmin = false) {
    if (requireAdmin && !isAdmin()) {
        showAccessDenied();
        return { success: false, error: 'Acceso denegado' };
    }
    
    // Validate data
    if (!validateData(data)) {
        return { success: false, error: 'Datos inválidos' };
    }
    
    // Add admin token if admin operation
    if (requireAdmin) {
        const currentToken = await getAdminToken();
        data.adminToken = currentToken;
    }
    
    return await saveData(path, data);
}

async function pushDataSecure(path, data, requireAdmin = false) {
    if (requireAdmin && !isAdmin()) {
        showAccessDenied();
        return { success: false, error: 'Acceso denegado' };
    }
    
    // Validate data
    if (!validateData(data)) {
        return { success: false, error: 'Datos inválidos' };
    }
    
    // Add admin token if admin operation
    if (requireAdmin) {
        const currentToken = await getAdminToken();
        data.adminToken = currentToken;
    }
    
    // Add timestamp if not present
    if (!data.timestamp) {
        data.timestamp = Date.now();
    }
    
    return await pushData(path, data);
}

async function updateDataSecure(path, partialData, requireAdmin = false) {
    if (requireAdmin && !isAdmin()) {
        showAccessDenied();
        return { success: false, error: 'Acceso denegado' };
    }
    
    // Validate data
    if (!validateData(partialData)) {
        return { success: false, error: 'Datos inválidos' };
    }
    
    // Add admin token if admin operation
    if (requireAdmin) {
        const currentToken = await getAdminToken();
        partialData.adminToken = currentToken;
    }
    
    return await updateData(path, partialData);
}

async function deleteDataSecure(path, requireAdmin = false) {
    if (requireAdmin && !isAdmin()) {
        showAccessDenied();
        return { success: false, error: 'Acceso denegado' };
    }
    
    return await deleteData(path);
}

// Validate data (no null, no empty strings, no negative amounts)
function validateData(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    
    for (const key in data) {
        const value = data[key];
        
        // Skip adminToken and id fields
        if (key === 'adminToken' || key === 'id') {
            continue;
        }
        
        // Check for null
        if (value === null || value === undefined) {
            return false;
        }
        
        // Check for empty strings
        if (typeof value === 'string' && value.trim().length === 0) {
            return false;
        }
        
        // Check for negative amounts
        if ((key === 'monto' || key === 'amount' || key === 'aporteMensual') && typeof value === 'number' && value < 0) {
            return false;
        }
    }
    
    return true;
}

// Show access denied modal
function showAccessDenied() {
    if (typeof showAlert === 'function') {
        showAlert('Acceso restringido. Solo administradores pueden realizar esta acción.', 'error', 5000);
    } else {
        alert('Acceso restringido. Solo administradores pueden realizar esta acción.');
    }
}

// Export to global scope
window.saveData = saveData;
window.pushData = pushData;
window.updateData = updateData;
window.deleteData = deleteData;
window.listenData = listenData;
window.readDataOnce = readDataOnce;
window.isFirebaseConnected = isFirebaseConnected;
window.onConnectionChange = onConnectionChange;

// Get current admin token
async function getAdminToken() {
    try {
        const configData = await readDataOnce('config');
        return configData?.adminToken || ADMIN_TOKEN;
    } catch (error) {
        return ADMIN_TOKEN;
    }
}

// Export secure functions
window.saveDataSecure = saveDataSecure;
window.pushDataSecure = pushDataSecure;
window.updateDataSecure = updateDataSecure;
window.deleteDataSecure = deleteDataSecure;
window.isAdmin = isAdmin;
window.validateData = validateData;
window.getAdminToken = getAdminToken;

