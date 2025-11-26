import mongoose from 'mongoose';

// 1. Definir el Esquema (Schema)
const productSchema = new mongoose.Schema({
  nombre_producto: { 
    type: String, 
    required: true 
  },
  descripcion: { 
    type: String 
  },
  unidades_disponibles: { 
    type: Number, 
    required: true, 
    min: 0 // Equivalente al CHECK (Unidades >= 0)
  },
  precio_unitario: { 
    type: Number, 
    required: true, 
    min: 0 // Equivalente al CHECK (Precio > 0)
  }
}, {
  versionKey: false
});

// 2. Creamos el Modelo
const Product = mongoose.model('Product', productSchema);

const ProductModel = {};

/* ------------------------------------------------------------------------------------------------ */
// Metodo #1
// Función para obtener todos los productos de la base de datos. -- GET -- 

ProductModel.findAll = async () => {
  // En Mongo no hay orden por defecto, así que usamos .sort() si quieres ordenarlos
  return await Product.find();
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #2
// Función para insertar un nuevo producto en la base de datos. --- POST --

/**
 * @param {object} productData - Datos del producto.
 * @returns {object} El producto recién creado.
 */
ProductModel.create = async (productData) => {
  const newProduct = new Product(productData);
  return await newProduct.save();
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #3
// Función para buscar un producto por su ID. --- GET BY ID ---

/**
 * @param {string} id - El ID del producto (ObjectId).
 * @returns {object | null} El producto encontrado o null.
 */
ProductModel.findById = async (id) => {
  return await Product.findById(id);
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #4
// Función para actualizar un producto por su ID. --- PUT ---

/**
 * Permite actualizaciones parciales.
 * @param {string} id - El ID del producto a actualizar.
 * @param {object} productData - Objeto con los campos a actualizar.
 * @returns {object | null} El producto actualizado.
 */
ProductModel.update = async (id, productData) => {
  // Mongoose maneja la actualización parcial automáticamente.
  // { new: true } devuelve el objeto YA actualizado.
  return await Product.findByIdAndUpdate(id, productData, { new: true });
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #5
// Función para eliminar un producto por su ID. --- DELETE ---

/**
 * @param {string} id - El ID del producto a eliminar.
 */
ProductModel.remove = async (id) => {
  await Product.findByIdAndDelete(id);
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #6
// Busca un producto para facturación (PARA EL SERVICIO).

/**
 * @param {string} id - ID del producto.
 * @param {object} session - La sesión de la transacción (equivalente al client de SQL).
 */
ProductModel.findForBilling = async (id, session) => {
  // En una transacción de Mongo, pasamos la 'session' como opción.
  // Mongo no tiene "FOR UPDATE", pero la transacción garantiza atomicidad.
  return await Product.findById(id).session(session);
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #7
// Actualiza el stock de un producto. ---- PUT ----

/**
 * @param {string} id - ID del producto.
 * @param {number} unidadesCompradas - Cuántas unidades se llevaron.
 * @param {object} session - La sesión de la transacción.
 */
ProductModel.updateStock = async (id, unidadesCompradas, session) => {
  // $inc es un operador atómico de Mongo para decrementar
  await Product.findByIdAndUpdate(
    id, 
    { $inc: { unidades_disponibles: -unidadesCompradas } }, 
    { session: session }
  );
};
/* ------------------------------------------------------------------------------------------------ */

export default ProductModel;