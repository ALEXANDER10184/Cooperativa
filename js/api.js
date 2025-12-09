// ============================================
// API CLIENT - CLOUDFLARE WORKER
// ============================================

const API_BASE = 'https://rough-lake-0310.cacero1018.workers.dev';
const ADMIN_TOKEN = 'esperanza2025'; // Cambiar por variable de entorno en producción

// Helper para hacer requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    return { ok: response.ok, data, status: response.status };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// API - Registro
const registroAPI = {
  crear: async (datos) => {
    return apiRequest('/registro', {
      method: 'POST',
      body: JSON.stringify(datos)
    });
  },
  
  listar: async (estado = null) => {
    const endpoint = estado ? `/registro/list?estado=${estado}` : '/registro/list';
    return apiRequest(endpoint);
  },
  
  obtener: async (id) => {
    return apiRequest(`/registro/${id}`);
  },
  
  actualizar: async (id, datos) => {
    return apiRequest(`/registro/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos)
    });
  },
  
  eliminar: async (id) => {
    return apiRequest(`/registro/${id}`, {
      method: 'DELETE'
    });
  },
  
  contar: async () => {
    return apiRequest('/registro/count');
  }
};

// API - Chat
const chatAPI = {
  enviar: async (nombre, mensaje) => {
    return apiRequest('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ nombre, mensaje, timestamp: Date.now() })
    });
  },
  
  listar: async () => {
    return apiRequest('/chat/list');
  },
  
  limpiar: async () => {
    return apiRequest('/chat/clear', {
      method: 'DELETE',
      headers: {
        'X-ADMIN-TOKEN': ADMIN_TOKEN
      }
    });
  }
};

// API - Balance
const balanceAPI = {
  global: {
    obtener: async () => {
      return apiRequest('/balance/global');
    },
    
    movimiento: async (tipo, monto, concepto, registradoPor) => {
      return apiRequest('/balance/global/movimiento', {
        method: 'POST',
        body: JSON.stringify({ tipo, monto, concepto, registradoPor })
      });
    }
  },
  
  miembro: {
    obtener: async (id) => {
      return apiRequest(`/balance/miembro/${id}`);
    },
    
    movimiento: async (id, tipo, monto, concepto) => {
      return apiRequest(`/balance/miembro/${id}/movimiento`, {
        method: 'POST',
        body: JSON.stringify({ tipo, monto, concepto })
      });
    }
  }
};

// API - Stats y Eventos
const statsAPI = {
  obtener: async () => {
    return apiRequest('/stats');
  },
  
  eventos: {
    listar: async () => {
      return apiRequest('/eventos/list');
    },
    
    limpiar: async () => {
      return apiRequest('/eventos/clear', {
        method: 'DELETE',
        headers: {
          'X-ADMIN-TOKEN': ADMIN_TOKEN
        }
      });
    }
  }
};


