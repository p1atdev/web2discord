import { Auth } from "../auth.ts"
import { assertEquals, assertExists, assertRejects } from "../deps.ts"

Deno.test("auth key", async () => {
    const auth = new Auth()
    await auth.setup()
    assertExists(auth.key)
    console.log(auth.key)
})

Deno.test("create and verify payload", async () => {
    const auth = new Auth()
    await auth.setup()

    const content = { foo: "bar" }

    const payload = await auth.createPayload(content)
    const verified = await auth.verifyPayload(payload)

    assertEquals(verified, content)
})

Deno.test("failed to verify payload", async () => {
    const auth = new Auth()
    await auth.setup()

    const content = { foo: "bar" }

    const payload = await auth.createPayload(content)

    const auth2 = new Auth()
    await auth2.setup()

    assertRejects(async () => {
        await auth2.verifyPayload(payload)
    })
})
