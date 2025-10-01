import express from 'express';
import { getProjectsForUser, getProjectById, deleteProjectById, updateProjectById } from '../controllers/project.controller';

const projectRouter = express.Router();

// Get all projects for the currently authenticated user
// The controller now gets the userId from req.auth, so we don't need it in the URL.
projectRouter.get('/', getProjectsForUser);

// Get a specific project by ID
// The controller for this route already verifies ownership.
projectRouter.get('/:projectId', getProjectById);
projectRouter.delete('/:projectId', deleteProjectById);
projectRouter.patch('/:projectId', updateProjectById);

export default projectRouter;