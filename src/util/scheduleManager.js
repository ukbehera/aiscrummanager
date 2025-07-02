const schedule = require('node-schedule');
const logger = require('./logger');

class ScheduleManager {
    constructor(reportCallback, config) {
        this.config = config;
        this.reportCallback = reportCallback;
    }

    startSchedules() {
        // Daily report: Every day at 9 AM
        schedule.scheduleJob(this.config.app.dsrCronExpression, () => {
            this.reportCallback('daily');
        });

        // Weekly report: Every Monday at 9 AM
        schedule.scheduleJob(this.config.app.wsrCrontExpression, () => {
            this.reportCallback('weekly');
        });

        // Monthly report: First day of month at 9 AM
        schedule.scheduleJob(this.config.app.msrCronExpression, () => {
            this.reportCallback('monthly');
        });

        // Quarterly report: First day of Jan, Apr, Jul, Oct at 9 AM
        schedule.scheduleJob(this.config.app.qsrCronExpression, () => {
            this.reportCallback('quarterly');
        });
    }
}

module.exports = { ScheduleManager };