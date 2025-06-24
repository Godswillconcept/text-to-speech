'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the current enum values
    const [results] = await queryInterface.sequelize.query(
      "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Operations' AND COLUMN_NAME = 'type'"
    );
    
    // Extract the current enum values
    const currentEnum = results[0].COLUMN_TYPE;
    
    // Check if the new values already exist in the enum
    if (!currentEnum.includes('document_paraphrase')) {
      // Create a temporary column to hold the new enum values
      await queryInterface.sequelize.query(
        "ALTER TABLE Operations CHANGE type type_temp VARCHAR(255)"
      );
      
      // Create the new enum column
      await queryInterface.sequelize.query(`
        ALTER TABLE Operations 
        ADD COLUMN type ENUM(
          'text-to-speech', 
          'pdf-to-speech', 
          'paraphrase', 
          'summarize', 
          'key-points', 
          'change-tone',
          'document-paraphrase',
          'document-summarize',
          'document-key-points',
          'document-change-tone'
        ) NOT NULL
      `);
      
      // Copy data from the temporary column
      await queryInterface.sequelize.query(
        "UPDATE Operations SET type = type_temp"
      );
      
      // Drop the temporary column
      await queryInterface.sequelize.query(
        "ALTER TABLE Operations DROP COLUMN type_temp"
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes if needed
    // Note: This is a simplified rollback and might need adjustment based on your needs
    await queryInterface.sequelize.query(
      "ALTER TABLE Operations CHANGE type type_temp VARCHAR(255)"
    );
    
    await queryInterface.sequelize.query(`
      ALTER TABLE Operations 
      ADD COLUMN type ENUM(
        'text-to-speech', 
        'pdf-to-speech', 
        'paraphrase', 
        'summarize',
        'key-points',
        'change-tone'
      ) NOT NULL
    `);
    
    // Only copy back values that exist in the original enum
    await queryInterface.sequelize.query(`
      UPDATE Operations 
      SET type = type_temp 
      WHERE type_temp IN ('text-to-speech', 'pdf-to-speech', 'paraphrase', 'summarize', 'key-points', 'change-tone')
    `);
    
    // For any document_* types, set to a default value
    await queryInterface.sequelize.query(`
      UPDATE Operations 
      SET type = 'paraphrase'
      WHERE type_temp LIKE 'document-%'
    `);
    
    await queryInterface.sequelize.query(
      "ALTER TABLE Operations DROP COLUMN type_temp"
    );
  }
};
