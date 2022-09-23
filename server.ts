import { serve, hono } from "./deps.ts"
import { AuthRequest } from "./protocol.ts"
import { StreamServer } from "./stream.ts"

export class PipeServer {
    hostname: string
    port: number

    constructor(hostname?: string, port?: number) {
        this.hostname = hostname || "0.0.0.0"
        this.port = port || 8000
    }

    start(pipe: StreamServer) {
        const app = new hono.Hono()

        app.get("/", (c) => c.text("Hono!!"))

        app.post("/auth", async (c) => {
            const json: AuthRequest = await c.req.json()
            if (json.token) {
                c.text("ok")
                pipe.addAllowList(json.id)
            } else {
                c.json({ error: "Invalid token" }, 401)
            }
        })

        serve(app.fetch, { hostname: this.hostname, port: this.port })
    }
}
