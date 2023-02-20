import { WebSocket } from "./WebSocket";
import { createServer } from "http";
import { LogHandler } from "../logging/logHandler";

const logger = new LogHandler();
export class WebSocketServer {
    private httpServer: any;
    private io: WebSocket;

    constructor(httpServer: any) {
        this.httpServer = createServer(httpServer);
        this.io = WebSocket.getInstance(this.httpServer);
    }

    public init(port: number){
        
        logger.info({
            origin: "WebSocketServer",
            action: "init",
            details: { serverType: "WebSocketServer", port: port },
        })

        this.httpServer.listen(port, () => {
            console.log(`WebSocket Server listening on port ${port}`);
        });
    }

    public getIO(): WebSocket {
        return this.io;
    }
}