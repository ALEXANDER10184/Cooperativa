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
     * Ahora es async
 */
    window.switchTab = async function(tab) {
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
        
            // Renderizar tabla de socios
            if (typeof renderSociosTable === 'function') {
                renderSociosTable();
            }
            
            // Generar QR cuando se cambia al tab de Socios
            setTimeout(function() {
                if (typeof window.generateQRCode === 'function') {
                    window.generateQRCode();
                }
            }, 100);
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
                        await window.renderGastosTable();
                    } else if (subTabName === 'ingresos' && typeof window.renderIngresosTable === 'function') {
                        await window.renderIngresosTable();
                    } else if (subTabName === 'socios' && typeof window.renderAdminSociosTable === 'function') {
                        await window.renderAdminSociosTable();
                    }
                } else {
                // Si no hay sub-tab activo, activar gastos por defecto
                const defaultTab = 'gastos';
                await window.switchAdminTab(defaultTab);
                }
            } catch (error) {
                console.error("❌ Error al renderizar tablas:", error);
            }
        }
    };

    window.switchMainTab = async function(tabName) {
    if (tabName === 'socios') {
            await window.switchTab('socios');
    } else if (tabName === 'administracion' || tabName === 'admin') {
            await window.switchTab('admin');
    }
    };

/**
 * Cambia entre sub-tabs de administración
 */
    window.switchAdminTab = async function(subTabName) {
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
        if (subTabName === 'socios') {
            console.log('📋 Renderizando tabla de administración de socios...');
            if (typeof window.renderAdminSociosTable === 'function') {
                await window.renderAdminSociosTable();
            } else {
                console.error('❌ renderAdminSociosTable no está disponible');
            }
        } else if (subTabName === 'gastos') {
            if (typeof window.renderGastosTable === 'function') {
                await window.renderGastosTable();
            }
        } else if (subTabName === 'ingresos') {
            if (typeof window.renderIngresosTable === 'function') {
                await window.renderIngresosTable();
            }
        } else if (subTabName === 'aportes') {
            if (typeof window.renderAportesTable === 'function') {
                await window.renderAportesTable();
            }
            if (typeof window.loadMesAporteSelector === 'function') {
                await window.loadMesAporteSelector();
            }
        }
    };

// ============================================
// GASTOS MANAGEMENT
// ============================================

    window.renderGastosTable = async function() {
        try {
            if (typeof window.getAll !== 'function') {
                console.error('getAll no está disponible');
                return;
            }
            
            const gastos = await window.getAll('gastos');
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

    window.openEditGastoModal = async function(id) {
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

    window.handleSubmitGasto = async function(event) {
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
                await window.updateItem('gastos', currentEditGastoId, gastoData);
        } else {
                await window.addItem('gastos', gastoData);
            }

            window.closeGastoModal();
            await window.renderGastosTable();
            
            // Actualizar balance
            if (typeof window.updateBalanceDisplay === 'function') {
                await window.updateBalanceDisplay();
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

    window.handleDeleteGasto = async function(id) {
        try {
            if (typeof window.getItem !== 'function' || typeof window.deleteItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const gasto = await window.getItem('gastos', id);
        if (!gasto) {
            alert('Gasto no encontrado');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar el gasto "${gasto.concepto}"?`)) {
            return;
        }

            await window.deleteItem('gastos', id);
            await window.renderGastosTable();
            
            // Actualizar balance
            if (typeof window.updateBalanceDisplay === 'function') {
                await window.updateBalanceDisplay();
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

    window.renderIngresosTable = async function() {
        try {
            if (typeof window.getAll !== 'function') {
                console.error('getAll no está disponible');
                return;
            }
            
            const ingresos = await window.getAll('ingresos');
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

    window.openAddIngresoModal = async function() {
    currentEditIngresoId = null;
    const modal = document.getElementById('ingresoModal');
    const form = document.getElementById('ingresoForm');
    const title = document.getElementById('ingresoModalTitle');

    if (!modal || !form || !title) {
        console.error('❌ Elementos del modal de ingreso no encontrados');
        return;
    }

    form.reset();
        
        // Cargar selector de socios
        if (typeof window.loadSociosSelector === 'function') {
            await window.loadSociosSelector();
        }
        
        // Llenar selector de socios en el modal de ingreso
        const socios = await window.getAll('socios');
        const socioSelector = document.getElementById('ingresoSocioId');
        if (socioSelector) {
            socioSelector.innerHTML = '<option value="">-- Seleccione un socio --</option>';
            socios.forEach(socio => {
                if (socio.estado === 'Activo' || socio.estado === 'activo') {
                    const option = document.createElement('option');
                    option.value = socio.id;
                    option.textContent = `${socio.nombre || ''} ${socio.apellido || ''} - Cuota: €${(socio.cuotaMensual || 0).toFixed(2)}`;
                    option.setAttribute('data-cuota', socio.cuotaMensual || 0);
                    socioSelector.appendChild(option);
                }
            });
        }
        
        // Ocultar selector de socio por defecto
        const socioGroup = document.getElementById('ingresoSocioGroup');
        if (socioGroup) {
            socioGroup.style.display = 'none';
        }
        
        // Establecer tipo por defecto
        const tipoInput = document.getElementById('ingresoTipo');
        if (tipoInput) {
            tipoInput.value = 'otro';
        }
        
    const fechaInput = document.getElementById('ingresoFecha');
    if (fechaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;
    }
    title.textContent = 'Agregar Ingreso';
    modal.classList.remove('hidden');
    };

    window.openEditIngresoModal = async function(id) {
        try {
            if (typeof window.getItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const ingreso = await window.getItem('ingresos', id);
        if (!ingreso) {
            alert('Ingreso no encontrado');
            return;
        }

        currentEditIngresoId = id;
        const modal = document.getElementById('ingresoModal');
        const form = document.getElementById('ingresoForm');
        const title = document.getElementById('ingresoModalTitle');

        if (!modal || !form || !title) return;

            // Cargar selector de socios
            const socios = await window.getAll('socios');
            const socioSelector = document.getElementById('ingresoSocioId');
            if (socioSelector) {
                socioSelector.innerHTML = '<option value="">-- Seleccione un socio --</option>';
                socios.forEach(socio => {
                    if (socio.estado === 'Activo' || socio.estado === 'activo') {
                        const option = document.createElement('option');
                        option.value = socio.id;
                        option.textContent = `${socio.nombre || ''} ${socio.apellido || ''} - Cuota: €${(socio.cuotaMensual || 0).toFixed(2)}`;
                        option.setAttribute('data-cuota', socio.cuotaMensual || 0);
                        if (ingreso.socioId && ingreso.socioId === socio.id) {
                            option.selected = true;
                        }
                        socioSelector.appendChild(option);
                    }
                });
            }

            // Determinar tipo de ingreso
            const tipoInput = document.getElementById('ingresoTipo');
            const socioGroup = document.getElementById('ingresoSocioGroup');
            
            if (ingreso.origen === 'pago_socio' || ingreso.socioId || ingreso.tipo === 'aporte_socio') {
                if (tipoInput) tipoInput.value = 'aporte_socio';
                if (socioGroup) socioGroup.style.display = 'block';
                if (socioSelector && ingreso.socioId) {
                    socioSelector.value = ingreso.socioId;
                }
            } else {
                if (tipoInput) tipoInput.value = 'otro';
                if (socioGroup) socioGroup.style.display = 'none';
            }

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

    /**
     * Maneja el cambio de tipo de ingreso en el formulario
     */
    window.handleCambioTipoIngreso = function() {
        const tipoInput = document.getElementById('ingresoTipo');
        const socioGroup = document.getElementById('ingresoSocioGroup');
        const socioSelector = document.getElementById('ingresoSocioId');
        const conceptoInput = document.getElementById('ingresoConcepto');
        const montoInput = document.getElementById('ingresoMonto');
        
        if (!tipoInput || !socioGroup) return;
        
        if (tipoInput.value === 'aporte_socio') {
            socioGroup.style.display = 'block';
            socioSelector.required = true;
            
            // Limpiar campos cuando se cambia a aporte de socio
            if (conceptoInput) conceptoInput.value = '';
            if (montoInput) montoInput.value = '';
            
            // Si se selecciona un socio, actualizar concepto y monto
            if (socioSelector) {
                socioSelector.onchange = function() {
                    const selectedOption = socioSelector.options[socioSelector.selectedIndex];
                    if (selectedOption && selectedOption.value) {
                        const cuotaMensual = parseFloat(selectedOption.getAttribute('data-cuota') || 0);
                        const nombreSocio = selectedOption.textContent.split(' - ')[0];
                        
                        // Obtener mes actual
                        const fechaInput = document.getElementById('ingresoFecha');
                        let mesAno = '';
                        if (fechaInput && fechaInput.value) {
                            const fecha = new Date(fechaInput.value);
                            mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                        } else {
                            const fecha = new Date();
                            mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                        }
                        
                        const [ano, mes] = mesAno.split('-');
                        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        const nombreMes = meses[parseInt(mes) - 1];
                        
                        if (conceptoInput) {
                            conceptoInput.value = `Aporte mensual ${nombreMes} ${ano} - ${nombreSocio}`;
                        }
                        if (montoInput && cuotaMensual > 0) {
                            montoInput.value = cuotaMensual.toFixed(2);
                        }
                    }
                };
            }
        } else {
            socioGroup.style.display = 'none';
            socioSelector.required = false;
            if (socioSelector) {
                socioSelector.value = '';
            }
        }
    };

    window.handleSubmitIngreso = async function(event) {
    event.preventDefault();

    try {
        const fecha = document.getElementById('ingresoFecha').value;
        const concepto = document.getElementById('ingresoConcepto').value.trim();
        const monto = parseFloat(document.getElementById('ingresoMonto').value);

            const tipo = document.getElementById('ingresoTipo')?.value || 'otro';
            const socioId = document.getElementById('ingresoSocioId')?.value || '';

        if (!fecha || !concepto || !monto || monto <= 0) {
            alert('Por favor completa todos los campos correctamente');
            return;
        }

            if (tipo === 'aporte_socio' && !socioId) {
                alert('Por favor selecciona un socio');
                return;
            }

        const ingresoData = {
            fecha,
            concepto,
                monto,
                tipo: tipo,
                origen: tipo === 'aporte_socio' ? 'pago_socio' : 'otro'
            };

            // Si es aporte de socio, agregar referencia al socio
            if (tipo === 'aporte_socio' && socioId) {
                ingresoData.socioId = socioId;
            }

            if (typeof window.updateItem !== 'function' || typeof window.addItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }

        if (currentEditIngresoId) {
                await window.updateItem('ingresos', currentEditIngresoId, ingresoData);
        } else {
                const ingresoCreado = await window.addItem('ingresos', ingresoData);
                
                // Si es aporte de socio, verificar y marcar el aporte mensual correspondiente
                if (tipo === 'aporte_socio' && socioId && typeof window.verificarPagoComoAporte === 'function') {
                    await window.verificarPagoComoAporte(socioId, monto, fecha);
                    
                    // Actualizar tabla de aportes si está visible
                    const aportesTab = document.getElementById('aportesTab');
                    if (aportesTab && !aportesTab.classList.contains('hidden') && aportesTab.classList.contains('active')) {
                        if (typeof window.renderAportesTable === 'function') {
                            await window.renderAportesTable();
                        }
                    }
                }
            }

            window.closeIngresoModal();
            await window.renderIngresosTable();
            
            // Actualizar balance
            if (typeof window.updateBalanceDisplay === 'function') {
                await window.updateBalanceDisplay();
            }

        showNotification(
            currentEditIngresoId ? 'Ingreso actualizado exitosamente' : 'Ingreso agregado exitosamente',
            'success'
        );
    } catch (error) {
        console.error('❌ Error al guardar ingreso:', error);
        alert('Error al guardar el ingreso. Por favor, intenta nuevamente.');
    }
    };

    window.handleDeleteIngreso = async function(id) {
        try {
            if (typeof window.getItem !== 'function' || typeof window.deleteItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const ingreso = await window.getItem('ingresos', id);
        if (!ingreso) {
            alert('Ingreso no encontrado');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar el ingreso "${ingreso.concepto}"?`)) {
            return;
        }

            await window.deleteItem('ingresos', id);
            await window.renderIngresosTable();
            
            // Actualizar balance
            if (typeof window.updateBalanceDisplay === 'function') {
                await window.updateBalanceDisplay();
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

    window.loadSociosSelector = async function() {
        try {
            if (typeof window.getAll !== 'function') {
                console.error('getAll no está disponible');
                return;
            }
            
            const socios = await window.getAll('socios');
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

    window.renderPagosTable = async function() {
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

            const pagos = await window.getItemsByField('pagos', 'socioId', socioId);

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

    window.openAddPagoModal = async function() {
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
            await window.loadSociosSelector();
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

    window.openEditPagoModal = async function(id) {
        try {
            if (typeof window.getItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const pago = await window.getItem('pagos', id);
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
                        await window.loadSociosSelector();
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

    window.handleSubmitPago = async function(event) {
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
                await window.updateItem('pagos', currentEditPagoId, pagoData);
        } else {
                // Agregar pago
                const pagoCreado = await window.addItem('pagos', pagoData);
                
                // Crear ingreso automáticamente cuando se registra un pago nuevo
                const socio = await window.getItem('socios', socioId);
                const nombreSocio = socio ? `${socio.nombre} ${socio.apellido}` : 'Socio';
                
                const ingresoData = {
                    fecha: fecha,
                    concepto: `Pago de ${nombreSocio} - ${concepto}`,
                    monto: monto,
                    origen: 'pago_socio',
                    pagoId: pagoCreado.id // Referencia al pago original usando el ID del pago creado
                };
                
                await window.addItem('ingresos', ingresoData);
                console.log('✅ Ingreso creado automáticamente desde pago');
            }

            window.closePagoModal();
            
            // Verificar si este pago corresponde a un aporte mensual y marcarlo
            if (!currentEditPagoId && typeof window.verificarPagoComoAporte === 'function') {
                await window.verificarPagoComoAporte(socioId, monto, fecha);
            }
            
            await window.renderPagosTable();
            
            // Actualizar tabla de ingresos si está visible (se creó un ingreso automático)
            if (typeof window.renderIngresosTable === 'function') {
                await window.renderIngresosTable();
            }
            
            // Si estamos en el tab de aportes, recargar la tabla
            const aportesTab = document.getElementById('aportesTab');
            if (aportesTab && !aportesTab.classList.contains('hidden') && aportesTab.classList.contains('active')) {
                if (typeof window.renderAportesTable === 'function') {
                    await window.renderAportesTable();
                }
            }
            
            // Actualizar balance inmediatamente (importante: pagos se suman a ingresos)
            if (typeof window.updateBalanceDisplay === 'function') {
                await window.updateBalanceDisplay();
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

    window.handleDeletePago = async function(id) {
        try {
            if (typeof window.getItem !== 'function' || typeof window.deleteItem !== 'function') {
                alert('Error: funciones de base de datos no disponibles');
                return;
            }
            
            const pago = await window.getItem('pagos', id);
        if (!pago) {
            alert('Pago no encontrado');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar este pago?`)) {
            return;
        }

            // Si el pago tenía un ingreso asociado, eliminarlo también
            const ingresos = await window.getAll('ingresos');
            const ingresoRelacionado = ingresos.find(ing => ing.pagoId === id);
            if (ingresoRelacionado) {
                await window.deleteItem('ingresos', ingresoRelacionado.id);
                console.log('✅ Ingreso relacionado eliminado');
            }
            
            await window.deleteItem('pagos', id);
            await window.renderPagosTable();
            
            // Actualizar tabla de ingresos (si se eliminó el ingreso relacionado)
            if (typeof window.renderIngresosTable === 'function') {
                await window.renderIngresosTable();
            }
            
            // Actualizar balance inmediatamente (importante: pagos afectan ingresos totales)
            if (typeof window.updateBalanceDisplay === 'function') {
                await window.updateBalanceDisplay();
            }
            
        showNotification('Pago eliminado exitosamente', 'success');
    } catch (error) {
        console.error('❌ Error al eliminar pago:', error);
        alert('Error al eliminar el pago. Por favor, intenta nuevamente.');
    }
    };

// ============================================
    // APORTES MENSUALES MANAGEMENT
// ============================================

/**
     * Carga el selector de mes/año para aportes
     */
    window.loadMesAporteSelector = async function() {
        try {
            const selector = document.getElementById('mesAporteSelector');
            if (!selector) return;

            selector.innerHTML = '';

            // Generar opciones para los últimos 12 meses y los próximos 3 meses
            const meses = [];
            const fechaActual = new Date();
            
            // Últimos 12 meses
            for (let i = 12; i >= 1; i--) {
                const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - i, 1);
                const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                const mesAnoTexto = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
                meses.push({ valor: mesAno, texto: mesAnoTexto, fecha: fecha });
            }
            
            // Mes actual
            const mesActual = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;
            const mesActualTexto = fechaActual.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
            meses.push({ valor: mesActual, texto: mesActualTexto, fecha: fechaActual });

            // Próximos 3 meses
            for (let i = 1; i <= 3; i++) {
                const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + i, 1);
                const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                const mesAnoTexto = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
                meses.push({ valor: mesAno, texto: mesAnoTexto, fecha: fecha });
            }

            meses.forEach(({ valor, texto }) => {
                const option = document.createElement('option');
                option.value = valor;
                option.textContent = texto;
                if (valor === mesActual) {
                    option.selected = true;
                }
                selector.appendChild(option);
            });

            console.log('✅ Selector de mes/año cargado');
        } catch (error) {
            console.error('❌ Error al cargar selector de mes/año:', error);
        }
    };

    /**
     * Obtiene el mes/año seleccionado
     */
    function getMesAnoSeleccionado() {
        const selector = document.getElementById('mesAporteSelector');
        if (!selector || !selector.value) {
            const fecha = new Date();
            return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        }
        return selector.value;
    }

    /**
     * Obtiene o crea el registro de aporte mensual para un socio
     */
    async function obtenerAporteMensual(socioId, mesAno) {
        try {
            const aportes = await window.getAll('aportesMensuales');
            let aporte = aportes.find(a => a.socioId === socioId && a.mesAno === mesAno);
            
            if (!aporte) {
                const socio = await window.getItem('socios', socioId);
                if (!socio) return null;
                
                aporte = {
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    socioId: socioId,
                    mesAno: mesAno,
                    cuotaMensual: parseFloat(socio.cuotaMensual || 0),
                    estado: 'pendiente',
                    fechaPago: null,
                    fechaCreacion: new Date().toISOString()
                };
                
                await window.addItem('aportesMensuales', aporte);
            }
            
            return aporte;
        } catch (error) {
            console.error('❌ Error al obtener aporte mensual:', error);
            return null;
        }
    }

    /**
     * Verifica si un pago corresponde a un aporte mensual
     */
    window.verificarPagoComoAporte = async function(socioId, monto, fecha) {
        try {
            const socio = await window.getItem('socios', socioId);
            if (!socio) return null;
            
            const cuotaMensual = parseFloat(socio.cuotaMensual || 0);
            if (cuotaMensual === 0) return null;
            
            // Si el monto coincide con la cuota mensual, es probable que sea un aporte
            if (Math.abs(monto - cuotaMensual) < 0.01) {
                const fechaPago = new Date(fecha);
                const mesAno = `${fechaPago.getFullYear()}-${String(fechaPago.getMonth() + 1).padStart(2, '0')}`;
                
                const aporte = await obtenerAporteMensual(socioId, mesAno);
                if (aporte) {
                    // Actualizar aporte como pagado (aunque ya esté pagado, actualizar fecha si es diferente)
                    await window.updateItem('aportesMensuales', aporte.id, {
                        estado: 'pagado',
                        fechaPago: fecha
                    });
                    console.log(`✅ Aporte mensual marcado como pagado automáticamente para ${socio.nombre} ${socio.apellido} - ${mesAno}`);
                    return aporte.id;
                }
            }
            
            return null;
        } catch (error) {
            console.error('❌ Error al verificar pago como aporte:', error);
            return null;
        }
    }

    /**
     * Obtiene el filtro seleccionado
     */
    function getFiltroAportesSeleccionado() {
        const selector = document.getElementById('filtroAportesSelector');
        if (!selector || !selector.value) {
            return 'todos';
        }
        return selector.value;
    }

    /**
     * Renderiza la tabla de seguimiento de aportes
     */
    window.renderAportesTable = async function() {
        try {
            const mesAno = getMesAnoSeleccionado();
            const filtro = getFiltroAportesSeleccionado();
            const socios = await window.getAll('socios');
            const tbody = document.getElementById('aportesTableBody');
            
            if (!tbody) return;

            tbody.innerHTML = '';

            if (socios.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-state">
                            <div class="empty-state-icon">📅</div>
                            <p>No hay socios registrados</p>
                        </td>
                    </tr>
                `;
                return;
            }

            // Primero calcular estadísticas para TODOS los socios (sin filtro)
            let totalEsperado = 0;
            let totalPagado = 0;
            let totalPendiente = 0;
            let aportesPagados = 0;

            // Calcular estadísticas totales (todos los socios)
            for (const socio of socios) {
                if (socio.estado === 'Inactivo' || socio.estado === 'inactivo') continue;
                
                const cuotaMensual = parseFloat(socio.cuotaMensual || 0);
                if (cuotaMensual === 0) continue;
                
                totalEsperado += cuotaMensual;
                
                const aporte = await obtenerAporteMensual(socio.id, mesAno);
                if (aporte && aporte.estado === 'pagado') {
                    totalPagado += cuotaMensual;
                    aportesPagados++;
                } else {
                    totalPendiente += cuotaMensual;
                }
            }

            // Ahora renderizar solo los socios que cumplen el filtro
            let sociosMostrados = 0;

            for (const socio of socios) {
                if (socio.estado === 'Inactivo' || socio.estado === 'inactivo') continue;
                
                const cuotaMensual = parseFloat(socio.cuotaMensual || 0);
                if (cuotaMensual === 0) continue;
                
                const aporte = await obtenerAporteMensual(socio.id, mesAno);
                const estadoAporte = aporte && aporte.estado === 'pagado' ? 'pagado' : 'pendiente';
                
                // Aplicar filtro - solo mostrar si cumple
                if (filtro === 'pagados' && estadoAporte !== 'pagado') {
                    continue; // No mostrar este socio
                }
                
                if (filtro === 'pendientes' && estadoAporte === 'pagado') {
                    continue; // No mostrar este socio
                }
                
                // Si llegamos aquí, el socio debe mostrarse
                sociosMostrados++;
                
                const row = document.createElement('tr');
                const estadoBadge = estadoAporte === 'pagado'
                    ? '<span class="badge badge-active">Pagado</span>'
                    : '<span class="badge badge-inactive">Pendiente</span>';
                
                const fechaPagoTexto = aporte && aporte.fechaPago 
                    ? new Date(aporte.fechaPago).toLocaleDateString('es-ES')
                    : '-';

                row.innerHTML = `
                    <td>${escapeHtml(socio.nombre || '')} ${escapeHtml(socio.apellido || '')}</td>
                    <td>${escapeHtml(socio.telefono || '')}</td>
                    <td style="font-weight: 600;">${window.formatCurrency ? window.formatCurrency(cuotaMensual) : '€' + cuotaMensual.toFixed(2)}</td>
                    <td>${estadoBadge}</td>
                    <td>${fechaPagoTexto}</td>
                    <td>
                        <div class="actions">
                            ${estadoAporte === 'pagado' 
                                ? `<button class="btn-icon btn-icon-edit" onclick="window.marcarAportePendiente('${aporte.id}')" title="Marcar como Pendiente">
                                    <span class="material-icons-round">undo</span>
                                   </button>`
                                : `<button class="btn-icon btn-icon-edit" onclick="window.marcarAportePagado('${socio.id}', '${mesAno}')" title="Marcar como Pagado (sin registro de pago)">
                                    <span class="material-icons-round">check_circle</span>
                                   </button>
                                   <button class="btn-icon" style="background: #10b981; color: white;" onclick="window.openRegistrarPagoDesdeAporte('${socio.id}', ${cuotaMensual}).catch(e=>{console.error('Error:',e);alert('Error al abrir formulario.');});" title="Registrar Pago">
                                    <span class="material-icons-round">payment</span>
                                   </button>`
                            }
                        </div>
                    </td>
                `;
                
                tbody.appendChild(row);
            }

            // Si no hay socios mostrados según el filtro, mostrar mensaje
            if (sociosMostrados === 0) {
                let mensaje = '';
                if (filtro === 'pagados') {
                    mensaje = 'No hay aportes pagados para este mes';
                } else if (filtro === 'pendientes') {
                    mensaje = 'Todos los aportes de este mes están pagados';
                } else {
                    mensaje = 'No hay socios registrados';
                }
                
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-state">
                            <div class="empty-state-icon">${filtro === 'pagados' ? '✅' : filtro === 'pendientes' ? '⚠️' : '📅'}</div>
                            <p>${mensaje}</p>
                        </td>
                    </tr>
                `;
            }

            // Actualizar resumen
            const totalEsperadoEl = document.getElementById('totalEsperadoAportes');
            const totalPagadoEl = document.getElementById('totalPagadoAportes');
            const totalPendienteEl = document.getElementById('totalPendienteAportes');
            const porcentajePagadoEl = document.getElementById('porcentajePagadoAportes');
            
            if (totalEsperadoEl) {
                totalEsperadoEl.textContent = window.formatCurrency ? window.formatCurrency(totalEsperado) : '€' + totalEsperado.toFixed(2);
            }
            if (totalPagadoEl) {
                totalPagadoEl.textContent = window.formatCurrency ? window.formatCurrency(totalPagado) : '€' + totalPagado.toFixed(2);
            }
            if (totalPendienteEl) {
                totalPendienteEl.textContent = window.formatCurrency ? window.formatCurrency(totalPendiente) : '€' + totalPendiente.toFixed(2);
            }
            if (porcentajePagadoEl && totalEsperado > 0) {
                const porcentaje = Math.round((totalPagado / totalEsperado) * 100);
                porcentajePagadoEl.textContent = porcentaje + '%';
            }

            console.log(`✅ Tabla de aportes renderizada para ${mesAno}`);
        } catch (error) {
            console.error('❌ Error al renderizar tabla de aportes:', error);
            const tbody = document.getElementById('aportesTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-state">
                            <div class="empty-state-icon">❌</div>
                            <p>Error al cargar los aportes. Por favor, recarga la página.</p>
                        </td>
                    </tr>
                `;
            }
        }
    };

    /**
     * Marca un aporte como pagado
     */
    window.marcarAportePagado = async function(socioId, mesAno) {
        try {
            const aporte = await obtenerAporteMensual(socioId, mesAno);
            if (!aporte) {
                alert('Error: no se pudo obtener el aporte');
                return;
            }

            const fechaPago = new Date().toISOString().split('T')[0];
            
            await window.updateItem('aportesMensuales', aporte.id, {
                estado: 'pagado',
                fechaPago: fechaPago
            });

            showNotification('Aporte marcado como pagado exitosamente', 'success');
            
            // Recargar tabla
            await window.renderAportesTable();
            
            // Actualizar balance
            if (typeof window.updateBalanceDisplay === 'function') {
                await window.updateBalanceDisplay();
            }
        } catch (error) {
            console.error('❌ Error al marcar aporte como pagado:', error);
            alert('Error al marcar el aporte como pagado. Por favor, intenta nuevamente.');
        }
    };

    /**
     * Marca un aporte como pendiente
     */
    window.marcarAportePendiente = async function(aporteId) {
        try {
            if (!confirm('¿Estás seguro de marcar este aporte como pendiente?')) {
                return;
            }

            await window.updateItem('aportesMensuales', aporteId, {
                estado: 'pendiente',
                fechaPago: null
            });

            showNotification('Aporte marcado como pendiente', 'info');
            
            // Recargar tabla
            await window.renderAportesTable();
            
            // Actualizar balance
            if (typeof window.updateBalanceDisplay === 'function') {
                await window.updateBalanceDisplay();
            }
        } catch (error) {
            console.error('❌ Error al marcar aporte como pendiente:', error);
            alert('Error al cambiar el estado del aporte. Por favor, intenta nuevamente.');
        }
    };

    /**
     * Abre el modal de registro de pago desde el seguimiento de aportes
     */
    window.openRegistrarPagoDesdeAporte = async function(socioId = null, montoPredefinido = null) {
        try {
            currentEditPagoId = null;
            const modal = document.getElementById('pagoModal');
            const form = document.getElementById('pagoForm');
            const title = document.getElementById('pagoModalTitle');

            if (!modal || !form || !title) {
                console.error('❌ Elementos del modal de pago no encontrados');
                return;
            }

            form.reset();
            
            // Cargar selector de socios
            if (typeof window.loadSociosSelector === 'function') {
                await window.loadSociosSelector();
            }
            
            const selector = document.getElementById('pagoSocioId');
            const fechaInput = document.getElementById('pagoFecha');
            const montoInput = document.getElementById('pagoMonto');
            const conceptoInput = document.getElementById('pagoConcepto');

            // Si se pasa un socioId, seleccionarlo
            if (socioId && selector) {
                selector.value = socioId;
            }

            // Establecer fecha actual
            if (fechaInput) {
                const today = new Date().toISOString().split('T')[0];
                fechaInput.value = today;
            }

            // Si hay monto predefinido (cuota mensual), establecerlo
            if (montoPredefinido && montoInput) {
                montoInput.value = montoPredefinido;
            }

            // Si hay socio seleccionado y mes seleccionado, establecer concepto
            if (socioId && conceptoInput) {
                const mesAno = getMesAnoSeleccionado();
                const [ano, mes] = mesAno.split('-');
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                const nombreMes = meses[parseInt(mes) - 1];
                conceptoInput.value = `Aporte mensual ${nombreMes} ${ano}`;
            }

            title.textContent = 'Registrar Pago de Aporte';
            modal.classList.remove('hidden');
        } catch (error) {
            console.error('❌ Error al abrir modal de pago desde aportes:', error);
            alert('Error al abrir el formulario de pago');
        }
    };

    console.log('✅ Módulo admin-panel.js cargado');

})();
