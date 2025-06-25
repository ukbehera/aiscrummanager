const nodemailer = require('nodemailer');
const logger = require('../util/logger');

class EmailService {
    constructor(config) {
        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.user,
                pass: config.pass
            }
        });
        this.from = config.from;
        this.to = config.to;
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