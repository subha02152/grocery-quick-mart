import mongoose from 'mongoose';

const deliveryAgentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  agencyName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['bike', 'scooter', 'car', 'bicycle', 'truck']
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentLocation: {
    latitude: Number,
    longitude: Number
  },
  rating: {
    type: Number,
    default: 0
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
deliveryAgentSchema.index({ userId: 1 });
deliveryAgentSchema.index({ isOnline: 1, isAvailable: 1 });
deliveryAgentSchema.index({ licenseNumber: 1 });
deliveryAgentSchema.index({ vehicleNumber: 1 });

export default mongoose.model('DeliveryAgent', deliveryAgentSchema);