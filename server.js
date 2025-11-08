import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { conectarDB } from './src/core/database.js';

// Importar rutas modulares
import usuarioRoutes from './src/modules/usuarios/Usuario.rutas.js';
import libroRoutes from './src/modules/libros/Libro.rutas.js';
import reservaRoutes from './src/modules/reservas/Reserva.ruta.js';

// Configurar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const SERVER_VERSION = '/api/v1';  // Versión de la API

// Configuración de seguridad
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 peticiones por ventana
});

// Middlewares de seguridad y utilidad
app.use(helmet()); // Seguridad HTTP
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined')); // Logging
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de payload
app.use(limiter); // Rate limiting

// Conectar a MongoDB solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    try {
        await conectarDB();
        console.log('MongoDB conectado exitosamente');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1); // Salir si no se puede conectar a la DB
    }
}

// API Health Check
app.get(`${SERVER_VERSION}/health`, (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version
    });
});

// Configurar rutas de la API
app.use(`${SERVER_VERSION}/usuarios`, usuarioRoutes);  // Gestión de usuarios
app.use(`${SERVER_VERSION}/libros`, libroRoutes);      // Gestión de libros
app.use(`${SERVER_VERSION}/reservas`, reservaRoutes);  // Gestión de reservas

// Documentación de la API
app.get(`${SERVER_VERSION}/docs`, (req, res) => {
    res.json({
        endpoints: {
            usuarios: {
                registro: { method: 'POST', path: '/usuarios/register', public: true },
                login: { method: 'POST', path: '/usuarios/login', public: true },
                obtenerUsuario: { method: 'GET', path: '/usuarios/:id', protected: true },
                actualizarUsuario: { method: 'PUT', path: '/usuarios/:id', protected: true },
                desactivarUsuario: { method: 'DELETE', path: '/usuarios/:id', protected: true }
            },
            libros: {
                crear: { method: 'POST', path: '/libros', protected: true, permissions: ['crear_libros'] },
                listar: { method: 'GET', path: '/libros', public: true },
                obtenerUno: { method: 'GET', path: '/libros/:id', public: true },
                actualizar: { method: 'PUT', path: '/libros/:id', protected: true, permissions: ['modificar_libros'] },
                desactivar: { method: 'DELETE', path: '/libros/:id', protected: true, permissions: ['inhabilitar_libros'] }
            },
            reservas: {
                crear: { method: 'POST', path: '/reservas', protected: true },
                listar: { method: 'GET', path: '/reservas', protected: true },
                obtenerUna: { method: 'GET', path: '/reservas/:id', protected: true },
                actualizar: { method: 'PUT', path: '/reservas/:id', protected: true },
                cancelar: { method: 'DELETE', path: '/reservas/:id', protected: true }
            }
        }
    });
});

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Ruta no encontrada",
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Manejar errores de validación de Mongoose
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    // Manejar errores de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }

    // Manejar errores de permisos
    if (err.name === 'PermissionError') {
        return res.status(403).json({
            success: false,
            message: 'Permisos insuficientes'
        });
    }

    // Error por defecto
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar el servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    const server = app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
        console.log(`API Version: ${SERVER_VERSION}`);
        console.log(`Ambiente: ${process.env.NODE_ENV}`);
    });

    // Manejo de cierre limpio
    process.on('SIGTERM', () => {
        server.close(() => {
            console.log('Servidor cerrado');
            process.exit(0);
        });
    });
}

// Exportar la app para testing
export default app;
app.use((err, req, res, next) => {
    console.error('Error interno:', err.stack);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Iniciar servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
        console.log(`Endpoints disponibles en http://localhost:${PORT}${SERVER_VERSION}`);
    });
}