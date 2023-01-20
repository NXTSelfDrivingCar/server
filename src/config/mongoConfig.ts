import dotenv from "dotenv";

export class MongoConfig {
  public static URL: any = process.env.MONGODB_URL;
  public static DATABASE: any = process.env.MONGODB_DATABASE;
  public static PORT: any = process.env.MONGODB_PORT;
  public static CONNECTION: any = `${process.env.MONGODB_URL}:${process.env.MONGODB_PORT}`;
  
}
