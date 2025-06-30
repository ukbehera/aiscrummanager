const puppeteer = require('puppeteer');
const logger = require('./logger');
generatePDF = async (html, filePath = null) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({
        path: filePath || undefined,
        format: "A4",
        printBackground: true,
      });
      await browser.close();
      if (filePath) {
        logger.info(`PDF saved to ${filePath}`);
        return { filename: filePath, buffer: pdfBuffer };
      }
      return pdfBuffer;
    } catch (err) {
      logger.error("Error generating PDF:", err.message);
      throw err;
    }
  }

  module.exports = {generatePDF};