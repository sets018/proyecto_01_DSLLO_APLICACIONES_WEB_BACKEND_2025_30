import { expect } from 'chai';
import { crearUsuario, iniciarSesion } from '../src/modules/usuarios/Usuario.service.js';
import { conectar, limpiarDB, desconectar } from './setup.js';

describe('Usuarios', () => {
  afterEach(async () => {
    await limpiarDB();
  });

  it('debe manejar el registro y login correctamente', async () => {
    const testEmail = `test_${Date.now()}@biblioteca.com`;
    const nuevoUsuario = await crearUsuario({
      nombre: "Usuario Prueba",
      email: testEmail,
      password: "123456"
    });
    
    expect(nuevoUsuario).to.have.property('nombre', 'Usuario Prueba');
    expect(nuevoUsuario).to.have.property('email', testEmail);
    expect(nuevoUsuario).to.not.have.property('password');
    
    // Login exitoso
    const usuarioLogueado = await iniciarSesion(testEmail, "123456");
    expect(usuarioLogueado._id.toString()).to.equal(nuevoUsuario._id.toString());
    expect(usuarioLogueado.nombre).to.equal(nuevoUsuario.nombre);
    
    // Login fallido
    try {
      await iniciarSesion("nonexistent@biblioteca.com", "wrongpass");
      throw new Error("No debería llegar aquí");
    } catch (err) {
      expect(err.message).to.include('Credenciales inválidas');
    }
  });
});