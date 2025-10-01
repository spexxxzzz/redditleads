// src/controllers/health.controller.ts

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class HealthController {
  /**
   * Basic health check
   */
  async basic(req: Request, res: Response) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  }

  /**
   * Detailed health check with database connectivity
   */
  async detailed(req: Request, res: Response) {
    const startTime = Date.now();
    const checks = {
      database: { status: 'unknown', responseTime: 0, error: null as string | null },
      memory: { status: 'unknown', usage: 0, free: 0 },
      environment: { status: 'unknown', nodeEnv: process.env.NODE_ENV }
    };

    try {
      // Database check
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart,
        error: null
      };
    } catch (error: any) {
      checks.database = {
        status: 'unhealthy',
        responseTime: 0,
        error: error.message
      };
      logger.error('Database health check failed', { error: error.message });
    }

    // Memory check
    const memUsage = process.memoryUsage();
    checks.memory = {
      status: memUsage.heapUsed / memUsage.heapTotal > 0.9 ? 'warning' : 'healthy',
      usage: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      free: Math.round((memUsage.heapTotal - memUsage.heapUsed) / 1024 / 1024) // MB
    };

    // Environment check
    checks.environment = {
      status: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      nodeEnv: process.env.NODE_ENV || 'development'
    };

    const overallStatus = checks.database.status === 'healthy' ? 'healthy' : 'unhealthy';
    const responseTime = Date.now() - startTime;

    res.status(overallStatus === 'healthy' ? 200 : 503).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      responseTime: `${responseTime}ms`,
      checks
    });
  }

  /**
   * Readiness probe for Kubernetes
   */
  async readiness(req: Request, res: Response) {
    try {
      // Check if database is accessible
      await prisma.$queryRaw`SELECT 1`;
      
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error('Readiness check failed', { error: error.message });
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  }

  /**
   * Liveness probe for Kubernetes
   */
  async liveness(req: Request, res: Response) {
    res.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  }
}

export const healthController = new HealthController();
