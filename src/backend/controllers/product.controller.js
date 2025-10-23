import ProductService from '../services/product.service.js';

const ProductController = {};

/**
 * Maneja la petición GET para obtener todos los productos.
 */
ProductController.getAll = async (req, res) => {
  try {
    const products = await ProductService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error en ProductController.getAll:', error.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// --- NUEVA FUNCIÓN ---
/**
 * Maneja la petición POST para crear un nuevo producto.
 */
ProductController.create = async (req, res) => {
  try {
    // 1. Obtenemos los datos del cuerpo (body) de la petición
    // (Asegúrate de tener app.use(express.json()) en index.js)
    const productData = req.body;

    // 2. Llamamos al servicio para crear el producto
    const newProduct = await ProductService.createProduct(productData);

    // 3. Respondemos con éxito (código 201 - Created) y el nuevo producto
    res.status(201).json(newProduct);

  } catch (error) {
    // 4. Manejo de errores
    console.error('Error en ProductController.create:', error.message);
    
    // Si el error es por validación (del servicio), enviamos un 400 (Bad Request)
    if (error.message.includes('obligatorios') || error.message.includes('negativas')) {
      res.status(400).json({ message: error.message });
    } else {
      // Si es otro tipo de error (ej. la BD se cayó)
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};
// ---------------------
// --- NUEVA FUNCIÓN ---
/**
 * Maneja la petición GET para obtener un producto por su ID.
 */
ProductController.getById = async (req, res) => {
  try {
    // 1. Obtenemos el ID de los parámetros de la URL (ej. /api/productos/5)
    const { id } = req.params;

    // 2. Llamamos al servicio
    const product = await ProductService.getProductById(id);

    // 3. Respondemos con el producto encontrado (200 OK)
    res.status(200).json(product);

  } catch (error) {
    // 4. Manejo de errores
    console.error('Error en ProductController.getById:', error.message);

    // Si el error es "Producto no encontrado" (del servicio), enviamos 404
    if (error.message.includes('Producto no encontrado')) {
      res.status(404).json({ message: error.message });
    } else {
      // Otro error (ej. ID no es un número, error de BD)
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};
export default ProductController;