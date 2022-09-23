import { StandardWebSocketClient } from "../deps.ts"
import { GetMessageProtocol, HelloProtocol, PostMessageProtocol } from "../protocol.ts"

const connectionId = "1234"

await fetch("http://localhost:8000/auth", {
    method: "POST",
    body: JSON.stringify({
        token: "test",
        id: connectionId,
    }),
})

const ws = new StandardWebSocketClient("ws://127.0.0.1:8080")

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
