import mongoose from 'mongoose';

const ownershipTransferSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  salePrice: { type: Number, default: null },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending',
    index: true,
  },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

// Compound index: one pending transfer per device at a time
ownershipTransferSchema.index({ deviceId: 1, status: 1 });

export default mongoose.models.OwnershipTransfer
  || mongoose.model('OwnershipTransfer', ownershipTransferSchema);
