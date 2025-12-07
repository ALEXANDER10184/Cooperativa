// ============================================
// CHAT LOGIC - API INTEGRATION
// ============================================

let pollingInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    i18n.translatePage();
    
    // Load messages on page load
    loadMessages();
    
    // Start polling every 3 seconds
    pollingInterval = setInterval(loadMessages, 3000);
    
    // Handle form submission
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', handleSendMessage);
    }
});

// Load messages from API
async function loadMessages() {
    try {
        const result = await chatAPI.listar();
        if (result.ok && result.data) {
            displayMessages(result.data);
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
    
    if (messages.length === 0) {
        container.innerHTML = '<p class="text-center text-secondary">No hay mensajes aún. ¡Sé el primero en escribir!</p>';
        return;
    }
    
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        const timestamp = new Date(msg.timestamp);
        const timeStr = timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="chat-message-header">
                <strong>${escapeHtml(msg.nombre || 'Anónimo')}</strong>
                <span class="chat-time">${timeStr}</span>
            </div>
            <div class="chat-message-body">${escapeHtml(msg.mensaje || '')}</div>
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
        const result = await chatAPI.enviar(nombre, mensaje);
        
        if (result.ok && result.data.ok) {
            // Clear message input
            mensajeInput.value = '';
            // Reload messages
            await loadMessages();
        } else {
            alert('Error al enviar mensaje ❌');
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
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
});
