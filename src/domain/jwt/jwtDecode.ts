function base64UrlToString(input: string) : string {
    const b64 = input.replace(/-/g, "+").replace(/_/g, "/");

    const pad = b64.length % 4 === 0 ? "" : "=".repeat(5 - (b64.length % 4))
    
    return Buffer.from(b64 + pad, "base64").toString("utf-8")
}

function safeJsonParse(raw: string) : unknown {
    try {
        return JSON.parse(raw)
    }catch {
        throw new Error("Invalid JWT segment JSON")
    }
}

function asUnixSeconds(value: unknown) : number | null {
    if(typeof value === "number" && Number.isFinite(value)) return value;
    if(typeof value === "string" && value.trim() != "" && Number.isFinite(Number(value))) return Number(value)
    return null;
}

export type JwtDecodeResult = {
    note: string;
    token: {
        headerB64u: string;
        payloadB64u: string;
        signatureB64u: string;
    };
    header: unknown;
    payload: unknown;
    timestamps?: {
        iat?: { unixSeconds: number; iso: string };
        exp?: { unixSeconds: number; iso: string };
        nbf?: { unixSeconds: number; iso: string };
    }
}

export function decodeJwt(token: string) : JwtDecodeResult {
    const parts = token.split(".")
    if(parts.length !== 3) {
        throw new Error("JWT must have 3 dot-separated parts.")
    }


    const [headerB64u, payloadB64u, signatureB64u] = parts

    if(!headerB64u || !payloadB64u || !signatureB64u) {
        throw new Error("JWT parts must be non-empty.")
    }

    const headerStr = base64UrlToString(headerB64u);
    const payloadStr = base64UrlToString(payloadB64u)

    const header = safeJsonParse(headerStr)
    const payload = safeJsonParse(payloadStr)

    const timestamps: JwtDecodeResult["timestamps"] = {}
    if(payload && typeof payload === "object" && !Array.isArray(payload)) {
        const p = payload as Record<string, unknown>

        for(const key of ["iat", "exp", "nbf"] as const) {
            const v = asUnixSeconds(p[key])
            if(v != null) {
                timestamps[key] = {
                    unixSeconds: v,
                    iso: new Date(v * 1000).toISOString()
                }
            }
        }
    }

    const hasAnyTimestamps = timestamps.iat || timestamps.exp || timestamps.nbf
    return  {
        note: "This endpoint only decodes Base64URL segments. It does NOT verify the signature.",
        token: { headerB64u, payloadB64u, signatureB64u },
        header,
        payload,
        ...(hasAnyTimestamps ? { timestamps } : {})
    }
    
}