import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import DeliveryAgent from '../models/DeliveryAgent.js';
import Order from '../models/Order.js';

const router = express.Router();

// ✅ Create delivery account
router.post('/create-account', protect, authorize('delivery_agent'), async (req, res) => {
  try {
    const {
      agencyName,
      address,
      licenseNumber,
      mobileNumber,
      vehicleType,
      vehicleNumber
    } = req.body;

    // Check if delivery account already exists for this user
    const existingAccount = await DeliveryAgent.findOne({ userId: req.user.id });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Delivery account already exists for this user'
      });
    }

    // Create new delivery agent account
    const deliveryAgent = new DeliveryAgent({
      userId: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: mobileNumber,
      agencyName,
      address,
      licenseNumber,
      vehicleType,
      vehicleNumber,
      isOnline: false,
      isAvailable: true
    });

    await deliveryAgent.save();

    res.status(201).json({
      success: true,
      message: 'Delivery account created successfully',
      data: deliveryAgent
    });

  } catch (error) {
    console.error('Create delivery account error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = field === 'licenseNumber' 
        ? 'License number already exists' 
        : 'Vehicle number already exists';
      
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating delivery account'
    });
  }
});

// ✅ Get assigned orders (dispatched orders)
router.get('/assigned-orders', protect, authorize('delivery_agent'), async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryAgentId: req.user.id,
      status: { $in: ['dispatched', 'out_for_delivery'] }
    })
    .populate('shopId', 'name address phone')
    .populate('customerId', 'name phone address')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { orders },
      message: 'Assigned orders fetched successfully'
    });
  } catch (error) {
    console.error('Get assigned orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assigned orders'
    });
  }
});

// ✅ Get completed orders
router.get('/completed-orders', protect, authorize('delivery_agent'), async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryAgentId: req.user.id,
      status: 'delivered'
    })
    .populate('shopId', 'name address phone')
    .populate('customerId', 'name phone address')
    .sort({ deliveredAt: -1 });

    res.json({
      success: true,
      data: { orders },
      message: 'Completed orders fetched successfully'
    });
  } catch (error) {
    console.error('Get completed orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching completed orders'
    });
  }
});

// ✅ Mark order as delivered
router.put('/orders/:orderId/deliver', protect, authorize('delivery_agent'), async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      deliveryAgentId: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not assigned to you'
      });
    }

    // Update order status
    order.status = 'delivered';
    order.deliveredAt = new Date();
    await order.save();

    // Update delivery agent stats
    await DeliveryAgent.findOneAndUpdate(
      { userId: req.user.id },
      { 
        $inc: { 
          totalDeliveries: 1,
          completedDeliveries: 1 
        } 
      }
    );

    res.json({
      success: true,
      message: 'Order marked as delivered successfully',
      data: order
    });
  } catch (error) {
    console.error('Mark as delivered error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

// ✅ Get delivery agent profile
router.get('/profile', protect, authorize('delivery_agent'), async (req, res) => {
  try {
    const deliveryAgent = await DeliveryAgent.findOne({ userId: req.user.id });
    
    if (!deliveryAgent) {
      return res.status(404).json({
        success: false,
        message: 'Delivery agent profile not found'
      });
    }

    res.json({
      success: true,
      data: deliveryAgent
    });
  } catch (error) {
    console.error('Get delivery profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

export default router;