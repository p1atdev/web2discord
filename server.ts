import { serve, hono } from "./deps.ts"

export class PipeServer {
    hostname: string
    port: number

    constructor(hostname?: string, port?: number) {
        this.hostname = hostname || "0.0.0.0"
        this.port = port || 8000
    }

    start() {
        const app = new hono.Hono()

        app.get("/", (c) => c.text("Hono!!"))

        serve(app.fetch, { hostname: this.hostname, port: this.port })
    }
}
