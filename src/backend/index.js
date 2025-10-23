import express from 'express';
import { config } from './config/env.js';
import pool from './config/db.js';

// --- NUEVAS IMPORTACIONES ---
// Importamos nuestras rutas de productos
import productRoutes from './routes/product.routes.js';
// ----------------------------

const app = express();
const PORT = config.server.port;

// --- MIDDLEWARE ---
// Le decimos a Express que entienda JSON
app.use(express.json());
// -------------------


// --- RUTAS ---
app.get('/', (req, res) => {
  res.send('¡Hola! El servidor está funcionando correctamente.');
});

// Le decimos a Express que use nuestras rutas de productos
// Todas las rutas en 'productRoutes' tendrán el prefijo '/api/productos'
app.use('/api/productos', productRoutes);
// -----------------

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});
//usar la siguiente url para probar el "get" http://localhost:3000/api/productos