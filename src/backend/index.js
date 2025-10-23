import express from 'express';
// Importamos nuestra configuración (que incluye el puerto)
import { config } from './config/env.js';

// ¡Importante! Importamos el pool de la base de datos.
// Aunque no lo usemos directamente aquí, el simple hecho de importarlo
// ejecutará el código en db.js, incluyendo la prueba de conexión 'SELECT NOW()'.
import pool from './config/db.js';

// 1. Inicializar la aplicación Express
const app = express();

// 2. Definir el puerto
// Usamos el puerto de nuestra configuración
const PORT = config.server.port;

// 3. (Opcional) Ruta de prueba
// Creamos una ruta simple para saber que el servidor funciona
app.get('/', (req, res) => {
  res.send('¡Hola! El servidor está funcionando correctamente.');
});

// 4. Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});