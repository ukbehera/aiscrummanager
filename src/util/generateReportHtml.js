const { capitalizeFirstLetter, formatDate } = require("../util/appUtil");
const generateReportHtml = (report) => {
  let html = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f8f9fa;
            color: #222;
            margin: 0;
            padding: 24px;
          }
          h2 {
            background: #0078d4;
            color: #fff;
            padding: 16px;
            border-radius: 8px 8px 0 0;
            margin-top: 0;
          }
          h3 {
            color: #0078d4;
            margin-bottom: 8px;
          }
          h4 {
            margin-top: 16px;
            margin-bottom: 8px;
          }
          .summary, .ai-summary {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            padding: 16px;
            margin-bottom: 24px;
          }
          ul {
            padding-left: 20px;
          }
          .no-comments {
            list-style: none;
            padding-left: 0;
            margin-left: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #fff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            margin-bottom: 24px;
          }
          th, td {
            padding: 10px 8px;
            text-align: left;
            vertical-align: top;
            word-break: break-word;
            max-width: 300px;      /* Set your preferred max width */
            max-height: 120px;     /* Set your preferred max height */
            overflow: auto;        /* Enable scroll if content exceeds max height */
          }
          th {
            background: #e5f1fb;
            color: #0078d4;
            font-weight: 600;
            border-bottom: 2px solid #b3d7f5;
          }
          tr:nth-child(even) {
            background: #f4f8fb;
          }
        </style>
      </head>
      <body>
        <h2>${report.project} : ${capitalizeFirstLetter(report.reportType)} Sprint Report - ${
    formatDate(report.timestamp, 'DD-MM-YYYY')
  }</h2>
        <div class="ai-summary">
          <h3>AI-Generated Summary</h3>
          <p>${report.llmSummary}</p>
        </div>
        <div class="summary">
          <h3>Summary</h3>
          <p><strong>Total Stories:</strong> ${report.summary.totalStories}</p>
          <p><strong>Total Story Points:</strong> ${
            report.summary.totalPoints
          }</p>
          <h4>Status Breakdown:</h4>
          <ul>
            ${Object.entries(report.summary.statusCounts)
              .map(([status, count]) => `<li>${status}: ${count}</li>`)
              .join("")}
          </ul>
        </div>
        <h3>Story Details</h3>
        <table border="0">
          <tr>
            <th>Key</th>
            <th>Summary</th>
            <th>Status</th>
            <th>Assignee</th>
            <th>Points</th>
            <th>Due Date</th>
            <th>Comments</th>
            <th>Comment Summary</th>
          </tr>
          ${report.details
            .map(
              (story) => `
            <tr>
              <td>${story.key}</td>
              <td>${story.summary}</td>
              <td>${story.status}</td>
              <td>${story.assignee}</td>
              <td>${story.storyPoints}</td>
              <td>
                ${story.duedate}
              </td>
              <td>
                ${
                  story.comments && story.comments.length > 0
                    ? `<ul>
                        ${story.comments
                          .map(
                            (comment) =>
                              `<li><span>${comment?.body}</span> <b>(${comment?.author?.displayName || comment?.author?.name || "Unknown"} : ${comment.updated})</b></li>`
                          )
                          .join("")}
                      </ul>`
                    : '<div class="no-comments"><b>No comments yet</b></div>'
                }
              </td>
              <td>${story.commentSummary}</td>
            </tr>
          `
            )
            .join("")}
        </table>
      </body>
    </html>
  `;
  return html;
};

module.exports = { generateReportHtml };
