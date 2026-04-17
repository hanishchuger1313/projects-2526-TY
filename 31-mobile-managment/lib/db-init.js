import { getDatabase, getCollection } from './mongodb';
import { UserModel } from './models';

/**
 * Initialize database with indexes and seed data
 */
export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');

    const db = await getDatabase();

    // Create indexes for better query performance
    await createIndexes(db);

    // Seed initial admin user if not exists
    await seedAdminUser();

    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Create database indexes
 */
async function createIndexes(db) {
  try {
    // Users collection indexes
    const usersCollection = await getCollection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    await usersCollection.createIndex({ status: 1 });
    await usersCollection.createIndex({ createdAt: -1 });
    console.log('✅ Users indexes created');

    // Devices collection indexes
    const devicesCollection = await getCollection('devices');
    await devicesCollection.createIndex({ imei: 1 }, { unique: true });
    await devicesCollection.createIndex({ shopId: 1 });
    await devicesCollection.createIndex({ customerId: 1 });
    await devicesCollection.createIndex({ status: 1 });
    console.log('✅ Devices indexes created');

    // Repairs collection indexes
    const repairsCollection = await getCollection('repairs');
    await repairsCollection.createIndex({ serviceCenterId: 1 });
    await repairsCollection.createIndex({ technicianId: 1 });
    await repairsCollection.createIndex({ customerId: 1 });
    await repairsCollection.createIndex({ status: 1 });
    await repairsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Repairs indexes created');

    // Sales collection indexes
    const salesCollection = await getCollection('sales');
    await salesCollection.createIndex({ shopId: 1 });
    await salesCollection.createIndex({ customerId: 1 });
    await salesCollection.createIndex({ deviceId: 1 });
    await salesCollection.createIndex({ createdAt: -1 });
    console.log('✅ Sales indexes created');

    // Warranties collection indexes
    const warrantiesCollection = await getCollection('warranties');
    await warrantiesCollection.createIndex({ deviceId: 1 });
    await warrantiesCollection.createIndex({ customerId: 1 });
    await warrantiesCollection.createIndex({ status: 1 });
    await warrantiesCollection.createIndex({ expiryDate: 1 });
    console.log('✅ Warranties indexes created');

  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

/**
 * Seed initial admin user
 */
async function seedAdminUser() {
  try {
    // Check if admin exists
    const adminExists = await UserModel.findByEmail('admin@gmail.com');

    if (!adminExists) {
      console.log('🌱 Seeding admin user...');
      
      await UserModel.create({
        name: 'System Admin',
        email: 'admin@gmail.com',
        password: '123456',
        phone: '+1-555-0001',
        role: 'admin',
        status: 'active'
      });

      console.log('✅ Admin user created');
      console.log('📧 Email: admin@gmail.com');
      console.log('🔑 Password: 123456');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
    throw error;
  }
}

/**
 * Seed demo data for testing
 */
export async function seedDemoData() {
  try {
    console.log('🌱 Seeding demo data...');

    // Check if demo users exist
    const shopOwner = await UserModel.findByEmail('shop@gmail.com');
    
    if (!shopOwner) {
      // Create demo shop owner
      await UserModel.create({
        name: 'Mobile Hub',
        email: 'shop@gmail.com',
        password: '123456',
        phone: '+1-555-0002',
        role: 'shop',
        status: 'active',
        shopName: 'Mobile Hub Store',
        address: '123 Main Street, Tech City, TC 12345'
      });
      console.log('✅ Demo shop owner created');
    }

    // Create demo service center
    const serviceCenter = await UserModel.findByEmail('service@gmail.com');
    if (!serviceCenter) {
      await UserModel.create({
        name: 'QuickFix Mobile',
        email: 'service@gmail.com',
        password: '123456',
        phone: '+1-555-0003',
        role: 'service',
        status: 'active',
        centerName: 'QuickFix Mobile Center',
        address: '456 Tech Avenue, Repair City, RC 67890',
        licenseNumber: 'LIC-QF-2024-001'
      });
      console.log('✅ Demo service center created');
    }

    // Create demo customer
    const customer = await UserModel.findByEmail('customer@gmail.com');
    if (!customer) {
      await UserModel.create({
        name: 'John Smith',
        email: 'customer@gmail.com',
        password: '123456',
        phone: '+1-555-0004',
        role: 'customer',
        status: 'active'
      });
      console.log('✅ Demo customer created');
    }

    // Create demo technician
    const technician = await UserModel.findByEmail('technician@gmail.com');
    if (!technician) {
      await UserModel.create({
        name: 'Mike Wilson',
        email: 'technician@gmail.com',
        password: '123456',
        phone: '+1-555-0005',
        role: 'technician',
        status: 'active'
      });
      console.log('✅ Demo technician created');
    }

    console.log('✅ Demo data seeded successfully!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}

/**
 * Clear all data from database (use with caution!)
 */
export async function clearDatabase() {
  try {
    console.log('⚠️  Clearing database...');
    
    const db = await getDatabase();
    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
      console.log(`✅ Cleared collection: ${collection.name}`);
    }

    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}
