import { Router } from 'express';
// Importamos el controlador
import ProductController from '../controllers/product.controller.js';

const router = Router();

// Definimos la ruta GET /
// Cuando alguien visite GET /api/productos/, se ejecutará ProductController.getAll
router.get('/', ProductController.getAll);

// Aquí añadiremos luego POST, PUT, DELETE
// router.post('/', ...);
// router.get('/:id', ...);
// router.put('/:id', ...);
// router.delete('/:id', ...);

export default router;