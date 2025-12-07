// ============================================
// FIREBASE REALTIME DATABASE - MODULAR V9+
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  update, 
  remove, 
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD6hwo0J7j5knmBwUDEaloKbbCQe1wFrZI",
  authDomain: "cooperativa-mi-esperanza.firebaseapp.com",
  databaseURL: "https://cooperativa-mi-esperanza-default-rtdb.firebaseio.com",
  projectId: "cooperativa-mi-esperanza",
  storageBucket: "cooperativa-mi-esperanza.firebasestorage.app",
  messagingSenderId: "52553896544",
  appId: "1:52553896544:web:f506f03781432758b22905",
  measurementId: "G-ZJZK9KVS2R"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Export ref and onValue for other modules if needed
export { ref, onValue };

// Connection state monitoring
let isOnline = navigator.onLine;
let connectionListeners = [];

window.addEventListener('online', () => {
    isOnline = true;
    connectionListeners.forEach(cb => cb(true));
    console.log('Conexión restaurada');
});

window.addEventListener('offline', () => {
    isOnline = false;
    connectionListeners.forEach(cb => cb(false));
    console.log('Sin conexión');
});

// Monitor Firebase connection
const connectedRef = ref(db, '.info/connected');
onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
        isOnline = true;
        connectionListeners.forEach(cb => cb(true));
    } else {
        isOnline = false;
        connectionListeners.forEach(cb => cb(false));
    }
});

/**
 * Save (Set) data to a specific path. Overwrites existing data at that path.
 * @param {string} path - The database path (e.g., 'socios/user123')
 * @param {object} data - The data to save
 * @returns {Promise} Promise that resolves when data is saved
 */
export function saveData(path, data) {
    return set(ref(db, path), data)
        .then(() => {
            console.log(`Data saved to ${path}`);
            return { success: true };
        })
        .catch((error) => {
            console.error("Error saving data: ", error);
            showConnectionError();
            return { success: false, error: error.message };
        });
}

/**
 * Add (Push) data to a list. Generates a unique ID.
 * @param {string} path - The list path (e.g., 'chat', 'ingresos')
 * @param {object} data - The data to add
 * @returns {Promise} Promise that resolves with the new key
 */
export async function pushData(path, data) {
    try {
        const newRef = push(ref(db, path));
        const newKey = newRef.key;
        await set(newRef, { ...data, id: newKey });
        console.log(`Data pushed to ${path} with key: ${newKey}`);
        return { success: true, key: newKey };
    } catch (error) {
        console.error("Error pushing data: ", error);
        showConnectionError();
        return { success: false, error: error.message };
    }
}

/**
 * Update specific fields at a path.
 * @param {string} path - The database path
 * @param {object} updates - Object containing fields to update
 * @returns {Promise} Promise that resolves when data is updated
 */
export function updateData(path, partialData) {
    return update(ref(db, path), partialData)
        .then(() => {
            console.log(`Data updated at ${path}`);
            return { success: true };
        })
        .catch((error) => {
            console.error("Error updating data: ", error);
            showConnectionError();
            return { success: false, error: error.message };
        });
}

/**
 * Delete data at a path.
 * @param {string} path - The database path
 * @returns {Promise} Promise that resolves when data is deleted
 */
export function deleteData(path) {
    return remove(ref(db, path))
        .then(() => {
            console.log(`Data removed from ${path}`);
            return { success: true };
        })
        .catch((error) => {
            console.error("Error removing data: ", error);
            showConnectionError();
            return { success: false, error: error.message };
        });
}

/**
 * Listen for real-time changes at a path.
 * Callbacks receive the full data snapshot value.
 * @param {string} path - The database path to listen to
 * @param {function} onData - Callback function (data) => {}
 * @returns {function} Unsubscribe function
 */
export function listenData(path, callback) {
    const dbRef = ref(db, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        callback(data);
    }, (error) => {
        console.error(`Error listening to ${path}:`, error);
        showConnectionError();
        callback(null);
    });
    
    // Return unsubscribe function
    return unsubscribe;
}

/**
 * Read data once (no real-time listener).
 * @param {string} path - The database path
 * @returns {Promise} Promise that resolves with the data
 */
export function readDataOnce(path) {
    return get(ref(db, path))
        .then(snapshot => snapshot.val())
        .catch((error) => {
            console.error(`Error reading from ${path}:`, error);
            showConnectionError();
            return null;
        });
}


/**
 * Get socios with real-time listener
 * @param {function} callback - Callback function (snapshot) => {}
 * @returns {function} Unsubscribe function
 */
export function getSocios(callback) {
    return onValue(ref(db, "socios"), callback, (error) => {
        console.error("Error getting socios:", error);
        callback(null);
    });
}

/**
 * Add a new socio
 * @param {string} id - Socio ID
 * @param {object} data - Socio data
 * @returns {Promise} Promise that resolves when data is saved
 */
export function addSocio(id, data) {
    return set(ref(db, "socios/" + id), data);
}

/**
 * Update an existing socio
 * @param {string} id - Socio ID
 * @param {object} data - Partial data to update
 * @returns {Promise} Promise that resolves when data is updated
 */
export async function updateSocio(id, data) {
    try {
        await update(ref(db, "socios/" + id), data);
        console.log(`Socio updated: ${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating socio:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a socio
 * @param {string} id - Socio ID
 * @returns {Promise} Promise that resolves when data is deleted
 */
export async function deleteSocio(id) {
    try {
        await remove(ref(db, "socios/" + id));
        console.log(`Socio deleted: ${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting socio:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Show connection error message
 */
function showConnectionError() {
    if (typeof showAlert === 'function') {
        showAlert('Error de conexión. Verificando...', 'warning', 3000);
    } else {
        console.warn('Sin conexión a Firebase');
    }
}

/**
 * Check if Firebase is connected
 * @returns {boolean} True if connected
 */
export function isFirebaseConnected() {
    return isOnline;
}

/**
 * Add connection state listener
 * @param {function} callback - Function called with connection state (true/false)
 */
export function onConnectionChange(callback) {
    connectionListeners.push(callback);
    return () => {
        connectionListeners = connectionListeners.filter(cb => cb !== callback);
    };
}
