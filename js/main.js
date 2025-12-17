// ============================================
// COOPERATIVA PRO-VIVIENDA MI ESPERANZA - MAIN LOGIC
// Versión sin módulos ES6 para compatibilidad
// ============================================

(function () {
    'use strict';

    // ============================================
    // ACCESS PASSWORD PROTECTION - NUEVO SISTEMA
    // ============================================
    // Contraseñas de acceso
    const APP_PASSWORD = 'miesperanza'; // Para acceso general (socios, registro)
    const ADMIN_ACCESS_PASSWORD = 'coopmiesperanza'; // Para acceso como administrador desde login inicial

    /**
     * Verifica si el usuario está autenticado
     */
    function isAppAuthenticated() {
        return sessionStorage.getItem('appAuth') === 'true';
    }

    /**
     * Autentica al usuario
     */
    function authenticateApp() {
        sessionStorage.setItem('appAuth', 'true');
    }

    /**
     * Verifica la contraseña y muestra/oculta contenido
     * @param {boolean} isAdmin - Si es true, verifica la contraseña de administrador
     */
    window.checkAppPassword = function (isAdmin = false) {
        const passwordInput = document.getElementById('appPasswordInput');
        const errorMsg = document.getElementById('passwordError');
        const loginModal = document.getElementById('loginModal');
        const appContent = document.getElementById('appContent');

        if (!passwordInput) {
            alert('Error: Campo de contraseña no encontrado');
            return;
        }

        let enteredPassword = passwordInput.value;

        // Limpiar espacios al inicio y al final
        enteredPassword = enteredPassword.trim();

        // Eliminar espacios en medio también (por si acaso)
        enteredPassword = enteredPassword.replace(/\s+/g, '');

        const expectedPassword = isAdmin ? ADMIN_ACCESS_PASSWORD : APP_PASSWORD;

        console.log('🔐 Verificando contraseña...');
        console.log('🔑 Modo:', isAdmin ? 'ADMINISTRADOR' : 'USUARIO');
        console.log('🔑 Contraseña ingresada (raw):', passwordInput.value);
        console.log('🔑 Contraseña ingresada (limpia):', enteredPassword);
        console.log('🔑 Contraseña esperada:', expectedPassword);

        // Comparación exacta (case-sensitive para mayor seguridad)
        // Pero normalizar a minúsculas para evitar problemas de teclado
        const isCorrectPassword = enteredPassword.toLowerCase() === expectedPassword.toLowerCase();
        
        if (isCorrectPassword) {
            console.log('✅ Contraseña correcta - Autenticando...');

            // Contraseña correcta
            authenticateApp();

            // Si es administrador, también autenticar para admin
            if (isAdmin) {
                if (typeof window.setAdminAuthenticated === 'function') {
                    window.setAdminAuthenticated();
                    console.log('✅ Autenticado como administrador desde login principal');
                }
            } else {
                // Si no es admin, asegurarse de que no esté autenticado como admin
                // (por si había una sesión previa)
                sessionStorage.removeItem('adminAuth');
            }

            // Mostrar contenido de la app PRIMERO
            if (appContent) {
                appContent.style.display = 'block';
                appContent.style.visibility = 'visible';
            }

            // Ocultar modal de login DESPUÉS
            if (loginModal) {
                loginModal.style.display = 'none';
                loginModal.style.visibility = 'hidden';
                setTimeout(() => {
                    loginModal.remove();
                }, 300);
            }

            // Inicializar la aplicación
            if (typeof initUI === 'function') {
                setTimeout(() => {
                    initUI().catch(err => console.error('Error inicializando:', err));
                }, 100);
            }
        } else {
            console.log('❌ Contraseña incorrecta');

            // Contraseña incorrecta
            if (errorMsg) {
                const errorText = isAdmin 
                    ? 'Contraseña de administrador incorrecta. Por favor, intenta nuevamente.'
                    : 'Contraseña incorrecta. Por favor, intenta nuevamente.';
                errorMsg.textContent = errorText;
                errorMsg.style.display = 'block';
            }
            passwordInput.value = '';
            passwordInput.focus();
        }
    };

    /**
     * Verifica autenticación al cargar
     */
    function initAccessControl() {
        if (isAppAuthenticated()) {
            // Usuario autenticado - mostrar app
            const loginModal = document.getElementById('loginModal');
            const appContent = document.getElementById('appContent');

            if (loginModal) {
                loginModal.remove();
            }
            if (appContent) {
                appContent.style.display = 'block';
            }
        } else {
            // Usuario no autenticado - mostrar modal
            const appContent = document.getElementById('appContent');
            if (appContent) {
                appContent.style.display = 'none';
            }

            // Configurar event listeners para el botón y el formulario
            setTimeout(() => {
                const passwordInput = document.getElementById('appPasswordInput');
                const loginButton = document.getElementById('loginButton');
                const loginForm = document.getElementById('loginForm');

                if (passwordInput) {
                    passwordInput.focus();

                    // Permitir Enter para enviar (acceso normal)
                    passwordInput.addEventListener('keypress', function (e) {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (typeof window.checkAppPassword === 'function') {
                                window.checkAppPassword(false);
                            } else {
                                console.error('❌ Función checkAppPassword no disponible');
                            }
                        }
                    });
                }

                if (loginButton) {
                    loginButton.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔵 Click en botón Acceder');
                        if (typeof window.checkAppPassword === 'function') {
                            window.checkAppPassword(false);
                        } else {
                            console.error('❌ Función checkAppPassword no disponible');
                            alert('Error: Función no disponible. Por favor recarga la página.');
                        }
                        return false;
                    });
                }

                if (loginForm) {
                    loginForm.addEventListener('submit', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔵 Submit del formulario');
                        if (typeof window.checkAppPassword === 'function') {
                            window.checkAppPassword(false);
                        } else {
                            console.error('❌ Función checkAppPassword no disponible');
                            alert('Error: Función no disponible. Por favor recarga la página.');
                        }
                        return false;
                    });
                }
            }, 300);
        }
    }

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
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            // Also fade out manual for cleaner exit if needed, but animation handles move
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s';

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
    window.calculateBalance = async function () {
        try {
            if (typeof window.getAll !== 'function') {
                console.warn('⚠️ window.getAll no está disponible');
                return {
                    totalIncome: 0,
                    totalExpenses: 0,
                    balance: 0
                };
            }

            // Obtener ingresos directos
            const ingresos = await window.getAll('ingresos') || [];
            console.log('📊 Ingresos encontrados:', ingresos.length, ingresos);
            const totalIngresosDirectos = ingresos.reduce((sum, ingreso) => {
                const monto = parseFloat(ingreso?.monto) || 0;
                return sum + monto;
            }, 0);

            // Obtener pagos de socios y sumarlos a los ingresos
            const pagos = await window.getAll('pagos') || [];
            console.log('📊 Pagos encontrados:', pagos.length, pagos);
            const totalPagosSocios = pagos.reduce((sum, pago) => {
                const monto = parseFloat(pago?.monto) || 0;
                return sum + monto;
            }, 0);

            // Los ingresos totales son: ingresos directos + pagos de socios
            const totalIncome = totalIngresosDirectos + totalPagosSocios;

            // Obtener gastos
            const gastos = await window.getAll('gastos') || [];
            console.log('📊 Gastos encontrados:', gastos.length, gastos);
            const totalExpenses = gastos.reduce((sum, gasto) => {
                const monto = parseFloat(gasto?.monto) || 0;
                return sum + monto;
            }, 0);

            // Calcular balance (ingresos totales - gastos)
            const balance = totalIncome - totalExpenses;

            console.log('💰 Balance calculado:', {
                numIngresos: ingresos.length,
                ingresosDirectos: totalIngresosDirectos,
                numPagos: pagos.length,
                pagosSocios: totalPagosSocios,
                ingresosTotales: totalIncome,
                numGastos: gastos.length,
                gastos: totalExpenses,
                balance: balance
            });

            // Si hay balance pero no debería haber registros visibles, mostrar advertencia
            if (balance !== 0 && ingresos.length === 0 && pagos.length === 0 && gastos.length === 0) {
                console.warn('⚠️ ADVERTENCIA: Hay un balance de', balance, 'pero no hay registros. Puede haber datos residuales en la base de datos.');
            }

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
    window.formatCurrency = function (amount) {
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
    window.navigateTo = function (url) {
        window.location.href = url;
    };

    /**
     * Genera el código QR para compartir la aplicación - Solución simple y directa
     */
    window.generateQRCode = function () {
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
        img.style.borderRadius = '12px';
        img.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
        img.style.background = 'white';
        img.style.padding = '8px';

        img.onload = function () {
            console.log('✅ QR generado');
            if (qrUrl) {
                qrUrl.textContent = fullUrl;
            }
            // Animación de aparición con escala
            if (qrContainer) {
                qrContainer.style.opacity = '1';
                qrContainer.style.transform = 'scale(1)';
            }
        };

        img.onerror = function () {
            // Fallback: usar otra API
            img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + encodedUrl;
        };

        qrContainer.appendChild(img);
    };

    /**
     * Limpia datos residuales si no hay registros visibles
     */
    window.limpiarDatosResiduales = async function () {
        try {
            const ingresos = await window.getAll('ingresos') || [];
            const pagos = await window.getAll('pagos') || [];
            const gastos = await window.getAll('gastos') || [];
            const socios = await window.getAll('socios') || [];

            // Si hay datos pero no hay socios, puede haber datos residuales
            const hayDatos = ingresos.length > 0 || pagos.length > 0 || gastos.length > 0;

            if (hayDatos && socios.length === 0) {
                console.log('🧹 Limpiando datos residuales (hay datos pero no hay socios)...');
                const db = await window.cargarDatos();
                db.ingresos = [];
                db.pagos = [];
                db.gastos = [];
                await window.guardarDatos(db);
                console.log('✅ Datos residuales limpiados');
                window.invalidateCache();
            }
        } catch (error) {
            console.error('❌ Error al limpiar datos residuales:', error);
        }
    };

    /**
     * Actualiza la visualización del balance en la página
     */
    window.updateBalanceDisplay = async function () {
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

                    // Intentar limpiar datos residuales
                    if (typeof window.limpiarDatosResiduales === 'function') {
                        await window.limpiarDatosResiduales();
                    }
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
            setTimeout(function () {
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
            registrarseBtn.addEventListener('click', function (e) {
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
            addSocioBtn.addEventListener('click', function (e) {
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
            cancelModalBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (typeof window.closeModal === 'function') {
                    window.closeModal();
                }
            });
        }

        // Listener para formulario de socios
        if (socioForm) {
            socioForm.addEventListener('submit', function (e) {
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
            addGastoBtn.addEventListener('click', function (e) {
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
            addIngresoBtn.addEventListener('click', function (e) {
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
            addPagoBtn.addEventListener('click', function (e) {
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
            gastoForm.addEventListener('submit', function (e) {
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
            ingresoForm.addEventListener('submit', function (e) {
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
            pagoForm.addEventListener('submit', function (e) {
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
            tabSocios.addEventListener('click', function (e) {
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
            tabAdmin.addEventListener('click', function (e) {
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
                setTimeout(function () {
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
    window.renderAdminSociosTable = async function () {
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
                        <button class="btn-icon btn-icon-edit edit-btn" data-id="${socio.id}" data-socio-id="${socio.id}" title="Editar" onclick="event.stopPropagation(); event.preventDefault(); if(typeof window.openEditModal==='function'){window.openEditModal('${socio.id.replace(/'/g, "\\'")}');}else{alert('Función no disponible');}">
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
                    editBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log('✏️ Click en botón editar para socio ID:', socio.id);
                        console.log('🔍 window.openEditModal existe?', typeof window.openEditModal);
                        
                        try {
                            if (typeof window.openEditModal !== 'function') {
                                console.error('❌ window.openEditModal no es una función');
                                alert('Error: La función de edición no está disponible. Por favor recarga la página.');
                                return;
                            }
                            
                            await window.openEditModal(socio.id);
                            console.log('✅ openEditModal ejecutado');
                        } catch (error) {
                            console.error('❌ Error abriendo modal de edición:', error);
                            console.error('Stack:', error.stack);
                            alert('Error al abrir el formulario de edición: ' + error.message);
                        }
                    });
                } else {
                    console.warn('⚠️ Botón de editar no encontrado para socio:', socio.id);
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
    window.showSocioDetalles = async function (socioId) {
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

            // Debug: verificar estructura de datos
            console.log('📋 Datos del socio:', socio);
            console.log('👥 Miembros:', socio.miembros);
            
            // Construir HTML con toda la información - Diseño Moderno Glassmorphism
            let html = `
                <div style="display: grid; gap: 1.5rem;">
                    <!-- Información de Contacto -->
                    <div class="info-section-glass" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.5rem; transition: all 0.3s ease;">
                        <h3 style="color: var(--color-primary); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid rgba(56, 189, 248, 0.3); font-size: 1.125rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <span class="material-icons-round" style="font-size: 1.25rem;">contact_mail</span>
                            2. Datos de Contacto
                        </h3>
                        <div style="display: grid; gap: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.02); border-radius: 8px;">
                                <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8;">phone</span>
                                <div><strong style="color: var(--text-secondary); margin-right: 0.5rem;">Teléfono:</strong><span style="color: var(--text-primary);">${escapeHtml(socio.telefono || 'No especificado')}</span></div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.02); border-radius: 8px;">
                                <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8;">email</span>
                                <div><strong style="color: var(--text-secondary); margin-right: 0.5rem;">Email:</strong><span style="color: var(--text-primary);">${escapeHtml(socio.email || 'No especificado')}</span></div>
                            </div>
                            ${socio.contactoEmergencia ? `
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.02); border-radius: 8px;">
                                <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8;">emergency</span>
                                <div><strong style="color: var(--text-secondary); margin-right: 0.5rem;">Contacto de emergencia:</strong><span style="color: var(--text-primary);">${escapeHtml(socio.contactoEmergencia)}</span></div>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Situación en la Cooperativa -->
                    <div class="info-section-glass" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--color-primary); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid rgba(56, 189, 248, 0.3); font-size: 1.125rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <span class="material-icons-round" style="font-size: 1.25rem;">business</span>
                            3. Situación del Socio en la Cooperativa
                        </h3>
                        <div style="display: grid; gap: 1rem;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.02); border-radius: 8px;">
                                <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8;">event</span>
                                <div><strong style="color: var(--text-secondary); margin-right: 0.5rem;">Fecha de ingreso:</strong><span style="color: var(--text-primary);">${formatDate(socio.fechaIngreso)}</span></div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.02); border-radius: 8px;">
                                <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8;">check_circle</span>
                                <div><strong style="color: var(--text-secondary); margin-right: 0.5rem;">Estado:</strong> 
                                    <span class="badge ${socio.estado === 'Activo' || socio.estado === 'activo' ? 'badge-active' : 'badge-inactive'}">
                                        ${socio.estado || 'Activo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Aportaciones -->
                    <div class="info-section-glass" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--color-primary); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid rgba(56, 189, 248, 0.3); font-size: 1.125rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <span class="material-icons-round" style="font-size: 1.25rem;">payments</span>
                            4. Aportaciones y Obligaciones
                        </h3>
                        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: rgba(255, 255, 255, 0.02); border-radius: 8px;">
                            <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8;">euro</span>
                            <div><strong style="color: var(--text-secondary); margin-right: 0.5rem;">Cuota mensual:</strong><span style="color: var(--text-primary); font-size: 1.125rem; font-weight: 600;">${window.formatCurrency ? window.formatCurrency(socio.cuotaMensual || 0) : (socio.cuotaMensual || 0) + ' €'}</span></div>
                        </div>
                    </div>

                    <!-- Autorizaciones -->
                    ${socio.consentimientoDatos || socio.aceptacionNormas ? `
                    <div class="info-section-glass" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--color-primary); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid rgba(56, 189, 248, 0.3); font-size: 1.125rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <span class="material-icons-round" style="font-size: 1.25rem;">verified</span>
                            5. Autorizaciones Legales
                        </h3>
                        <div style="display: grid; gap: 0.875rem;">
                            ${socio.consentimientoDatos ? `
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2);">
                                <span class="material-icons-round" style="color: #10b981; font-size: 1.25rem;">check_circle</span>
                                <div style="color: var(--text-primary); font-weight: 500;">Consentimiento para uso interno de datos</div>
                            </div>
                            ` : ''}
                            ${socio.aceptacionNormas ? `
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.2);">
                                <span class="material-icons-round" style="color: #10b981; font-size: 1.25rem;">check_circle</span>
                                <div style="color: var(--text-primary); font-weight: 500;">Aceptación de normas internas</div>
                            </div>
                            ` : ''}
                            ${socio.fechaConsentimiento ? `
                            <div style="padding: 0.875rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                                <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Fecha de consentimiento</div>
                                <div style="color: var(--text-primary);">${formatDate(socio.fechaConsentimiento)}</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}

                    <!-- Participación -->
                    ${socio.areasColaboracion || socio.disponibilidadHoras ? `
                    <div class="info-section-glass" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--color-primary); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid rgba(56, 189, 248, 0.3); font-size: 1.125rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <span class="material-icons-round" style="font-size: 1.25rem;">volunteer_activism</span>
                            6. Participación y Disponibilidad
                        </h3>
                        <div style="display: grid; gap: 1.25rem;">
                            ${socio.areasColaboracion && socio.areasColaboracion.length > 0 ? `
                            <div>
                                <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.75rem;">Áreas de colaboración</div>
                                <div style="display: flex; flex-wrap: wrap; gap: 0.625rem;">
                                    ${socio.areasColaboracion.map(area => {
                const areaNames = {
                    'administracion': 'Administración',
                    'eventos': 'Eventos',
                    'apoyo_social': 'Apoyo Social',
                    'comunicacion': 'Comunicación',
                    'finanzas': 'Finanzas',
                    'proyectos': 'Proyectos'
                };
                return `<span style="background: rgba(56, 189, 248, 0.15); color: var(--color-primary); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 500; border: 1px solid rgba(56, 189, 248, 0.3);">${areaNames[area] || area}</span>`;
            }).join('')}
                                </div>
                            </div>
                            ` : ''}
                            ${socio.otrasAreas ? `
                            <div style="display: flex; align-items: start; gap: 0.75rem; padding: 0.875rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                                <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8; margin-top: 2px;">add_circle</span>
                                <div style="flex: 1;">
                                    <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Otras áreas</div>
                                    <div style="color: var(--text-primary); font-weight: 500;">${escapeHtml(socio.otrasAreas)}</div>
                                </div>
                            </div>
                            ` : ''}
                            ${socio.disponibilidadHoras ? `
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                                <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8;">schedule</span>
                                <div><strong style="color: var(--text-secondary); margin-right: 0.5rem;">Disponibilidad:</strong><span style="color: var(--text-primary); font-weight: 600;">${socio.disponibilidadHoras} horas/mes</span></div>
                            </div>
                            ` : ''}
                            ${socio.observaciones ? `
                                <div style="margin-top: 0.5rem; padding: 1.25rem; background: rgba(56, 189, 248, 0.08); border-radius: 12px; border: 1px solid rgba(56, 189, 248, 0.2); border-left: 4px solid var(--color-primary);">
                                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                                        <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary);">note</span>
                                        <p style="margin: 0; font-weight: 600; color: var(--color-primary);">Observaciones</p>
                                    </div>
                                    <p style="margin: 0; white-space: pre-wrap; color: var(--text-primary); line-height: 1.6;">${escapeHtml(socio.observaciones)}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
            `;

            // Agregar información de miembros de la familia - Diseño Moderno
            let miembrosHtml = '';
            
            // Verificar si hay miembros o si el primer miembro tiene datos (socio principal)
            const tieneMiembros = socio.miembros && socio.miembros.length > 0;
            const tieneDatosSocioPrincipal = socio.nombre || socio.apellido;
            
            // Si hay miembros en el array, mostrar todos
            if (tieneMiembros) {
                miembrosHtml = `
                    <div class="info-section-glass" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--color-primary); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid rgba(56, 189, 248, 0.3); font-size: 1.125rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <span class="material-icons-round" style="font-size: 1.25rem;">groups</span>
                            1. Identificación de los Integrantes de la Familia (${socio.miembros.length} ${socio.miembros.length === 1 ? 'miembro' : 'miembros'})
                        </h3>
                        <div style="display: grid; gap: 1.25rem;">
                `;

                socio.miembros.forEach((miembro, index) => {
                    // Verificar si el miembro tiene datos
                    const tieneDatos = miembro.nombreCompleto || miembro.tipoDocumento || miembro.numeroDocumento;
                    
                    if (tieneDatos) {
                        miembrosHtml += `
                            <div class="member-card-glass" style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 1.5rem; position: relative; overflow: hidden; transition: all 0.3s ease;">
                                <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.5), transparent);"></div>
                                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
                                    <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(56, 189, 248, 0.15); display: flex; align-items: center; justify-content: center; border: 2px solid rgba(56, 189, 248, 0.3);">
                                        <span class="material-icons-round" style="color: var(--color-primary); font-size: 1.25rem;">person</span>
                                    </div>
                                    <h4 style="margin: 0; color: var(--text-primary); font-size: 1.125rem; font-weight: 600;">Miembro ${index + 1}</h4>
                                </div>
                                <div style="display: grid; gap: 1rem;">
                                    ${miembro.nombreCompleto ? `
                                    <div style="display: flex; align-items: start; gap: 0.75rem; padding: 0.875rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                                        <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8; margin-top: 2px;">badge</span>
                                        <div style="flex: 1;">
                                            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Nombre completo</div>
                                            <div style="color: var(--text-primary); font-weight: 500;">${escapeHtml(miembro.nombreCompleto)}</div>
                                        </div>
                                    </div>
                                    ` : ''}
                                    ${miembro.tipoDocumento && miembro.numeroDocumento ? `
                                    <div style="display: flex; align-items: start; gap: 0.75rem; padding: 0.875rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                                        <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8; margin-top: 2px;">description</span>
                                        <div style="flex: 1;">
                                            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Documento</div>
                                            <div style="color: var(--text-primary); font-weight: 500;">${escapeHtml(miembro.tipoDocumento.toUpperCase())}: ${escapeHtml(miembro.numeroDocumento)}</div>
                                        </div>
                                    </div>
                                    ` : ''}
                                    ${miembro.fechaNacimiento ? `
                                    <div style="display: flex; align-items: start; gap: 0.75rem; padding: 0.875rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                                        <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8; margin-top: 2px;">cake</span>
                                        <div style="flex: 1;">
                                            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Fecha de nacimiento</div>
                                            <div style="color: var(--text-primary); font-weight: 500;">${formatDate(miembro.fechaNacimiento)}</div>
                                        </div>
                                    </div>
                                    ` : ''}
                                    ${miembro.nacionalidad ? `
                                    <div style="display: flex; align-items: start; gap: 0.75rem; padding: 0.875rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                                        <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8; margin-top: 2px;">public</span>
                                        <div style="flex: 1;">
                                            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Nacionalidad</div>
                                            <div style="color: var(--text-primary); font-weight: 500;">${escapeHtml(miembro.nacionalidad)}</div>
                                        </div>
                                    </div>
                                    ` : ''}
                                    ${miembro.domicilioActual ? `
                                    <div style="display: flex; align-items: start; gap: 0.75rem; padding: 0.875rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                                        <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8; margin-top: 2px;">home</span>
                                        <div style="flex: 1;">
                                            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Domicilio actual</div>
                                            <div style="color: var(--text-primary); font-weight: 500;">${escapeHtml(miembro.domicilioActual)}</div>
                                        </div>
                                    </div>
                                    ` : ''}
                                    ${miembro.profesion ? `
                                    <div style="display: flex; align-items: start; gap: 0.75rem; padding: 0.875rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                                        <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8; margin-top: 2px;">work</span>
                                        <div style="flex: 1;">
                                            <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Profesión</div>
                                            <div style="color: var(--text-primary); font-weight: 500;">${escapeHtml(miembro.profesion)}</div>
                                        </div>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }
                });

                // Si no hay miembros con datos, mostrar mensaje
                if (!miembrosHtml.includes('member-card-glass')) {
                    miembrosHtml += `
                        <div style="padding: 2rem; text-align: center; color: var(--text-tertiary);">
                            <span class="material-icons-round" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem; display: block;">person_off</span>
                            <p style="margin: 0;">No hay información de miembros registrada</p>
                        </div>
                    `;
                }

                miembrosHtml += `
                        </div>
                    </div>
                `;
            } else if (tieneDatosSocioPrincipal) {
                // Si no hay array de miembros pero hay datos del socio principal, mostrar como miembro 1
                miembrosHtml = `
                    <div class="info-section-glass" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--color-primary); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid rgba(56, 189, 248, 0.3); font-size: 1.125rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <span class="material-icons-round" style="font-size: 1.25rem;">person</span>
                            1. Información del Socio Principal
                        </h3>
                        <div class="member-card-glass" style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 1.5rem; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.5), transparent);"></div>
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
                                <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(56, 189, 248, 0.15); display: flex; align-items: center; justify-content: center; border: 2px solid rgba(56, 189, 248, 0.3);">
                                    <span class="material-icons-round" style="color: var(--color-primary); font-size: 1.25rem;">person</span>
                                </div>
                                <h4 style="margin: 0; color: var(--text-primary); font-size: 1.125rem; font-weight: 600;">${escapeHtml((socio.nombre || '') + ' ' + (socio.apellido || '')).trim() || 'Socio Principal'}</h4>
                            </div>
                            <div style="display: grid; gap: 1rem;">
                                ${socio.nombre || socio.apellido ? `
                                <div style="display: flex; align-items: start; gap: 0.75rem; padding: 0.875rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px;">
                                    <span class="material-icons-round" style="font-size: 1.125rem; color: var(--color-primary); opacity: 0.8; margin-top: 2px;">badge</span>
                                    <div style="flex: 1;">
                                        <div style="font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.25rem;">Nombre completo</div>
                                        <div style="color: var(--text-primary); font-weight: 500;">${escapeHtml((socio.nombre || '') + ' ' + (socio.apellido || '')).trim()}</div>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // No hay información de miembros
                miembrosHtml = `
                    <div class="info-section-glass" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 1.5rem;">
                        <h3 style="color: var(--color-primary); margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 2px solid rgba(56, 189, 248, 0.3); font-size: 1.125rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                            <span class="material-icons-round" style="font-size: 1.25rem;">groups</span>
                            1. Identificación de los Integrantes de la Familia
                        </h3>
                        <div style="padding: 2rem; text-align: center; color: var(--text-tertiary);">
                            <span class="material-icons-round" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem; display: block;">person_off</span>
                            <p style="margin: 0;">No hay información de miembros registrada</p>
                        </div>
                    </div>
                `;
            }

            html = miembrosHtml + html;

            content.innerHTML = html;
            
            // Mostrar modal removiendo clase hidden y forzando display
            modal.classList.remove('hidden');
            modal.style.setProperty('display', 'flex', 'important');
            modal.style.setProperty('visibility', 'visible', 'important');
            
            console.log('✅ Modal de detalles del socio abierto');
        } catch (error) {
            console.error('❌ Error al mostrar detalles del socio:', error);
            alert('Error al cargar los detalles del socio');
        }
    };

    /**
     * Cierra el modal de detalles del socio
     */
    window.closeSocioDetallesModal = function () {
        const modal = document.getElementById('socioDetallesModal');
        if (modal) {
            modal.style.setProperty('display', 'none', 'important');
            modal.classList.add('hidden');
            console.log('✅ Modal de detalles cerrado');
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
    window.openAddModal = function () {
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

            // Limpiar campo de observaciones
            const observacionesField = document.getElementById('modalObservaciones');
            if (observacionesField) {
                observacionesField.value = '';
            }

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

            // Mostrar modal removiendo clase hidden y forzando display
            socioModal.classList.remove('hidden');
            socioModal.style.setProperty('display', 'flex', 'important');
            socioModal.style.setProperty('visibility', 'visible', 'important');
            socioModal.style.setProperty('z-index', '10000', 'important');
            
            console.log('✅ Modal abierto correctamente');
        } catch (error) {
            console.error('❌ Error al abrir modal:', error);
            alert('Error al abrir el formulario: ' + error.message);
        }
    };

    /**
     * Abre el modal para editar un socio existente
     */
    window.openEditModal = async function (id) {
        try {
            console.log('✏️ openEditModal llamado con ID:', id);
            
            if (!id) {
                console.error('❌ ID de socio no proporcionado');
                alert('Error: ID de socio no válido');
                return;
            }
            
            // Reinicializar referencias del DOM si es necesario
            if (!socioModal || !modalTitle || !socioForm) {
                console.log('🔄 Reinicializando referencias del DOM...');
                initDOMReferences();
                if (!socioModal || !modalTitle || !socioForm) {
                    console.error('❌ Referencias del DOM no inicializadas después de initDOMReferences');
                    console.error('socioModal:', socioModal);
                    console.error('modalTitle:', modalTitle);
                    console.error('socioForm:', socioForm);
                    alert('Error: elementos del modal no encontrados. Por favor recarga la página.');
                    return;
                }
            }
            
            console.log('✅ Referencias del DOM verificadas');

            if (typeof window.getItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }

            const socio = await window.getItem('socios', id);
            console.log('📋 Datos del socio a editar:', socio);

            if (!socio) {
                alert('Socio no encontrado');
                return;
            }

            // Cargar datos básicos del socio - el modal solo tiene email, telefono y estado
            const emailInput = document.getElementById('modalEmail');
            const telefonoInput = document.getElementById('modalTelefono');
            const estadoInput = document.getElementById('modalEstado');

            if (emailInput) emailInput.value = socio.email || '';
            if (telefonoInput) telefonoInput.value = socio.telefono || '';
            if (estadoInput) estadoInput.value = socio.estado || 'Activo';

            // Cargar otros campos
            const contactoEmergencia = document.getElementById('modalContactoEmergencia');
            if (contactoEmergencia) contactoEmergencia.value = socio.contactoEmergencia || '';

            const fechaIngreso = document.getElementById('modalFechaIngreso');
            if (fechaIngreso) fechaIngreso.value = socio.fechaIngreso || '';

            const cuotaMensual = document.getElementById('modalCuotaMensual');
            if (cuotaMensual) cuotaMensual.value = socio.cuotaMensual || 0;

            const disponibilidadHoras = document.getElementById('modalDisponibilidadHoras');
            if (disponibilidadHoras) disponibilidadHoras.value = socio.disponibilidadHoras || 0;

            const otrasAreas = document.getElementById('modalOtrasAreas');
            if (otrasAreas) otrasAreas.value = socio.otrasAreas || '';

            const observacionesField = document.getElementById('modalObservaciones');
            if (observacionesField) observacionesField.value = socio.observaciones || '';

            // Cargar checkboxes de autorización
            const consentimientoDatos = document.getElementById('modalConsentimientoDatos');
            if (consentimientoDatos) consentimientoDatos.checked = socio.consentimientoDatos || false;

            const aceptacionNormas = document.getElementById('modalAceptacionNormas');
            if (aceptacionNormas) aceptacionNormas.checked = socio.aceptacionNormas || false;

            // Cargar áreas de colaboración
            const areasColaboracion = document.getElementById('modalAreasColaboracion');
            if (areasColaboracion && socio.areasColaboracion && Array.isArray(socio.areasColaboracion)) {
                // Limpiar selección previa
                Array.from(areasColaboracion.options).forEach(option => {
                    option.selected = false;
                });
                // Seleccionar las áreas del socio
                socio.areasColaboracion.forEach(area => {
                    const option = Array.from(areasColaboracion.options).find(opt => opt.value === area);
                    if (option) option.selected = true;
                });
            }

            // Cargar miembros de la familia
            if (socio.miembros && Array.isArray(socio.miembros) && socio.miembros.length > 0) {
                const numMiembrosInput = document.getElementById('modalNumMiembros');
                if (numMiembrosInput) {
                    numMiembrosInput.value = socio.miembros.length;
                    // Actualizar el contenedor de miembros
                    if (typeof updateModalMiembrosFamilia === 'function') {
                        updateModalMiembrosFamilia();
                    }
                }

                // Llenar los campos de miembros
                setTimeout(() => {
                    socio.miembros.forEach((miembro, index) => {
                        const nombreField = document.querySelector(`.modal-member-nombre[data-index="${index}"]`);
                        const tipoDocField = document.querySelector(`.modal-member-tipo-doc[data-index="${index}"]`);
                        const docNumField = document.querySelector(`.modal-member-doc-num[data-index="${index}"]`);
                        const fechaNacField = document.querySelector(`.modal-member-fecha-nac[data-index="${index}"]`);
                        const nacionalidadField = document.querySelector(`.modal-member-nacionalidad[data-index="${index}"]`);
                        const domicilioField = document.querySelector(`.modal-member-domicilio[data-index="${index}"]`);
                        const profesionField = document.querySelector(`.modal-member-profesion[data-index="${index}"]`);

                        if (nombreField) nombreField.value = miembro.nombreCompleto || '';
                        if (tipoDocField) tipoDocField.value = miembro.tipoDocumento || '';
                        if (docNumField) docNumField.value = miembro.numeroDocumento || '';
                        if (fechaNacField) fechaNacField.value = miembro.fechaNacimiento || '';
                        if (nacionalidadField) nacionalidadField.value = miembro.nacionalidad || '';
                        if (domicilioField) domicilioField.value = miembro.domicilioActual || '';
                        if (profesionField) profesionField.value = miembro.profesion || '';
                    });
                }, 100);
            }

            currentEditId = id;
            if (modalTitle) modalTitle.textContent = 'Editar Socio';

            if (submitSocioBtn) {
                submitSocioBtn.textContent = 'Actualizar';
            }

            // Mostrar modal removiendo clase hidden y forzando display
            socioModal.classList.remove('hidden');
            socioModal.style.setProperty('display', 'flex', 'important');
            socioModal.style.setProperty('visibility', 'visible', 'important');
            socioModal.style.setProperty('z-index', '10000', 'important');
            
            console.log('✅ Modal de edición abierto');
        } catch (error) {
            console.error('❌ Error al abrir modal de edición:', error);
            console.error('Stack:', error.stack);
            alert('Error al cargar los datos del socio: ' + error.message);
        }
    };

    /**
     * Cierra el modal
     */
    window.closeModal = function () {
        if (!socioModal) {
            initDOMReferences();
        }
        if (socioModal) {
            socioModal.style.setProperty('display', 'none', 'important');
            socioModal.classList.add('hidden');
            currentEditId = null;
            console.log('✅ Modal cerrado');
        }
    };

    // ============================================
    // FORM HANDLING
    // ============================================

    /**
     * Maneja el envío del formulario (agregar o editar)
     */
    window.handleSubmitForm = async function (event) {
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
            const observaciones = document.getElementById('modalObservaciones')?.value.trim() || '';

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

                // Observaciones
                observaciones: observaciones,

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
    window.handleDeleteSocio = async function (id) {
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
        document.addEventListener('DOMContentLoaded', function () {
            initAccessControl();
            if (isAppAuthenticated()) {
                initUI().catch(error => {
                    console.error('❌ Error fatal en inicialización:', error);
                });
            }
        });
    } else {
        initAccessControl();
        if (isAppAuthenticated()) {
            initUI().catch(error => {
                console.error('❌ Error fatal en inicialización:', error);
            });
        }
    }

    console.log('✅ Módulo main.js cargado');

})();
