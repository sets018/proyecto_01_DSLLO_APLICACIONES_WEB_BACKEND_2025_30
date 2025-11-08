import { LibroModel } from "./Libro.model.js";

export const crearLibro = async (libroData, usuario) => {
  try {
    const nuevoLibro = new LibroModel({
      ...libroData,
      creadoPor: usuario._id
    });
    return await nuevoLibro.save();
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new Error("Error de validación: " + Object.values(error.errors).map(e => e.message).join(', '));
    }
    throw new Error("Error al crear libro: " + error.message);
  }
};

export const obtenerLibros = async (filtros = {}, pagina = 1, porPagina = 10, incluirInhabilitados = false) => {
  // Construir query base
  const query = { };
  
  // Procesar filtros para búsqueda parcial en título
  if (filtros.titulo) {
    query.titulo = { $regex: filtros.titulo, $options: 'i' };
    delete filtros.titulo;
  }

  // Agregar el resto de filtros
  Object.assign(query, filtros);
  
  // Por defecto, excluir inhabilitados a menos que se solicite explícitamente
  if (!incluirInhabilitados) {
    query.isActive = true;
  }

  // Ejecutar consultas en paralelo para mejor rendimiento
  const [libros, totalDocumentos] = await Promise.all([
    LibroModel.find(query)
      .select('titulo autor editorial genero fechaPublicacion disponible creadoPor isActive')
      .skip((pagina - 1) * porPagina)
      .limit(porPagina),
      
    LibroModel.countDocuments(query)
  ]);
  
  return {
    libros,
    paginacion: {
      paginaActual: pagina,
      totalPaginas: Math.ceil(totalDocumentos / porPagina),
      librosPorPagina: porPagina,
      totalLibros: totalDocumentos
    }
  };
};

export const obtenerLibroPorId = async (id) => {
  try {
    const libro = await LibroModel.findById(id);
    if (!libro) {
      throw new Error("Libro no encontrado");
    }
    if (!libro.isActive) {
      throw new Error("El libro está inhabilitado");
    }
    return libro;
  } catch (error) {
    if (error.name === 'CastError') {
      throw new Error("ID de libro inválido");
    }
    throw error;
  }
};

export const actualizarLibro = async (id, updates, usuario) => {
  // Campos que requieren permiso de modificar_libros
  const camposProtegidos = ['titulo', 'autor', 'editorial', 'genero', 'fechaPublicacion'];
  
  // Verificar si se están actualizando campos protegidos
  const requierePermiso = Object.keys(updates).some(campo => 
    camposProtegidos.includes(campo)
  );
  
  // Si se actualizan campos protegidos, verificar permiso
  if (requierePermiso && !usuario.permisos.includes('modificar_libros')) {
    throw new Error('Permisos insuficientes para modificar información del libro');
  }
  
  return await LibroModel.findByIdAndUpdate(
    id, 
    {
      ...updates,
      modificadoPor: usuario._id
    }, 
    { new: true, runValidators: true }
  );
};

export const desactivarLibro = async (id, usuario) => {
  // Solo usuarios con permiso pueden desactivar libros
  if (!usuario.permisos.includes('inhabilitar_libros')) {
    throw new Error('Permisos insuficientes para desactivar libros');
  }
  
  return await LibroModel.findByIdAndUpdate(
    id, 
    { isActive: false }, 
    { new: true }
  );
};