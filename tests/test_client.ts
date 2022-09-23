import { StandardWebSocketClient } from "../deps.ts"
import { GetMessageProtocol, HelloProtocol, PostMessageProtocol } from "../protocol.ts"

const res = await fetch("http://localhost:8000/auth", {
    method: "POST",
    headers: {
        Cookie: `token=test`,
    },
})

const json = await res.json()

const connectionId = json.id

const ws = new StandardWebSocketClient("ws://localhost:8080")

ws.on("open", async () => {
    console.log("ws connected!")
    const hello: HelloProtocol = {
        type: "Hello",
        data: {
            id: connectionId,
        },
    }

    await ws.send(JSON.stringify(hello))

    const get: GetMessageProtocol = {
        type: "Get",
        data: {
            id: connectionId,
            target: "Messages",
            count: 10,
        },
    }

    await ws.send(JSON.stringify(get))

    const post: PostMessageProtocol = {
        type: "Post",
        data: {
            id: connectionId,
            target: "Message",
            username: "TEST_USER",
            message: "test message",
        },
    }

    await ws.send(JSON.stringify(post))
})

ws.on("message", (m) => {
    console.log(m.data)
})
