// ============================================
// CHAT LOGIC - FIREBASE REALTIME
// ============================================

let unsubscribeChat = null;

document.addEventListener('DOMContentLoaded', function() {
    i18n.translatePage();
    
    // Listen for real-time messages from Firebase
    if (typeof listenData === 'function') {
        unsubscribeChat = listenData('chat', (data) => {
            if (data) {
                const messages = Object.values(data);
                messages.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                displayMessages(messages);
            } else {
                displayMessages([]);
            }
        });
    } else {
        // Fallback to API if Firebase not available
        loadMessages();
        const pollingInterval = setInterval(loadMessages, 3000);
        window.addEventListener('beforeunload', () => clearInterval(pollingInterval));
    }
    
    // Handle form submission
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', handleSendMessage);
    }
});

// Load messages from API (fallback)
async function loadMessages() {
    try {
        if (typeof chatAPI !== 'undefined' && chatAPI.listar) {
            const result = await chatAPI.listar();
            if (result.ok && result.data) {
                displayMessages(result.data);
            }
        } else if (typeof getAllMessages === 'function') {
            const messages = await getAllMessages();
            displayMessages(messages);
        }
    } catch (error) {
        console.error('Error cargando mensajes:', error);
    }
}

// Display messages in the chat container
function displayMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!messages || messages.length === 0) {
        container.innerHTML = '<p class="text-center text-secondary">No hay mensajes aún. ¡Sé el primero en escribir!</p>';
        return;
    }
    
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        // Handle both Firebase format (nombre/mensaje) and old format (sender/text)
        const nombre = msg.nombre || msg.sender || 'Anónimo';
        const mensaje = msg.mensaje || msg.text || '';
        const timestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();
        const timeStr = timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="chat-message-header">
                <strong>${escapeHtml(nombre)}</strong>
                <span class="chat-time">${timeStr}</span>
            </div>
            <div class="chat-message-body">${escapeHtml(mensaje)}</div>
        `;
        
        container.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

// Handle send message
async function handleSendMessage(event) {
    event.preventDefault();
    
    const nombreInput = document.getElementById('userName');
    const mensajeInput = document.getElementById('userMessage');
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    const nombre = nombreInput.value.trim();
    const mensaje = mensajeInput.value.trim();
    
    if (!nombre || !mensaje) {
        alert('Por favor completa nombre y mensaje');
        return;
    }
    
    // Disable button
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-icons-round spinner">sync</span>';
    }
    
    try {
        // Try Firebase first
        if (typeof saveMessage === 'function') {
            const success = await saveMessage({
                nombre: nombre,
                mensaje: mensaje,
                timestamp: Date.now()
            });
            
            if (success) {
                mensajeInput.value = '';
                // Save username for next time
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('cooperativa_chat_username', nombre);
                }
            } else {
                alert('Error al enviar mensaje ❌');
            }
        } else if (typeof chatAPI !== 'undefined' && chatAPI.enviar) {
            // Fallback to API
            const result = await chatAPI.enviar(nombre, mensaje);
            if (result.ok && result.data.ok) {
                mensajeInput.value = '';
            } else {
                alert('Error al enviar mensaje ❌');
            }
        } else {
            alert('Error: No hay conexión disponible');
        }
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        alert('Error de red ❌');
    } finally {
        // Re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="material-icons-round">send</span><span class="sr-only">Enviar</span>';
        }
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (unsubscribeChat) {
        unsubscribeChat();
    }
});
