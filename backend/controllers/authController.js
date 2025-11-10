import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';

// Mock user storage for when MongoDB is not available
let mockUsers = [];

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    console.log('📝 Registration attempt:', { name, email, role });

    // Check if MongoDB is connected by testing if User model works
    let isMongoConnected = false;
    try {
      // Try to use MongoDB if connected
      if (process.env.MONGODB_URI) {
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

        // Create user in MongoDB
        const user = await User.create({
          name,
          email,
          password: hashedPassword,
          phone,
          address,
          role: role || 'customer'
        });

        // ✅ REAL JWT TOKEN
        const token = jwt.sign(
          { id: user._id }, 
          process.env.JWT_SECRET,
          { expiresIn: '30d' }
        );

        // Remove password from response
        const userResponse = {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };

        return res.status(201).json({
          success: true,
          message: 'Registration successful! Welcome to QuickMart!',
          data: {
            user: userResponse,
            token
          }
        });
      }
    } catch (mongoError) {
      console.log('🔄 MongoDB not available, using mock mode');
      isMongoConnected = false;
    }

    // If MongoDB fails or not connected, use mock mode
    // Check if user exists in mock storage
    if (mockUsers.find(user => user.email === email)) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create mock user
    const mockUser = {
      id: Date.now().toString(),
      _id: Date.now().toString(),
      name,
      email,
      phone,
      address,
      role: role || 'customer',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockUsers.push(mockUser);

    // ✅ REAL JWT TOKEN even for mock users
    const token = jwt.sign(
      { id: mockUser.id }, 
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to QuickMart! (Mock Mode)',
      data: {
        user: mockUser,
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
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Try MongoDB first
    try {
      if (process.env.MONGODB_URI) {
        const user = await User.findOne({ email }).select('+password');
        
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

        // ✅ REAL JWT TOKEN
        const token = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: '30d' }
        );

        // Remove password from response
        const userResponse = {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };

        return res.status(200).json({
          success: true,
          message: 'Login successful!',
          data: {
            user: userResponse,
            token
          }
        });
      }
    } catch (mongoError) {
      console.log('🔄 MongoDB not available for login, using mock mode');
    }

    // Mock login
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ✅ REAL JWT TOKEN even for mock users
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful! (Mock Mode)',
      data: {
        user,
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
};

export const getMe = async (req, res) => {
  try {
    // User is already attached to req by the protect middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};