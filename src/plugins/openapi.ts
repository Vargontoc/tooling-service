import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"

export async function registerOpenapi(app: FastifyInstance) : Promise<void> {
    await app.register(swagger, {
        openapi: {
            info: {
                title: "Tooling Service",
                description: "A small Fastify/TypeScript tooling API",
                version: "0.1.0"
            }
        }
    })

    await app.register(swaggerUi, { routePrefix: "/docs"})
    app.get("/openapi.json", async () => app.swagger());
}