import dotenv from "dotenv";
dotenv.config({ path: ".env" });


export class EmailConfig{
    public static USER: any = process.env.EMAIL_AUTH_USER;
    public static PASS: any = process.env.EMAIL_AUTH_PASS;
}