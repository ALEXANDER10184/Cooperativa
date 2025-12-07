# Guía de Despliegue (Cómo poner la App en Internet)

Para que el código QR funcione y otros miembros puedan usar la app en sus móviles, necesitas **publicar la app en internet**.

Aquí tienes la forma más fácil y gratuita de hacerlo usando **Netlify Drop**:

### Paso 1: Localiza tu carpeta
Asegúrate de saber dónde está tu carpeta `Cooperativa de vivienda` en tu ordenador. Debería contener archivos como `index.html`, `css`, `js`.

### Paso 2: Publicar en Netlify
1. Ve a [https://app.netlify.com/drop](https://app.netlify.com/drop) (No hace falta registrarse para probar, pero se recomienda crear cuenta gratuita para que el sitio no caduque).
2. Arrastra la carpeta **ENTERA** `Cooperativa de vivienda` dentro del recuadro que dice "Drag and drop your site folder here".
3. Espera unos segundos. Netlify subirá los archivos y te dará un enlace web real (algo como `https://brave-curie-12345.netlify.app`).

### Paso 3: Actualizar el QR
1. Copia ese nuevo enlace web.
2. Abre tu app localmente o desde el nuevo enlace.
3. Ve a "Compartir App (QR)".
4. Pega el nuevo enlace en el cuadro de texto.
5. ¡Listo! Ahora el QR funcionará para cualquiera que lo escanee.

---
**Nota:** Como esta app usa `localStorage` para guardar datos, recuerda que los datos se guardan **en el dispositivo** de cada persona. Si tú registras un socio en tu ordenador, no aparecerá automáticamente en el móvil de otra persona a menos que uses una base de datos real (lo cual requiere un desarrollo más complejo).
