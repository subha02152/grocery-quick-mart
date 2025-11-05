export interface Shop {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  phone: string;
  description?: string;
  isOpen: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  stock: number;
  imageUrl?: string;
  category?: string;
  isAvailable: boolean;
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

export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  deliveryAgentId?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'packed' | 'dispatched' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  customerPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}
