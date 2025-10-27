import pool from '../config/db.js';

const UserModel = {};

/**
 * Función para insertar un nuevo usuario en la base de datos.
 * @param {object} userData - Datos del usuario (con contraseña hasheada).
 * @returns {object} El usuario recién creado (sin la contraseña).
 */
UserModel.create = async (userData) => {
  const {
    nombre,
    apellido,
    cedula,
    celular,
    correo_electronico,
    rol,
    contrasena // Recibimos la contraseña ya hasheada
  } = userData;

  // Consulta SQL con columnas en minúscula
  const query = `
    INSERT INTO usuarios (nombre, apellido, cedula, celular, correo_electronico, rol, contrasena, estado)
    VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    RETURNING id_usuario, nombre, apellido, correo_electronico, rol, estado; 
  `;
  
  const values = [
    nombre,
    apellido,
    cedula,
    celular,
    correo_electronico,
    rol,
    contrasena
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Función para obtener TODOS los usuarios ACTIVOS.
 * @returns {Array} Lista de usuarios activos.
 */
UserModel.findAll = async () => {
  // ¡MODIFICADO! Añadimos WHERE estado = true
  const query = `
    SELECT id_usuario, nombre, apellido, cedula, celular, correo_electronico, rol, estado 
    FROM usuarios 
    WHERE estado = true
    ORDER BY id_usuario ASC;
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Función para buscar un usuario por su ID (esté activo o no).
 * @param {number} id - El ID del usuario.
 * @returns {object | null} El usuario encontrado o null si no existe.
 */
UserModel.findById = async (id) => {
  // Seleccionamos campos seguros (incluyendo estado)
  const query = `
    SELECT id_usuario, nombre, apellido, cedula, celular, correo_electronico, rol, estado 
    FROM usuarios 
    WHERE id_usuario = $1;
  `;
  const values = [id];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Función para actualizar un usuario por su ID (actualización dinámica).
 * @param {number} id - El ID del usuario a actualizar.
 *D @param {object} dataToUpdate - Objeto con los campos a actualizar (ej. { rol: 'Admin', estado: false }).
 * @returns {object | null} El usuario actualizado (sin contraseña).
 */
UserModel.update = async (id, dataToUpdate) => {
  // 1. Obtenemos las claves (campos) del objeto
  // Ej: ['rol', 'estado']
  const fields = Object.keys(dataToUpdate);

  // 2. Creamos la parte SET de la consulta dinámicamente
  // Ej: rol = $1, estado = $2
  const setString = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');

  if (setString.length === 0) {
    return UserModel.findById(id); // No hay nada que actualizar
  }

  // 3. Obtenemos los valores
  const values = Object.values(dataToUpdate);
  
  // 4. Añadimos el ID al final del array de valores para el WHERE
  const idIndex = values.length + 1;
  values.push(id);

  // 5. Construimos la consulta final
  // Devolvemos solo los campos seguros
  const query = `
    UPDATE usuarios
    SET ${setString}
    WHERE id_usuario = $${idIndex}
    RETURNING id_usuario, nombre, apellido, correo_electronico, rol, estado;
  `;

  // 6. Ejecutamos la consulta
  const result = await pool.query(query, values);
  return result.rows[0];
};

// La función 'remove' (borrado físico) se elimina intencionalmente.

// --- NUEVA FUNCIÓN ---
/**
 * Busca un usuario por su cédula.
 * ¡Esta es la única función que DEBE seleccionar la contraseña y el estado!
 * @param {string} cedula - La cédula del usuario.
 * @returns {object | null} El usuario completo (incluyendo hash de contraseña).
 */
UserModel.findByCedula = async (cedula) => {
  // Seleccionamos todos los campos necesarios para la autenticación
  const query = `
    SELECT id_usuario, nombre, apellido, rol, estado, contrasena 
    FROM usuarios 
    WHERE cedula = $1;
  `;
  const values = [cedula];
  
  const result = await pool.query(query, values);
  
  // Devolvemos el usuario completo
  return result.rows[0];
};
// ---------------------
export default UserModel;