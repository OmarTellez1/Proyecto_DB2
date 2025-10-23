import pool from '../config/db.js';

const ProductModel = {};

/**
 * Función para obtener todos los productos de la base de datos. -- GET -- 
 */
ProductModel.findAll = async () => {
  const result = await pool.query('SELECT * FROM Productos ORDER BY Id_Producto ASC');
  return result.rows;
};

// --- NUEVA FUNCIÓN --- POST --
/**
 * Función para insertar un nuevo producto en la base de datos.
 * @param {object} productData - Datos del producto (nombre_producto, descripcion, etc.)
 * @returns {object} El producto recién creado.
 */
ProductModel.create = async (productData) => {
  const {
    nombre_producto,
    descripcion,
    unidades_disponibles,
    precio_unitario
  } = productData;

  // Consulta SQL parametrizada para evitar inyección SQL
  const query = `
    INSERT INTO Productos (Nombre_Producto, Descripcion, Unidades_Disponibles, Precio_Unitario)
    VALUES ($1, $2, $3, $4)
    RETURNING *; 
  `;
  
  // Los valores a insertar
  const values = [
    nombre_producto,
    descripcion,
    unidades_disponibles,
    precio_unitario
  ];

  // Ejecutamos la consulta
  const result = await pool.query(query, values);

  // RETURNING * nos devuelve el objeto completo que se insertó
  // Devolvemos la primera (y única) fila insertada
  return result.rows[0];
};
// ---------------------

export default ProductModel;