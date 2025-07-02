const nodemailer = require('nodemailer');
const logger = require('../util/logger');

class EmailService {
    constructor(config) {
        this.config = config;
        this.transporter = nodemailer.createTransport({
            host: this.config.email.host,
            port: this.config.email.port,
            secure: this.config.email.secure,
            auth: {
                user: this.config.email.user,
                pass: this.config.email.pass
            }
        });
        this.from = this.config.email.from;
        this.to = this.config.email.to;
    }

    async sendReportEmail(report, reportType) {
        try {
            await this.transporter.sendMail({
                from: this.from,
                to: this.to,
                subject: report.subject,
                html: report.body
            });
            logger.info(`Sent ${reportType} report email successfully`);
        } catch (error) {
            logger.error('Error sending email:', error.message);
            throw error;
        }
    }
}

module.exports = { EmailService };