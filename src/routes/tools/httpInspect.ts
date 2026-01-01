import type { FastifyInstance } from "fastify";
import { z } from "zod"
import { httpInspect } from "../../domain/http/httpInspect.js";
import { zodToProblem } from "../../domain/validation/zod.js";

const BodySchema = z.object({
  url: z.string().min(1),
  method: z.enum(["GET", "HEAD"]).default("GET"),
  timeoutMs: z.number().int().min(200).max(10_000).default(3000),
  followRedirects: z.boolean().default(true),
});

export async function registerHttpInspectRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/tools/http/inspect",
    {
      schema: {
        tags: ["tools"],
        summary: "Inspect an HTTP endpoint (safe GET/HEAD) and return status, headers and timing.",
      },
    },
    async (req, reply) => {
      const parsed = BodySchema.safeParse(req.body);
      if (!parsed.success) {
        return reply.header("Content-Type", "application/problem+json")
        .code(400)
        .send(zodToProblem(req, parsed.error));
      }

      try {
        const result = await httpInspect(parsed.data);
        return reply.send(result);
      } catch (err: any) {
        return reply.code(400).send({ error: err?.message ?? "Invalid request" });
      }
    },
  );
}