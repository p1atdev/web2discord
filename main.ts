import { PipeServer } from "./server.ts"
import { PipeBot } from "./bot.ts"
import { StreamServer } from "./stream.ts"
import { Secret } from "./secret.ts"
import { SharedSession } from "./shared.ts"

const session = new SharedSession()
const server = new PipeServer(session)
const stream = new StreamServer(session)
const bot = new PipeBot(stream)

server.start(stream, bot)
bot.start()

console.log("Secret:", Secret)
