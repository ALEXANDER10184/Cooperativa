// ============================================
// CHAT LOGIC
// Cooperativa Provivienda "Mi Esperanza"
// ============================================

let isAdmin = false;

document.addEventListener('DOMContentLoaded', function () {
  // Translate page
  i18n.translatePage();

  // Check if admin
  isAdmin = isAdminAuthenticated();

  // Load and display messages
  renderMessages();

  // Form submission
  const form = document.getElementById('chatForm');
  form.addEventListener('submit', handleSendMessage);

  // Load saved username
  const savedName = localStorage.getItem('cooperativa_chat_username');
  if (savedName) {
    document.getElementById('userName').value = savedName;
  }

  // Auto-scroll to bottom
  scrollToBottom();
});

// ============================================
// RENDER MESSAGES
// ============================================

// Subscribe to Firebase Messages
function subscribeToMessages() {
  listenData('chat', (data) => {
    chatMessages.innerHTML = ''; // Clear existing messages
    const messages = data ? Object.values(data) : [];

    // Sort by timestamp
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    messages.forEach(msg => {
      renderMessage(msg);
    });

    scrollToBottom();
  });
}

function renderMessage(msg) {
  // checkAdminSession() is assumed to be a global helper from main.js
  const isAdminSession = checkAdminSession();
  const timeStr = formatDate(new Date(msg.timestamp)); // formatDate is assumed to be a global helper

  const msgDiv = document.createElement('div');

  msgDiv.className = `chat-message ${msg.isAdmin ? 'admin-message' : ''}`;

  if (msg.isAdmin) msgDiv.style.borderLeft = "4px solid var(--color-primary)";

  msgDiv.innerHTML = `
      <div class="chat-message-header">
        <span class="chat-message-name">${escapeHtml(msg.sender)} ${msg.isAdmin ? '👑' : ''}</span>
        <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
            <span class="chat-message-time">${timeStr}</span>
            ${isAdminSession ? `
              <button class="btn btn-danger btn-sm" onclick="deleteMessageConfirm('${msg.id}')" style="padding: 0.1rem 0.3rem; display: flex; align-items: center; justify-content: center;">
                <span class="material-icons-round" style="font-size: 1.2em;">close</span>
              </button>
            ` : ''}
        </div>
      </div>
      <div class="chat-message-body">${escapeHtml(msg.text)}</div>
    `;

  chatMessages.appendChild(msgDiv);
}

// ============================================
// SEND MESSAGE
// ============================================

// Send Message
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const sender = userNameInput.value.trim();
  const text = userMessageInput.value.trim();

  if (!sender || !text) {
    return; // Do nothing if name or message is empty
  }

  // Save username for next time
  localStorage.setItem('cooperativa_chat_username', sender);

  const isAdminSession = checkAdminSession(); // Check admin status at the time of sending

  const newMessage = {
    sender: sender,
    text: text,
    timestamp: new Date().toISOString(),
    isAdmin: isAdminSession
  };

  // Firebase Push
  pushData('chat', newMessage) // pushData is assumed to be a global helper
    .then(() => {
      userMessageInput.value = ''; // Clear message input
      // Name kept for convenience
    })
    .catch(err => showAlert('Error al enviar mensaje', 'error')); // showAlert is assumed to be a global helper
});

// ============================================
// DELETE MESSAGE
// ============================================

function deleteMessageConfirm(id) {
  if (confirm(i18n.t('confirmDelete'))) { // i18n.t is assumed to be a global helper
    // Firebase Remove
    // Note: 'chat' is a list, we need to find the key. 
    // In our structure, id IS the key if we saved it correctly. 
    // Let's ensure pushData saves the key as 'id'. Yes, our helper does that.
    deleteData(`chat/${id}`) // deleteData is assumed to be a global helper
      .then(() => showAlert('Mensaje eliminado', 'success'))
      .catch(err => showAlert('Error al eliminar', 'error'));
  }
}

// ============================================
// HELPERS
// ============================================

function scrollToBottom() {
  // chatMessages is already defined globally
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
