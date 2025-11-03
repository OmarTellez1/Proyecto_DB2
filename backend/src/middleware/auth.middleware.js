// En: backend/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Middleware para verificar el Token JWT.
 * Si el token es válido, añade los datos del usuario (payload) a 'req.user'.
 * Si no, bloquea la petición.
 */
export const authMiddleware = (req, res, next) => {
  try {
    // 1. Obtener el token del header
    const authHeader = req.headers['authorization'];
    // Formato esperado: "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Si no hay token, bloquear
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    // 3. Verificar el token
    // jwt.verify() descifra el token usando nuestro secreto
    const payload = jwt.verify(token, config.jwt.secret);

    // 4. ¡Éxito! Añadimos el payload (ej. { id: 16, rol: 'Admin' }) a la petición
    req.user = payload;
    
    // 5. Continuar al siguiente paso (el controlador)
    next();

  } catch (error) {
    // Si el token es inválido o expiró
    res.status(401).json({ message: 'Token inválido.' });
  }
};