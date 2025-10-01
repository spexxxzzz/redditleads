// src/routes/reddit.ts
import express from 'express';
import { 
  getRedditAuthUrl, 
  handleRedditCallback, 
  disconnectReddit,
  postReply
} from '../controllers/reddit.controller';
import { gateKeeper } from '../middleware/gateKeeper';

const redditRouter = express.Router();

// Get Reddit OAuth URL. Any authenticated user should be able to do this.
redditRouter.get('/auth', getRedditAuthUrl);

// This endpoint is called by Reddit's servers and cannot have authentication middleware.
redditRouter.get('/callback', handleRedditCallback);

// Disconnect Reddit account. Any authenticated user should be able to do this.
redditRouter.delete('/disconnect', disconnectReddit);

// Post a reply to Reddit automatically (requires authentication)
redditRouter.post('/post-reply', gateKeeper, postReply);

export default redditRouter;