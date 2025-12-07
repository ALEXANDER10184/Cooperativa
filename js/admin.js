// ============================================
// ADMIN PANEL LOGIC
// ============================================

const ADMIN_PASSWORD = 'esperanza2025';

document.addEventListener('DOMContentLoaded', function() {
    // Check if already authenticated
    if (isAdminAuthenticated()) {
        showAdminPanel();
    } else {
        showLoginScreen();
    }
    
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Movimiento form handler
    const movimientoForm = document.getElementById('movimientoForm');
    if (movimientoForm) {
        movimientoForm.addEventListener('submit', handleMovimiento);
    }
});

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
}

function showAdminPanel() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    loadAllData();
}

function handleLogin(event) {
    event.preventDefault();
    const password = document.getElementById('adminPasswordInput').value;
    
    if (checkAdminPassword(password)) {
        setAdminSession();
        showAdminPanel();
    } else {
        alert('Contraseña incorrecta');
    }
}

function logout() {
    clearAdminSession();
    showLoginScreen();
}

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('[id^="tab"]').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.remove('hidden');
    
    // Activate button
    const btn = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (btn) {
        btn.classList.remove('btn-outline');
        btn.classList.add('btn-primary');
    }
    
    // Load data for the tab
    if (tabName === 'resumen') {
        loadStats();
    } else if (tabName === 'miembros') {
        loadMembers();
    } else if (tabName === 'chat') {
        loadChatMessages();
    } else if (tabName === 'balance') {
        loadBalance();
    } else if (tabName === 'eventos') {
        loadEventos();
    }
}

async function loadAllData() {
    showTab('resumen');
}

async function loadStats() {
    try {
        const result = await statsAPI.obtener();
        if (result.ok && result.data) {
            const stats = result.data;
            const content = document.getElementById('statsContent');
            
            const ultimoRegistro = stats.ultimoRegistro ? new Date(stats.ultimoRegistro).toLocaleString('es-ES') : 'N/A';
            const ultimoMensaje = stats.ultimoMensajeChat ? new Date(stats.ultimoMensajeChat).toLocaleString('es-ES') : 'N/A';
            
            content.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div class="card" style="background: var(--color-secondary);">
                        <div style="font-size: 2.5em; font-weight: bold; color: var(--color-primary);">${stats.miembrosTotales || 0}</div>
                        <div>Miembros Totales</div>
                    </div>
                    <div class="card" style="background: var(--color-secondary);">
                        <div style="font-size: 2.5em; font-weight: bold; color: var(--color-primary);">${stats.miembrosActivos || 0}</div>
                        <div>Miembros Activos</div>
                    </div>
                    <div class="card" style="background: var(--color-secondary);">
                        <div style="font-size: 2.5em; font-weight: bold; color: var(--color-primary);">${stats.mensajesChat || 0}</div>
                        <div>Mensajes en Chat</div>
                    </div>
                    <div class="card" style="background: var(--color-secondary);">
                        <div style="font-size: 2.5em; font-weight: bold; color: var(--color-primary);">€${(stats.saldoGlobal || 0).toFixed(2)}</div>
                        <div>Saldo Global</div>
                    </div>
                </div>
                <div style="margin-top: 2rem;">
                    <p><strong>Último Registro:</strong> ${ultimoRegistro}</p>
                    <p><strong>Último Mensaje:</strong> ${ultimoMensaje}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando stats:', error);
        document.getElementById('statsContent').innerHTML = '<p class="text-danger">Error cargando estadísticas</p>';
    }
}

let unsubscribeMembers = null;

async function loadMembers() {
    const content = document.getElementById('membersList');
    
    // Try Firebase first
    if (typeof listenData === 'function') {
        // Unsubscribe previous listener if exists
        if (unsubscribeMembers) {
            unsubscribeMembers();
        }
        
        unsubscribeMembers = listenData('socios', (data) => {
            if (!data) {
                content.innerHTML = '<p>No hay miembros registrados</p>';
                return;
            }
            
            const members = Object.values(data);
            renderMembersTable(members, content);
        });
    } else {
        // Fallback to API
        try {
            const result = await registroAPI.listar();
            if (result.ok && result.data) {
                renderMembersTable(result.data, content);
            } else {
                // Try Firebase getAllMembers
                if (typeof getAllMembers === 'function') {
                    const members = await getAllMembers();
                    renderMembersTable(members, content);
                } else {
                    content.innerHTML = '<p>No hay miembros registrados</p>';
                }
            }
        } catch (error) {
            console.error('Error cargando miembros:', error);
            content.innerHTML = '<p class="text-danger">Error cargando miembros</p>';
        }
    }
}

function renderMembersTable(members, content) {
    if (members.length === 0) {
        content.innerHTML = '<p>No hay miembros registrados</p>';
        return;
    }
    
    let html = '<table class="table" style="width: 100%; border-collapse: collapse;"><thead><tr><th>Nombre</th><th>Email</th><th>Ciudad</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
    
    members.forEach(member => {
        html += `
            <tr>
                <td>${escapeHtml(member.nombre || '')} ${escapeHtml(member.apellido || '')}</td>
                <td>${escapeHtml(member.email || '')}</td>
                <td>${escapeHtml(member.ciudad || '')}</td>
                <td><span class="badge ${member.estado === 'activo' ? 'badge-success' : 'badge-secondary'}">${member.estado || 'activo'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewMember('${member.id}')">Ver</button>
                    ${member.estado === 'activo' ? `<button class="btn btn-sm btn-danger" onclick="deactivateMember('${member.id}')">Desactivar</button>` : ''}
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    content.innerHTML = html;
}

let unsubscribeAdminChat = null;

async function loadChatMessages() {
    const content = document.getElementById('adminChatMessages');
    
    // Try Firebase first
    if (typeof listenData === 'function') {
        // Unsubscribe previous listener if exists
        if (unsubscribeAdminChat) {
            unsubscribeAdminChat();
        }
        
        unsubscribeAdminChat = listenData('chat', (data) => {
            if (!data) {
                content.innerHTML = '<p>No hay mensajes</p>';
                return;
            }
            
            const messages = Object.values(data);
            messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            renderChatMessages(messages, content);
        });
    } else {
        // Fallback to API
        try {
            const result = await chatAPI.listar();
            if (result.ok && result.data) {
                renderChatMessages(result.data, content);
            } else if (typeof getAllMessages === 'function') {
                const messages = await getAllMessages();
                renderChatMessages(messages, content);
            } else {
                content.innerHTML = '<p>No hay mensajes</p>';
            }
        } catch (error) {
            console.error('Error cargando chat:', error);
            content.innerHTML = '<p class="text-danger">Error cargando mensajes</p>';
        }
    }
}

function renderChatMessages(messages, content) {
    if (messages.length === 0) {
        content.innerHTML = '<p>No hay mensajes</p>';
        return;
    }
    
    let html = '';
    messages.forEach(msg => {
        const nombre = msg.nombre || msg.sender || 'Anónimo';
        const mensaje = msg.mensaje || msg.text || '';
        const timestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();
        const time = timestamp.toLocaleString('es-ES');
        html += `
            <div style="border-bottom: 1px solid #eee; padding: 0.5rem 0;">
                <strong>${escapeHtml(nombre)}</strong>
                <span style="color: #666; font-size: 0.9em;"> - ${time}</span>
                <p style="margin: 0.5rem 0 0 0;">${escapeHtml(mensaje)}</p>
            </div>
        `;
    });
    
    content.innerHTML = html;
    content.scrollTop = content.scrollHeight;
}

async function clearChat() {
    if (!confirm('¿Estás seguro de limpiar todos los mensajes del chat?')) {
        return;
    }
    
    try {
        // Try Firebase first
        if (typeof readDataOnce === 'function') {
            const chatData = await readDataOnce('chat');
            if (chatData) {
                const promises = Object.keys(chatData).map(key => deleteData(`chat/${key}`));
                await Promise.all(promises);
                alert('Chat limpiado exitosamente');
                return;
            }
        }
        
        // Fallback to API
        if (typeof chatAPI !== 'undefined' && chatAPI.limpiar) {
            const result = await chatAPI.limpiar();
            if (result.ok && result.data.cleared) {
                alert('Chat limpiado exitosamente');
            } else {
                alert('Error: ' + (result.data?.error || 'No autorizado'));
            }
        } else {
            alert('Error: No hay conexión disponible');
        }
    } catch (error) {
        console.error('Error limpiando chat:', error);
        alert('Error al limpiar chat');
    }
}

let unsubscribeBalance = null;

async function loadBalance() {
    const content = document.getElementById('balanceGlobalContent');
    
    // Try Firebase first
    if (typeof listenData === 'function') {
        // Unsubscribe previous listener if exists
        if (unsubscribeBalance) {
            unsubscribeBalance();
        }
        
        unsubscribeBalance = listenData('balance', (data) => {
            if (data) {
                renderBalance(data, content);
            } else {
                // Fallback: calculate
                calculateBalance().then(balance => {
                    renderBalance({
                        balanceActual: balance.balance,
                        ingresosTotales: balance.totalIncome,
                        gastosTotales: balance.totalExpenses,
                        ultimaActualizacion: Date.now()
                    }, content);
                });
            }
        });
    } else {
        // Fallback to API
        try {
            const result = await balanceAPI.global.obtener();
            if (result.ok && result.data) {
                renderBalance(result.data, content);
            } else if (typeof calculateBalance === 'function') {
                const balance = await calculateBalance();
                renderBalance({
                    balanceActual: balance.balance,
                    ingresosTotales: balance.totalIncome,
                    gastosTotales: balance.totalExpenses,
                    ultimaActualizacion: Date.now()
                }, content);
            }
        } catch (error) {
            console.error('Error cargando balance:', error);
            content.innerHTML = '<p class="text-danger">Error cargando balance</p>';
        }
    }
}

function renderBalance(balance, content) {
    content.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 3em; font-weight: bold; color: var(--color-primary);">
                €${(balance.balanceActual || balance.saldo || 0).toFixed(2)}
            </div>
            <p>Saldo Global</p>
            ${balance.ultimaActualizacion ? `<p style="color: #666; font-size: 0.9em;">Última actualización: ${new Date(balance.ultimaActualizacion).toLocaleString('es-ES')}</p>` : ''}
        </div>
    `;
}

async function handleMovimiento(event) {
    event.preventDefault();
    
    const tipo = document.getElementById('movimientoTipo').value;
    const monto = parseFloat(document.getElementById('movimientoMonto').value);
    const concepto = document.getElementById('movimientoConcepto').value.trim();
    
    if (!monto || monto <= 0 || !concepto) {
        alert('Por favor completa todos los campos correctamente');
        return;
    }
    
    try {
        // Try Firebase first
        if (typeof saveIncome === 'function' && typeof saveExpense === 'function') {
            const movimientoData = {
                monto: monto,
                concepto: concepto,
                fecha: new Date().toISOString(),
                registradoPor: 'admin'
            };
            
            let success = false;
            if (tipo === 'ingreso') {
                success = await saveIncome(movimientoData);
            } else {
                success = await saveExpense(movimientoData);
            }
            
            if (success) {
                const balance = await calculateBalance();
                alert(`Movimiento registrado. Nuevo saldo: €${balance.balance.toFixed(2)}`);
                document.getElementById('movimientoForm').reset();
            } else {
                alert('Error al registrar movimiento');
            }
        } else if (typeof balanceAPI !== 'undefined' && balanceAPI.global.movimiento) {
            // Fallback to API
            const result = await balanceAPI.global.movimiento(tipo, monto, concepto, 'admin');
            if (result.ok && result.data.ok) {
                alert(`Movimiento registrado. Nuevo saldo: €${result.data.nuevoSaldo.toFixed(2)}`);
                document.getElementById('movimientoForm').reset();
                loadBalance();
            } else {
                alert('Error: ' + (result.data?.error || 'Error al registrar movimiento'));
            }
        } else {
            alert('Error: No hay conexión disponible');
        }
    } catch (error) {
        console.error('Error registrando movimiento:', error);
        alert('Error de red');
    }
}

async function loadEventos() {
    try {
        const result = await statsAPI.eventos.listar();
        if (result.ok && result.data) {
            const eventos = result.data;
            const content = document.getElementById('eventosList');
            
            if (eventos.length === 0) {
                content.innerHTML = '<p>No hay eventos</p>';
                return;
            }
            
            let html = '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
            eventos.forEach(evento => {
                const time = new Date(evento.timestamp).toLocaleString('es-ES');
                html += `
                    <div style="border: 1px solid #ddd; padding: 0.75rem; border-radius: 4px;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <strong>${escapeHtml(evento.tipo || 'evento')}</strong>
                                <span style="color: #666; font-size: 0.9em;"> - ${escapeHtml(evento.origen || 'sistema')}</span>
                            </div>
                            <span style="color: #666; font-size: 0.85em;">${time}</span>
                        </div>
                        <p style="margin: 0.5rem 0 0 0; color: #555;">${escapeHtml(evento.descripcion || '')}</p>
                    </div>
                `;
            });
            html += '</div>';
            content.innerHTML = html;
        }
    } catch (error) {
        console.error('Error cargando eventos:', error);
        document.getElementById('eventosList').innerHTML = '<p class="text-danger">Error cargando eventos</p>';
    }
}

async function clearEventos() {
    if (!confirm('¿Estás seguro de limpiar todos los eventos?')) {
        return;
    }
    
    try {
        const result = await statsAPI.eventos.limpiar();
        if (result.ok && result.data.cleared) {
            alert('Eventos limpiados exitosamente');
            loadEventos();
        } else {
            alert('Error: ' + (result.data?.error || 'No autorizado'));
        }
    } catch (error) {
        console.error('Error limpiando eventos:', error);
        alert('Error al limpiar eventos');
    }
}

async function viewMember(id) {
    try {
        // Try Firebase first
        if (typeof getMemberById === 'function') {
            const member = await getMemberById(id);
            if (member) {
                alert(`Miembro: ${member.nombre} ${member.apellido}\nEmail: ${member.email}\nTeléfono: ${member.telefono}\nCiudad: ${member.ciudad}\nAporte: €${(member.aporteMensual || 0).toFixed(2)}`);
                return;
            }
        }
        
        // Fallback to API
        if (typeof registroAPI !== 'undefined' && registroAPI.obtener) {
            const result = await registroAPI.obtener(id);
            if (result.ok && result.data) {
                const member = result.data;
                alert(`Miembro: ${member.nombre} ${member.apellido}\nEmail: ${member.email}\nTeléfono: ${member.telefono}\nCiudad: ${member.ciudad}\nAporte: €${(member.aporteMensual || 0).toFixed(2)}`);
            }
        }
    } catch (error) {
        alert('Error al obtener datos del miembro');
    }
}

async function deactivateMember(id) {
    if (!confirm('¿Estás seguro de desactivar este miembro?')) {
        return;
    }
    
    try {
        // Try Firebase first
        if (typeof updateMember === 'function') {
            const success = await updateMember(id, { estado: 'inactivo' });
            if (success) {
                alert('Miembro desactivado');
                return;
            }
        }
        
        // Fallback to API
        if (typeof registroAPI !== 'undefined' && registroAPI.eliminar) {
            const result = await registroAPI.eliminar(id);
            if (result.ok && result.data.ok) {
                alert('Miembro desactivado');
            } else {
                alert('Error al desactivar miembro');
            }
        } else {
            alert('Error: No hay conexión disponible');
        }
    } catch (error) {
        console.error('Error desactivando miembro:', error);
        alert('Error de red');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
