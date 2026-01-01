import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { decodeJwt } from "../../domain/jwt/jwtDecode.js";
import { zodToProblem } from "../../domain/validation/zod.js";
import { problem, sendProblem } from "../../plugins/errors.js";

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
            return sendProblem(reply, zodToProblem(req, parsed.error))
        }

        try {
            const result = decodeJwt(parsed.data.token)
            return reply.send(result)
        }catch(err: any) {
            return sendProblem(reply, problem(req, 400, err?.message ?? "Invalid token", "https://problems.vargontoc.es/request-error"))
        }
    }
    )
}