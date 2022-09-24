import { PipeBot } from "./bot.ts"
import { serve, getCookies } from "./deps.ts"
import { Secret } from "./secret.ts"
import { SharedSession } from "./shared.ts"
import { StreamServer } from "./stream.ts"

export class PipeServer {
    hostname: string
    port: number

    shared: SharedSession

    constructor(shared: SharedSession, hostname?: string, port?: number) {
        this.shared = shared
        this.hostname = hostname || "0.0.0.0"
        this.port = port || 8000
    }

    start(pipe: StreamServer, bot: PipeBot) {
        const handler = async (req: Request) => {
            const path = new URL(req.url).pathname

            console.log("Request: ", path)
            console.log("Method: ", req.method)

            switch (path) {
                case "/auth": {
                    if (req.method !== "POST") {
                        return new Response("Method not allowed", {
                            status: 405,
                        })
                    }

                    const cookies = getCookies(req.headers)
                    const token = cookies["token"]

                    if (token === Secret.PIPE_TOKEN) {
                        console.log("Authed with cookie token")
                        const id = cookies["client_id"]

                        if (id) {
                            console.log("client_id found:", id)
                            this.shared.addAllowList(id)
                            console.log("current allowed list:", this.shared.allowList)
                            return new Response(JSON.stringify({ status: "ok", id: id }), {
                                status: 200,
                            })
                        } else {
                            console.log("client_id not found")
                            const randomId = Math.random().toString(36).substring(7)
                            console.log("generated client_id:", randomId)
                            this.shared.addAllowList(randomId)
                            console.log("current allowed list:", this.shared.allowList)
                            return new Response(JSON.stringify({ status: "ok", id: randomId }), {
                                status: 200,
                                headers: new Headers({
                                    "Set-Cookie": `client_id=${randomId}; HttpOnly; SameSite=None; Secure`,
                                }),
                            })
                        }
                    } else {
                        console.log("Not authed")

                        const body = await req.text()
                        if (body.length > 0) {
                            const json = JSON.parse(body)
                            if (json.token === Secret.PIPE_TOKEN) {
                                console.log("Authed with json token")
                                const randomId = Math.random().toString(36).substring(7)
                                this.shared.addAllowList(randomId)
                                return new Response(JSON.stringify({ status: "ok", id: randomId }), {
                                    status: 200,
                                    headers: new Headers({
                                        "Set-Cookie": `client_id=${randomId}; HttpOnly; SameSite=None; Secure`,
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

                        pipe.handleWebSocket(bot, socket)

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

        serve(handler, { hostname: this.hostname, port: this.port })
    }
}
