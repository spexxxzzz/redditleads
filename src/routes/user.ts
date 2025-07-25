// src/routes/user.ts
import express from 'express';
import { deleteCurrentUser, updateCurrentUser } from '../controllers/user.controller';

const userRouter = express.Router();

// Defines the DELETE /api/user endpoint.
// It doesn't need gateKeeper because any authenticated user (free or pro)
// should be allowed to delete their own account.
userRouter.delete('/', deleteCurrentUser);
// userRouter.patch('/', updateCurrentUser);

export default userRouter;