import { Server } from "socket.io";

const WEBSOCKET_CORS = {
    origin: "*",
    methods: ["GET", "POST"],
};

export class WebSocket extends Server {
    private static io: WebSocket;

    constructor(httpServer: any) {
        super(httpServer, {
            cors: WEBSOCKET_CORS,
        });
    }

    public static getInstance(httpServer: any): WebSocket {
        if (!WebSocket.io) {
            WebSocket.io = new WebSocket(httpServer);
        }
        return WebSocket.io;
    }

    public getIO(): WebSocket {
        return WebSocket.io;
    }
}