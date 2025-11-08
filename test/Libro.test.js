import { expect } from 'chai';
import supertest from 'supertest';
import app from '../server.js';
import { conectar, limpiarDB, desconectar, createTestUser } from './setup.js';
import { LibroModel } from '../src/modules/libros/Libro.model.js';

const request = supertest(app);

describe('API Libros', () => {
  afterEach(async () => {
    await limpiarDB();
  });

  describe('GET /api/v1/libros', () => {
    it('debe listar libros públicamente', async () => {
      const admin = await createTestUser(['crear_libros']);
      const libro = await LibroModel.create({
        titulo: 'Libro de Prueba',
        autor: 'Autor de Prueba',
        genero: 'Prueba',
        editorial: 'Editorial Test',
        fechaPublicacion: new Date(),
        disponible: true,
        creadoPor: admin.user._id
      });

      const res = await request.get('/api/v1/libros');
      
      expect(res.status).to.equal(200);
      expect(res.body.libros).to.be.an('array');
      expect(res.body.paginacion).to.exist;
    });

    it('debe filtrar por género correctamente', async () => {
      const admin = await createTestUser(['crear_libros']);
      await LibroModel.create([
        {
          titulo: 'Libro 1',
          autor: 'Autor 1',
          genero: 'Ficción',
          editorial: 'Editorial 1',
          fechaPublicacion: new Date(),
          creadoPor: admin.user._id
        },
        {
          titulo: 'Libro 2',
          autor: 'Autor 2',
          genero: 'No Ficción',
          editorial: 'Editorial 2',
          fechaPublicacion: new Date(),
          creadoPor: admin.user._id
        }
      ]);

      const res = await request
        .get('/api/v1/libros')
        .query({ genero: 'Ficción' });

      expect(res.status).to.equal(200);
      expect(res.body.libros).to.have.lengthOf(1);
      expect(res.body.libros[0].genero).to.equal('Ficción');
    });
  });

  describe('POST /api/v1/libros', () => {
    it('debe requerir autenticación', async () => {
      const res = await request
        .post('/api/v1/libros')
        .send({
          titulo: 'Nuevo Libro',
          autor: 'Nuevo Autor',
          genero: 'Nuevo Género',
          editorial: 'Nueva Editorial',
          fechaPublicacion: new Date()
        });

      expect(res.status).to.equal(401);
    });

    it('debe requerir permiso crear_libros', async () => {
      const user = await createTestUser([]);
      const res = await request
        .post('/api/v1/libros')
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          titulo: 'Nuevo Libro',
          autor: 'Nuevo Autor',
          genero: 'Nuevo Género',
          editorial: 'Nueva Editorial',
          fechaPublicacion: new Date()
        });

      expect(res.status).to.equal(403);
    });

    it('debe crear libro con permisos correctos', async () => {
      const admin = await createTestUser(['crear_libros']);
      const res = await request
        .post('/api/v1/libros')
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          titulo: 'Nuevo Libro',
          autor: 'Nuevo Autor',
          genero: 'Nuevo Género',
          editorial: 'Nueva Editorial',
          fechaPublicacion: new Date()
        });

      expect(res.status).to.equal(201);
    });
  });

  describe('PUT /api/v1/libros/:id', () => {
    it('debe actualizar libro con permisos correctos', async () => {
      const admin = await createTestUser(['crear_libros', 'modificar_libros']);
      const libro = await LibroModel.create({
        titulo: 'Libro Original',
        autor: 'Autor Original',
        genero: 'Género Original',
        editorial: 'Editorial Original',
        fechaPublicacion: new Date(),
        creadoPor: admin.user._id
      });

      const res = await request
        .put(`/api/v1/libros/${libro._id}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send({
          titulo: 'Libro Actualizado',
          autor: 'Autor Actualizado'
        });

      expect(res.status).to.equal(200);
      expect(res.body.titulo).to.equal('Libro Actualizado');
    });
  });

  describe('DELETE /api/v1/libros/:id', () => {
    it('debe realizar soft delete con permisos correctos', async () => {
      const admin = await createTestUser(['crear_libros', 'inhabilitar_libros']);
      const libro = await LibroModel.create({
        titulo: 'Libro a Eliminar',
        autor: 'Autor',
        genero: 'Género',
        editorial: 'Editorial',
        fechaPublicacion: new Date(),
        creadoPor: admin.user._id
      });

      const res = await request
        .delete(`/api/v1/libros/${libro._id}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(res.status).to.equal(200);
      
      const libroEliminado = await LibroModel.findById(libro._id);
      expect(libroEliminado.isActive).to.be.false;
    });
  });

  describe('Filtros combinados y paginación', () => {
    it('debe filtrar por múltiples criterios', async () => {
      const admin = await createTestUser(['crear_libros']);
      await LibroModel.create([
        {
          titulo: 'Cien años de soledad',
          autor: 'Gabriel García Márquez',
          genero: 'Novela',
          editorial: 'Sudamericana',
          fechaPublicacion: new Date(1967, 4, 30),
          creadoPor: admin.user._id
        },
        {
          titulo: 'Rayuela',
          autor: 'Julio Cortázar',
          genero: 'Novela',
          editorial: 'Sudamericana',
          fechaPublicacion: new Date(1963, 5, 28),
          creadoPor: admin.user._id
        }
      ]);

      const res = await request
        .get('/api/v1/libros')
        .query({
          genero: 'Novela',
          editorial: 'Sudamericana'
        });

      expect(res.status).to.equal(200);
      expect(res.body.libros).to.have.lengthOf(2);
      expect(res.body.libros[0]).to.have.property('editorial', 'Sudamericana');
    });

    it('debe implementar paginación correctamente', async () => {
      const admin = await createTestUser(['crear_libros']);
      // Crear 15 libros de prueba
      const libros = Array.from({ length: 15 }, (_, i) => ({
        titulo: `Libro de prueba ${i + 1}`,
        autor: 'Autor Genérico',
        genero: 'Ensayo',
        editorial: 'Editorial X',
        fechaPublicacion: new Date(2000 + i, 0, 1),
        creadoPor: admin.user._id
      }));

      await LibroModel.create(libros);

      const resPage1 = await request
        .get('/api/v1/libros')
        .query({ pagina: 1, porPagina: 5 });

      expect(resPage1.status).to.equal(200);
      expect(resPage1.body.libros).to.have.lengthOf(5);
      expect(resPage1.body.paginacion).to.include({
        paginaActual: 1,
        librosPorPagina: 5,
        totalPaginas: 3
      });

      const resPage2 = await request
        .get('/api/v1/libros')
        .query({ pagina: 2, porPagina: 5 });

      expect(resPage2.status).to.equal(200);
      expect(resPage2.body.libros).to.have.lengthOf(5);
      expect(resPage2.body.paginacion.paginaActual).to.equal(2);
    });
  });
});
