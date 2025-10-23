import { Router } from 'express';
import ProductController from '../controllers/product.controller.js';

const router = Router();

// GET /api/productos/
router.get('/', ProductController.getAll);

// POST /api/productos/
router.post('/', ProductController.create);

// --- NUEVA RUTA ---
// GET /api/productos/:id  (ej. /api/productos/10)
// :id es un parámetro de ruta
router.get('/:id', ProductController.getById);
// -----------------

// router.put('/:id', ...);
// router.delete('/:id', ...);

export default router;