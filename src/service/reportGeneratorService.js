const axios = require("axios");
const logger = require("../util/logger");
const { generatePDF } = require("../util/generatePdf");
const fs = require("fs");
const path = require("path");
const { generateReportHtml } = require("../util/generateReportHtml");
const { capitalizeFirstLetter } = require("../util/appUtil");

class ReportGenerator {
  constructor(config) {
    this.config = config;
  }
  async generateReport(stories, reportType) {
    const summary = this.generateSummary(stories);
    const details = await this.generateDetails(stories);
    console.log('details!!!', details);
    const llmSummary = await this.generateLLMSummary(stories, reportType);
//     const llmSummary = `The current sprint is progressing with 1 story in QA, 2 in progress, 2 awaiting start, and 1 in
// production, indicating a moderate pace. Notably, none of the stories have assigned points, making it
// challenging to assess the team's velocity or completion rate. Overall, the team's progress appears
// steady, but the lack of point assignments and uneven story distribution across stages may warrant
// attention to optimize sprint performance and better understand potential blockers or areas for
// improvement.`;
    logger.info(`LLM summay ${llmSummary}`);

    const report = {
      timestamp: new Date().toISOString(),
      project: this.config.project,
      reportType,
      summary,
      llmSummary,
      details,
    };

    const html = generateReportHtml(report);

    // Ensure the reports directory exists
    const reportsDir = path.resolve(__dirname, "../../reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate PDF from HTML
    const pdfPath = path.join(
      reportsDir,
      `${capitalizeFirstLetter(reportType)} Sprint Report ${new Date()
        .getTime()
        .toString()}.pdf`
    );
    const pdfBuffer = await generatePDF(html, pdfPath);

    return {
      subject: `${
        reportType.charAt(0).toUpperCase() + reportType.slice(1)
      } Sprint Report`,
      body: html,
      pdfBuffer, // Buffer containing the PDF file
    };
  }

  generateSummary(stories) {
    const statusCounts = stories.reduce((acc, story) => {
      acc[story.status] = (acc[story.status] || 0) + 1;
      return acc;
    }, {});

    const totalPoints = stories.reduce((acc, story) => {
      return acc + (parseFloat(story.storyPoints) || 0);
    }, 0);

    return {
      totalStories: stories.length,
      statusCounts,
      totalPoints,
    };
  }

  async generateDetails(stories) {
    return Promise.all(stories.map(async (story) => {
      const commentSummary = await this.generateCommentsSummaryForStories(
        story
      );
      // const commentSummary = `Test Comment Summary`;
      return {
        key: story.key,
        summary: story.summary,
        status: story.status,
        assignee: story.assignee,
        storyPoints: story.storyPoints,
        priority: story.priority,
        comments: story?.comments,
        duedate: story?.duedate,
        commentSummary,
      };
    }));
  }

  async generateLLMSummary(stories, reportType) {
    try {
      const prompt = `
                You are an AI assistant generating a ${reportType} sprint report summary for a Jira board. 
                Based on the following story data, provide a concise, professional summary (2-3 sentences) highlighting key progress, trends, or issues. 
                Data: ${JSON.stringify(this.generateSummary(stories))}.
                Story details: ${JSON.stringify(
                  stories.map((s) => ({
                    key: s.key,
                    summary: s.summary,
                    status: s.status,
                  }))
                )}.
                Focus on insights like completion rates, blockers, or team performance.
            `;

      const response = await axios.post(
        this.config.llm.apiUrl,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.llm.apiKey}`,
          },
        }
      );
      const summary = response.data.choices[0]?.message?.content;
      return summary;
    } catch (error) {
      logger.error("Error generating LLM summary:", error);
      return "Unable to generate AI summary due to an error. Please check the LLM API configuration.";
    }
  }

  async generateCommentsSummaryForStories(story) {
    const prompt = `
      You are an AI assistant generating a summary for the comments on the following Jira story.
      Story Key: ${story.key}
      Summary: ${story.summary}
      Status: ${story.status}
      Comments: ${JSON.stringify(story.comments || [])}
      Please provide a concise summary (1-2 sentences) of the main discussion points, blockers, or decisions from the comments.
      If there are no comments, mention that.
    `;
    try {
      const response = await axios.post(
        this.config.llm.apiUrl,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.llm.apiKey}`,
          },
        }
      );
      return response.data.choices[0]?.message?.content;
    } catch (error) {
      logger.error(
        `Error generating LLM comments summary for story ${story.key}:`,
        error
      );
      return 'No summary available';
    }
  }
}

module.exports = { ReportGenerator };
