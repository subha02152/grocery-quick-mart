import { Package, MapPin, Phone, Clock } from 'lucide-react';
import { Order } from '../../types';
import { toast } from '../../utils/toast';

const AssignedDeliveries = () => {
  // Hardcoded deliveries - NO API CALLS
  const deliveries: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Doe',
      customerPhone: '+1 (555) 123-4567',
      deliveryAddress: '123 Main Street, City Center',
      totalAmount: 25.97,
      items: [
        { name: 'Apples', quantity: 2, price: 2.99, unit: 'kg' },
        { name: 'Bananas', quantity: 1, price: 1.49, unit: 'dozen' },
        { name: 'Bread', quantity: 1, price: 3.99, unit: 'pack' }
      ],
      createdAt: '2024-01-17T10:30:00Z',
      updatedAt: '2024-01-17T10:30:00Z',
      status: 'dispatched'
    },
    {
      id: '2',
      orderNumber: 'ORD-003',
      customerName: 'Jane Smith',
      customerPhone: '+1 (555) 987-6543',
      deliveryAddress: '456 Oak Avenue, Downtown',
      totalAmount: 32.50,
      items: [
        { name: 'Potatoes', quantity: 3, price: 1.99, unit: 'kg' },
        { name: 'Apples', quantity: 1, price: 2.99, unit: 'kg' },
        { name: 'Milk', quantity: 2, price: 2.49, unit: 'liter' }
      ],
      createdAt: '2024-01-17T11:15:00Z',
      updatedAt: '2024-01-17T11:15:00Z',
      status: 'dispatched'
    }
  ];

  const updateDeliveryStatus = (orderId: string, status: string) => {
    toast.success(`Delivery marked as ${status}`);
    alert(`Order ${orderId} marked as ${status}`);
  };

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
                    Delivery #{order.orderNumber}
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