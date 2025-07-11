const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const db = require('../models');
const { ApiError } = require('../middleware/errorHandler');

const Operation = db.Operation;
const AudioFile = db.AudioFile;

/**
 * @desc    Get all operations for the authenticated user
 * @route   GET /api/operations
 * @access  Private
 */
const getOperations = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { page = 1, limit = 10, type, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };

    if (type) where.type = type;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await Operation.findAndCountAll({
      where,
      include: [
        {
          model: AudioFile,
          as: 'audioFile', // <- must match Operation.hasOne(... as: 'audioFile')
          attributes: ['id', 'path', 'url', 'size', 'duration'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(count / limit),
        hasNextPage: page < Math.ceil(count / limit),
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Failed to fetch operations:', error);
    return next(error);
  }
};


/**
 * @desc    Get a single operation by ID
 * @route   GET /api/operations/:id
 * @access  Private
 */
const getOperation = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const operation = await Operation.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: AudioFile,
        as: 'audioFile',
        required: false
      }]
    });

    if (!operation) {
      return next(new ApiError(404, 'Operation not found'));
    }

    res.status(200).json({
      success: true,
      data: operation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new operation
 * @route   POST /api/operations
 * @access  Private
 */
const createOperation = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, input, metadata } = req.body;

    const operation = await Operation.sequelize.transaction(async (t) => {
      return await Operation.create({
        type,
        input,
        userId: req.user.id,
        status: 'pending',
        metadata: metadata || {}
      }, {
        transaction: t
      });
    });

    res.status(201).json({
      success: true,
      data: operation
    });
  } catch (error) {
    console.error('Error creating operation:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return next(new ApiError(400, `Validation error: ${messages.join(', ')}`));
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new ApiError(400, 'Operation with this data already exists'));
    }
    
    next(error);
  }
};

/**
 * @desc    Update an operation
 * @route   PATCH /api/operations/:id
 * @access  Private
 */
const updateOperation = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { output, status, metadata } = req.body;

    const result = await Operation.sequelize.transaction(async (t) => {
      // First check if operation exists and belongs to user
      const operation = await Operation.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id
        },
        transaction: t
      });

      if (!operation) {
        throw new ApiError(404, 'Operation not found or not authorized');
      }

      // Prepare update data (only include defined fields)
      const updateData = {};
      if (output !== undefined) updateData.output = output;
      if (status !== undefined) updateData.status = status;
      if (metadata !== undefined) updateData.metadata = metadata;

      // Update the operation
      await operation.update(updateData, { transaction: t });

      // Return updated operation with associations
      return await Operation.findOne({
        where: { id: req.params.id },
        include: [{
          model: AudioFile,
          as: 'audioFile',
          required: false
        }],
        transaction: t
      });
    });
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating operation:', error);
    
    if (error instanceof ApiError) {
      return next(error);
    }
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => err.message);
      return next(new ApiError(400, `Validation error: ${messages.join(', ')}`));
    }
    
    next(error);
  }
};

/**
 * @desc    Delete an operation
 * @route   DELETE /api/operations/:id
 * @access  Private
 */
const deleteOperation = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    await Operation.sequelize.transaction(async (t) => {
      // Find operation with associated audio file
      const operation = await Operation.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id
        },
        include: [{
          model: AudioFile,
          as: 'audioFile',
          required: false
        }],
        transaction: t
      });

      if (!operation) {
        throw new ApiError(404, 'Operation not found or not authorized');
      }

      // Delete the operation (this will cascade delete the audio file due to model associations)
      await operation.destroy({ transaction: t });
    });
    
    res.status(204).json({
      success: true,
      data: null
    });
  } catch (error) {
    console.error('Error deleting operation:', error);
    
    if (error instanceof ApiError) {
      return next(error);
    }
    
    next(error);
  }
};

module.exports = {
  getOperations,
  getOperation,
  createOperation,
  updateOperation,
  deleteOperation
};