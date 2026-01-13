export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export class NotificationService {
    async sendEmail(options: EmailOptions): Promise<boolean> {
        // In a real application, this would use nodemailer or an email service provider
        // For this MVP phase, we will log the email to the console

        console.log("============================================");
        console.log(`[EMAIL NOTIFICATION]`);
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body: ${options.text}`);
        console.log("============================================");

        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 500));

        return true;
    }

    async sendEventInvitation(email: string, eventTitle: string, eventDate: string) {
        return this.sendEmail({
            to: email,
            subject: `Undangan Event: ${eventTitle}`,
            text: `Halo, Anda telah terdaftar untuk event "${eventTitle}" yang akan dilaksanakan pada ${eventDate}. Sampai jumpa!`
        });
    }

    async sendRegistrationConfirmation(email: string, eventTitle: string) {
        return this.sendEmail({
            to: email,
            subject: `Konfirmasi Pendaftaran Event: ${eventTitle}`,
            text: `Pendaftaran Anda untuk event "${eventTitle}" telah berhasil. Terima kasih telah mendaftar.`
        });
    }
}
