
import express, { Request, Response } from 'express'
import { analyzeWebsite, completeOnboarding } from '../controllers/onboarding.controller';
import { requireAuth } from '@clerk/express';
 
const onboardingRouter =  express.Router();

console.log("--- [ROUTER LOG] Loading onboarding.ts router file...");


onboardingRouter.post('/analyze', analyzeWebsite);
console.log("--- [ROUTER LOG] Route POST /onboarding/analyze configured.");

onboardingRouter.post('/complete', requireAuth(), completeOnboarding);
console.log("--- [ROUTER LOG] Route POST /onboarding/complete configured.");


export default onboardingRouter;