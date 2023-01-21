import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export class HttpServerConfig {
  public static HOST: any = process.env.HTTP_SERVER_HOST;
  public static PORT: any = process.env.HTTP_SERVER_PORT;
  public static CONNECTION: any = `${process.env.HTTP_SERVER_HOST}:${process.env.HTTP_SERVER_PORT}`;
}
