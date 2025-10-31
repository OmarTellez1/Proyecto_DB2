import UserService from '../services/user.service.js';

const UserController = {};
/* ------------------------------------------------------------------------------------------------ */
//Metodo #1
//Maneja la petición POST para crear un nuevo usuario.
UserController.create = async (req, res) => {
  try {
    // 1. Obtenemos los datos del cuerpo (body) de la petición
    const userData = req.body;

    // 2. Llamamos al servicio para crear el usuario
    const newUser = await UserService.createUser(userData);

    // 3. Respondemos con éxito (código 201 - Created)
    res.status(201).json(newUser);

  } catch (error) {
    // 4. Manejo de errores
    console.error('Error en UserController.create:', error.message);
    
    // Errores de validación (400 Bad Request)
    if (error.message.includes('obligatorios') || error.message.includes('Rol debe ser')) {
      res.status(400).json({ message: error.message });
    } 
    // Errores de duplicados (409 Conflict)
    else if (error.message.includes('ya está registrada')) {
      res.status(409).json({ message: error.message });
    } 
    // Otros errores (500)
    else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};
/* ------------------------------------------------------------------------------------------------ */
//Metodo #2
//Maneja la petición GET para obtener todos los usuarios.
UserController.getAll = async (req, res) => {
  try {
    // 1. Llamamos al servicio
    const users = await UserService.getAllUsers();

    // 2. Respondemos con éxito (200 OK) y la lista de usuarios
    res.status(200).json(users);

  } catch (error) {
    // 3. Manejo de errores
    console.error('Error en UserController.getAll:', error.message);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
/* ------------------------------------------------------------------------------------------------ */
//Metodo #3
//Maneja la petición GET para obtener un usuario por su ID.
UserController.getById = async (req, res) => {
  try {
    // 1. Obtenemos el ID de los parámetros de la URL (ej. /api/usuarios/16)
    const { id } = req.params;

    // 2. Llamamos al servicio
    const user = await UserService.getUserById(id);

    // 3. Respondemos con el usuario encontrado (200 OK)
    res.status(200).json(user);

  } catch (error) {
    // 4. Manejo de errores
    console.error('Error en UserController.getById:', error.message);

    // Si el error es "Usuario no encontrado" (del servicio), enviamos 404
    if (error.message.includes('Usuario no encontrado')) {
      res.status(404).json({ message: error.message });
    } else {
      // Otro error (ej. ID no es un número, error de BD)
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};
/* ------------------------------------------------------------------------------------------------ */
//Metodo #4
//Maneja la petición PUT para actualizar la información de los usuarios
UserController.update = async (req, res) => {
  try {
    // 1. Obtenemos el ID de los parámetros
    const { id } = req.params;
    // 2. Obtenemos los datos a actualizar del body
    const updateData = req.body;

    // 3. Llamamos al servicio
    const updatedUser = await UserService.updateUser(id, updateData);

    // 4. Respondemos con el usuario actualizado (200 OK)
    res.status(200).json(updatedUser);

  } catch (error) {
    // 5. Manejo de errores
    console.error('Error en UserController.update:', error.message);

    if (error.message.includes('Usuario no encontrado')) {
      res.status(404).json({ message: error.message });
    } else if (error.message.includes('ya está registrada')) { // Conflicto (409)
      res.status(409).json({ message: error.message });
    } else if (error.message.includes('El rol debe ser')) { // Petición mala (400)
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};
/* ------------------------------------------------------------------------------------------------ */
//Metodo #5
//Maneja la petición DELETE para "borrar lógicamente" (desactivar) un usuario.
UserController.remove = async (req, res) => {
  try {
    // 1. Obtenemos el ID de los parámetros
    const { id } = req.params;

    // 2. Llamamos al servicio (que ahora hace 'soft delete')
    await UserService.deleteUser(id);

    // 3. Respondemos con un mensaje más preciso
    res.status(200).json({ message: 'Usuario desactivado exitosamente.' });

  } catch (error) {
    // 4. Manejo de errores
    console.error('Error en UserController.remove:', error.message);

    if (error.message.includes('Usuario no encontrado')) {
      res.status(404).json({ message: error.message });
    } 
    // ¡NUEVO! Manejo del error de 'ya desactivado' (400 Bad Request)
    else if (error.message.includes('ya ha sido desactivado')) {
      res.status(400).json({ message: error.message });
    } 
    else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};
/* ------------------------------------------------------------------------------------------------ */
export default UserController;