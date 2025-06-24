const PDFDocument = require('pdfkit');
const pdf = require('pdf-parse');
const fs = require('fs');
const fsp = require('fs').promises;
const { ApiError } = require('../middleware/errorHandler');

/**
 * Extract text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text from the PDF
 */
const extractTextFromPdf = async (filePath) => {
  try {
    // Read the PDF file
    const dataBuffer = await fs.readFile(filePath);
    
    // Parse the PDF
    const data = await pdf(dataBuffer);
    
    // Return the extracted text
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new ApiError(400, 'Failed to extract text from PDF');
  }
};

/**
 * Extract text from a PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text from the PDF
 */
const extractTextFromPdfBuffer = async (buffer) => {
  try {
    // Parse the PDF from buffer
    const data = await pdf(buffer);
    
    // Return the extracted text
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF buffer:', error);
    throw new ApiError(400, 'Failed to extract text from PDF');
  }
};

/**
 * Get metadata from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Object>} - PDF metadata
 */
const getPdfMetadata = async (filePath) => {
  try {
    // Read the PDF file
    const dataBuffer = await fs.readFile(filePath);
    
    // Parse the PDF
    const data = await pdf(dataBuffer);
    
    // Return the metadata
    return {
      numPages: data.numpages,
      info: data.info,
      metadata: data.metadata,
      textLength: data.text.length
    };
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    throw new ApiError(400, 'Failed to get PDF metadata');
  }
};

/**
 * Generates a PDF from text
 * @param {string} text - Text to generate PDF from
 * @param {string} outputPath - Path to save the generated PDF
 * @returns {Promise<string>} - Path to the generated PDF
 */
const generatePdf = async (text, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);
    
    doc.pipe(stream);
    doc.fontSize(12);
    doc.text(text, {
      align: 'left',
      width: 500,
      indent: 30
    });
    
    doc.end();
    
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

module.exports = {
  extractTextFromPdf,
  extractTextFromPdfBuffer,
  getPdfMetadata,
  generatePdf
};
