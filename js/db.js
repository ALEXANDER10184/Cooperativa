// ============================================
// DATABASE MODULE - JSONbin (Base de datos online)
// Versión sin módulos ES6 para compatibilidad
// ============================================

(function() {
    'use strict';

    /**
     * Genera un ID único automático
     */
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Obtiene la base de datos desde JSONbin
     * Ahora es async porque usa fetch
     */
    async function getDB() {
        try {
            if (typeof window.cargarDatos !== 'function') {
                throw new Error('database.js no está cargado. Asegúrate de incluir <script src="js/database.js"></script> antes de db.js');
            }
            
            const db = await window.cargarDatos();
            return db;
        } catch (error) {
            console.error('❌ Error al obtener DB:', error);
            // En caso de error, devolver estructura vacía
            return {
                socios: [],
                registros: [],
                gastos: [],
                ingresos: [],
                pagos: [],
                chat: [],
                mensajes: [],
                configuraciones: {}
            };
        }
    }

    /**
     * Guarda la base de datos en JSONbin
     * Ahora es async porque usa fetch
     */
    async function saveDB(db) {
        try {
            if (typeof window.guardarDatos !== 'function') {
                throw new Error('database.js no está cargado. Asegúrate de incluir <script src="js/database.js"></script> antes de db.js');
            }
            
            await window.guardarDatos(db);
            console.log('💾 Base de datos guardada en JSONbin');
        } catch (error) {
            console.error('❌ Error al guardar DB:', error);
            throw error;
        }
    }

    /**
     * Inicializa la base de datos
     * Ahora carga desde JSONbin en lugar de localStorage
     */
    window.initDB = async function() {
        try {
            console.log('📥 Inicializando base de datos desde JSONbin...');
            const db = await getDB();
            console.log('✅ Base de datos inicializada');
            return db;
        } catch (error) {
            console.error('❌ Error al inicializar DB:', error);
            
            // Si falla, crear estructura vacía
            const emptyDB = {
                socios: [],
                registros: [],
                gastos: [],
                ingresos: [],
                pagos: [],
                chat: [],
                mensajes: [],
                configuraciones: {}
            };
            
            // Intentar guardar estructura vacía
            try {
                await saveDB(emptyDB);
            } catch (saveError) {
                console.warn('⚠️ No se pudo guardar estructura vacía:', saveError);
            }
            
            console.log('📝 Base de datos vacía creada');
            return emptyDB;
        }
    };

    /**
     * Obtiene todos los items de una colección
     * Ahora es async
     */
    window.getAll = async function(collection) {
        try {
            const db = await getDB();
            
            if (!db) {
                console.warn('⚠️ Base de datos no disponible, devolviendo array vacío');
                return [];
            }
            
            if (!db[collection]) {
                console.warn(`⚠️ Colección "${collection}" no existe. Creando vacía.`);
                db[collection] = [];
                await saveDB(db);
            }
            
            return db[collection] || [];
        } catch (error) {
            console.error(`❌ Error al obtener items de "${collection}":`, error);
            // Siempre devolver array vacío en caso de error
            return [];
        }
    };

    /**
     * Obtiene un item por ID
     * Ahora es async
     */
    window.getItem = async function(collection, id) {
        try {
            const items = await window.getAll(collection);
            return items.find(item => item.id === id) || null;
        } catch (error) {
            console.error(`❌ Error al obtener item "${id}" de "${collection}":`, error);
            return null;
        }
    };

    /**
     * Agrega un nuevo item a una colección
     * Ahora es async
     */
    window.addItem = async function(collection, item) {
        try {
            let db = await getDB();
            
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
            
            // Persistir en JSONbin
            await saveDB(db);
            
            console.log(`✅ Item agregado a "${collection}" con ID: ${item.id}`);
            return item;
        } catch (error) {
            console.error(`❌ Error al agregar item a "${collection}":`, error);
            // Re-lanzar error para que el código llamador pueda manejarlo
            throw error;
        }
    };

    /**
     * Actualiza un item existente
     * Ahora es async
     */
    window.updateItem = async function(collection, id, newData) {
        try {
            const db = await getDB();
            
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
            
            // Persistir en JSONbin
            await saveDB(db);
            
            console.log(`✅ Item actualizado en "${collection}" con ID: ${id}`);
            return updatedItem;
        } catch (error) {
            console.error(`❌ Error al actualizar item en "${collection}":`, error);
            throw error;
        }
    };

    /**
     * Elimina un item de una colección
     * Ahora es async
     */
    window.deleteItem = async function(collection, id) {
        try {
            const db = await getDB();
            
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
            
            // Persistir en JSONbin
            await saveDB(db);
            
            console.log(`✅ Item eliminado de "${collection}" con ID: ${id}`);
            return true;
        } catch (error) {
            console.error(`❌ Error al eliminar item de "${collection}":`, error);
            throw error;
        }
    };

    /**
     * Obtiene items filtrados por un campo específico
     * Ahora es async
     */
    window.getItemsByField = async function(collection, field, value) {
        try {
            const items = await window.getAll(collection);
            return items.filter(item => item[field] === value);
        } catch (error) {
            console.error(`❌ Error al obtener items por campo "${field}" de "${collection}":`, error);
            return [];
        }
    };

    console.log('✅ Módulo db.js cargado (JSONbin)');

})();
