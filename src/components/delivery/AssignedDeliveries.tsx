import { useEffect, useState } from 'react';
import { Package, MapPin, Phone, Clock } from 'lucide-react';
import api from '../../utils/api';
import { Order } from '../../types';
import { toast } from '../../utils/toast';
import Loading from '../shared/Loading';
import { getUser } from '../../utils/auth';

const AssignedDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await api.get(
        `/orders?deliveryAgentId=${user?.id}&status=dispatched`
      );
      setDeliveries(response.data);
    } catch (error: any) {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Delivery marked as ${status}`);
      fetchDeliveries();
    } catch (error: any) {
      toast.error('Failed to update delivery status');
    }
  };

  if (loading) {
    return <Loading message="Loading deliveries..." />;
  }

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No assigned deliveries
        </h3>
        <p className="text-gray-500">
          New delivery tasks will appear here when assigned
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Assigned Deliveries</h2>

      <div className="space-y-4">
        {deliveries.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    Delivery #{order.id.slice(0, 8)}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Dispatched
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
              <h4 className="font-semibold mb-2 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Items:
              </h4>
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

            <div className="border-t pt-4 mb-4 space-y-2">
              <div className="flex items-start text-sm">
                <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">
                    Delivery Address:
                  </span>
                  <p className="text-gray-600">{order.deliveryAddress}</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">Contact:</span>{' '}
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    {order.customerPhone}
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => updateDeliveryStatus(order.id, 'delivered')}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Mark as Delivered
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedDeliveries;
