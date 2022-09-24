import { PipeServer } from "./server.ts"
import { PipeBot } from "./bot.ts"
import { StreamServer } from "./stream.ts"

const server = new PipeServer()
const stream = new StreamServer()
const bot = new PipeBot(stream)

server.start(stream, bot)
// stream.start(stream, bot)
bot.start()
