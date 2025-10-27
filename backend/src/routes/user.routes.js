import { Router } from 'express';
import UserController from '../controllers/user.controller.js';

const router = Router();

// POST /api/usuarios/
router.post('/', UserController.create);

// GET /api/usuarios/
router.get('/', UserController.getAll);

// GET /api/usuarios/:id
router.get('/:id', UserController.getById);

// --- NUEVA RUTA ---
// PUT /api/usuarios/:id
router.put('/:id', UserController.update);
// -----------------

// (Aquí añadiremos DELETE luego)

export default router;