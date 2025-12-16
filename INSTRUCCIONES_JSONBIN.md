# 🔑 Instrucciones para Configurar JSONbin

## Paso 1: Obtener tu API Key de JSONbin

1. Ve a https://jsonbin.io/
2. Crea una cuenta (es gratuita)
3. Una vez dentro, ve a tu perfil/settings
4. Busca tu **Master Key** o **API Key**
5. Copia esa clave (tiene un formato como: `$2a$10$...`)

## Paso 2: Configurar la API Key en el código

1. Abre el archivo: `js/database.js`
2. Busca la línea que dice:
   ```javascript
   const API_KEY = "$2a$10$YOUR_API_KEY_HERE"; // <-- REEMPLAZAR CON TU API KEY
   ```
3. Reemplaza `$2a$10$YOUR_API_KEY_HERE` con tu API Key real

## Paso 3: Verificar que el BIN existe

El BIN_ID ya está configurado: `69379207d0ea881f401c0889`

Si necesitas crear uno nuevo:
1. Ve a https://jsonbin.io/app
2. Crea un nuevo bin
3. Copia el BIN_ID (el número que aparece en la URL)
4. Reemplázalo en `js/database.js` en la constante `BIN_ID`

## Estructura inicial del BIN

El BIN debe tener esta estructura inicial:

```json
{
  "socios": [],
  "registros": [],
  "gastos": [],
  "ingresos": [],
  "pagos": [],
  "chat": [],
  "mensajes": [],
  "configuraciones": {}
}
```

Si el BIN está vacío, la aplicación creará esta estructura automáticamente.

## Verificar que funciona

1. Abre la aplicación en el navegador
2. Abre la consola del desarrollador (F12)
3. Busca mensajes como:
   - `✅ Datos cargados desde JSONbin correctamente`
   - `✅ Módulo database.js cargado (JSONbin)`
4. Si ves errores, verifica que tu API Key sea correcta

