import mongoose from 'mongoose';

// Esquemas (Igual que antes)
const detalleSchema = new mongoose.Schema({
  id_producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  descripcion: String,
  unidades: Number,
  precio_unitario: Number,
  total_linea: Number
}, { _id: false });

const facturaSchema = new mongoose.Schema({
  id_cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fecha: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  detalles: [detalleSchema] 
}, { versionKey: false });

const Factura = mongoose.model('Factura', facturaSchema);
const FacturaModel = {};

// --- MÉTODO CREATE (LIMPIO - Estilo Mongo) ---

/**
 * Crea la factura. Al ser un solo documento con array de detalles,
 * Mongo garantiza que esto es atómico. No necesitamos transacción.
 */
FacturaModel.create = async (facturaData) => {
  // Quitamos 'session'. Simplemente guardamos.
  const nuevaFactura = new Factura(facturaData);
  return await nuevaFactura.save();
};

// --- OTROS MÉTODOS (Sin cambios) ---
FacturaModel.findById = async (id) => {
  return await Factura.findById(id).populate('id_cliente', 'nombre apellido cedula celular correo_electronico');
};

FacturaModel.findHistoryByClientId = async (idCliente) => {
  return await Factura.find({ id_cliente: idCliente }).sort({ fecha: -1 });
};

export default FacturaModel;