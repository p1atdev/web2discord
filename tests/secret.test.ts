import { Secret } from "../secret.ts"
import { assertExists } from "../deps.ts"

Deno.test("discord token", () => {
    assertExists(Secret.DISCORD_TOKEN)
})

Deno.test("pipe channel id", () => {
    assertExists(Secret.PIPE_CHANNEL_ID)
})

Deno.test("webhook id", () => {
    assertExists(Secret.WEBHOOK_ID)
})

Deno.test("webhook token", () => {
    assertExists(Secret.WEBHOOK_TOKEN)
})
