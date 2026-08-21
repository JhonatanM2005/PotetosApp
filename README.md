# 🍟 PotetosApp

Sistema de gestión integral para restaurantes con gestión de órdenes, cocina, mesas y usuarios en tiempo real.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-4.0+-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-06B6D4)
![License](https://img.shields.io/badge/license-MIT-green)

## 📑 Tabla de Contenido

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Características Técnicas](#-características-técnicas)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#️-instalación-y-configuración)
- [Inicio Rápido](#-inicio-rápido)
- [Docker](#-docker)
- [Roles de Usuario](#-roles-de-usuario)
- [API Endpoints](#-api-endpoints)
- [Eventos Socket.io](#-eventos-socketio)
- [Base de Datos](#-base-de-datos)
- [Deploy](#-deploy)
- [Contribuir](#-contribuir)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)
- [Autor](#-autor)

## 📋 Descripción

PotetosApp es una solución completa y moderna para la gestión integral de restaurantes. Diseñada con arquitectura cliente-servidor y comunicación en tiempo real, permite optimizar los procesos operativos del restaurante desde la toma de pedidos hasta el cobro final.

## ✨ Características Principales

- 🍽️ **Gestión de Menú**: Administración completa de categorías y platos con precios y descripciones
- 📋 **Sistema de Órdenes**: Creación, seguimiento y actualización de estados en tiempo real con WebSockets
- 👨‍🍳 **Módulo de Cocina**: Visualización de órdenes pendientes, en preparación y completadas con gestión por items
- 🪑 **Gestión de Mesas**: Control de disponibilidad, capacidad y asignación dinámica de mesas
- 💰 **Sistema de Caja**: Procesamiento de pagos, división de cuentas y facturación
- 📅 **Reservaciones**: Sistema de gestión de reservas de mesas
- 👥 **Administración de Usuarios**: Sistema de roles diferenciados (Admin, Mesero, Chef, Cajero)
- 📊 **Dashboard Analítico**: Reportes de ventas, platos más vendidos y estadísticas de rendimiento
- 🔔 **Notificaciones Push**: Comunicación instantánea entre módulos mediante Socket.io
- 🔐 **Seguridad**: Autenticación JWT, recuperación de contraseña por email, detección de inactividad
- 📱 **Responsive**: Interfaz adaptable a dispositivos móviles y tablets

## 🎯 Características Técnicas

- ⚡ **Rendimiento**: Build optimizado con Vite, lazy loading de componentes
- 🔄 **Estado Global**: Gestión eficiente con Zustand (alternativa ligera a Redux)
- 🎨 **UI/UX Moderna**: Diseño limpio y profesional con TailwindCSS
- 🔌 **Tiempo Real**: Sincronización instantánea entre dispositivos con Socket.io
- 🛡️ **Seguridad**: Protección contra XSS, CSRF, validación de inputs
- 📦 **Modular**: Arquitectura escalable y mantenible
- 🐳 **Containerizado**: Preparado para Docker y orquestación
- 🔍 **SEO Friendly**: Rutas y metadatos optimizados
- ♿ **Accesible**: Cumple con estándares WCAG
- 🌐 **CORS Configurado**: Comunicación segura entre frontend y backend

## 🚀 Tecnologías

### Backend

- **Node.js** + **Express.js** - Framework del servidor
- **PostgreSQL** - Base de datos relacional
- **Sequelize ORM** - Mapeo objeto-relacional con migraciones
- **Socket.io** - Comunicación bidireccional en tiempo real
- **JWT (jsonwebtoken)** - Autenticación y autorización
- **Brevo (Sendinblue)** - Servicio de envío de emails transaccionales
- **Bcrypt** - Hash y encriptación de contraseñas
- **Cors** - Control de acceso cross-origin
- **dotenv** - Gestión de variables de entorno

### Frontend

- **React 18** - Biblioteca de interfaz de usuario con hooks
- **Vite** - Build tool ultrarrápido y dev server
- **Zustand** - Gestión de estado global ligera y eficiente
- **TailwindCSS** - Framework de estilos utility-first
- **React Router v6** - Enrutamiento declarativo
- **Axios** - Cliente HTTP con interceptores
- **Socket.io Client** - Cliente WebSocket para tiempo real
- **React Hot Toast** - Sistema de notificaciones elegantes
- **Lucide React** - Biblioteca de iconos modernos
- **date-fns** - Manejo de fechas y formatos

### DevOps & Deployment

- **Docker** - Containerización de aplicaciones
- **Nginx** - Servidor web para el frontend
- **Railway** - Plataforma de deployment cloud
- **Git** - Control de versiones

## 📁 Estructura del Proyecto

```
PotetosApp/
├── PotetosBackend/              # Servidor Node.js/Express
│   ├── src/
│   │   ├── config/              # Configuraciones
│   │   │   ├── database.js      # Conexión a PostgreSQL
│   │   │   └── socket.js        # Configuración de Socket.io
│   │   ├── controllers/         # Controladores de lógica de negocio
│   │   │   ├── authController.js
│   │   │   ├── orderController.js
│   │   │   ├── dishController.js
│   │   │   ├── tableController.js
│   │   │   ├── kitchenController.js
│   │   │   ├── cashierController.js
│   │   │   ├── reservationController.js
│   │   │   ├── dashboardController.js
│   │   │   └── ...
│   │   ├── middlewares/         # Middlewares personalizados
│   │   │   ├── authMiddleware.js    # Verificación JWT
│   │   │   ├── roleMiddleware.js    # Control de roles
│   │   │   └── errorMiddleware.js   # Manejo de errores
│   │   ├── models/              # Modelos de Sequelize
│   │   │   ├── User.js
│   │   │   ├── Order.js
│   │   │   ├── OrderItem.js
│   │   │   ├── Dish.js
│   │   │   ├── Category.js
│   │   │   ├── Table.js
│   │   │   ├── Reservation.js
│   │   │   ├── Payment.js
│   │   │   └── ...
│   │   ├── routes/              # Definición de rutas API
│   │   ├── services/            # Servicios externos
│   │   │   └── emailService.js  # Servicio de emails con Brevo
│   │   ├── helpers/             # Funciones auxiliares
│   │   │   └── socketEmitters.js
│   │   └── app.js               # Configuración de Express
│   ├── logs/                    # Archivos de log
│   ├── Dockerfile               # Configuración Docker backend
│   ├── railway.json             # Config Railway deployment
│   ├── package.json
│   └── server.js                # Punto de entrada del servidor
│
└── PotetosFrontend/             # Aplicación React
    ├── src/
    │   ├── assets/              # Recursos estáticos
    │   │   ├── fonts/           # Fuentes Poppins
    │   │   └── images/          # Imágenes, logos, iconos
    │   ├── components/          # Componentes React
    │   │   ├── common/          # Componentes reutilizables
    │   │   │   ├── ConfirmModal.jsx
    │   │   │   ├── InfoCard.jsx
    │   │   │   ├── ModuleCard.jsx
    │   │   │   ├── ProductCard.jsx
    │   │   │   ├── SessionClosedModal.jsx
    │   │   │   └── StatCard.jsx
    │   │   ├── layout/          # Componentes de layout
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Sidebar.jsx
    │   │   │   └── Footer.jsx
    │   │   ├── cashier/         # Componentes de caja
    │   │   ├── menu/            # Componentes de menú
    │   │   └── reservations/    # Componentes de reservas
    │   ├── pages/               # Páginas principales
    │   │   ├── auth/            # Autenticación
    │   │   │   ├── Login.jsx
    │   │   │   ├── Register.jsx
    │   │   │   └── ForgotPassword.jsx
    │   │   ├── dashboard/       # Módulos del dashboard
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Orders.jsx
    │   │   │   ├── Kitchen.jsx
    │   │   │   ├── Tables.jsx
    │   │   │   ├── Menu.jsx
    │   │   │   ├── Cashier.jsx
    │   │   │   └── Users.jsx
    │   │   └── public/          # Páginas públicas
    │   │       └── Home.jsx
    │   ├── services/            # Servicios y configuraciones
    │   │   ├── api.js           # Configuración de Axios
    │   │   ├── socket.js        # Cliente Socket.io
    │   │   └── index.js         # Exportación de servicios
    │   ├── store/               # Estado global Zustand
    │   │   └── authStore.js     # Store de autenticación
    │   ├── hooks/               # Custom hooks
    │   │   ├── useSessionManager.js
    │   │   └── useInactivityDetector.js
    │   ├── config/              # Configuraciones
    │   │   └── auth.config.js   # Config de autenticación
    │   ├── App.jsx              # Componente raíz
    │   ├── main.jsx             # Punto de entrada React
    │   └── index.css            # Estilos globales
    ├── Dockerfile               # Configuración Docker frontend
    ├── nginx.conf               # Configuración Nginx
    ├── railway.json             # Config Railway deployment
    ├── vite.config.js           # Configuración Vite
    ├── package.json
    └── index.html               # HTML base
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

## ⚡ Inicio Rápido

### Primer uso

1. **Accede a la aplicación**: `http://localhost:5173`

2. **Crea un usuario administrador** (solo primera vez):

   - Regístrate con rol de administrador
   - Verifica tu email si está configurado Brevo

3. **Configura el sistema**:

   - Crea categorías de platos (Entradas, Platos Fuertes, Bebidas, Postres)
   - Agrega platos al menú con precios e imágenes
   - Configura las mesas del restaurante

4. **Crea usuarios** para el personal:

   - Meseros para toma de órdenes
   - Chefs para módulo de cocina
   - Cajeros para procesamiento de pagos

5. **¡Comienza a operar!**:
   - Los meseros pueden tomar órdenes
   - Los chefs reciben notificaciones en tiempo real
   - Los cajeros procesan los pagos

### Credenciales de prueba

Si quieres probar el sistema, puedes crear usuarios con estos roles:

```
Admin:   admin@potetos.com    / admin123
Mesero:  mesero@potetos.com   / mesero123
Chef:    chef@potetos.com     / chef123
Cajero:  cajero@potetos.com   / cajero123
```

> ⚠️ **Nota**: Cambia estas credenciales en producción

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

El sistema implementa un control de acceso basado en roles (RBAC) con cuatro perfiles principales:

| Rol        | Permisos y Funcionalidades                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| **Admin**  | Acceso completo: gestión de usuarios, platos, categorías, mesas, reportes y configuración del sistema |
| **Mesero** | Toma de órdenes, asignación de mesas, visualización de estado de platos, gestión de reservaciones     |
| **Chef**   | Visualización del módulo de cocina, actualización de estado de items (pendiente → preparando → listo) |
| **Cajero** | Procesamiento de pagos, división de cuentas, generación de facturas, cierre de órdenes                |

### Flujo de trabajo por rol

1. **Mesero** → Crea orden y asigna mesa
2. **Chef** → Recibe notificación, prepara items y marca como listos
3. **Mesero** → Recibe notificación cuando el plato está listo
4. **Cajero** → Procesa el pago y cierra la orden

## 📡 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint           | Descripción                      | Auth |
| ------ | ------------------ | -------------------------------- | ---- |
| POST   | `/login`           | Iniciar sesión                   | No   |
| POST   | `/register`        | Registrar nuevo usuario          | No   |
| POST   | `/forgot-password` | Solicitar código de recuperación | No   |
| POST   | `/verify-code`     | Verificar código de recuperación | No   |
| POST   | `/reset-password`  | Restablecer contraseña           | No   |

### Órdenes (`/api/orders`)

| Método | Endpoint      | Descripción                | Auth | Roles         |
| ------ | ------------- | -------------------------- | ---- | ------------- |
| GET    | `/`           | Listar todas las órdenes   | Sí   | Todos         |
| GET    | `/:id`        | Obtener orden por ID       | Sí   | Todos         |
| POST   | `/`           | Crear nueva orden          | Sí   | Mesero, Admin |
| PATCH  | `/:id/status` | Actualizar estado de orden | Sí   | Mesero, Admin |
| DELETE | `/:id`        | Eliminar orden             | Sí   | Admin         |

### Platos (`/api/dishes`)

| Método | Endpoint            | Descripción             | Auth | Roles       |
| ------ | ------------------- | ----------------------- | ---- | ----------- |
| GET    | `/`                 | Listar todos los platos | No   | -           |
| GET    | `/:id`              | Obtener plato por ID    | No   | -           |
| POST   | `/`                 | Crear nuevo plato       | Sí   | Admin       |
| PUT    | `/:id`              | Actualizar plato        | Sí   | Admin       |
| PATCH  | `/:id/availability` | Cambiar disponibilidad  | Sí   | Admin, Chef |
| DELETE | `/:id`              | Eliminar plato          | Sí   | Admin       |

### Categorías (`/api/categories`)

| Método | Endpoint | Descripción                 | Auth | Roles |
| ------ | -------- | --------------------------- | ---- | ----- |
| GET    | `/`      | Listar todas las categorías | No   | -     |
| POST   | `/`      | Crear nueva categoría       | Sí   | Admin |
| PUT    | `/:id`   | Actualizar categoría        | Sí   | Admin |
| DELETE | `/:id`   | Eliminar categoría          | Sí   | Admin |

### Mesas (`/api/tables`)

| Método | Endpoint      | Descripción            | Auth | Roles         |
| ------ | ------------- | ---------------------- | ---- | ------------- |
| GET    | `/`           | Listar todas las mesas | Sí   | Mesero, Admin |
| POST   | `/`           | Crear nueva mesa       | Sí   | Admin         |
| PUT    | `/:id`        | Actualizar mesa        | Sí   | Admin         |
| PATCH  | `/:id/status` | Cambiar estado de mesa | Sí   | Mesero, Admin |
| DELETE | `/:id`        | Eliminar mesa          | Sí   | Admin         |

### Cocina (`/api/kitchen`)

| Método | Endpoint                  | Descripción               | Auth | Roles |
| ------ | ------------------------- | ------------------------- | ---- | ----- |
| GET    | `/orders`                 | Obtener órdenes de cocina | Sí   | Chef  |
| PATCH  | `/order-items/:id/status` | Actualizar estado de item | Sí   | Chef  |

### Caja (`/api/cashier`)

| Método | Endpoint              | Descripción                        | Auth | Roles         |
| ------ | --------------------- | ---------------------------------- | ---- | ------------- |
| GET    | `/orders`             | Obtener órdenes pendientes de pago | Sí   | Cajero, Admin |
| POST   | `/orders/:id/payment` | Procesar pago de orden             | Sí   | Cajero, Admin |

### Reservaciones (`/api/reservations`)

| Método | Endpoint | Descripción                    | Auth | Roles         |
| ------ | -------- | ------------------------------ | ---- | ------------- |
| GET    | `/`      | Listar todas las reservaciones | Sí   | Mesero, Admin |
| POST   | `/`      | Crear nueva reservación        | Sí   | Mesero, Admin |
| PUT    | `/:id`   | Actualizar reservación         | Sí   | Mesero, Admin |
| DELETE | `/:id`   | Eliminar reservación           | Sí   | Mesero, Admin |

### Dashboard (`/api/dashboard`)

| Método | Endpoint | Descripción                    | Auth | Roles |
| ------ | -------- | ------------------------------ | ---- | ----- |
| GET    | `/stats` | Obtener estadísticas generales | Sí   | Admin |
| GET    | `/sales` | Obtener datos de ventas        | Sí   | Admin |

### Usuarios (`/api/users`)

| Método | Endpoint | Descripción               | Auth | Roles |
| ------ | -------- | ------------------------- | ---- | ----- |
| GET    | `/`      | Listar todos los usuarios | Sí   | Admin |
| POST   | `/`      | Crear nuevo usuario       | Sí   | Admin |
| PUT    | `/:id`   | Actualizar usuario        | Sí   | Admin |
| DELETE | `/:id`   | Eliminar usuario          | Sí   | Admin |

## 🔌 Eventos Socket.io

La aplicación utiliza Socket.io para comunicación en tiempo real entre los diferentes módulos.

### Salas (Rooms)

- `kitchen` - Sala para el módulo de cocina
- `waiters` - Sala para meseros
- `cashier` - Sala para cajeros
- `admin` - Sala para administradores

### Eventos del Cliente → Servidor

| Evento         | Descripción                         | Payload            |
| -------------- | ----------------------------------- | ------------------ |
| `join:role`    | Unirse a sala según rol del usuario | `{ role: string }` |
| `join:kitchen` | Unirse a la sala de cocina          | -                  |
| `join:waiters` | Unirse a la sala de meseros         | -                  |

### Eventos del Servidor → Cliente

| Evento                    | Descripción                              | Payload                    | Destino   |
| ------------------------- | ---------------------------------------- | -------------------------- | --------- |
| `kitchen:newOrder`        | Nueva orden creada y enviada a cocina    | `{ order: Object }`        | `kitchen` |
| `order:statusChanged`     | Estado general de la orden actualizado   | `{ orderId, status }`      | `waiters` |
| `order:ready`             | Orden completa y lista para servir       | `{ orderId }`              | `waiters` |
| `order:itemStatusChanged` | Estado de un item específico actualizado | `{ itemId, status }`       | `waiters` |
| `table:statusChanged`     | Estado de mesa actualizado               | `{ tableId, status }`      | `waiters` |
| `payment:processed`       | Pago procesado exitosamente              | `{ orderId, paymentData }` | `cashier` |

### Ejemplo de uso

```javascript
// Cliente
import { socket } from "./services/socket";

// Unirse a sala
socket.emit("join:kitchen");

// Escuchar nuevas órdenes
socket.on("kitchen:newOrder", (data) => {
  console.log("Nueva orden:", data.order);
});

// Emitir cambio de estado
socket.emit("order:updateStatus", { orderId: 123, status: "ready" });
```

## 📊 Base de Datos

### Tecnología

- **PostgreSQL 14+** como motor de base de datos
- **Sequelize ORM** para modelado y migraciones
- Relaciones definidas mediante asociaciones de Sequelize

### Modelos principales

| Modelo            | Descripción                                       | Relaciones                                          |
| ----------------- | ------------------------------------------------- | --------------------------------------------------- |
| **User**          | Usuarios del sistema con roles                    | hasMany Orders, Reservations                        |
| **Category**      | Categorías de platos (Entradas, Platos fuertes)   | hasMany Dishes                                      |
| **Dish**          | Platos del menú con precios e imágenes            | belongsTo Category, hasMany OrderItems              |
| **Table**         | Mesas del restaurante con capacidad               | hasMany Orders, Reservations                        |
| **Order**         | Órdenes de clientes                               | belongsTo User, Table; hasMany OrderItems, Payments |
| **OrderItem**     | Items individuales de cada orden                  | belongsTo Order, Dish                               |
| **Payment**       | Pagos realizados                                  | belongsTo Order                                     |
| **PaymentSplit**  | División de pagos entre múltiples personas        | belongsTo Payment                                   |
| **Reservation**   | Reservaciones de mesas                            | belongsTo User, Table                               |
| **PasswordReset** | Tokens temporales para recuperación de contraseña | belongsTo User                                      |

### Diagrama de Relaciones

```
                    ┌──────────┐
                    │   User   │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
   ┌─────────┐     ┌─────────┐   ┌──────────────┐
   │  Order  │     │  Table  │   │ Reservation  │
   └────┬────┘     └────┬────┘   └──────────────┘
        │               │
        ├───────────────┘
        │
        ├──────────┬──────────┐
        ▼          ▼          ▼
  ┌──────────┐ ┌─────────┐ ┌──────────────┐
  │OrderItem │ │ Payment │ │PaymentSplit  │
  └────┬─────┘ └─────────┘ └──────────────┘
       │
       ▼
  ┌──────────┐       ┌──────────┐
  │   Dish   │◄──────│ Category │
  └──────────┘       └──────────┘
```

### Estados de Orden

- `pending` - Orden creada, esperando confirmación
- `confirmed` - Orden confirmada, enviada a cocina
- `preparing` - En preparación en cocina
- `ready` - Lista para servir
- `served` - Servida al cliente
- `paid` - Pagada y cerrada
- `cancelled` - Cancelada

### Estados de Mesa

- `available` - Disponible
- `occupied` - Ocupada
- `reserved` - Reservada

## 🌐 Deploy

### Despliegue en Railway

PotetosApp está optimizada para despliegue en Railway con configuración automática:

**Backend:**

1. Conecta tu repositorio GitHub a Railway
2. Crea un nuevo servicio PostgreSQL
3. Crea un servicio para el backend (detectará automáticamente `railway.json`)
4. Configura las variables de entorno:
   ```
   DATABASE_URL=<postgresql_url_from_railway>
   JWT_SECRET=<tu_secreto_jwt>
   FRONTEND_URL=<url_frontend>
   BREVO_API_KEY=<tu_api_key_brevo>
   BREVO_SENDER_EMAIL=<email_remitente>
   BREVO_SENDER_NAME=Potetos App
   NODE_ENV=production
   ```
5. Railway ejecutará automáticamente las migraciones de Sequelize

**Frontend:**

1. Crea un servicio separado para el frontend
2. Configura las variables de entorno:
   ```
   VITE_API_URL=<url_backend>/api
   VITE_SOCKET_URL=<url_backend>
   ```
3. Railway construirá y servirá con Nginx automáticamente

### Despliegue con Docker

```bash
# Construir imágenes
docker build -t potetos-backend ./PotetosBackend
docker build -t potetos-frontend ./PotetosFrontend

# Ejecutar contenedores
docker run -d -p 5000:5000 --env-file .env potetos-backend
docker run -d -p 80:80 potetos-frontend
```

### Variables de entorno requeridas en producción

**Backend:**

- `DATABASE_URL` - URL de conexión PostgreSQL
- `JWT_SECRET` - Secreto para JWT (mínimo 32 caracteres)
- `FRONTEND_URL` - URL del frontend para CORS
- `BREVO_API_KEY` - API Key de Brevo
- `BREVO_SENDER_EMAIL` - Email remitente verificado
- `BREVO_SENDER_NAME` - Nombre del remitente
- `NODE_ENV` - `production`
- `PORT` - Puerto del servidor (por defecto 5000)

**Frontend:**

- `VITE_API_URL` - URL completa de la API backend
- `VITE_SOCKET_URL` - URL del servidor Socket.io

### Verificación post-deploy

1. ✅ Verificar conexión a base de datos
2. ✅ Probar endpoints de la API
3. ✅ Verificar comunicación Socket.io
4. ✅ Probar autenticación y roles
5. ✅ Validar envío de emails

## 🤝 Contribuir

Las contribuciones son bienvenidas y apreciadas. Para contribuir:

1. **Fork** el proyecto
2. Crea una rama para tu feature:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Realiza tus cambios y haz commit:
   ```bash
   git commit -m 'Add: Descripción de tu feature'
   ```
4. Push a tu rama:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Abre un **Pull Request** describiendo tus cambios

### Guías de contribución

- Sigue las convenciones de código del proyecto
- Escribe mensajes de commit claros y descriptivos
- Documenta nuevas funcionalidades
- Asegúrate de que tu código pase las pruebas existentes
- Considera agregar pruebas para nuevas funcionalidades

### Convención de commits

- `Add:` - Nueva funcionalidad
- `Fix:` - Corrección de bugs
- `Update:` - Actualización de código existente
- `Refactor:` - Refactorización sin cambiar funcionalidad
- `Docs:` - Cambios en documentación
- `Style:` - Cambios de formato/estilo

## 🐛 Reporte de Issues

Si encuentras un bug o tienes una sugerencia:

1. Verifica que no exista un issue similar
2. Crea un nuevo issue con una descripción clara
3. Incluye pasos para reproducir el problema
4. Agrega capturas de pantalla si es relevante

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 🚀 Roadmap

### Próximas funcionalidades

- [ ] 📱 Aplicación móvil con React Native
- [ ] 📊 Reportes avanzados con gráficos
- [ ] 🔍 Búsqueda avanzada de platos
- [ ] 🌍 Soporte multiidioma (i18n)
- [ ] 💳 Integración con pasarelas de pago (Stripe, PayPal)
- [ ] 📧 Sistema de notificaciones por email
- [ ] 📱 PWA (Progressive Web App)
- [ ] 🎨 Temas personalizables
- [ ] 📦 Sistema de inventario
- [ ] 👨‍🍳 Recetas y gestión de ingredientes
- [ ] 📈 Analytics y métricas de negocio
- [ ] 🔔 Notificaciones push móviles

## 🎨 Diseño UX/UI y Branding

El diseño de la interfaz de usuario, experiencia de usuario (wireframes, mockups) y toda la identidad visual de la marca Potetos (incluyendo logos e ilustraciones) fue creado por **Ana M Samudio T**

- **Portafolio:** 
- **Rol en el proyecto:** Lead UI/UX Designer & Graphic Designer

## 👨‍💻 Autor

**Jhonatan A Mendez R**

## 🙏 Agradecimientos

- [Lucide Icons](https://lucide.dev/) - Iconos modernos y elegantes
- [TailwindCSS](https://tailwindcss.com/) - Framework de estilos utility-first
- [React](https://react.dev/) - Biblioteca de interfaz de usuario
- [Socket.io](https://socket.io/) - Comunicación en tiempo real
- [Sequelize](https://sequelize.org/) - ORM para Node.js
- [Railway](https://railway.app/) - Plataforma de deployment

## ⭐ Agradecimiento

Si este proyecto te resultó útil, considera darle una ⭐ en GitHub. ¡Tu apoyo es muy apreciado!

---

**Desarrollado con ❤️ para optimizar la gestión de restaurantes**
