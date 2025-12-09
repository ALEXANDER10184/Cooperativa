// ============================================
// COOPERATIVA PROVIVIENDA - MAIN LOGIC
// Versión sin módulos ES6 para compatibilidad
// ============================================

(function() {
    'use strict';

    // Estado global
    let currentEditId = null;

    // Referencias a elementos del DOM
    let socioModal, modalTitle, socioForm, nombre, apellido, email, telefono, estado, submitSocioBtn, cancelModalBtn;

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

        if (!document.getElementById('notificationStyle')) {
            const style = document.createElement('style');
            style.id = 'notificationStyle';
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
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Calcula el balance total desde gastos e ingresos
     */
    window.calculateBalance = function() {
        try {
            if (typeof window.getAll !== 'function') {
                return {
                    totalIncome: 0,
                    totalExpenses: 0,
                    balance: 0
                };
            }
            
            const ingresos = window.getAll('ingresos');
            const gastos = window.getAll('gastos');
            
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
    };

    /**
     * Formatea un número como moneda en euros
     */
    window.formatCurrency = function(amount) {
        const num = parseFloat(amount) || 0;
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    /**
     * Navega a una URL
     */
    window.navigateTo = function(url) {
        window.location.href = url;
    };

    // ============================================
    // INITIALIZATION
    // ============================================

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

        if (!socioModal || !modalTitle || !socioForm) {
            console.warn('⚠️ Algunos elementos del DOM no encontrados aún');
        } else {
            console.log('✅ Referencias del DOM inicializadas');
        }
    }

    /**
     * Inicializa la aplicación
     */
    async function initUI() {
        try {
            console.log('🚀 Iniciando aplicación...');
            
            // Inicializar referencias del DOM
            initDOMReferences();
            
            // Inicializar base de datos - Asegurar que siempre esté inicializada
            if (typeof window.initDB === 'function') {
                try {
                    await window.initDB();
                    console.log('✅ Base de datos inicializada');
                } catch (dbError) {
                    console.error('⚠️ Error al inicializar DB desde JSON, usando localStorage:', dbError);
                    // Asegurar que al menos tengamos una estructura vacía
                    if (!localStorage.getItem('db')) {
                        const emptyDB = {
                            socios: [],
                            registros: [],
                            gastos: [],
                            ingresos: [],
                            pagos: [],
                            configuraciones: {}
                        };
                        localStorage.setItem('db', JSON.stringify(emptyDB));
                        console.log('✅ Estructura vacía creada');
                    }
                }
            } else {
                // Si initDB no está disponible, crear estructura vacía directamente
                if (!localStorage.getItem('db')) {
                    const emptyDB = {
                        socios: [],
                        registros: [],
                        gastos: [],
                        ingresos: [],
                        pagos: [],
                        configuraciones: {}
                    };
                    localStorage.setItem('db', JSON.stringify(emptyDB));
                    console.log('✅ Estructura vacía creada (sin initDB)');
                }
            }
            
            // Configurar listeners
            setupEventListeners();
            
            // Renderizar tablas iniciales
            renderSociosTable();
            
            // Renderizar tablas de administración (se cargarán cuando se abra el tab)
            if (typeof window.renderGastosTable === 'function') {
                window.renderGastosTable();
            }
            if (typeof window.renderIngresosTable === 'function') {
                window.renderIngresosTable();
            }
            if (typeof window.loadSociosSelector === 'function') {
                window.loadSociosSelector();
            }
            
            console.log('✅ Aplicación inicializada correctamente');
        } catch (error) {
            console.error('❌ Error crítico al inicializar aplicación:', error);
            console.error('Stack:', error.stack);
        }
    }

    /**
     * Configura los event listeners
     */
    function setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Listener para botón "Agregar Socio"
        const addSocioBtn = document.getElementById('addSocioBtn');
        if (addSocioBtn) {
            addSocioBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔵 Click en Agregar Socio');
                if (typeof window.openAddModal === 'function') {
                    window.openAddModal();
                } else {
                    console.error('❌ window.openAddModal no está disponible');
                    alert('Error: función no disponible. Por favor recarga la página.');
                }
            });
            console.log('✅ Listener agregado a botón "Agregar Socio"');
        } else {
            console.error('❌ No se encontró el botón addSocioBtn');
        }

        // Listener para botón "Cancelar"
        if (cancelModalBtn) {
            cancelModalBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (typeof window.closeModal === 'function') {
                    window.closeModal();
                }
            });
        }

        // Listener para formulario de socios
        if (socioForm) {
            socioForm.addEventListener('submit', function(e) {
                if (typeof window.handleSubmitForm === 'function') {
                    window.handleSubmitForm(e);
                } else {
                    e.preventDefault();
                    console.error('❌ window.handleSubmitForm no está disponible');
                    alert('Error: función no disponible. Por favor recarga la página.');
                }
            });
            console.log('✅ Listener agregado a formulario de socios');
        }

        // Listeners para botones de administración
        const addGastoBtn = document.getElementById('addGastoBtn');
        if (addGastoBtn) {
            addGastoBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔵 Click en Agregar Gasto');
                if (typeof window.openAddGastoModal === 'function') {
                    window.openAddGastoModal();
                } else {
                    console.error('❌ window.openAddGastoModal no está disponible');
                    alert('Error: función no disponible. Por favor recarga la página.');
                }
            });
            console.log('✅ Listener agregado a botón "Agregar Gasto"');
        }

        const addIngresoBtn = document.getElementById('addIngresoBtn');
        if (addIngresoBtn) {
            addIngresoBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔵 Click en Agregar Ingreso');
                if (typeof window.openAddIngresoModal === 'function') {
                    window.openAddIngresoModal();
                } else {
                    console.error('❌ window.openAddIngresoModal no está disponible');
                    alert('Error: función no disponible. Por favor recarga la página.');
                }
            });
            console.log('✅ Listener agregado a botón "Agregar Ingreso"');
        }

        const addPagoBtn = document.getElementById('addPagoBtn');
        if (addPagoBtn) {
            addPagoBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔵 Click en Registrar Pago');
                if (typeof window.openAddPagoModal === 'function') {
                    window.openAddPagoModal();
                } else {
                    console.error('❌ window.openAddPagoModal no está disponible');
                    alert('Error: función no disponible. Por favor recarga la página.');
                }
            });
            console.log('✅ Listener agregado a botón "Registrar Pago"');
        }

        // Listeners para formularios de administración
        const gastoForm = document.getElementById('gastoForm');
        if (gastoForm) {
            gastoForm.addEventListener('submit', function(e) {
                if (typeof window.handleSubmitGasto === 'function') {
                    window.handleSubmitGasto(e);
                } else {
                    e.preventDefault();
                    console.error('❌ window.handleSubmitGasto no está disponible');
                }
            });
        }

        const ingresoForm = document.getElementById('ingresoForm');
        if (ingresoForm) {
            ingresoForm.addEventListener('submit', function(e) {
                if (typeof window.handleSubmitIngreso === 'function') {
                    window.handleSubmitIngreso(e);
                } else {
                    e.preventDefault();
                    console.error('❌ window.handleSubmitIngreso no está disponible');
                }
            });
        }

        const pagoForm = document.getElementById('pagoForm');
        if (pagoForm) {
            pagoForm.addEventListener('submit', function(e) {
                if (typeof window.handleSubmitPago === 'function') {
                    window.handleSubmitPago(e);
                } else {
                    e.preventDefault();
                    console.error('❌ window.handleSubmitPago no está disponible');
                }
            });
        }

        // Listeners para tabs principales
        const tabSocios = document.getElementById('tabSocios');
        const tabAdmin = document.getElementById('tabAdmin');
        
        if (tabSocios) {
            tabSocios.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔵 Click en tab Socios');
                if (typeof window.switchTab === 'function') {
                    window.switchTab('socios');
                } else {
                    console.error('❌ window.switchTab no está disponible');
                }
            });
        }

        if (tabAdmin) {
            tabAdmin.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔵 Click en tab Administración');
                if (typeof window.switchTab === 'function') {
                    window.switchTab('admin');
                } else {
                    console.error('❌ window.switchTab no está disponible');
                }
            });
        }
        
        console.log('✅ Event listeners configurados');

        // Cerrar modales al hacer clic fuera
        document.addEventListener('click', (event) => {
            // Modal de socio
            if (socioModal && !socioModal.classList.contains('hidden')) {
                const modalContent = socioModal.querySelector('.modal-content');
                if (modalContent && !modalContent.contains(event.target)) {
                    window.closeModal();
                }
            }
            
            // Modal de gasto
            const gastoModal = document.getElementById('gastoModal');
            if (gastoModal && !gastoModal.classList.contains('hidden')) {
                const modalContent = gastoModal.querySelector('.modal-content');
                if (modalContent && !modalContent.contains(event.target) && typeof window.closeGastoModal === 'function') {
                    window.closeGastoModal();
                }
            }
            
            // Modal de ingreso
            const ingresoModal = document.getElementById('ingresoModal');
            if (ingresoModal && !ingresoModal.classList.contains('hidden')) {
                const modalContent = ingresoModal.querySelector('.modal-content');
                if (modalContent && !modalContent.contains(event.target) && typeof window.closeIngresoModal === 'function') {
                    window.closeIngresoModal();
                }
            }
            
            // Modal de pago
            const pagoModal = document.getElementById('pagoModal');
            if (pagoModal && !pagoModal.classList.contains('hidden')) {
                const modalContent = pagoModal.querySelector('.modal-content');
                if (modalContent && !modalContent.contains(event.target) && typeof window.closePagoModal === 'function') {
                    window.closePagoModal();
                }
            }
        });
    }

    // ============================================
    // TABLE RENDERING
    // ============================================

    /**
     * Renderiza la tabla de socios
     */
    function renderSociosTable() {
        try {
            if (typeof window.getAll !== 'function') {
                console.warn('getAll no está disponible aún');
                return;
            }
            
            const socios = window.getAll('socios');
            const tbody = document.getElementById('sociosTableBody');
            
            if (!tbody) {
                console.error('❌ No se encontró el elemento sociosTableBody');
                return;
            }

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

            socios.forEach(socio => {
                const row = document.createElement('tr');
                
                const estadoBadge = (socio.estado === 'Activo' || socio.estado === 'activo')
                    ? '<span class="badge badge-active">Activo</span>'
                    : '<span class="badge badge-inactive">Inactivo</span>';

                row.innerHTML = `
                    <td style="font-family: monospace; font-size: 0.875rem; color: #6b7280;">${socio.id ? socio.id.substring(0, 8) + '...' : 'N/A'}</td>
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
                
                const editBtn = row.querySelector('.edit-btn');
                const deleteBtn = row.querySelector('.delete-btn');
                
                if (editBtn) {
                    editBtn.addEventListener('click', () => window.openEditModal(socio.id));
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => window.handleDeleteSocio(socio.id));
                }
                
                tbody.appendChild(row);
            });

            console.log(`✅ Tabla renderizada con ${socios.length} socios`);
        } catch (error) {
            console.error('❌ Error al renderizar tabla:', error);
        }
    }

    // ============================================
    // MODAL FUNCTIONS
    // ============================================

    /**
     * Abre el modal para agregar un nuevo socio
     */
    window.openAddModal = function() {
        console.log('🔵 openAddModal() llamado');
        
        try {
            // Asegurar referencias del DOM
            if (!socioModal || !modalTitle || !socioForm) {
                initDOMReferences();
            }
            
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
            
            if (!socioModal || !modalTitle || !socioForm) {
                console.error('❌ Referencias del DOM no inicializadas');
                alert('Error: No se encontraron los elementos del formulario. Por favor recarga la página.');
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
        } catch (error) {
            console.error('❌ Error al abrir modal:', error);
            alert('Error al abrir el formulario: ' + error.message);
        }
    };

    /**
     * Abre el modal para editar un socio existente
     */
    window.openEditModal = function(id) {
        try {
            if (!socioModal || !modalTitle || !socioForm || !nombre || !apellido || !email || !telefono || !estado) {
                initDOMReferences();
                if (!socioModal || !modalTitle || !socioForm) {
                    console.error('❌ Referencias del DOM no inicializadas');
                    return;
                }
            }

            if (typeof window.getItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }

            const socio = window.getItem('socios', id);

            if (!socio) {
                alert('Socio no encontrado');
                return;
            }

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

            socioModal.classList.remove('hidden');
        } catch (error) {
            console.error('❌ Error al abrir modal de edición:', error);
            alert('Error al cargar los datos del socio');
        }
    };

    /**
     * Cierra el modal
     */
    window.closeModal = function() {
        if (!socioModal) {
            initDOMReferences();
        }
        if (socioModal) {
            socioModal.classList.add('hidden');
            currentEditId = null;
        }
    };

    // ============================================
    // FORM HANDLING
    // ============================================

    /**
     * Maneja el envío del formulario (agregar o editar)
     */
    window.handleSubmitForm = function(event) {
        event.preventDefault();

        try {
            if (!nombre || !apellido || !email || !telefono || !estado) {
                initDOMReferences();
                if (!nombre || !apellido || !email || !telefono || !estado) {
                    console.error('❌ Referencias del DOM no inicializadas');
                    return;
                }
            }

            const nombreValue = nombre.value.trim();
            const apellidoValue = apellido.value.trim();
            const emailValue = email.value.trim();
            const telefonoValue = telefono.value.trim();
            const estadoValue = estado.value;

            if (!nombreValue || !apellidoValue || !emailValue || !telefonoValue) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailValue)) {
                alert('Por favor ingresa un email válido');
                return;
            }

            if (typeof window.addItem !== 'function' || typeof window.updateItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }

            const socioData = {
                nombre: nombreValue,
                apellido: apellidoValue,
                email: emailValue,
                telefono: telefonoValue,
                estado: estadoValue
            };

            if (currentEditId) {
                window.updateItem('socios', currentEditId, socioData);
                console.log('✅ Socio actualizado:', currentEditId);
            } else {
                window.addItem('socios', socioData);
                console.log('✅ Socio agregado');
            }

            window.closeModal();
            renderSociosTable();

            showNotification(
                currentEditId ? 'Socio actualizado exitosamente' : 'Socio agregado exitosamente',
                'success'
            );
        } catch (error) {
            console.error('❌ Error al guardar socio:', error);
            alert('Error al guardar el socio. Por favor, intenta nuevamente.');
        }
    };

    // ============================================
    // DELETE FUNCTION
    // ============================================

    /**
     * Maneja la eliminación de un socio
     */
    window.handleDeleteSocio = function(id) {
        try {
            if (typeof window.getAll !== 'function' || typeof window.deleteItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const socios = window.getAll('socios');
            const socio = socios.find(s => s.id === id);

            if (!socio) {
                alert('Socio no encontrado');
                return;
            }

            const confirmMessage = `¿Estás seguro de eliminar a ${socio.nombre} ${socio.apellido}?`;
            
            if (!confirm(confirmMessage)) {
                return;
            }

            window.deleteItem('socios', id);
            console.log('✅ Socio eliminado:', id);

            renderSociosTable();

            showNotification('Socio eliminado exitosamente', 'success');
        } catch (error) {
            console.error('❌ Error al eliminar socio:', error);
            alert('Error al eliminar el socio. Por favor, intenta nuevamente.');
        }
    };

    // ============================================
    // INITIALIZE ON LOAD
    // ============================================

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 DOM cargado, iniciando aplicación...');
            initUI().catch(error => {
                console.error('❌ Error fatal en inicialización:', error);
            });
        });
    } else {
        console.log('📄 DOM ya está listo, iniciando aplicación...');
        initUI().catch(error => {
            console.error('❌ Error fatal en inicialización:', error);
        });
    }

    console.log('✅ Módulo main.js cargado');

})();
