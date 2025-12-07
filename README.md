# Cooperativa Provivienda "Mi Esperanza"

Aplicación web para la gestión de una cooperativa de vivienda, desarrollada con HTML, CSS y JavaScript, utilizando Firebase como base de datos en tiempo real.

## 🏠 Características

- **Registro de socios**: Sistema de registro para nuevos miembros de la cooperativa
- **Panel de administración**: Gestión administrativa de la cooperativa
- **Chat comunitario**: Comunicación en tiempo real entre miembros
- **Balance de la cooperativa**: Visualización del estado financiero
- **Multiidioma**: Soporte para Español, Inglés, Francés, Rumano y Árabe
- **Accesibilidad**: Modo de texto grande y diseño responsive
- **Compartir por QR**: Generación de códigos QR para compartir la aplicación

## 🚀 Tecnologías

- HTML5
- CSS3
- JavaScript (Vanilla)
- Firebase Realtime Database
- Material Icons
- Google Fonts (Inter)

## 📁 Estructura del Proyecto

```
Cooperativa de vivienda/
├── index.html          # Página principal
├── registro.html       # Registro de nuevos socios
├── admin.html          # Panel de administración
├── chat.html           # Chat comunitario
├── balance.html        # Balance de la cooperativa
├── css/
│   └── style.css      # Estilos principales
├── js/
│   ├── firebase.js    # Configuración y funciones de Firebase
│   ├── main.js        # Lógica principal
│   ├── registro.js    # Lógica de registro
│   ├── admin.js       # Lógica de administración
│   ├── chat.js        # Lógica del chat
│   └── i18n.js        # Sistema de internacionalización
└── GUIA_DESPLIEGUE.md # Guía para desplegar la aplicación
```

## ⚙️ Configuración

### Firebase Setup

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Realtime Database en tu proyecto
3. Edita `js/firebase.js` y reemplaza la configuración con tus credenciales:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### Acceso

- **Código de acceso predeterminado**: `esperanza`
- Puedes cambiar este código en `js/main.js`

## 📱 Despliegue

Consulta `GUIA_DESPLIEGUE.md` para instrucciones detalladas sobre cómo publicar la aplicación en internet (recomendado: Netlify).

## 🌐 Idiomas Soportados

- 🇪🇸 Español
- 🇬🇧 Inglés
- 🇫🇷 Francés
- 🇷🇴 Rumano
- 🇸🇦 Árabe

## 📝 Notas Importantes

- La aplicación utiliza `localStorage` para algunas funcionalidades locales
- Para uso en producción, se recomienda configurar Firebase Realtime Database
- El código QR solo funcionará si la aplicación está desplegada en una URL pública

## 📄 Licencia

Este proyecto es de uso privado para la Cooperativa Provivienda "Mi Esperanza".

