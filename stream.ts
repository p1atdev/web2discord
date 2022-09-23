import { WebSocketServer, WebSocketClient } from "./deps.ts"
import {
    ErrorProtocol,
    GetMessageProtocol,
    HelloProtocol,
    MessageProtocol,
    OkProtocol,
    PostMessageProtocol,
    StreamProtocol,
    UpdateMessageProtocol,
} from "./protocol.ts"

export class StreamServer {
    wss: WebSocketServer
    clients: Map<string, WebSocketClient> = new Map()
    allowList: string[] = ["1234"]

    constructor(port?: number) {
        this.wss = new WebSocketServer(port ?? 8080)
    }

    start(self: StreamServer) {
        console.log("Stream server started")

        this.wss.on("connection", function (ws: WebSocketClient) {
            console.log("ws connected!")

            ws.on("message", function (message: string) {
                try {
                    const payload: StreamProtocol = JSON.parse(message)
                    console.log(payload)

                    switch (payload.type) {
                        case "Hello": {
                            const hello: HelloProtocol = payload as HelloProtocol
                            if (!self.isAllowed(hello.data.id)) {
                                ws.send(JSON.stringify(StreamServer.Error(hello.data.id, "Not allowed")))
                                break
                            }
                            self.clients.set(hello.data.id, ws)
                            console.log("Client connected:", hello.data.id)
                            ws.send(JSON.stringify(StreamServer.Ok(hello.data.id)))

                            break
                        }
                        case "Get": {
                            const get: GetMessageProtocol = payload as GetMessageProtocol

                            if (!self.isAllowed(get.data.id)) {
                                ws.send(JSON.stringify(StreamServer.Error(get.data.id, "Not allowed")))
                                break
                            }

                            self.clients.set(get.data.id, ws)
                            console.log("Client wants to get messages:", get.data.id)

                            break
                        }
                        case "Post": {
                            const post: PostMessageProtocol = payload as PostMessageProtocol

                            if (!self.isAllowed(post.data.id)) {
                                ws.send(JSON.stringify(StreamServer.Error(post.data.id, "Not allowed")))
                                break
                            }

                            self.clients.set(post.data.id, ws)
                            console.log("Client wants to post messages:", post.data.id)

                            break
                        }
                        default: {
                            const error = StreamServer.Error(payload.data.id, "Unknown type")
                            ws.send(JSON.stringify(error))
                        }
                    }
                } catch {
                    console.log("Invalid message: ", message)
                    ws.send(JSON.stringify(StreamServer.Error("-1", "Invalid message")))
                    ws.close(1000, "Invalid message")
                }
            })
        })
    }

    addAllowList(id: string) {
        this.allowList.push(id)
    }

    isAllowed(id: string) {
        return this.allowList.includes(id)
    }

    broadcast(message: MessageProtocol) {
        this.clients.forEach((client) => {
            const update: UpdateMessageProtocol = {
                type: "Update",
                data: {
                    id: "1234",
                    target: "Messages",
                    messages: [message],
                },
            }
            client.send(JSON.stringify(update))
        })
    }

    static Error = (id: string, message: string): ErrorProtocol => {
        return {
            type: "Error",
            data: {
                id: id,
                message: message,
            },
        }
    }

    static Ok = (id: string): OkProtocol => {
        return {
            type: "Ok",
            data: {
                id: id,
            },
        }
    }
}
