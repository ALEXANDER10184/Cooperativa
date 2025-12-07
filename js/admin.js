// ============================================
// ADMIN PANEL LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if already authenticated (check both methods for compatibility)
    const adminAuth = localStorage.getItem("adminAuth") === "true" || localStorage.getItem("adminAuth") === "1";
    const isAuth = isAdminAuthenticated();
    
    if (adminAuth || isAuth) {
        showAdminPanel();
    } else {
        showLoginScreen();
    }

    // Login form handler
  const loginForm = document.getElementById('loginForm');
    if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
    }
    
    // Recovery form handler
    const recoveryForm = document.getElementById('recoveryForm');
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', handleRecoveryEmail);
    }
    
    // Change password form handler
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
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
    // Verify admin auth before showing panel
    const adminAuth = localStorage.getItem("adminAuth") === "true" || localStorage.getItem("adminAuth") === "1";
    const isAuth = isAdminAuthenticated();
    
    if (!adminAuth && !isAuth) {
        // Redirect to login if not authenticated
        showLoginScreen();
        return;
    }
    
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    loadAllData();
}

async function handleLogin(event) {
    event.preventDefault();
    const passwordInput = document.getElementById('adminPassword') || document.getElementById('adminPasswordInput');
    if (!passwordInput) {
        console.error('Campo de contraseña no encontrado');
        return;
    }
    const password = passwordInput.value.trim();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons-round spinner">sync</span> Verificando...';
    
    try {
        // Get admin token from Firebase using getAdminToken()
        const token = await window.getAdminToken();
        
        if (!token) {
            alert("⚠ Error: No se pudo obtener el token de administrador.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        if (password !== token) {
            // Show modal "Clave incorrecta"
            showIncorrectPasswordModal();
            passwordInput.value = '';
            passwordInput.focus();
        } else {
            // Correct password
            localStorage.setItem("adminAuth", "true");
    setAdminSession();
    showAdminPanel();
            passwordInput.value = '';
        }
    } catch (error) {
        console.error('Error verificando clave:', error);
        alert("⚠ Error: No se pudo obtener el token de administrador.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
  }
}

function logout() {
  clearAdminSession();
    localStorage.removeItem("adminAuth");
    localStorage.setItem("adminAuth", "false");
    showLoginScreen();
}

// Make logout available globally
window.logout = logout;

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
    } else if (tabName === 'configuracion') {
        // Clear form when opening config tab
        const form = document.getElementById('changePasswordForm');
        if (form) {
            form.reset();
        }
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
    
    // Try getSocios first (new Firebase function)
    if (typeof getSocios === 'function') {
        // Unsubscribe previous listener if exists
        if (unsubscribeMembers) {
            unsubscribeMembers();
        }
        
        unsubscribeMembers = getSocios((snapshot) => {
            if (!snapshot || !snapshot.exists()) {
                content.innerHTML = '<p>No hay miembros registrados</p>';
                return;
            }
            
            const data = snapshot.val();
            const members = Object.values(data);
            renderMembersTable(members, content);
        });
    } else if (typeof listenData === 'function') {
        // Fallback to listenData
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
    // Validate admin
    if (typeof isAdmin === 'function' && !isAdmin()) {
        alert('Solo administradores pueden limpiar el chat');
        return;
    }
    
    if (!confirm('¿Estás seguro de limpiar todos los mensajes del chat?')) {
        return;
    }
    
    try {
        // Try Firebase first
        if (typeof readDataOnce === 'function') {
            const chatData = await readDataOnce('chat');
            if (chatData) {
                const deleteFn = typeof deleteDataSecure === 'function' ? deleteDataSecure : deleteData;
                const promises = Object.keys(chatData).map(key => deleteFn(`chat/${key}`, true));
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
    
    // Validate admin
    if (typeof isAdmin === 'function' && !isAdmin()) {
        alert('Solo administradores pueden registrar movimientos');
        return;
    }
    
    const tipo = document.getElementById('movimientoTipo').value;
    const monto = parseFloat(document.getElementById('movimientoMonto').value);
    const concepto = document.getElementById('movimientoConcepto').value.trim();
    
    if (!monto || monto <= 0 || !concepto) {
        alert('Por favor completa todos los campos correctamente');
        return;
    }
    
    // Validate data
    if (typeof validateData === 'function') {
        const movimientoData = {
            monto: monto,
            concepto: concepto,
            fecha: new Date().toISOString(),
            registradoPor: 'admin'
        };
        if (!validateData(movimientoData)) {
            alert('Datos inválidos. Verifica que todos los campos estén completos.');
            return;
        }
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
        // Try readDataOnce first
        if (typeof readDataOnce === 'function') {
            const member = await readDataOnce(`socios/${id}`);
            if (member) {
                alert(`Miembro: ${member.nombre} ${member.apellido}\nEmail: ${member.email}\nTeléfono: ${member.telefono}\nCiudad: ${member.ciudad}\nAporte: €${(member.aporteMensual || 0).toFixed(2)}`);
                return;
            }
        }
        
        // Fallback to getMemberById
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
    // Validate admin
    if (typeof isAdmin === 'function' && !isAdmin()) {
        alert('Solo administradores pueden desactivar miembros');
        return;
    }
    
    if (!confirm('¿Estás seguro de desactivar este miembro?')) {
    return;
  }

    try {
        // Try updateSocio first (new Firebase function)
        if (typeof updateSocio === 'function') {
            const result = await updateSocio(id, { estado: 'inactivo' });
            if (result.success) {
                alert('Miembro desactivado');
                return;
            }
        }
        
        // Fallback to updateMember
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

// ============================================
// PASSWORD MANAGEMENT
// ============================================

// Show incorrect password modal
function showIncorrectPasswordModal() {
    const modal = document.getElementById('incorrectPasswordModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeIncorrectPasswordModal() {
    const modal = document.getElementById('incorrectPasswordModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Show recovery modal
function showRecoveryModal() {
    const modal = document.getElementById('recoveryModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('recoveryEmailInput').focus();
    }
}

function closeRecoveryModal() {
    const modal = document.getElementById('recoveryModal');
    if (modal) {
        modal.classList.add('hidden');
        const form = document.getElementById('recoveryForm');
        if (form) {
            form.reset();
        }
    }
}

// Handle recovery form
// Show recovery modal
function showRecoveryModal() {
    const modal = document.getElementById('recoveryModal');
    if (modal) {
        modal.classList.remove('hidden');
        const emailInput = document.getElementById('recoveryEmailInput');
        if (emailInput) {
            emailInput.focus();
        }
    }
}

// Close recovery modal
function closeRecoveryModal() {
    const modal = document.getElementById('recoveryModal');
    if (modal) {
        modal.classList.add('hidden');
        const form = document.getElementById('recoveryForm');
        if (form) {
            form.reset();
        }
    }
}

// Make functions available globally
window.showRecoveryModal = showRecoveryModal;
window.closeRecoveryModal = closeRecoveryModal;

// Handle recovery email with EmailJS
async function handleRecoveryEmail(event) {
    event.preventDefault();
    const email = document.getElementById('recoveryEmailInput').value.trim();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    if (!email) {
        alert('Por favor ingresa un correo electrónico');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons-round spinner">sync</span> Enviando...';
    
    try {
        // Get admin token from Firebase
        const token = await window.getAdminToken();
        
        if (!token) {
            alert('Error: No se pudo obtener el token de administrador.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }
        
        // Check if EmailJS is loaded
        if (typeof emailjs === 'undefined') {
            // Load EmailJS if not available
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = async () => {
                await sendEmailWithEmailJS(email, token, submitBtn, originalText);
            };
            script.onerror = () => {
                alert('Error al cargar EmailJS. Por favor, verifica tu conexión.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            };
            document.head.appendChild(script);
        } else {
            await sendEmailWithEmailJS(email, token, submitBtn, originalText);
        }
    } catch (error) {
        console.error('Error en recuperación:', error);
        alert('Error al procesar la solicitud');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Send email using EmailJS
async function sendEmailWithEmailJS(email, adminKey, submitBtn, originalText) {
    try {
        // Initialize EmailJS (you need to set your public key)
        // Uncomment and set your public key from EmailJS dashboard
        // emailjs.init("YOUR_PUBLIC_KEY");
        
        // Send email using EmailJS
        // Replace SERVICE_ID and TEMPLATE_ID with your actual values from EmailJS dashboard
        // You can get these from: https://dashboard.emailjs.com/
        const SERVICE_ID = "service_default"; // Replace with your service ID
        const TEMPLATE_ID = "template_default"; // Replace with your template ID
        
        const result = await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
            to_email: email,
            admin_key: adminKey,
            from_name: "Cooperativa Provivienda",
            subject: "Recuperación de Clave de Administrador",
            message: `Tu clave de administrador es: ${adminKey}`
        });
        
        if (result.status === 200 || result.text === 'OK') {
            // Show success message
            alert('✅ Correo enviado correctamente. Revisa tu bandeja de entrada.');
            closeRecoveryModal();
        } else {
            throw new Error('Error al enviar correo');
        }
    } catch (error) {
        console.error('Error enviando correo:', error);
        alert('Error al enviar el correo. Por favor, contacta al administrador o verifica la configuración de EmailJS.\n\nNota: Debes configurar SERVICE_ID y TEMPLATE_ID en admin.js');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Alias for compatibility
async function handleRecovery(event) {
    return handleRecoveryEmail(event);
}


// Handle change password form
async function handleChangePassword(event) {
  event.preventDefault();
    
    const currentPassword = document.getElementById('currentPasswordInput').value;
    const newPassword = document.getElementById('newPasswordInput').value;
    const confirmPassword = document.getElementById('confirmPasswordInput').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }
    
    // Validate new password is not empty
    if (!newPassword || newPassword.length === 0) {
        alert('La nueva contraseña no puede estar vacía');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons-round spinner">sync</span> Actualizando...';
    
    try {
        const success = await changeAdminPassword(currentPassword, newPassword);
        
        if (success) {
            alert('Clave actualizada correctamente');
            // Clear form
            event.target.reset();
            // Logout and redirect
            clearAdminSession();
            localStorage.removeItem('isAdmin');
            setTimeout(() => {
                showLoginScreen();
                alert('Por favor, inicia sesión nuevamente con la nueva clave');
            }, 1000);
        } else {
            alert('Clave actual incorrecta');
            document.getElementById('currentPasswordInput').value = '';
            document.getElementById('currentPasswordInput').focus();
        }
    } catch (error) {
        console.error('Error cambiando clave:', error);
        alert('Error al cambiar la clave');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Change admin password
async function changeAdminPassword(oldPass, newPass) {
    try {
        // Get current admin token from Firebase using getAdminToken()
        let currentToken;
        if (typeof getAdminToken === 'function') {
            currentToken = await getAdminToken();
        } else {
            const configData = await readDataOnce('config');
            currentToken = configData?.adminToken || 'esperanza2025';
        }
        
        if (!currentToken) {
            return false;
        }
        
        // Validate current password
        if (oldPass !== currentToken) {
            return false;
        }
        
        // Update admin token in Firebase
        const config = await readDataOnce('config') || {};
        config.adminToken = newPass;
        config.ultimaActualizacion = Date.now();
        
        const result = await saveData('config', config);
        
        if (result.success) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error changing password:', error);
        return false;
    }
}
