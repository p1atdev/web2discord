import { JsonErrorCodes } from "./deps.ts"
import { Secret } from "./secret.ts"

export type AlterName = Record<string, string>

export const getAlterName = (id: string): string | undefined => {
    const json: AlterName = JSON.parse(Secret.ALTER_NAME)

    return json[id]
}
