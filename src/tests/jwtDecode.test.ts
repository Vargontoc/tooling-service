import { describe, it, expect, afterEach } from "vitest"
import { buildApp } from "../app.js"

describe("tools/jwt/decode", () => {
    let app: Awaited<ReturnType<typeof buildApp>>


    afterEach(async() => {
        if(app) await app.close()
    })

    it("decodes a jwt payload and exposes timestamps", async () => {
        app = await buildApp()

        const token  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
        "eyJzdWIiOiIxMjMiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0." +
        "signature";

        const res = await app.inject({
            method: "POST",
            url: "/tools/jwt/decode",
            headers: { "content-type": "application/json", "x-api-key": "local-dev-key" },
            payload: { token }
        })

        expect(res.statusCode).toBe(200)
        const body = res.json();

        expect(body.note).toContain("does NOT verify")
        expect(body.header).toMatchObject({ typ: "JWT"})
        expect(body.payload).toMatchObject({ sub: "123" })
        expect(body.timestamps.exp.unixSeconds).toBe(1700003600)
        expect(typeof body.timestamps.exp.iso).toBe("string")
    })

    it("returns 400 for invalid token", async () => {
        app = await buildApp()


        const res = await app.inject({
            method: "POST",
            url: "/tools/jwt/decode",
            headers: { "content-type": "application/json", "x-api-key": "local-dev-key" },
            payload: { token: "no-a-jwt" }
        })

        expect(res.statusCode).toBe(400)
        expect(res.headers["content-type"]).toContain("application/problem+json")
        const body = res.json()
        expect(body.status).toBe(400)
    })

})