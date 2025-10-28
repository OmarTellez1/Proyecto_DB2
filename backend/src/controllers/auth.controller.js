import AuthService from '../services/auth.service.js';

const AuthController = {};

/**
 * Maneja la petición POST para el login.
 */
AuthController.login = async (req, res) => {
  try {
    // 1. Obtenemos cédula y contraseña del body (minúsculas)
    const { cedula, contrasena } = req.body;

    // 2. Validamos que lleguen
    if (!cedula || !contrasena) {
      return res.status(400).json({ message: 'La cédula y la contraseña son obligatorias.' });
    }

    // 3. Llamamos al servicio
    const { token, usuario } = await AuthService.login(cedula, contrasena);
    
    // 4. Respondemos con el token y el usuario
    res.status(200).json({ token, usuario });

  } catch (error) {
    // 5. Manejo de errores
    console.error('Error en AuthController.login:', error.message);

    // Errores de "Credenciales inválidas" o "Cuenta desactivada" (401 Unauthorized)
    if (error.message.includes('Credenciales') || error.message.includes('desactivada')) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};

export default AuthController;