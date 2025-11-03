import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/login
router.post('/login', AuthController.login);

// (En el futuro, aquí podríamos poner /register para clientes)

export default router;