import ProductModel from '../models/product.model.js';

const ProductService = {};

/**
 * Llama al modelo para obtener todos los productos.
 */
ProductService.getAllProducts = async () => {
  try {
    const products = await ProductModel.findAll();
    return products;
  } catch (error) {
    throw error;
  }
};

// --- NUEVA FUNCIÓN ---
/**
 * Valida y llama al modelo para crear un nuevo producto.
 * @param {object} productData - Datos del producto desde el controlador.
 * @returns {object} El producto creado.
 */
ProductService.createProduct = async (productData) => {
  // Lógica de Negocio/Validación (Ejemplo)
  // Basado en tu script SQL, Nombre_Producto y Precio_Unitario son NOT NULL
  if (!productData.nombre_producto || !productData.precio_unitario) {
    throw new Error('El nombre y el precio unitario son obligatorios.');
  }

  // Tu script SQL también define CHECK (Unidades_Disponibles >= 0)
  if (productData.unidades_disponibles < 0) {
    throw new Error('Las unidades disponibles no pueden ser negativas.');
  }

  try {
    // Si todo está bien, llamamos al modelo
    const newProduct = await ProductModel.create(productData);
    return newProduct;
  } catch (error) {
    // Manejamos errores (ej. si el precio es negativo y falla el CHECK de la BD)
    throw error;
  }
};
// ---------------------
// --- NUEVA FUNCIÓN -- Obtener producto por ID-
/**
 * Llama al modelo para obtener un producto por su ID.
 * @param {number} id - El ID del producto.
 * @returns {object} El producto encontrado.
 */
ProductService.getProductById = async (id) => {
  try {
    const product = await ProductModel.findById(id);

    // Lógica de negocio: ¿Qué pasa si el ID no existe?
    if (!product) {
      throw new Error('Producto no encontrado.');
    }

    return product;
  } catch (error) {
    throw error;
  }
};
// ---------------------
export default ProductService;