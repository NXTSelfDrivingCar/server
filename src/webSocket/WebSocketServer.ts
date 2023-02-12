import { WebSocket } from "./WebSocket";
import { createServer } from "http";

export class WebSocketServer {
    private httpServer: any;
    private io: WebSocket;

    constructor(httpServer: any) {
        this.httpServer = createServer(httpServer);
        this.io = WebSocket.getInstance(this.httpServer);
    }

    public init(port: number){
        this.httpServer.listen(port, () => {
            console.log(`WebSocket Server listening on port ${port}`);
        });
    }

    public getIO(): WebSocket {
        return this.io;
    }
}