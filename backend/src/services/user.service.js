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
// --- NUEVA FUNCIÓN ---
/**
 * Llama al modelo para obtener un usuario por su ID.
 * @param {number} id - El ID del usuario.
 * @returns {object} El usuario encontrado.
 */
UserService.getUserById = async (id) => {
  try {
    const user = await UserModel.findById(id);

    // Lógica de negocio: ¿Qué pasa si el ID no existe?
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    return user;
  } catch (error) {
    throw error;
  }
};
// --- FUNCIÓN MODIFICADA ---
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

    // 2. (Seguridad) Manejo de la contraseña
    // Verificamos si el objeto 'updateData' trae el campo 'contrasena' (¡minúscula!)
    if (updateData.contrasena) {
      
      // Si trae contraseña, la hasheamos
      const hashedPassword = await bcrypt.hash(updateData.contrasena, 10);
      
      // ¡IMPORTANTE! Reemplazamos/Añadimos la contraseña hasheada
      // Y usamos el nombre de la columna de la BD (Postgres la pondrá en minúscula)
      updateData.Contrasena = hashedPassword;
      
      // Borramos la de texto plano para que el modelo no la procese
      delete updateData.contrasena; 
    }

    // 3. (Validación de Rol)
    // Asumimos que el JSON viene en minúscula, pero la BD espera mayúscula
    if (updateData.rol) {
        if (updateData.rol !== 'Admin' && updateData.rol !== 'Cliente') {
            throw new Error("El rol debe ser 'Admin' o 'Cliente'.");
        }
        updateData.Rol = updateData.rol; // Mapeamos al nombre de la columna
        delete updateData.rol;
    }

    // ... (Mapear otros campos si es necesario, ej. Nombre, Apellido) ...
    // Esto es necesario si el JSON siempre viene en minúscula pero la BD
    // (o el modelo) espera mayúsculas.
    
    // 4. Llamar al modelo con los datos listos
    const updatedUser = await UserModel.update(id, updateData);
    
    if (!updatedUser) {
      throw new Error('No se pudo actualizar el usuario.');
    }
    
    return updatedUser;

  } catch (error) {
    // 5. Manejo de errores de duplicados (si actualizan cédula o correo)
    // ... (código existente) ...
    // ... (El manejo de errores 23505 sigue igual) ...
    throw error;
  }
};
// ---------------------
export default UserService;