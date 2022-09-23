import { dotenv } from "./deps.ts"
await dotenv.config({ path: ".env.local", export: true })

export class Secret {
    // static load = async (path?: string) => {
    //     await dotenv.config({ path: path, export: true })
    // }
    static DISCORD_TOKEN = Deno.env.get("DISCORD_TOKEN")!
    static PIPE_CHANNEL_ID = Deno.env.get("PIPE_CHANNEL_ID")!
    static WEBHOOK_ID = Deno.env.get("WEBHOOK_ID")!
    static WEBHOOK_TOKEN = Deno.env.get("WEBHOOK_TOKEN")!
    static PIPE_TOKEN = Deno.env.get("PIPE_TOKEN")!
}
