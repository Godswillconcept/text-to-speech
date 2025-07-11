const path = require('path');
const fs = require('fs');

module.exports = (sequelize, DataTypes) => {
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
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Define associations
AudioFile.associate = (models) => {
  // AudioFile-User relationship
  AudioFile.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // AudioFile-Operation relationship
  AudioFile.belongsTo(models.Operation, {
    foreignKey: 'operationId',
    as: 'operation',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

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

  return AudioFile;
};
