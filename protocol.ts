export interface StreamData {
    id: string
}

export interface StreamProtocol {
    type: "Hello" | "Get" | "Post" | "Update" | "Error" | "Ok" | "Ready"
    data: StreamData
}

export interface ReadyProtocol extends StreamProtocol {
    type: "Ready"
    data: {
        id: string
    }
}

export interface HelloProtocol extends StreamProtocol {
    type: "Hello"
    data: {
        id: string
        // password: string
    }
}

export interface GetProtocol extends StreamProtocol {
    type: "Get"
    data: {
        id: string
        target: "Messages" | "Users"
    }
}

export interface GetUsersProtocol extends GetProtocol {
    type: "Get"
    data: {
        id: string
        target: "Users"
    } & unknown
}

export interface GetMessageProtocol extends GetProtocol {
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

export interface UpdateProtocol extends StreamProtocol {
    type: "Update"
    data: {
        id: string
        target: "Messages" | "Users"
    } & unknown
}

export interface UpdateMessageProtocol extends UpdateProtocol {
    type: "Update"
    data: {
        id: string
        target: "Messages"
        messages: MessageProtocol[]
    }
}

export interface UpdateUserProtocol extends UpdateProtocol {
    type: "Update"
    data: {
        id: string
        target: "Users"
        users: UserProtocol[]
    }
}

export interface UserProtocol {
    id: string
    username: string
    icon: string
}

export interface MessageProtocol {
    id: string
    date: string
    authorId: string
    content: string
    tag: string
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

export interface AuthRequest {
    token: string
    id: string
}
