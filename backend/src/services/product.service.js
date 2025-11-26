import ProductModel from '../models/product.model.js';

const ProductService = {};

/* ------------------------------------------------------------------------------------------------ */
// Metodo #1
// Llama al modelo para obtener todos los productos. ----GET----

ProductService.getAllProducts = async () => {
  try {
    const products = await ProductModel.findAll();
    return products;
  } catch (error) {
    throw error;
  }
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #2
// Valida y llama al modelo para crear un nuevo producto. ----POST----

/**
 * ----Esto son comentarios JSDocs----
 * @param {object} productData - Datos del producto desde el controlador.
 * @returns {object} El producto creado.
 */

ProductService.createProduct = async (productData) => {
  // Lógica de Negocio/Validación (Igual que en SQL)
  if (!productData.nombre_producto || !productData.precio_unitario) {
    throw new Error('El nombre y el precio unitario son obligatorios.');
  }

  // Validación manual de negativos (aunque el Schema de Mongoose también lo valida)
  if (productData.unidades_disponibles < 0) {
    throw new Error('Las unidades disponibles no pueden ser negativas.');
  }

  try {
    const newProduct = await ProductModel.create(productData);
    return newProduct;
  } catch (error) {
    throw error;
  }
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #3
// Obtener producto por ID ----GET BY ID ----

/**
 * Llama al modelo para obtener un producto por su ID.
 * @param {string} id - El ID del producto (ObjectId).
 * @returns {object} El producto encontrado.
 */

ProductService.getProductById = async (id) => {
  try {
    const product = await ProductModel.findById(id);

    if (!product) {
      throw new Error('Producto no encontrado.');
    }

    return product;
  } catch (error) {
    // --- CAMBIO MONGO: Capturar error de formato de ID ---
    if (error.name === 'CastError') {
       throw new Error('Producto no encontrado.');
    }
    throw error;
  }
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #4
// Valida y llama al modelo para actualizar un producto. ----PUT----

/**
 * @param {string} id - El ID del producto.
 * @param {object} productData - Los datos a actualizar.
 * @returns {object} El producto actualizado.
 */

ProductService.updateProduct = async (id, productData) => {
  try {
    // 1. Verificar si el producto existe (Igual que en SQL)
    // Esto también nos sirve para validar si el ID tiene formato correcto
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      throw new Error('Producto no encontrado.');
    }

    // 2. Validar los datos de entrada (Igual que en SQL)
    if (productData.unidades_disponibles < 0) {
      throw new Error('Las unidades disponibles no pueden ser negativas.');
    }

    // 3. Llamar al modelo para actualizar
    const updatedProduct = await ProductModel.update(id, productData);
    return updatedProduct;

  } catch (error) {
    // Manejo de ID inválido
    if (error.name === 'CastError') {
       throw new Error('Producto no encontrado.');
    }
    throw error;
  }
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #5
// Valida y llama al modelo para eliminar un producto. ----DELETE----

/**
 * @param {string} id - El ID del producto.
 */

ProductService.deleteProduct = async (id) => {
  try {
    // 1. Verificar si el producto existe
    const existingProduct = await ProductModel.findById(id);
    if (!existingProduct) {
      throw new Error('Producto no encontrado.');
    }

    // 2. Eliminar
    await ProductModel.remove(id);

  } catch (error) {
    if (error.name === 'CastError') {
       throw new Error('Producto no encontrado.');
    }
    throw error;
  }
};
/* ------------------------------------------------------------------------------------------------ */

export default ProductService;