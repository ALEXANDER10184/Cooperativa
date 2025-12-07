// ============================================
// CLOUDFLARE WORKER CODE
// Copia y pega este código en tu Worker de Cloudflare
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

    // GET (solo mensaje simple)
    if (request.method === "GET") {
      return new Response("Worker activo. Usa POST.", {
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // POST — guardar datos en KV
    if (request.method === "POST") {
      try {
        const data = await request.json();
        const key = `registro-${Date.now()}`;
        await env.REGISTROS.put(key, JSON.stringify(data));
        
        return new Response(JSON.stringify({ ok: true }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }

    return new Response("Método no permitido", { 
      status: 405,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}

// ============================================
// INSTRUCCIONES PARA CONFIGURAR EL WORKER:
// ============================================
// 1. Ve a tu dashboard de Cloudflare Workers
// 2. Abre el Worker: rough-lake-0310
// 3. Reemplaza el código actual con este código
// 4. Asegúrate de que el KV namespace "REGISTROS" esté vinculado al Worker
// 5. Guarda y despliega
// ============================================

