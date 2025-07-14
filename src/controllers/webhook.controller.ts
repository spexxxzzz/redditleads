import { Request, Response } from 'express';
import { webhookService } from '../services/webhook.service';

export const createWebhook = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const webhookData = req.body;
    
    const webhookId = await webhookService.registerWebhook({
      ...webhookData,
      userId
    });
    
    res.json({ success: true, webhookId });
  } catch (error) {
    console.error('Failed to create webhook:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
};

export const getWebhooks = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const webhooks = webhookService.getWebhooks(userId);
    res.json({ webhooks });
  } catch (error) {
    console.error('Failed to get webhooks:', error);
    res.status(500).json({ error: 'Failed to get webhooks' });
  }
};

export const getWebhookStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const stats = await webhookService.getWebhookStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Failed to get webhook stats:', error);
    res.status(500).json({ error: 'Failed to get webhook stats' });
  }
};

export const updateWebhook = async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;
    const updates = req.body;
    
    const success = await webhookService.updateWebhook(webhookId, updates);
    res.json({ success });
  } catch (error) {
    console.error('Failed to update webhook:', error);
    res.status(500).json({ error: 'Failed to update webhook' });
  }
};

export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;
    const success = await webhookService.deleteWebhook(webhookId);
    res.json({ success });
  } catch (error) {
    console.error('Failed to delete webhook:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
};

export const testWebhook = async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;
    const success = await webhookService.testWebhook(webhookId);
    res.json({ success });
  } catch (error) {
    console.error('Failed to test webhook:', error);
    res.status(500).json({ error: 'Failed to test webhook' });
  }
};