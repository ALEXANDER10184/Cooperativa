// ============================================
// FIREBASE REALTIME DATABASE CONFIGURATION
// ============================================

// TODO: Reemplaza este objeto con tu propia configuración de Firebase
// La obtienes en la consola de Firebase: Project Settings > General > Your apps > SDK setup/config
const firebaseConfig = {
    apiKey: "API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

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
const connectedRef = db.ref('.info/connected');
connectedRef.on('value', (snap) => {
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
function saveData(path, data) {
    return db.ref(path).set(data)
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
function pushData(path, data) {
    const newRef = db.ref(path).push();
    const newKey = newRef.key;
    return newRef.set({ ...data, id: newKey })
        .then(() => {
            console.log(`Data pushed to ${path} with key: ${newKey}`);
            return { success: true, key: newKey };
        })
        .catch((error) => {
            console.error("Error pushing data: ", error);
            showConnectionError();
            return { success: false, error: error.message };
        });
}

/**
 * Update specific fields at a path.
 * @param {string} path - The database path
 * @param {object} updates - Object containing fields to update
 * @returns {Promise} Promise that resolves when data is updated
 */
function updateData(path, updates) {
    return db.ref(path).update(updates)
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
function deleteData(path) {
    return db.ref(path).remove()
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
function listenData(path, onData) {
    const ref = db.ref(path);
    const listener = ref.on('value', (snapshot) => {
        const data = snapshot.val();
        onData(data);
    }, (error) => {
        console.error(`Error listening to ${path}:`, error);
        showConnectionError();
        onData(null);
    });
    
    // Return unsubscribe function
    return () => ref.off('value', listener);
}

/**
 * Read data once (no real-time listener).
 * @param {string} path - The database path
 * @returns {Promise} Promise that resolves with the data
 */
function readDataOnce(path) {
    return db.ref(path).once('value')
        .then(snapshot => snapshot.val())
        .catch((error) => {
            console.error(`Error reading from ${path}:`, error);
            showConnectionError();
            return null;
        });
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
function isFirebaseConnected() {
    return isOnline;
}

/**
 * Add connection state listener
 * @param {function} callback - Function called with connection state (true/false)
 */
function onConnectionChange(callback) {
    connectionListeners.push(callback);
    return () => {
        connectionListeners = connectionListeners.filter(cb => cb !== callback);
    };
}
