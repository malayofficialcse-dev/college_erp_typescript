import type { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis.config.ts";

/**
 * Middleware to cache the response of an endpoint.
 * @param durationInSeconds How long the response should be cached.
 */
export const cacheResponse = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    try {
      const key = `cache:${req.originalUrl}`;
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      // Intercept the res.json to cache the response before sending it
      const originalJson = res.json.bind(res);
      res.json = ((body: any) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setex(key, durationInSeconds, JSON.stringify(body)).catch((err) => {
            console.error("Redis SetEx Error:", err);
          });
        }
        return originalJson(body);
      }) as any;

      next();
    } catch (error) {
      console.error("Redis Cache Error:", error);
      // If Redis fails, continue to the route handler without caching
      next();
    }
  };
};

/**
 * Middleware to clear cache based on a specific prefix (e.g. invalidate /api/v1/departments cache when a department is created).
 * @param prefix The URL prefix to clear. E.g., "/api/v1/departments"
 */
export const clearCache = (prefix: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Run the route handler first
      const originalSend = res.send.bind(res);
      const originalJson = res.json.bind(res);

      res.json = ((body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          invalidateCachePrefix(prefix);
        }
        return originalJson(body);
      }) as any;

      res.send = ((body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          invalidateCachePrefix(prefix);
        }
        return originalSend(body);
      }) as any;

      next();
    } catch (error) {
      next();
    }
  };
};

const invalidateCachePrefix = async (prefix: string) => {
  try {
    const keys = await redisClient.keys(`cache:${prefix}*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`Cleared cache for keys: ${keys.join(", ")}`);
    }
  } catch (error) {
    console.error("Redis Invalidate Cache Error:", error);
  }
};
