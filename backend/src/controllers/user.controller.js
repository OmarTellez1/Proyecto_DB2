import UserService from '../services/user.service.js';

const UserController = {};

/**
 * Maneja la petición POST para crear un nuevo usuario.
 */
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
// --- NUEVA FUNCIÓN ---
/**
 * Maneja la petición GET para obtener todos los usuarios.
 */
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
// ---------------------
export default UserController;