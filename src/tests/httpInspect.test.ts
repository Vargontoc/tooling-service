import { describe, it, expect, afterEach, beforeAll, afterAll } from "vitest";
import { buildApp } from "../app.js";
import http from "node:http";

describe("tools/http/inspect", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  let server: http.Server;
  let baseUrl: string;

  beforeAll(async () => {
    process.env.ALLOW_PRIVATE_TARGETS = "true";

    server = http.createServer((req, res) => {
      if (req.url === "/ok") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end("ok");
        return;
      }
      res.statusCode = 404;
      res.end("not found");
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });

    const addr = server.address();
    if (addr && typeof addr === "object") {
      baseUrl = `http://127.0.0.1:${addr.port}`;
    } else {
      throw new Error("Could not bind test server");
    }
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    delete process.env.ALLOW_PRIVATE_TARGETS;
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it("returns 400 for blocked targets when private targets are not allowed", async () => {
    delete process.env.ALLOW_PRIVATE_TARGETS;
    app = await buildApp();

    const res = await app.inject({
      method: "POST",
      url: "/tools/http/inspect",
      headers: { "content-type": "application/json", "x-api-key": "local-dev-key" },
      payload: { url: "http://localhost:1234", method: "GET" },
    });

    expect(res.statusCode).toBe(400);
    expect(res.headers["content-type"]).toContain("application/problem+json");
  });

  it("inspects a reachable endpoint (test server)", async () => {
    process.env.ALLOW_PRIVATE_TARGETS = "true";
    app = await buildApp();

    const res = await app.inject({
      method: "POST",
      url: "/tools/http/inspect",
      headers: { "content-type": "application/json", "x-api-key": "local-dev-key" },
      payload: { url: `${baseUrl}/ok`, method: "GET", timeoutMs: 2000, followRedirects: false },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe(200);
    expect(body.headers["content-type"]).toContain("text/plain");
    expect(body.durationMs).toBeGreaterThanOrEqual(0);
  });
});