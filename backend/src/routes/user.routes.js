import { Router } from 'express';
import UserController from '../controllers/user.controller.js';

const router = Router();

// POST /api/usuarios/
router.post('/', UserController.create);

// --- NUEVA RUTA ---
// GET /api/usuarios/
router.get('/', UserController.getAll);
// -----------------

// (Aquí añadiremos GET /:id, PUT, DELETE luego)

export default router;