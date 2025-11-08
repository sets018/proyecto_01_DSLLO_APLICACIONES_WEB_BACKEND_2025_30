import * as reservaService from './Reserva.service.js';

export const crearReserva = async (req, res) => {
  try {
    const usuarioId = req.usuario._id;
    const { libroId } = req.body;

    const reserva = await reservaService.crearReserva(usuarioId, libroId);
    res.status(201).json({
      success: true,
      data: reserva
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const finalizarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await reservaService.finalizarReserva(id);
    
    res.json({
      success: true,
      data: reserva
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const obtenerHistorialLibro = async (req, res) => {
  try {
    const { libroId } = req.params;
    const historial = await reservaService.obtenerHistorialLibro(libroId);
    
    res.json({
      success: true,
      data: historial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const obtenerHistorialUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId || req.usuario._id;
    const historial = await reservaService.obtenerHistorialUsuario(usuarioId);
    
    res.json({
      success: true,
      data: historial
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const obtenerReservasActivas = async (req, res) => {
  try {
    const { usuarioId, libroId, pagina = 1 } = req.query;
    const filtros = {};
    
    if (usuarioId) filtros.usuario = usuarioId;
    if (libroId) filtros.libro = libroId;
    
    const resultado = await reservaService.obtenerReservasActivas(
      filtros, 
      parseInt(pagina)
    );
    
    res.json({
      success: true,
      data: resultado.reservas,
      pagination: resultado.paginacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};