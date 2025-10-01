import { Request, Response } from 'express';
import { dodoPaymentsService } from '../services/dodo-payments.service';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export class PaymentController {
  /**
   * Get all available subscription plans
   */
  async getPlans(req: Request, res: Response) {
    try {
      const plans = dodoPaymentsService.getPlans();
      res.json({
        success: true,
        data: plans
      });
    } catch (error: any) {
      console.error('Error getting plans:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscription plans'
      });
    }
  }

  /**
   * Create a new subscription checkout session
   */
  async createSubscription(req: AuthenticatedRequest, res: Response) {
    try {
      const { planId, customerEmail, customerName, userId } = req.body;
      const authenticatedUserId = req.user?.id || userId;

      if (!authenticatedUserId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      if (!planId || !customerEmail || !customerName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: planId, customerEmail, customerName'
        });
      }

      const successUrl = `${process.env.FRONTEND_URL}/dashboard?subscription=success`;
      const cancelUrl = `${process.env.FRONTEND_URL}/pricing?subscription=cancelled`;

      const result = await dodoPaymentsService.createSubscription({
        userId: authenticatedUserId,
        planId,
        customerEmail,
        customerName,
        successUrl,
        cancelUrl
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create subscription'
      });
    }
  }

  /**
   * Handle Dodo Payments webhook
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['dodo-signature'] as string;
      const payload = JSON.stringify(req.body);

      // Verify webhook signature
      if (!dodoPaymentsService.verifyWebhookSignature(payload, signature)) {
        return res.status(401).json({
          success: false,
          error: 'Invalid webhook signature'
        });
      }

      const { event, data } = req.body;

      switch (event) {
        case 'payment.succeeded':
          await dodoPaymentsService.handlePaymentSuccess(data);
          break;
        case 'payment.failed':
          await dodoPaymentsService.handlePaymentFailed(data);
          break;
        case 'subscription.cancelled':
          await dodoPaymentsService.handleSubscriptionCancelled(data);
          break;
        case 'subscription.updated':
          await dodoPaymentsService.handleSubscriptionUpdated(data);
          break;
        default:
          console.log('Unhandled webhook event:', event);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error('Error handling webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Webhook processing failed'
      });
    }
  }

  /**
   * Get user's current subscription status
   */
  async getSubscriptionStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const userPlan = await dodoPaymentsService.getUserPlan(userId);
      
      if (!userPlan) {
        return res.json({
          success: true,
          data: {
            plan: null,
            status: 'inactive'
          }
        });
      }

      res.json({
        success: true,
        data: {
          plan: userPlan.id, // Return just the plan ID, not the full object
          status: 'active'
        }
      });
    } catch (error: any) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscription status'
      });
    }
  }

  /**
   * Check if user can perform a specific action based on plan limits
   */
  async checkPlanLimits(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { feature } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const canPerform = await dodoPaymentsService.checkPlanLimits(userId, feature as any);

      res.json({
        success: true,
        data: {
          canPerform,
          feature
        }
      });
    } catch (error: any) {
      console.error('Error checking plan limits:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check plan limits'
      });
    }
  }
}
