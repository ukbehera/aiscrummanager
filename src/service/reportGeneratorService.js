const axios = require("axios");
const config = require("../config/config");
const logger = require("../util/logger");
const { generatePDF } = require("../util/generatePdf");
const fs = require("fs");
const path = require("path");

class ReportGenerator {
  async generateReport(stories, reportType) {
    const summary = this.generateSummary(stories);
    const details = this.generateDetails(stories);
    const llmSummary = await this.generateLLMSummary(stories, reportType);

    const report = {
      timestamp: new Date().toISOString(),
      reportType,
      summary,
      llmSummary,
      details,
    };

    const html = this.formatReport(report);

    // Ensure the reports directory exists
    const reportsDir = path.resolve(__dirname, "../../reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate PDF from HTML
    const pdfPath = path.join(
      reportsDir,
      `sprint-report-${new Date().getTime().toString()}.pdf`
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

  generateDetails(stories) {
    return stories.map((story) => ({
      key: story.key,
      summary: story.summary,
      status: story.status,
      assignee: story.assignee,
      storyPoints: story.storyPoints,
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
        config.llm.apiUrl,
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
            Authorization: `Bearer ${config.llm.apiKey}`,
          },
        }
      );
      const summary = response.data.choices[0]?.content?.trim();
      logger.info();
      return summary;
    } catch (error) {
      logger.error("Error generating LLM summary:", error.message);
      return "Unable to generate AI summary due to an error. Please check the LLM API configuration.";
    }
  }

  formatReport(report) {
    let html = `<h2>${report.reportType} Sprint Report - ${report.timestamp}</h2>`;

    html += "<h3>AI-Generated Summary</h3>";
    html += `<p>${report.llmSummary}</p>`;

    html += "<h3>Summary</h3>";
    html += `<p>Total Stories: ${report.summary.totalStories}</p>`;
    html += `<p>Total Story Points: ${report.summary.totalPoints}</p>`;
    html += "<h4>Status Breakdown:</h4><ul>";
    for (const [status, count] of Object.entries(report.summary.statusCounts)) {
      html += `<li>${status}: ${count}</li>`;
    }
    html += "</ul>";

    html += '<h3>Story Details</h3><table border="1">';
    html +=
      "<tr><th>Key</th><th>Summary</th><th>Status</th><th>Assignee</th><th>Points</th></tr>";
    report.details.forEach((story) => {
      html += `<tr>
                <td>${story.key}</td>
                <td>${story.summary}</td>
                <td>${story.status}</td>
                <td>${story.assignee}</td>
                <td>${story.storyPoints}</td>
            </tr>`;
    });
    html += "</table>";

    return html;
  }
}

module.exports = { ReportGenerator };
