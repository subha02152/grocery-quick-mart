import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

console.log('🔧 Environment check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Found' : '❌ Missing');
console.log('PORT:', process.env.PORT);

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
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
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
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

// FIXED: Auth middleware - Use valid MongoDB ObjectId
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // FIXED: Use valid MongoDB ObjectId instead of "mock-user-id"
    req.user = { 
      id: new mongoose.Types.ObjectId('65a1b2c3d4e5f6a7b8c9d0e1') // Valid ObjectId
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    console.log('📝 Registration attempt:', { name, email, role });

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user in MongoDB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: role || 'customer'
    });

    // Remove password from response
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;

    // Mock token
    const token = 'jwt-token-' + Date.now();

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

    // Check if user exists in MongoDB
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches (using bcrypt)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Remove password from response
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    // Mock token
    const token = 'jwt-token-' + Date.now();

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

// FIXED: Shop routes - Return null instead of 404 when no shop found
app.get('/api/shops', protect, async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });
    
    // FIXED: Return shop or null, don't throw 404 error
    res.status(200).json({
      success: true,
      data: {
        shop: shop || null
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

app.post('/api/shops', protect, async (req, res) => {
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
});

app.get('/api/shops/stats', protect, async (req, res) => {
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
});

// FIXED: Product routes - Return empty array instead of 404
app.get('/api/products', protect, async (req, res) => {
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
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        products,
        count: products.length
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

app.post('/api/products', protect, async (req, res) => {
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

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      data: {
        product
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

app.put('/api/products/:id', protect, async (req, res) => {
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

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      data: {
        product
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

app.delete('/api/products/:id', protect, async (req, res) => {
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

// FIXED: Order routes - Return empty array instead of 404
app.get('/api/orders', protect, async (req, res) => {
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
});

app.put('/api/orders/:id/status', protect, async (req, res) => {
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
    );

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
});

app.get('/api/orders/stats', protect, async (req, res) => {
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

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get all users (for testing)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    res.json({
      success: true,
      data: {
        users,
        count: users.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
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
    
    // Test: List all collections
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
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🛍️ Shop routes: http://localhost:${PORT}/api/shops`);
      console.log(`📦 Product routes: http://localhost:${PORT}/api/products`);
      console.log(`📋 Order routes: http://localhost:${PORT}/api/orders`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();