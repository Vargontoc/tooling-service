import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export type ProblemDetails = {
    type: string
    title: string
    status: number
    detail: string
    instance: string
    errors?: Record<string, string[]>
}

function instanceFromRequest(req: FastifyRequest): string {
    const path = req.url.split("?")[0] ?? "";
    return path
}

export function sendProblem(reply: FastifyReply, problem:ProblemDetails) {
    reply.header("content-type", "application/problem+json").code(problem.status).send(problem)
}

function toTitle(status: number) : string{
    switch (status) {
        case 400: return "Bad Request"
        case 401: return "Unauthorized"
        case 403: return "Forbidden"
        case 404: return "Not Found"
        case 409: return "Conflict"
        case 422: return "Unprocessable Entity"
        case 429: return "Too Many Request"
        default: return status >= 500 ? "Internal Server Error" : "Error"
    }
}

export function problem(req: FastifyRequest, status: number, detail: string, type: string, extras?: Partial<ProblemDetails>) : ProblemDetails {
    return { type, title: toTitle(status), status, detail, instance: instanceFromRequest(req), ...extras}
}

export async function registerProblemDetails(app: FastifyInstance) : Promise<void> {
    app.setErrorHandler((err: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
        const status = (err.statusCode && Number.isFinite(err.statusCode)) ? err.statusCode : 500
        
        // Fastify JSON parse error suele caer aquí con 400
        if (status === 400 && (err as any).code === "FST_ERR_CTP_INVALID_MEDIA_TYPE") {
        return sendProblem(reply, problem(req, 400, "Invalid Content-Type.", "https://problems.vargontoc.es/invalid-content-type"));
        }

        if (status === 400 && (err as any).code === "FST_ERR_CTP_BODY_TOO_LARGE") {
        return sendProblem(reply, problem(req, 400, "Request body too large.", "https://problems.vargontoc.es/body-too-large"));
        }

        if (status === 400 && (err as any).code === "FST_ERR_CTP_INVALID_JSON_BODY") {
        return sendProblem(reply, problem(req, 400, "Malformed JSON body.", "https://problems.vargontoc.es/malformed-json"));
        }

        // Por defecto
        const type =
        status >= 500
            ? "https://problems.vargontoc.es/internal-error"
            : "https://problems.vargontoc.es/request-error";

        const detail = status >= 500 ? "Unexpected error." : (err.message || "Request error.");
        return sendProblem(reply, problem(req, status, detail, type));
    })

    app.setNotFoundHandler((req, reply) => {
        return sendProblem(reply, problem(req, 404, "Route not found", "https://problems.vargontoc.es/request-error"))
    })
}