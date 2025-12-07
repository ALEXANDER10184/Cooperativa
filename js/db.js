// ============================================
// DATABASE MODULE - JSON + localStorage
// ============================================

const DB_KEY = 'db';
const DB_JSON_PATH = '/data/db.json';

/**
 * Inicializa la base de datos
 * Carga db.json la primera vez, luego usa localStorage
 * @returns {Promise<Object>} Base de datos completa
 */
export async function initDB() {
    try {
        // Si ya existe en localStorage, usarlo
        const storedDB = localStorage.getItem(DB_KEY);
        if (storedDB) {
            console.log('📦 Base de datos cargada desde localStorage');
            return JSON.parse(storedDB);
        }

        // Si no existe, cargar desde JSON
        console.log('📥 Cargando base de datos inicial desde db.json...');
        const response = await fetch(DB_JSON_PATH);
        
        if (!response.ok) {
            throw new Error(`Error al cargar db.json: ${response.status} ${response.statusText}`);
        }

        const db = await response.json();
        
        // Guardar en localStorage para futuras sesiones
        saveDB(db);
        
        console.log('✅ Base de datos inicial cargada y guardada');
        return db;
    } catch (error) {
        console.error('❌ Error al inicializar DB:', error);
        
        // Si falla, crear estructura vacía
        const emptyDB = {
            socios: [],
            registros: [],
            configuraciones: {}
        };
        
        saveDB(emptyDB);
        console.log('📝 Base de datos vacía creada');
        return emptyDB;
    }
}

/**
 * Guarda el estado actual de la base de datos en localStorage
 * @param {Object} db - Base de datos completa
 */
export function saveDB(db) {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        console.log('💾 Base de datos guardada en localStorage');
    } catch (error) {
        console.error('❌ Error al guardar DB:', error);
        throw error;
    }
}

/**
 * Obtiene la base de datos actual desde localStorage
 * @returns {Object} Base de datos completa
 */
function getDB() {
    try {
        const storedDB = localStorage.getItem(DB_KEY);
        if (!storedDB) {
            throw new Error('Base de datos no inicializada. Llama a initDB() primero.');
        }
        return JSON.parse(storedDB);
    } catch (error) {
        console.error('❌ Error al obtener DB:', error);
        throw error;
    }
}

/**
 * Genera un ID único automático
 * @returns {string} ID único
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Obtiene todos los items de una colección
 * @param {string} collection - Nombre de la colección
 * @returns {Array} Array de items
 */
export function getAll(collection) {
    try {
        const db = getDB();
        
        if (!db[collection]) {
            console.warn(`⚠️ Colección "${collection}" no existe. Creando vacía.`);
            db[collection] = [];
            saveDB(db);
        }
        
        return db[collection] || [];
    } catch (error) {
        console.error(`❌ Error al obtener items de "${collection}":`, error);
        throw error;
    }
}

/**
 * Obtiene un item por ID
 * @param {string} collection - Nombre de la colección
 * @param {string} id - ID del item
 * @returns {Object|null} Item encontrado o null
 */
export function getItem(collection, id) {
    try {
        const items = getAll(collection);
        return items.find(item => item.id === id) || null;
    } catch (error) {
        console.error(`❌ Error al obtener item "${id}" de "${collection}":`, error);
        throw error;
    }
}

/**
 * Agrega un nuevo item a una colección
 * @param {string} collection - Nombre de la colección
 * @param {Object} item - Item a agregar (sin ID, se genera automáticamente)
 * @returns {Object} Item agregado con ID
 */
export function addItem(collection, item) {
    try {
        const db = getDB();
        
        // Crear colección si no existe
        if (!db[collection]) {
            db[collection] = [];
        }
        
        // Generar ID automático si no viene
        if (!item.id) {
            item.id = generateId();
        }
        
        // Agregar timestamp si no viene
        if (!item.timestamp) {
            item.timestamp = Date.now();
        }
        
        // Agregar item
        db[collection].push(item);
        
        // Persistir
        saveDB(db);
        
        console.log(`✅ Item agregado a "${collection}" con ID: ${item.id}`);
        return item;
    } catch (error) {
        console.error(`❌ Error al agregar item a "${collection}":`, error);
        throw error;
    }
}

/**
 * Actualiza un item existente
 * @param {string} collection - Nombre de la colección
 * @param {string} id - ID del item a actualizar
 * @param {Object} newData - Nuevos datos (se fusionan con los existentes)
 * @returns {Object|null} Item actualizado o null si no se encontró
 */
export function updateItem(collection, id, newData) {
    try {
        const db = getDB();
        
        if (!db[collection]) {
            throw new Error(`Colección "${collection}" no existe`);
        }
        
        // Buscar item
        const itemIndex = db[collection].findIndex(item => item.id === id);
        
        if (itemIndex === -1) {
            console.warn(`⚠️ Item con ID "${id}" no encontrado en "${collection}"`);
            return null;
        }
        
        // Actualizar item (fusionar datos)
        const updatedItem = {
            ...db[collection][itemIndex],
            ...newData,
            id: db[collection][itemIndex].id, // Mantener ID original
            updatedAt: Date.now() // Agregar timestamp de actualización
        };
        
        db[collection][itemIndex] = updatedItem;
        
        // Persistir
        saveDB(db);
        
        console.log(`✅ Item actualizado en "${collection}" con ID: ${id}`);
        return updatedItem;
    } catch (error) {
        console.error(`❌ Error al actualizar item en "${collection}":`, error);
        throw error;
    }
}

/**
 * Elimina un item de una colección
 * @param {string} collection - Nombre de la colección
 * @param {string} id - ID del item a eliminar
 * @returns {boolean} true si se eliminó, false si no se encontró
 */
export function deleteItem(collection, id) {
    try {
        const db = getDB();
        
        if (!db[collection]) {
            throw new Error(`Colección "${collection}" no existe`);
        }
        
        // Buscar item
        const itemIndex = db[collection].findIndex(item => item.id === id);
        
        if (itemIndex === -1) {
            console.warn(`⚠️ Item con ID "${id}" no encontrado en "${collection}"`);
            return false;
        }
        
        // Eliminar item
        db[collection].splice(itemIndex, 1);
        
        // Persistir
        saveDB(db);
        
        console.log(`✅ Item eliminado de "${collection}" con ID: ${id}`);
        return true;
    } catch (error) {
        console.error(`❌ Error al eliminar item de "${collection}":`, error);
        throw error;
    }
}

/**
 * Limpia toda una colección
 * @param {string} collection - Nombre de la colección
 * @returns {boolean} true si se limpió correctamente
 */
export function clearCollection(collection) {
    try {
        const db = getDB();
        
        if (!db[collection]) {
            console.warn(`⚠️ Colección "${collection}" no existe`);
            return false;
        }
        
        db[collection] = [];
        saveDB(db);
        
        console.log(`✅ Colección "${collection}" limpiada`);
        return true;
    } catch (error) {
        console.error(`❌ Error al limpiar colección "${collection}":`, error);
        throw error;
    }
}

/**
 * Obtiene el estado completo de la base de datos
 * @returns {Object} Base de datos completa
 */
export function getFullDB() {
    return getDB();
}

