import mongoose from 'mongoose';
import { config } from './env.js';

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    // Intentamos conectar
    await mongoose.connect(config.db.uri);
    
    console.log('🍃 Conexión exitosa a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    // Si falla la conexión, detenemos la app porque es vital
    process.exit(1);
  }
};

// Exportamos la función para llamarla en index.js
export default connectDB;