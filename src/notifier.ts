import nodemailer from 'nodemailer';
import { config } from './config.js';
import { NotificationResult } from './types.js';

export class Notifier {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.secure,
            auth: {
                user: config.email.user,
                pass: config.email.pass,
            },
        });
    }

    async sendEmail(subject: string, htmlContent: string): Promise<NotificationResult> {
        try {
            console.log(`Sending email to ${config.email.to}...`);
            const info = await this.transporter.sendMail({
                from: `"Daily Report" <${config.email.user}>`,
                to: config.email.to,
                subject: subject,
                html: htmlContent,
            });

            console.log('Email sent: %s', info.messageId);
            return { channel: 'email', success: true };
        } catch (error) {
            console.error('Error sending email:', error);
            return { channel: 'email', success: false, error };
        }
    }
}
