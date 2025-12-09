// ============================================
// GOOGLE SHEETS API v4 - JavaScript Puro
// ============================================

import { API_KEY, SHEET_ID, HOJA } from './config.js';

const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;

/**
 * Leer datos de un rango específico en Google Sheets
 * @param {string} rango - Rango a leer (ej: "Hoja1!A1:C10" o "A1:C10")
 * @returns {Promise<Array>} Array de filas con los datos
 */
export async function leerDatos(rango) {
    try {
        // Si el rango no incluye el nombre de la hoja, agregarlo
        const rangoCompleto = rango.includes('!') ? rango : `${HOJA}!${rango}`;
        
        const url = `${BASE_URL}/values/${encodeURIComponent(rangoCompleto)}?key=${API_KEY}`;
        
        console.log('Leyendo datos de:', rangoCompleto);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error al leer datos: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
        }
        
        const data = await response.json();
        
        // Retornar los valores como array de arrays
        const valores = data.values || [];
        console.log(`Datos leídos: ${valores.length} filas`);
        
        return valores;
    } catch (error) {
        console.error('Error en leerDatos:', error);
        throw error;
    }
}

/**
 * Agregar una nueva fila al final de la hoja
 * @param {Array} valoresArray - Array con los valores de la fila (ej: ["Nombre", "Apellido", "Email"])
 * @returns {Promise<Object>} Objeto con información de la operación
 */
export async function agregarFila(valoresArray) {
    try {
        if (!Array.isArray(valoresArray) || valoresArray.length === 0) {
            throw new Error('valoresArray debe ser un array no vacío');
        }
        
        const rango = `${HOJA}!A:Z`; // Rango amplio para append
        const url = `${BASE_URL}/values/${encodeURIComponent(rango)}:append?valueInputOption=RAW&key=${API_KEY}`;
        
        const body = {
            values: [valoresArray]
        };
        
        console.log('Agregando fila:', valoresArray);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error al agregar fila: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
        }
        
        const data = await response.json();
        console.log('Fila agregada exitosamente:', data);
        
        return {
            success: true,
            updatedRange: data.updates?.updatedRange,
            updatedRows: data.updates?.updatedRows,
            updatedCells: data.updates?.updatedCells
        };
    } catch (error) {
        console.error('Error en agregarFila:', error);
        throw error;
    }
}

/**
 * Actualizar un rango específico en Google Sheets
 * @param {string} rango - Rango a actualizar (ej: "Hoja1!A1:C3" o "A1:C3")
 * @param {Array<Array>} valoresArray - Array de arrays con los valores (cada array interno es una fila)
 * @returns {Promise<Object>} Objeto con información de la operación
 */
export async function actualizarRango(rango, valoresArray) {
    try {
        if (!Array.isArray(valoresArray) || valoresArray.length === 0) {
            throw new Error('valoresArray debe ser un array no vacío de filas');
        }
        
        // Si el rango no incluye el nombre de la hoja, agregarlo
        const rangoCompleto = rango.includes('!') ? rango : `${HOJA}!${rango}`;
        
        const url = `${BASE_URL}/values/${encodeURIComponent(rangoCompleto)}?valueInputOption=RAW&key=${API_KEY}`;
        
        const body = {
            values: valoresArray
        };
        
        console.log('Actualizando rango:', rangoCompleto, 'con', valoresArray.length, 'filas');
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error al actualizar rango: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
        }
        
        const data = await response.json();
        console.log('Rango actualizado exitosamente:', data);
        
        return {
            success: true,
            updatedRange: data.updatedRange,
            updatedRows: data.updatedRows,
            updatedCells: data.updatedCells
        };
    } catch (error) {
        console.error('Error en actualizarRango:', error);
        throw error;
    }
}

/**
 * Obtener información del spreadsheet (útil para debugging)
 * @returns {Promise<Object>} Información del spreadsheet
 */
export async function obtenerInfo() {
    try {
        const url = `${BASE_URL}?key=${API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error al obtener info: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
        }
        
        const data = await response.json();
        console.log('Información del spreadsheet:', data);
        
        return data;
    } catch (error) {
        console.error('Error en obtenerInfo:', error);
        throw error;
    }
}


