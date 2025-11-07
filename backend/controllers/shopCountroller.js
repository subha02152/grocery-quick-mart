import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Get shop by owner ID
export const getShopByOwner = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        shop
      }
    });
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop details'
    });
  }
};

// Create or update shop
export const createOrUpdateShop = async (req, res) => {
  try {
    const { name, description, address, phone, email, isOpen, openingHours } = req.body;
    
    let shop = await Shop.findOne({ ownerId: req.user.id });

    if (shop) {
      // Update existing shop
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        {
          name,
          description,
          address,
          phone,
          email,
          isOpen,
          openingHours,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new shop
      shop = await Shop.create({
        name,
        description,
        address,
        phone,
        email,
        ownerId: req.user.id,
        isOpen,
        openingHours
      });
    }

    res.status(200).json({
      success: true,
      message: shop.isNew ? 'Shop created successfully!' : 'Shop updated successfully!',
      data: {
        shop
      }
    });
  } catch (error) {
    console.error('Create/update shop error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error saving shop details'
    });
  }
};

// Get shop statistics
export const getShopStats = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const totalProducts = await Product.countDocuments({ shopId: shop._id });
    const totalOrders = await Order.countDocuments({ shopId: shop._id });
    const pendingOrders = await Order.countDocuments({ 
      shopId: shop._id, 
      status: { $in: ['pending', 'confirmed', 'packed'] } 
    });
    
    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { shopId: shop._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalOrders,
          pendingOrders,
          totalRevenue
        }
      }
    });
  } catch (error) {
    console.error('Get shop stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop statistics'
    });
  }
};