import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import pool from './config/db.js';

// Importamos rutas
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js'; // <-- 1. IMPORTAMOS RUTAS DE USUARIO
import authRoutes from './routes/auth.routes.js';
import facturaRoutes from './routes/factura.routes.js';

const app = express();
const PORT = config.server.port;

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.get('/', (req, res) => {
  res.send('¡Hola! El servidor está funcionando correctamente.');
});

// Usamos las rutas de productos (ej. /api/productos)
app.use('/api/productos', productRoutes);

// Usamos las rutas de usuarios (ej. /api/usuarios)
app.use('/api/usuarios', userRoutes); // <-- 2. USAMOS LAS RUTAS
//Ruta de autenticación de usuario
app.use('/api/auth', authRoutes);
// ruta de transaccion de facturas
app.use('/api/facturas', facturaRoutes);
// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});