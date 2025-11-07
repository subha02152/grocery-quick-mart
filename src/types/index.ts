// types.ts

// Base interface for common MongoDB fields
interface BaseEntity {
  id: string;
  _id?: string; // MongoDB ID
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Shop extends BaseEntity {
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
  location?: {
    latitude: number;
    longitude: number;
  };
  deliveryRadius?: number; // in km
}

export interface Product extends BaseEntity {
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
  minOrder?: number;
  maxOrder?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image?: string;
  total: number; // price * quantity
}

// Use string literals for better TypeScript support
export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'dispatched' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export type PaymentMethod = 
  | 'cash' 
  | 'card' 
  | 'upi' 
  | 'wallet' 
  | 'net_banking';

export interface Order extends BaseEntity {
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shopId: string;
  shopName?: string; // Denormalized for performance
  items: OrderItem[];
  subtotal: number; // Items total before fees
  deliveryFee: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  deliveryAddress: string;
  deliveryCoordinates?: {
    latitude: number;
    longitude: number;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentId?: string;
  deliveryInstructions?: string;
  expectedDelivery?: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  deliveryAgentId?: string;
  deliveryAgentName?: string;
  rating?: number;
  review?: string;
  cancellationReason?: string;
  preparedAt?: string;
}

export interface CartItem {
  productId: string;
  shopId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
  maxOrder?: number;
  isAvailable?: boolean;
  total: number; // price * quantity
}

export type UserRole = 'customer' | 'shop_owner' | 'delivery_agent' | 'admin';

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  avatar?: string;
  
  // Delivery agent specific fields
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  isOnline?: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  
  // Shop owner specific fields
  shopId?: string;
}

export interface DeliveryAgent {
  id: string;
  _id?: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  isOnline: boolean;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  totalDeliveries?: number;
  completedDeliveries?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Specific response types for better type safety
export interface OrdersResponse {
  orders: Order[];
  pagination?: ApiResponse['pagination'];
}

export interface ProductsResponse {
  products: Product[];
  pagination?: ApiResponse['pagination'];
}

export interface ShopsResponse {
  shops: Shop[];
  pagination?: ApiResponse['pagination'];
}