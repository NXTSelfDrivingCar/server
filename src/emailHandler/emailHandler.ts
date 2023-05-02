import { EmailMessage } from "./messageModel";
import { LogHandler } from "../logging/logHandler";

// Nodemaler
import * as nodemailer from "nodemailer";

const logger = new LogHandler();

export class EmailHandler {

    private user: string = "";
    private pass: string = "";

    private transporter: nodemailer.Transporter = null as any;

    private logData: any;

    private static instance: EmailHandler;

    public static getInstance(): EmailHandler {
        if (!EmailHandler.instance) {
            EmailHandler.instance = new EmailHandler();
        }

        return EmailHandler.instance;
    }


    public async init() {
        this.logData = {
            origin: "EmailHandler",
            action: "init",
            message: "Initializing email handler",
            auth: {
                user: this.user,
                pass: this.pass
            },
        }

        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: this.user,
                pass: this.pass
            }
        });
        
        return new Promise((resolve, reject) => {
            this.transporter.verify((error, success) => {
                if (error) {
                    this.logData.error = error.message;
                    logger.error(this.logData);
                    reject(error);
                } else {
                    logger.info(this.logData);
                    resolve(success);
                }
            });
        });

    }

    public setUser(user: string): void {
        this.user = user;
    }

    public setPass(pass: string): void {
        this.pass = pass;
    }

    public async sendEmail(message: EmailMessage): Promise<any> {
        this.logData = {
            origin: "EmailHandler",
            action: "sendingEmail",
            message: "Sending email to account",
            auth: {
                user: this.user,
                pass: this.pass
            },
            email: {
                from: this.getFrom(),
                to: message.to,
                subject: message.subject,
                text: message.text
            }            
        }
        try{
            return await this.transporter.sendMail({
                from: this.getFrom(),
                to: message.to,
                subject: message.subject,
                text: message.text
            });
        }catch(err){
            this.logData.method = "sendEmail";
            this.logData.error = err;
            logger.error(this.logData);
        }
    }

    private getFrom(): string {
        return this.user;
    }
}