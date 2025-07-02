const getProjectsConfig = () => {
  return [
    {
      project: 'AIScrumManager',
      jira: {
        projectKey: process.env.JIRA_PROJECT_KEY,
        baseUrl: process.env.JIRA_API,
        username: process.env.JIRA_USERNAME,
        apiToken: process.env.JIRA_API_TOKEN,
        boardId: process.env.JIRA_BOARD_ID,
        storyPointField: process.env.JIRA_STORY_POINT_FIELD,
      },
      email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: '"AI Agent" <your-email@gmail.com>',
        to: "recipient@example.com",
      },
      llm: {
        apiUrl: process.env.LLM_API_URL,
        apiKey: process.env.LLM_API_KEY,
      },
      app: {
        dsrCronExpression: process.env.DSR_CRON,
        wsrCrontExpression: process.env.WSR_CRON,
        msrCronExpression: process.env.MSR_CRON,
        qsrCronExpression: process.env.QSR_CRON,
      },
    }
  ];
};
module.exports = { getProjectsConfig };
