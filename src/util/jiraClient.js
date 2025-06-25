const axios = require("axios");
const logger = require("./logger");
const config = require("../config/config");

class JiraClient {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.auth = {
      username: config.username,
      password: config.apiToken,
    };
  }

  async getCurrentSprintStories() {
    try {
      const apiToken = btoa(`${config.jira.username}:${config.jira.apiToken}`);
      const issueApiOptions = {
        method: "GET",
        url: `${this.baseUrl}/rest/agile/1.0/board/${config.jira.boardId}/sprint`,
        params: { state: "active" },
        headers: {
          authorization: `Basic ${apiToken}`,
        },
      };
      // Get active sprint
      const sprintResponse = await axios.request(issueApiOptions);

      const activeSprint = sprintResponse.data.values[0];
      logger.info(`Active sprint`, activeSprint);
      // Get issues for sprint
      const issuesResponseApiOptions = {
        method: "GET",
        url: `${this.baseUrl}/rest/agile/1.0/sprint/${activeSprint?.id}/issue`,
        headers: {
          authorization: `Basic ${apiToken}`,
        },
      };
      const issuesResponse = await axios.request(issuesResponseApiOptions);
      logger.info("Resp from Jira", issuesResponse?.data);
      return issuesResponse.data.issues.map((issue) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.displayName || "Unassigned",
        storyPoints: issue.fields.customfield_10020 || "Not estimated",
      }));
    } catch (error) {
      logger.error("Error fetching Jira stories:", error.message);
      throw error;
    }
  }
}

module.exports = { JiraClient };
