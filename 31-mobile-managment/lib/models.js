import { getCollection } from './mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

// User Model Operations
export const UserModel = {
  async create(userData) {
    try {
      const users = await getCollection('users');
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }
      const result = await users.insertOne({ ...userData, createdAt: new Date(), updatedAt: new Date() });
      return { _id: result.insertedId, ...userData };
    } catch (error) { throw new Error(`Failed to create user: ${error.message}`); }
  },

  async findByEmail(email) {
    try {
      const users = await getCollection('users');
      return await users.findOne({ email });
    } catch (error) { throw new Error(`Failed to find user: ${error.message}`); }
  },

  async findById(userId) {
    try {
      const users = await getCollection('users');
      return await users.findOne({ _id: new ObjectId(userId) });
    } catch (error) { throw new Error(`Failed to find user: ${error.message}`); }
  },

  async findAll(filters = {}) {
    try {
      const users = await getCollection('users');
      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.role) query.role = filters.role;
      return await users.find(query).toArray();
    } catch (error) { throw new Error(`Failed to fetch users: ${error.message}`); }
  },

  async update(userId, updateData) {
    try {
      const users = await getCollection('users');
      const result = await users.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { ...updateData, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result;
    } catch (error) { throw new Error(`Failed to update user: ${error.message}`); }
  },

  async delete(userId) {
    try {
      const users = await getCollection('users');
      const result = await users.deleteOne({ _id: new ObjectId(userId) });
      return result.deletedCount > 0;
    } catch (error) { throw new Error(`Failed to delete user: ${error.message}`); }
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  async getCountByStatus() {
    try {
      const users = await getCollection('users');
      return {
        total: await users.countDocuments(),
        pending: await users.countDocuments({ status: 'pending' }),
        active: await users.countDocuments({ status: 'active' }),
        blocked: await users.countDocuments({ status: 'blocked' }),
        rejected: await users.countDocuments({ status: 'rejected' })
      };
    } catch (error) { throw new Error(`Failed to get user counts: ${error.message}`); }
  },

  async findByPhone(phone) {
    try {
      const users = await getCollection('users');
      return await users.findOne({ phone });
    } catch (error) { throw new Error(`Failed to find user: ${error.message}`); }
  },
};

// Device/Mobile Model Operations
export const DeviceModel = {
  async create(deviceData) {
    try {
      const devices = await getCollection('devices');
      const result = await devices.insertOne({ ...deviceData, createdAt: new Date(), updatedAt: new Date() });
      return { _id: result.insertedId, ...deviceData };
    } catch (error) { throw new Error(`Failed to create device: ${error.message}`); }
  },

  async findById(deviceId) {
    try {
      const devices = await getCollection('devices');
      return await devices.findOne({ _id: new ObjectId(deviceId) });
    } catch (error) { throw new Error(`Failed to find device: ${error.message}`); }
  },

  async findByImei(imei) {
    try {
      const devices = await getCollection('devices');
      return await devices.findOne({ imei });
    } catch (error) { throw new Error(`Failed to find device: ${error.message}`); }
  },

  async findAll(filters = {}) {
    try {
      const devices = await getCollection('devices');
      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.shopId) query.shopId = filters.shopId;
      if (filters.ownerId) query.ownerId = filters.ownerId;
      return await devices.find(query).toArray();
    } catch (error) { throw new Error(`Failed to fetch devices: ${error.message}`); }
  },

  async update(deviceId, updateData) {
    try {
      const devices = await getCollection('devices');
      const result = await devices.findOneAndUpdate(
        { _id: new ObjectId(deviceId) },
        { $set: { ...updateData, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result;
    } catch (error) { throw new Error(`Failed to update device: ${error.message}`); }
  },

  async delete(deviceId) {
    try {
      const devices = await getCollection('devices');
      const result = await devices.deleteOne({ _id: new ObjectId(deviceId) });
      return result.deletedCount > 0;
    } catch (error) { throw new Error(`Failed to delete device: ${error.message}`); }
  },

  async checkDuplicateImei(imei) {
    try {
      const devices = await getCollection('devices');
      const count = await devices.countDocuments({ imei });
      return count > 0;
    } catch (error) { throw new Error(`Failed to check duplicate IMEI: ${error.message}`); }
  },

  async findByOwner(ownerId) {
    try {
      const devices = await getCollection('devices');
      return await devices.find({ ownerId: new ObjectId(ownerId) }).toArray();
    } catch (error) { throw new Error(`Failed to find devices by owner: ${error.message}`); }
  },
};

// Repair/Service Model Operations
export const RepairModel = {
  async create(repairData) {
    try {
      const repairs = await getCollection('repairs');
      const result = await repairs.insertOne({ ...repairData, createdAt: new Date(), updatedAt: new Date() });
      return { _id: result.insertedId, ...repairData };
    } catch (error) { throw new Error(`Failed to create repair: ${error.message}`); }
  },

  async findAll(filters = {}) {
    try {
      const repairs = await getCollection('repairs');
      const query = {};
      if (filters.servicecenterId) query.servicecenterId = filters.servicecenterId;
      if (filters.serviceCenterId) query.servicecenterId = filters.serviceCenterId;
      if (filters.technicianId) query.technicianId = filters.technicianId;
      if (filters.customerId) query.customerId = filters.customerId;
      if (filters.status) query.status = filters.status;
      return await repairs.find(query).toArray();
    } catch (error) { throw new Error(`Failed to fetch repairs: ${error.message}`); }
  },

  async updateStatus(repairId, status, notes = '') {
    try {
      const repairs = await getCollection('repairs');
      const result = await repairs.findOneAndUpdate(
        { _id: new ObjectId(repairId) },
        {
          $set: { status, updatedAt: new Date() },
          $push: { statusHistory: { status, notes, timestamp: new Date() } }
        },
        { returnDocument: 'after' }
      );
      return result;
    } catch (error) { throw new Error(`Failed to update repair status: ${error.message}`); }
  }
};

// Sale/Transaction Model Operations
export const SaleModel = {
  async create(saleData) {
    try {
      const sales = await getCollection('sales');
      const result = await sales.insertOne({ ...saleData, createdAt: new Date(), updatedAt: new Date() });
      return { _id: result.insertedId, ...saleData };
    } catch (error) { throw new Error(`Failed to create sale: ${error.message}`); }
  },

  async findAll(filters = {}) {
    try {
      const sales = await getCollection('sales');
      const query = {};
      if (filters.shopId) query.shopId = filters.shopId;
      if (filters.customerId) query.customerId = filters.customerId;
      if (filters.ownerId) query.customerId = filters.ownerId; // alias ownerId -> customerId
      if (filters.dateFrom) query.createdAt = { $gte: new Date(filters.dateFrom) };
      if (filters.dateTo) query.createdAt = { ...query.createdAt, $lte: new Date(filters.dateTo) };
      return await sales.find(query).toArray();
    } catch (error) { throw new Error(`Failed to fetch sales: ${error.message}`); }
  },

  async findByShop(shopId, filters = {}) {
    try {
      const sales = await getCollection('sales');
      const query = { shopId: new ObjectId(shopId) };
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }
      return await sales.aggregate([
        { $match: query },
        { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
        { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
        { $lookup: { from: 'warranties', localField: 'deviceId', foreignField: 'deviceId', as: 'warranty' } },
        { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$warranty', preserveNullAndEmptyArrays: true } },
        { $project: { 'customer.password': 0, 'customer.passwordHash': 0 } },
        { $sort: { createdAt: -1 } }
      ]).toArray();
    } catch (error) { throw new Error(`Failed to fetch sales by shop: ${error.message}`); }
  },

  async findByShop(shopId, filters = {}) {
    try {
      const sales = await getCollection('sales');
      return await sales.aggregate([
        { $match: { shopId: new ObjectId(shopId), ...filters } },
        { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
        { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
        { $lookup: { from: 'warranties', localField: 'deviceId', foreignField: 'deviceId', as: 'warranty' } },
        { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$warranty', preserveNullAndEmptyArrays: true } },
        { $project: { 'customer.password': 0 } },
        { $sort: { createdAt: -1 } }
      ]).toArray();
    } catch (error) { throw new Error(`Failed to fetch sales by shop: ${error.message}`); }
  },

  async getStatistics(shopId = null) {
    try {
      const sales = await getCollection('sales');
      const match = shopId ? { shopId: new ObjectId(shopId) } : {};
      const stats = await sales.aggregate([
        { $match: match },
        { $group: { _id: null, totalSales: { $sum: 1 }, totalRevenue: { $sum: '$salePrice' }, avgSaleValue: { $avg: '$salePrice' } } }
      ]).toArray();
      return stats[0] || { totalSales: 0, totalRevenue: 0, avgSaleValue: 0 };
    } catch (error) { throw new Error(`Failed to get sales statistics: ${error.message}`); }
  }
};

// Warranty Model Operations
export const WarrantyModel = {
  async create(warrantyData) {
    try {
      const warranties = await getCollection('warranties');
      const result = await warranties.insertOne({ ...warrantyData, createdAt: new Date(), updatedAt: new Date() });
      return { _id: result.insertedId, ...warrantyData };
    } catch (error) { throw new Error(`Failed to create warranty: ${error.message}`); }
  },

  async findExpiringSoon(days = 30) {
    try {
      const warranties = await getCollection('warranties');
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);
      return await warranties.find({ expiryDate: { $lte: expiryDate, $gte: new Date() }, status: 'active' }).toArray();
    } catch (error) { throw new Error(`Failed to find expiring warranties: ${error.message}`); }
  },

  async findExpired() {
    try {
      const warranties = await getCollection('warranties');
      return await warranties.find({ expiryDate: { $lt: new Date() }, status: 'active' }).toArray();
    } catch (error) { throw new Error(`Failed to find expired warranties: ${error.message}`); }
  },

  async findByDeviceId(deviceId) {
    try {
      const warranties = await getCollection('warranties');
      return await warranties.findOne({ deviceId: new ObjectId(deviceId) });
    } catch (error) { throw new Error(`Failed to find warranty: ${error.message}`); }
  },

  async updateStatus(warrantyId, status) {
    try {
      const warranties = await getCollection('warranties');
      const result = await warranties.findOneAndUpdate(
        { _id: new ObjectId(warrantyId) },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result;
    } catch (error) { throw new Error(`Failed to update warranty: ${error.message}`); }
  },

  async bulkExpire(ids) {
    try {
      const warranties = await getCollection('warranties');
      return await warranties.updateMany(
        { _id: { $in: ids.map(id => new ObjectId(id)) } },
        { $set: { status: 'expired', updatedAt: new Date() } }
      );
    } catch (error) { throw new Error(`Failed to bulk expire warranties: ${error.message}`); }
  },

  async findByCustomerId(customerId) {
    try {
      const warranties = await getCollection('warranties');
      return await warranties.find({ customerId: new ObjectId(customerId) }).toArray();
    } catch (error) { throw new Error(`Failed to find warranties by customer: ${error.message}`); }
  },
};

// Inventory/Stock Model Operations
export const InventoryModel = {
  async create(inventoryData, shopId) {
    try {
      const devices = await getCollection('devices');
      const existingDevice = await devices.findOne({ imei: inventoryData.imei });
      if (existingDevice) throw new Error('IMEI already registered in the system');
      const result = await devices.insertOne({
        ...inventoryData,
        shopId: new ObjectId(shopId),
        status: 'in-stock',
        ownerId: null,
        ownershipHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { _id: result.insertedId, ...inventoryData };
    } catch (error) { throw error; }
  },

  async findByShop(shopId) {
    try {
      const devices = await getCollection('devices');
      return await devices.find({ shopId: new ObjectId(shopId) }).sort({ createdAt: -1 }).toArray();
    } catch (error) { throw new Error(`Failed to fetch inventory: ${error.message}`); }
  },

  async update(deviceId, updateData) {
    try {
      const devices = await getCollection('devices');
      const result = await devices.findOneAndUpdate(
        { _id: new ObjectId(deviceId) },
        { $set: { ...updateData, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result;
    } catch (error) { throw new Error(`Failed to update inventory: ${error.message}`); }
  },

  async delete(deviceId, shopId) {
    try {
      const devices = await getCollection('devices');
      const device = await devices.findOne({ _id: new ObjectId(deviceId), shopId: new ObjectId(shopId) });
      if (!device) throw new Error('Device not found or access denied');
      if (device.status !== 'in-stock') throw new Error('Cannot delete sold or reserved devices');
      const result = await devices.deleteOne({ _id: new ObjectId(deviceId) });
      return result.deletedCount > 0;
    } catch (error) { throw error; }
  },

  async getStats(shopId) {
    try {
      const devices = await getCollection('devices');
      const stats = await devices.aggregate([
        { $match: { shopId: new ObjectId(shopId) } },
        { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$sellingPrice' } } }
      ]).toArray();
      const totalDevices = await devices.countDocuments({ shopId: new ObjectId(shopId) });
      return {
        total: totalDevices,
        byStatus: stats,
        inStock: stats.find(s => s._id === 'in-stock')?.count || 0,
        sold: stats.find(s => s._id === 'sold')?.count || 0
      };
    } catch (error) { throw new Error(`Failed to get stats: ${error.message}`); }
  }
};

// Sale Transaction Model
export const TransactionModel = {
  async createSale({ shopId, deviceId, customerId, customerName, customerPhone, customerEmail, salePrice }) {
    try {
      const devices = await getCollection('devices');
      const sales = await getCollection('sales');
      const warranties = await getCollection('warranties');

      // Validate device exists and is in-stock
      const device = await devices.findOne({
        _id: new ObjectId(deviceId),
        status: 'in-stock'
      });
      if (!device) throw new Error('Device not found or not available for sale');

      const now = new Date();
      const invoiceNumber = `INV-${Date.now()}`;

      // Create sale record
      const saleResult = await sales.insertOne({
        shopId: new ObjectId(shopId),
        deviceId: new ObjectId(deviceId),
        customerId: new ObjectId(customerId),
        customerName,
        customerPhone,
        customerEmail: customerEmail || '',
        salePrice,
        purchasePrice: device.purchasePrice || 0,
        invoiceNumber,
        paymentMethod: 'cash',
        isResale: false,
        saleDate: now,
        createdAt: now,
        updatedAt: now,
      });

      // Update device status to sold
      await devices.updateOne(
        { _id: new ObjectId(deviceId) },
        {
          $set: {
            status: 'sold',
            customerId: new ObjectId(customerId),
            ownerId: new ObjectId(customerId),
            soldAt: now,
            updatedAt: now,
          },
          $push: {
            ownershipHistory: {
              ownerId: new ObjectId(customerId),
              ownerName: customerName,
              acquiredAt: now,
              type: 'purchase',
            }
          }
        }
      );

      // Auto-create warranty
      const warrantyMonths = Math.min(parseInt(device.warrantyPeriod, 10) || 12, 24);
      const warrantyEnd = new Date(now);
      warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyMonths);

      const warrantyResult = await warranties.insertOne({
        deviceId: new ObjectId(deviceId),
        customerId: new ObjectId(customerId),
        shopId: new ObjectId(shopId),
        saleId: saleResult.insertedId,
        startDate: now,
        expiryDate: warrantyEnd,
        warrantyPeriod: warrantyMonths,
        status: 'active',
        terms: 'Standard warranty',
        createdAt: now,
        updatedAt: now,
      });

      const sale = await sales.findOne({ _id: saleResult.insertedId });
      const warranty = await warranties.findOne({ _id: warrantyResult.insertedId });

      return { sale, warranty };
    } catch (error) { throw new Error(`Failed to create sale: ${error.message}`); }
  },

  async findByShop(shopId, filters = {}) {
    try {
      const sales = await getCollection('sales');
      const query = { shopId: new ObjectId(shopId) };
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
      }
      return await sales.aggregate([
        { $match: query },
        { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
        { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
        { $lookup: { from: 'warranties', localField: 'deviceId', foreignField: 'deviceId', as: 'warranty' } },
        { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$warranty', preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } }
      ]).toArray();
    } catch (error) { throw new Error(`Failed to fetch sales: ${error.message}`); }
  },

  async findByInvoice(invoiceNumber, shopId) {
    try {
      const sales = await getCollection('sales');
      const sale = await sales.aggregate([
        { $match: { invoiceNumber, shopId: new ObjectId(shopId) } },
        { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
        { $lookup: { from: 'users', localField: 'customerId', foreignField: '_id', as: 'customer' } },
        { $lookup: { from: 'users', localField: 'shopId', foreignField: '_id', as: 'shop' } },
        { $unwind: '$device' },
        { $unwind: '$customer' },
        { $unwind: '$shop' }
      ]).toArray();
      return sale[0] || null;
    } catch (error) { throw new Error(`Failed to fetch sale: ${error.message}`); }
  }
};

// Resale/Transfer Model
export const ResaleModel = {
  async createResaleRequest(resaleData) {
    try {
      const resales = await getCollection('resales');  // fix: was inconsistently 'transfers' elsewhere
      const devices = await getCollection('devices');

      const device = await devices.findOne({ _id: new ObjectId(resaleData.deviceId) });
      if (!device) throw new Error('Device not found');
      if (device.status !== 'sold') throw new Error('Only sold devices can be resold');

      const result = await resales.insertOne({
        deviceId: new ObjectId(resaleData.deviceId),
        originalCustomerId: new ObjectId(resaleData.currentCustomerId),
        newCustomerId: new ObjectId(resaleData.newCustomerId),
        shopId: new ObjectId(resaleData.shopId),
        resalePrice: resaleData.resalePrice,
        status: 'pending',
        requestedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return { _id: result.insertedId, ...resaleData };
    } catch (error) { throw error; }
  },

  async completeTransfer(resaleId) {
    try {
      const resales = await getCollection('resales');   // fix: unified collection name ('transfers' → 'resales')
      const devices = await getCollection('devices');
      const sales = await getCollection('sales');

      const resale = await resales.findOne({ _id: new ObjectId(resaleId) });
      if (!resale) throw new Error('Resale request not found');
      if (resale.status !== 'pending') throw new Error('Resale request is not pending');

      // Update device ownership — keep both customerId and ownerId in sync
      await devices.updateOne(
        { _id: resale.deviceId },
        {
          $set: {
            ownerId: resale.newCustomerId,
            customerId: resale.newCustomerId,   // fix: was missing, caused customerId/ownerId mismatch
            status: 'sold',
            resoldAt: new Date(),
            updatedAt: new Date()
          },
          $push: {
            ownershipHistory: {
              fromCustomerId: resale.originalCustomerId,
              toCustomerId: resale.newCustomerId,
              transferredAt: new Date(),
              resaleId: resale._id
            }
          }
        }
      );

      // Mark the resale request as completed
      await resales.updateOne(
        { _id: new ObjectId(resaleId) },
        { $set: { status: 'completed', completedAt: new Date(), updatedAt: new Date() } }
      );

      // Create a new sale record for the resale transaction
      await sales.insertOne({
        deviceId: resale.deviceId,
        shopId: resale.shopId,
        customerId: resale.newCustomerId,        // fix: use customerId consistently
        salePrice: resale.resalePrice,
        isResale: true,
        originalCustomerId: resale.originalCustomerId,
        resaleId: resale._id,
        saleDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return { success: true, resaleId };
    } catch (error) { throw error; }
  },

  async findAll(filters = {}) {
    try {
      const resales = await getCollection('resales');  // fix: unified collection name
      const query = {};
      if (filters.shopId) query.shopId = new ObjectId(filters.shopId);
      if (filters.status) query.status = filters.status;
      if (filters.deviceId) query.deviceId = new ObjectId(filters.deviceId);
      return await resales.aggregate([
        { $match: query },
        { $lookup: { from: 'devices', localField: 'deviceId', foreignField: '_id', as: 'device' } },
        { $lookup: { from: 'users', localField: 'originalCustomerId', foreignField: '_id', as: 'originalCustomer' } },
        { $lookup: { from: 'users', localField: 'newCustomerId', foreignField: '_id', as: 'newCustomer' } },
        { $unwind: { path: '$device', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$originalCustomer', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$newCustomer', preserveNullAndEmptyArrays: true } },
        { $project: { 'originalCustomer.password': 0, 'newCustomer.password': 0 } },
        { $sort: { createdAt: -1 } }
      ]).toArray();
    } catch (error) { throw new Error(`Failed to fetch resales: ${error.message}`); }
  },

  async findById(resaleId) {
    try {
      const resales = await getCollection('resales');
      return await resales.findOne({ _id: new ObjectId(resaleId) });
    } catch (error) { throw new Error(`Failed to find resale: ${error.message}`); }
  }
};

// Transfer Model Operations
export const TransferModel = {
  async create(transferData) {
    try {
      const transfers = await getCollection('transfers'); // fixed: was 'transfer'
      const result = await transfers.insertOne({ ...transferData, createdAt: new Date(), updatedAt: new Date() });
      return { _id: result.insertedId, ...transferData };
    } catch (error) { throw new Error(`Failed to create transfer: ${error.message}`); }
  },

  async findById(transferId) {
    try {
      const transfers = await getCollection('transfers');
      return await transfers.findOne({ _id: new ObjectId(transferId) });
    } catch (error) { throw new Error(`Failed to find transfer: ${error.message}`); }
  },

  async findAll(filters = {}) {
    try {
      const transfers = await getCollection('transfers');
      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.fromShopId) query.fromShopId = filters.fromShopId;
      if (filters.toShopId) query.toShopId = filters.toShopId;
      return await transfers.find(query).sort({ createdAt: -1 }).toArray();
    } catch (error) { throw new Error(`Failed to fetch transfers: ${error.message}`); }
  },

  async update(transferId, updateData) {
    try {
      const transfers = await getCollection('transfers');
      const result = await transfers.findOneAndUpdate(
        { _id: new ObjectId(transferId) },
        { $set: { ...updateData, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result.value;
    } catch (error) { throw new Error(`Failed to update transfer: ${error.message}`); }
  },

  async updateStatus(transferId, status, notes = '') {
    try {
      const transfers = await getCollection('transfers');
      const result = await transfers.findOneAndUpdate(
        { _id: new ObjectId(transferId) },
        { $set: { status, notes, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return result.value;
    } catch (error) { throw new Error(`Failed to update transfer status: ${error.message}`); }
  }
};
