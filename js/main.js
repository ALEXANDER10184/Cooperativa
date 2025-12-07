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

// Importar funciones del panel de administración
import {
    switchMainTab,
    switchAdminTab,
    renderGastosTable,
    renderIngresosTable,
    renderPagosTable,
    openAddGastoModal,
    openEditGastoModal,
    closeGastoModal,
    handleSubmitGasto,
    handleDeleteGasto,
    openAddIngresoModal,
    openEditIngresoModal,
    closeIngresoModal,
    handleSubmitIngreso,
    handleDeleteIngreso,
    loadSociosSelector,
    openAddPagoModal,
    openEditPagoModal,
    closePagoModal,
    handleSubmitPago,
    handleDeletePago
} from './admin-panel.js';

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
        // Inicializar referencias del DOM
        initDOMReferences();
        
        // Inicializar base de datos
        await initDB();
        console.log('✅ Base de datos inicializada');
        
        // Configurar listeners
        setupEventListeners();
        
        // Renderizar tablas iniciales
        renderSociosTable();
        renderGastosTable();
        renderIngresosTable();
        loadSociosSelector();
    } catch (error) {
        console.error('❌ Error al inicializar aplicación:', error);
        alert('Error al cargar la aplicación. Por favor, recarga la página.');
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
        console.error('❌ Elementos faltantes:', missing);
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
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// ============================================

// Exportar funciones al scope global
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
window.handleDeleteSocio = handleDeleteSocio;
window.handleSubmitForm = handleSubmitForm;
window.switchMainTab = switchMainTab;
window.switchAdminTab = switchAdminTab;
window.renderPagosTable = renderPagosTable;
window.closeGastoModal = closeGastoModal;
window.closeIngresoModal = closeIngresoModal;
window.closePagoModal = closePagoModal;

// ============================================
// INITIALIZE ON LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initUI();
});

// Cerrar modal al hacer clic fuera de él
document.addEventListener('click', (event) => {
    if (socioModal && !socioModal.classList.contains('hidden')) {
        const modalContent = socioModal.querySelector('.modal-content');
        if (modalContent && !modalContent.contains(event.target)) {
            closeModal();
        }
    }
});
