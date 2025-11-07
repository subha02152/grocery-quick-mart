import { Package, CheckCircle, Clock } from 'lucide-react';
import { Order } from '../../types';

const CompletedDeliveries = () => {
  // Hardcoded deliveries - NO API CALLS
  const deliveries: Order[] = [
    {
      id: '3',
      orderNumber: 'ORD-002',
      customerName: 'Mike Johnson',
      customerPhone: '+1 (555) 456-7890',
      deliveryAddress: '789 Green Road, Westside',
      totalAmount: 18.49,
      items: [
        { name: 'Milk', quantity: 2, price: 2.49, unit: 'liter' },
        { name: 'Eggs', quantity: 1, price: 4.99, unit: 'dozen' }
      ],
      createdAt: '2024-01-16T09:15:00Z',
      updatedAt: '2024-01-16T15:00:00Z',
      status: 'delivered'
    },
    {
      id: '4',
      orderNumber: 'ORD-004',
      customerName: 'Sarah Wilson',
      customerPhone: '+1 (555) 111-2222',
      deliveryAddress: '321 Pine Street, Northside',
      totalAmount: 42.75,
      items: [
        { name: 'Apples', quantity: 3, price: 2.99, unit: 'kg' },
        { name: 'Bread', quantity: 2, price: 3.99, unit: 'pack' },
        { name: 'Potatoes', quantity: 2, price: 1.99, unit: 'kg' }
      ],
      createdAt: '2024-01-15T14:20:00Z',
      updatedAt: '2024-01-15T18:45:00Z',
      status: 'delivered'
    }
  ];

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
      <h2 className="text-2xl font-bold mb-6">Completed Deliveries</h2>

      <div className="space-y-4">
        {deliveries.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg p-6 bg-green-50"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    Delivery #{order.orderNumber}
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

            <div className="border-t border-green-200 mt-4 pt-4 text-sm text-gray-600">
              <p>
                <span className="font-medium">Delivered to:</span>{' '}
                {order.deliveryAddress}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedDeliveries;