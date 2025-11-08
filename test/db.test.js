import { conectarDB, desconectarDB } from '../src/core/database.js';

(async () => {
  try {
    await conectarDB();
    console.log('Prueba de conexión exitosa');
    await desconectarDB();
  } catch (error) {
    console.error('Prueba fallida:', error.message);
  }
})();