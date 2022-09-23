import { PipeServer } from "./server.ts"
import { PipeBot } from "./bot.ts"

const server = new PipeServer()
const bot = new PipeBot()

server.start()
bot.start()
