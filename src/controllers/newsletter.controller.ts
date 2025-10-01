import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const subscribeToNewsletter = async (req: Request, res: Response) => {
  try {
    const { email, source = 'blog' } = req.body;

    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(200).json({
          success: true,
          message: 'Email already subscribed to our newsletter!',
          alreadySubscribed: true
        });
      } else {
        // Reactivate the subscription
        await prisma.newsletterSubscriber.update({
          where: { id: existingSubscriber.id },
          data: { 
            isActive: true,
            subscribedAt: new Date()
          }
        });
        
        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your email has been reactivated in our newsletter.',
          reactivated: true
        });
      }
    }

    // Create new subscription
    await prisma.newsletterSubscriber.create({
      data: {
        email: email.toLowerCase(),
        source,
        isActive: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Email added to our database. We will update you with the latest insights!',
      subscribed: true
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter. Please try again later.'
    });
  }
};

export const getNewsletterStats = async (req: Request, res: Response) => {
  try {
    const totalSubscribers = await prisma.newsletterSubscriber.count({
      where: { isActive: true }
    });

    const recentSubscribers = await prisma.newsletterSubscriber.count({
      where: {
        isActive: true,
        subscribedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalSubscribers,
        recentSubscribers
      }
    });
  } catch (error) {
    console.error('Newsletter stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch newsletter statistics'
    });
  }
};
