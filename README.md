# 🎓 Student Scheduler API

API REST para agendamiento de clases estudiantiles.  
**Stack:** NestJS · MongoDB · Redis · JWT · Firebase FCM · Docker

---

## 🏛️ Arquitectura Hexagonal

```
src/modules/<module>/
├── domain/           ← Entidades, Value Objects, Ports (contratos)
├── application/      ← Use Cases (lógica de negocio)
├── infrastructure/   ← Adapters (MongoDB, Redis, FCM)
└── presentation/     ← Controllers, DTOs, Guards
```

---

## 🚀 Inicio rápido (Docker — desarrollo local)

```bash
# 1. Clonar y configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores

# 2. Levantar todos los servicios
docker compose up -d

# 3. Correr seed de usuarios de prueba
npm install
npx ts-node src/seed.ts

# 4. Ver docs interactivos
open http://localhost:3000/docs
```

---

## ☁️ Deploy en OnRender (pruebas)

> OnRender **no soporta** Docker Compose multi-contenedor.  
> Usa servicios gratuitos externos:

| Servicio | Proveedor gratuito | Variable de entorno |
|---------|-------------------|---------------------|
| MongoDB | [MongoDB Atlas](https://cloud.mongodb.com) | `MONGO_URI` |
| Redis   | [Upstash](https://upstash.com)             | `REDIS_URL` |
| Push    | [Firebase FCM](https://console.firebase.google.com) | `FIREBASE_*` |

### Pasos OnRender:

1. Crear cuenta en MongoDB Atlas → obtener connection string
2. Crear cuenta en Upstash → obtener Redis URL  
3. Crear proyecto Firebase → descargar serviceAccount
4. En OnRender → **New Web Service** → conectar repo
5. Runtime: **Docker**
6. Agregar variables de entorno en el dashboard de OnRender
7. Deploy automático en cada push 🚀

---

## 🔐 Usuarios de prueba (después del seed)

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@universidad.edu | Admin123! |
| Profesor | garcia@universidad.edu | Teacher123! |
| Estudiante | juan@universidad.edu | Student123! |

---

## 📡 Endpoints principales

### Auth
```
POST /api/v1/auth/login          → { email, password }
POST /api/v1/auth/refresh        → { refreshToken }
POST /api/v1/auth/logout         → Bearer token
POST /api/v1/auth/me             → Bearer token
```

### Users (admin)
```
GET    /api/v1/users             → Listar usuarios
POST   /api/v1/users             → Crear usuario
PATCH  /api/v1/users/:id         → Actualizar usuario
DELETE /api/v1/users/:id         → Eliminar usuario
GET    /api/v1/users/me/profile  → Mi perfil
```

### Classes
```
GET    /api/v1/classes           → Listar clases (filtros: subject, status, mode)
GET    /api/v1/classes/:id       → Detalle de clase
GET    /api/v1/classes/my        → Mis clases (profesor)
POST   /api/v1/classes           → Crear clase (profesor/admin)
PATCH  /api/v1/classes/:id       → Actualizar clase
PATCH  /api/v1/classes/:id/cancel → Cancelar clase
DELETE /api/v1/classes/:id       → Eliminar (admin)
```

### Enrollments
```
GET    /api/v1/enrollments/my            → Mi horario (estudiante)
GET    /api/v1/enrollments/class/:id     → Estudiantes de clase (profesor)
POST   /api/v1/enrollments              → Inscribirse { classId }
DELETE /api/v1/enrollments/:id          → Desinscribirse
```

### Notifications
```
POST   /api/v1/notifications/send        → Enviar push (admin/profesor)
```

---

## 🔄 Flujo JWT

```
Login → accessToken (15min) + refreshToken (7d)
→ Usar accessToken en: Authorization: Bearer <token>
→ Cuando expira → POST /auth/refresh con refreshToken
→ Logout → ambos tokens van a Redis blacklist
```

---

## 🛠️ Desarrollo local sin Docker

```bash
# Requiere MongoDB y Redis corriendo localmente
npm install
cp .env.example .env
npm run start:dev
npx ts-node src/seed.ts   # crear usuarios de prueba
```

---

## 📦 Comandos útiles

```bash
npm run start:dev    # desarrollo con hot-reload
npm run build        # compilar TypeScript
npm run start:prod   # producción
npm run test         # tests unitarios
npm run test:cov     # cobertura de tests
```
## 📦 Comandos útiles luego de hacer ajustes en el docker y crear nueva imagen

```bash
# 1. Parar los contenedores actuales
docker compose down

# 2. Reconstruir la imagen con los cambios
docker compose build --no-cache api

# 3. Levantar todo de nuevo
docker compose up -d

# 4. Ver logs en tiempo real para confirmar que arranca
docker compose logs -f api
