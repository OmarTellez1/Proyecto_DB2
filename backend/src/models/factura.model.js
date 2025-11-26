import mongoose from 'mongoose';

// --- DEFINICIÓN DE ESQUEMAS (Schemas) ---

// 1. Esquema para el Detalle (Sub-documento)
// Esto define la estructura de cada ítem dentro de la factura.
const detalleSchema = new mongoose.Schema({
  id_producto: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', // Referencia al modelo Product
    required: true 
  },
  descripcion: String, // Guardamos el nombre del producto aquí (snapshot)
  unidades: Number,
  precio_unitario: Number,
  total_linea: Number
}, { _id: false }); // No necesitamos un _id para cada línea

// 2. Esquema para la Factura (Documento Principal)
const facturaSchema = new mongoose.Schema({
  id_cliente: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Referencia al modelo User (para hacer el populate)
    required: true 
  },
  fecha: { 
    type: Date, 
    default: Date.now 
  },
  total: { 
    type: Number, 
    required: true 
  },
  // Aquí guardamos el array de detalles directamente
  detalles: [detalleSchema] 
}, {
  versionKey: false
});

// 3. Creamos el Modelo
const Factura = mongoose.model('Factura', facturaSchema);

const FacturaModel = {};

/* ------------------------------------------------------------------------------------------------ */
// Metodo #1
// Función para crear una factura (Cabecera + Detalles).

/**
 * -----Esto son comentarios JSDoc-------
 * Crea la factura completa. En MongoDB esto es atómico para el documento.
 * @param {object} facturaData - Objeto con { id_cliente, total, detalles: [...] }
 * @param {object} session - La sesión de la transacción (Mongoose).
 * @returns {object} La factura creada.
 */
FacturaModel.create = async (facturaData, session) => {
  // Creamos la instancia del modelo con todos los datos (incluyendo detalles)
  const nuevaFactura = new Factura(facturaData);
  
  // Guardamos usando la sesión para garantizar la transacción
  const guardada = await nuevaFactura.save({ session });
  
  return guardada;
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #2
// Función para buscar una factura completa por su ID.

/**
 * -----Esto son comentarios JSDoc-------
 * Busca una factura y "puebla" (populate) los datos del cliente.
 * Reemplaza al JOIN complejo de SQL.
 * @param {string} id - El ID de la factura (ObjectId).
 * @returns {object | null} La factura completa con datos del cliente.
 */
FacturaModel.findById = async (id) => {
  // .populate('id_cliente') busca automáticamente al usuario en la colección 'users'
  // y reemplaza el ID por el objeto con sus datos (nombre, cedula, etc.)
  return await Factura.findById(id)
    .populate('id_cliente', 'nombre apellido cedula celular correo_electronico');
};
/* ------------------------------------------------------------------------------------------------ */

// (Nota: La función createDetalle ya no es necesaria en MongoDB 
// porque los detalles se guardan dentro del Metodo #1)

export default FacturaModel;