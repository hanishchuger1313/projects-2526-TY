import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  imei: { type: String, required: true },
  problemDescription: { type: String, required: true },
  urgency: { type: String, enum: ['low', 'normal', 'urgent'], default: 'normal' },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in-progress', 'closed'],
    default: 'open',
    index: true,
  },
  assignedServicecenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  linkedRepairId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repair', default: null },
  adminNotes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.ServiceRequest
  || mongoose.model('ServiceRequest', serviceRequestSchema);
