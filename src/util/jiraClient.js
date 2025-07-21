const axios = require("axios");
const logger = require("./logger");
const config = require("../config/config");

class JiraClient {
  constructor(config) {
    this.config = config;
  }

  async getCurrentSprintStories() {
    try {
      const apiToken = btoa(`${this.config.jira.username}:${this.config.jira.apiToken}`);
      const issueApiOptions = {
        method: "GET",
        url: `${this.config.jira.baseUrl}/rest/agile/1.0/board/${this.config.jira.boardId}/sprint`,
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
        url: `${this.config.jira.baseUrl}/rest/agile/1.0/sprint/${activeSprint?.id}/issue`,
        headers: {
          authorization: `Basic ${apiToken}`,
        },
      };
      const issuesResponse = await axios.request(issuesResponseApiOptions);
      // logger.info("Resp from Jira", issuesResponse?.data);
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

  /**
 * Fetch issues assigned to any sprint and updated within the specified interval.
 * @param {'daily'|'weekly'|'monthly'|'quarterly'} interval
 */
async getSprintIssuesByInterval(interval = 'daily') {
  try {
    const apiToken = btoa(`${this.config.jira.username}:${this.config.jira.apiToken}`);
    let jqlInterval;
    switch (interval) {
      case 'daily':
        jqlInterval = '-1d';
        break;
      case 'weekly':
        jqlInterval = '-7d';
        break;
      case 'monthly':
        jqlInterval = '-1M';
        break;
      case 'quarterly':
        jqlInterval = '-3M';
        break;
      default:
        jqlInterval = '-1d';
    }
    // JQL: issues in any sprint, regardless of updated date
    let jql = `project = "${this.config.jira.projectKey}" AND sprint is not EMPTY`;
    if(interval === 'monthly' || interval ==='quarterly') {
      jql = `${jql} AND created >= ${jqlInterval}`;
    }
    const issuesApiOptions = {
      method: "GET",
      url: `${this.config.jira.baseUrl}/rest/api/2/search`,
      params: { jql , expand: "comments"},
      headers: {
        authorization: `Basic ${apiToken}`,
      },
    };
    const issuesResponse = await axios.request(issuesApiOptions);
    // logger.info(`Jira issues updated in last ${interval}`, issuesResponse?.data);

    const issues = issuesResponse.data.issues;

    const issuesWithComments = await Promise.all(
      issues.map(async (issue) => {
        let comments = [];
        try {
          const commentsResponse = await axios.get(
            `${this.config.jira.baseUrl}/rest/api/2/issue/${issue.key}/comment`,
            { headers: { authorization: `Basic ${apiToken}` } }
          );
          comments = commentsResponse.data.comments;
        } catch (err) {
          logger.error(`Error fetching comments for issue ${issue.key}:`, err.message);
        }
        return {
          id: issue.id,
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          assignee: issue.fields.assignee?.displayName || "Unassigned",
          storyPoints: issue.fields?.[this.config.jira.storyPointField] || "Not estimated",
          sprint: issue.fields.sprint?.name || "No sprint",
          updated: issue.fields.updated,
          priority: issue.fields.priority?.name || "Not set",
          duedate: issue.fields?.duedate || '',
          comments, // array of comment objects
        };
      })
    );

    return issuesWithComments;
  } catch (error) {
    logger.error("Error fetching Jira issues by interval:", error.message);
    throw error;
  }
}
}

module.exports = { JiraClient };
