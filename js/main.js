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
     * Calcula el balance total desde gastos, ingresos y pagos de socios
     * Los pagos de socios también se suman a los ingresos totales
     */
    window.calculateBalance = async function() {
        try {
            if (typeof window.getAll !== 'function') {
                return {
                    totalIncome: 0,
                    totalExpenses: 0,
                    balance: 0
                };
            }
            
            // Obtener ingresos directos
            const ingresos = await window.getAll('ingresos');
            const totalIngresosDirectos = ingresos.reduce((sum, ingreso) => {
                return sum + (parseFloat(ingreso.monto) || 0);
            }, 0);
            
            // Obtener pagos de socios y sumarlos a los ingresos
            const pagos = await window.getAll('pagos');
            const totalPagosSocios = pagos.reduce((sum, pago) => {
                return sum + (parseFloat(pago.monto) || 0);
            }, 0);
            
            // Los ingresos totales son: ingresos directos + pagos de socios
            const totalIncome = totalIngresosDirectos + totalPagosSocios;
            
            // Obtener gastos
            const gastos = await window.getAll('gastos');
            const totalExpenses = gastos.reduce((sum, gasto) => {
                return sum + (parseFloat(gasto.monto) || 0);
            }, 0);
            
            // Calcular balance (ingresos totales - gastos)
            const balance = totalIncome - totalExpenses;
            
            console.log('💰 Balance calculado:', {
                ingresosDirectos: totalIngresosDirectos,
                pagosSocios: totalPagosSocios,
                ingresosTotales: totalIncome,
                gastos: totalExpenses,
                balance: balance
            });
            
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

    /**
     * Genera el código QR para compartir la aplicación - Solución simple y directa
     */
    window.generateQRCode = function() {
        const qrContainer = document.getElementById('qrCodeContainer');
        const qrUrl = document.getElementById('qrUrl');
        
        if (!qrContainer) {
            console.error('❌ Contenedor QR no encontrado');
            return;
        }

        // Obtener URL actual
        let fullUrl = window.location.href;
        if (fullUrl.includes('index.html')) {
            fullUrl = fullUrl.replace(/\/index\.html.*$/, '/');
        } else if (!fullUrl.endsWith('/')) {
            fullUrl = fullUrl.substring(0, fullUrl.lastIndexOf('/') + 1);
        }

        // Limpiar contenedor
        qrContainer.innerHTML = '';

        // Usar Google Charts API (muy confiable y simple)
        const encodedUrl = encodeURIComponent(fullUrl);
        const qrImageUrl = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=' + encodedUrl;
        
        // Crear imagen
        const img = document.createElement('img');
        img.src = qrImageUrl;
        img.alt = 'QR Code';
        img.style.width = '150px';
        img.style.height = '150px';
        img.style.display = 'block';
        img.style.borderRadius = '8px';
        
        img.onload = function() {
            console.log('✅ QR generado');
            if (qrUrl) {
                qrUrl.textContent = fullUrl;
            }
        };
        
        img.onerror = function() {
            // Fallback: usar otra API
            img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodedUrl;
        };
        
        qrContainer.appendChild(img);
    };

    /**
     * Actualiza la visualización del balance en la página
     */
    window.updateBalanceDisplay = async function() {
        try {
            const balance = await window.calculateBalance();
            
            const ingresosDisplay = document.getElementById('balanceIngresos');
            const gastosDisplay = document.getElementById('balanceGastos');
            const balanceDisplay = document.getElementById('balanceActual');
            const sociosDisplay = document.getElementById('balanceSocios');
            
            if (ingresosDisplay) {
                ingresosDisplay.textContent = window.formatCurrency(balance.totalIncome);
            }
            
            if (gastosDisplay) {
                gastosDisplay.textContent = window.formatCurrency(balance.totalExpenses);
            }
            
            if (balanceDisplay) {
                balanceDisplay.textContent = window.formatCurrency(balance.balance);
                // Cambiar color según si es positivo o negativo
                if (balance.balance >= 0) {
                    balanceDisplay.style.color = '#10b981';
                } else {
                    balanceDisplay.style.color = '#ef4444';
                }
            }
            
            // Actualizar número total de socios
            if (sociosDisplay) {
                try {
                    if (typeof window.getAll === 'function') {
                        const socios = await window.getAll('socios');
                        const registros = await window.getAll('registros');
                        
                        // Contar socios de la colección 'socios'
                        let totalSocios = socios ? socios.length : 0;
                        
                        // Si hay registros y no hay socios, contar registros también
                        // (por compatibilidad con datos antiguos)
                        if (totalSocios === 0 && registros && registros.length > 0) {
                            totalSocios = registros.length;
                            console.log('⚠️ Usando colección "registros" para contar socios');
                        }
                        
                        sociosDisplay.textContent = totalSocios;
                        console.log('✅ Total de socios actualizado:', totalSocios, 'socios en "socios":', socios ? socios.length : 0, 'registros:', registros ? registros.length : 0);
                    } else {
                        console.warn('⚠️ window.getAll no está disponible');
                        sociosDisplay.textContent = '0';
                    }
                } catch (error) {
                    console.error('❌ Error al contar socios:', error);
                    sociosDisplay.textContent = '0';
                }
            }
            
            console.log('✅ Balance actualizado:', balance);
        } catch (error) {
            console.error('❌ Error al actualizar balance:', error);
        }
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
            
            // Inicializar base de datos desde JSONbin
            if (typeof window.initDB === 'function') {
                try {
                    await window.initDB();
                    console.log('✅ Base de datos inicializada desde JSONbin');
                } catch (dbError) {
                    console.error('❌ Error al inicializar DB desde JSONbin:', dbError);
                    alert('Error al conectar con la base de datos. Por favor, verifica tu conexión a internet.');
                }
            } else {
                console.error('❌ window.initDB no está disponible. Asegúrate de que database.js y db.js estén cargados.');
            }
            
            // Configurar listeners
            setupEventListeners();
            
            // Generar código QR inmediatamente
            window.generateQRCode();
            
            // Renderizar tablas iniciales (ahora async)
            await renderSociosTable();
            
            // Renderizar tablas de administración (se cargarán cuando se abra el tab)
            if (typeof window.renderAdminSociosTable === 'function') {
                await window.renderAdminSociosTable();
            }
            if (typeof window.renderGastosTable === 'function') {
                await window.renderGastosTable();
            }
            if (typeof window.renderIngresosTable === 'function') {
                await window.renderIngresosTable();
            }
            if (typeof window.loadSociosSelector === 'function') {
                await window.loadSociosSelector();
            }
            
            // Actualizar balance inicial - hacerlo inmediatamente y también después de un delay
            if (typeof window.updateBalanceDisplay === 'function') {
                window.updateBalanceDisplay();
            }
            
            // También actualizar después de un delay para asegurar que todo esté cargado
            setTimeout(function() {
                if (typeof window.updateBalanceDisplay === 'function') {
                    window.updateBalanceDisplay();
                }
            }, 300);
            
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
        
        // Listener para botón "Registrarse" (tab de socios)
        const registrarseBtn = document.getElementById('registrarseBtn');
        if (registrarseBtn) {
            registrarseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔵 Click en Registrarse');
                if (typeof window.navigateTo === 'function') {
                    window.navigateTo('registro.html');
                } else {
                    window.location.href = 'registro.html';
                }
            });
            console.log('✅ Listener agregado a botón "Registrarse"');
        }

        // Listener para botón "Agregar Socio" (solo en el tab de administración)
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
     * Renderiza la tabla simplificada de socios (solo vista, sin acciones)
     * Ahora es async
     */
    async function renderSociosTable() {
        try {
            if (typeof window.getAll !== 'function') {
                console.warn('getAll no está disponible aún');
                return;
            }
            
            const socios = await window.getAll('socios');
            console.log('📊 Socios encontrados al renderizar tabla:', socios.length, socios);
            
            const tbody = document.getElementById('sociosTableBody');
            
            if (!tbody) {
                console.error('❌ No se encontró el elemento sociosTableBody');
                return;
            }

            tbody.innerHTML = '';

            if (socios.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" class="empty-state">
                            <div class="empty-state-icon">📋</div>
                            <p>No hay socios registrados</p>
                        </td>
                    </tr>
                `;
                return;
            }

            // Renderizar lista simplificada (solo nombre, apellido, teléfono)
            socios.forEach(socio => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHtml(socio.nombre || '')}</td>
                    <td>${escapeHtml(socio.apellido || '')}</td>
                    <td>${escapeHtml(socio.telefono || '')}</td>
                `;
                tbody.appendChild(row);
            });

            console.log(`✅ Tabla simplificada renderizada con ${socios.length} socios`);
            
            // Actualizar balance después de renderizar
            if (typeof window.updateBalanceDisplay === 'function') {
                setTimeout(function() {
                    window.updateBalanceDisplay();
                }, 100);
            }
        } catch (error) {
            console.error('❌ Error al renderizar tabla:', error);
        }
    }

    /**
     * Renderiza la tabla completa de socios para administración (con acciones)
     * Ahora es async
     */
    window.renderAdminSociosTable = async function() {
        try {
            if (typeof window.getAll !== 'function') {
                console.warn('getAll no está disponible aún');
                return;
            }
            
            const socios = await window.getAll('socios');
            const tbody = document.getElementById('adminSociosTableBody');
            
            if (!tbody) {
                console.error('❌ No se encontró el elemento adminSociosTableBody');
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
                            <button class="btn-icon btn-icon-view view-btn" data-id="${socio.id}" title="Ver Detalles" style="background: #e0e7ff; color: #6366f1;">
                                <span class="material-icons-round">visibility</span>
                            </button>
                            <button class="btn-icon btn-icon-edit edit-btn" data-id="${socio.id}" title="Editar">
                                <span class="material-icons-round">edit</span>
                            </button>
                            <button class="btn-icon btn-icon-delete delete-btn" data-id="${socio.id}" title="Eliminar">
                                <span class="material-icons-round">delete</span>
                            </button>
                        </div>
                    </td>
                `;
                
                const viewBtn = row.querySelector('.view-btn');
                const editBtn = row.querySelector('.edit-btn');
                const deleteBtn = row.querySelector('.delete-btn');
                
                if (viewBtn) {
                    viewBtn.addEventListener('click', async () => {
                        try {
                            if (typeof window.showSocioDetalles === 'function') {
                                await window.showSocioDetalles(socio.id);
                            }
                        } catch (error) {
                            console.error('Error mostrando detalles:', error);
                            alert('Error al mostrar los detalles del socio');
                        }
                    });
                }
                
                if (editBtn) {
                    editBtn.addEventListener('click', async () => {
                        try {
                            await window.openEditModal(socio.id);
                        } catch (error) {
                            console.error('Error abriendo modal de edición:', error);
                            alert('Error al abrir el formulario de edición');
                        }
                    });
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', async () => {
                        try {
                            await window.handleDeleteSocio(socio.id);
                        } catch (error) {
                            console.error('Error eliminando socio:', error);
                            alert('Error al eliminar el socio');
                        }
                    });
                }
                
                tbody.appendChild(row);
            });

            console.log(`✅ Tabla de administración renderizada con ${socios.length} socios`);
        } catch (error) {
            console.error('❌ Error al renderizar tabla de administración:', error);
        }
    };

    // ============================================
    // SOCIO DETALLES MODAL
    // ============================================

    /**
     * Muestra los detalles completos de un socio
     * Ahora es async
     */
    window.showSocioDetalles = async function(socioId) {
        try {
            if (typeof window.getItem !== 'function') {
                alert('Error: función no disponible');
                return;
            }

            const socio = await window.getItem('socios', socioId);
            if (!socio) {
                alert('Socio no encontrado');
                return;
            }

            const modal = document.getElementById('socioDetallesModal');
            const content = document.getElementById('socioDetallesContent');
            
            if (!modal || !content) {
                alert('Error: elementos del modal no encontrados');
                return;
            }

            // Formatear fecha
            function formatDate(dateString) {
                if (!dateString) return 'No especificada';
                try {
                    const date = new Date(dateString);
                    return date.toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                } catch {
                    return dateString;
                }
            }

            // Construir HTML con toda la información
            let html = `
                <div style="display: grid; gap: 2rem;">
                    <!-- Información de Contacto -->
                    <div>
                        <h3 style="color: var(--color-primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--color-primary);">
                            2. Datos de Contacto
                        </h3>
                        <div style="display: grid; gap: 1rem;">
                            <div>
                                <strong>Teléfono:</strong> ${escapeHtml(socio.telefono || 'No especificado')}
                            </div>
                            <div>
                                <strong>Email:</strong> ${escapeHtml(socio.email || 'No especificado')}
                            </div>
                            ${socio.contactoEmergencia ? `
                            <div>
                                <strong>Contacto de emergencia:</strong> ${escapeHtml(socio.contactoEmergencia)}
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Situación en la Cooperativa -->
                    <div>
                        <h3 style="color: var(--color-primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--color-primary);">
                            3. Situación del Socio en la Cooperativa
                        </h3>
                        <div>
                            <strong>Fecha de ingreso:</strong> ${formatDate(socio.fechaIngreso)}
                        </div>
                        <div style="margin-top: 0.5rem;">
                            <strong>Estado:</strong> 
                            <span class="badge ${socio.estado === 'Activo' || socio.estado === 'activo' ? 'badge-active' : 'badge-inactive'}">
                                ${socio.estado || 'Activo'}
                            </span>
                        </div>
                    </div>

                    <!-- Aportaciones -->
                    <div>
                        <h3 style="color: var(--color-primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--color-primary);">
                            4. Aportaciones y Obligaciones
                        </h3>
                        <div>
                            <strong>Cuota mensual:</strong> ${window.formatCurrency ? window.formatCurrency(socio.cuotaMensual || 0) : (socio.cuotaMensual || 0) + ' €'}
                        </div>
                    </div>

                    <!-- Autorizaciones -->
                    ${socio.consentimientoDatos || socio.aceptacionNormas ? `
                    <div>
                        <h3 style="color: var(--color-primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--color-primary);">
                            5. Autorizaciones Legales
                        </h3>
                        <div style="display: grid; gap: 0.5rem;">
                            ${socio.consentimientoDatos ? '<div>✅ Consentimiento para uso interno de datos</div>' : ''}
                            ${socio.aceptacionNormas ? '<div>✅ Aceptación de normas internas</div>' : ''}
                            ${socio.fechaConsentimiento ? `<div style="font-size: 0.875rem; color: #6b7280;">Fecha de consentimiento: ${formatDate(socio.fechaConsentimiento)}</div>` : ''}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Participación -->
                    ${socio.areasColaboracion || socio.disponibilidadHoras ? `
                    <div>
                        <h3 style="color: var(--color-primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--color-primary);">
                            6. Participación y Disponibilidad
                        </h3>
                        <div style="display: grid; gap: 1rem;">
                            ${socio.areasColaboracion && socio.areasColaboracion.length > 0 ? `
                            <div>
                                <strong>Áreas de colaboración:</strong>
                                <div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                    ${socio.areasColaboracion.map(area => {
                                        const areaNames = {
                                            'administracion': 'Administración',
                                            'eventos': 'Eventos',
                                            'apoyo_social': 'Apoyo Social',
                                            'comunicacion': 'Comunicación',
                                            'finanzas': 'Finanzas',
                                            'proyectos': 'Proyectos'
                                        };
                                        return `<span style="background: #e0e7ff; color: #6366f1; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem;">${areaNames[area] || area}</span>`;
                                    }).join('')}
                                </div>
                            </div>
                            ` : ''}
                            ${socio.otrasAreas ? `
                            <div>
                                <strong>Otras áreas:</strong> ${escapeHtml(socio.otrasAreas)}
                            </div>
                            ` : ''}
                            <div>
                                <strong>Disponibilidad:</strong> ${socio.disponibilidadHoras || 0} horas/mes
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;

            // Agregar información de miembros de la familia si existe
            if (socio.miembros && socio.miembros.length > 0) {
                let miembrosHtml = `
                    <div>
                        <h3 style="color: var(--color-primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--color-primary);">
                            1. Identificación de los Integrantes de la Familia (${socio.miembros.length} ${socio.miembros.length === 1 ? 'miembro' : 'miembros'})
                        </h3>
                        <div style="display: grid; gap: 1.5rem;">
                `;

                socio.miembros.forEach((miembro, index) => {
                    miembrosHtml += `
                        <div style="background: #f9fafb; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                            <h4 style="margin-bottom: 1rem; color: var(--color-primary);">Miembro ${index + 1}</h4>
                            <div style="display: grid; gap: 0.75rem;">
                                <div><strong>Nombre completo:</strong> ${escapeHtml(miembro.nombreCompleto || '')}</div>
                                <div><strong>Documento:</strong> ${escapeHtml(miembro.tipoDocumento ? (miembro.tipoDocumento.toUpperCase() + ': ' + miembro.numeroDocumento) : '')}</div>
                                <div><strong>Fecha de nacimiento:</strong> ${formatDate(miembro.fechaNacimiento)}</div>
                                <div><strong>Nacionalidad:</strong> ${escapeHtml(miembro.nacionalidad || '')}</div>
                                <div><strong>Domicilio actual:</strong> ${escapeHtml(miembro.domicilioActual || '')}</div>
                                <div><strong>Profesión:</strong> ${escapeHtml(miembro.profesion || '')}</div>
                            </div>
                        </div>
                    `;
                });

                miembrosHtml += `
                        </div>
                    </div>
                `;

                html = miembrosHtml + html;
            }

            content.innerHTML = html;
            modal.classList.remove('hidden');
        } catch (error) {
            console.error('❌ Error al mostrar detalles del socio:', error);
            alert('Error al cargar los detalles del socio');
        }
    };

    /**
     * Cierra el modal de detalles del socio
     */
    window.closeSocioDetallesModal = function() {
        const modal = document.getElementById('socioDetallesModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    };

    // ============================================
    // MODAL FUNCTIONS
    // ============================================

    /**
     * Actualiza los campos de miembros de la familia en el modal
     */
    function updateModalMiembrosFamilia() {
        const count = parseInt(document.getElementById('modalNumMiembros')?.value || 1);
        const container = document.getElementById('modalMiembrosContainer');

        if (!container) return;

        container.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const memberDiv = document.createElement('div');
            memberDiv.className = 'card';
            memberDiv.style.background = '#f9fafb';
            memberDiv.style.padding = '1.5rem';
            memberDiv.style.marginBottom = '1rem';
            memberDiv.style.border = '1px solid #e5e7eb';

            memberDiv.innerHTML = `
                <h4 style="margin-bottom: 1rem; color: var(--color-primary);">Miembro ${i + 1}</h4>
                
                <div class="form-group">
                    <label class="form-label required">Nombre completo</label>
                    <input type="text" class="form-input modal-member-nombre" data-index="${i}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Documento</label>
                    <select class="form-select modal-member-tipo-doc" data-index="${i}" required>
                        <option value="">Seleccionar...</option>
                        <option value="dni">DNI</option>
                        <option value="nie">NIE</option>
                        <option value="pasaporte">Pasaporte</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Número de documento</label>
                    <input type="text" class="form-input modal-member-doc-num" data-index="${i}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Fecha de nacimiento</label>
                    <input type="date" class="form-input modal-member-fecha-nac" data-index="${i}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Nacionalidad</label>
                    <input type="text" class="form-input modal-member-nacionalidad" data-index="${i}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Domicilio actual</label>
                    <input type="text" class="form-input modal-member-domicilio" data-index="${i}" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label required">Profesión</label>
                    <input type="text" class="form-input modal-member-profesion" data-index="${i}" required>
                </div>
            `;

            container.appendChild(memberDiv);
        }
    }

    /**
     * Abre el modal para agregar un nuevo socio
     */
    window.openAddModal = function() {
        console.log('🔵 openAddModal() llamado');
        
        try {
            socioModal = document.getElementById('socioModal');
            modalTitle = document.getElementById('modalTitle');
            socioForm = document.getElementById('socioForm');
            
            if (!socioModal || !modalTitle || !socioForm) {
                console.error('❌ Referencias del DOM no inicializadas');
                alert('Error: No se encontraron los elementos del formulario. Por favor recarga la página.');
                return;
            }

            currentEditId = null;
            socioForm.reset();
            modalTitle.textContent = 'Agregar Socio';
            
            // Inicializar fecha de ingreso con fecha actual
            const fechaIngresoInput = document.getElementById('modalFechaIngreso');
            if (fechaIngresoInput) {
                const today = new Date().toISOString().split('T')[0];
                fechaIngresoInput.value = today;
            }

            // Inicializar miembros
            updateModalMiembrosFamilia();

            // Listener para actualizar miembros cuando cambia el número
            const numMiembrosInput = document.getElementById('modalNumMiembros');
            if (numMiembrosInput) {
                numMiembrosInput.removeEventListener('input', updateModalMiembrosFamilia);
                numMiembrosInput.addEventListener('input', updateModalMiembrosFamilia);
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
    window.openEditModal = async function(id) {
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

            const socio = await window.getItem('socios', id);

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
    window.handleSubmitForm = async function(event) {
        event.preventDefault();
        
        try {
            if (typeof window.addItem !== 'function' || typeof window.updateItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }

            // Recopilar información de miembros de la familia
            const miembros = [];
            const memberNombres = document.querySelectorAll('.modal-member-nombre');
            const memberTipoDocs = document.querySelectorAll('.modal-member-tipo-doc');
            const memberDocNums = document.querySelectorAll('.modal-member-doc-num');
            const memberFechasNac = document.querySelectorAll('.modal-member-fecha-nac');
            const memberNacionalidades = document.querySelectorAll('.modal-member-nacionalidad');
            const memberDomicilios = document.querySelectorAll('.modal-member-domicilio');
            const memberProfesiones = document.querySelectorAll('.modal-member-profesion');

            for (let i = 0; i < memberNombres.length; i++) {
                if (!memberNombres[i].value.trim() || !memberTipoDocs[i].value || !memberDocNums[i].value.trim()) {
                    alert('Por favor completa todos los campos requeridos de los miembros de la familia');
                    return;
                }
                
                miembros.push({
                    nombreCompleto: memberNombres[i].value.trim(),
                    tipoDocumento: memberTipoDocs[i].value,
                    numeroDocumento: memberDocNums[i].value.trim(),
                    fechaNacimiento: memberFechasNac[i].value,
                    nacionalidad: memberNacionalidades[i].value.trim(),
                    domicilioActual: memberDomicilios[i].value.trim(),
                    profesion: memberProfesiones[i].value.trim()
                });
            }

            // Recopilar áreas de colaboración
            const areasSelect = document.getElementById('modalAreasColaboracion');
            const areasColaboracion = [];
            if (areasSelect) {
                for (let option of areasSelect.selectedOptions) {
                    areasColaboracion.push(option.value);
                }
            }
            const otrasAreas = document.getElementById('modalOtrasAreas')?.value.trim() || '';

            // Validar campos básicos
            const telefonoValue = document.getElementById('modalTelefono')?.value.trim();
            const emailValue = document.getElementById('modalEmail')?.value.trim();
            const fechaIngreso = document.getElementById('modalFechaIngreso')?.value;
            const cuotaMensual = parseFloat(document.getElementById('modalCuotaMensual')?.value || 0);
            const consentimientoDatos = document.getElementById('modalConsentimientoDatos')?.checked;
            const aceptacionNormas = document.getElementById('modalAceptacionNormas')?.checked;
            const disponibilidadHoras = parseInt(document.getElementById('modalDisponibilidadHoras')?.value || 0);
            const estadoValue = document.getElementById('modalEstado')?.value || 'Activo';

            if (!telefonoValue || !emailValue || !fechaIngreso || !consentimientoDatos || !aceptacionNormas) {
                alert('Por favor completa todos los campos requeridos');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailValue)) {
                alert('Por favor ingresa un email válido');
                return;
            }

            // Datos del socio principal (primer miembro)
            const nombrePrincipal = miembros[0]?.nombreCompleto.split(' ')[0] || '';
            const apellidoPrincipal = miembros[0]?.nombreCompleto.split(' ').slice(1).join(' ') || miembros[0]?.nombreCompleto || '';

            const socioData = {
                nombre: nombrePrincipal,
                apellido: apellidoPrincipal,
                telefono: telefonoValue,
                email: emailValue,
                contactoEmergencia: document.getElementById('modalContactoEmergencia')?.value.trim() || '',
                
                // Información de todos los miembros
                miembros: miembros,
                numMiembros: miembros.length,
                
                // Situación en la cooperativa
                fechaIngreso: fechaIngreso,
                estado: estadoValue,
                
                // Aportaciones
                cuotaMensual: cuotaMensual,
                
                // Autorizaciones
                consentimientoDatos: consentimientoDatos,
                aceptacionNormas: aceptacionNormas,
                fechaConsentimiento: new Date().toISOString(),
                
                // Participación
                areasColaboracion: areasColaboracion,
                otrasAreas: otrasAreas,
                disponibilidadHoras: disponibilidadHoras,
                
                // Estado y registro
                fechaRegistro: currentEditId ? undefined : new Date().toISOString()
            };

            if (currentEditId) {
                await window.updateItem('socios', currentEditId, socioData);
                console.log('✅ Socio actualizado:', currentEditId);
            } else {
                await window.addItem('socios', socioData);
                console.log('✅ Socio agregado');
            }

            window.closeModal();
            
            // Actualizar ambas tablas
            await renderSociosTable();
            if (typeof window.renderAdminSociosTable === 'function') {
                await window.renderAdminSociosTable();
            }

            // Actualizar balance
            if (typeof window.updateBalanceDisplay === 'function') {
                await window.updateBalanceDisplay();
            }

            showNotification(
                currentEditId ? 'Socio actualizado exitosamente' : 'Socio agregado exitosamente',
                'success'
            );
        } catch (error) {
            console.error('❌ Error al guardar socio:', error);
            alert('Error al guardar el socio: ' + error.message);
        }
    };

    // ============================================
    // DELETE FUNCTION
    // ============================================

    /**
     * Maneja la eliminación de un socio
     */
    window.handleDeleteSocio = async function(id) {
        try {
            if (typeof window.getAll !== 'function' || typeof window.deleteItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const socios = await window.getAll('socios');
            const socio = socios.find(s => s.id === id);

            if (!socio) {
                alert('Socio no encontrado');
                return;
            }

            const confirmMessage = `¿Estás seguro de eliminar a ${socio.nombre} ${socio.apellido}?`;
            
            if (!confirm(confirmMessage)) {
                return;
            }

            await window.deleteItem('socios', id);
            console.log('✅ Socio eliminado:', id);

            await renderSociosTable();
            
            // Actualizar balance (en caso de que haya afectado pagos)
            if (typeof window.updateBalanceDisplay === 'function') {
                await window.updateBalanceDisplay();
            }

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
