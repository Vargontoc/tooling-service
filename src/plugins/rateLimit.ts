import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit"

export async function registerRateLimit(app: FastifyInstance) : Promise<void> {
    await app.register(rateLimit,{ 
        max: 60, 
        timeWindow: "1 minute",
        allowList: (req) => {
            const path = req.url.split("?")[0] ?? "/";
            return path === "/health" || path === "/openapi.json" || path.startsWith("/docs");
        },
        errorResponseBuilder: (_req, context) => {
            return {
                error: "Too many requests",
                message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)}s`,
                statusCode:  429
            }
        }
    })
}