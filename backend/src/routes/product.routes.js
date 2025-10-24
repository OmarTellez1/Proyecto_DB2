import { Router } from 'express';
import ProductController from '../controllers/product.controller.js';

const router = Router();

// GET /api/productos/
router.get('/', ProductController.getAll);

// POST /api/productos/
router.post('/', ProductController.create);

// GET /api/productos/:id
router.get('/:id', ProductController.getById);

// PUT /api/productos/:id
router.put('/:id', ProductController.update);

// --- NUEVA RUTA ---
// DELETE /api/productos/:id
router.delete('/:id', ProductController.remove);
// -----------------

export default router;