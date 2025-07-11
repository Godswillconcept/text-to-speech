module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('audio_files', 'url', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('audio_files', 'url');
  }
};
