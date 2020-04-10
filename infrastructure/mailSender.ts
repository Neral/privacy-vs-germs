import nodemailer from "nodemailer"

export class MailSender {
    constructor(private userName: string, private password: string) { }

    public async SendMail(emailAddress: string, subject: string, htmlBody: string): Promise<void> {
        await nodemailer
            .createTransport({
                service: 'gmail',
                auth: {
                    user: this.userName,
                    pass: this.password
                }
            })
            .sendMail({
                to: emailAddress,
                subject: subject,
                html: htmlBody
            })
    }
}
