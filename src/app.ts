import Fastify, {type FastifyInstance} from "fastify";
import { registerOpenapi } from "./plugins/openapi.js";
import { registerRoutes } from "./routes/index.js";

export async function buildApp():  Promise<FastifyInstance> {
    const app = Fastify({ logger: true });

    await registerOpenapi(app)
    await registerRoutes(app)

    return app;
}