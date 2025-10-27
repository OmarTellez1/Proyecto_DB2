import { Router } from 'express';
import UserController from '../controllers/user.controller.js';

const router = Router();

// POST /api/usuarios/
router.post('/', UserController.create);

// GET /api/usuarios/
router.get('/', UserController.getAll);

// --- NUEVA RUTA ---
// GET /api/usuarios/:id  (ej. /api/usuarios/16)
// :id es un parámetro de ruta
router.get('/:id', UserController.getById);
// -----------------

// (Aquí añadiremos PUT, DELETE luego)

export default router;