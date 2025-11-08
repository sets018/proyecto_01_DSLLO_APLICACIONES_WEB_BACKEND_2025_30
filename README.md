
# Backend de la plataforma de Biblioteca

API REST para gestionar libros, usuarios y reservas.

Base URL: http://localhost:3000/api/v1

Nota rápida: las rutas usan el prefijo /api/v1 (ver ejemplos abajo).

## Requisitos
- Node.js >= 18
- MongoDB
- npm

## Configuración rápida
1. Clonar e instalar:
```bash
git clone https://github.com/sets018/proyecto_01_DSLLO_APLICACIONES_WEB_BACKEND_2025_30.git
cd proyecto_01_DSLLO_APLICACIONES_WEB_BACKEND_2025_30
npm install
```

2. Crear `.env` en la raíz con (ejemplo):
```env
MONGODB_URI=<tu_mongodb_uri>
JWT_SECRET=mi_secreto_super_seguro
PORT=3000
NODE_ENV=development
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

## Credenciales de prueba (admin)
Para facilitar pruebas existe un admin de ejemplo (se crea/actualiza con `scripts/create_admin.js`):

- Email: `admin.prueba@example.com`
- Password: `MiPassword123`

Este admin tiene todos los permisos: `crear_libros`, `modificar_libros`, `inhabilitar_libros`, `modificar_usuarios`, `inhabilitar_usuarios`.

Si prefieres crear/actualizar el admin desde el proyecto:
```bash
node scripts/create_admin.js admin.prueba@example.com MiPassword123 "Admin Prueba"
```

## Endpoints principales

Prefijo: `/api/v1`

Usuarios
- POST /api/v1/usuarios/register — Registrar usuario (público)
  - Body: { nombre, email, password }
- POST /api/v1/usuarios/login — Login (público)
  - Body: { email, password }
- GET /api/v1/usuarios/:id — Obtener usuario por id (público)
- PUT /api/v1/usuarios/:id — Actualizar usuario (autenticado)
- DELETE /api/v1/usuarios/:id — Inhabilitar usuario (autenticado / permisos según servicio)

Libros
- GET /api/v1/libros — Listar libros (público)
  - Query params: `pagina`, `porPagina`, `titulo` (búsqueda parcial por título), `autor`, `editorial`, `genero`, `disponible`, `incluirInhabilitados=true`
- GET /api/v1/libros/:id — Obtener libro por id
- POST /api/v1/libros — Crear libro (requiere token y permiso `crear_libros`)
- PUT /api/v1/libros/:id — Actualizar libro (requiere permiso `modificar_libros` para campos protegidos)
- DELETE /api/v1/libros/:id — Inhabilitar libro (requiere permiso `inhabilitar_libros`)

Reservas
- POST /api/v1/reservas — Crear reserva (autenticado)
- PUT /api/v1/reservas/:id/finalizar — Finalizar reserva (autenticado + permisos)
- GET /api/v1/reservas/libro/:libroId — Historial de reservas de un libro (público)
- GET /api/v1/reservas/usuario/:usuarioId? — Historial de un usuario (autenticado)
- GET /api/v1/reservas/activas — Reservas activas (requiere permisos administrativos)

## Ejemplos (curl)

Nota: usa `$TOKEN` obtenido desde el login para endpoints protegidos.

1) Registro de usuario (público)
```bash
curl -i -X POST http://localhost:3000/api/v1/usuarios/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Usuario Prueba","email":"usuario.prueba@example.com","password":"UsuarioPass123"}'
```

2) Login y extracción de token
```bash
LOGIN_JSON=$(curl -s -X POST http://localhost:3000/api/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.prueba@example.com","password":"MiPassword123"}')
echo "$LOGIN_JSON" | jq .
TOKEN=$(echo "$LOGIN_JSON" | jq -r .token)
USER_ID=$(echo "$LOGIN_JSON" | jq -r '.usuario._id')
echo "TOKEN length: ${#TOKEN} USER_ID: $USER_ID"
```

3) Crear libro (autenticado — admin)
```bash
BOOK_JSON=$(curl -s -X POST http://localhost:3000/api/v1/libros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"titulo":"Libro de Prueba","autor":"Autor Prueba","isbn":"ISBN-TEST-001","anio":2025,"editorial":"Editorial Prueba","genero":"Ficción","fechaPublicacion":"2025-01-01T00:00:00.000Z","disponible":true}')
echo "$BOOK_JSON" | jq .
BOOK_ID=$(echo "$BOOK_JSON" | jq -r '._id // .id')
echo "BOOK_ID=$BOOK_ID"
```

4) Buscar libros — ejemplos de filtrado (además de `titulo` ahora puedes filtrar por `autor`, `editorial` o `genero`)
```bash
# Buscar por título parcial
curl -s "http://localhost:3000/api/v1/libros?titulo=Prueba" | jq .

# Filtrar por autor
curl -s "http://localhost:3000/api/v1/libros?autor=Autor%20Prueba" | jq .

# Filtrar por editorial
curl -s "http://localhost:3000/api/v1/libros?editorial=Editorial%20Prueba" | jq .

# Filtrar por género
curl -s "http://localhost:3000/api/v1/libros?genero=Ficción" | jq .

# Incluir inhabilitados
curl -s "http://localhost:3000/api/v1/libros?titulo=Prueba&incluirInhabilitados=true" | jq .
```

5) Actualizar usuario (autenticado)
```bash
curl -s -X PUT http://localhost:3000/api/v1/usuarios/$USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nombre":"Usuario Actualizado"}' | jq .
```

6) Actualizar libro (autenticado)
```bash
curl -s -X PUT http://localhost:3000/api/v1/libros/$BOOK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"titulo":"Libro de Prueba Actualizado"}' | jq .
```

7) Soft-delete (inhabilitar) libro y usuario
```bash
curl -s -X DELETE http://localhost:3000/api/v1/libros/$BOOK_ID -H "Authorization: Bearer $TOKEN" | jq .
curl -s -X DELETE http://localhost:3000/api/v1/usuarios/$USER_ID -H "Authorization: Bearer $TOKEN" | jq .
```

## Notas finales
- Los permisos deben existir tal como están definidos en `src/modules/usuarios/Usuario.model.js`.
- Si recibes errores de validación al crear libros, revisa el mensaje y añade los campos requeridos (editorial, genero, fechaPublicacion, etc.).
- Si al hacer `git pull` te aparecía la advertencia sobre ramas divergentes, la configuración local `git config pull.rebase false` hace que `git pull` use merge por defecto.

Si quieres que genere un script `.sh` que ejecute toda la secuencia de prueba (crear admin, login, crear libro, leer, actualizar, borrar) dímelo y lo genero listo para pegar.

API REST para gestionar una plataforma de una biblioteca, incluyendo libros, usuarios y reservas.

## Requisitos

- Node.js v16 o superior
- MongoDB
- npm o yarn

## Roles y Permisos

El sistema implementa un sistema de permisos granular. Los permisos disponibles son:

### Permisos de Libros
- `crear_libros`: Permite crear nuevos libros
- `modificar_libros`: Permite actualizar información de libros
- `inhabilitar_libros`: Permite marcar libros como no disponibles

### Permisos de Usuarios
- `modificar_usuarios`: Permite actualizar información de usuarios
- `inhabilitar_usuarios`: Permite deshabilitar cuentas de usuario

### Roles Predefinidos

#### Administrador
Tiene todos los permisos:
- crear_libros
- modificar_libros
- inhabilitar_libros
- modificar_usuarios
- inhabilitar_usuarios

#### Usuario Regular
- Sin permisos especiales
- Puede ver libros y gestionar sus propias reservas

## Configuración

1. Clonar el repositorio:
```bash
git clone https://github.com/sets018/proyecto_01_DSLLO_APLICACIONES_WEB_BACKEND_2025_30.git
cd proyecto_01_DSLLO_APLICACIONES_WEB_BACKEND_2025_30
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:
```env
# Base de datos:

MONGODB_URI=mongodb+srv://set:Agpi8KSJBf2pwLbJ@backend.xxq8ogy.mongodb.net/?appName=backend

# Configuración JWT
JWT_SECRET=mi_secreto_super_seguro

# Configuración del servidor
PORT=3000
```

> **Nota**: Esta URI de MongoDB ya está configurada y es la misma que se usa en el proyecto.

## Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## Endpoints Disponibles

### Autenticación

#### POST /api/v1/usuarios/register
Registra un nuevo usuario.
```json
{
  "nombre": "Usuario Ejemplo",
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

#### POST /api/v1/usuarios/login
Inicia sesión y obtiene token JWT.
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### Libros

#### GET /api/v1/libros
Lista todos los libros. Soporta paginación y filtros:
- `?pagina=1&porPagina=10`
- `?genero=Ficción`
- `?editorial=Sudamericana`

#### POST /api/v1/libros
Crea un nuevo libro (requiere token y permiso `crear_libros`).
```json
{
  "titulo": "El Quijote",
  "autor": "Miguel de Cervantes",
  "isbn": "978-84-376-0494-7",
  "genero": "Novela",
  "editorial": "Editorial Ejemplo",
  "copias": 5
}
```

#### PUT /api/v1/libros/:id
Actualiza un libro (requiere token y permiso `modificar_libros`).

#### DELETE /api/v1/libros/:id
Inhabilita un libro (requiere token y permiso `inhabilitar_libros`).

### Reservas

#### POST /api/v1/reservas
Crea una nueva reserva.
```json
{
  "libroId": "id_del_libro",
  "fechaInicio": "2025-11-08",
  "fechaFin": "2025-11-15"
}
```

#### GET /api/v1/reservas
Lista las reservas del usuario autenticado.

#### PUT /api/v1/reservas/:id/devolver
Marca una reserva como devuelta.

## Ejemplos de Uso

### 1. Registro de Usuario
```bash
curl -X POST http://localhost:3000/api/v1/usuarios/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Usuario Ejemplo",
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }'
```

### 2. Login y Obtención de Token
```bash
curl -X POST http://localhost:3000/api/v1/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
  }'
```

### 3. Crear un Libro (como administrador)
```bash
curl -X POST http://localhost:3000/api/v1/libros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "titulo": "El Quijote",
    "autor": "Miguel de Cervantes",
    "isbn": "978-84-376-0494-7",
    "genero": "Novela",
    "editorial": "Editorial Ejemplo",
    "copias": 5
  }'
```

### 4. Buscar Libros con Filtros
```bash
# Búsqueda por género
curl "http://localhost:3000/api/v1/libros?genero=Novela"

# Búsqueda paginada
curl "http://localhost:3000/api/v1/libros?pagina=1&porPagina=10"

# Búsqueda combinada
curl "http://localhost:3000/api/v1/libros?genero=Novela&editorial=Sudamericana"
```

### Tests
```bash
npm test
```

## Endpoints

### Libros

- `GET /api/v1/libros` - Listar libros (público)
- `POST /api/v1/libros` - Crear libro (requiere permiso: crear_libros)
- `PUT /api/v1/libros/:id` - Actualizar libro (requiere permiso: modificar_libros)
- `DELETE /api/v1/libros/:id` - Inhabilitar libro (requiere permiso: inhabilitar_libros)

### Usuarios

- `POST /api/v1/usuarios/registro` - Registrar usuario
- `POST /api/v1/usuarios/login` - Iniciar sesión
- `GET /api/v1/usuarios/perfil` - Ver perfil (autenticado)
- `PUT /api/v1/usuarios/:id` - Actualizar usuario (autenticado)

### Reservas

- `POST /api/v1/reservas` - Crear reserva (autenticado)
- `GET /api/v1/reservas` - Listar reservas (autenticado)
- `PUT /api/v1/reservas/:id` - Actualizar reserva (autenticado)
- `DELETE /api/v1/reservas/:id` - Cancelar reserva (autenticado)

## Estructura del Proyecto

```
src/
  ├── core/           # Configuración core (DB)
  ├── middlewares/    # Middlewares de Express
  ├── modules/        # Módulos de la aplicación
  │   ├── libros/
  │   ├── usuarios/
  │   └── reservas/
  └── server.js       # Configuración del servidor
test/                 # Tests
```
