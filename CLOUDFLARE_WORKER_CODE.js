// ============================================
// CLOUDFLARE WORKER - API REST COOPERATIVA
// ============================================

// CORS Headers Helper
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://alexander10184.github.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-ADMIN-TOKEN'
  };
}

// Preflight Handler
function handleOptions() {
  return new Response('', {
    status: 204,
    headers: getCorsHeaders()
  });
}

// Admin Token Validation
function isAdminAuthorized(request, env) {
  const token = request.headers.get('X-ADMIN-TOKEN');
  return token && token === env.ADMIN_TOKEN;
}

// Generate Unique ID
function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Log Event
async function logEvent(env, tipo, descripcion, origen) {
  const eventId = generateId('evt');
  const event = {
    tipo,
    descripcion,
    timestamp: Date.now(),
    origen
  };
  await env.EVENTOS.put(eventId, JSON.stringify(event));
}

// ============================================
// REGISTRO DE MIEMBROS
// ============================================

async function handlePostRegistro(request, env) {
  try {
    const data = await request.json();
    const id = generateId('soc');
    
    const member = {
      id,
      nombre: data.nombre || '',
      apellido: data.apellido || '',
      email: data.email || '',
      telefono: data.telefono || '',
      ciudad: data.ciudad || '',
      aporteMensual: parseFloat(data.aporteMensual) || 0,
      timestamp: data.timestamp || Date.now(),
      estado: data.estado || 'activo'
    };
    
    await env.REGISTROS.put(id, JSON.stringify(member));
    await logEvent(env, 'nuevo_registro', `Nuevo miembro: ${member.nombre} ${member.apellido}`, 'registro');
    
    return new Response(JSON.stringify({ ok: true, id }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetRegistroList(request, env) {
  try {
    const url = new URL(request.url);
    const estadoFilter = url.searchParams.get('estado');
    
    const list = await env.REGISTROS.list();
    const members = [];
    
    for (const key of list.keys) {
      const memberData = await env.REGISTROS.get(key.name);
      if (memberData) {
        const member = JSON.parse(memberData);
        if (!estadoFilter || member.estado === estadoFilter) {
          members.push(member);
        }
      }
    }
    
    return new Response(JSON.stringify(members), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetRegistroById(request, env, id) {
  try {
    const memberData = await env.REGISTROS.get(id);
    if (!memberData) {
      return new Response(JSON.stringify({ error: 'Miembro no encontrado' }), {
        status: 404,
        headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(memberData, {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handlePutRegistro(request, env, id) {
  try {
    const data = await request.json();
    const existingData = await env.REGISTROS.get(id);
    
    if (!existingData) {
      return new Response(JSON.stringify({ error: 'Miembro no encontrado' }), {
        status: 404,
        headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
      });
    }
    
    const member = { ...JSON.parse(existingData), ...data, id };
    await env.REGISTROS.put(id, JSON.stringify(member));
    await logEvent(env, 'actualizacion_miembro', `Miembro actualizado: ${id}`, 'registro');
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handleDeleteRegistro(request, env, id) {
  try {
    const memberData = await env.REGISTROS.get(id);
    if (!memberData) {
      return new Response(JSON.stringify({ error: 'Miembro no encontrado' }), {
        status: 404,
        headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
      });
    }
    
    const member = JSON.parse(memberData);
    member.estado = 'inactivo';
    await env.REGISTROS.put(id, JSON.stringify(member));
    await logEvent(env, 'miembro_desactivado', `Miembro desactivado: ${id}`, 'registro');
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetRegistroCount(env) {
  try {
    const list = await env.REGISTROS.list();
    let total = 0;
    let activos = 0;
    let inactivos = 0;
    
    for (const key of list.keys) {
      const memberData = await env.REGISTROS.get(key.name);
      if (memberData) {
        total++;
        const member = JSON.parse(memberData);
        if (member.estado === 'activo') activos++;
        else inactivos++;
      }
    }
    
    return new Response(JSON.stringify({ total, activos, inactivos }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// CHAT PÚBLICO
// ============================================

async function handlePostChatSend(request, env) {
  try {
    const data = await request.json();
    const nombre = (data.nombre || '').trim().substring(0, 50);
    const mensaje = (data.mensaje || '').trim().substring(0, 500);
    
    if (!nombre || !mensaje) {
      return new Response(JSON.stringify({ ok: false, error: 'Nombre y mensaje requeridos' }), {
        status: 400,
        headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
      });
    }
    
    const chatId = generateId('chat');
    const chatMessage = {
      id: chatId,
      nombre,
      mensaje,
      timestamp: data.timestamp || Date.now()
    };
    
    await env.CHAT.put(chatId, JSON.stringify(chatMessage));
    await logEvent(env, 'mensaje_chat', `Mensaje de ${nombre}`, 'chat');
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetChatList(env) {
  try {
    const list = await env.CHAT.list();
    const messages = [];
    
    for (const key of list.keys) {
      const messageData = await env.CHAT.get(key.name);
      if (messageData) {
        messages.push(JSON.parse(messageData));
      }
    }
    
    // Ordenar por timestamp ascendente y limitar a 100
    messages.sort((a, b) => a.timestamp - b.timestamp);
    const last100 = messages.slice(-100);
    
    return new Response(JSON.stringify(last100), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handleDeleteChatClear(request, env) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const list = await env.CHAT.list();
    for (const key of list.keys) {
      await env.CHAT.delete(key.name);
    }
    await logEvent(env, 'chat_limpiado', 'Chat limpiado por admin', 'admin');
    
    return new Response(JSON.stringify({ cleared: true }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// BALANCES
// ============================================

async function handleGetBalanceGlobal(env) {
  try {
    const balanceData = await env.BALANCES.get('global');
    if (!balanceData) {
      return new Response(JSON.stringify({ saldo: 0, ultimaActualizacion: Date.now() }), {
        headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(balanceData, {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handlePostBalanceGlobalMovimiento(request, env) {
  try {
    const data = await request.json();
    const { tipo, monto, concepto, registradoPor } = data;
    
    if (!tipo || !monto || tipo !== 'ingreso' && tipo !== 'gasto') {
      return new Response(JSON.stringify({ ok: false, error: 'Datos inválidos' }), {
        status: 400,
        headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
      });
    }
    
    const balanceData = await env.BALANCES.get('global');
    let balance = { saldo: 0, movimientos: [] };
    
    if (balanceData) {
      balance = JSON.parse(balanceData);
    }
    
    const movimiento = tipo === 'ingreso' ? parseFloat(monto) : -parseFloat(monto);
    balance.saldo += movimiento;
    balance.ultimaActualizacion = Date.now();
    
    balance.movimientos.push({
      tipo,
      monto: parseFloat(monto),
      concepto: concepto || '',
      registradoPor: registradoPor || 'sistema',
      timestamp: Date.now()
    });
    
    // Mantener solo últimos 100 movimientos
    if (balance.movimientos.length > 100) {
      balance.movimientos = balance.movimientos.slice(-100);
    }
    
    await env.BALANCES.put('global', JSON.stringify(balance));
    await logEvent(env, 'movimiento_global', `${tipo}: ${monto} - ${concepto}`, 'balance');
    
    return new Response(JSON.stringify({ ok: true, nuevoSaldo: balance.saldo }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetBalanceMiembro(env, id) {
  try {
    const balanceData = await env.BALANCES.get(`miembro-${id}`);
    if (!balanceData) {
      return new Response(JSON.stringify({ id, saldo: 0, movimientos: [] }), {
        headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(balanceData, {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handlePostBalanceMiembroMovimiento(request, env, id) {
  try {
    const data = await request.json();
    const { tipo, monto, concepto } = data;
    
    if (!tipo || !monto || tipo !== 'ingreso' && tipo !== 'gasto') {
      return new Response(JSON.stringify({ ok: false, error: 'Datos inválidos' }), {
        status: 400,
        headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
      });
    }
    
    const balanceData = await env.BALANCES.get(`miembro-${id}`);
    let balance = { id, saldo: 0, movimientos: [] };
    
    if (balanceData) {
      balance = JSON.parse(balanceData);
    }
    
    const movimiento = tipo === 'ingreso' ? parseFloat(monto) : -parseFloat(monto);
    balance.saldo += movimiento;
    
    balance.movimientos.push({
      tipo,
      monto: parseFloat(monto),
      concepto: concepto || '',
      timestamp: Date.now()
    });
    
    if (balance.movimientos.length > 100) {
      balance.movimientos = balance.movimientos.slice(-100);
    }
    
    await env.BALANCES.put(`miembro-${id}`, JSON.stringify(balance));
    await logEvent(env, 'movimiento_miembro', `${tipo}: ${monto} - ${id}`, 'balance');
    
    return new Response(JSON.stringify({ ok: true, nuevoSaldo: balance.saldo }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// ESTADÍSTICAS Y EVENTOS
// ============================================

async function handleGetStats(env) {
  try {
    // Miembros
    const miembrosList = await env.REGISTROS.list();
    let miembrosTotales = 0;
    let miembrosActivos = 0;
    let ultimoRegistro = 0;
    
    for (const key of miembrosList.keys) {
      const memberData = await env.REGISTROS.get(key.name);
      if (memberData) {
        miembrosTotales++;
        const member = JSON.parse(memberData);
        if (member.estado === 'activo') miembrosActivos++;
        if (member.timestamp > ultimoRegistro) ultimoRegistro = member.timestamp;
      }
    }
    
    // Chat
    const chatList = await env.CHAT.list();
    const mensajesChat = chatList.keys.length;
    let ultimoMensajeChat = 0;
    
    for (const key of chatList.keys) {
      const messageData = await env.CHAT.get(key.name);
      if (messageData) {
        const message = JSON.parse(messageData);
        if (message.timestamp > ultimoMensajeChat) ultimoMensajeChat = message.timestamp;
      }
    }
    
    // Balance global
    const balanceData = await env.BALANCES.get('global');
    let saldoGlobal = 0;
    if (balanceData) {
      const balance = JSON.parse(balanceData);
      saldoGlobal = balance.saldo || 0;
    }
    
    return new Response(JSON.stringify({
      miembrosTotales,
      miembrosActivos,
      mensajesChat,
      saldoGlobal,
      ultimoRegistro,
      ultimoMensajeChat,
      uptime: Date.now()
    }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handleGetEventosList(env) {
  try {
    const list = await env.EVENTOS.list();
    const eventos = [];
    
    for (const key of list.keys) {
      const eventData = await env.EVENTOS.get(key.name);
      if (eventData) {
        eventos.push(JSON.parse(eventData));
      }
    }
    
    // Ordenar por timestamp descendente y limitar a 50
    eventos.sort((a, b) => b.timestamp - a.timestamp);
    const last50 = eventos.slice(0, 50);
    
    return new Response(JSON.stringify(last50), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

async function handleDeleteEventosClear(request, env) {
  if (!isAdminAuthorized(request, env)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const list = await env.EVENTOS.list();
    for (const key of list.keys) {
      await env.EVENTOS.delete(key.name);
    }
    
    return new Response(JSON.stringify({ cleared: true }), {
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

// ============================================
// MAIN ROUTER
// ============================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // Handle OPTIONS (CORS preflight)
    if (method === 'OPTIONS') {
      return handleOptions();
    }
    
    // Route: /registro
    if (path === '/registro' && method === 'POST') {
      return handlePostRegistro(request, env);
    }
    
    if (path === '/registro/list' && method === 'GET') {
      return handleGetRegistroList(request, env);
    }
    
    if (path === '/registro/count' && method === 'GET') {
      return handleGetRegistroCount(env);
    }
    
    if (path.startsWith('/registro/') && method === 'GET') {
      const id = path.split('/')[2];
      return handleGetRegistroById(request, env, id);
    }
    
    if (path.startsWith('/registro/') && method === 'PUT') {
      const id = path.split('/')[2];
      return handlePutRegistro(request, env, id);
    }
    
    if (path.startsWith('/registro/') && method === 'DELETE') {
      const id = path.split('/')[2];
      return handleDeleteRegistro(request, env, id);
    }
    
    // Route: /chat
    if (path === '/chat/send' && method === 'POST') {
      return handlePostChatSend(request, env);
    }
    
    if (path === '/chat/list' && method === 'GET') {
      return handleGetChatList(env);
    }
    
    if (path === '/chat/clear' && method === 'DELETE') {
      return handleDeleteChatClear(request, env);
    }
    
    // Route: /balance
    if (path === '/balance/global' && method === 'GET') {
      return handleGetBalanceGlobal(env);
    }
    
    if (path === '/balance/global/movimiento' && method === 'POST') {
      return handlePostBalanceGlobalMovimiento(request, env);
    }
    
    if (path.startsWith('/balance/miembro/') && method === 'GET') {
      const id = path.split('/')[3];
      return handleGetBalanceMiembro(env, id);
    }
    
    if (path.startsWith('/balance/miembro/') && path.endsWith('/movimiento') && method === 'POST') {
      const parts = path.split('/');
      const id = parts[3];
      return handlePostBalanceMiembroMovimiento(request, env, id);
    }
    
    // Route: /stats
    if (path === '/stats' && method === 'GET') {
      return handleGetStats(env);
    }
    
    // Route: /eventos
    if (path === '/eventos/list' && method === 'GET') {
      return handleGetEventosList(env);
    }
    
    if (path === '/eventos/clear' && method === 'DELETE') {
      return handleDeleteEventosClear(request, env);
    }
    
    // Default response
    return new Response('API Cooperativa - Endpoint no encontrado', {
      status: 404,
      headers: getCorsHeaders()
    });
  }
};
