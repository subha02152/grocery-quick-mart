import { useState, useEffect } from 'react';
import { Package, MapPin, Phone, Clock } from 'lucide-react';
import { Order } from '../../types';
import { toast } from '../../utils/toast';
import { deliveryAPI } from '../../utils/api';
import Loading from '../shared/Loading';

const AssignedDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedDeliveries();
  }, []);

  const fetchAssignedDeliveries = async () => {
    setLoading(true);
    try {
      const response = await deliveryAPI.getAssignedOrders();
      if (response.success) {
        setDeliveries(response.data.orders);
        console.log('✅ Loaded assigned deliveries:', response.data.orders.length);
      } else {
        toast.error('Failed to load assigned deliveries');
      }
    } catch (error) {
      console.error('Error fetching assigned deliveries:', error);
      toast.error('Failed to load assigned deliveries');
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (orderId: string) => {
    try {
      const response = await deliveryAPI.markAsDelivered(orderId);
      if (response.success) {
        toast.success('Order marked as delivered!');
        // Remove from assigned deliveries
        setDeliveries(deliveries.filter(delivery => delivery.id !== orderId));
        console.log('✅ Order marked as delivered:', orderId);
      } else {
        toast.error('Failed to update delivery status');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast.error('Failed to update delivery status');
    }
  };

  if (loading) {
    return <Loading message="Loading assigned deliveries..." />;
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
      <h2 className="text-2xl font-bold mb-6">Assigned Deliveries ({deliveries.length})</h2>

      <div className="space-y-4">
        {deliveries.map((order) => (
          <div
            key={order.id}
            className="border border-orange-200 rounded-lg p-6 bg-orange-50 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    Order #{order.orderNumber}
                  </span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
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
                <p className="text-2xl font-bold text-orange-600">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="border-t border-orange-200 pt-4 mb-4">
              <h4 className="font-semibold mb-2 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Items:
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

            <div className="border-t border-orange-200 pt-4 mb-4 space-y-2">
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
              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700">Shop:</span>{' '}
                <span className="text-gray-600 ml-2">{order.shopName}</span>
              </div>
            </div>

            <button
              onClick={() => updateDeliveryStatus(order.id)}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition font-semibold"
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