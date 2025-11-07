import Order from '../models/Order.js';
import Shop from '../models/Shop.js';

// Get all orders for a shop
export const getShopOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const { status } = req.query;
    const filter = { shopId: shop._id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .populate('deliveryAgentId', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        orders,
        count: orders.length
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, shopId: shop._id },
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('customerId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
};

// Get order statistics
export const getOrderStats = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const stats = await Order.aggregate([
      { $match: { shopId: shop._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ shopId: shop._id });
    const pendingOrders = await Order.countDocuments({ 
      shopId: shop._id, 
      status: { $in: ['pending', 'confirmed', 'packed'] } 
    });

    res.status(200).json({
      success: true,
      data: {
        stats,
        totalOrders,
        pendingOrders
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order statistics'
    });
  }
};