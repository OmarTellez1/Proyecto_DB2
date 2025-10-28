// En: backend/src/routes/factura.routes.js
import { Router } from 'express';
import FacturaController from '../controllers/factura.controller.js';
// ¡Importamos nuestro "guardia"!
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// POST /api/facturas/
// 1. Primero, el guardia (authMiddleware) verifica el token.
// 2. Si es válido, pasa al controlador (FacturaController.create).
router.post('/', authMiddleware, FacturaController.create);

// --- NUEVA RUTA ---
// GET /api/facturas/:id (Ruta para que el Admin consulte)
// También la protegemos con el authMiddleware
router.get('/:id', authMiddleware, FacturaController.getById);

export default router;