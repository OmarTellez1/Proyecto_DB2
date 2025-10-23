// Importamos el modelo
import ProductModel from '../models/product.model.js';

const ProductService = {};

/**
 * Llama al modelo para obtener todos los productos.
 * Aquí iría la lógica de negocio (si la hubiera).
 */
ProductService.getAllProducts = async () => {
  try {
    const products = await ProductModel.findAll();
    return products;
  } catch (error) {
    // Manejamos cualquier error que ocurra en el modelo
    throw error;
  }
};

export default ProductService;