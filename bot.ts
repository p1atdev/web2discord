import { Bot, createBot, Intents, Message, startBot, stopBot } from "./deps.ts"
import { Secret } from "./secret.ts"

export class PipeBot {
    private bot: Bot

    constructor() {
        this.bot = createBot({
            token: Secret.DISCORD_TOKEN,
            intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
            events: {
                ready() {
                    console.log("Successfully connected to gateway")
                },
            },
        })

        this.bot.events.messageCreate = this.onMessage.bind(this)
    }

    async start() {
        await startBot(this.bot)
    }

    async stop() {
        await stopBot(this.bot)
    }

    private onMessage(b: Bot, m: Message) {
        if (m.channelId.toString() !== Secret.PIPE_CHANNEL_ID) {
            return
        }
        console.log(m.tag, m.content)
    }
}
