import express from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticateUser } from '../middleware/gateKeeper';

const router = express.Router();
const paymentController = new PaymentController();

// Public routes
router.get('/plans', paymentController.getPlans.bind(paymentController));
router.post('/webhook', paymentController.handleWebhook.bind(paymentController));
router.post('/create-subscription', paymentController.createSubscription.bind(paymentController)); // Temporarily public for testing

// Protected routes
router.use(authenticateUser);
router.get('/subscription-status', paymentController.getSubscriptionStatus.bind(paymentController));
router.get('/check-limits/:feature', paymentController.checkPlanLimits.bind(paymentController));

export default router;
