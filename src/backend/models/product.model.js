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
// --- NUEVA FUNCIÓN ---GET BY ID ---
/**
 * Función para buscar un producto por su ID.
 * @param {number} id - El ID del producto.
 * @returns {object | null} El producto encontrado o null si no existe.
 */
ProductModel.findById = async (id) => {
  const query = 'SELECT * FROM Productos WHERE Id_Producto = $1';
  const values = [id];

  const result = await pool.query(query, values);

  // result.rows[0] contendrá el producto si se encuentra
  // Si no se encuentra, result.rows estará vacío y esto devolverá undefined (o null)
  return result.rows[0];
};

export default ProductModel;