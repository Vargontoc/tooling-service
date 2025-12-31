import type { FastifyInstance } from "fastify";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
    app.get("/health", {
        schema: {
            tags: ["system"],
            summary: "Health Check",
            response: {
                200: {
                    type: "object",
                    properties: { status: { type: "string" }},
                    required: ["status"]
                }
            }
        }
    }, async () => ({ status: "ok"}))
}