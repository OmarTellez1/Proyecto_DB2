import UserModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';

const UserService = {};

/* ------------------------------------------------------------------------------------------------ */
// Metodo #1

/**
 * Valida, hashea contraseña y crea un usuario.
 * @param {object} userData - Datos del usuario.
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

  // 1. Validación de entrada
  if (!nombre || !apellido || !cedula || !correo_electronico || !rol || !contrasena) {
    throw new Error('Todos los campos, incluida la contraseña, son obligatorios.');
  }
  
  // 2. Validación de Rol
  if (rol !== 'Admin' && rol !== 'Cliente') {
    throw new Error("El rol debe ser 'Admin' o 'Cliente'.");
  }
  
  // 3. Hashear la contraseña
  const hashedPassword = await bcrypt.hash(contrasena, 10);

  // 4. Preparamos los datos para el modelo
  const dataToSave = {
    ...userData,
    contrasena: hashedPassword,
  };

  try {
    // 5. Llamamos al modelo
    const newUser = await UserModel.create(dataToSave);
    return newUser;

  } catch (error) {
    // 6. Manejo de errores de Mongoose (Duplicate Key)
    if (error.code === 11000) { 
      if (error.keyPattern.cedula) {
        throw new Error('La cédula ingresada ya está registrada.');
      }
      if (error.keyPattern.correo_electronico) {
        throw new Error('El correo electrónico ingresado ya está registrado.');
      }
    }
    throw error;
  }
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #2
// Llama al modelo para obtener todos los usuarios ACTIVOS.

UserService.getAllUsers = async () => {
  try {
    const users = await UserModel.findAll();
    return users;
  } catch (error) {
    throw error;
  }
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #3

/**
 * Llama al modelo para obtener un usuario por su ID.
 * @param {string} id - El ID del usuario (String ObjectId).
 * @returns {object} El usuario encontrado.
 */
UserService.getUserById = async (id) => {
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }
    return user;
  } catch (error) {
    // Si el ID no es un ObjectId válido de Mongo
    if (error.name === 'CastError') {
       throw new Error('Usuario no encontrado.');
    }
    throw error;
  }
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #4

/**
 * Valida, hashea (si es necesario) y actualiza un usuario.
 * @param {string} id - El ID del usuario.
 * @param {object} updateData - Los datos a actualizar.
 * @returns {object} El usuario actualizado.
 */
UserService.updateUser = async (id, updateData) => {
  try {
    // 1. (Validación) Verificar si el usuario existe
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      throw new Error('Usuario no encontrado.');
    }

    // 2. (Seguridad) Manejo de la contraseña
    if (updateData.contrasena) {
      const hashedPassword = await bcrypt.hash(updateData.contrasena, 10);
      updateData.contrasena = hashedPassword;
    }

    // 3. (Validación de Rol)
    if (updateData.rol && (updateData.rol !== 'Admin' && updateData.rol !== 'Cliente')) {
      throw new Error("El rol debe ser 'Admin' o 'Cliente'.");
    }

    // 4. Llamar al modelo
    const updatedUser = await UserModel.update(id, updateData);
    return updatedUser;

  } catch (error) {
    // 5. Manejo de errores de duplicados (Mongoose)
    if (error.code === 11000) {
      if (error.keyPattern.cedula) {
        throw new Error('La cédula ingresada ya está registrada.');
      }
      if (error.keyPattern.correo_electronico) {
        throw new Error('El correo electrónico ingresado ya está registrado.');
      }
    }
    if (error.name === 'CastError') {
       throw new Error('Usuario no encontrado.');
    }
    throw error;
  }
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #5

/**
 * Realiza un BORRADO LÓGICO (soft delete) del usuario.
 * @param {string} id - El ID del usuario a desactivar.
 */
UserService.deleteUser = async (id) => {
  try {
    // 1. (Validación) Verificar si el usuario existe
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      throw new Error('Usuario no encontrado.');
    }

    // 2. (Lógica) Verificar si ya está desactivado
    if (existingUser.estado === false) {
      throw new Error('Este usuario ya ha sido desactivado.');
    }
    
    // 3. ¡La lógica de Soft Delete!
    await UserModel.update(id, { estado: false });

  } catch (error) {
    if (error.name === 'CastError') {
       throw new Error('Usuario no encontrado.');
    }
    throw error; 
  }
};
/* ------------------------------------------------------------------------------------------------ */

export default UserService;