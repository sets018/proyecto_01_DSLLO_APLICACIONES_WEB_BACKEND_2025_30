import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../src/modules/usuarios/Usuario.model.js';

// Cargar .env
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI no definido en .env');
  process.exit(1);
}

// Uso: node scripts/create_admin.js email password [nombre]
const [,, email, password, nombre = 'Admin'] = process.argv;
if (!email || !password) {
  console.error('Uso: node scripts/create_admin.js <email> <password> [nombre]');
  process.exit(1);
}

const permisosTodos = [
  'crear_libros',
  'modificar_libros',
  'inhabilitar_libros',
  'modificar_usuarios',
  'inhabilitar_usuarios'
];

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined });
    console.log('Conectado a MongoDB');

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await UserModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          nombre,
          email: email.toLowerCase(),
          password: passwordHash,
          isActive: true,
          updatedAt: new Date()
        },
        $addToSet: { permisos: { $each: permisosTodos } },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true, new: true }
    ).select('-password');

    console.log('Usuario creado/actualizado:');
    console.log(JSON.stringify(result, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(2);
  }
}

run();
