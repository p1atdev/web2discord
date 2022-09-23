export interface StreamData {
    id: string
}

export interface StreamProtocol {
    type: "Hello" | "Get" | "Post" | "Update" | "Error" | "Ok"
    data: StreamData
}

export interface HelloProtocol extends StreamProtocol {
    type: "Hello"
    data: {
        id: string
        // password: string
    }
}

export interface GetMessageProtocol extends StreamProtocol {
    type: "Get"
    data: {
        id: string
        target: "Messages"
        count: number
        before?: string
    }
}

export interface PostMessageProtocol extends StreamProtocol {
    type: "Post"
    data: {
        id: string
        target: "Message"
        username: string
        message: string
    }
}

export interface UpdateMessageProtocol extends StreamProtocol {
    type: "Update"
    data: {
        id: string
        target: "Messages"
        messages: MessageProtocol[]
    }
}

export interface MessageProtocol {
    id: string
    date: string
    authorId: string
    message: string
}

export interface ErrorProtocol extends StreamProtocol {
    type: "Error"
    data: {
        id: string
        message: string
    }
}

export interface OkProtocol extends StreamProtocol {
    type: "Ok"
    data: {
        id: string
    }
}
