const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'text_to_speech'
    });

    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    const [tables] = await connection.execute('SHOW TABLES');
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      await connection.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
      console.log(`Dropped table: ${tableName}`);
    }
    
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('All tables dropped successfully');
    
    await connection.end();
  } catch (error) {
    console.error('Error dropping tables:', error);
  }
})();