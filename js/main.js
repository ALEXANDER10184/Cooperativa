// ============================================
// COOPERATIVA PROVIVIENDA - MAIN LOGIC
// ============================================

import { 
    initDB, 
    getAll, 
    getItem,
    addItem, 
    updateItem, 
    deleteItem,
    getItemsByField
} from './db.js';

// Hacer addItem disponible globalmente
window.addItem = addItem;
window.getAll = getAll;
window.getItem = getItem;
window.updateItem = updateItem;
window.deleteItem = deleteItem;
window.getItemsByField = getItemsByField;

// Importar funciones del panel de administración de forma dinámica
import * as adminPanelModule from './admin-panel.js';

// Asignar funciones importadas a variables locales
const switchTab = adminPanelModule.switchTab;
const switchMainTab = adminPanelModule.switchMainTab;
const switchAdminTab = adminPanelModule.switchAdminTab;
const renderGastosTable = adminPanelModule.renderGastosTable;
const renderIngresosTable = adminPanelModule.renderIngresosTable;
const renderPagosTable = adminPanelModule.renderPagosTable;
const openAddGastoModal = adminPanelModule.openAddGastoModal;
const openEditGastoModal = adminPanelModule.openEditGastoModal;
const closeGastoModal = adminPanelModule.closeGastoModal;
const handleSubmitGasto = adminPanelModule.handleSubmitGasto;
const handleDeleteGasto = adminPanelModule.handleDeleteGasto;
const openAddIngresoModal = adminPanelModule.openAddIngresoModal;
const openEditIngresoModal = adminPanelModule.openEditIngresoModal;
const closeIngresoModal = adminPanelModule.closeIngresoModal;
const handleSubmitIngreso = adminPanelModule.handleSubmitIngreso;
const handleDeleteIngreso = adminPanelModule.handleDeleteIngreso;
const loadSociosSelector = adminPanelModule.loadSociosSelector;
const openAddPagoModal = adminPanelModule.openAddPagoModal;
const openEditPagoModal = adminPanelModule.openEditPagoModal;
const closePagoModal = adminPanelModule.closePagoModal;
const handleSubmitPago = adminPanelModule.handleSubmitPago;
const handleDeletePago = adminPanelModule.handleDeletePago;

// Estado global
let currentEditId = null;
let currentEditGastoId = null;
let currentEditIngresoId = null;
let currentEditPagoId = null;
let currentSocioIdForPagos = null;

// Referencias a elementos del DOM (se inicializan después de que el DOM cargue)
let socioModal, modalTitle, socioForm, nombre, apellido, email, telefono, estado, submitSocioBtn, cancelModalBtn, closeModalBtn;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Inicializa la aplicación
 */
async function initUI() {
    try {
        console.log('🚀 Iniciando aplicación...');
        
        // Exportar funciones al scope global PRIMERO
        exportFunctionsToGlobal();
        
        // Inicializar referencias del DOM
        initDOMReferences();
        
        // Inicializar base de datos (con manejo de errores robusto)
        try {
            await initDB();
            console.log('✅ Base de datos inicializada');
        } catch (dbError) {
            console.error('⚠️ Error al inicializar DB, continuando sin ella:', dbError);
            // Continuar sin base de datos, usar localStorage directamente
        }
        
        // Configurar listeners
        setupEventListeners();
        
        // Renderizar tablas iniciales
        try {
            renderSociosTable();
        } catch (error) {
            console.error('⚠️ Error al renderizar tabla de socios:', error);
        }
        
        // Renderizar tablas de administración (se cargarán cuando se abra el tab)
        try {
            if (typeof renderGastosTable === 'function') renderGastosTable();
            if (typeof renderIngresosTable === 'function') renderIngresosTable();
            if (typeof loadSociosSelector === 'function') loadSociosSelector();
        } catch (error) {
            console.warn('⚠️ Tablas de administración no disponibles aún:', error);
        }
        
        console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
        console.error('❌ Error crítico al inicializar aplicación:', error);
        console.error('Stack:', error.stack);
        
        // Mostrar mensaje de error amigable
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #ef4444; color: white; padding: 1rem; text-align: center; z-index: 10000;';
        errorDiv.innerHTML = `Error al cargar la aplicación: ${error.message}. Por favor, recarga la página.`;
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
}

/**
 * Inicializa las referencias a elementos del DOM
 */
function initDOMReferences() {
    socioModal = document.getElementById('socioModal');
    modalTitle = document.getElementById('modalTitle');
    socioForm = document.getElementById('socioForm');
    nombre = document.getElementById('nombre');
    apellido = document.getElementById('apellido');
    email = document.getElementById('email');
    telefono = document.getElementById('telefono');
    estado = document.getElementById('estado');
    submitSocioBtn = document.getElementById('submitSocioBtn');
    cancelModalBtn = document.getElementById('cancelModalBtn');
    closeModalBtn = document.getElementById('closeModalBtn');

    // Verificar que todos los elementos existan
    const elements = {
        socioModal, modalTitle, socioForm, nombre, apellido, email, telefono, estado, submitSocioBtn, cancelModalBtn
    };

    const missing = Object.entries(elements).filter(([name, el]) => !el).map(([name]) => name);
    if (missing.length > 0) {
        console.warn('⚠️ Algunos elementos del DOM no encontrados:', missing);
        console.warn('⚠️ Esto puede ser normal si el modal aún no se ha renderizado');
    } else {
        console.log('✅ Todas las referencias del DOM inicializadas');
    }
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Listener para botón "Agregar Socio"
    const addSocioBtn = document.getElementById('addSocioBtn');
    if (addSocioBtn) {
        addSocioBtn.addEventListener('click', openAddModal);
        console.log('✅ Listener agregado a botón "Agregar Socio"');
    } else {
        console.error('❌ No se encontró el botón con ID "addSocioBtn"');
    }

    // Listener para botón "Cerrar Modal" (si existe)
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
        console.log('✅ Listener agregado a botón "Cerrar Modal"');
    }

    // Listener para botón "Cancelar"
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeModal);
        console.log('✅ Listener agregado a botón "Cancelar"');
    } else {
        console.error('❌ No se encontró el botón con ID "cancelModalBtn"');
    }

    // Listener para formulario de socios
    if (socioForm) {
        socioForm.addEventListener('submit', handleSubmitForm);
        console.log('✅ Listener agregado a formulario "socioForm"');
    } else {
        console.error('❌ No se encontró el formulario con ID "socioForm"');
    }

    // Listeners para botones de administración
    const addGastoBtn = document.getElementById('addGastoBtn');
    if (addGastoBtn) {
        addGastoBtn.addEventListener('click', openAddGastoModal);
        console.log('✅ Listener agregado a botón "Agregar Gasto"');
    }

    const addIngresoBtn = document.getElementById('addIngresoBtn');
    if (addIngresoBtn) {
        addIngresoBtn.addEventListener('click', openAddIngresoModal);
        console.log('✅ Listener agregado a botón "Agregar Ingreso"');
    }

    const addPagoBtn = document.getElementById('addPagoBtn');
    if (addPagoBtn) {
        addPagoBtn.addEventListener('click', openAddPagoModal);
        console.log('✅ Listener agregado a botón "Registrar Pago"');
    }

    // Listeners para formularios de administración
    const gastoForm = document.getElementById('gastoForm');
    if (gastoForm) {
        gastoForm.addEventListener('submit', handleSubmitGasto);
        console.log('✅ Listener agregado a formulario "gastoForm"');
    }

    const ingresoForm = document.getElementById('ingresoForm');
    if (ingresoForm) {
        ingresoForm.addEventListener('submit', handleSubmitIngreso);
        console.log('✅ Listener agregado a formulario "ingresoForm"');
    }

    const pagoForm = document.getElementById('pagoForm');
    if (pagoForm) {
        pagoForm.addEventListener('submit', handleSubmitPago);
        console.log('✅ Listener agregado a formulario "pagoForm"');
    }

    // Listeners para tabs principales
    const tabSocios = document.getElementById('tabSocios');
    const tabAdmin = document.getElementById('tabAdmin');
    
    if (tabSocios) {
        tabSocios.addEventListener('click', () => {
            console.log('🔵 Click en tab Socios');
            switchTab('socios');
        });
        console.log('✅ Listener agregado a botón "tabSocios"');
    } else {
        console.error('❌ No se encontró el botón con ID "tabSocios"');
    }

    if (tabAdmin) {
        tabAdmin.addEventListener('click', () => {
            console.log('🔵 Click en tab Administración');
            switchTab('admin');
        });
        console.log('✅ Listener agregado a botón "tabAdmin"');
    } else {
        console.error('❌ No se encontró el botón con ID "tabAdmin"');
    }
}

// ============================================
// TABLE RENDERING
// ============================================

/**
 * Renderiza la tabla de socios
 */
function renderSociosTable() {
    try {
        const socios = getAll('socios');
        const tbody = document.getElementById('sociosTableBody');
        
        if (!tbody) {
            console.error('❌ No se encontró el elemento sociosTableBody');
            return;
        }

        // Limpiar tabla
        tbody.innerHTML = '';

        if (socios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <p>No hay socios registrados</p>
                        <p style="font-size: 0.875rem; margin-top: 0.5rem;">Haz clic en "Agregar Socio" para comenzar</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Renderizar cada socio
        socios.forEach(socio => {
            const row = document.createElement('tr');
            
            const estadoBadge = (socio.estado === 'Activo' || socio.estado === 'activo')
                ? '<span class="badge badge-active">Activo</span>'
                : '<span class="badge badge-inactive">Inactivo</span>';

            row.innerHTML = `
                <td style="font-family: monospace; font-size: 0.875rem; color: #6b7280;">${socio.id.substring(0, 8)}...</td>
                <td>${escapeHtml(socio.nombre || '')}</td>
                <td>${escapeHtml(socio.apellido || '')}</td>
                <td>${escapeHtml(socio.email || '')}</td>
                <td>${escapeHtml(socio.telefono || '')}</td>
                <td>${estadoBadge}</td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-icon-edit edit-btn" data-id="${socio.id}" title="Editar">
                            <span class="material-icons-round">edit</span>
                        </button>
                        <button class="btn-icon btn-icon-delete delete-btn" data-id="${socio.id}" title="Eliminar">
                            <span class="material-icons-round">delete</span>
                        </button>
                    </div>
                </td>
            `;
            
            // Agregar listeners a los botones de editar y borrar
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            if (editBtn) {
                editBtn.addEventListener('click', () => openEditModal(socio.id));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => handleDeleteSocio(socio.id));
            }
            
            tbody.appendChild(row);
        });

        console.log(`✅ Tabla renderizada con ${socios.length} socios`);
    } catch (error) {
        console.error('❌ Error al renderizar tabla:', error);
        const tbody = document.getElementById('sociosTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #ef4444; padding: 2rem;">
                        Error al cargar los datos
                    </td>
                </tr>
            `;
        }
    }
}

// ============================================
// MODAL FUNCTIONS
// ============================================

/**
 * Abre el modal para agregar un nuevo socio
 */
function openAddModal() {
    console.log('🔵 openAddModal() llamado');
    
    if (!socioModal || !modalTitle || !socioForm) {
        console.error('❌ Referencias del DOM no inicializadas');
        return;
    }

    currentEditId = null;
    socioForm.reset();
    modalTitle.textContent = 'Agregar Socio';
    
    if (submitSocioBtn) {
        submitSocioBtn.textContent = 'Guardar';
    }

    socioModal.classList.remove('hidden');
    console.log('✅ Modal abierto correctamente');
}

/**
 * Abre el modal para editar un socio existente
 */
function openEditModal(id) {
    try {
        console.log('🔵 openEditModal() llamado con ID:', id);
        
        if (!socioModal || !modalTitle || !socioForm || !nombre || !apellido || !email || !telefono || !estado) {
            console.error('❌ Referencias del DOM no inicializadas');
            return;
        }

        // Buscar el socio usando getItem
        const socio = getItem('socios', id);

        if (!socio) {
            alert('Socio no encontrado');
            return;
        }

        // Llenar formulario con datos del socio
        nombre.value = socio.nombre || '';
        apellido.value = socio.apellido || '';
        email.value = socio.email || '';
        telefono.value = socio.telefono || '';
        estado.value = socio.estado || 'Activo';

        currentEditId = id;
        modalTitle.textContent = 'Editar Socio';
        
        if (submitSocioBtn) {
            submitSocioBtn.textContent = 'Actualizar';
        }

        // Mostrar modal
        socioModal.classList.remove('hidden');
        console.log('✅ Modal de edición abierto correctamente');
    } catch (error) {
        console.error('❌ Error al abrir modal de edición:', error);
        alert('Error al cargar los datos del socio');
    }
}

/**
 * Cierra el modal
 */
function closeModal() {
    if (socioModal) {
        socioModal.classList.add('hidden');
        currentEditId = null;
        console.log('✅ Modal cerrado');
    } else {
        console.error('❌ Referencia a socioModal no inicializada');
    }
}

// ============================================
// FORM HANDLING
// ============================================

/**
 * Maneja el envío del formulario (agregar o editar)
 */
function handleSubmitForm(event) {
    event.preventDefault();

    try {
        if (!nombre || !apellido || !email || !telefono || !estado) {
            console.error('❌ Referencias del DOM no inicializadas');
            return;
        }

        // Obtener valores del formulario
        const nombreValue = nombre.value.trim();
        const apellidoValue = apellido.value.trim();
        const emailValue = email.value.trim();
        const telefonoValue = telefono.value.trim();
        const estadoValue = estado.value;

        // Validaciones
        if (!nombreValue || !apellidoValue || !emailValue || !telefonoValue) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            alert('Por favor ingresa un email válido');
            return;
        }

        // Preparar datos
        const socioData = {
            nombre: nombreValue,
            apellido: apellidoValue,
            email: emailValue,
            telefono: telefonoValue,
            estado: estadoValue
        };

        // Agregar o actualizar
        if (currentEditId) {
            // Actualizar socio existente
            updateItem('socios', currentEditId, socioData);
            console.log('✅ Socio actualizado:', currentEditId);
        } else {
            // Agregar nuevo socio
            addItem('socios', socioData);
            console.log('✅ Socio agregado');
        }

        // Cerrar modal y actualizar tabla
        closeModal();
        renderSociosTable();

        // Mostrar mensaje de éxito
        showNotification(
            currentEditId ? 'Socio actualizado exitosamente' : 'Socio agregado exitosamente',
            'success'
        );
    } catch (error) {
        console.error('❌ Error al guardar socio:', error);
        alert('Error al guardar el socio. Por favor, intenta nuevamente.');
    }
}

// ============================================
// DELETE FUNCTION
// ============================================

/**
 * Maneja la eliminación de un socio
 */
function handleDeleteSocio(id) {
    try {
        const socios = getAll('socios');
        const socio = socios.find(s => s.id === id);

        if (!socio) {
            alert('Socio no encontrado');
            return;
        }

        const confirmMessage = `¿Estás seguro de eliminar a ${socio.nombre} ${socio.apellido}?`;
        
        if (!confirm(confirmMessage)) {
            return;
        }

        // Eliminar socio
        deleteItem('socios', id);
        console.log('✅ Socio eliminado:', id);

        // Actualizar tabla
        renderSociosTable();

        // Mostrar mensaje de éxito
        showNotification('Socio eliminado exitosamente', 'success');
    } catch (error) {
        console.error('❌ Error al eliminar socio:', error);
        alert('Error al eliminar el socio. Por favor, intenta nuevamente.');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Muestra una notificación temporal
 */
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    // Agregar animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ============================================
// BALANCE FUNCTIONS
// ============================================

/**
 * Calcula el balance total desde gastos e ingresos
 * @returns {Promise<Object>} Objeto con totalIncome, totalExpenses y balance
 */
async function calculateBalance() {
    try {
        const ingresos = getAll('ingresos');
        const gastos = getAll('gastos');
        
        const totalIncome = ingresos.reduce((sum, ingreso) => {
            return sum + (parseFloat(ingreso.monto) || 0);
        }, 0);
        
        const totalExpenses = gastos.reduce((sum, gasto) => {
            return sum + (parseFloat(gasto.monto) || 0);
        }, 0);
        
        const balance = totalIncome - totalExpenses;
        
        return {
            totalIncome,
            totalExpenses,
            balance
        };
    } catch (error) {
        console.error('❌ Error al calcular balance:', error);
        return {
            totalIncome: 0,
            totalExpenses: 0,
            balance: 0
        };
    }
}

/**
 * Formatea un número como moneda en euros
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada
 */
function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

/**
 * Navega a una URL
 * @param {string} url - URL a la que navegar
 */
function navigateTo(url) {
    window.location.href = url;
}

// ============================================
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// Esta función se llama después de que todas las funciones estén definidas
// ============================================
function exportFunctionsToGlobal() {
    window.openAddModal = openAddModal;
    window.openEditModal = openEditModal;
    window.closeModal = closeModal;
    window.handleDeleteSocio = handleDeleteSocio;
    window.handleSubmitForm = handleSubmitForm;
    window.switchTab = switchTab;
    window.switchMainTab = switchMainTab;
    window.switchAdminTab = switchAdminTab;
    window.renderPagosTable = renderPagosTable;
    window.closeGastoModal = closeGastoModal;
    window.closeIngresoModal = closeIngresoModal;
    window.closePagoModal = closePagoModal;
    window.calculateBalance = calculateBalance;
    window.formatCurrency = formatCurrency;
    window.navigateTo = navigateTo;

    // Asegurar que las funciones de administración también estén disponibles
    if (typeof openAddGastoModal !== 'undefined') {
        window.openAddGastoModal = openAddGastoModal;
    }
    if (typeof openAddIngresoModal !== 'undefined') {
        window.openAddIngresoModal = openAddIngresoModal;
    }
    if (typeof openAddPagoModal !== 'undefined') {
        window.openAddPagoModal = openAddPagoModal;
    }

    console.log('✅ Funciones exportadas al scope global');
}

// ============================================
// INITIALIZE ON LOAD
// ============================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM cargado, iniciando aplicación...');
        initUI().catch(error => {
            console.error('❌ Error fatal en inicialización:', error);
        });
    });
} else {
    // DOM ya está listo
    console.log('📄 DOM ya está listo, iniciando aplicación...');
    initUI().catch(error => {
        console.error('❌ Error fatal en inicialización:', error);
    });
}

// Cerrar modales al hacer clic fuera de ellos
document.addEventListener('click', (event) => {
    // Modal de socio
    if (socioModal && !socioModal.classList.contains('hidden')) {
        const modalContent = socioModal.querySelector('.modal-content');
        if (modalContent && !modalContent.contains(event.target)) {
            closeModal();
        }
    }
    
    // Modal de gasto
    const gastoModal = document.getElementById('gastoModal');
    if (gastoModal && !gastoModal.classList.contains('hidden')) {
        const modalContent = gastoModal.querySelector('.modal-content');
        if (modalContent && !modalContent.contains(event.target)) {
            closeGastoModal();
        }
    }
    
    // Modal de ingreso
    const ingresoModal = document.getElementById('ingresoModal');
    if (ingresoModal && !ingresoModal.classList.contains('hidden')) {
        const modalContent = ingresoModal.querySelector('.modal-content');
        if (modalContent && !modalContent.contains(event.target)) {
            closeIngresoModal();
        }
    }
    
    // Modal de pago
    const pagoModal = document.getElementById('pagoModal');
    if (pagoModal && !pagoModal.classList.contains('hidden')) {
        const modalContent = pagoModal.querySelector('.modal-content');
        if (modalContent && !modalContent.contains(event.target)) {
            closePagoModal();
        }
    }
});
