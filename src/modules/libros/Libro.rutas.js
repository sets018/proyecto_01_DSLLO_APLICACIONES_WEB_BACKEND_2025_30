import express from 'express';
import {
  crearLibro,
  obtenerLibros,
  obtenerLibroPorId,
  actualizarLibro,
  desactivarLibro
} from './Libro.controller.js';
import { verificarToken, verificarPermiso } from '../../middlewares/auth.js';

const router = express.Router();

// Endpoints públicos de lectura
router.get('/', obtenerLibros);
router.get('/:id', obtenerLibroPorId);

router.post('/', 
  verificarToken,
  verificarPermiso('crear_libros'),
  crearLibro
);

router.put('/:id', 
  verificarToken,
  verificarPermiso('modificar_libros'),
  actualizarLibro
);

router.delete('/:id', 
  verificarToken,
  verificarPermiso('inhabilitar_libros'),
  desactivarLibro
);

export default router;