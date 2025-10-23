import pool from '../config/db.js';

// Creamos un objeto para nuestro modelo
const ProductModel = {};

/**
 * Función para obtener todos los productos de la base de datos.
 * La lógica SQL va aquí.
 */
ProductModel.findAll = async () => {
  // Usamos 'pool.query' para enviar la consulta a PostgreSQL
  // SELECT * FROM Productos; [cite: 8]
  const result = await pool.query('SELECT * FROM Productos ORDER BY Id_Producto ASC');
  
  // 'result.rows' contiene el array de productos
  return result.rows;
};

// Exportamos el modelo
export default ProductModel;