import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

console.log('🔧 Environment check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Found' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Found' : '❌ Missing');
console.log('PORT:', process.env.PORT);

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
});
app.use(limiter);

// CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  role: { type: String, enum: ['customer', 'shop_owner', 'delivery_agent'], default: 'customer' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// Shop Schema
const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  isOpen: { type: Boolean, default: true },
  openingHours: { type: String, default: '9:00 AM - 9:00 PM' },
  categories: [{ type: String }],
  logo: { type: String },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Shop = mongoose.model('Shop', shopSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  unit: { 
    type: String, 
    required: true,
    enum: ['kg', 'g', 'lb', 'oz', 'piece', 'dozen', 'pack', 'bottle', 'liter', 'ml']
  },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  images: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  tags: [{ type: String }],
  discount: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

// Order Schema
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    default: 'cash'
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

// ========================
// REAL JWT AUTH MIDDLEWARE
// ========================

// Universal JWT protect middleware
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

    // Get user from token
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

    // Attach user to request
    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

// Role-based middleware
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

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '30d' }
  );
};

// ========================
// CUSTOMER ROUTES (Public)
// ========================

// Get all active shops
app.get('/api/customer/shops', async (req, res) => {
  try {
    const shops = await Shop.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Convert to frontend format
    const formattedShops = shops.map(shop => ({
      id: shop._id.toString(),
      _id: shop._id.toString(),
      name: shop.name,
      description: shop.description,
      address: shop.address,
      phone: shop.phone,
      email: shop.email,
      ownerId: shop.ownerId.toString(),
      isActive: shop.isActive,
      isOpen: shop.isOpen,
      openingHours: shop.openingHours,
      categories: shop.categories || [],
      logo: shop.logo,
      rating: shop.rating,
      totalReviews: shop.totalReviews,
      createdAt: shop.createdAt.toISOString(),
      updatedAt: shop.updatedAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: {
        shops: formattedShops,
        count: formattedShops.length
      }
    });
  } catch (error) {
    console.error('Get customer shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shops'
    });
  }
});

// Get products for a specific shop
app.get('/api/customer/shops/:shopId/products', async (req, res) => {
  try {
    const { shopId } = req.params;
    
    // Validate shopId
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shop ID'
      });
    }

    const products = await Product.find({ 
      shopId, 
      isAvailable: true
    }).sort({ createdAt: -1 }).lean();

    // Convert to frontend format
    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      unit: product.unit,
      stock: product.stock,
      category: product.category,
      images: product.images || [],
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured || false,
      shopId: product.shopId.toString(),
      tags: product.tags || [],
      discount: product.discount || 0,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: {
        products: formattedProducts,
        count: formattedProducts.length
      }
    });
  } catch (error) {
    console.error('Get shop products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

// Create order route - NOW WITH REAL AUTH
app.post('/api/customer/orders', protect, async (req, res) => {
  try {
    console.log('📦 Creating order with data:', req.body);
    console.log('👤 Authenticated user:', req.user);
    
    const { shopId, items, totalAmount, deliveryAddress, paymentMethod } = req.body;

    // Validation
    if (!shopId || !items || !totalAmount || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: shopId, items, totalAmount, deliveryAddress'
      });
    }

    // Get user details from authenticated user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate shop
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    console.log('✅ All validations passed, creating order...');

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;
    console.log(`🔢 Generated order number: ${orderNumber}`);

    // Create order with REAL user ID
    const order = new Order({
      orderNumber: orderNumber,
      customerId: user._id, // ✅ REAL USER ID FROM JWT
      customerName: user.name,
      customerPhone: user.phone,
      customerEmail: user.email,
      shopId: shop._id,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image || ''
      })),
      totalAmount,
      deliveryAddress: deliveryAddress || user.address,
      paymentMethod: paymentMethod || 'cash',
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();
    console.log('✅ Order saved to MongoDB:', order.orderNumber);

    // Convert to frontend format
    const formattedOrder = {
      id: order._id.toString(),
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerId: order.customerId.toString(),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      shopId: order.shopId.toString(),
      shopName: shop.name,
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image
      })),
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };

    console.log('🎉 Order created successfully for user:', user.email);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        order: formattedOrder
      }
    });
  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing order: ' + error.message
    });
  }
});

// Get customer orders - NOW WITH REAL AUTH
app.get('/api/customer/orders', protect, async (req, res) => {
  try {
    console.log('📋 Fetching orders for user:', req.user.id);

    const orders = await Order.find({ customerId: req.user.id })
      .populate('shopId', 'name phone address')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${orders.length} orders for user`);

    // Convert to frontend format
    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerId: order.customerId.toString(),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      shopId: order.shopId._id.toString(),
      shopName: order.shopId.name,
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image
      })),
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        count: formattedOrders.length
      }
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// ========================
// AUTH ROUTES
// ========================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    console.log('📝 Registration attempt:', { name, email, role });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: role || 'customer'
    });

    // Generate JWT token
    const token = generateToken(newUser._id);

    // Remove password from response
    const userResponse = { 
      id: newUser._id.toString(),
      _id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString()
    };

    console.log('✅ User registered successfully:', newUser.email);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to QuickMart!',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in registration process'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email });

    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = { 
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    console.log('✅ User logged in successfully:', user.email);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in login process'
    });
  }
});

// ========================
// SHOP OWNER ROUTES
// ========================

app.get('/api/shops', protect, authorizeRoles('shop_owner'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(200).json({
        success: true,
        data: {
          shop: null
        }
      });
    }

    const formattedShop = {
      id: shop._id.toString(),
      _id: shop._id.toString(),
      name: shop.name,
      description: shop.description,
      address: shop.address,
      phone: shop.phone,
      email: shop.email,
      ownerId: shop.ownerId.toString(),
      isActive: shop.isActive,
      isOpen: shop.isOpen,
      openingHours: shop.openingHours,
      categories: shop.categories || [],
      logo: shop.logo,
      rating: shop.rating,
      totalReviews: shop.totalReviews,
      createdAt: shop.createdAt.toISOString(),
      updatedAt: shop.updatedAt.toISOString()
    };

    res.status(200).json({
      success: true,
      data: {
        shop: formattedShop
      }
    });
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop details'
    });
  }
});

app.post('/api/shops', protect, authorizeRoles('shop_owner'), async (req, res) => {
  try {
    const { name, description, address, phone, email, isOpen, openingHours } = req.body;
    
    let shop = await Shop.findOne({ ownerId: req.user.id });

    if (shop) {
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

    const formattedShop = {
      id: shop._id.toString(),
      _id: shop._id.toString(),
      name: shop.name,
      description: shop.description,
      address: shop.address,
      phone: shop.phone,
      email: shop.email,
      ownerId: shop.ownerId.toString(),
      isActive: shop.isActive,
      isOpen: shop.isOpen,
      openingHours: shop.openingHours,
      categories: shop.categories || [],
      logo: shop.logo,
      rating: shop.rating,
      totalReviews: shop.totalReviews,
      createdAt: shop.createdAt.toISOString(),
      updatedAt: shop.updatedAt.toISOString()
    };

    res.status(200).json({
      success: true,
      message: shop.isNew ? 'Shop created successfully!' : 'Shop updated successfully!',
      data: {
        shop: formattedShop
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
});

app.get('/api/shops/stats', protect, authorizeRoles('shop_owner'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(200).json({
        success: true,
        data: {
          stats: {
            totalProducts: 0,
            totalOrders: 0,
            pendingOrders: 0,
            totalRevenue: 0
          }
        }
      });
    }

    const totalProducts = await Product.countDocuments({ shopId: shop._id });
    const totalOrders = await Order.countDocuments({ shopId: shop._id });
    const pendingOrders = await Order.countDocuments({ 
      shopId: shop._id, 
      status: { $in: ['pending', 'confirmed', 'packed'] } 
    });
    
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
});

// ========================
// PRODUCT ROUTES
// ========================

app.get('/api/products', protect, authorizeRoles('shop_owner'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          count: 0
        }
      });
    }

    const products = await Product.find({ shopId: shop._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedProducts = products.map(product => ({
      id: product._id.toString(),
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      unit: product.unit,
      stock: product.stock,
      category: product.category,
      images: product.images || [],
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured || false,
      shopId: product.shopId.toString(),
      tags: product.tags || [],
      discount: product.discount || 0,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: {
        products: formattedProducts,
        count: formattedProducts.length
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

app.post('/api/products', protect, authorizeRoles('shop_owner'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found. Please create a shop first.'
      });
    }

    const product = await Product.create({
      ...req.body,
      shopId: shop._id
    });

    const formattedProduct = {
      id: product._id.toString(),
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      unit: product.unit,
      stock: product.stock,
      category: product.category,
      images: product.images || [],
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured || false,
      shopId: product.shopId.toString(),
      tags: product.tags || [],
      discount: product.discount || 0,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      data: {
        product: formattedProduct
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
});

app.put('/api/products/:id', protect, authorizeRoles('shop_owner'), async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, shopId: shop._id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const formattedProduct = {
      id: product._id.toString(),
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      unit: product.unit,
      stock: product.stock,
      category: product.category,
      images: product.images || [],
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured || false,
      shopId: product.shopId.toString(),
      tags: product.tags || [],
      discount: product.discount || 0,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      data: {
        product: formattedProduct
      }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
});

app.delete('/api/products/:id', protect, authorizeRoles('shop_owner'), async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    const product = await Product.findOneAndDelete({ _id: id, shopId: shop._id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully!'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
});

// ========================
// ORDER ROUTES (Shop Owner)
// ========================

app.get('/api/orders', protect, authorizeRoles('shop_owner'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(200).json({
        success: true,
        data: {
          orders: [],
          count: 0
        }
      });
    }

    const { status } = req.query;
    const filter = { shopId: shop._id };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerId: order.customerId._id.toString(),
      customerName: order.customerId.name,
      customerPhone: order.customerId.phone,
      customerEmail: order.customerId.email,
      shopId: order.shopId.toString(),
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image
      })),
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        count: formattedOrders.length
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

app.put('/api/orders/:id/status', protect, authorizeRoles('shop_owner'), async (req, res) => {
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

    const formattedOrder = {
      id: order._id.toString(),
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerId: order.customerId._id.toString(),
      customerName: order.customerId.name,
      customerPhone: order.customerId.phone,
      customerEmail: order.customerId.email,
      shopId: order.shopId.toString(),
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image
      })),
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: {
        order: formattedOrder
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

app.get('/api/orders/stats', protect, authorizeRoles('shop_owner'), async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    if (!shop) {
      return res.status(200).json({
        success: true,
        data: {
          stats: [],
          totalOrders: 0,
          pendingOrders: 0
        }
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
});

// ========================
// DELIVERY AGENT ROUTES
// ========================

// Get assigned deliveries (dispatched orders)
app.get('/api/delivery/assigned-orders', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    console.log('📦 Fetching assigned orders from MongoDB...');
    
    const orders = await Order.find({ 
      status: 'dispatched'
    })
    .populate('shopId', 'name phone address')
    .populate('customerId', 'name email phone')
    .sort({ createdAt: -1 })
    .lean();

    console.log(`✅ Found ${orders.length} dispatched orders`);

    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerId: order.customerId._id.toString(),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      deliveryAddress: order.deliveryAddress,
      shopId: order.shopId._id.toString(),
      shopName: order.shopId.name,
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image || ''
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        count: formattedOrders.length
      }
    });
  } catch (error) {
    console.error('❌ Get assigned orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned orders: ' + error.message
    });
  }
});

// Get completed deliveries (delivered orders)
app.get('/api/delivery/completed-orders', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    console.log('📦 Fetching completed orders from MongoDB...');
    
    const orders = await Order.find({ 
      status: 'delivered'
    })
    .populate('shopId', 'name phone address')
    .populate('customerId', 'name email phone')
    .sort({ updatedAt: -1 })
    .lean();

    console.log(`✅ Found ${orders.length} delivered orders`);

    const formattedOrders = orders.map(order => ({
      id: order._id.toString(),
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerId: order.customerId._id.toString(),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      deliveryAddress: order.deliveryAddress,
      shopId: order.shopId._id.toString(),
      shopName: order.shopId.name,
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image || ''
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: {
        orders: formattedOrders,
        count: formattedOrders.length
      }
    });
  } catch (error) {
    console.error('❌ Get completed orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching completed orders: ' + error.message
    });
  }
});

// Mark order as delivered
app.put('/api/delivery/orders/:id/deliver', protect, authorizeRoles('delivery_agent'), async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📦 Marking order ${id} as delivered...`);

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { 
        status: 'delivered',
        paymentStatus: 'paid',
        updatedAt: new Date()
      },
      { new: true }
    )
    .populate('shopId', 'name phone address')
    .populate('customerId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log(`✅ Order ${order.orderNumber} marked as delivered`);

    const formattedOrder = {
      id: order._id.toString(),
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerId: order.customerId._id.toString(),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      deliveryAddress: order.deliveryAddress,
      shopId: order.shopId._id.toString(),
      shopName: order.shopId.name,
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image || ''
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Order marked as delivered successfully!',
      data: {
        order: formattedOrder
      }
    });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status: ' + error.message
    });
  }
});

// ========================
// UTILITY ROUTES
// ========================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get all users (admin only - add proper auth later)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).lean();

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        count: formattedUsers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Initialize sample data
app.post('/api/init-data', async (req, res) => {
  try {
    const shopOwner = await User.findOne({ email: 'shop@example.com' });
    let ownerId;

    if (!shopOwner) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const newOwner = await User.create({
        name: 'Shop Owner',
        email: 'shop@example.com',
        password: hashedPassword,
        phone: '+1234567890',
        address: '123 Shop Street, City',
        role: 'shop_owner'
      });
      ownerId = newOwner._id;
    } else {
      ownerId = shopOwner._id;
    }

    const sampleShops = [
      {
        name: 'Fresh Grocery Store',
        description: 'Your neighborhood fresh grocery store with fresh produce and daily essentials',
        address: '123 Main Street, City Center',
        phone: '+1 (555) 123-4567',
        email: 'fresh@example.com',
        ownerId: ownerId,
        isActive: true,
        isOpen: true,
        categories: ['Fruits', 'Vegetables', 'Dairy']
      },
      {
        name: 'Quick Mart',
        description: 'Fast and convenient shopping for all your grocery needs',
        address: '456 Oak Avenue, Downtown',
        phone: '+1 (555) 987-6543',
        email: 'quick@example.com',
        ownerId: ownerId,
        isActive: true,
        isOpen: true,
        categories: ['Bakery', 'Snacks', 'Beverages']
      }
    ];

    for (const shopData of sampleShops) {
      let shop = await Shop.findOne({ name: shopData.name });
      if (!shop) {
        shop = await Shop.create(shopData);
        
        const sampleProducts = [
          {
            name: 'Fresh Apples',
            description: 'Sweet and crunchy red apples, perfect for snacks',
            price: 2.99,
            unit: 'kg',
            stock: 50,
            category: 'Fruits',
            shopId: shop._id,
            isAvailable: true
          },
          {
            name: 'Bananas',
            description: 'Fresh yellow bananas, rich in potassium',
            price: 1.49,
            unit: 'dozen',
            stock: 30,
            category: 'Fruits',
            shopId: shop._id,
            isAvailable: true
          },
          {
            name: 'Whole Wheat Bread',
            description: 'Healthy whole wheat bread, freshly baked',
            price: 3.99,
            unit: 'pack',
            stock: 20,
            category: 'Bakery',
            shopId: shop._id,
            isAvailable: true
          }
        ];

        await Product.insertMany(sampleProducts);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Sample data initialized successfully!'
    });
  } catch (error) {
    console.error('Init data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing sample data'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found: ' + req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error'
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI is missing');
      throw new Error('MONGODB_URI is required');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Database collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔐 JWT Authentication enabled`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🛍️ Customer routes: http://localhost:${PORT}/api/customer/shops`);
      console.log(`🏪 Shop owner routes: http://localhost:${PORT}/api/shops`);
      console.log(`📦 Product routes: http://localhost:${PORT}/api/products`);
      console.log(`📋 Order routes: http://localhost:${PORT}/api/orders`);
      console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
      console.log(`🚚 Delivery routes: http://localhost:${PORT}/api/delivery`);
      console.log(`🎯 Initialize sample data: POST http://localhost:${PORT}/api/init-data`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();