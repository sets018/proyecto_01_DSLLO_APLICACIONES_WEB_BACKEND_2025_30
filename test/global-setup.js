// Archivo global de pruebas para configurar el entorno
import { describe, before, after } from 'mocha';
import { conectar, desconectar } from './db-setup.js';

describe('Test Suite', () => {
  before(async () => {
    // Una sola conexión para todas las pruebas
    await conectar();
  });

  after(async () => {
    // Una sola desconexión al final
    await desconectar();
  });
});