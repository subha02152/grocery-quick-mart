import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'packed',
      'dispatched',
      'delivered',
      'cancelled'
    ],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: [
      'pending',
      'paid',
      'failed',
      'refunded'
    ],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: [
      'cash',
      'card',
      'upi',
      'wallet'
    ],
    default: 'cash'
  },
  deliveryInstructions: {
    type: String
  },
  expectedDelivery: {
    type: Date
  },
  deliveryAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveredAt: {
    type: Date
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ shopId: 1, status: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);