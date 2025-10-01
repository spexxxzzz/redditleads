// src/routes/clerk.webhook.ts
import express from 'express';
import { handleClerkWebhook } from '../controllers/clerk.webhook.controller';

const clerkWebhookRouter = express.Router();

// Define the webhook endpoint
clerkWebhookRouter.post('/', express.raw({ type: 'application/json' }), handleClerkWebhook);

// Add a GET handler for webhook validation
clerkWebhookRouter.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok'
  });
});

export default clerkWebhookRouter;