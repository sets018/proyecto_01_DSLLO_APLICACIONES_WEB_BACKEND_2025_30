import express from 'express';
import {
  crearReserva,
  finalizarReserva,
  obtenerHistorialLibro,
  obtenerHistorialUsuario,
  obtenerReservasActivas
} from './Reserva.controller.js';
import { verificarToken, verificarPermiso } from '../../middlewares/auth.js';

const router = express.Router();

// Crear reserva (cualquier usuario autenticado)
router.post('/', 
  verificarToken,
  crearReserva
);

// Finalizar reserva (usuario del libro o admin)
router.put('/:id/finalizar', 
  verificarToken,
  verificarPermiso('modificar_libros'), // Implementar lógica adicional si es necesario
  finalizarReserva
);

// Historial de un libro (acceso público según requerimientos)
router.get('/libro/:libroId', obtenerHistorialLibro);

// Historial de un usuario (solo el propio usuario o admin)
router.get('/usuario/:usuarioId?', 
  verificarToken,
  obtenerHistorialUsuario
);

// Reservas activas con filtros (admin)
router.get('/activas', 
  verificarToken,
  verificarPermiso('modificar_libros'),
  obtenerReservasActivas
);

export default router;