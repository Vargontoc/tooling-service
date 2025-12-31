import type { FastifyInstance } from "fastify";
import { registerHealthRoutes } from "./health.js";
import { registerHttpInspectRoutes } from "./tools/httpInspect.js";

export async function registerRoutes(app: FastifyInstance) : Promise<void> {
    await registerHealthRoutes(app);
    await registerHttpInspectRoutes(app)
}