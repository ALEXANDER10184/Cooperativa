// ============================================
// JSONBIN DATABASE MODULE
// Base de datos online para sincronización entre dispositivos
// ============================================

(function() {
    'use strict';

    const BIN_ID = "69379207d0ea881f401c0889";
    const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
    
    // API Key de JSONbin
    const API_KEY = "$2a$10$Pgwj4rpZ/MwjOkk83idMjueKf52AjaCew5VtsgNXbigK7LdfF3Ysu";
    
    // Variable para cache local (evita cargar constantemente)
    let cachedDB = null;
    let isLoading = false;

    /**
     * Carga los datos desde JSONbin
     */
    async function cargarDatos() {
        // Si hay caché y no está cargando, devolver caché
        if (cachedDB && !isLoading) {
            return cachedDB;
        }

        try {
            isLoading = true;
            console.log('📥 Cargando datos desde JSONbin...');
            
            const res = await fetch(BIN_URL, {
                headers: { 
                    "X-Master-Key": API_KEY,
                    "X-Bin-Meta": "false"
                }
            });

            if (!res.ok) {
                throw new Error(`Error al cargar datos: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            
            // Si la respuesta es directamente el objeto, usarlo
            // Si viene dentro de .record, extraerlo
            const db = data.record || data;
            
            // Validar estructura
            if (!db || typeof db !== 'object') {
                throw new Error('Datos inválidos recibidos de JSONbin');
            }

            // Asegurar estructura mínima
            if (!db.socios) db.socios = [];
            if (!db.registros) db.registros = [];
            if (!db.gastos) db.gastos = [];
            if (!db.ingresos) db.ingresos = [];
            if (!db.pagos) db.pagos = [];
            if (!db.aportesMensuales) db.aportesMensuales = [];
            if (!db.configuraciones) db.configuraciones = {};
            if (!db.chat) db.chat = [];
            if (!db.mensajes) db.mensajes = [];

            cachedDB = db;
            console.log('✅ Datos cargados desde JSONbin correctamente');
            return db;
        } catch (error) {
            console.error('❌ Error al cargar datos desde JSONbin:', error);
            
            // Si hay caché, devolverlo como fallback
            if (cachedDB) {
                console.warn('⚠️ Usando caché local como fallback');
                return cachedDB;
            }

            // Si no hay caché, crear estructura vacía
            console.warn('⚠️ Creando estructura vacía como fallback');
            const emptyDB = {
                socios: [],
                registros: [],
                gastos: [],
                ingresos: [],
                pagos: [],
                aportesMensuales: [],
                chat: [],
                mensajes: [],
                configuraciones: {}
            };
            cachedDB = emptyDB;
            return emptyDB;
        } finally {
            isLoading = false;
        }
    }

    /**
     * Guarda los datos en JSONbin
     */
    async function guardarDatos(nuevosDatos) {
        try {
            console.log('💾 Guardando datos en JSONbin...');
            
            // Actualizar caché antes de guardar
            cachedDB = nuevosDatos;

            const res = await fetch(BIN_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": API_KEY
                },
                body: JSON.stringify(nuevosDatos)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Error al guardar datos: ${res.status} ${res.statusText} - ${errorText}`);
            }

            console.log('✅ Datos guardados en JSONbin correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error al guardar datos en JSONbin:', error);
            throw error;
        }
    }

    /**
     * Invalida el caché (fuerza recarga desde JSONbin)
     */
    window.invalidateCache = function() {
        cachedDB = null;
        console.log('🔄 Caché invalidado');
    };

    // Exponer funciones globalmente
    window.cargarDatos = cargarDatos;
    window.guardarDatos = guardarDatos;

    console.log('✅ Módulo database.js cargado (JSONbin)');

})();
