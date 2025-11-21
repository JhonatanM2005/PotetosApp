# 🍟 PotetosApp

Sistema de gestión integral para restaurantes con gestión de órdenes, cocina, mesas y usuarios en tiempo real.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Descripción

PotetosApp es una aplicación completa para la gestión de restaurantes que incluye:

- 🍽️ **Gestión de Menú**: Administración de categorías y platos con precios y disponibilidad
- 📋 **Sistema de Órdenes**: Creación, seguimiento y actualización de estados en tiempo real
- 👨‍🍳 **Módulo de Cocina**: Visualización de órdenes pendientes y en preparación
- 🪑 **Gestión de Mesas**: Control de disponibilidad y asignación de mesas
- 👥 **Administración de Usuarios**: Roles diferenciados (Admin, Mesero, Chef, Cajero)
- 📊 **Dashboard de Estadísticas**: Reportes de ventas y rendimiento
- 🔔 **Notificaciones en Tiempo Real**: Comunicación instantánea mediante Socket.io

## 🚀 Tecnologías

### Backend

- **Node.js** + **Express.js** - Framework del servidor
- **PostgreSQL** - Base de datos relacional
- **Sequelize ORM** - Mapeo objeto-relacional
- **Socket.io** - Comunicación en tiempo real
- **JWT** - Autenticación y autorización
- **Brevo (Sendinblue)** - Servicio de envío de emails
- **Bcrypt** - Encriptación de contraseñas

### Frontend

- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Build tool y dev server
- **Zustand** - Gestión de estado global
- **TailwindCSS** - Framework de estilos
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Socket.io Client** - Cliente WebSocket
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos

## 📁 Estructura del Proyecto

```
PotetosApp/
├── PotetosBackend/          # Servidor Node.js
│   ├── src/
│   │   ├── config/          # Configuraciones (DB, Socket)
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── middlewares/     # Middlewares (auth, error)
│   │   ├── models/          # Modelos de Sequelize
│   │   ├── routes/          # Rutas de la API
│   │   └── services/        # Servicios (email, etc)
│   ├── logs/                # Logs de la aplicación
│   ├── Dockerfile           # Configuración Docker
│   └── server.js            # Punto de entrada
│
└── PotetosFrontend/         # Aplicación React
    ├── src/
    │   ├── assets/          # Imágenes y recursos
    │   ├── components/      # Componentes React
    │   │   ├── common/      # Componentes reutilizables
    │   │   ├── layout/      # Layouts
    │   │   └── ...          # Módulos específicos
    │   ├── pages/           # Páginas de la aplicación
    │   │   ├── auth/        # Login, registro, etc
    │   │   ├── dashboard/   # Módulos del dashboard
    │   │   └── public/      # Páginas públicas
    │   ├── services/        # Servicios y API
    │   ├── store/           # Estado global (Zustand)
    │   └── utils/           # Utilidades
    ├── Dockerfile           # Configuración Docker
    └── nginx.conf           # Configuración Nginx
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn
- Docker (opcional)

### 1. Clonar el repositorio

```bash
git clone https://github.com/JhonatanM2005/PotetosApp.git
cd PotetosApp
```

### 2. Configurar Backend

```bash
cd PotetosBackend
npm install
```

Crear archivo `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/potetos_db

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS
FRONTEND_URL=http://localhost:5173

# Email (Brevo)
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@potetos.com
BREVO_SENDER_NAME=Potetos App
```

Iniciar servidor:

```bash
npm start
# o en modo desarrollo
npm run dev
```

### 3. Configurar Frontend

```bash
cd ../PotetosFrontend
npm install
```

Crear archivo `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Iniciar aplicación:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🐳 Docker

### Construcción de imágenes

```bash
# Backend
cd PotetosBackend
docker build -t potetos-backend .

# Frontend
cd ../PotetosFrontend
docker build -t potetos-frontend .
```

### Ejecución con Docker Compose

```bash
docker-compose up -d
```

## 👥 Roles de Usuario

| Rol        | Permisos                                           |
| ---------- | -------------------------------------------------- |
| **Admin**  | Acceso completo a todos los módulos                |
| **Mesero** | Gestión de órdenes y mesas                         |
| **Chef**   | Visualización y actualización de órdenes en cocina |
| **Cajero** | Gestión de pagos y cierre de órdenes               |

## 📡 API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/forgot-password` - Solicitar código de recuperación
- `POST /api/auth/verify-code` - Verificar código
- `POST /api/auth/reset-password` - Restablecer contraseña

### Órdenes

- `GET /api/orders` - Obtener todas las órdenes
- `POST /api/orders` - Crear nueva orden
- `GET /api/orders/:id` - Obtener orden por ID
- `PATCH /api/orders/:id/status` - Actualizar estado
- `DELETE /api/orders/:id` - Eliminar orden

### Platos

- `GET /api/dishes` - Obtener todos los platos
- `POST /api/dishes` - Crear nuevo plato
- `PUT /api/dishes/:id` - Actualizar plato
- `DELETE /api/dishes/:id` - Eliminar plato

### Mesas

- `GET /api/tables` - Obtener todas las mesas
- `POST /api/tables` - Crear nueva mesa
- `PUT /api/tables/:id` - Actualizar mesa
- `DELETE /api/tables/:id` - Eliminar mesa

Ver documentación completa en `/api/docs` (próximamente)

## 🔌 Eventos Socket.io

### Cliente → Servidor

- `join:role` - Unirse a sala por rol
- `join:kitchen` - Unirse a sala de cocina
- `join:waiters` - Unirse a sala de meseros

### Servidor → Cliente

- `kitchen:newOrder` - Nueva orden creada
- `order:statusChanged` - Estado de orden actualizado
- `order:ready` - Orden lista para servir
- `order:itemStatusChanged` - Item actualizado

## 📊 Base de Datos

### Modelos principales

- **Users** - Usuarios del sistema
- **Categories** - Categorías de platos
- **Dishes** - Platos del menú
- **Orders** - Órdenes de clientes
- **OrderItems** - Items de cada orden
- **Tables** - Mesas del restaurante
- **PasswordResets** - Tokens de recuperación de contraseña

### Diagrama ER

```
Users ──┐
        ├── Orders ──┬── OrderItems ── Dishes
Tables ─┘            └── Categories
```

## 🌐 Deploy

### Railway

La aplicación está configurada para deploy en Railway:

```bash
# Los archivos railway.json están configurados en cada carpeta
# Railway detectará automáticamente el proyecto al conectar con GitHub
```

### Variables de entorno en producción

Asegúrate de configurar todas las variables de entorno en tu plataforma de deployment.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Jhonatan M**

- GitHub: [@JhonatanM2005](https://github.com/JhonatanM2005)
- Email: alex.m200575@gmail.com

## 🙏 Agradecimientos

- Iconos por [Lucide](https://lucide.dev/)
- Estilos por [TailwindCSS](https://tailwindcss.com/)
- Inspiración en sistemas POS modernos

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!
