import UserModel from '../models/user.model.js';
import bcrypt from 'bcryptjs'; // Importamos bcrypt

const UserService = {};

/**
 * Valida, hashea la contraseña y llama al modelo para crear un usuario.
 * @param {object} userData - Datos del usuario desde el controlador.
 * @returns {object} El usuario creado.
 */
UserService.createUser = async (userData) => {
  const { 
    nombre, 
    apellido, 
    cedula, 
    correo_electronico, 
    rol, 
    contrasena 
  } = userData;

  // 1. Validación de entrada (Ejemplo)
  if (!nombre || !apellido || !cedula || !correo_electronico || !rol || !contrasena) {
    throw new Error('Todos los campos, incluida la contraseña, son obligatorios.');
  }
  
  // 2. Validación de Rol (basado en tu ENUM)
  if (rol !== 'Admin' && rol !== 'Cliente') {
    throw new Error("El rol debe ser 'Admin' o 'Cliente'.");
  }
  
  // 3. Hashear la contraseña
  // El "salt" (10) es el costo computacional. 10 es un buen estándar.
  const hashedPassword = await bcrypt.hash(contrasena, 10);

  // 4. Preparamos los datos para el modelo
  const dataToSave = {
    ...userData,
    hashedPassword, // Sobrescribimos/Añadimos la contraseña hasheada
  };

  try {
    // 5. Llamamos al modelo
    const newUser = await UserModel.create(dataToSave);
    return newUser;
  } catch (error) {
    // Manejo de errores de la BD (ej. cédula o correo duplicado)
    if (error.code === '23505') { // Código de PostgreSQL para 'unique_violation'
      if (error.constraint.includes('cedula')) {
        throw new Error('La cédula ingresada ya está registrada.');
      }
      if (error.constraint.includes('correo')) {
        throw new Error('El correo electrónico ingresado ya está registrado.');
      }
    }
    throw error; // Lanzamos otros errores
  }
};
// --- NUEVA FUNCIÓN ---
/**
 * Llama al modelo para obtener todos los usuarios.
 */
UserService.getAllUsers = async () => {
  try {
    const users = await UserModel.findAll();
    return users;
  } catch (error) {
    // Manejamos cualquier error que ocurra en el modelo
    throw error;
  }
};
// ---------------------

export default UserService;