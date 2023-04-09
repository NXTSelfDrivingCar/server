import { EmailMessage } from "./messageModel";
import { LogHandler } from "../logging/logHandler";

// Nodemaler
import * as nodemailer from "nodemailer";

const logger = new LogHandler();

export class EmailHandler {

    private static user: string;
    private static pass: string;

    private static transporter: nodemailer.Transporter;

    private logData: any;

    constructor(user: string, pass: string) {
        EmailHandler.user = user;
        EmailHandler.pass = pass;
    }

    public init(): void {
        this.logData = {
            origin: "EmailHandler",
            action: "init",
            message: "Initializing email handler",
            auth: {
                user: EmailHandler.user,
                pass: EmailHandler.pass
            },
        }

        EmailHandler.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: EmailHandler.user,
                pass: EmailHandler.pass
            }
        });

        EmailHandler.transporter.verify((error, success) => {
            if (error) {
                console.log("Error while verifying email handler");
                this.logData.error = error.message;
                logger.error(this.logData);
            } else {
                console.log("Server is ready to take our messages");
                logger.info(this.logData);
            }
        });
    }

    public static async sendEmail(message: EmailMessage): Promise<any> {
        return await EmailHandler.transporter.sendMail({
            from: EmailHandler.getFrom(),
            to: message.to,
            subject: message.subject,
            text: message.text
        });
    }

    private static getFrom(): string {
        return EmailHandler.user;
    }
}