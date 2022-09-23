import { StandardWebSocketClient } from "../deps.ts"
import { HelloProtocol } from "../protocol.ts"

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
})

ws.on("message", (m) => {
    console.log(m)
})
