import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { decodeJwt } from "../../domain/jwt/jwtDecode.js";

const BodySchema = z.object({
    token: z.string().min(1)
})

export async function registerJwtDecodeRoutes(app: FastifyInstance) : Promise<void> {
    app.post("/tools/jwt/decode",
    {
        schema: {
            tags: ["tools"],
            summary: "Decode a JWT (header/payload) without verifying the signature."
        }
    },
    async (req, reply) => {
        const parsed = BodySchema.safeParse(req.body)
        if(!parsed.success) {
            return reply.code(400).send({ error: "Bad Request", details: parsed.error.flatten()})
        }

        try {
            const result = decodeJwt(parsed.data.token)
            return reply.send(result)
        }catch(err: any) {
            return reply.code(400).send({ error: err?.message ?? "Invalid token"})
        }
    }
    )
}