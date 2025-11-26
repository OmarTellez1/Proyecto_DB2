import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  nombre_producto: { type: String, required: true },
  descripcion: { type: String },
  unidades_disponibles: { type: Number, required: true, min: 0 },
  precio_unitario: { type: Number, required: true, min: 0 }
}, { versionKey: false });

const Product = mongoose.model('Product', productSchema);
const ProductModel = {};

// --- MÉTODOS CRUD (Sin cambios) ---
ProductModel.findAll = async () => await Product.find();
ProductModel.create = async (data) => await new Product(data).save();
ProductModel.findById = async (id) => await Product.findById(id);
ProductModel.update = async (id, data) => await Product.findByIdAndUpdate(id, data, { new: true });
ProductModel.remove = async (id) => await Product.findByIdAndDelete(id);

// --- MÉTODOS DE FACTURACIÓN (LIMPIOS - Estilo Mongo) ---

/**
 * Busca un producto. En Mongo no necesitamos "bloquear" (FOR UPDATE).
 * Confiamos en la operación atómica de actualización posterior.
 */
ProductModel.findForBilling = async (id) => {
  // Quitamos 'session'
  return await Product.findById(id);
};

/**
 * Actualiza el stock usando $inc (Atomic Operator).
 * Esto es "Thread Safe" por diseño en MongoDB.
 */
ProductModel.updateStock = async (id, unidadesCompradas) => {
  // Quitamos 'session'
  await Product.findByIdAndUpdate(
    id, 
    { $inc: { unidades_disponibles: -unidadesCompradas } }
  );
};

export default ProductModel;