import type { FastifyRequest } from "fastify";
import type { ZodError } from "zod";
import { problem, type ProblemDetails } from "../../plugins/errors.js";

export function zodToProblem(req: FastifyRequest, zodError: ZodError): ProblemDetails {
  const { fieldErrors, formErrors } = zodError.flatten();
  const errors: Record<string, string[]> = {};

  for (const [field, messages] of Object.entries(fieldErrors ?? {})) {
    const msgs = Array.isArray(messages) ? messages.filter((m): m is string => typeof m === "string") : [];
    if (msgs.length > 0) errors[field] = msgs;
  }

  if (Array.isArray(formErrors) && formErrors.length > 0) {
    errors["_"] = formErrors.filter((m): m is string => typeof m === "string");
  }

  const extras = Object.keys(errors).length > 0 ? { errors } : undefined;

  return problem(req, 400, "One or more fields are invalid.", "https://problems.vargontoc.es/validation", extras);
}