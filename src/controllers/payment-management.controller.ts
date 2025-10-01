// src/controllers/payment-management.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

const prisma = new PrismaClient();

export class PaymentManagementController {
  /**
   * Get user's payment history
   */
  async getPaymentHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [transactions, total] = await Promise.all([
        prisma.paymentTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
          select: {
            id: true,
            planId: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
            completedAt: true,
            failedAt: true,
            failureReason: true
          }
        }),
        prisma.paymentTransaction.count({
          where: { userId }
        })
      ]);

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting payment history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payment history'
      });
    }
  }

  /**
   * Get user's subscription history
   */
  async getSubscriptionHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [history, total] = await Promise.all([
        prisma.subscriptionHistory.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.subscriptionHistory.count({
          where: { userId }
        })
      ]);

      res.json({
        success: true,
        data: {
          history,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting subscription history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscription history'
      });
    }
  }

  /**
   * Get user's invoices
   */
  async getInvoices(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.invoice.count({
          where: { userId }
        })
      ]);

      res.json({
        success: true,
        data: {
          invoices,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error: any) {
      console.error('Error getting invoices:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get invoices'
      });
    }
  }

  /**
   * Get specific invoice by ID
   */
  async getInvoice(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { invoiceId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const invoice = await prisma.invoice.findFirst({
        where: {
          id: invoiceId,
          userId
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error: any) {
      console.error('Error getting invoice:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get invoice'
      });
    }
  }

  /**
   * Update billing address
   */
  async updateBillingAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { address, city, state, country, postalCode, taxId } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const billingAddress = await prisma.billingAddress.upsert({
        where: { userId },
        update: {
          address,
          city,
          state,
          country,
          postalCode,
          taxId
        },
        create: {
          userId,
          address,
          city,
          state,
          country,
          postalCode,
          taxId
        }
      });

      res.json({
        success: true,
        data: billingAddress
      });
    } catch (error: any) {
      console.error('Error updating billing address:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update billing address'
      });
    }
  }

  /**
   * Get billing address
   */
  async getBillingAddress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const billingAddress = await prisma.billingAddress.findUnique({
        where: { userId }
      });

      res.json({
        success: true,
        data: billingAddress
      });
    } catch (error: any) {
      console.error('Error getting billing address:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get billing address'
      });
    }
  }
}

export const paymentManagementController = new PaymentManagementController();
