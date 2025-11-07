import { useState, useEffect } from 'react';
import { Package, Clock } from 'lucide-react';
import { Order, Shop } from '../../types';
import { toast } from '../../utils/toast';
import { orderAPI } from '../../utils/api';

const ShopOrders = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShopAndOrders();
  }, []);

  const fetchShopAndOrders = async () => {
    try {
      setLoading(true);
      const [shopResponse, ordersResponse] = await Promise.all([
        orderAPI.getShop(),
        orderAPI.getOrders()
      ]);

      if (shopResponse.success) {
        setShop(shopResponse.data.shop);
      }

      if (ordersResponse.success) {
        setOrders(ordersResponse.data.orders);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await orderAPI.updateOrderStatus(orderId, status);
      if (response.success) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
        ));
        toast.success(`Order marked as ${status}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error updating order status';
      toast.error(message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'dispatched':
        return 'bg-blue-100 text-blue-800';
      case 'packed':
        return 'bg-purple-100 text-purple-800';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!shop) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Shop Required
        </h3>
        <p className="text-gray-500">
          Please create a shop first to view orders
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No orders yet
        </h3>
        <p className="text-gray-500">Orders will appear here once customers place them</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders ({orders.length})</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    Order #{order.orderNumber}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm text-gray-700 bg-gray-50 p-2 rounded"
                  >
                    <span>
                      {item.name} x {item.quantity} {item.unit}
                    </span>
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 mb-4 text-sm text-gray-600">
              <p>
                <span className="font-medium">Customer:</span>{' '}
                {order.customerName}
              </p>
              <p>
                <span className="font-medium">Delivery Address:</span>{' '}
                {order.deliveryAddress}
              </p>
              <p>
                <span className="font-medium">Contact:</span>{' '}
                {order.customerPhone}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Cancel
                  </button>
                </>
              )}
              {order.status === 'confirmed' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'packed')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  Mark as Packed
                </button>
              )}
              {order.status === 'packed' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'dispatched')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Mark as Dispatched
                </button>
              )}
              {order.status === 'dispatched' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopOrders;