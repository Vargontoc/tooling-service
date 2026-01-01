export const env = {
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST ?? "0.0.0.0",
    apiKey: process.env.API_KEY ?? "local-dev-key",
    get allowPrivateTargets() { return (process.env.ALLOW_PRIVATE_TARGETS ?? "false") === "true" }
}