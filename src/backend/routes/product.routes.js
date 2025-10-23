import { Router } from 'express';
import ProductController from '../controllers/product.controller.js';

const router = Router();

// GET /api/productos/
router.get('/', ProductController.getAll);

// --- NUEVA RUTA ---
// POST /api/productos/
router.post('/', ProductController.create);
// -----------------

// router.get('/:id', ...);
// router.put('/:id', ...);
// router.delete('/:id', ...);

export default router;