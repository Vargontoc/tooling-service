import Fastify, {type FastifyInstance} from "fastify";
import { registerOpenapi } from "./plugins/openapi.js";
import { registerRoutes } from "./routes/index.js";
import { registerRateLimit } from "./plugins/rateLimit.js";
import { registerApiKeyAuth } from "./plugins/auth.js";

export async function buildApp():  Promise<FastifyInstance> {
    const app = Fastify({ logger: true });

    await registerOpenapi(app)

    await registerRateLimit(app)
    await registerApiKeyAuth(app)

    await registerRoutes(app)

    return app;
}