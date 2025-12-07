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
    onConnectionChange
} from './firebase.js';

// Export to global scope
window.saveData = saveData;
window.pushData = pushData;
window.updateData = updateData;
window.deleteData = deleteData;
window.listenData = listenData;
window.readDataOnce = readDataOnce;
window.isFirebaseConnected = isFirebaseConnected;
window.onConnectionChange = onConnectionChange;

