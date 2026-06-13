import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = new Redis(redisUrl, {
  retryStrategy: (times) => {
    // Reconnect after 2 seconds, up to a maximum delay of 10s
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redisClient.on("connect", () => {
  console.log("Redis client connected successfully");
});

redisClient.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redisClient.on("ready", () => {
  console.log("Redis client is ready to process commands");
});

export default redisClient;
