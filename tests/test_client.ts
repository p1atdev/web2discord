import { StandardWebSocketClient } from "../deps.ts"
import { GetMessageProtocol, HelloProtocol } from "../protocol.ts"

const ws = new StandardWebSocketClient("ws://127.0.0.1:8080")

ws.on("open", async () => {
    console.log("ws connected!")
    const hello: HelloProtocol = {
        type: "Hello",
        data: {
            id: "1234",
        },
    }

    await ws.send(JSON.stringify(hello))

    const get: GetMessageProtocol = {
        type: "Get",
        data: {
            id: "1234",
            target: "Messages",
            count: 10,
        },
    }

    await ws.send(JSON.stringify(get))
})

ws.on("message", (m) => {
    console.log(m.data)
})
