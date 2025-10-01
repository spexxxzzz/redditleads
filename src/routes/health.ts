// src/routes/health.ts

import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router = Router();

// Health check endpoints
router.get('/', healthController.basic);
router.get('/detailed', healthController.detailed);
router.get('/ready', healthController.readiness);
router.get('/live', healthController.liveness);

export default router;
