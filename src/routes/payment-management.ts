// src/routes/payment-management.ts

import { Router } from 'express';
import { paymentManagementController } from '../controllers/payment-management.controller';
import { gateKeeper } from '../middleware/gateKeeper';

const router = Router();

// Apply authentication middleware to all routes
router.use(gateKeeper);

// Payment history routes
router.get('/history', paymentManagementController.getPaymentHistory);
router.get('/subscription-history', paymentManagementController.getSubscriptionHistory);

// Invoice routes
router.get('/invoices', paymentManagementController.getInvoices);
router.get('/invoices/:invoiceId', paymentManagementController.getInvoice);

// Billing address routes
router.get('/billing-address', paymentManagementController.getBillingAddress);
router.put('/billing-address', paymentManagementController.updateBillingAddress);

export default router;
