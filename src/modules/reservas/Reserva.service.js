import { ReservaModel } from "./Reserva.model.js";
import { LibroModel } from "../libros/Libro.model.js";

export const crearReserva = async (usuarioId, libroId) => {
  // 1. Verificar disponibilidad del libro
  const libro = await LibroModel.findOne({
    _id: libroId,
    disponible: true,
    isActive: true
  });

  if (!libro) {
    throw new Error("El libro no está disponible para reserva");
  }

  // 2. Crear la reserva
  const reserva = new ReservaModel({
    usuario: usuarioId,
    libro: libroId
  });

  // 3. Actualizar disponibilidad del libro
  libro.disponible = false;
  await libro.save();

  await reserva.save();
  
  // Poblar los datos relacionados
  return await ReservaModel.findById(reserva._id)
    .populate('usuario', 'nombre email')
    .populate('libro', 'titulo autor');
};

export const finalizarReserva = async (reservaId) => {
  const reserva = await ReservaModel.findById(reservaId);
  
  if (!reserva || reserva.estado !== "activa") {
    throw new Error("Reserva no válida");
  }

  // Actualizar estado de reserva
  reserva.estado = "completada";
  reserva.fechaEntrega = new Date(); // Fecha de entrega real
  await reserva.save();

  // Actualizar disponibilidad del libro
  await LibroModel.findByIdAndUpdate(
    reserva.libro,
    { disponible: true }
  );

  return reserva;
};

export const obtenerHistorialLibro = async (libroId, incluirInhabilitados = false) => {
  const query = { 
    libro: libroId,
    ...(incluirInhabilitados ? {} : { isActive: true })
  };

  return await ReservaModel.find(query)
    .select("-__v")
    .populate({
      path: "usuario",
      select: "nombre email"
    })
    .populate({
      path: "libro",
      select: "titulo autor"
    })
    .sort({ fechaReserva: -1 })
    .lean()
    .then(reservas => reservas.map(reserva => ({
      id: reserva._id,
      nombreUsuario: reserva.usuario.nombre,
      emailUsuario: reserva.usuario.email,
      fechaReserva: reserva.fechaReserva,
      fechaEntrega: reserva.fechaEntrega,
      estado: reserva.estado,
      activa: reserva.isActive
    })));
};

export const obtenerHistorialUsuario = async (usuarioId, incluirInhabilitados = false) => {
  const query = { 
    usuario: usuarioId,
    ...(incluirInhabilitados ? {} : { isActive: true })
  };

  return await ReservaModel.find(query)
    .select("-__v")
    .populate({
      path: "libro",
      select: "titulo autor editorial"
    })
    .sort({ fechaReserva: -1 })
    .lean()
    .then(reservas => reservas.map(reserva => ({
      id: reserva._id,
      libro: {
        titulo: reserva.libro.titulo,
        autor: reserva.libro.autor,
        editorial: reserva.libro.editorial
      },
      fechaReserva: reserva.fechaReserva,
      fechaEntrega: reserva.fechaEntrega,
      estado: reserva.estado,
      activa: reserva.isActive
    })));
};

export const obtenerReservasActivas = async (filtros = {}, pagina = 1, porPagina = 10) => {
  const query = { estado: "activa", ...filtros };
  
  const [reservas, total] = await Promise.all([
    ReservaModel.find(query)
      .skip((pagina - 1) * porPagina)
      .limit(porPagina)
      .populate("usuario_info")
      .populate("libro_info"),
      
    ReservaModel.countDocuments(query)
  ]);
  
  return {
    reservas,
    paginacion: {
      paginaActual: pagina,
      totalPaginas: Math.ceil(total / porPagina),
      reservasPorPagina: porPagina
    }
  };
};