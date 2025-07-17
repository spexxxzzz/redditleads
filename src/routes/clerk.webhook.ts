// src/routes/clerk.webhook.ts
import express from 'express';
import { handleClerkWebhook } from '../controllers/clerk.webhook.controller';

const clerkWebhookRouter = express.Router();

// Define the webhook endpoint
clerkWebhookRouter.post('/', express.raw({ type: 'application/json' }), handleClerkWebhook);

export default clerkWebhookRouter;