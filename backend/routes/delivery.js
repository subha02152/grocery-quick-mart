import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Import models from server.js context
// These will be passed via the router or accessed directly

// Middleware to protect routes (will be imported from server.js)
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

    // Get User model from mongoose
    const User = mongoose.model('User');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user?.role || 'unknown'} is not authorized to access this resource`
      });
    }
    next();
  };
};

// @route   GET /api/delivery/profile
// @desc    Get delivery agent profile
// @access  Private (Delivery Agent only)
router.get('/profile', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    const User = mongoose.model('User');
    const deliveryAgent = await User.findById(req.user.id).select('-password');
    
    if (!deliveryAgent) {
      return res.status(404).json({ 
        success: false, 
        message: 'Delivery agent not found' 
      });
    }

    res.json({
      success: true,
      data: deliveryAgent
    });
  } catch (error) {
    console.error('Error fetching delivery profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/delivery/profile
// @desc    Update delivery agent profile
// @access  Private (Delivery Agent only)
router.put('/profile', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    const { phone, address, name, vehicleType, vehicleNumber, licenseNumber } = req.body;
    const updateFields = {};
    
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (name) updateFields.name = name;
    if (vehicleType) updateFields.vehicleType = vehicleType;
    if (vehicleNumber) updateFields.vehicleNumber = vehicleNumber;
    if (licenseNumber) updateFields.licenseNumber = licenseNumber;

    const User = mongoose.model('User');
    const updatedAgent = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAgent
    });
  } catch (error) {
    console.error('Error updating delivery profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/delivery/orders
// @desc    Get assigned orders for delivery agent
// @access  Private (Delivery Agent only)
router.get('/orders', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    const Order = mongoose.model('Order');
    const orders = await Order.find({ 
      deliveryAgentId: req.user.id,
      status: { $in: ['out_for_delivery', 'dispatched'] }
    })
    .populate('customerId', 'name phone address')
    .populate('shopId', 'name address phone')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/delivery/available-orders
// @desc    Get available orders for delivery (not assigned to any agent)
// @access  Private (Delivery Agent only)
router.get('/available-orders', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    const Order = mongoose.model('Order');
    const availableOrders = await Order.find({ 
      deliveryAgentId: null,
      status: 'ready_for_delivery'
    })
    .populate('customerId', 'name phone address')
    .populate('shopId', 'name address phone')
    .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: availableOrders,
      count: availableOrders.length
    });
  } catch (error) {
    console.error('Error fetching available orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/delivery/accept-order/:orderId
// @desc    Accept an available order for delivery
// @access  Private (Delivery Agent only)
router.put('/accept-order/:orderId', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    const Order = mongoose.model('Order');
    const User = mongoose.model('User');
    
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (order.deliveryAgentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order already assigned to another delivery agent' 
      });
    }

    if (order.status !== 'ready_for_delivery') {
      return res.status(400).json({ 
        success: false, 
        message: 'Order is not ready for delivery' 
      });
    }

    const deliveryAgent = await User.findById(req.user.id);
    
    order.deliveryAgentId = req.user.id;
    order.deliveryAgentName = deliveryAgent.name;
    order.status = 'out_for_delivery';
    order.deliveryAcceptedAt = new Date();

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name phone address')
      .populate('shopId', 'name address phone')
      .populate('deliveryAgentId', 'name phone');

    res.json({
      success: true,
      message: 'Order accepted for delivery successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/delivery/update-order-status/:orderId
// @desc    Update order delivery status
// @access  Private (Delivery Agent only)
router.put('/update-order-status/:orderId', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Valid statuses: out_for_delivery, delivered, cancelled' 
      });
    }

    const Order = mongoose.model('Order');
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (order.deliveryAgentId?.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not assigned to this order' 
      });
    }

    order.status = status;
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('customerId', 'name phone address')
      .populate('shopId', 'name address phone');

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/delivery/availability
// @desc    Update delivery agent availability
// @access  Private (Delivery Agent only)
router.put('/availability', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const User = mongoose.model('User');

    const updatedAgent = await User.findByIdAndUpdate(
      req.user.id,
      { isOnline: isAvailable },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: `Availability updated to ${isAvailable ? 'online' : 'offline'}`,
      data: updatedAgent
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/delivery/location
// @desc    Update delivery agent current location
// @access  Private (Delivery Agent only)
router.put('/location', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const User = mongoose.model('User');

    const updatedAgent = await User.findByIdAndUpdate(
      req.user.id,
      { 
        currentLocation: { latitude, longitude },
        isOnline: true 
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: updatedAgent
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/delivery/stats
// @desc    Get delivery agent statistics
// @access  Private (Delivery Agent only)
router.get('/stats', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    const Order = mongoose.model('Order');
    
    const totalDeliveries = await Order.countDocuments({ 
      deliveryAgentId: req.user.id,
      status: 'delivered'
    });

    const pendingDeliveries = await Order.countDocuments({ 
      deliveryAgentId: req.user.id,
      status: 'out_for_delivery'
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDeliveries = await Order.countDocuments({ 
      deliveryAgentId: req.user.id,
      status: 'delivered',
      deliveredAt: { $gte: today }
    });

    const earningsRate = 20;
    const totalEarnings = totalDeliveries * earningsRate;
    const todayEarnings = todayDeliveries * earningsRate;

    res.json({
      success: true,
      data: {
        totalDeliveries,
        pendingDeliveries,
        todayDeliveries,
        totalEarnings,
        todayEarnings
      }
    });
  } catch (error) {
    console.error('Error fetching delivery stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/delivery/history
// @desc    Get delivery history
// @access  Private (Delivery Agent only)
router.get('/history', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const Order = mongoose.model('Order');

    const orders = await Order.find({ 
      deliveryAgentId: req.user.id,
      status: 'delivered'
    })
    .populate('customerId', 'name phone address')
    .populate('shopId', 'name address')
    .sort({ deliveredAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Order.countDocuments({ 
      deliveryAgentId: req.user.id,
      status: 'delivered'
    });

    res.json({
      success: true,
      data: {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching delivery history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

export default router;