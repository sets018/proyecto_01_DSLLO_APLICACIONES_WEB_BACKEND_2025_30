import jwt from 'jsonwebtoken';
import { UserModel } from '../src/modules/usuarios/Usuario.model.js';
import { conectar, desconectar, limpiarDB } from './db-setup.js';

// Usuario de prueba con diferentes roles
export const createTestUser = async (permisos = []) => {
  const user = await UserModel.create({
    nombre: 'Usuario Test',
    email: `test${Date.now()}@test.com`,
    password: 'test1234',
    permisos
  });

  const token = jwt.sign(
    { id: user._id, permisos }, 
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );

  return { user, token };
};

export { conectar, desconectar, limpiarDB };