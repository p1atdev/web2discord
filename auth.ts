import { jwt } from "./deps.ts"

export class Auth {
    key?: CryptoKey
    header: jwt.Header = {
        alg: "HS256",
        typ: "JWT",
    }

    setup = async () => {
        await this.generateKey()
    }

    private generateKey = async () => {
        this.key = await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-256" }, true, ["sign", "verify"])
    }

    createPayload = async (content: jwt.Payload) => {
        return await jwt.create(this.header, content, this.key!)
    }

    verifyPayload = async (payload: string) => {
        return await jwt.verify(payload, this.key!)
    }
}
