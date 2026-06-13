import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.config.ts";

/**
 * Global rate limiter: limits each IP to 200 requests per 15 minutes.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

/**
 * Strict rate limiter for sensitive routes (e.g., login, reset password): limits each IP to 10 requests per 15 minutes.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
  }),
  message: {
    success: false,
    message: "Too many failed attempts from this IP, please try again after 15 minutes",
  },
});
