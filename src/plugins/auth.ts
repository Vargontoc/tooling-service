import type { FastifyInstance, FastifyRequest } from "fastify";
import { env } from "../config/env.js";

const PUBLIC_PREFIXES = ["/docs", "/docs/", "/openapi.json", "/health"]

function isPublicPath(url: string) : boolean {
    const path = url.split("?")[0];
    return PUBLIC_PREFIXES.some((p) => path === p || path?.startsWith(p))
}

export async function registerApiKeyAuth(app: FastifyInstance) : Promise<void> {
    app.addHook("onRequest", async (req: FastifyRequest, reply) => {
        if(isPublicPath(req.url)) return;

        const apiKey = req.headers["x-api-key"];
        if(typeof apiKey !== "string" || apiKey.length === 0) {
            return reply.code(401).send({error: "Unauthorized" })
        }

        if(apiKey !== env.apiKey) {
            return reply.code(401).send({error: "Unauthorized" })
        }
    })
}