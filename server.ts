import { serve, hono } from "./deps.ts"
import { Secret } from "./secret.ts"
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

        app.post("/auth", (c) => {
            // const json: AuthRequest = await c.req.json()
            const token = c.req.cookie("token")

            if (token === Secret.PIPE_TOKEN) {
                const id = c.req.cookie("client_id")

                if (id) {
                    pipe.addAllowList(id)
                    return c.json({
                        status: "ok",
                        id: id,
                    })
                } else {
                    const randomId = Math.random().toString(36).substring(7)
                    pipe.addAllowList(randomId)
                    return c.json({
                        status: "ok",
                        id: randomId,
                    })
                }
            } else {
                return c.json({ status: "error", message: "Invalid token" }, 401)
            }
        })

        serve(app.fetch, { hostname: this.hostname, port: this.port })
    }
}
