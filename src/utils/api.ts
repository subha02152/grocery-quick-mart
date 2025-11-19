import axios from 'axios';

// Remove /api from base URL since routes already include /api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Safe token retrieval
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Safe user retrieval
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

// Safe data storage
export const setAuthData = (token: string, user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Safe logout
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

// ========================
// CUSTOMER API FUNCTIONS
// ========================

export const customerAPI = {
  // Get all active shops
  getShops: async () => {
    const response = await api.get('/api/customer/shops');
    return response.data;
  },

  // Get products for a specific shop
  getShopProducts: async (shopId: string) => {
    const response = await api.get(`/api/customer/shops/${shopId}/products`);
    return response.data;
  },

  // Create a new order
  createOrder: async (orderData: {
    shopId: string;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      unit: string;
      image?: string;
    }>;
    totalAmount: number;
    deliveryAddress: string;
    paymentMethod: string;
  }) => {
    const response = await api.post('/api/customer/orders', orderData);
    return response.data;
  },

  // Get customer orders
  getCustomerOrders: async () => {
    const response = await api.get('/api/customer/orders');
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: string) => {
    const response = await api.get(`/api/customer/orders/${orderId}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string) => {
    const response = await api.put(`/api/customer/orders/${orderId}/cancel`);
    return response.data;
  }
};

// ========================
// AUTH API FUNCTIONS
// ========================

export const authAPI = {
  // Register new user
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    role: 'customer' | 'shop_owner' | 'delivery_agent';
  }) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Get current user profile
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: any) => {
    const response = await api.put('/api/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put('/api/auth/password', passwordData);
    return response.data;
  }
};

// ========================
// SHOP OWNER API FUNCTIONS
// ========================

export const shopAPI = {
  // Get shop details
  getShop: async () => {
    const response = await api.get('/api/shops');
    return response.data;
  },

  // Create or update shop
  createOrUpdateShop: async (shopData: {
    name: string;
    description?: string;
    address: string;
    phone: string;
    email: string;
    isOpen?: boolean;
    openingHours?: string;
    categories?: string[];
    logo?: string;
  }) => {
    const response = await api.post('/api/shops', shopData);
    return response.data;
  },

  // Get shop statistics
  getShopStats: async () => {
    const response = await api.get('/api/shops/stats');
    return response.data;
  },

  // Update shop status
  updateShopStatus: async (isOpen: boolean) => {
    const response = await api.put('/api/shops/status', { isOpen });
    return response.data;
  }
};

// ========================
// PRODUCT API FUNCTIONS
// ========================

export const productAPI = {
  // Get all products for shop owner
  getProducts: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },

  // Create new product
  createProduct: async (productData: {
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    unit: string;
    stock: number;
    category: string;
    images?: string[];
    tags?: string[];
    discount?: number;
    isAvailable?: boolean;
    isFeatured?: boolean;
  }) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  // Update product stock
  updateStock: async (id: string, stock: number) => {
    const response = await api.put(`/api/products/${id}/stock`, { stock });
    return response.data;
  }
};

// ========================
// ORDER API FUNCTIONS (Shop Owner)
// ========================

export const orderAPI = {
  // Get all orders for shop owner
  getOrders: async (status?: string) => {
    const url = status ? `/api/orders?status=${status}` : '/api/orders';
    const response = await api.get(url);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.put(`/api/orders/${id}/status`, { status });
    return response.data;
  },

  // Get order statistics
  getOrderStats: async () => {
    const response = await api.get('/api/orders/stats');
    return response.data;
  },

  // Get order details
  getOrderDetails: async (id: string) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  }
};

// ========================
// UPDATED DELIVERY API FUNCTIONS
// ========================

export const deliveryAPI = {
  // ✅ Create delivery account
  createDeliveryAccount: async (accountData: {
    agencyName: string;
    address: string;
    licenseNumber: string;
    mobileNumber: string;
    vehicleType: string;
    vehicleNumber: string;
  }) => {
    const response = await api.post('/api/delivery/create-account', accountData);
    return response.data;
  },

  // ✅ Get assigned orders (dispatched orders)
  getAssignedOrders: async () => {
    const response = await api.get('/api/delivery/assigned-orders');
    return response.data;
  },

  // ✅ Get completed orders (delivered orders)
  getCompletedOrders: async () => {
    const response = await api.get('/api/delivery/completed-orders');
    return response.data;
  },

  // ✅ Mark order as delivered
  markAsDelivered: async (orderId: string) => {
    const response = await api.put(`/api/delivery/orders/${orderId}/deliver`);
    return response.data;
  },

  // Get delivery orders
  getDeliveryOrders: async () => {
    const response = await api.get('/api/delivery/orders');
    return response.data;
  },

  // Accept delivery order
  acceptOrder: async (orderId: string) => {
    const response = await api.put(`/api/delivery/orders/${orderId}/accept`);
    return response.data;
  },

  // Update delivery status
  updateDeliveryStatus: async (orderId: string, status: string) => {
    const response = await api.put(`/api/delivery/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Get delivery history
  getDeliveryHistory: async () => {
    const response = await api.get('/api/delivery/history');
    return response.data;
  }
};

// ========================
// UTILITY API FUNCTIONS
// ========================

export const utilityAPI = {
  // Initialize sample data
  initializeData: async () => {
    const response = await api.post('/api/init-data');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },

  // Clear all data (for testing)
  clearData: async () => {
    const response = await api.delete('/api/clear-data');
    return response.data;
  },

  // Get all shops (for testing)
  getAllShops: async () => {
    const response = await api.get('/api/shops/all');
    return response.data;
  },

  // Get all products (for testing)
  getAllProducts: async () => {
    const response = await api.get('/api/products/all');
    return response.data;
  },

  // Get all users (for testing)
  getAllUsers: async () => {
    const response = await api.get('/api/users');
    return response.data;
  }
};

// ========================
// EXPORT DEFAULT AXIOS INSTANCE
// ========================

export default api;