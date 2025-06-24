import express, { Request, Response } from 'express'
import { discoverLeads } from '../controllers/lead.controller'
import { analyzeWebsite } from '../controllers/onboarding.controller'
const leadRouter = express.Router()


leadRouter.get('/', (req : Request, res : Response) =>  {
      res.status(200).json({
        message: 'Leads endpoint is working',
      })
})


leadRouter.get('/discover', discoverLeads);

export default leadRouter;