export interface Shop {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email?: string;
  ownerId: string;
  isActive: boolean;
  isOpen: boolean;
  openingHours?: string;
  categories?: string[];
  logo?: string;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  unit: string;
  stock: number;
  category: string;
  images?: string[];
  isAvailable: boolean;
  isFeatured?: boolean;
  shopId: string;
  tags?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  expiryDate?: string;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shopId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  status: 'pending' | 'confirmed' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'wallet';
  deliveryInstructions?: string;
  expectedDelivery?: string;
  deliveryAgentId?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
}

export interface CartItem {
  productId: string;
  shopId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'customer' | 'shop_owner' | 'delivery_agent';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}