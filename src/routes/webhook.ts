import { Router } from 'express';
import {
  createWebhook,
  getWebhooks,
  getWebhookStats,
  updateWebhook,
  deleteWebhook,
  testWebhook
} from '../controllers/webhook.controller';
import { gateKeeper } from '../middleware/gateKeeper';

const webhookRouter = Router();

// All webhook routes are protected as a premium feature.

// Create a new webhook for the authenticated user
webhookRouter.post('/', gateKeeper, createWebhook);

// Get all webhooks for the authenticated user
webhookRouter.get('/', gateKeeper, getWebhooks);

// Get webhook stats for the authenticated user
webhookRouter.get('/stats', gateKeeper, getWebhookStats);

// Update a specific webhook owned by the authenticated user
webhookRouter.put('/:webhookId', gateKeeper, updateWebhook);

// Delete a specific webhook owned by the authenticated user
webhookRouter.delete('/:webhookId', gateKeeper, deleteWebhook);

// Test a specific webhook owned by the authenticated user
webhookRouter.post('/:webhookId/test', gateKeeper, testWebhook);

export default webhookRouter;