import jwt from 'jsonwebtoken';
import { 
  crearUsuario,
  iniciarSesion,
  obtenerUsuarioPorId,
  actualizarUsuario,
  desactivarUsuario,
  obtenerUsuarios
} from './Usuario.service.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_super_secret_key_temporal';

export const register = async (req, res) => {
  try {
    const usuario = await crearUsuario(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await iniciarSesion(email, password);

    const token = jwt.sign(
      { 
        id: usuario._id,
        email: usuario.email,
        permisos: usuario.permisos 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      usuario,
      token
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const usuario = await obtenerUsuarioPorId(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const usuario = await actualizarUsuario(
      req.params.id,
      req.body,
      req.usuario
    );
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const { 
      nombre, rol, pagina = 1, porPagina = 10, 
      incluirInhabilitados = false 
    } = req.query;

    const filtros = {};
    if (nombre) filtros.nombre = nombre;
    if (rol) filtros.rol = rol;

    const usuarios = await obtenerUsuarios(
      filtros,
      parseInt(pagina),
      parseInt(porPagina),
      incluirInhabilitados === 'true'
    );

    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const usuario = await desactivarUsuario(req.params.id, req.usuario);
    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
      data: usuario
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};