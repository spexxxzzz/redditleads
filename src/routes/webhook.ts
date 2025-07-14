import { Router } from 'express';
import { 
  createWebhook, 
  getWebhooks, 
  getWebhookStats,
  updateWebhook, 
  deleteWebhook, 
  testWebhook 
} from '../controllers/webhook.controller';

const webhookRouter = Router();

webhookRouter.post('/user/:userId', createWebhook);
webhookRouter.get('/user/:userId', getWebhooks);
webhookRouter.get('/user/:userId/stats', getWebhookStats);
webhookRouter.put('/:webhookId', updateWebhook);
webhookRouter.delete('/:webhookId', deleteWebhook);
webhookRouter.post('/:webhookId/test', testWebhook);

export default webhookRouter;