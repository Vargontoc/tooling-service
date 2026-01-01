import { describe, it, expect, afterEach } from "vitest"
import { buildApp } from "../app.js"

describe("security", () => {
    let app: Awaited<ReturnType<typeof buildApp>>


    afterEach(async() => {
        if(app) await app.close()
    })

    it("GET /health is public", async () => {
        app = await buildApp()

        const res = await app.inject({
            method: "GET", url: "/health"
        })

        expect(res.statusCode).toBe(200)
        expect(res.headers["content-type"]).toContain("application/json")
        expect(res.json()).toEqual({ status: "ok" })
    });
})