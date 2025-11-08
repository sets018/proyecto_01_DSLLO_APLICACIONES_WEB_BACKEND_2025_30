import jwt from 'jsonwebtoken';
import { UserModel } from '../modules/usuarios/Usuario.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_super_secret_key_temporal';

export const verificarToken = async (req, res, next) => {
  try {
    // Obtener el token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado. Token no proporcionado.' 
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar el usuario
    const usuario = await UserModel.findOne({ 
      _id: decoded.id,
      isActive: true
    });

    if (!usuario) {
      return res.status(401).json({ 
        error: 'Token inválido - Usuario no encontrado o inactivo' 
      });
    }

    // Agregar el usuario al request
    req.usuario = usuario;
    next();
    
  } catch (error) {
    res.status(401).json({ 
      error: 'Token inválido o expirado' 
    });
  }
};

export const verificarPermiso = (permiso) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    if (!req.usuario.permisos.includes(permiso)) {
      return res.status(403).json({ 
        error: 'Permiso denegado' 
      });
    }

    next();
  };
};