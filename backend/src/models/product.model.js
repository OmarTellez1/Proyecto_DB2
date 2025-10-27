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
// --- NUEVA FUNCIÓN ---
/**
 * Función para actualizar un producto por su ID.
 * Permite actualizaciones parciales.
 * @param {number} id - El ID del producto a actualizar.
 * @param {object} productData - Objeto con los campos a actualizar.
 * @returns {object | null} El producto actualizado o null si no se encontró.
 */
ProductModel.update = async (id, productData) => {
  // 1. Obtenemos las claves (campos) del objeto productData
  // Ej: ['nombre_producto', 'precio_unitario']
  const fields = Object.keys(productData);

  // 2. Creamos la parte SET de la consulta dinámicamente
  // Ej: "Nombre_Producto" = $1, "Precio_Unitario" = $2
  // Usamos comillas dobles en los nombres de columna por si acaso (buena práctica).
  const setString = fields
    .map((field, index) => `"${field}" = $${index + 1}`)
    .join(', ');

  // Si no hay campos para actualizar, no hacemos nada
  if (setString.length === 0) {
    return ProductModel.findById(id); // O devolver un error
  }

  // 3. Obtenemos los valores
  // Ej: ['Laptop Nueva', 1250.00]
  const values = Object.values(productData);
  
  // 4. Añadimos el ID al final del array de valores para el WHERE
  // El ID será el último parámetro (ej. $3)
  const idIndex = values.length + 1;
  values.push(id);

  // 5. Construimos la consulta final
  const query = `
    UPDATE Productos
    SET ${setString}
    WHERE Id_Producto = $${idIndex}
    RETURNING *;
  `;

  // 6. Ejecutamos la consulta
  const result = await pool.query(query, values);

  // Devolvemos el producto actualizado
  return result.rows[0];
};
// --- NUEVA FUNCIÓN ---
/**
 * Función para eliminar un producto por su ID.
 * @param {number} id - El ID del producto a eliminar.
 */
ProductModel.remove = async (id) => {
  const query = 'DELETE FROM Productos WHERE Id_Producto = $1';
  const values = [id];

  // Simplemente ejecutamos la consulta.
  // No necesitamos 'RETURNING *', pero sí 'await' para esperar que termine.
  await pool.query(query, values);
  
  // No es necesario devolver nada, la acción se confirma si no hay error.
};
// -------------------
// --- NUEVA FUNCIÓN (PARA EL SERVICIO) ---
/**
 * Busca un producto para facturación y ¡LO BLOQUEA!
 * @param {number} id - ID del producto.
 * @param {object} client - La conexión activa de la transacción.
 */
ProductModel.findForBilling = async (id, client) => {
  // "FOR UPDATE" bloquea esta fila hasta que la transacción termine (COMMIT o ROLLBACK)
  // Esto evita que dos personas compren el último ítem al mismo tiempo.
  const query = `
    SELECT nombre_producto, precio_unitario, unidades_disponibles
    FROM productos
    WHERE id_producto = $1
    FOR UPDATE; 
  `;
  const result = await client.query(query, [id]);
  return result.rows[0];
};

// --- NUEVA FUNCIÓN ---
/**
 * Actualiza el stock de un producto.
 * @param {number} id - ID del producto.
 * @param {number} unidadesCompradas - Cuántas unidades se llevaron.
 * @param {object} client - La conexión activa de la transacción.
 */
ProductModel.updateStock = async (id, unidadesCompradas, client) => {
  const query = `
    UPDATE productos
    SET unidades_disponibles = unidades_disponibles - $1
    WHERE id_producto = $2;
  `;
  const values = [unidadesCompradas, id];
  await client.query(query, values);
};
export default ProductModel;