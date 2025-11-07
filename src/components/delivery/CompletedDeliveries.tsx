import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock } from 'lucide-react';
import { Order } from '../../types';
import { deliveryAPI } from '../../utils/api';
import Loading from '../shared/Loading';

const CompletedDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedDeliveries();
  }, []);

  const fetchCompletedDeliveries = async () => {
    setLoading(true);
    try {
      const response = await deliveryAPI.getCompletedOrders();
      if (response.success) {
        setDeliveries(response.data.orders);
        console.log('✅ Loaded completed deliveries:', response.data.orders.length);
      }
    } catch (error) {
      console.error('Error fetching completed deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading completed deliveries..." />;
  }

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No completed deliveries
        </h3>
        <p className="text-gray-500">
          Your delivery history will appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Completed Deliveries ({deliveries.length})</h2>

      <div className="space-y-4">
        {deliveries.map((order) => (
          <div
            key={order.id}
            className="border border-green-200 rounded-lg p-6 bg-green-50 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    Order #{order.orderNumber}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Delivered
                  </span>
                </div>
                <p className="text-sm text-gray-600 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(order.updatedAt).toLocaleDateString('en-IN', {
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

            <div className="border-t border-green-200 pt-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Items Delivered:
              </h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm text-gray-700 bg-white p-2 rounded"
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

            <div className="border-t border-green-200 mt-4 pt-4 text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Delivered to:</span>{' '}
                {order.deliveryAddress}
              </p>
              <p>
                <span className="font-medium">Customer:</span>{' '}
                {order.customerName} ({order.customerPhone})
              </p>
              <p>
                <span className="font-medium">Shop:</span>{' '}
                {(order as any).shopName ?? 'Unknown Shop'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedDeliveries;