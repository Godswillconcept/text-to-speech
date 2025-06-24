const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { convertTextToSpeech, getAvailableVoices } = require('../services/ttsService');
const { extractTextFromPdf } = require('../services/pdfService');
const Operation = require('../models/Operation');
const AudioFile = require('../models/AudioFile');
const { ApiError } = require('../middleware/errorHandler');

// Controller methods

// @desc    Convert text to speech
// @route   POST /api/tts/text-to-speech
// @access  Private
exports.textToSpeech = async (req, res, next) => {
  try {
    const { text, voice, language, speed = 1.0 } = req.body;
    const userId = req.user.id;

    // Create operation record
    const operation = await Operation.create({
      type: 'text-to-speech',
      input: text,
      status: 'pending',
      userId
    });

    try {
      // Generate speech from text
      const audioBuffer = await convertTextToSpeech(text, {
        voice,
        language,
        speed: parseFloat(speed)
      });

      // Generate unique filename
      const filename = `tts-${Date.now()}-${uuidv4()}.mp3`;
      const filepath = path.join('public', 'uploads', filename);
      const fullPath = path.join(__dirname, '..', '..', filepath);

      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Save audio file
      fs.writeFileSync(fullPath, audioBuffer);

      // Get file stats
      const stats = fs.statSync(fullPath);

      // Create audio file record
      const audioFile = await AudioFile.create({
        filename,
        originalname: `tts-${Date.now()}.mp3`,
        mimetype: 'audio/mpeg',
        size: stats.size,
        path: filepath,
        userId,
        operationId: operation.id
      });

      // Update operation status
      await operation.update({
        status: 'completed',
        output: JSON.stringify({ audioFileId: audioFile.id }),
        metadata: {
          voice,
          language,
          speed,
          duration: audioFile.duration
        }
      });

      // Return response
      res.json({
        success: true,
        audioFile: {
          id: audioFile.id,
          url: `/uploads/${filename}`,
          duration: audioFile.duration
        }
      });
    } catch (error) {
      console.error('TTS Error:', error);
      await operation.update({
        status: 'failed',
        output: error.message
      });
      throw new ApiError(500, 'Failed to generate speech from text');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Convert PDF to speech
// @route   POST /api/tts/pdf-to-speech
// @access  Private
exports.pdfToSpeech = async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'No PDF file uploaded'));
  }

  try {
    const { voice, language, speed = 1.0 } = req.body;
    const userId = req.user.id;
    const pdfPath = req.file.path;

    // Create operation record
    const operation = await Operation.create({
      type: 'pdf-to-speech',
      input: `PDF: ${req.file.originalname}`,
      status: 'pending',
      userId,
      metadata: {
        originalFilename: req.file.originalname,
        size: req.file.size
      }
    });

    try {
      // Extract text from PDF
      const text = await extractTextFromPdf(pdfPath);
      
      // Generate speech from extracted text
      const audioBuffer = await textToSpeech(text, {
        voice,
        language,
        speed: parseFloat(speed)
      });

      // Generate unique filename
      const filename = `pdf-tts-${Date.now()}-${uuidv4()}.mp3`;
      const filepath = path.join('public', 'uploads', filename);
      const fullPath = path.join(__dirname, '..', '..', filepath);

      // Save audio file
      fs.writeFileSync(fullPath, audioBuffer);

      // Get file stats
      const stats = fs.statSync(fullPath);

      // Create audio file record
      const audioFile = await AudioFile.create({
        filename,
        originalname: `${path.parse(req.file.originalname).name}.mp3`,
        mimetype: 'audio/mpeg',
        size: stats.size,
        path: filepath,
        userId,
        operationId: operation.id
      });

      // Update operation status
      await operation.update({
        status: 'completed',
        output: JSON.stringify({ audioFileId: audioFile.id }),
        metadata: {
          ...operation.metadata,
          voice,
          language,
          speed,
          duration: audioFile.duration,
          textLength: text.length
        }
      });

      // Clean up uploaded PDF
      fs.unlinkSync(pdfPath);

      // Return response
      res.json({
        success: true,
        audioFile: {
          id: audioFile.id,
          url: `/uploads/${filename}`,
          duration: audioFile.duration
        }
      });
    } catch (error) {
      console.error('PDF to Speech Error:', error);
      await operation.update({
        status: 'failed',
        output: error.message
      });
      
      // Clean up uploaded PDF in case of error
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
      
      throw new ApiError(500, 'Failed to convert PDF to speech');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get available voices
// @route   GET /api/tts/voices
// @access  Private
exports.getVoices = async (req, res, next) => {
  try {
    const voices = await getAvailableVoices();
    res.json(voices);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's TTS history
// @route   GET /api/tts/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: operations } = await Operation.findAndCountAll({
      where: { userId, type: ['text-to-speech', 'pdf-to-speech'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: AudioFile,
          as: 'audioFile',
          attributes: ['id', 'originalname', 'path', 'duration', 'createdAt']
        }
      ]
    });

    res.json({
      success: true,
      data: operations,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit),
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audio file by ID
// @route   GET /api/tts/audio/:id
// @access  Private
exports.getAudioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const audioFile = await AudioFile.findOne({
      where: { id, userId },
      include: [
        {
          model: Operation,
          as: 'operation',
          attributes: ['id', 'type', 'createdAt']
        }
      ]
    });

    if (!audioFile) {
      return next(new ApiError(404, 'Audio file not found'));
    }

    const filePath = path.join(__dirname, '..', '..', audioFile.path);
    
    if (!fs.existsSync(filePath)) {
      return next(new ApiError(404, 'Audio file not found on server'));
    }

    // Set appropriate headers
    res.setHeader('Content-Type', audioFile.mimetype);
    res.setHeader('Content-Length', audioFile.size);
    res.setHeader('Content-Disposition', `inline; filename="${audioFile.originalname}"`);
    
    // Stream the file
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};
