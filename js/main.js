// ============================================
// COOPERATIVA PROVIVIENDA - MAIN LOGIC
// ============================================

import { 
    initDB, 
    getAll, 
    addItem, 
    updateItem, 
    deleteItem
} from './db.js';

// Estado global
let currentEditId = null;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Inicializa la aplicación
 */
async function initUI() {
    try {
        // Inicializar base de datos
        await initDB();
        console.log('✅ Base de datos inicializada');
        
        // Configurar listeners
        setupEventListeners();
        
        // Renderizar tabla de socios
        renderSociosTable();
    } catch (error) {
        console.error('❌ Error al inicializar aplicación:', error);
        alert('Error al cargar la aplicación. Por favor, recarga la página.');
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
            
            const estadoBadge = socio.estado === 'activo' 
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
                        <button class="btn-icon btn-icon-edit" onclick="openEditModal('${socio.id}')" title="Editar">
                            <span class="material-icons-round">edit</span>
                        </button>
                        <button class="btn-icon btn-icon-delete" onclick="handleDeleteSocio('${socio.id}')" title="Eliminar">
                            <span class="material-icons-round">delete</span>
                        </button>
                    </div>
                </td>
            `;
            
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
    currentEditId = null;
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('socioForm');
    const submitBtn = document.getElementById('submitBtn');

    if (!modal) {
        console.error('❌ Modal con ID "modal" no encontrado');
        return;
    }

    if (!modalTitle || !form || !submitBtn) {
        console.error('❌ Elementos del modal no encontrados:', {
            modalTitle: !!modalTitle,
            form: !!form,
            submitBtn: !!submitBtn
        });
        return;
    }

    // Resetear formulario
    form.reset();
    modalTitle.textContent = 'Agregar Socio';
    submitBtn.textContent = 'Guardar';
    submitBtn.innerHTML = '<span class="material-icons-round">save</span> Guardar';

    // Mostrar modal
    modal.classList.remove('hidden');
    console.log('✅ Modal abierto correctamente');
}

/**
 * Abre el modal para editar un socio existente
 */
function openEditModal(id) {
    try {
        currentEditId = id;
        const socios = getAll('socios');
        const socio = socios.find(s => s.id === id);

        if (!socio) {
            alert('Socio no encontrado');
            return;
        }

        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('socioForm');
        const submitBtn = document.getElementById('submitBtn');

        if (!modal || !modalTitle || !form || !submitBtn) {
            console.error('❌ Elementos del modal no encontrados');
            return;
        }

        // Llenar formulario con datos del socio
        document.getElementById('nombre').value = socio.nombre || '';
        document.getElementById('apellido').value = socio.apellido || '';
        document.getElementById('email').value = socio.email || '';
        document.getElementById('telefono').value = socio.telefono || '';
        document.getElementById('estado').value = socio.estado || 'activo';

        modalTitle.textContent = 'Editar Socio';
        submitBtn.textContent = 'Actualizar';
        submitBtn.innerHTML = '<span class="material-icons-round">update</span> Actualizar';

        // Mostrar modal
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('❌ Error al abrir modal de edición:', error);
        alert('Error al cargar los datos del socio');
    }
}

/**
 * Cierra el modal
 */
function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
        currentEditId = null;
        console.log('✅ Modal cerrado');
    } else {
        console.error('❌ Modal con ID "modal" no encontrado');
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
        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const estado = document.getElementById('estado').value;

        // Validaciones
        if (!nombre || !apellido || !email || !telefono) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor ingresa un email válido');
            return;
        }

        // Preparar datos
        const socioData = {
            nombre,
            apellido,
            email,
            telefono,
            estado
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

window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.closeModal = closeModal;
window.handleDeleteSocio = handleDeleteSocio;
window.handleSubmitForm = handleSubmitForm;

// ============================================
// INITIALIZE ON LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initUI();
});

// Cerrar modal al hacer clic fuera de él
document.addEventListener('click', (event) => {
    const modal = document.getElementById('modal');
    if (modal && !modal.classList.contains('hidden')) {
        const modalContent = modal.querySelector('.modal');
        if (modalContent && !modalContent.contains(event.target)) {
            closeModal();
        }
    }
});
