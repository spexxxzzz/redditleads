
import express, { Request, Response } from 'express'
import { analyzeWebsite, completeOnboarding } from '../controllers/onboarding.controller';
 
const onboardingRouter =  express.Router();



onboardingRouter.post('/onboarding/analyze-website', analyzeWebsite);
onboardingRouter.post('/onboarding/complete', completeOnboarding);


module.exports = onboardingRouter;
