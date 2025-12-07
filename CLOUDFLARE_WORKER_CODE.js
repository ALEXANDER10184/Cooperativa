// ============================================
// CLOUDFLARE WORKER CODE
// Copia y pega este código EXACTAMENTE en tu Worker
// ============================================

export default {
  async fetch(request, env) {
    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response("", {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // GET → respuesta simple
    if (request.method === "GET") {
      return new Response("Worker activo. Usa POST.", {
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // POST → guardar en KV
    if (request.method === "POST") {
      const data = await request.json();
      const key = `reg-${Date.now()}`;
      await env.REGISTROS.put(key, JSON.stringify(data));
      
      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response("Método no permitido", { status: 405 });
  }
}

// ============================================
// INSTRUCCIONES PARA CONFIGURAR EL WORKER:
// ============================================
// 1. Ve a tu dashboard de Cloudflare Workers
// 2. Abre el Worker: rough-lake-0310
// 3. Reemplaza TODO el código actual con este código
// 4. Ve a Settings → KV Namespace Bindings
// 5. Asegúrate de que "REGISTROS" esté vinculado:
//    - Variable name: REGISTROS
//    - KV namespace: (selecciona o crea uno llamado REGISTROS)
// 6. Guarda y despliega
// ============================================
