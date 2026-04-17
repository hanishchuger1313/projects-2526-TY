import { initializeDatabase } from '../lib/db-init.js';

async function main() {
  try {
    console.log('🚀 Starting database initialization...\n');
    await initializeDatabase();
    console.log('\n✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
}

main();
