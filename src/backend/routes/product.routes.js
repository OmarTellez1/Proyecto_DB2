import { Router } from 'express';
import ProductController from '../controllers/product.controller.js';

const router = Router();

// GET /api/productos/
router.get('/', ProductController.getAll);

// POST /api/productos/
router.post('/', ProductController.create);

// GET /api/productos/:id
router.get('/:id', ProductController.getById);

// --- NUEVA RUTA ---
// PUT /api/productos/:id
router.put('/:id', ProductController.update);
// -----------------

// router.delete('/:id', ...);

export default router;