import UserModel from '../models/user.model.js';
// ¡Adiós bcrypt! Ya no lo necesitamos aquí.

const UserService = {};

/* ------------------------------------------------------------------------------------------------ */
// Metodo #1
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
  
  // 3. (ELIMINADO) Ya no hasheamos aquí.
  // Pasamos los datos directos. El modelo se encarga de la seguridad.

  try {
    // 4. Llamamos al modelo (userData lleva la contraseña plana)
    const newUser = await UserModel.create(userData);
    return newUser;

  } catch (error) {
    // 5. Manejo de errores
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
UserService.getUserById = async (id) => {
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }
    return user;
  } catch (error) {
    if (error.name === 'CastError') {
       throw new Error('Usuario no encontrado.');
    }
    throw error;
  }
};
/* ------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------ */
// Metodo #4
UserService.updateUser = async (id, updateData) => {
  try {
    // 1. Verificar si el usuario existe
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      throw new Error('Usuario no encontrado.');
    }

    // 2. (ELIMINADO) Ya no hasheamos manualmente si viene contraseña.
    // El middleware 'pre findOneAndUpdate' en el modelo lo detectará automáticamente.

    // 3. Validación de Rol
    if (updateData.rol && (updateData.rol !== 'Admin' && updateData.rol !== 'Cliente')) {
      throw new Error("El rol debe ser 'Admin' o 'Cliente'.");
    }

    // 4. Llamar al modelo
    const updatedUser = await UserModel.update(id, updateData);
    return updatedUser;

  } catch (error) {
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
UserService.deleteUser = async (id) => {
  try {
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      throw new Error('Usuario no encontrado.');
    }

    if (existingUser.estado === false) {
      throw new Error('Este usuario ya ha sido desactivado.');
    }
    
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