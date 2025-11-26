import UserModel from '../models/user.model.js'; // Reutilizamos el modelo
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js'; // Importamos el secreto

const AuthService = {};
/* ------------------------------------------------------------------------------------------------ */
//Metodo #1

/**
 * Lógica de inicio de sesión.
 * @param {string} cedula - Cédula del usuario.
 * @param {string} contrasena - Contraseña en texto plano.
 * @returns {object} { token, usuario }
 */

AuthService.login = async (cedula, contrasena) => {
  // 1. Buscar al usuario por su cédula
  const usuario = await UserModel.findByCedula(cedula);
  
  // 2. Validación: ¿Existe el usuario?
  if (!usuario) {
    throw new Error('Credenciales inválidas.'); // Error genérico por seguridad
  }

  // 3. Validación: ¿Está la cuenta activa?
  if (usuario.estado === false) {
    throw new Error('Esta cuenta ha sido desactivada.');
  }

  // 4. Validación: ¿Es la contraseña correcta?
  // Comparamos la contraseña enviada (contrasena) con la hasheada (usuario.contrasena)
  const esContrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
  
  if (!esContrasenaValida) {
    throw new Error('Credenciales inválidas.'); // Mismo error genérico
  }

  // 5. ¡Éxito! Generar el Token (JWT)
  // El "payload" es la información que guardamos dentro del token
  const payload = {
    id: usuario._id,
    rol: usuario.rol
  };

  const token = jwt.sign(
    payload,          // La información
    config.jwt.secret, // Nuestro secreto del .env
    { expiresIn: '8h' } // El token expira en 8 horas
  );

  // 6. Preparamos la respuesta (NO ENVIAR LA CONTRASEÑA)
  const usuarioRespuesta = {
    _id: usuario._id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.rol
  };
  
  return { token, usuario: usuarioRespuesta };
};
/* ------------------------------------------------------------------------------------------------ */
export default AuthService;