const schedule = require('node-schedule');
const config = require('../config/config');
const logger = require('./logger');

class ScheduleManager {
    constructor(reportCallback) {
        this.reportCallback = reportCallback;
    }

    startSchedules() {
        // Daily report: Every day at 9 AM
        schedule.scheduleJob(config.app.dsrCronExpression, () => {
            logger.info('DSR report scheduled!!', config.app.dsrCronExpression);
            this.reportCallback('daily');
        });

        // // Weekly report: Every Monday at 9 AM
        // schedule.scheduleJob(config.app.wsrCrontExpression, () => {
        //     this.reportCallback('weekly');
        // });

        // // Monthly report: First day of month at 9 AM
        // schedule.scheduleJob(config.app.msrCronExpression, () => {
        //     this.reportCallback('monthly');
        // });

        // // Quarterly report: First day of Jan, Apr, Jul, Oct at 9 AM
        // schedule.scheduleJob(config.app.qsrCronExpression, () => {
        //     this.reportCallback('quarterly');
        // });
    }
}

module.exports = { ScheduleManager };