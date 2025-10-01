# Vertex AI Migration Guide

## Why Migrate to Vertex AI?

### Current Issues with Gemini API:
- ❌ **Low rate limits**: 150 requests/minute
- ❌ **Daily quotas**: 1,000-50,000 requests/day
- ❌ **Expensive** for high volume
- ❌ **No enterprise features**

### Vertex AI Benefits:
- ✅ **High rate limits**: 1,200+ requests/minute
- ✅ **No daily quotas**
- ✅ **Better pricing** for volume
- ✅ **Enterprise reliability**
- ✅ **Better error handling**

## Migration Steps

### 1. Set up Google Cloud Project
```bash
# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Login and create project
gcloud auth login
gcloud projects create your-project-id
gcloud config set project your-project-id

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com
```

### 2. Install Dependencies
```bash
npm install @google-cloud/vertexai
```

### 3. Environment Variables
```bash
# .env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### 4. Update AI Service
Replace `src/services/ai.service.ts` imports:

```typescript
// Before
import { generateContentWithFallback } from './ai.service';

// After
import { generateContentWithVertexAI } from './vertex-ai.service';
```

### 5. Update Function Calls
```typescript
// Before
const response = await generateContentWithFallback(prompt, true, cacheKey);

// After
const response = await generateContentWithVertexAI(prompt, true, cacheKey);
```

## Production Optimizations

### 1. Multiple Regions
```typescript
const regions = ['us-central1', 'us-east1', 'europe-west1'];
const getRandomRegion = () => regions[Math.floor(Math.random() * regions.length)];
```

### 2. Request Batching
```typescript
const batchRequests = async (requests: Request[]) => {
  const batches = chunk(requests, 10); // Process 10 at a time
  for (const batch of batches) {
    await Promise.all(batch.map(processRequest));
    await delay(1000); // 1 second between batches
  }
};
```

### 3. Circuit Breaker Pattern
```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > 60000) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

### 4. Redis Caching
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const getCachedResponse = async (key: string): Promise<string | null> => {
  return await redis.get(key);
};

const setCachedResponse = async (key: string, value: string): Promise<void> => {
  await redis.setex(key, 1800, value); // 30 minutes
};
```

## Cost Optimization

### 1. Smart Caching
- Cache similar prompts
- Use semantic similarity for cache keys
- Implement cache warming

### 2. Request Optimization
- Batch similar requests
- Use shorter prompts where possible
- Implement request deduplication

### 3. Fallback Strategies
```typescript
const processWithFallback = async (prompt: string) => {
  try {
    return await generateContentWithVertexAI(prompt);
  } catch (error) {
    if (error.message.includes('rate limit')) {
      return await fallbackKeywordScoring(prompt);
    }
    throw error;
  }
};
```

## Monitoring & Alerting

### 1. Rate Limit Monitoring
```typescript
const monitorRateLimits = () => {
  setInterval(() => {
    const currentRate = getCurrentRequestRate();
    if (currentRate > RATE_LIMITS.requestsPerMinute * 0.8) {
      console.warn('Rate limit approaching:', currentRate);
      // Send alert to monitoring system
    }
  }, 10000); // Check every 10 seconds
};
```

### 2. Error Tracking
```typescript
const trackError = (error: Error, context: any) => {
  // Send to monitoring service (e.g., Sentry, DataDog)
  console.error('AI Service Error:', {
    error: error.message,
    context,
    timestamp: new Date().toISOString()
  });
};
```

## Expected Performance

### Before (Gemini API):
- 150 requests/minute
- Frequent rate limit errors
- High costs for volume

### After (Vertex AI):
- 1,200+ requests/minute
- No daily quotas
- 50-70% cost reduction
- Better reliability

## Migration Checklist

- [ ] Set up Google Cloud project
- [ ] Install Vertex AI dependencies
- [ ] Update environment variables
- [ ] Replace AI service calls
- [ ] Implement rate limiting
- [ ] Add caching layer
- [ ] Set up monitoring
- [ ] Test with production load
- [ ] Deploy to production
- [ ] Monitor performance

## Support

For issues with Vertex AI migration:
1. Check Google Cloud Console for quotas
2. Monitor Cloud Logging for errors
3. Use Cloud Monitoring for metrics
4. Contact Google Cloud Support for enterprise issues
