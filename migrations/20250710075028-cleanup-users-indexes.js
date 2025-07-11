'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const indexNamesToRemove = [
      'username_8', 'username_9', 'username_10', 'username_11', 'username_12', 'username_13', 'username_14',
      'username_15', 'username_16', 'username_17', 'username_18', 'username_19', 'username_20', 'username_21',
      'username_22', 'username_23', 'username_24', 'username_25', 'username_26', 'username_27', 'username_28',
      'username_29', 'username_30', 'username_31', 'username_32',
      'email_2', 'email_3', 'email_4', 'email_5', 'email_6', 'email_7', 'email_8',
      'email_9', 'email_10', 'email_11', 'email_12', 'email_13', 'email_14', 'email_15', 'email_16',
      'email_17', 'email_18', 'email_19', 'email_20', 'email_21', 'email_22', 'email_23', 'email_24',
      'email_25', 'email_26', 'email_27', 'email_28', 'email_29', 'email_30', 'email_31'
    ];

    for (const index of indexNamesToRemove) {
      try {
        await queryInterface.removeIndex('users', index);
      } catch (error) {
        console.warn(`Could not remove index ${index}:`, error.message);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No need to recreate these duplicates
  }
};
