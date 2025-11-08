import { UserModel } from "./Usuario.model.js";

export const crearUsuario = async (userData) => {
  try {
    const nuevoUsuario = new UserModel(userData);
    const usuarioGuardado = await nuevoUsuario.save();
    
    // Convertir a objeto y eliminar password
    const usuarioResponse = usuarioGuardado.toObject();
    delete usuarioResponse.password;
    
    return usuarioResponse;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("El email ya está registrado");
    }
    throw error;
  }
};

export const iniciarSesion = async (email, password) => {
  const usuario = await UserModel.findOne({ 
    email,
    isActive: true
  }).select("+password +permisos"); // Incluir permisos en la respuesta
  
  if (!usuario) {
    throw new Error("Credenciales inválidas o usuario inactivo");
  }

  const esValida = await usuario.comparePassword(password);
  if (!esValida) {
    throw new Error("Credenciales inválidas");
  }

  // Eliminar el password pero mantener los permisos
  const usuarioResponse = usuario.toObject();
  delete usuarioResponse.password;

  return usuarioResponse;
};

export const obtenerUsuarioPorId = async (id) => {
  const usuario = await UserModel.findOne({ 
    _id: id, 
    isActive: true // Solo activos
  }).select('-password'); // Excluir explícitamente el password
  
  if (!usuario || !usuario.isActive) {
    throw new Error('Usuario no encontrado o inactivo');
  }
  return usuario;
};


export const actualizarUsuario = async (id, updates, usuarioActual) => {
  // Verificar permisos: solo mismo usuario o administradores
  if (id !== usuarioActual.id && 
      !usuarioActual.permisos.includes('modificar_usuarios')) {
    throw new Error('No tienes permiso para modificar este usuario');
  }
  
  // Evitar campos protegidos
  const camposProtegidos = ['password', 'permisos', 'isActive'];
  camposProtegidos.forEach(campo => delete updates[campo]);
  
  return await UserModel.findByIdAndUpdate(
    id, 
    updates, 
    { new: true, runValidators: true }
  ).select('-password');
};

export const desactivarUsuario = async (id, usuarioActual) => {
  // Verificar permisos: solo mismo usuario o administradores
  if (id !== usuarioActual.id && 
      !usuarioActual.permisos.includes('inhabilitar_usuarios')) {
    throw new Error('No tienes permiso para desactivar este usuario');
  }
  
  return await UserModel.findByIdAndUpdate(
    id, 
    { isActive: false }, 
    { new: true }
  ).select('-password');
};

export const obtenerUsuarios = async (filtros = {}, pagina = 1, porPagina = 10, incluirInhabilitados = false) => {
  // Construir query base
  const query = {};
  
  // Procesar filtros para búsqueda parcial en nombre
  if (filtros.nombre) {
    query.nombre = { $regex: filtros.nombre, $options: 'i' };
    delete filtros.nombre;
  }

  // Agregar el resto de filtros
  Object.assign(query, filtros);
  
  // Por defecto, excluir inhabilitados a menos que se solicite explícitamente
  if (!incluirInhabilitados) {
    query.isActive = true;
  }
  
  const skip = (pagina - 1) * porPagina;
  
  // Excluir el password de los resultados
  return await UserModel
    .find(query)
    .select('-password')
    .skip(skip)
    .limit(porPagina)
    .lean();
};