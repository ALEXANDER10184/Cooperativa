// ============================================
// ADMIN PANEL FUNCTIONS
// Versión sin módulos ES6 para compatibilidad
// ============================================

(function() {
    'use strict';

    // Estado global
    let currentEditGastoId = null;
    let currentEditIngresoId = null;
    let currentEditPagoId = null;
    let currentSocioIdForPagos = null;

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Escapa HTML para prevenir XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
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

    // ============================================
    // TAB NAVIGATION
    // ============================================

    /**
     * Cambia entre tabs principales (Socios / Administración)
     */
    window.switchTab = function(tab) {
        const sociosPanel = document.getElementById("panelSocios");
        const adminPanel = document.getElementById("panelAdmin");
        const tabSocios = document.getElementById("tabSocios");
        const tabAdmin = document.getElementById("tabAdmin");

        if (!sociosPanel || !adminPanel || !tabSocios || !tabAdmin) {
            console.error("❌ Error: algún ID no existe en el DOM");
            return;
        }

        if (tab === "socios") {
            sociosPanel.classList.remove("hidden");
            sociosPanel.classList.add("active");
            adminPanel.classList.add("hidden");
            adminPanel.classList.remove("active");
            tabSocios.classList.add("active");
            tabAdmin.classList.remove("active");
        }

        if (tab === "admin") {
            adminPanel.classList.remove("hidden");
            adminPanel.classList.add("active");
            sociosPanel.classList.add("hidden");
            sociosPanel.classList.remove("active");
            tabAdmin.classList.add("active");
            tabSocios.classList.remove("active");
            
            try {
                // Renderizar tablas según el sub-tab activo
                const activeSubTab = document.querySelector('.sub-tab-content.active');
                if (activeSubTab && activeSubTab.id) {
                    const subTabName = activeSubTab.id.replace('Tab', '');
                    if (subTabName === 'gastos' && typeof window.renderGastosTable === 'function') {
                        window.renderGastosTable();
                    } else if (subTabName === 'ingresos' && typeof window.renderIngresosTable === 'function') {
                        window.renderIngresosTable();
                    } else if (subTabName === 'pagos') {
                        if (typeof window.loadSociosSelector === 'function') {
                            window.loadSociosSelector();
                        }
                        if (typeof window.renderPagosTable === 'function') {
                            window.renderPagosTable();
                        }
                    } else if (subTabName === 'socios' && typeof window.renderAdminSociosTable === 'function') {
                        window.renderAdminSociosTable();
                    }
                } else {
                // Si no hay sub-tab activo, activar gastos por defecto
                const defaultTab = 'gastos';
                window.switchAdminTab(defaultTab);
                }
                
                // Siempre cargar selector de socios (necesario para pagos)
                if (typeof window.loadSociosSelector === 'function') {
                    window.loadSociosSelector();
                }
            } catch (error) {
                console.error("❌ Error al renderizar tablas:", error);
            }
        }
    };

    window.switchMainTab = function(tabName) {
        if (tabName === 'socios') {
            window.switchTab('socios');
        } else if (tabName === 'administracion' || tabName === 'admin') {
            window.switchTab('admin');
        }
    };

    /**
     * Cambia entre sub-tabs de administración
     */
    window.switchAdminTab = function(subTabName) {
        document.querySelectorAll('.sub-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelectorAll('.sub-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const content = document.getElementById(`${subTabName}Tab`);
        if (content) {
            content.classList.add('active');
        }

        const btn = document.getElementById(`subTab${subTabName.charAt(0).toUpperCase() + subTabName.slice(1)}`);
        if (btn) {
            btn.classList.add('active');
        }

        // Renderizar contenido según el tab seleccionado
        if (subTabName === 'pagos') {
            if (typeof window.loadSociosSelector === 'function') {
                window.loadSociosSelector();
            }
            if (typeof window.renderPagosTable === 'function') {
                window.renderPagosTable();
            }
        } else if (subTabName === 'socios') {
            console.log('📋 Renderizando tabla de administración de socios...');
            if (typeof window.renderAdminSociosTable === 'function') {
                window.renderAdminSociosTable();
            } else {
                console.error('❌ renderAdminSociosTable no está disponible');
            }
        } else if (subTabName === 'gastos') {
            if (typeof window.renderGastosTable === 'function') {
                window.renderGastosTable();
            }
        } else if (subTabName === 'ingresos') {
            if (typeof window.renderIngresosTable === 'function') {
                window.renderIngresosTable();
            }
        }
    };

    // ============================================
    // GASTOS MANAGEMENT
    // ============================================

    window.renderGastosTable = function() {
        try {
            if (typeof window.getAll !== 'function') {
                console.error('getAll no está disponible');
                return;
            }
            
            const gastos = window.getAll('gastos');
            const tbody = document.getElementById('gastosTableBody');
            
            if (!tbody) return;

            tbody.innerHTML = '';

            if (gastos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-state">
                            <div class="empty-state-icon">💰</div>
                            <p>No hay gastos registrados</p>
                        </td>
                    </tr>
                `;
                return;
            }

            gastos.forEach(gasto => {
                const row = document.createElement('tr');
                const fecha = new Date(gasto.fecha).toLocaleDateString('es-ES');
                
                row.innerHTML = `
                    <td>${fecha}</td>
                    <td>${escapeHtml(gasto.concepto || '')}</td>
                    <td style="font-weight: 600; color: #ef4444;">€${parseFloat(gasto.monto || 0).toFixed(2)}</td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon btn-icon-edit edit-gasto-btn" data-id="${gasto.id}" title="Editar">
                                <span class="material-icons-round">edit</span>
                            </button>
                            <button class="btn-icon btn-icon-delete delete-gasto-btn" data-id="${gasto.id}" title="Eliminar">
                                <span class="material-icons-round">delete</span>
                            </button>
                        </div>
                    </td>
                `;
                
                const editBtn = row.querySelector('.edit-gasto-btn');
                const deleteBtn = row.querySelector('.delete-gasto-btn');
                
                if (editBtn) {
                    editBtn.addEventListener('click', () => window.openEditGastoModal(gasto.id));
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => window.handleDeleteGasto(gasto.id));
                }
                
                tbody.appendChild(row);
            });

            console.log(`✅ Tabla de gastos renderizada con ${gastos.length} registros`);
        } catch (error) {
            console.error('❌ Error al renderizar tabla de gastos:', error);
        }
    };

    window.openAddGastoModal = function() {
        currentEditGastoId = null;
        const modal = document.getElementById('gastoModal');
        const form = document.getElementById('gastoForm');
        const title = document.getElementById('gastoModalTitle');

        if (!modal || !form || !title) {
            console.error('❌ Elementos del modal de gasto no encontrados');
            return;
        }

        form.reset();
        const fechaInput = document.getElementById('gastoFecha');
        if (fechaInput) {
            const today = new Date().toISOString().split('T')[0];
            fechaInput.value = today;
        }
        title.textContent = 'Agregar Gasto';
        modal.classList.remove('hidden');
    };

    window.openEditGastoModal = function(id) {
        try {
            if (typeof window.getItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const gasto = window.getItem('gastos', id);
            if (!gasto) {
                alert('Gasto no encontrado');
                return;
            }

            currentEditGastoId = id;
            const modal = document.getElementById('gastoModal');
            const form = document.getElementById('gastoForm');
            const title = document.getElementById('gastoModalTitle');

            if (!modal || !form || !title) return;

            document.getElementById('gastoFecha').value = gasto.fecha || '';
            document.getElementById('gastoConcepto').value = gasto.concepto || '';
            document.getElementById('gastoMonto').value = gasto.monto || '';

            title.textContent = 'Editar Gasto';
            modal.classList.remove('hidden');
        } catch (error) {
            console.error('❌ Error al abrir modal de edición de gasto:', error);
            alert('Error al cargar los datos del gasto');
        }
    };

    window.closeGastoModal = function() {
        const modal = document.getElementById('gastoModal');
        if (modal) {
            modal.classList.add('hidden');
            currentEditGastoId = null;
        }
    };

    window.handleSubmitGasto = function(event) {
        event.preventDefault();

        try {
            const fecha = document.getElementById('gastoFecha').value;
            const concepto = document.getElementById('gastoConcepto').value.trim();
            const monto = parseFloat(document.getElementById('gastoMonto').value);

            if (!fecha || !concepto || !monto || monto <= 0) {
                alert('Por favor completa todos los campos correctamente');
                return;
            }

            const gastoData = {
                fecha,
                concepto,
                monto
            };

            if (typeof window.updateItem !== 'function' || typeof window.addItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }

            if (currentEditGastoId) {
                window.updateItem('gastos', currentEditGastoId, gastoData);
            } else {
                window.addItem('gastos', gastoData);
            }

            window.closeGastoModal();
            window.renderGastosTable();
            
            // Actualizar balance
            if (typeof window.updateBalanceDisplay === 'function') {
                window.updateBalanceDisplay();
            }
            
            showNotification(
                currentEditGastoId ? 'Gasto actualizado exitosamente' : 'Gasto agregado exitosamente',
                'success'
            );
        } catch (error) {
            console.error('❌ Error al guardar gasto:', error);
            alert('Error al guardar el gasto. Por favor, intenta nuevamente.');
        }
    };

    window.handleDeleteGasto = function(id) {
        try {
            if (typeof window.getItem !== 'function' || typeof window.deleteItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const gasto = window.getItem('gastos', id);
            if (!gasto) {
                alert('Gasto no encontrado');
                return;
            }

            if (!confirm(`¿Estás seguro de eliminar el gasto "${gasto.concepto}"?`)) {
                return;
            }

            window.deleteItem('gastos', id);
            window.renderGastosTable();
            
            // Actualizar balance
            if (typeof window.updateBalanceDisplay === 'function') {
                window.updateBalanceDisplay();
            }
            
            showNotification('Gasto eliminado exitosamente', 'success');
        } catch (error) {
            console.error('❌ Error al eliminar gasto:', error);
            alert('Error al eliminar el gasto. Por favor, intenta nuevamente.');
        }
    };

    // ============================================
    // INGRESOS MANAGEMENT
    // ============================================

    window.renderIngresosTable = function() {
        try {
            if (typeof window.getAll !== 'function') {
                console.error('getAll no está disponible');
                return;
            }
            
            const ingresos = window.getAll('ingresos');
            const tbody = document.getElementById('ingresosTableBody');
            
            if (!tbody) return;

            tbody.innerHTML = '';

            if (ingresos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-state">
                            <div class="empty-state-icon">💵</div>
                            <p>No hay ingresos registrados</p>
                        </td>
                    </tr>
                `;
                return;
            }

            ingresos.forEach(ingreso => {
                const row = document.createElement('tr');
                const fecha = new Date(ingreso.fecha).toLocaleDateString('es-ES');
                
                row.innerHTML = `
                    <td>${fecha}</td>
                    <td>${escapeHtml(ingreso.concepto || '')}</td>
                    <td style="font-weight: 600; color: #10b981;">€${parseFloat(ingreso.monto || 0).toFixed(2)}</td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon btn-icon-edit edit-ingreso-btn" data-id="${ingreso.id}" title="Editar">
                                <span class="material-icons-round">edit</span>
                            </button>
                            <button class="btn-icon btn-icon-delete delete-ingreso-btn" data-id="${ingreso.id}" title="Eliminar">
                                <span class="material-icons-round">delete</span>
                            </button>
                        </div>
                    </td>
                `;
                
                const editBtn = row.querySelector('.edit-ingreso-btn');
                const deleteBtn = row.querySelector('.delete-ingreso-btn');
                
                if (editBtn) {
                    editBtn.addEventListener('click', () => window.openEditIngresoModal(ingreso.id));
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => window.handleDeleteIngreso(ingreso.id));
                }
                
                tbody.appendChild(row);
            });

            console.log(`✅ Tabla de ingresos renderizada con ${ingresos.length} registros`);
        } catch (error) {
            console.error('❌ Error al renderizar tabla de ingresos:', error);
        }
    };

    window.openAddIngresoModal = function() {
        currentEditIngresoId = null;
        const modal = document.getElementById('ingresoModal');
        const form = document.getElementById('ingresoForm');
        const title = document.getElementById('ingresoModalTitle');

        if (!modal || !form || !title) {
            console.error('❌ Elementos del modal de ingreso no encontrados');
            return;
        }

        form.reset();
        const fechaInput = document.getElementById('ingresoFecha');
        if (fechaInput) {
            const today = new Date().toISOString().split('T')[0];
            fechaInput.value = today;
        }
        title.textContent = 'Agregar Ingreso';
        modal.classList.remove('hidden');
    };

    window.openEditIngresoModal = function(id) {
        try {
            if (typeof window.getItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const ingreso = window.getItem('ingresos', id);
            if (!ingreso) {
                alert('Ingreso no encontrado');
                return;
            }

            currentEditIngresoId = id;
            const modal = document.getElementById('ingresoModal');
            const form = document.getElementById('ingresoForm');
            const title = document.getElementById('ingresoModalTitle');

            if (!modal || !form || !title) return;

            document.getElementById('ingresoFecha').value = ingreso.fecha || '';
            document.getElementById('ingresoConcepto').value = ingreso.concepto || '';
            document.getElementById('ingresoMonto').value = ingreso.monto || '';

            title.textContent = 'Editar Ingreso';
            modal.classList.remove('hidden');
        } catch (error) {
            console.error('❌ Error al abrir modal de edición de ingreso:', error);
            alert('Error al cargar los datos del ingreso');
        }
    };

    window.closeIngresoModal = function() {
        const modal = document.getElementById('ingresoModal');
        if (modal) {
            modal.classList.add('hidden');
            currentEditIngresoId = null;
        }
    };

    window.handleSubmitIngreso = function(event) {
        event.preventDefault();

        try {
            const fecha = document.getElementById('ingresoFecha').value;
            const concepto = document.getElementById('ingresoConcepto').value.trim();
            const monto = parseFloat(document.getElementById('ingresoMonto').value);

            if (!fecha || !concepto || !monto || monto <= 0) {
                alert('Por favor completa todos los campos correctamente');
                return;
            }

            const ingresoData = {
                fecha,
                concepto,
                monto
            };

            if (typeof window.updateItem !== 'function' || typeof window.addItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }

            if (currentEditIngresoId) {
                window.updateItem('ingresos', currentEditIngresoId, ingresoData);
            } else {
                window.addItem('ingresos', ingresoData);
            }

            window.closeIngresoModal();
            window.renderIngresosTable();
            showNotification(
                currentEditIngresoId ? 'Ingreso actualizado exitosamente' : 'Ingreso agregado exitosamente',
                'success'
            );
        } catch (error) {
            console.error('❌ Error al guardar ingreso:', error);
            alert('Error al guardar el ingreso. Por favor, intenta nuevamente.');
        }
    };

    window.handleDeleteIngreso = function(id) {
        try {
            if (typeof window.getItem !== 'function' || typeof window.deleteItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const ingreso = window.getItem('ingresos', id);
            if (!ingreso) {
                alert('Ingreso no encontrado');
                return;
            }

            if (!confirm(`¿Estás seguro de eliminar el ingreso "${ingreso.concepto}"?`)) {
                return;
            }

            window.deleteItem('ingresos', id);
            window.renderIngresosTable();
            
            // Actualizar balance
            if (typeof window.updateBalanceDisplay === 'function') {
                window.updateBalanceDisplay();
            }
            
            showNotification('Ingreso eliminado exitosamente', 'success');
        } catch (error) {
            console.error('❌ Error al eliminar ingreso:', error);
            alert('Error al eliminar el ingreso. Por favor, intenta nuevamente.');
        }
    };

    // ============================================
    // PAGOS MANAGEMENT
    // ============================================

    window.loadSociosSelector = function() {
        try {
            if (typeof window.getAll !== 'function') {
                console.error('getAll no está disponible');
                return;
            }
            
            const socios = window.getAll('socios');
            const selector = document.getElementById('socioSelector');
            const pagoSelector = document.getElementById('pagoSocioId');

            if (!selector && !pagoSelector) return;

            const options = '<option value="">-- Seleccione un socio --</option>' +
                socios.map(socio => 
                    `<option value="${socio.id}">${escapeHtml(socio.nombre || '')} ${escapeHtml(socio.apellido || '')}</option>`
                ).join('');

            if (selector) {
                selector.innerHTML = options;
            }

            if (pagoSelector) {
                pagoSelector.innerHTML = options;
            }

            console.log(`✅ Selector de socios cargado con ${socios.length} socios`);
        } catch (error) {
            console.error('❌ Error al cargar selector de socios:', error);
        }
    };

    window.renderPagosTable = function() {
        try {
            if (typeof window.getAll !== 'function' || typeof window.getItemsByField !== 'function') {
                console.error('Funciones de base de datos no disponibles');
                return;
            }
            
            const selector = document.getElementById('socioSelector');
            const tbody = document.getElementById('pagosTableBody');
            
            if (!selector || !tbody) return;

            const socioId = selector.value;
            currentSocioIdForPagos = socioId;

            tbody.innerHTML = '';

            if (!socioId) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-state">
                            <div class="empty-state-icon">💳</div>
                            <p>Seleccione un socio para ver sus pagos</p>
                        </td>
                    </tr>
                `;
                return;
            }

            const pagos = window.getItemsByField('pagos', 'socioId', socioId);

            if (pagos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-state">
                            <div class="empty-state-icon">💳</div>
                            <p>No hay pagos registrados para este socio</p>
                        </td>
                    </tr>
                `;
                return;
            }

            pagos.forEach(pago => {
                const row = document.createElement('tr');
                const fecha = new Date(pago.fecha).toLocaleDateString('es-ES');
                
                row.innerHTML = `
                    <td>${fecha}</td>
                    <td style="font-weight: 600; color: #10b981;">€${parseFloat(pago.monto || 0).toFixed(2)}</td>
                    <td>${escapeHtml(pago.concepto || '')}</td>
                    <td>
                        <div class="actions">
                            <button class="btn-icon btn-icon-edit edit-pago-btn" data-id="${pago.id}" title="Editar">
                                <span class="material-icons-round">edit</span>
                            </button>
                            <button class="btn-icon btn-icon-delete delete-pago-btn" data-id="${pago.id}" title="Eliminar">
                                <span class="material-icons-round">delete</span>
                            </button>
                        </div>
                    </td>
                `;
                
                const editBtn = row.querySelector('.edit-pago-btn');
                const deleteBtn = row.querySelector('.delete-pago-btn');
                
                if (editBtn) {
                    editBtn.addEventListener('click', () => window.openEditPagoModal(pago.id));
                }
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => window.handleDeletePago(pago.id));
                }
                
                tbody.appendChild(row);
            });

            console.log(`✅ Tabla de pagos renderizada con ${pagos.length} registros`);
        } catch (error) {
            console.error('❌ Error al renderizar tabla de pagos:', error);
        }
    };

    window.openAddPagoModal = function() {
        currentEditPagoId = null;
        const modal = document.getElementById('pagoModal');
        const form = document.getElementById('pagoForm');
        const title = document.getElementById('pagoModalTitle');

        if (!modal || !form || !title) {
            console.error('❌ Elementos del modal de pago no encontrados');
            return;
        }

        form.reset();
        if (typeof window.loadSociosSelector === 'function') {
            window.loadSociosSelector();
        }
        
        const selector = document.getElementById('socioSelector');
        const pagoSocioId = document.getElementById('pagoSocioId');
        if (selector && selector.value && pagoSocioId) {
            pagoSocioId.value = selector.value;
        }

        const fechaInput = document.getElementById('pagoFecha');
        if (fechaInput) {
            const today = new Date().toISOString().split('T')[0];
            fechaInput.value = today;
        }
        
        title.textContent = 'Registrar Pago';
        modal.classList.remove('hidden');
    };

    window.openEditPagoModal = function(id) {
        try {
            if (typeof window.getItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const pago = window.getItem('pagos', id);
            if (!pago) {
                alert('Pago no encontrado');
                return;
            }

            currentEditPagoId = id;
            const modal = document.getElementById('pagoModal');
            const form = document.getElementById('pagoForm');
            const title = document.getElementById('pagoModalTitle');

            if (!modal || !form || !title) return;

            if (typeof window.loadSociosSelector === 'function') {
                window.loadSociosSelector();
            }
            document.getElementById('pagoSocioId').value = pago.socioId || '';
            document.getElementById('pagoFecha').value = pago.fecha || '';
            document.getElementById('pagoMonto').value = pago.monto || '';
            document.getElementById('pagoConcepto').value = pago.concepto || '';

            title.textContent = 'Editar Pago';
            modal.classList.remove('hidden');
        } catch (error) {
            console.error('❌ Error al abrir modal de edición de pago:', error);
            alert('Error al cargar los datos del pago');
        }
    };

    window.closePagoModal = function() {
        const modal = document.getElementById('pagoModal');
        if (modal) {
            modal.classList.add('hidden');
            currentEditPagoId = null;
        }
    };

    window.handleSubmitPago = function(event) {
        event.preventDefault();

        try {
            const socioId = document.getElementById('pagoSocioId').value;
            const fecha = document.getElementById('pagoFecha').value;
            const monto = parseFloat(document.getElementById('pagoMonto').value);
            const concepto = document.getElementById('pagoConcepto').value.trim();

            if (!socioId || !fecha || !monto || monto <= 0 || !concepto) {
                alert('Por favor completa todos los campos correctamente');
                return;
            }

            const pagoData = {
                socioId,
                fecha,
                monto,
                concepto
            };

            if (typeof window.updateItem !== 'function' || typeof window.addItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }

            if (currentEditPagoId) {
                window.updateItem('pagos', currentEditPagoId, pagoData);
            } else {
                // Agregar pago
                const pagoCreado = window.addItem('pagos', pagoData);
                
                // Crear ingreso automáticamente cuando se registra un pago nuevo
                const socio = window.getItem('socios', socioId);
                const nombreSocio = socio ? `${socio.nombre} ${socio.apellido}` : 'Socio';
                
                const ingresoData = {
                    fecha: fecha,
                    concepto: `Pago de ${nombreSocio} - ${concepto}`,
                    monto: monto,
                    origen: 'pago_socio',
                    pagoId: pagoCreado.id // Referencia al pago original usando el ID del pago creado
                };
                
                window.addItem('ingresos', ingresoData);
                console.log('✅ Ingreso creado automáticamente desde pago');
            }

            window.closePagoModal();
            window.renderPagosTable();
            
            // Actualizar tabla de ingresos si está visible (se creó un ingreso automático)
            if (typeof window.renderIngresosTable === 'function') {
                window.renderIngresosTable();
            }
            
            // Actualizar balance inmediatamente (importante: pagos se suman a ingresos)
            if (typeof window.updateBalanceDisplay === 'function') {
                window.updateBalanceDisplay();
            }
            
            showNotification(
                currentEditPagoId ? 'Pago actualizado exitosamente' : 'Pago registrado exitosamente. Ingreso creado automáticamente.',
                'success'
            );
        } catch (error) {
            console.error('❌ Error al guardar pago:', error);
            alert('Error al guardar el pago. Por favor, intenta nuevamente.');
        }
    };

    window.handleDeletePago = function(id) {
        try {
            if (typeof window.getItem !== 'function' || typeof window.deleteItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const pago = window.getItem('pagos', id);
            if (!pago) {
                alert('Pago no encontrado');
                return;
            }

            if (!confirm(`¿Estás seguro de eliminar este pago?`)) {
                return;
            }

            // Si el pago tenía un ingreso asociado, eliminarlo también
            const ingresos = window.getAll('ingresos');
            const ingresoRelacionado = ingresos.find(ing => ing.pagoId === id);
            if (ingresoRelacionado) {
                window.deleteItem('ingresos', ingresoRelacionado.id);
                console.log('✅ Ingreso relacionado eliminado');
            }
            
            window.deleteItem('pagos', id);
            window.renderPagosTable();
            
            // Actualizar tabla de ingresos (si se eliminó el ingreso relacionado)
            if (typeof window.renderIngresosTable === 'function') {
                window.renderIngresosTable();
            }
            
            // Actualizar balance inmediatamente (importante: pagos afectan ingresos totales)
            if (typeof window.updateBalanceDisplay === 'function') {
                window.updateBalanceDisplay();
            }
            
            showNotification('Pago eliminado exitosamente', 'success');
        } catch (error) {
            console.error('❌ Error al eliminar pago:', error);
            alert('Error al eliminar el pago. Por favor, intenta nuevamente.');
        }
    };

    console.log('✅ Módulo admin-panel.js cargado');

})();
