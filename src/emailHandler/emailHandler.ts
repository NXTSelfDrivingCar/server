import { EmailMessage } from "./messageModel";

// Nodemaler
import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "akitasevski113@gmail.com",
        pass: "skofigbukcdratsf"
    }
});


export class EmailHandler {

    private static user: string;
    private static pass: string;

    private static transporter: any;

    constructor(user: string, pass: string) {
        EmailHandler.user = user;
        EmailHandler.pass = pass;
    }

    public init(): void {
        EmailHandler.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: EmailHandler.user,
                pass: EmailHandler.pass
            }
        });

        transporter.verify((error, success) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Server is ready to take our messages");
            }
        });
    }

    public static async sendEmail(message: EmailMessage): Promise<any> {
        return await transporter.sendMail({
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