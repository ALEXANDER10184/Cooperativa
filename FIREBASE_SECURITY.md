# 🔒 Seguridad de Firebase Realtime Database

## 📋 Resumen

Este documento explica cómo funcionan las reglas de seguridad de Firebase en la aplicación Cooperativa Provivienda "Mi Esperanza".

## 🎯 Permisos por Tipo de Usuario

### 👤 Usuario Público (Sin autenticación)

**Puede:**
- ✅ Leer datos generales (chat, balance resumen, lista de socios)
- ✅ Registrarse como nuevo socio
- ✅ Enviar mensajes al chat comunitario
- ✅ Ver el balance de la cooperativa

**NO puede:**
- ❌ Agregar ingresos o gastos
- ❌ Editar o eliminar socios existentes
- ❌ Modificar el balance
- ❌ Eliminar mensajes del chat

### 👑 Administrador

**Puede:**
- ✅ Todo lo que puede un usuario público
- ✅ Agregar ingresos y gastos
- ✅ Editar y eliminar socios
- ✅ Modificar el balance
- ✅ Eliminar mensajes del chat
- ✅ Limpiar el chat completo

## 🔐 Sistema de Autenticación

La aplicación usa un sistema de autenticación basado en `localStorage`:

- **Campo:** `cooperativa_admin_session`
- **Estructura:**
  ```json
  {
    "authenticated": true,
    "timestamp": 1234567890
  }
  ```
- **Expiración:** 2 horas después del login
- **Contraseña admin:** `esperanza2025`

### Función `isAdmin()`

La función `isAdmin()` verifica:
1. Si existe una sesión de administrador en `localStorage`
2. Si la sesión está autenticada
3. Si la sesión no ha expirado (2 horas)

## 📝 Reglas de Firebase

### Estructura de Reglas

Las reglas están definidas en `firebase-rules.json` y se validan en el servidor de Firebase.

#### `/socios`
- **Lectura:** Pública ✅
- **Escritura:** 
  - Crear nuevo socio: Público ✅
  - Editar/Eliminar: Solo admin (requiere `adminToken`) 🔒

#### `/chat`
- **Lectura:** Pública ✅
- **Escritura:** Pública ✅ (con validaciones)
- **Eliminación:** Solo admin 🔒

#### `/ingresos` y `/gastos`
- **Lectura:** Pública ✅
- **Escritura:** Solo admin (requiere `adminToken`) 🔒
- **Eliminación:** Solo admin 🔒

#### `/balance`
- **Lectura:** Pública ✅
- **Escritura:** Solo admin (requiere `adminToken`) 🔒

## 🛡️ Validaciones Implementadas

### Validaciones de Datos

1. **No valores null:** Todos los campos requeridos deben tener valores
2. **No strings vacíos:** Los campos de texto no pueden estar vacíos
3. **Montos positivos:** Los montos (ingresos, gastos) deben ser > 0
4. **Timestamps automáticos:** Se agregan automáticamente con `Date.now()`
5. **Longitud de mensajes:** 
   - Nombre: máximo 50 caracteres
   - Mensaje: máximo 500 caracteres

### Validaciones de Seguridad

- **Admin Token:** Las operaciones administrativas requieren `adminToken: 'esperanza2025'`
- **Validación en cliente:** `isAdmin()` verifica permisos antes de operaciones sensibles
- **Validación en servidor:** Firebase Rules valida el `adminToken` en cada escritura

## 🔧 Funciones Seguras

El archivo `firebase-global.js` exporta funciones seguras:

- `saveDataSecure(path, data, requireAdmin)` - Guarda datos con validación de admin
- `pushDataSecure(path, data, requireAdmin)` - Agrega datos con validación de admin
- `updateDataSecure(path, data, requireAdmin)` - Actualiza datos con validación de admin
- `deleteDataSecure(path, requireAdmin)` - Elimina datos con validación de admin

## 📤 Desplegar Reglas

### Opción 1: Script Automático

```bash
chmod +x deploy_rules.sh
./deploy_rules.sh
```

### Opción 2: Manual

```bash
firebase deploy --only database
```

### Requisitos

1. Instalar Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Iniciar sesión:
   ```bash
   firebase login
   ```

3. Inicializar proyecto (si es necesario):
   ```bash
   firebase init database
   ```

## 🔑 Cambiar Contraseña de Administrador

### Paso 1: Actualizar en el código

1. Edita `js/main.js`:
   ```javascript
   const ADMIN_PASSWORD = 'tu-nueva-contraseña';
   ```

2. Edita `js/admin.js`:
   ```javascript
   const ADMIN_PASSWORD = 'tu-nueva-contraseña';
   ```

3. Edita `firebase-rules.json`:
   - Reemplaza todas las instancias de `'esperanza2025'` con tu nueva contraseña

4. Edita `js/firebase-global.js`:
   ```javascript
   const ADMIN_TOKEN = 'tu-nueva-contraseña';
   ```

### Paso 2: Desplegar reglas

```bash
./deploy_rules.sh
```

### Paso 3: Limpiar sesiones existentes

Los usuarios deberán iniciar sesión nuevamente con la nueva contraseña.

## ⚠️ Consideraciones de Seguridad

1. **Token en código:** El `adminToken` está visible en el código del cliente. Para mayor seguridad, considera usar Firebase Authentication.

2. **Reglas del servidor:** Las reglas de Firebase son la última línea de defensa. Siempre valida en el servidor.

3. **Sesiones:** Las sesiones expiran después de 2 horas por seguridad.

4. **Validación doble:** Se valida tanto en el cliente (`isAdmin()`) como en el servidor (Firebase Rules).

## 🐛 Troubleshooting

### Error: "Permission denied"

- Verifica que estés autenticado como admin
- Verifica que la sesión no haya expirado
- Verifica que las reglas estén desplegadas correctamente

### Error: "Validation failed"

- Verifica que todos los campos requeridos estén presentes
- Verifica que los montos sean positivos
- Verifica que los strings no estén vacíos

### Las reglas no se actualizan

- Verifica que `firebase-rules.json` esté actualizado
- Ejecuta `./deploy_rules.sh` nuevamente
- Verifica en Firebase Console que las reglas estén actualizadas

