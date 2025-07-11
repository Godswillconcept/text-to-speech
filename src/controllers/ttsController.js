const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");
const db = require("../models");
const { convertTextToSpeech } = require("../services/ttsService");
const { extractText, cleanup } = require("../services/documentService");
const { ApiError } = require("../middleware/errorHandler");
const ttsConfig = require('../config/ttsConfig');

const Operation = db.Operation;
const AudioFile = db.AudioFile;

const TEXT_CHUNK_SIZE = 950;
const uploadsDir = path.join(__dirname, "..", "uploads", "audios");

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log(`✅ Uploads directory ready at: ${uploadsDir}`);
  } catch (error) {
    console.error('❌ Failed to create uploads directory:', error);
    throw new Error('Failed to initialize uploads directory');
  }
};

// Initialize uploads directory when the controller loads
ensureUploadsDir().catch(console.error);

exports.textToSpeech = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user ? req.user.id : null;
  const { text, ...options } = req.body;

  let operation;
  let audioFile;
  let absolutePath;

  try {
    const result = await Operation.sequelize.transaction(async (t) => {
      // Only create operation if user is authenticated
      if (userId) {
        operation = await Operation.create(
          {
            userId: userId,
            type: "text-to-speech",
            input: text,
            status: "pending",
            metadata: { ...options },
          },
          {
            transaction: t,
          }
        );
      }

      // Convert text to speech
      const audioBuffer = await convertTextToSpeech(text, options);

      // If no user, return audio directly without saving to database
      if (!userId) {
        return {
          type: "direct",
          audioBuffer,
        };
      }

      // Generate file path and save audio file
      const filename = `${uuidv4()}.mp3`;
      const filePath = path.join("uploads", "audios", filename);
      absolutePath = path.join(__dirname, "..", filePath);
      
      // Ensure directory exists and write file
      try {
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, audioBuffer);
      } catch (fileError) {
        console.error("❌ Error writing audio file:", fileError);
        throw new Error(`Failed to save audio file: ${fileError.message}`);
      }
      
      // Get file stats
      const stats = await fs.stat(absolutePath);
    
      // Create audio file record in database
      audioFile = await AudioFile.create(
        {
          filename: filename,
          originalname: "speech.mp3",
          mimetype: "audio/mpeg",
          size: stats.size,
          path: filePath,
          url: `${process.env.BASE_URL}/${filePath}`,
          userId: userId,
          operationId: operation.id,
        },
        {
          transaction: t,
        }
      );

      // Update operation status to completed and set audioFileId
      await operation.update(
        {
          status: "completed",
          output: `Generated audio file with ID: ${audioFile.id}`,
          audioFileId: audioFile.id
        },
        {
          transaction: t,
        }
      );

      return {
        type: 'saved',
        operation,
        audioFile
      };
    });

    // Handle response based on result type
    if (result.type === 'direct') {
      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": result.audioBuffer.length,
        "Content-Disposition": 'attachment; filename="speech.mp3"',
      });
      return res.send(result.audioBuffer);
    }

    // Return success response for authenticated users
    res.status(201).json({
      success: true,
      message: "Audio file generated successfully.",
      audioUrl: `/uploads/audios/${result.audioFile.filename}`,
      url: result.audioFile.url,
      operationId: result.operation.id,
    });

  } catch (error) {
    console.error('❌ Error in textToSpeech:', error);

    // Clean up file if it was created but transaction failed
    if (absolutePath) {
      try {
        await fs.unlink(absolutePath);
        console.log('🧹 Cleaned up audio file after transaction failure');
      } catch (cleanupError) {
        console.error('❌ Failed to cleanup audio file:', cleanupError);
      }
    }

    // Update operation status to failed if it exists
    if (operation && userId) {
      try {
        await operation.update({
          status: 'failed',
          output: error.message,
        });
      } catch (updateError) {
        console.error('❌ Failed to update operation status:', updateError);
      }
    }

    next(error);
  }
};

exports.getAudioById = async (req, res, next) => {
  try {
    const audioFile = await AudioFile.findOne({
      where: { id: req.params.id, userId: req.user.id },
      transaction: req.transaction,
    });

    if (!audioFile) {
      return next(new ApiError(404, "Audio file not found"));
    }

    const absolutePath = path.join(__dirname, "..", audioFile.path);

    if (!require("fs").existsSync(absolutePath)) {
      return next(new ApiError(404, "Audio file data not found on server."));
    }

    res.set({
      "Content-Type": audioFile.mimetype,
      "Content-Length": audioFile.size,
      "Content-Disposition": `inline; filename="${audioFile.originalname}"`,
    });

    res.sendFile(absolutePath);
  } catch (error) {
    next(new ApiError(500, "Failed to fetch audio file"));
  }
};

/**
 * @route   GET /api/tts/history
 * @desc    Get the authenticated user's text-to-speech history with pagination.
 * @access  Private
 *
 * @query   page - The page number to retrieve (default: 1)
 * @query   limit - The number of items per page (default: 10)
 */
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Operation.findAndCountAll({
      where: {
        userId: userId,
        type: "text-to-speech",
      },
      order: [["createdAt", "DESC"]],
      limit: limit,
      offset: offset,
      include: [
        {
          model: AudioFile,
          as: "audioFile",
          attributes: ["id", "originalname", "duration", "size"],
          required: false,
        },
      ],
      distinct: true,
      transaction: req.transaction,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: {
        history: rows,
        pagination: {
          totalItems: count,
          totalPages: totalPages,
          currentPage: page,
          pageSize: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching TTS history:", error);
    next(new ApiError(500, "Failed to fetch text-to-speech history."));
  }
};




/**
 * @route   POST /api/tts/pdf-to-speech
 * @desc    Convert an uploaded document (PDF, DOCX) to speech
 * @access  Private
 */
exports.pdfToSpeech = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.file) {
    return next(new ApiError(400, 'No file uploaded. Please provide a PDF or DOCX file.'));
  }

  const userId = req.user.id;
  const { voice, ...options } = req.body;
  let operation;
  let audioFile;
  let absolutePath;

  try {
    const result = await Operation.sequelize.transaction(async (t) => {
      // Create operation record
      operation = await Operation.create({
        userId,
        type: 'document-to-speech',
        input: `Uploaded file: ${req.file.originalname}`,
        status: 'pending',
        metadata: { voice, ...options, originalFilename: req.file.originalname },
      }, {
        transaction: t,
      });

      // Extract text from document
      const extractedText = await extractText(req.file);

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error('Could not extract any text from the document.');
      }

      // Split text into chunks for processing
      const textChunks = [];
      for (let i = 0; i < extractedText.length; i += TEXT_CHUNK_SIZE) {
        textChunks.push(extractedText.substring(i, i + TEXT_CHUNK_SIZE));
      }

      // Convert all text chunks to speech
      const ttsPromises = textChunks.map(chunk =>
        convertTextToSpeech(chunk, { voice, ...options })
      );
      const audioBuffers = await Promise.all(ttsPromises);

      // Combine all audio buffers
      const finalAudioBuffer = Buffer.concat(audioBuffers);

      // Generate file path and save audio file
      const filename = `${uuidv4()}.mp3`;
      const relativePath = path.join('uploads', 'audios', filename);
      absolutePath = path.join(__dirname, '..', relativePath);

      // Ensure directory exists and write file
      try {
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, finalAudioBuffer);
      } catch (fileError) {
        console.error('❌ Error writing audio file:', fileError);
        throw new Error(`Failed to save audio file: ${fileError.message}`);
      }

      // Get file stats
      const stats = await fs.stat(absolutePath);

      // Create audio file record in database
      audioFile = await AudioFile.create({
        filename,
        originalname: `${path.parse(req.file.originalname).name}.mp3`,
        mimetype: 'audio/mpeg',
        size: stats.size,
        path: relativePath,
        url: `${process.env.BASE_URL}/${relativePath}`,
        userId,
        operationId: operation.id,
      }, {
        transaction: t,
      });

      // Update operation status to completed and set audioFileId
      await operation.update({
        status: 'completed',
        output: `Generated audio file with ID: ${audioFile.id}`,
        audioFileId: audioFile.id
      }, {
        transaction: t,
      });

      return {
        operation,
        audioFile
      };
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Document successfully converted to speech.',
      audioUrl: `/uploads/audios/${result.audioFile.filename}`,
      url: result.audioFile.url,
      operationId: result.operation.id,
    });

  } catch (error) {
    console.error('❌ Error in pdfToSpeech:', error);

    // Clean up audio file if it was created but transaction failed
    if (absolutePath) {
      try {
        await fs.unlink(absolutePath);
        console.log('🧹 Cleaned up audio file after transaction failure');
      } catch (cleanupError) {
        console.error('❌ Failed to cleanup audio file:', cleanupError);
      }
    }

    // Update operation status to failed if it exists
    if (operation) {
      try {
        await operation.update({
          status: 'failed',
          output: error.message,
        });
      } catch (updateError) {
        console.error('❌ Failed to update operation status:', updateError);
      }
    }

    next(error);

  } finally {
    // Always clean up uploaded file
    if (req.file && req.file.path) {
      await cleanup(req.file.path);
    }
  }
};



/**
 * @route   GET /api/tts/options
 * @desc    Get available TTS options (languages, formats, codecs, etc.)
 * @access  Public
 */
exports.getTtsOptions = (req, res) => {
  try {
    const options = {
      languages: ttsConfig.languages,
      audioFormats: ttsConfig.audioFormats,
      codecs: ttsConfig.codecs.map(codec => ({
        id: codec.toLowerCase(),
        name: codec,
        mimeType: `audio/${codec.toLowerCase()}`
      })),
      rates: ttsConfig.rates.map(rate => ({
        value: rate,
        label: rate === 0 ? 'Normal' : rate > 0 ? `+${rate}` : rate.toString()
      })),
      defaults: ttsConfig.defaults
    };

    res.status(200).json({
      success: true,
      data: options
    });
  } catch (error) {
    console.error('Error getting TTS options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve TTS options',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/tts/voices
 * @desc    Get available voices grouped by language
 * @access  Public
 */
exports.getVoices = (req, res) => {
  try {
    // Group voices by language
    const voicesByLanguage = ttsConfig.languages.map(lang => {
      // For each language, we create a male and female voice
      // In a real implementation, this would come from the TTS service's available voices
      const languageCode = lang.code.toLowerCase();
      const languageName = lang.name;
      
      return {
        language: languageCode,
        languageName: languageName,
        voices: [
          {
            id: `${languageCode}-male`,
            name: `${languageName} - Male`,
            gender: 'male',
            language: languageCode,
            isDefault: languageCode === ttsConfig.defaults.voice
          },
          {
            id: `${languageCode}-female`,
            name: `${languageName} - Female`,
            gender: 'female',
            language: languageCode,
            isDefault: false
          }
        ]
      };
    });

    res.status(200).json({
      success: true,
      data: voicesByLanguage
    });
  } catch (error) {
    console.error('Error getting voices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve voices',
      error: error.message
    });
  }
};