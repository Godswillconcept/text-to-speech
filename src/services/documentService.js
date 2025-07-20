// src/services/documentService.js
const fs = require("fs").promises;
const path = require("path");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const pptx2json = require("pptx2json");
const { v4: uuidv4 } = require("uuid");

/**
 * The base directory for uploaded files
 */
const uploadDir = path.join(__dirname, '..', '..', 'src', 'uploads');

/**
 * A map of MIME types to directories where files of that type should be stored
 */
const documentDirs = {
  "application/pdf": "pdfs",
  "application/msword": "docs",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docs",
  "application/vnd.ms-powerpoint": "ppts",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "ppts",
};

/**
 * Returns the base directory for uploaded files
 * @returns {string} The base directory for uploaded files
 */
const getUploadDir = () => uploadDir;

/**
 * Returns the map of MIME types to directories
 * @returns {object} The map of MIME types to directories
 */
const getDocumentDirs = () => documentDirs;

/**
 * Saves a file to the appropriate directory based on its MIME type
 * @param {object} file The file to save
 * @returns {object} An object containing the path, type, and size of the saved file
 */
const saveFile = async (file) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  const fileType = getDocumentType(file.mimetype);
  const fileName = `${uuidv4()}${fileExt}`;
  const typeDir = path.join(uploadDir, fileType);
  
  // Ensure the type-specific directory exists
  await fs.mkdir(typeDir, { recursive: true });
  
  const filePath = path.join(typeDir, fileName);
  await fs.writeFile(filePath, file.buffer);

  return {
    path: filePath,
    type: fileType,
    size: file.size,
  };
};

/**
 * Returns the directory for a given MIME type, or "other" if no match is found
 * @param {string} mimetype The MIME type to look up
 * @returns {string} The directory for the given MIME type
 */
const getDocumentType = (mimetype) => documentDirs[mimetype] || "other";

/**
 * Extracts text from a file based on its MIME type
 * @param {object} fileInfo The file to extract text from
 * @returns {string} The extracted text
 */
const extractText = async (fileInfo) => {
  const fileType = getDocumentType(fileInfo.mimetype);

  switch (fileType) {
    case "pdfs":
      return extractTextFromPdf(fileInfo);
    case "docs":
      return extractTextFromDoc(fileInfo);
    case "ppts":
      return extractTextFromPpt(fileInfo);
    default:
      throw new Error("Unsupported file type");
  }
};

/**
 * Extracts text from a PDF file
 * @param {object} fileInfo The file to extract text from
 * @returns {string} The extracted text
 */
const extractTextFromPdf = async (fileInfo) => {
  const dataBuffer = fileInfo.buffer || await fs.readFile(fileInfo.path);
  const data = await pdf(dataBuffer);
  return data.text;
};

/**
 * Extracts text from a DOC file
 * @param {object} fileInfo The file to extract text from
 * @returns {string} The extracted text
 */
const extractTextFromDoc = async (fileInfo) => {
  const dataBuffer = fileInfo.buffer || await fs.readFile(fileInfo.path);
  const result = await mammoth.extractRawText({ buffer: dataBuffer });
  return result.value;
};

/**
 * Extracts text from a PPTX file
 * @param {object} fileInfo The file to extract text from
 * @returns {string} The extracted text
 */
const extractTextFromPpt = async (fileInfo) => {
  // This is a simplified example - you might need a more robust solution for PPTX
  const result = await pptx2json(fileInfo.path);
  // Process the JSON to extract text
  return extractTextFromJson(result);
};

/**
 * Extracts text from a JSON structure representing a PPTX file
 * @param {object} data The JSON structure to extract text from
 * @returns {string} The extracted text
 */
const extractTextFromJson = (data) => {
  // Implement text extraction from PPTX JSON structure
  // This is a placeholder - actual implementation will depend on pptx2json output
  return JSON.stringify(data);
};

/**
 * Deletes a file from disk
 * @param {string} filePath The path to the file to delete
 */
const cleanup = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Error cleaning up file:", error);
  }
};

module.exports = {
  getUploadDir,
  getDocumentDirs,
  saveFile,
  getDocumentType,
  extractText,
  extractTextFromPdf,
  extractTextFromDoc,
  extractTextFromPpt,
  extractTextFromJson,
  cleanup,
};
