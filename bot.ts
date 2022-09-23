import { getAlterName } from "./alter_name.ts"
import { Bot, createBot, Intents, Message, startBot, stopBot } from "./deps.ts"
import { PostMessageProtocol } from "./protocol.ts"
import { Secret } from "./secret.ts"
import { StreamServer } from "./stream.ts"

export class PipeBot {
    private bot: Bot
    streamServer: StreamServer

    constructor(streamServer: StreamServer) {
        this.bot = createBot({
            token: Secret.DISCORD_TOKEN,
            intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent | Intents.GuildMembers,
            events: {
                ready() {
                    console.log("Successfully connected to gateway")
                },
            },
        })

        this.bot.events.messageCreate = this.onMessage.bind(this)

        this.streamServer = streamServer
    }

    async start() {
        await startBot(this.bot)
    }

    async stop() {
        await stopBot(this.bot)
    }

    private onMessage(_b: Bot, m: Message) {
        if (m.channelId.toString() !== Secret.PIPE_CHANNEL_ID) {
            return
        }
        console.log(m.tag, m.content)
        this.streamServer.broadcast({
            id: m.id.toString(),
            authorId: m.authorId.toString(),
            content: m.content,
            date: m.timestamp.toString(),
            tag: m.tag,
        })
    }

    getMessages = async (count: number, before?: string) => {
        if (before) {
            return await this.bot.helpers.getMessages(Secret.PIPE_CHANNEL_ID, {
                before: before,
                limit: count,
            })
        } else {
            return await this.bot.helpers.getMessages(Secret.PIPE_CHANNEL_ID, {
                limit: count,
            })
        }
    }

    getUsers = async () => {
        const users = await this.bot.helpers.getMembers(Secret.PIPE_GUILD_ID, { limit: 100 })
        return users.map((user) => {
            const alter = getAlterName(user.id.toString())

            if (alter) {
                return {
                    ...user,
                    user: {
                        ...user.user,
                        username: alter,
                    },
                }
            } else {
                return user
            }
        })
    }

    sendMessage = async (payload: PostMessageProtocol) => {
        await this.bot.helpers.sendWebhookMessage(Secret.WEBHOOK_ID, Secret.WEBHOOK_TOKEN, {
            username: payload.data.username,
            content: payload.data.message,
        })
    }
}
