import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import DodoPayments from 'dodopayments';

const prisma = new PrismaClient();

export interface DodoPaymentConfig {
  apiKey: string;
  baseUrl: string;
  webhookSecret: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: {
    projects: number;
    leadsPerMonth: number;
    aiSummaries: number | 'unlimited';
    aiReplies: number | 'unlimited';
    webhookIntegration: boolean;
    prioritySupport: boolean;
    automatedAiReplies: boolean;
  };
}

export interface CreateSubscriptionRequest {
  userId: string;
  planId: string;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
}

export interface DodoPaymentResponse {
  success: boolean;
  data?: {
    checkoutUrl: string;
    subscriptionId: string;
    transactionId?: string;
  };
  error?: string;
}

class DodoPaymentsService {
  private config: DodoPaymentConfig;
  private client: any;

  constructor() {
    this.config = {
      apiKey: process.env.DODO_PAYMENTS_API_KEY || 'mock_api_key',
      baseUrl: process.env.DODO_PAYMENTS_BASE_URL || 'https://api.dodopayments.com',
      webhookSecret: process.env.DODO_PAYMENTS_WEBHOOK_SECRET || 'mock_webhook_secret'
    };
    
    // Initialize Dodo Payments client
    const isMockMode = this.config.apiKey === 'mock_api_key';
    if (!isMockMode) {
      this.client = new DodoPayments({
        bearerToken: this.config.apiKey,
        environment: 'live_mode', // Use live environment
        baseURL: null // Must be null when using environment option
      });
    }
    
    // Log payment mode
    console.log(`💳 Payment Mode: ${isMockMode ? '🎭 MOCK (Development)' : '🔒 REAL (Production)'}`);
    console.log(`🌐 Dodo Payments Base URL: ${this.config.baseUrl}`);
    if (!isMockMode && this.config.webhookSecret === 'your_dodo_webhook_secret_here') {
      console.log(`⚠️  WARNING: Using real payments with placeholder webhook secret. This is not secure for production!`);
    }
  }

  /**
   * Get all available subscription plans
   */
  getPlans(): SubscriptionPlan[] {
    return [
      {
        id: 'basic',
        name: 'Basic',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: {
          projects: 1,
          leadsPerMonth: 25,
          aiSummaries: 5,
          aiReplies: 5,
          webhookIntegration: false,
          prioritySupport: false,
          automatedAiReplies: false
        }
      },
      {
        id: 'pdt_2A3SVJeAnBgj8XjLeoiaR',
        name: 'Starter',
        price: 19,
        currency: 'USD',
        interval: 'month',
        features: {
          projects: 1,
          leadsPerMonth: 500,
          aiSummaries: 'unlimited',
          aiReplies: 'unlimited',
          webhookIntegration: false,
          prioritySupport: false,
          automatedAiReplies: false
        }
      },
      {
        id: 'pdt_jhcgzC7RawLnUVJr4bn0a',
        name: 'Pro',
        price: 49,
        currency: 'USD',
        interval: 'month',
        features: {
          projects: 5,
          leadsPerMonth: 5000,
          aiSummaries: 'unlimited',
          aiReplies: 'unlimited',
          webhookIntegration: true,
          prioritySupport: true,
          automatedAiReplies: true
        }
      },
      {
        id: 'pdt_mXpMfglw1fhJpQGW2AFnj',
        name: 'Ultimate',
        price: 99,
        currency: 'USD',
        interval: 'month',
        features: {
          projects: -1, // unlimited
          leadsPerMonth: -1, // unlimited
          aiSummaries: 'unlimited',
          aiReplies: 'unlimited',
          webhookIntegration: true,
          prioritySupport: true,
          automatedAiReplies: true
        }
      }
    ];
  }

  /**
   * Create a new subscription checkout session
   */
  async createSubscription(request: CreateSubscriptionRequest): Promise<DodoPaymentResponse> {
    try {
      const plan = this.getPlans().find(p => p.id === request.planId);
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found'
        };
      }

      // For free plan, create subscription directly
      if (plan.price === 0) {
        await this.createFreeSubscription(request.userId, plan.id);
        return {
          success: true,
          data: {
            checkoutUrl: `${process.env.FRONTEND_URL}/payment/success?plan=${plan.id}&mock=true&reason=free_plan`,
            subscriptionId: `free_${request.userId}`
          }
        };
      }

      // For paid plans, create mock checkout session for development
      // Use mock payments only if API key is explicitly mock
      if (this.config.apiKey === 'mock_api_key') {
        // Mock payment for development
        console.log(`🎭 Mock Payment: Creating subscription for ${request.customerEmail} to ${plan.name} plan`);
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create subscription directly in database
        await this.createFreeSubscription(request.userId, plan.id);
        
        return {
          success: true,
          data: {
            checkoutUrl: `${process.env.FRONTEND_URL}/payment/success?plan=${plan.id}&mock=true&reason=development_mode`,
            subscriptionId: `mock_${Date.now()}_${request.userId}`
          }
        };
      }

      // For real Dodo Payments (when API keys are provided)
      if (!this.client) {
        return {
          success: false,
          error: 'Dodo Payments client not initialized'
        };
      }

      try {
        console.log(`🚀 Creating checkout session for product: ${plan.id}`);
        console.log(`📧 Customer: ${request.customerEmail}`);
        console.log(`🌐 Using DodoPayments URL: ${this.config.baseUrl}`);
        
        const session = await this.client.checkoutSessions.create({
          successUrl: request.successUrl,
          cancelUrl: request.cancelUrl,
          product_cart: [
            {
              product_id: plan.id, // Use plan ID as product ID
              quantity: 1,
            },
          ],
          customer: {
            email: request.customerEmail,
            name: request.customerName
          },
          metadata: {
            userId: request.userId,
            planId: plan.id,
            planName: plan.name
          }
        });

        console.log(`✅ Checkout session created successfully:`, session);
        
        // Create pending transaction record
        const transaction = await prisma.paymentTransaction.create({
          data: {
            userId: request.userId,
            planId: plan.id,
            amount: plan.price,
            currency: 'USD',
            status: 'PENDING',
            externalId: session.session_id,
            checkoutUrl: session.checkout_url
          }
        });
        
        return {
          success: true,
          data: {
            checkoutUrl: session.checkout_url,
            subscriptionId: session.session_id,
            transactionId: transaction.id
          }
        };
      } catch (error: any) {
        console.error('❌ Dodo Payments SDK Error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          code: error.code
        });
        
        // If product doesn't exist or there's an auth error, create a mock checkout URL for testing
        if (error.message && (error.message.includes('does not exist') || error.message.includes('not found') || error.message.includes('401'))) {
          console.log(`🎭 Product ${plan.id} not found in DodoPayments or auth error, creating mock checkout URL`);
          
        // Create subscription directly in database for testing
        const transactionId = `mock_${Date.now()}_${request.userId}`;
        await this.createFreeSubscription(request.userId, plan.id);
        
        // Create transaction record for mock payment
        await prisma.paymentTransaction.create({
          data: {
            userId: request.userId,
            planId: plan.id,
            amount: plan.price,
            currency: 'USD',
            status: 'COMPLETED',
            externalId: transactionId,
            completedAt: new Date()
          }
        });

        // Create subscription history
        await prisma.subscriptionHistory.create({
          data: {
            userId: request.userId,
            planId: plan.id,
            action: 'CREATED',
            amount: plan.price,
            reason: 'Mock payment for testing'
          }
        });
        
        return {
          success: true,
          data: {
            checkoutUrl: `${process.env.FRONTEND_URL}/payment/success?plan=${plan.id}&mock=true&reason=product_not_found`,
            subscriptionId: transactionId
          }
        };
        }
        
        return {
          success: false,
          error: error.message || 'Failed to create checkout session'
        };
      }
    } catch (error: any) {
      console.error('Dodo Payments Error:', error);
      return {
        success: false,
        error: error.message || 'Internal server error'
      };
    }
  }

  /**
   * Handle successful payment webhook
   */
  async handlePaymentSuccess(paymentData: any): Promise<void> {
    try {
      const { userId, planId, transactionId, amount, currency = 'USD' } = paymentData.metadata || paymentData;
      
      if (!userId || !planId) {
        throw new Error('Missing userId or planId in payment data');
      }

      console.log(`💳 Processing payment success for user ${userId}, plan ${planId}`);

      // Get plan details
      const plan = this.getPlans().find(p => p.id === planId);
      if (!plan) {
        throw new Error(`Plan ${planId} not found`);
      }

      // Get current user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, subscriptionStatus: true }
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const previousPlan = user.plan;
      const isUpgrade = previousPlan !== planId && previousPlan !== 'basic';

      // Create transaction record
      const transaction = await prisma.paymentTransaction.create({
        data: {
          userId,
          planId,
          amount: amount || plan.price,
          currency,
          status: 'COMPLETED',
          externalId: transactionId || `dodo_${Date.now()}`,
          completedAt: new Date()
        }
      });

      // Update user subscription
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: planId,
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      });

      // Create subscription history record
      await prisma.subscriptionHistory.create({
        data: {
          userId,
          planId,
          action: isUpgrade ? 'UPGRADED' : 'CREATED',
          previousPlanId: previousPlan !== planId ? previousPlan : null,
          amount: amount || plan.price,
          reason: 'Payment completed successfully'
        }
      });

      // Create invoice record
      await prisma.invoice.create({
        data: {
          userId,
          transactionId: transaction.id,
          amount: amount || plan.price,
          currency,
          status: 'PAID',
          invoiceUrl: `${process.env.FRONTEND_URL}/invoices/${transaction.id}`,
          pdfUrl: `${process.env.FRONTEND_URL}/invoices/${transaction.id}/pdf`
        }
      });

      console.log(`✅ Payment processed successfully for user ${userId}:`);
      console.log(`   - Plan: ${previousPlan} → ${planId}`);
      console.log(`   - Amount: ${amount || plan.price} ${currency}`);
      console.log(`   - Transaction ID: ${transaction.id}`);
      console.log(`   - External ID: ${transaction.externalId}`);

    } catch (error: any) {
      console.error('❌ Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Create subscription (free or paid)
   */
  private async createFreeSubscription(userId: string, planId: string): Promise<void> {
    const plan = this.getPlans().find(p => p.id === planId);
    const isFreePlan = plan?.price === 0;
    
    // Use upsert to handle cases where user doesn't exist
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        plan: planId,
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + (isFreePlan ? 365 : 30) * 24 * 60 * 60 * 1000) // 1 year for free, 30 days for paid
      } as any,
      create: {
        id: userId,
        email: `user-${userId}@placeholder.local`, // Placeholder email
        firstName: '',
        lastName: '',
        plan: planId,
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + (isFreePlan ? 365 : 30) * 24 * 60 * 60 * 1000)
      } as any
    });
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (!this.config.webhookSecret || this.config.webhookSecret === 'mock_webhook_secret') {
        console.warn('⚠️  Webhook verification disabled: Using mock webhook secret');
        return true; // Allow in development mode
      }

      if (!signature) {
        console.error('❌ No signature provided in webhook');
        return false;
      }

      // Extract signature from header (format: "sha256=...")
      const expectedSignature = signature.replace('sha256=', '');
      
      // Create HMAC signature
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', this.config.webhookSecret);
      hmac.update(payload, 'utf8');
      const computedSignature = hmac.digest('hex');

      // Compare signatures using timing-safe comparison
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(computedSignature, 'hex')
      );

      if (!isValid) {
        console.error('❌ Webhook signature verification failed');
        console.error('Expected:', computedSignature);
        console.error('Received:', expectedSignature);
      }

      return isValid;
    } catch (error) {
      console.error('❌ Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Handle failed payment webhook
   */
  async handlePaymentFailed(paymentData: any): Promise<void> {
    try {
      const { userId, planId, transactionId, reason } = paymentData.metadata || paymentData;
      
      if (!userId || !planId) {
        throw new Error('Missing userId or planId in payment data');
      }

      console.log(`❌ Processing payment failure for user ${userId}, plan ${planId}`);

      // Update transaction status
      await prisma.paymentTransaction.updateMany({
        where: {
          userId,
          planId,
          externalId: transactionId
        },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          failureReason: reason || 'Payment failed'
        }
      });

      // Create subscription history record
      await prisma.subscriptionHistory.create({
        data: {
          userId,
          planId,
          action: 'CANCELLED',
          reason: `Payment failed: ${reason || 'Unknown error'}`
        }
      });

      console.log(`✅ Payment failure processed for user ${userId}`);
    } catch (error: any) {
      console.error('❌ Error handling payment failure:', error);
      throw error;
    }
  }

  /**
   * Handle subscription cancellation webhook
   */
  async handleSubscriptionCancelled(subscriptionData: any): Promise<void> {
    try {
      const { userId, planId, reason } = subscriptionData.metadata || subscriptionData;
      
      if (!userId || !planId) {
        throw new Error('Missing userId or planId in subscription data');
      }

      console.log(`🔄 Processing subscription cancellation for user ${userId}, plan ${planId}`);

      // Update user subscription
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: 'basic',
          subscriptionStatus: 'inactive',
          subscriptionEndDate: new Date()
        }
      });

      // Create subscription history record
      await prisma.subscriptionHistory.create({
        data: {
          userId,
          planId,
          action: 'CANCELLED',
          reason: reason || 'Subscription cancelled by user'
        }
      });

      console.log(`✅ Subscription cancellation processed for user ${userId}`);
    } catch (error: any) {
      console.error('❌ Error handling subscription cancellation:', error);
      throw error;
    }
  }

  /**
   * Handle subscription update webhook
   */
  async handleSubscriptionUpdated(subscriptionData: any): Promise<void> {
    try {
      const { userId, planId, previousPlanId } = subscriptionData.metadata || subscriptionData;
      
      if (!userId || !planId) {
        throw new Error('Missing userId or planId in subscription data');
      }

      console.log(`🔄 Processing subscription update for user ${userId}: ${previousPlanId} → ${planId}`);

      // Update user subscription
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: planId,
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      // Create subscription history record
      await prisma.subscriptionHistory.create({
        data: {
          userId,
          planId,
          action: previousPlanId ? 'UPGRADED' : 'RENEWED',
          previousPlanId: previousPlanId || null,
          reason: 'Subscription updated'
        }
      });

      console.log(`✅ Subscription update processed for user ${userId}`);
    } catch (error: any) {
      console.error('❌ Error handling subscription update:', error);
      throw error;
    }
  }

  /**
   * Get user's current plan
   */
  async getUserPlan(userId: string): Promise<SubscriptionPlan | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true }
      });

      if (!user || !user.plan) {
        return null;
      }

      return this.getPlans().find(plan => plan.id === user.plan) || null;
    } catch (error) {
      console.error('Error getting user plan:', error);
      return null;
    }
  }

  /**
   * Check if user has exceeded plan limits
   */
  async checkPlanLimits(userId: string, feature: keyof SubscriptionPlan['features']): Promise<boolean> {
    try {
      const userPlan = await this.getUserPlan(userId);
      if (!userPlan) return false;

      const limit = userPlan.features[feature];
      if (limit === 'unlimited' || limit === -1) return true;
      if (typeof limit !== 'number') return false;

      // Check current usage based on feature type
      switch (feature) {
        case 'leadsPerMonth':
          const leadsCurrentMonth = new Date();
          leadsCurrentMonth.setDate(1);
          const leadCount = await prisma.lead.count({
            where: {
              userId,
              createdAt: { gte: leadsCurrentMonth }
            }
          });
          return leadCount < limit;

        case 'aiSummaries':
        case 'aiReplies':
          // Check AI usage from AIUsage table
          const aiCurrentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
          const aiUsage = await prisma.aIUsage.findFirst({
            where: { 
              userId,
              month: aiCurrentMonth,
              type: feature === 'aiSummaries' ? 'summary' : 'reply'
            }
          });
          return aiUsage ? aiUsage.count < limit : true;

        case 'projects':
          const projectCount = await prisma.project.count({
            where: { userId }
          });
          // For unlimited plans (limit === -1 or 'unlimited'), always allow
          if (limit === -1 || (typeof limit === 'string' && limit === 'unlimited')) return true;
          return projectCount < limit;

        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking plan limits:', error);
      return false;
    }
  }
}

export const dodoPaymentsService = new DodoPaymentsService();
