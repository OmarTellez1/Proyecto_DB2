// Importamos el servicio
import ProductService from '../services/product.service.js';

const ProductController = {};

/**
 * Maneja la petición GET para obtener todos los productos.
 * Llama al servicio y envía la respuesta.
 */
ProductController.getAll = async (req, res) => {
  try {
    // 1. Llama al servicio
    const products = await ProductService.getAllProducts();

    // 2. Envía la respuesta JSON
    res.status(200).json(products);

  } catch (error) {
    // 3. Manejo de errores
    console.error('Error en ProductController.getAll:', error.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export default ProductController;