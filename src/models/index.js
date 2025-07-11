const { sequelize, DataTypes } = require('../config/database');
const User = require('./User');
const Operation = require('./Operation');
const AudioFile = require('./AudioFile');

// Initialize models
const models = {
  User: User(sequelize, DataTypes),
  Operation: Operation(sequelize, DataTypes),
  AudioFile: AudioFile(sequelize, DataTypes)
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  ...models,
  sequelize
};
