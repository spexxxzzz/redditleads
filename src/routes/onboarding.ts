
import express, { Request, Response } from 'express'
import { analyzeWebsite, completeOnboarding } from '../controllers/onboarding.controller';
 
const onboardingRouter =  express.Router();

console.log("--- [ROUTER LOG] Loading onboarding.ts router file...");


onboardingRouter.post('/analyze', analyzeWebsite);
console.log("--- [ROUTER LOG] Route POST /onboarding/analyze configured.");

onboardingRouter.post('/complete', completeOnboarding);
console.log("--- [ROUTER LOG] Route POST /onboarding/complete configured.");


export default onboardingRouter;