import { expect } from 'chai';
import { crearUsuario, iniciarSesion } from '../src/modules/usuarios/Usuario.service.js';
import { limpiarDB } from './db-setup.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_super_secret_key_temporal';

describe('Autenticación', () => {
  beforeEach(async function() {
    this.timeout(5000); // 5 segundos de timeout para la limpieza
    await limpiarDB();
  });

  it('debe gestionar usuarios y autenticación correctamente', async () => {
    // Crear usuario administrador
    const adminUser = await crearUsuario({
      nombre: "Admin Test",
      email: "admin@test.com",
      password: "123456",
      permisos: [
        "crear_libros",
        "modificar_libros",
        "inhabilitar_libros",
        "modificar_usuarios",
        "inhabilitar_usuarios"
      ]
    });
    
    expect(adminUser).to.have.property('nombre', 'Admin Test');
    expect(adminUser.permisos).to.include('crear_libros');
    expect(adminUser.permisos).to.include('inhabilitar_usuarios');

    // Crear usuario normal
    const normalUser = await crearUsuario({
      nombre: "User Test",
      email: "user@test.com",
      password: "123456"
    });
    
    expect(normalUser).to.have.property('nombre', 'User Test');
    expect(normalUser.permisos).to.be.an('array').that.is.empty;

    // Login con admin
    const adminLogin = await iniciarSesion("admin@test.com", "123456");
    const adminToken = jwt.sign(
      { 
        id: adminLogin._id,
        email: adminLogin.email,
        permisos: adminLogin.permisos 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Login con usuario normal
    const userLogin = await iniciarSesion("user@test.com", "123456");
    const userToken = jwt.sign(
      { 
        id: userLogin._id,
        email: userLogin.email,
        permisos: userLogin.permisos 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Verificar tokens
    const decodedAdmin = jwt.verify(adminToken, JWT_SECRET);
    expect(decodedAdmin.permisos).to.include('crear_libros');
    expect(decodedAdmin.email).to.equal('admin@test.com');

    const decodedUser = jwt.verify(userToken, JWT_SECRET);
    expect(decodedUser.permisos).to.be.an('array').that.is.empty;
    expect(decodedUser.email).to.equal('user@test.com');

    // Probar login con credenciales incorrectas
    try {
      await iniciarSesion("admin@test.com", "wrongpass");
      throw new Error("No debería llegar aquí");
    } catch (error) {
      expect(error.message).to.include('Credenciales inválidas');
    }
  });
});
