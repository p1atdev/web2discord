import { PipeBot } from "./bot.ts"
import {
    ErrorProtocol,
    getAttachmentType,
    GetMessageProtocol,
    GetProtocol,
    HelloProtocol,
    MessageProtocol,
    OkProtocol,
    PostMessageProtocol,
    ReadyProtocol,
    StreamProtocol,
    UpdateMessageProtocol,
    UpdateUserProtocol,
    UserProtocol,
} from "./protocol.ts"

export class StreamServer {
    clients: Map<string, WebSocket> = new Map()
    allowList: string[] = []

    handleWebSocket(pipe: PipeBot, ws: WebSocket) {
        console.log("Stream server started")

        ws.onmessage = async (event) => {
            const message = event.data as string

            try {
                const payload: StreamProtocol = JSON.parse(message)
                console.log(payload)
                console.log("Allowed list:", this.allowList)

                switch (payload.type) {
                    case "Hello": {
                        const hello: HelloProtocol = payload as HelloProtocol
                        if (!this.isAllowed(hello.data.id)) {
                            ws.send(JSON.stringify(StreamServer.Error(hello.data.id, "Not allowed")))
                            break
                        }
                        this.clients.set(hello.data.id, ws)
                        console.log("Client connected:", hello.data.id)
                        ws.send(JSON.stringify(StreamServer.Ok(hello.data.id)))

                        break
                    }
                    case "Get": {
                        const get: GetProtocol = payload as GetProtocol

                        switch (get.data.target) {
                            case "Messages": {
                                const getM: GetMessageProtocol = get as GetMessageProtocol
                                if (!this.isAllowed(get.data.id)) {
                                    ws.send(JSON.stringify(StreamServer.Error(get.data.id, "Not allowed")))
                                    break
                                }

                                console.log("Client wants to get messages:", get.data.id)

                                const messages = await this.getMessages(pipe, getM.data.count)
                                const update: UpdateMessageProtocol = {
                                    type: "Update",
                                    data: {
                                        id: "1234",
                                        target: "Messages",
                                        messages: messages,
                                    },
                                }
                                ws.send(JSON.stringify(update))
                                break
                            }
                            case "Users": {
                                if (!this.isAllowed(get.data.id)) {
                                    ws.send(JSON.stringify(StreamServer.Error(get.data.id, "Not allowed")))
                                    break
                                }

                                console.log("Client wants to get users:", get.data.id)

                                const users = await this.getUsers(pipe)
                                const update: UpdateUserProtocol = {
                                    type: "Update",
                                    data: {
                                        id: get.data.id,
                                        target: "Users",
                                        users: users,
                                    },
                                }
                                ws.send(JSON.stringify(update))
                                break
                            }
                            default: {
                                break
                            }
                        }

                        break
                    }
                    case "Post": {
                        const post: PostMessageProtocol = payload as PostMessageProtocol

                        if (!this.isAllowed(post.data.id)) {
                            ws.send(JSON.stringify(StreamServer.Error(post.data.id, "Not allowed")))
                            break
                        }

                        console.log("Client wants to post messages:", post.data.id)

                        await this.sendMessage(pipe, post)

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
        }

        ws.onclose = () => {
            this.disconnected(ws)
        }

        ws.onerror = (err) => {
            console.log("Error:", err)
            this.disconnected(ws)
        }
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

    getMessages = async (pipe: PipeBot, count: number, before?: string): Promise<MessageProtocol[]> => {
        const messages = await pipe.getMessages(count, before)
        return messages.map((message) => {
            console.log(message.attachments)
            return {
                id: message.id.toString(),
                date: message.timestamp.toString(),
                authorId: message.authorId.toString(),
                content: message.content,
                tag: message.tag,
                attachments: message.attachments.map((attachment) => {
                    return {
                        id: attachment.id.toString(),
                        type: getAttachmentType(attachment.contentType ?? ""),
                        url: attachment.url,
                    }
                }),
            }
        })
    }

    getUsers = async (pipe: PipeBot): Promise<UserProtocol[]> => {
        const users = await pipe.getUsers()
        console.log("Alternamed users:", users)
        return users.map((user) => {
            return {
                id: user.id.toString(),
                username: user.user?.username ?? "Unknown",
                icon: `https://cdn.discordapp.com/avatars/${user.id}/${user.user?.avatar}.webp`,
            }
        })
    }

    sendMessage = async (pipe: PipeBot, payload: PostMessageProtocol) => {
        await pipe.sendMessage(payload)
    }

    disconnected = (ws: WebSocket) => {
        console.log("ws closed!")
        // get id from clients list
        const id = Array.from(this.clients.keys()).find((key) => this.clients.get(key) === ws)
        if (id) {
            this.clients.delete(id)
            this.allowList = this.allowList.filter((item) => item !== id)
            console.log("Client disconnected:", id)
        }
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

    static Ready = (): ReadyProtocol => {
        return {
            type: "Ready",
            data: { id: "-1" },
        }
    }
}
