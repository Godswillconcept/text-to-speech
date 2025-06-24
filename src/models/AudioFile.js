const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const path = require('path');
const fs = require('fs');

const AudioFile = sequelize.define('AudioFile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in seconds
    allowNull: true
  }
});

// Define associations
const User = require('./User');
const Operation = require('./Operation');

// Define foreign key relationships
AudioFile.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    allowNull: false,
    type: DataTypes.INTEGER
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

AudioFile.belongsTo(Operation, {
  foreignKey: {
    name: 'operationId',
    allowNull: false,
    type: DataTypes.INTEGER
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Add associations to User and Operation models
User.hasMany(AudioFile, {
  foreignKey: 'userId',
  as: 'audioFiles'
});

Operation.hasOne(AudioFile, {
  foreignKey: 'operationId',
  as: 'audioFile'
});

// Hook to delete the physical file when the record is deleted
AudioFile.afterDestroy(async (audioFile) => {
  try {
    const filePath = path.join(__dirname, '../../', audioFile.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting audio file:', error);
  }
});

module.exports = AudioFile;
