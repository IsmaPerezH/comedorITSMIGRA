# 🍽️ Comedor ITSMIGRA

Aplicación móvil para la gestión del comedor del Instituto Tecnológico Superior de Misantla.

## 📱 Características

- ✅ Gestión de beneficiarios
- ✅ Control de asistencias mediante código QR
- ✅ Gestión de roles (cocina y aseo)
- ✅ Documentos PDF (rools de cocina y aseo)
- ✅ Sistema de recordatorios
- ✅ Dashboard administrativo
- ✅ Autenticación de usuarios

## 🛠️ Tecnologías

- **Framework:** React Native con Expo
- **Navegación:** Expo Router
- **Almacenamiento:** AsyncStorage
- **Lenguaje:** TypeScript
- **Generación QR:** react-native-qrcode-svg
- **Iconos:** @expo/vector-icons

## 🚀 Instalación

### Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn
- Expo CLI

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

3. **Iniciar el proyecto:**
   ```bash
   npm start
   ```

4. **Ejecutar en dispositivo:**
   - Escanea el código QR con la app Expo Go (Android/iOS)
   - O presiona `w` para abrir en el navegador web

## 📂 Estructura del Proyecto

```
comedorITSMIGRA/
├── app/                    # Pantallas de la aplicación
│   ├── (tabs)/            # Pantallas con navegación por tabs
│   ├── admin/             # Pantallas administrativas
│   └── _layout.tsx        # Layout principal
├── components/            # Componentes reutilizables
├── context/              # Contextos de React (Auth, etc.)
├── hooks/                # Custom hooks (useStorage, useNotifications)
├── services/             # Servicios (QR Generator)
└── assets/               # Imágenes y recursos estáticos
```

## 👥 Colaboradores

- Tu Nombre - Desarrollador Principal
- [Nombre del colaborador] - Desarrollador

## 📝 Flujo de Trabajo con Git

### Para trabajar en una nueva funcionalidad:

1. **Actualizar tu rama local:**
   ```bash
   git pull origin main
   ```

2. **Crear una nueva rama:**
   ```bash
   git checkout -b feature/nombre-de-la-funcionalidad
   ```

3. **Hacer cambios y commits:**
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   ```

4. **Subir cambios:**
   ```bash
   git push origin feature/nombre-de-la-funcionalidad
   ```

5. **Crear Pull Request en GitHub**

## 🔐 Credenciales de Prueba

**Administrador:**
- Usuario: admin
- Contraseña: admin123

**Beneficiario de prueba:**
- Matrícula: 22105081
- Contraseña: (generada automáticamente)

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para el Instituto Tecnológico Superior de Misantla.
