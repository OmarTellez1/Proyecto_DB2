import pool from '../config/db.js';

const UserModel = {};

/**
 * Función para insertar un nuevo usuario en la base de datos.
 * @param {object} userData - Datos del usuario.
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
    hashedPassword // Recibimos la contraseña ya hasheada
  } = userData;

  // Consulta SQL parametrizada
  const query = `
    INSERT INTO Usuarios (Nombre, Apellido, Cedula, Celular, Correo_Electronico, Rol, Contrasena)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING Id_Usuario, Nombre, Apellido, Correo_Electronico, Rol; 
  `;
  
  const values = [
    nombre,
    apellido,
    cedula,
    celular,
    correo_electronico,
    rol,
    hashedPassword
  ];

  // Ejecutamos la consulta
  const result = await pool.query(query, values);

  // RETURNING * nos devuelve el objeto
  // Note que NO devolvemos la contraseña, solo los datos seguros.
  return result.rows[0];
};
// --- NUEVA FUNCIÓN ---
/**
 * Función para obtener todos los usuarios (excluyendo la contraseña).
 * @returns {Array} Lista de usuarios.
 */
UserModel.findAll = async () => {
  // Seleccionamos explícitamente los campos seguros
  const query = `
    SELECT Id_Usuario, Nombre, Apellido, Cedula, Celular, Correo_Electronico, Rol 
    FROM Usuarios 
    ORDER BY Id_Usuario ASC;
  `;

  const result = await pool.query(query);
  
  // result.rows contendrá el array de usuarios
  return result.rows;
};
// ---------------------
// --- NUEVA FUNCIÓN ---
/**
 * Función para buscar un usuario por su ID (excluyendo la contraseña).
 * @param {number} id - El ID del usuario.
 * @returns {object | null} El usuario encontrado o null si no existe.
 */
UserModel.findById = async (id) => {
  // Seleccionamos explícitamente los campos seguros
  const query = `
    SELECT Id_Usuario, Nombre, Apellido, Cedula, Celular, Correo_Electronico, Rol 
    FROM Usuarios 
    WHERE Id_Usuario = $1;
  `;
  const values = [id];

  const result = await pool.query(query, values);

  // result.rows[0] contendrá el usuario si se encuentra
  // Si no, result.rows estará vacío y esto devolverá undefined (o null)
  return result.rows[0];
};
// ---------------------
// --- NUEVA FUNCIÓN ---
/**
 * Función para actualizar un usuario por su ID.
 * Permite actualizaciones parciales.
 * @param {number} id - El ID del usuario a actualizar.
 * @param {object} dataToUpdate - Objeto con los campos a actualizar (ej. { Rol: 'Admin', Contrasena: 'hash...' }).
 * @returns {object | null} El usuario actualizado (sin contraseña).
 */
UserModel.update = async (id, dataToUpdate) => {
  // 1. Obtenemos las claves (campos) del objeto
  // Ej: ['Nombre', 'Rol', 'Contrasena']
  const fields = Object.keys(dataToUpdate);

  // 2. Creamos la parte SET de la consulta dinámicamente
  // Ej: Nombre = $1, Rol = $2, Contrasena = $3
  // ¡Sin comillas en los campos para que Postgres no distinga mayúsculas/minúsculas!
  const setString = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');

  // Si no hay campos, no hacemos nada
  if (setString.length === 0) {
    return UserModel.findById(id);
  }

  // 3. Obtenemos los valores
  const values = Object.values(dataToUpdate);
  
  // 4. Añadimos el ID al final del array de valores para el WHERE
  const idIndex = values.length + 1;
  values.push(id);

  // 5. Construimos la consulta final
  // Devolvemos solo los campos seguros
  const query = `
    UPDATE Usuarios
    SET ${setString}
    WHERE Id_Usuario = $${idIndex}
    RETURNING Id_Usuario, Nombre, Apellido, Correo_Electronico, Rol;
  `;

  // 6. Ejecutamos la consulta
  const result = await pool.query(query, values);

  return result.rows[0];
};
// ---------------------
export default UserModel;