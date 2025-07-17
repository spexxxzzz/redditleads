// src/routes/reddit.ts
import express from 'express';
import { 
  getRedditAuthUrl, 
  handleRedditCallback, 
  disconnectReddit 
} from '../controllers/reddit.controller';
// We remove gateKeeper from here as it's not needed for this flow

const redditRouter = express.Router();

// Get Reddit OAuth URL. Any authenticated user should be able to do this.
redditRouter.get('/auth', getRedditAuthUrl);

// This endpoint is called by Reddit's servers and cannot have authentication middleware.
redditRouter.get('/callback', handleRedditCallback);

// Disconnect Reddit account. Any authenticated user should be able to do this.
redditRouter.delete('/disconnect', disconnectReddit);

export default redditRouter;