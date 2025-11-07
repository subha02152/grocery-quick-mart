import Shop from '../models/Shop.js';
import Product from '../models/Product.js';

// Get all active shops for customers
export const getShops = async (req, res) => {
  try {
    const shops = await Shop.find({ isActive: true, isOpen: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        shops,
        count: shops.length
      }
    });
  } catch (error) {
    console.error('Get customer shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shops'
    });
  }
};

// Get products for a specific shop
export const getShopProducts = async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const products = await Product.find({ 
      shopId, 
      isAvailable: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        products,
        count: products.length
      }
    });
  } catch (error) {
    console.error('Get shop products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};