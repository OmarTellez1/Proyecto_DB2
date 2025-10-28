import UserModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';

const UserService = {};

/**
 * Valida, hashea contraseña y crea un usuario.
 * @param {object} userData - Datos del usuario (ej. { nombre: '...', contrasena: 'pass123' }).
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
    contrasena: hashedPassword, // Reemplazamos la contraseña con el hash
  };

  try {
    // 5. Llamamos al modelo
    const newUser = await UserModel.create(dataToSave);
    return newUser;
  } catch (error) {
    // 6. Manejo de errores de la BD (ej. cédula o correo duplicado)
    if (error.code === '23505') { // unique_violation
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

/**
 * Llama al modelo para obtener todos los usuarios ACTIVOS.
 */
UserService.getAllUsers = async () => {
  try {
    // El modelo (findAll) ahora solo devuelve usuarios con estado = true
    const users = await UserModel.findAll();
    return users;
  } catch (error) {
    throw error;
  }
};

/**
 * Llama al modelo para obtener un usuario por su ID.
 * @param {number} id - El ID del usuario.
 * @returns {object} El usuario encontrado (activo o inactivo).
 */
UserService.getUserById = async (id) => {
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }
    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Valida, hashea (si es necesario) y actualiza un usuario.
 * @param {number} id - El ID del usuario.
 * @param {object} updateData - Los datos a actualizar (ej. { nombre: '...', contrasena: 'pass123' }).
 * @returns {object} El usuario actualizado.
 */
UserService.updateUser = async (id, updateData) => {
  try {
    // 1. (Validación) Verificar si el usuario existe
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      throw new Error('Usuario no encontrado.');
    }

    // 2. (Seguridad) Manejo de la contraseña (clave 'contrasena' en minúscula)
    if (updateData.contrasena) {
      const hashedPassword = await bcrypt.hash(updateData.contrasena, 10);
      updateData.contrasena = hashedPassword;
    }

    // 3. (Validación de Rol)
    if (updateData.rol && (updateData.rol !== 'Admin' && updateData.rol !== 'Cliente')) {
      throw new Error("El rol debe ser 'Admin' o 'Cliente'.");
    }

    // 4. Llamar al modelo con los datos listos
    const updatedUser = await UserModel.update(id, updateData);
    return updatedUser;

  } catch (error) {
    // 5. Manejo de errores de duplicados (si actualizan cédula o correo)
    if (error.code === '23505') {
      if (error.constraint.includes('cedula')) {
        throw new Error('La cédula ingresada ya está registrada.');
      }
      if (error.constraint.includes('correo')) {
        throw new Error('El correo electrónico ingresado ya está registrado.');
      }
    }
    throw error; // Lanzamos otros errores (ej. "Usuario no encontrado")
  }
};


/**
 * Realiza un BORRADO LÓGICO (soft delete) del usuario.
 * @param {number} id - El ID del usuario a desactivar.
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
    // Llamamos a la función 'update' para establecer estado = false
    await UserModel.update(id, { estado: false });

  } catch (error) {
    // Ya NO necesitamos el catch para '23503' (FK violation)
    // porque 'UPDATE' no lo causará.
    throw error; 
  }
};

export default UserService;