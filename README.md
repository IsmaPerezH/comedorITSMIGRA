# Comedor ITSMIGRA

Aplicación móvil para la gestión del comedor del Instituto Tecnológico Superior de San Miguel El Grande.

## Características

- Gestión de beneficiarios con autenticación por correo electrónico
- Control de asistencias mediante código QR
- Gestión de roles (cocina y aseo)
- Documentos PDF (roles de cocina y aseo)
- Sistema de recordatorios con notificaciones push
- Dashboard administrativo con estadísticas en tiempo real
- Sistema de permisos para beneficiarios
- Sincronización en tiempo real con Firebase
- Interfaz moderna con tema naranja personalizado

## Tecnologías Utilizadas

### **Frontend & Framework**
- **React Native** - Framework principal para desarrollo móvil multiplataforma
- **Expo SDK 52** - Plataforma de desarrollo y herramientas
- **TypeScript** - Lenguaje de programación con tipado estático
- **Expo Router** - Sistema de navegación basado en archivos

### **Backend & Base de Datos**
- **Firebase Authentication** - Autenticación de usuarios con email/password
  - Usado en: `context/AuthContext.tsx`, `hooks/useStorage.ts`
- **Cloud Firestore** - Base de datos NoSQL en tiempo real
  - Colecciones: `beneficiarios`, `asistencias`, `roles`, `pdfs`, `permisos`, `recordatorios`
  - Sincronización en tiempo real con `onSnapshot`
  - Usado en: `hooks/useStorage.ts`

### **Funcionalidades Específicas**
- **react-native-qrcode-svg** - Generación de códigos QR
  - Usado en: `app/(tabs)/mi-qr.tsx`
- **expo-camera** - Escaneo de códigos QR
  - Usado en: `app/admin/qr-scanner.tsx`, `app/qr-scanner.tsx`
- **expo-notifications** - Sistema de notificaciones locales
  - Usado en: `hooks/useNotifications.ts`, `app/(tabs)/recordatorios.tsx`
- **react-native-reanimated** - Animaciones fluidas
  - Usado en: Todas las pantallas para animaciones de entrada (FadeInDown, FadeInRight)
- **@react-native-community/datetimepicker** - Selector de fecha y hora
  - Usado en: `app/(tabs)/recordatorios.tsx`, `app/admin/reportes.tsx`
- **expo-document-picker** - Selección de archivos PDF
  - Usado en: `app/admin/gestion-pdfs.tsx`

### **Diseño & Prototipado**
- **Figma** - Diseño de prototipos y mockups de la interfaz de usuario

### **Herramientas de Desarrollo**
- **@expo/vector-icons** - Biblioteca de iconos (Ionicons)
- **expo-constants** - Acceso a constantes del sistema
- **expo-print** - Generación de reportes PDF
- **expo-sharing** - Compartir archivos

## Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Firebase (para configuración del backend)

### Pasos de instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd comedorITSMIGRA
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

4. **Iniciar el proyecto:**
   ```bash
   npm start
   ```

5. **Ejecutar en dispositivo:**
   - Escanea el código QR con la app Expo Go (Android/iOS)
   - O presiona `a` para Android, `i` para iOS, o `w` para web

## Estructura del Proyecto

```
comedorITSMIGRA/
├── app/                      # Pantallas de la aplicación
│   ├── (tabs)/              # Pantallas con navegación por tabs (usuarios)
│   │   ├── index.tsx        # Pantalla principal del usuario
│   │   ├── mi-qr.tsx        # Código QR personal
│   │   ├── actividades.tsx  # Roles y asistencias
│   │   ├── recordatorios.tsx # Gestión de recordatorios
│   │   ├── permisos.tsx     # Solicitud de permisos
│   │   ├── asistencia.tsx   # Historial de asistencias
│   │   └── perfil.tsx       # Perfil del usuario
│   ├── admin/               # Pantallas administrativas
│   │   ├── dashboard.tsx    # Dashboard con estadísticas
│   │   ├── beneficiarios.tsx # CRUD de beneficiarios
│   │   ├── qr-scanner.tsx   # Escáner QR para registro
│   │   ├── gestion-pdfs.tsx # Gestión de documentos
│   │   └── reportes.tsx     # Reportes y estadísticas
│   ├── login.tsx            # Pantalla de inicio de sesión
│   └── index.tsx            # Pantalla de bienvenida
├── context/                 # Contextos de React
│   └── AuthContext.tsx      # Contexto de autenticación con Firebase
├── hooks/                   # Custom hooks
│   ├── useStorage.ts        # Hook principal para Firestore
│   └── useNotifications.ts  # Hook para notificaciones
├── services/                # Servicios
│   └── qrGenerator.ts       # Generación y validación de QR
├── src/                     # Configuración
│   └── firebase/
│       └── config.ts        # Configuración de Firebase
└── assets/                  # Recursos estáticos
```

## Colaboradores

- Ismael Hernández Pérez
- Brenda Vazquez Crúz
- Jose Adrian Cruz Cuevaz

## Credenciales de Prueba

**Administrador:**
- Email: 
- Contraseña:

**Beneficiario de prueba:**
- Email: (creado desde el panel de administración)
- Contraseña: (asignada al crear el beneficiario)



## Configuración de Firebase

1. Crear proyecto en Firebase Console
2. Habilitar Authentication → Email/Password
3. Crear base de datos Firestore en modo producción
4. Configurar reglas de seguridad en Firestore:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## Licencia

Este proyecto es privado y de uso exclusivo para alumnos de séptimo semestre de la carrera de Ingeniería en Tecnologías de la Información y Comunicaciones del Instituto Tecnológico Superior de San Miguel El Grande.

---