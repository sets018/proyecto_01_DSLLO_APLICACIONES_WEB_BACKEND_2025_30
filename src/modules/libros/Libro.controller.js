import * as libroService from './Libro.service.js';

export const crearLibro = async (req, res) => {
  try {
    const libro = await libroService.crearLibro(req.body, req.usuario);
    res.status(201).json(libro);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const obtenerLibros = async (req, res) => {
  try {
    const { genero, editorial, autor, titulo, disponible, incluirInhabilitados = false, pagina = 1 } = req.query;
    
    const filtros = {};
    if (genero) filtros.genero = genero;
    if (editorial) filtros.editorial = editorial;
    if (autor) filtros.autor = autor;
    if (titulo) filtros.titulo = { $regex: titulo, $options: 'i' };
    if (disponible) filtros.disponible = disponible === 'true';
    
    const resultado = await libroService.obtenerLibros(
      filtros,
      parseInt(pagina),
      parseInt(req.query.porPagina) || 10,
      incluirInhabilitados === 'true'
    );
    
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const obtenerLibroPorId = async (req, res) => {
  try {
    const libro = await libroService.obtenerLibroPorId(req.params.id);
    res.json(libro);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const actualizarLibro = async (req, res) => {
  try {
    const libro = await libroService.actualizarLibro(
      req.params.id,
      req.body,
      req.usuario
    );
    res.json(libro);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const desactivarLibro = async (req, res) => {
  try {
    const libro = await libroService.desactivarLibro(
      req.params.id,
      req.usuario
    );
    res.json({
      message: 'Libro desactivado exitosamente',
      libro
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};