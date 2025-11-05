import { Router } from 'express';
import UserController from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = Router();

// POST /api/usuarios/
router.post('/',authMiddleware, UserController.create);

// GET /api/usuarios/
router.get('/', authMiddleware,UserController.getAll);

// GET /api/usuarios/:id
router.get('/:id', authMiddleware,UserController.getById);

// --- NUEVA RUTA ---
// PUT /api/usuarios/:id
router.put('/:id',authMiddleware,UserController.update);
// -----------------


// --- RUTA DELETE (ACTUALIZADA/AÑADIDA) ---
// DELETE /api/usuarios/:id
// Esto conecta la URL con la función del controlador
router.delete('/:id', authMiddleware,UserController.remove);
// -----------------

export default router;