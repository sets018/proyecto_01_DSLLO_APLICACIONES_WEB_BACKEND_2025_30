# Backend de plataforma de Biblioteca

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

#### POST /api/v1/usuarios/registro
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