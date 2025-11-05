import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import api from '../../utils/api';
import { Order } from '../../types';
import { toast } from '../../utils/toast';
import Loading from '../shared/Loading';

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error: any) {
      toast.error('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'dispatched':
        return <Truck className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
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

  if (loading) {
    return <Loading message="Loading your orders..." />;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No orders yet
        </h3>
        <p className="text-gray-500">
          Your order history will appear here once you place an order
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>

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
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <span className="inline-flex items-center">
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">
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

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm text-gray-700"
                  >
                    <span>
                      {item.name} x {item.quantity} {item.unit}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t mt-4 pt-4 text-sm text-gray-600">
              <p>
                <span className="font-medium">Delivery Address:</span>{' '}
                {order.deliveryAddress}
              </p>
              <p>
                <span className="font-medium">Contact:</span>{' '}
                {order.customerPhone}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
