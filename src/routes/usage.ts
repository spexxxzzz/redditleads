// src/routes/usage.ts

import { Router } from 'express';
import { usageController, UsageController } from '../controllers/usage.controller';

const router = Router();

// Get user usage data
router.get('/', usageController.getUserUsage);

// Get project-specific usage data
router.get('/project/:projectId', usageController.getProjectUsage);

// Reset user's usage data (for testing/account switching)
router.post('/reset', async (req: any, res) => {
  try {
    const auth = await req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    await UsageController.resetUserUsage(userId);
    
    res.json({
      success: true,
      message: 'Usage data reset successfully'
    });
  } catch (error: any) {
    console.error('Error resetting usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset usage data'
    });
  }
});

export default router;
