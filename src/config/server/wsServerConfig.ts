import dotenv from "dotenv";
dotenv.config({ path: ".env" });

export class WSSConfig {
    public static URL: any = process.env.WS_SERVER_HOST;
    public static PORT: any = process.env.WS_SERVER_PORT;
    public static CONNECTION: any = `${process.env.WS_SERVER_HOST}:${process.env.WS_SERVER_PORT}`;
}