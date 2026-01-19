"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
class NotificationService {
    async sendEmail(options) {
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
    async sendEventInvitation(email, eventTitle, eventDate) {
        return this.sendEmail({
            to: email,
            subject: `Undangan Event: ${eventTitle}`,
            text: `Halo, Anda telah terdaftar untuk event "${eventTitle}" yang akan dilaksanakan pada ${eventDate}. Sampai jumpa!`
        });
    }
    async sendRegistrationConfirmation(email, eventTitle) {
        return this.sendEmail({
            to: email,
            subject: `Konfirmasi Pendaftaran Event: ${eventTitle}`,
            text: `Pendaftaran Anda untuk event "${eventTitle}" telah berhasil. Terima kasih telah mendaftar.`
        });
    }
}
exports.NotificationService = NotificationService;
