import { Request, Response } from 'express';
import { completeOnboarding } from './onboarding.controller';
import { generateSubredditSuggestions } from '../services/ai.service';
import { PrismaClient } from '@prisma/client';

// --- MOCK THE EXTERNAL SERVICES ---
jest.mock('../services/ai.service');

// Create a mock that we can control
const mockCreate = jest.fn();
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    campaign: {
      create: mockCreate,
    },
  })),
}));

const mockedGenerateSubredditSuggestions = generateSubredditSuggestions as jest.Mock;

describe('Onboarding Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('completeOnboarding', () => {
    it('should create a campaign and return 201 on success', async () => {
      // 1. ARRANGE
      const mockReq = {
        body: {
          userId: 'test-user-id',
          websiteUrl: 'https://test.com',
          generatedKeywords: ['keyword1', 'keyword2'],
          generatedDescription: 'A test description.',
        },
      } as unknown as Request;

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const mockNext = jest.fn();

      const fakeSubreddits = ['testsubreddit', 'anothertest'];
      mockedGenerateSubredditSuggestions.mockResolvedValue(fakeSubreddits);

      const fakeCampaign = { 
        id: 'new-campaign-id', 
        userId: 'test-user-id',
        analyzedUrl: 'https://test.com',
        generatedKeywords: ['keyword1', 'keyword2'],
        generatedDescription: 'A test description.',
        targetSubreddits: fakeSubreddits 
      };
      
      // --- THIS IS THE FIX ---
      // Set up the mock to return our fake campaign
      mockCreate.mockResolvedValue(fakeCampaign);

      // 2. ACT
      await completeOnboarding(mockReq, mockRes, mockNext);

      // 3. ASSERT
      expect(mockedGenerateSubredditSuggestions).toHaveBeenCalledWith('A test description.');
      
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          userId: 'test-user-id',
          analyzedUrl: 'https://test.com',
          generatedKeywords: ['keyword1', 'keyword2'],
          generatedDescription: 'A test description.',
          targetSubreddits: fakeSubreddits,
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(fakeCampaign);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});