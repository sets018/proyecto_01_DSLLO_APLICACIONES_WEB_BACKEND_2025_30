import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let mongoConnection = null;

export const conectar = async () => {
  try {
    // Si ya hay una conexión activa, la reutilizamos
    if (mongoose.connection.readyState === 1) {
      console.log('Reutilizando conexión existente a MongoDB');
      return mongoose.connection;
    }

    // Si hay una conexión en proceso de cerrar, esperamos
    if (mongoose.connection.readyState === 3) {
      console.log('Esperando a que se cierre la conexión anterior...');
      await mongoose.connection.close();
    }

    let MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI no definida en variables de entorno');
    }
    
    // En modo test, usar una base de datos específica
    if (process.env.NODE_ENV === 'test') {
      MONGODB_URI = MONGODB_URI.replace(/\/[^/?]+\?/, '/test?');
    }

    // Desconectar si hay una conexión existente con una URI diferente
    if (mongoose.connection._connectionString && mongoose.connection._connectionString !== MONGODB_URI) {
      console.log('Cerrando conexión anterior con URI diferente...');
      await mongoose.connection.close();
    }
    
    console.log('Conectando a MongoDB...');
    mongoConnection = await mongoose.connect(MONGODB_URI);
    
    mongoose.connection.on('error', err => {
      console.error('Error de MongoDB:', err);
    });

    mongoose.connection.once('open', () => {
      console.log(`MongoDB conectado en: ${mongoose.connection.host} (Base: ${mongoose.connection.name})`);
    });

    return mongoConnection;
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    throw error;
  }
};

export const desconectar = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      console.log('Desconectando de MongoDB...');
      await mongoose.connection.close();
      await mongoose.disconnect();
      console.log('Desconexión de MongoDB completada');
    } else {
      console.log('MongoDB ya está desconectado');
    }
  } catch (error) {
    console.error('Error al desconectar MongoDB:', error);
    throw error;
  }
};

export const limpiarDB = async () => {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    throw new Error('No hay conexión a MongoDB');
  }

  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
};

// Manejar eventos del proceso
process.on('SIGINT', async () => {
  await desconectar();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await desconectar();
  process.exit(0);
});

process.on('uncaughtException', async (err) => {
  console.error('Error no controlado:', err);
  await desconectar();
  process.exit(1);
});