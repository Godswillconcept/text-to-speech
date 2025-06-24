const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Operation = sequelize.define('Operation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('text-to-speech', 'pdf-to-speech', 'paraphrase', 'summarize', 'key-points', 'change-tone', 'document-paraphrase', 'document-summarize', 'document-key-points', 'document-change-tone'),
    allowNull: false
  },
  input: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  output: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

// Define associations
const User = require('./User');

// Define the foreign key relationship
Operation.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    allowNull: false,
    type: DataTypes.INTEGER
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Add the association to User model
User.hasMany(Operation, {
  foreignKey: 'userId',
  as: 'operations'
});

module.exports = Operation;
