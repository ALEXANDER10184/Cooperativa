// ============================================
// DATABASE MODULE - JSON + localStorage
// Versión sin módulos ES6 para compatibilidad
// ============================================

(function() {
    'use strict';

    const DB_KEY = 'db';
    const DB_JSON_PATH = '/data/db.json';

    /**
     * Guarda el estado actual de la base de datos en localStorage
     */
    function saveDB(db) {
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
     * Si no existe, crea una estructura vacía automáticamente
     */
    function getDB() {
        try {
            const storedDB = localStorage.getItem(DB_KEY);
            if (!storedDB) {
                // Si no existe, crear estructura vacía automáticamente
                console.log('⚠️ Base de datos no encontrada, creando estructura vacía...');
                const emptyDB = {
                    socios: [],
                    registros: [],
                    gastos: [],
                    ingresos: [],
                    pagos: [],
                    configuraciones: {}
                };
                saveDB(emptyDB);
                return emptyDB;
            }
            return JSON.parse(storedDB);
        } catch (error) {
            console.error('❌ Error al obtener DB:', error);
            // En caso de error, crear estructura vacía
            const emptyDB = {
                socios: [],
                registros: [],
                gastos: [],
                ingresos: [],
                pagos: [],
                configuraciones: {}
            };
            saveDB(emptyDB);
            return emptyDB;
        }
    }

    /**
     * Genera un ID único automático
     */
    function generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Inicializa la base de datos
     */
    window.initDB = async function() {
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
                gastos: [],
                ingresos: [],
                pagos: [],
                configuraciones: {}
            };
            
            saveDB(emptyDB);
            console.log('📝 Base de datos vacía creada');
            return emptyDB;
        }
    };

    /**
     * Obtiene todos los items de una colección
     * Siempre devuelve un array, incluso si hay errores
     */
    window.getAll = function(collection) {
        try {
            const db = getDB();
            
            if (!db) {
                console.warn('⚠️ Base de datos no disponible, devolviendo array vacío');
                return [];
            }
            
            if (!db[collection]) {
                console.warn(`⚠️ Colección "${collection}" no existe. Creando vacía.`);
                db[collection] = [];
                saveDB(db);
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
     */
    window.getItem = function(collection, id) {
        try {
            const items = window.getAll(collection);
            return items.find(item => item.id === id) || null;
        } catch (error) {
            console.error(`❌ Error al obtener item "${id}" de "${collection}":`, error);
            return null;
        }
    };

    /**
     * Agrega un nuevo item a una colección
     */
    window.addItem = function(collection, item) {
        try {
            let db;
            try {
                db = getDB();
            } catch (e) {
                // Si getDB falla, crear estructura vacía
                db = {
                    socios: [],
                    registros: [],
                    gastos: [],
                    ingresos: [],
                    pagos: [],
                    configuraciones: {}
                };
                saveDB(db);
            }
            
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
            // Re-lanzar error para que el código llamador pueda manejarlo
            throw error;
        }
    };

    /**
     * Actualiza un item existente
     */
    window.updateItem = function(collection, id, newData) {
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
    };

    /**
     * Elimina un item de una colección
     */
    window.deleteItem = function(collection, id) {
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
    };

    /**
     * Obtiene items filtrados por un campo específico
     */
    window.getItemsByField = function(collection, field, value) {
        try {
            const items = window.getAll(collection);
            return items.filter(item => item[field] === value);
        } catch (error) {
            console.error(`❌ Error al obtener items por campo "${field}" de "${collection}":`, error);
            return [];
        }
    };

    console.log('✅ Módulo db.js cargado');

})();
