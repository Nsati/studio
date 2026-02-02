
import Redis from 'ioredis';

/**
 * @fileOverview Redis Client Utility.
 * Provides a global singleton for Redis connections with graceful fallback.
 */

const REDIS_URL = process.env.REDIS_URL;

let redis: Redis | null = null;

if (typeof window === 'undefined' && REDIS_URL) {
    try {
        redis = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 3,
            connectTimeout: 5000,
        });
        
        redis.on('error', (err) => {
            console.warn('[REDIS] Connection warning:', err.message);
        });
        
        console.log('✅ [REDIS] Connected successfully for global caching.');
    } catch (e) {
        console.warn('[REDIS] Initialization failed. Falling back to direct DB queries.');
    }
}

export { redis };

/**
 * Helper to cache results of expensive operations.
 */
export async function withCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
    if (!redis) return fetcher();

    try {
        const cached = await redis.get(key);
        if (cached) {
            console.log(`🚀 [CACHE HIT] Key: ${key}`);
            return JSON.parse(cached);
        }
    } catch (e) {
        console.warn(`[CACHE READ ERROR] Key: ${key}`, e);
    }

    const result = await fetcher();

    try {
        await redis.set(key, JSON.stringify(result), 'EX', ttl);
        console.log(`💾 [CACHE SET] Key: ${key}`);
    } catch (e) {
        console.warn(`[CACHE WRITE ERROR] Key: ${key}`, e);
    }

    return result;
}
