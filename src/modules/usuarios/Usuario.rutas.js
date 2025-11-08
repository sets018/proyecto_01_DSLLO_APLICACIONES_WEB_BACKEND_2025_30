import express from 'express';
import {
  register,
  login,
  getUser,
  updateUser,
  deleteUser
} from './Usuario.controllers.js';
import { verificarToken } from '../../middlewares/auth.js';

const router = express.Router();

// Rutas públicas (solo registro y login)
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas (requieren autenticación)
// Endpoints públicos de lectura
router.get('/:id', getUser);
router.put('/:id', verificarToken, updateUser);
router.delete('/:id', verificarToken, deleteUser);

export default router;