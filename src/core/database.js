import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configurar acceso a variables de entorno
dotenv.config();

// Configuración de conexión
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,  // Tiempo espera servidor
  socketTimeoutMS: 45000,          // Tiempo espera operaciones
  maxPoolSize: 10,                 // Máximo de conexiones simultáneas
  minPoolSize: 2,                  // Mínimo de conexiones mantenidas
  connectTimeoutMS: 10000,         // Tiempo de espera para la conexión inicial
  family: 4                        // Forzar IPv4
};

// Conexión a MongoDB
const conectarDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no definida en .env');
    }
    
    // Establecer conexión
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    
    console.log('MongoDB conectado en:', 
      mongoose.connection.host, 
      `(Base: ${mongoose.connection.db.databaseName})`
    );
    
    mongoose.connection.on('connected', () => {
      console.log('Mongoose conectado');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Error de conexión Mongoose:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('Mongoose reconectado');
    });

  } catch (error) {
    console.error('Error crítico al conectar a MongoDB:', error.message);
    
    console.log('Reintentando conexión en 5 segundos...');
    setTimeout(conectarDB, 5000);
  }
};

// Configurar eventos
const configurarEventos = () => {
  mongoose.connection.on('connecting', () => {
    console.log('Intentando conectar a MongoDB...');
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Desconectado de MongoDB');
    console.log('Intentando reconexión automática...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('Reconectado a MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Error de MongoDB:', err.message);
  });
};

// Desconexión voluntaria
const desconectarDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('Desconexión de MongoDB completada');
  }
};

// Manejar cierres 
const manejarCierres = () => {
  process.on('SIGINT', async () => {
    await desconectarDB();
    process.exit(0);
  });

  // Terminación de proceso
  process.on('SIGTERM', async () => {
    await desconectarDB();
    process.exit(0);
  });

  // Para errores no controlados
  process.on('uncaughtException', async (err) => {
    console.error('Error crítico no controlado:', err);
    await desconectarDB();
    process.exit(1);
  });
};

manejarCierres();

export { conectarDB, desconectarDB, mongoose };