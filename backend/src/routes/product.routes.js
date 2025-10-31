import { Router } from 'express';
import ProductController from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
const router = Router();

// GET /api/productos/
router.get('/', ProductController.getAll);

// POST /api/productos/
router.post('/', authMiddleware,ProductController.create);

// GET /api/productos/:id
router.get('/:id', ProductController.getById);

// PUT /api/productos/:id
router.put('/:id', authMiddleware,ProductController.update);

// --- NUEVA RUTA ---
// DELETE /api/productos/:id
router.delete('/:id', authMiddleware,ProductController.remove);
// -----------------

export default router;