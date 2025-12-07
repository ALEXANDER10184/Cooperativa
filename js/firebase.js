// ============================================
// FIREBASE CONFIGURATION & INITIALIZATION
// ============================================

// TODO: Remplaza este objeto con tu propia configuración de Firebase
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

/**
 * Save (Set) data to a specific path. Overwrites existing data at that path.
 * @param {string} path - The database path (e.g., 'socios/user123')
 * @param {object} data - The data to save
 */
function saveData(path, data) {
    return db.ref(path).set(data)
        .then(() => console.log(`Data saved to ${path}`))
        .catch((error) => console.error("Error saving data: ", error));
}

/**
 * Add (Push) data to a list. Generates a unique ID.
 * @param {string} path - The list path (e.g., 'chat', 'ingresos')
 * @param {object} data - The data to add
 */
function pushData(path, data) {
    const newRef = db.ref(path).push();
    return newRef.set({ ...data, id: newRef.key })
        .then(() => console.log(`Data pushed to ${path}`))
        .catch((error) => console.error("Error pushing data: ", error));
}

/**
 * Update specific fields at a path.
 * @param {string} path - The database path
 * @param {object} updates - Object containing fields to update
 */
function updateData(path, updates) {
    return db.ref(path).update(updates)
        .then(() => console.log(`Data updated at ${path}`))
        .catch((error) => console.error("Error updating data: ", error));
}

/**
 * Delete data at a path.
 * @param {string} path - The database path
 */
function deleteData(path) {
    return db.ref(path).remove()
        .then(() => console.log(`Data removed from ${path}`))
        .catch((error) => console.error("Error removing data: ", error));
}

/**
 * Listen for real-time changes at a path.
 * Callbacks receive the full data snapshot value.
 * @param {string} path - The database path to listen to
 * @param {function} onData - Callback function (data) => {}
 */
function listenData(path, onData) {
    db.ref(path).on('value', (snapshot) => {
        const data = snapshot.val();
        onData(data);
    });
}

/**
 * Read data once (no real-time listener).
 * @param {string} path 
 */
function readDataOnce(path) {
    return db.ref(path).once('value').then(snapshot => snapshot.val());
}
