import { seedDemoData } from '../lib/db-init.js';

async function main() {
  try {
    console.log('🚀 Starting demo data seeding...\n');
    await seedDemoData();
    console.log('\n✅ Demo data seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
