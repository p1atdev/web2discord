import { Secret } from "../secret.ts"
import { assertExists } from "../deps.ts"

Deno.test("discord token", () => {
    assertExists(Secret.DISCORD_TOKEN)
})

Deno.test("pipe channel id", () => {
    assertExists(Secret.PIPE_CHANNEL_ID)
})

Deno.test("webhook url", () => {
    assertExists(Secret.WEBHOOK_URL)
})
