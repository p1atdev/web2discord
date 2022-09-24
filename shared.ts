export class SharedSession {
    clients: Map<string, WebSocket> = new Map()
    allowList: string[] = []

    addAllowList(id: string) {
        this.allowList.push(id)
    }

    isAllowed(id: string) {
        return this.allowList.includes(id)
    }
}
