import mongoose from 'mongoose';

// 1. Definimos el Esquema (Schema)
// Esto define la estructura que antes tenías en CREATE TABLE
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  celular: { type: String },
  correo_electronico: { type: String, required: true, unique: true },
  rol: { type: String, enum: ['Cliente', 'Admin'], required: true },
  contrasena: { type: String, required: true },
  estado: { type: Boolean, default: true }
}, {
  versionKey: false // Elimina el campo interno __v de Mongo
});

// 2. Creamos el Modelo
const User = mongoose.model('User', userSchema);

const UserModel = {};

/* ------------------------------------------------------------------------------------------------ */
// Metodo #1
// Función para insertar un nuevo usuario en la base de datos.

/**
 * @param {object} userData - Datos del usuario (con contraseña hasheada).
 * @returns {object} El usuario recién creado.
 */
UserModel.create = async (userData) => {
  const newUser = new User(userData);
  const savedUser = await newUser.save();
  
  // Convertimos a objeto y borramos la contraseña antes de devolverlo (Seguridad)
  const result = savedUser.toObject();
  delete result.contrasena;
  return result;
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #2
// Función para obtener TODOS los usuarios ACTIVOS.

/**
 * @returns {Array} Lista de usuarios activos.
 */
UserModel.findAll = async () => {
  // .select('-contrasena') es igual a NO seleccionar esa columna en SQL
  return await User.find({ estado: true }).select('-contrasena');
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #3
// Función para buscar un usuario por su ID (esté activo o no).

/**
 * @param {string} id - El ID del usuario (Ahora es un string de Mongo, no un number).
 * @returns {object | null} El usuario encontrado o null si no existe.
 */
UserModel.findById = async (id) => {
  // Buscamos por ID y excluimos la contraseña
  return await User.findById(id).select('-contrasena');
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #4
// Función para actualizar un usuario por su ID (actualización dinámica).

/**
 * @param {string} id - El ID del usuario a actualizar.
 * @param {object} dataToUpdate - Objeto con los campos a actualizar.
 * @returns {object | null} El usuario actualizado (sin contraseña).
 */
UserModel.update = async (id, dataToUpdate) => {
  // { new: true } devuelve el documento actualizado
  return await User.findByIdAndUpdate(id, dataToUpdate, { new: true }).select('-contrasena');
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #5
/**
 * Busca un usuario por su cédula.
 * ¡Esta es la única función que DEBE seleccionar la contraseña y el estado!
 * @param {string} cedula - La cédula del usuario.
 * @returns {object | null} El usuario completo (incluyendo hash de contraseña).
 */
UserModel.findByCedula = async (cedula) => {
  // Aquí NO excluimos la contraseña porque Auth la necesita
  return await User.findOne({ cedula: cedula });
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #6
// Busca los detalles de un usuario por su ID para el correo de facturación.

/**
 * @param {string} id - El ID del usuario.
 * @returns {object} { nombre, apellido, cedula, celular, correo_electronico }
 */
UserModel.findDetailsForEmail = async (id) => {
  // Seleccionamos solo los campos específicos, igual que en tu SQL
  return await User.findById(id).select('nombre apellido cedula celular correo_electronico');
};
/* ------------------------------------------------------------------------------------------------ */

export default UserModel;