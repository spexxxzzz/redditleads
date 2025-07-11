import express from 'express';
import { getRedditAuthUrl, handleRedditCallback, disconnectReddit } from '../controllers/reddit.controller';

const redditRouter = express.Router();

// Get Reddit OAuth URL for user
redditRouter.get('/auth/:userId', getRedditAuthUrl);

// Handle Reddit OAuth callback
redditRouter.get('/callback', handleRedditCallback);

// Disconnect Reddit account
redditRouter.delete('/disconnect/:userId', disconnectReddit);

export default redditRouter;