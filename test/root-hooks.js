// Archivo de configuración global para pruebas
import { conectar, desconectar } from './db-setup.js';

// Root hooks para Mocha
export const mochaHooks = {
  beforeAll: async function() {
    this.timeout(10000); // 10 segundos de timeout para la conexión
    console.log('Iniciando conexión a MongoDB...');
    await conectar();
    console.log('Conexión a MongoDB establecida');
  },

  afterAll: async function() {
    this.timeout(5000); // 5 segundos de timeout para la desconexión
    console.log('Cerrando conexión a MongoDB...');
    await desconectar();
    console.log('Conexión a MongoDB cerrada');
  }
};