import { PipeServer } from "./server.ts"
import { PipeBot } from "./bot.ts"
import { StreamServer } from "./stream.ts"
import { Secret } from "./secret.ts"

const server = new PipeServer()
const stream = new StreamServer()
const bot = new PipeBot(stream)

server.start(stream, bot)
bot.start()

console.log("Secret:", Secret)
