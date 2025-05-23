import { createClient } from "redis";

// Redis configuration
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
};

// Create Redis connection
export const redis = createClient(redisConfig);

// Initialize connection
redis.connect().catch((err) => {
  console.error("Redis connection error", err);
});

// Queue options
const queueOptions = {
  connection: redis, // Pass the Redis client directly
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
};

export { queueOptions };
