// ============================================
// ADMIN PANEL FUNCTIONS
// ============================================

import { 
    getAll, 
    getItem,
    addItem, 
    updateItem, 
    deleteItem,
    getItemsByField
} from './db.js';

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
function switchMainTab(tabName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.tab-content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remover active de todos los botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar sección seleccionada
    const section = document.getElementById(`${tabName}Section`);
    if (section) {
        section.classList.add('active');
    }

    // Activar botón
    const btn = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (btn) {
        btn.classList.add('active');
    }

    // Si es administración, renderizar datos
    if (tabName === 'administracion') {
        renderGastosTable();
        renderIngresosTable();
        loadSociosSelector();
    }
}

/**
 * Cambia entre sub-tabs de administración
 */
function switchAdminTab(subTabName) {
    // Ocultar todos los sub-tabs
    document.querySelectorAll('.sub-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remover active de todos los botones
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Mostrar sub-tab seleccionado
    const content = document.getElementById(`${subTabName}Tab`);
    if (content) {
        content.classList.add('active');
    }

    // Activar botón
    const btn = document.getElementById(`subTab${subTabName.charAt(0).toUpperCase() + subTabName.slice(1)}`);
    if (btn) {
        btn.classList.add('active');
    }

    // Si es pagos, renderizar tabla
    if (subTabName === 'pagos') {
        renderPagosTable();
    }
}

// ============================================
// GASTOS MANAGEMENT
// ============================================

/**
 * Renderiza la tabla de gastos
 */
function renderGastosTable() {
    try {
        const gastos = getAll('gastos');
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
            
            // Agregar listeners
            const editBtn = row.querySelector('.edit-gasto-btn');
            const deleteBtn = row.querySelector('.delete-gasto-btn');
            
            if (editBtn) {
                editBtn.addEventListener('click', () => openEditGastoModal(gasto.id));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => handleDeleteGasto(gasto.id));
            }
            
            tbody.appendChild(row);
        });

        console.log(`✅ Tabla de gastos renderizada con ${gastos.length} registros`);
    } catch (error) {
        console.error('❌ Error al renderizar tabla de gastos:', error);
    }
}

/**
 * Abre el modal para agregar un nuevo gasto
 */
function openAddGastoModal() {
    currentEditGastoId = null;
    const modal = document.getElementById('gastoModal');
    const form = document.getElementById('gastoForm');
    const title = document.getElementById('gastoModalTitle');

    if (!modal || !form || !title) {
        console.error('❌ Elementos del modal de gasto no encontrados');
        return;
    }

    form.reset();
    // Establecer fecha actual por defecto
    const fechaInput = document.getElementById('gastoFecha');
    if (fechaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;
    }
    title.textContent = 'Agregar Gasto';
    modal.classList.remove('hidden');
}

/**
 * Abre el modal para editar un gasto existente
 */
function openEditGastoModal(id) {
    try {
        const gasto = getItem('gastos', id);
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
}

/**
 * Cierra el modal de gasto
 */
function closeGastoModal() {
    const modal = document.getElementById('gastoModal');
    if (modal) {
        modal.classList.add('hidden');
        currentEditGastoId = null;
    }
}

/**
 * Maneja el envío del formulario de gasto
 */
function handleSubmitGasto(event) {
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

        if (currentEditGastoId) {
            updateItem('gastos', currentEditGastoId, gastoData);
            console.log('✅ Gasto actualizado:', currentEditGastoId);
        } else {
            addItem('gastos', gastoData);
            console.log('✅ Gasto agregado');
        }

        closeGastoModal();
        renderGastosTable();
        showNotification(
            currentEditGastoId ? 'Gasto actualizado exitosamente' : 'Gasto agregado exitosamente',
            'success'
        );
    } catch (error) {
        console.error('❌ Error al guardar gasto:', error);
        alert('Error al guardar el gasto. Por favor, intenta nuevamente.');
    }
}

/**
 * Maneja la eliminación de un gasto
 */
function handleDeleteGasto(id) {
    try {
        const gasto = getItem('gastos', id);
        if (!gasto) {
            alert('Gasto no encontrado');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar el gasto "${gasto.concepto}"?`)) {
            return;
        }

        deleteItem('gastos', id);
        console.log('✅ Gasto eliminado:', id);
        renderGastosTable();
        showNotification('Gasto eliminado exitosamente', 'success');
    } catch (error) {
        console.error('❌ Error al eliminar gasto:', error);
        alert('Error al eliminar el gasto. Por favor, intenta nuevamente.');
    }
}

// ============================================
// INGRESOS MANAGEMENT
// ============================================

/**
 * Renderiza la tabla de ingresos
 */
function renderIngresosTable() {
    try {
        const ingresos = getAll('ingresos');
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
            
            // Agregar listeners
            const editBtn = row.querySelector('.edit-ingreso-btn');
            const deleteBtn = row.querySelector('.delete-ingreso-btn');
            
            if (editBtn) {
                editBtn.addEventListener('click', () => openEditIngresoModal(ingreso.id));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => handleDeleteIngreso(ingreso.id));
            }
            
            tbody.appendChild(row);
        });

        console.log(`✅ Tabla de ingresos renderizada con ${ingresos.length} registros`);
    } catch (error) {
        console.error('❌ Error al renderizar tabla de ingresos:', error);
    }
}

/**
 * Abre el modal para agregar un nuevo ingreso
 */
function openAddIngresoModal() {
    currentEditIngresoId = null;
    const modal = document.getElementById('ingresoModal');
    const form = document.getElementById('ingresoForm');
    const title = document.getElementById('ingresoModalTitle');

    if (!modal || !form || !title) {
        console.error('❌ Elementos del modal de ingreso no encontrados');
        return;
    }

    form.reset();
    // Establecer fecha actual por defecto
    const fechaInput = document.getElementById('ingresoFecha');
    if (fechaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;
    }
    title.textContent = 'Agregar Ingreso';
    modal.classList.remove('hidden');
}

/**
 * Abre el modal para editar un ingreso existente
 */
function openEditIngresoModal(id) {
    try {
        const ingreso = getItem('ingresos', id);
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
}

/**
 * Cierra el modal de ingreso
 */
function closeIngresoModal() {
    const modal = document.getElementById('ingresoModal');
    if (modal) {
        modal.classList.add('hidden');
        currentEditIngresoId = null;
    }
}

/**
 * Maneja el envío del formulario de ingreso
 */
function handleSubmitIngreso(event) {
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

        if (currentEditIngresoId) {
            updateItem('ingresos', currentEditIngresoId, ingresoData);
            console.log('✅ Ingreso actualizado:', currentEditIngresoId);
        } else {
            addItem('ingresos', ingresoData);
            console.log('✅ Ingreso agregado');
        }

        closeIngresoModal();
        renderIngresosTable();
        showNotification(
            currentEditIngresoId ? 'Ingreso actualizado exitosamente' : 'Ingreso agregado exitosamente',
            'success'
        );
    } catch (error) {
        console.error('❌ Error al guardar ingreso:', error);
        alert('Error al guardar el ingreso. Por favor, intenta nuevamente.');
    }
}

/**
 * Maneja la eliminación de un ingreso
 */
function handleDeleteIngreso(id) {
    try {
        const ingreso = getItem('ingresos', id);
        if (!ingreso) {
            alert('Ingreso no encontrado');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar el ingreso "${ingreso.concepto}"?`)) {
            return;
        }

        deleteItem('ingresos', id);
        console.log('✅ Ingreso eliminado:', id);
        renderIngresosTable();
        showNotification('Ingreso eliminado exitosamente', 'success');
    } catch (error) {
        console.error('❌ Error al eliminar ingreso:', error);
        alert('Error al eliminar el ingreso. Por favor, intenta nuevamente.');
    }
}

// ============================================
// PAGOS MANAGEMENT
// ============================================

/**
 * Carga el selector de socios
 */
function loadSociosSelector() {
    try {
        const socios = getAll('socios');
        const selector = document.getElementById('socioSelector');
        const pagoSelector = document.getElementById('pagoSocioId');

        if (!selector && !pagoSelector) return;

        const options = '<option value="">-- Seleccione un socio --</option>' +
            socios.map(socio => 
                `<option value="${socio.id}">${escapeHtml(socio.nombre)} ${escapeHtml(socio.apellido)}</option>`
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
}

/**
 * Renderiza la tabla de pagos del socio seleccionado
 */
function renderPagosTable() {
    try {
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

        // Obtener pagos del socio usando getItemsByField
        const pagos = getItemsByField('pagos', 'socioId', socioId);

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
            
            // Agregar listeners
            const editBtn = row.querySelector('.edit-pago-btn');
            const deleteBtn = row.querySelector('.delete-pago-btn');
            
            if (editBtn) {
                editBtn.addEventListener('click', () => openEditPagoModal(pago.id));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => handleDeletePago(pago.id));
            }
            
            tbody.appendChild(row);
        });

        console.log(`✅ Tabla de pagos renderizada con ${pagos.length} registros`);
    } catch (error) {
        console.error('❌ Error al renderizar tabla de pagos:', error);
    }
}

/**
 * Abre el modal para agregar un nuevo pago
 */
function openAddPagoModal() {
    currentEditPagoId = null;
    const modal = document.getElementById('pagoModal');
    const form = document.getElementById('pagoForm');
    const title = document.getElementById('pagoModalTitle');

    if (!modal || !form || !title) {
        console.error('❌ Elementos del modal de pago no encontrados');
        return;
    }

    form.reset();
    loadSociosSelector();
    
    // Si hay un socio seleccionado en el selector, usarlo
    const selector = document.getElementById('socioSelector');
    const pagoSocioId = document.getElementById('pagoSocioId');
    if (selector && selector.value && pagoSocioId) {
        pagoSocioId.value = selector.value;
    }

    // Establecer fecha actual por defecto
    const fechaInput = document.getElementById('pagoFecha');
    if (fechaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;
    }
    
    title.textContent = 'Registrar Pago';
    modal.classList.remove('hidden');
}

/**
 * Abre el modal para editar un pago existente
 */
function openEditPagoModal(id) {
    try {
        const pago = getItem('pagos', id);
        if (!pago) {
            alert('Pago no encontrado');
            return;
        }

        currentEditPagoId = id;
        const modal = document.getElementById('pagoModal');
        const form = document.getElementById('pagoForm');
        const title = document.getElementById('pagoModalTitle');

        if (!modal || !form || !title) return;

        loadSociosSelector();
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
}

/**
 * Cierra el modal de pago
 */
function closePagoModal() {
    const modal = document.getElementById('pagoModal');
    if (modal) {
        modal.classList.add('hidden');
        currentEditPagoId = null;
    }
}

/**
 * Maneja el envío del formulario de pago
 */
function handleSubmitPago(event) {
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

        if (currentEditPagoId) {
            updateItem('pagos', currentEditPagoId, pagoData);
            console.log('✅ Pago actualizado:', currentEditPagoId);
        } else {
            addItem('pagos', pagoData);
            console.log('✅ Pago agregado');
        }

        closePagoModal();
        renderPagosTable();
        showNotification(
            currentEditPagoId ? 'Pago actualizado exitosamente' : 'Pago registrado exitosamente',
            'success'
        );
    } catch (error) {
        console.error('❌ Error al guardar pago:', error);
        alert('Error al guardar el pago. Por favor, intenta nuevamente.');
    }
}

/**
 * Maneja la eliminación de un pago
 */
function handleDeletePago(id) {
    try {
        const pago = getItem('pagos', id);
        if (!pago) {
            alert('Pago no encontrado');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar este pago?`)) {
            return;
        }

        deleteItem('pagos', id);
        console.log('✅ Pago eliminado:', id);
        renderPagosTable();
        showNotification('Pago eliminado exitosamente', 'success');
    } catch (error) {
        console.error('❌ Error al eliminar pago:', error);
        alert('Error al eliminar el pago. Por favor, intenta nuevamente.');
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

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Exportar funciones
export {
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
};

