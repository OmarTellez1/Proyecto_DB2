import express from 'express';
import cors from 'cors'; // <-- 1. IMPORTAMOS CORS
import { config } from './config/env.js';
import pool from './config/db.js';

// Importamos nuestras rutas de productos
import productRoutes from './routes/product.routes.js';

// 1. Inicializar la aplicación
const app = express();
const PORT = config.server.port;

// 2. Middlewares
// Le decimos a Express que entienda JSON
app.use(express.json());

// Le decimos a Express que use CORS
// Esto debe ir ANTES de tus rutas
app.use(cors()); // <-- 2. USAMOS CORS

// 3. Rutas
app.get('/', (req, res) => {
  res.send('¡Hola! El servidor está funcionando correctamente.');
});

// Usamos las rutas de productos (ej. /api/productos)
app.use('/api/productos', productRoutes);

// (Aquí añadiremos las rutas de usuarios pronto)
// app.use('/api/usuarios', userRoutes);

// 4. Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});
//usar la siguiente url para probar el "get" http://localhost:3000/api/productos