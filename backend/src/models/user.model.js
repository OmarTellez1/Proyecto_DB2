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
export default UserModel;