import { expect } from 'chai';
import { crearUsuario } from '../src/modules/usuarios/Usuario.service.js';
import { crearLibro } from '../src/modules/libros/Libro.service.js';
import { crearReserva, finalizarReserva } from '../src/modules/reservas/Reserva.service.js';
import { ReservaModel } from '../src/modules/reservas/Reserva.model.js';
import { LibroModel } from '../src/modules/libros/Libro.model.js';
import { conectar, limpiarDB, desconectar, createTestUser } from './setup.js';

describe('Reservas', () => {
  afterEach(async () => {
    await limpiarDB();
  });

  it('debe gestionar el ciclo de vida de una reserva correctamente', async () => {
    // Crear usuario con permisos necesarios
    const { user: admin } = await createTestUser(['crear_libros']);
    
    // 2. Crear datos de prueba
    const usuario = await crearUsuario({
      nombre: "Usuario Reserva",
      email: "reserva@biblioteca.com",
      password: "123456"
    });
    
    const libro = await crearLibro({
      titulo: "Libro de Prueba para Reserva",
      autor: "Autor de Prueba",
      genero: "Novela",
      editorial: "Editorial X",
      fechaPublicacion: new Date(2020, 0, 1)
    }, admin);
    
    // 3. Crear reserva
    const reserva = await crearReserva(usuario._id, libro._id);
    expect(reserva).to.exist;
    expect(reserva.estado).to.equal('activa');
    expect(reserva.usuario._id.toString()).to.equal(usuario._id.toString());
    expect(reserva.libro._id.toString()).to.equal(libro._id.toString());
    
    // 4. Verificar libro no disponible
    const libroActualizado = await LibroModel.findById(libro._id);
    expect(libroActualizado.disponible).to.be.false;
    
    // 5. Finalizar reserva
    const reservaFinalizada = await finalizarReserva(reserva._id);
    expect(reservaFinalizada.estado).to.equal('completada');
    
    // 6. Verificar libro disponible nuevamente
    const libroDisponible = await LibroModel.findById(libro._id);
    expect(libroDisponible.disponible).to.be.true;
    
    // 7. Obtener historial de usuario
    const historialUsuario = await ReservaModel.find({ usuario: usuario._id })
      .populate('libro', 'titulo');
    
    // 8. Obtener historial de libro
    const historialLibro = await ReservaModel.find({ libro: libro._id })
      .populate('usuario', 'nombre');
    console.log('👤 Historial de libro:', historialLibro.map(r => r.usuario.nombre));
    
    expect(historialLibro).to.have.lengthOf(1);
    expect(historialLibro[0].usuario.nombre).to.equal('Usuario Reserva');
  });
});