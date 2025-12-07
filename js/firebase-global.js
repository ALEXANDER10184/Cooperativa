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
    getSocios,
    addSocio,
    updateSocio,
    deleteSocio
} from './firebase.js';


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
    
    // Admin operations no longer require token
    
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
    
    // Admin operations no longer require token
    
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

// Export CRUD functions globally
window.getSocios = getSocios;
window.addSocio = addSocio;
window.updateSocio = updateSocio;
window.deleteSocio = deleteSocio;

// Export secure functions
window.saveDataSecure = saveDataSecure;
window.pushDataSecure = pushDataSecure;
window.updateDataSecure = updateDataSecure;
window.deleteDataSecure = deleteDataSecure;
window.isAdmin = isAdmin;
window.validateData = validateData;

