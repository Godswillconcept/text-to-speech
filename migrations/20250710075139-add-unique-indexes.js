'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('users', ['username'], {
      name: 'users_username_unique',
      unique: true,
    });

    await queryInterface.addIndex('users', ['email'], {
      name: 'users_email_unique',
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', 'users_username_unique');
    await queryInterface.removeIndex('users', 'users_email_unique');
  }
};
