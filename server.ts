import { PipeBot } from "./bot.ts"
import { serve, getCookies } from "./deps.ts"
import { Secret } from "./secret.ts"
import { StreamServer } from "./stream.ts"

export class PipeServer {
    hostname: string
    port: number

    constructor(hostname?: string, port?: number) {
        this.hostname = hostname || "0.0.0.0"
        this.port = port || 8000
    }

    start(pipe: StreamServer, bot: PipeBot) {
        const handler = async (req: Request) => {
            const path = new URL(req.url).pathname

            switch (path) {
                case "/auth": {
                    const cookies = getCookies(req.headers)
                    const token = cookies["token"]

                    if (token === Secret.PIPE_TOKEN) {
                        const id = cookies["client_id"]

                        if (id) {
                            pipe.addAllowList(id)
                            return new Response(JSON.stringify({ status: "ok", id: id }), {
                                status: 200,
                            })
                        } else {
                            const randomId = Math.random().toString(36).substring(7)
                            pipe.addAllowList(randomId)
                            return new Response(JSON.stringify({ status: "ok", id: randomId }), {
                                status: 200,
                                headers: new Headers({
                                    "Set-Cookie": `client_id=${randomId}`,
                                }),
                            })
                        }
                    } else {
                        const body = await req.text()
                        if (body.length > 0) {
                            const json = JSON.parse(body)
                            if (json.token === Secret.PIPE_TOKEN) {
                                const randomId = Math.random().toString(36).substring(7)
                                pipe.addAllowList(randomId)
                                return new Response(JSON.stringify({ status: "ok", id: randomId }), {
                                    status: 200,
                                    headers: new Headers({
                                        "Set-Cookie": `client_id=${randomId}`,
                                    }),
                                })
                            }
                        }

                        return new Response(JSON.stringify({ status: "error", message: "Invalid token" }), {
                            status: 401,
                        })
                    }
                }
                case "/stream": {
                    const upgrade = req.headers.get("upgrade") || ""

                    console.log(upgrade)

                    try {
                        const { response, socket } = Deno.upgradeWebSocket(req)

                        pipe.handleWebSocket(pipe, bot, socket)

                        return response
                    } catch {
                        return new Response("request isn't trying to upgrade to websocket.")
                    }
                }

                default: {
                    return new Response("404 Not Found", {
                        status: 404,
                    })
                }
            }
        }

        // const app = new hono.Hono()

        // app.get("/", (c) => c.text("Hono!!"))

        // app.post("/auth", (c) => {
        //     // const json: AuthRequest = await c.req.json()
        //     const token = c.req.cookie("token")

        //     if (token === Secret.PIPE_TOKEN) {
        //         const id = c.req.cookie("client_id")

        //         if (id) {
        //             pipe.addAllowList(id)
        //             return c.json({
        //                 status: "ok",
        //                 id: id,
        //             })
        //         } else {
        //             const randomId = Math.random().toString(36).substring(7)
        //             pipe.addAllowList(randomId)
        //             c.res.headers.append("Set-Cookie", `client_id=${randomId}`)
        //             return c.json({
        //                 status: "ok",
        //                 id: randomId,
        //             })
        //         }
        //     } else {
        //         return c.json({ status: "error", message: "Invalid token" }, 401)
        //     }
        // })

        serve(handler, { hostname: this.hostname, port: this.port })
    }
}
