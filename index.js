require('dotenv').config();
const { ReportGenerator } = require('./src/service/reportGeneratorService');
const { EmailService } = require('./src/service/emailService');
const { ScheduleManager } = require('./src/util/scheduleManager');
const config = require('./src/config/config');
const { JiraClient } = require('./src/util/jiraClient');
const logger = require('./src/util/logger');

class AIAgent {
    constructor() {
        this.jiraClient = new JiraClient(config.jira);
        this.reportGenerator = new ReportGenerator();
        this.emailService = new EmailService(config.email);
        this.scheduleManager = new ScheduleManager(this.runReport.bind(this));
    }

    async runReport(reportType = 'weekly') {
        try {
            // Fetch user stories for current sprint
            // const stories = await this.jiraClient.getCurrentSprintStories();

            const stories = await this.jiraClient.getSprintIssuesByInterval(reportType);
            
            // Generate report
            const report = await this.reportGenerator.generateReport(stories, reportType);
            
            // Send email
            // await this.emailService.sendReportEmail(report, reportType);
            
            logger.info(`Successfully generated and sent ${reportType} report`);
            return report;
        } catch (error) {
            logger.error(`Error generating ${reportType} report:`, error);
            throw error;
        }
    }

    start() {
        // Start scheduled reports
        this.scheduleManager.startSchedules();
        logger.info('AI Agent started with scheduled reports');
    }
}

// Initialize and start the agent
const agent = new AIAgent();
agent.start();

module.exports = { AIAgent };