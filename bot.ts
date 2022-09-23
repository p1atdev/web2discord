import { createBot, Intents, startBot } from "./deps.ts"
import { Secret } from "./secret.ts"

const bot = createBot({
    token: Secret.DISCORD_TOKEN,
    intents: Intents.Guilds | Intents.GuildMessages | Intents.GuildMembers,
    events: {
        ready() {
            console.log("Successfully connected to gateway")
        },
    },
})

bot.events.messageCreate = (b, m) => {}

await startBot(bot)
