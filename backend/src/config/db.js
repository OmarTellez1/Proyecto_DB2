// Importamos el Pool de la librería pg (la forma recomendada de conectarse)
import { Pool } from 'pg';
// Importamos nuestra configuración de variables de entorno
import { config } from './env.js';

// Creamos una instancia del Pool usando la configuración de la base de datos
const pool = new Pool({
  user: config.db.user,
  password: config.db.password,
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
});

// Opcional: Probar la conexión
// Esto es genial para asegurarnos de que todo funciona al iniciar la app.
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.stack);
  } else {
    console.log('Conexión exitosa a PostgreSQL establecida en:', res.rows[0].now);
  }
});

// Exportamos el pool para que pueda ser usado en otros archivos (como los servicios)
export default pool;