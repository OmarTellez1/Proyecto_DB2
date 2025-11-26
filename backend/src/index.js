import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import connectDB from './config/db.js';

// Importamos rutas
import productRoutes from './routes/product.routes.js';
import userRoutes from './routes/user.routes.js'; // <-- 1. IMPORTAMOS RUTAS DE USUARIO
import authRoutes from './routes/auth.routes.js';
import facturaRoutes from './routes/factura.routes.js';

const app = express();
const PORT = config.server.port;

// --- CONECTAR A LA BASE DE DATOS ---
connectDB(); // <-- Ejecutamos la conexión aquí
// -----------------------------------

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.get('/', (req, res) => {
  res.send('¡Hola! El servidor está funcionando correctamente.');
});


app.use('/api/productos', productRoutes);
app.use('/api/usuarios', userRoutes); 
app.use('/api/auth', authRoutes);
app.use('/api/facturas', facturaRoutes);



app.listen(PORT, () => {
  console.log(`🚀 Servidor Express escuchando en http://localhost:${PORT}`);
});