import { useState } from 'react';
import { Truck, CheckCircle, MapPin, Clock, User, Package } from 'lucide-react';

type View = 'assigned' | 'completed';

const DeliveryAgentDashboard = () => {
  const [currentView, setCurrentView] = useState<View>('assigned');

  // Hardcoded assigned deliveries
  const assignedDeliveries = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      customerName: 'John Doe',
      customerPhone: '+1 (555) 123-4567',
      deliveryAddress: '123 Main Street, City Center',
      totalAmount: 25.97,
      items: [
        { name: 'Apples', quantity: 2 },
        { name: 'Bananas', quantity: 1 },
        { name: 'Bread', quantity: 1 }
      ],
      assignedAt: '2024-01-17T10:30:00Z',
      estimatedDelivery: '2024-01-17T14:00:00Z'
    },
    {
      id: '2',
      orderNumber: 'ORD-003',
      customerName: 'Jane Smith',
      customerPhone: '+1 (555) 987-6543',
      deliveryAddress: '456 Oak Avenue, Downtown',
      totalAmount: 32.50,
      items: [
        { name: 'Potatoes', quantity: 3 },
        { name: 'Apples', quantity: 1 },
        { name: 'Milk', quantity: 2 }
      ],
      assignedAt: '2024-01-17T11:15:00Z',
      estimatedDelivery: '2024-01-17T15:30:00Z'
    }
  ];

  // Hardcoded completed deliveries
  const completedDeliveries = [
    {
      id: '3',
      orderNumber: 'ORD-002',
      customerName: 'Mike Johnson',
      customerPhone: '+1 (555) 456-7890',
      deliveryAddress: '789 Green Road, Westside',
      totalAmount: 18.49,
      items: [
        { name: 'Milk', quantity: 2 },
        { name: 'Eggs', quantity: 1 }
      ],
      deliveredAt: '2024-01-16T14:45:00Z',
      completedAt: '2024-01-16T15:00:00Z'
    }
  ];

  const handleMarkDelivered = (deliveryId: string) => {
    alert(`Delivery ${deliveryId} marked as delivered!`);
  };

  const AssignedDeliveries = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Assigned Deliveries</h2>
      
      {assignedDeliveries.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No assigned deliveries
          </h3>
          <p className="text-gray-500">New deliveries will appear here when assigned to you</p>
        </div>
      ) : (
        <div className="space-y-6">
          {assignedDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="border border-orange-200 rounded-lg p-6 bg-orange-50"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      Order #{delivery.orderNumber}
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                      Assigned
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Assigned: {new Date(delivery.assignedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">
                    ₹{delivery.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer Details
                  </h4>
                  <p className="text-sm text-gray-700">{delivery.customerName}</p>
                  <p className="text-sm text-gray-600">{delivery.customerPhone}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Delivery Address
                  </h4>
                  <p className="text-sm text-gray-700">{delivery.deliveryAddress}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Order Items
                </h4>
                <div className="space-y-1">
                  {delivery.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-700">
                      <span>{item.name} x {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  Est. delivery: {new Date(delivery.estimatedDelivery).toLocaleString()}
                </div>
                <button
                  onClick={() => handleMarkDelivered(delivery.id)}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition font-medium"
                >
                  Mark Delivered
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const CompletedDeliveries = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Completed Deliveries</h2>
      
      {completedDeliveries.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No completed deliveries
          </h3>
          <p className="text-gray-500">Your completed deliveries will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {completedDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="border border-green-200 rounded-lg p-6 bg-green-50"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      Order #{delivery.orderNumber}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Delivered
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Delivered: {new Date(delivery.deliveredAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ₹{delivery.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer Details
                  </h4>
                  <p className="text-sm text-gray-700">{delivery.customerName}</p>
                  <p className="text-sm text-gray-600">{delivery.customerPhone}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Delivery Address
                  </h4>
                  <p className="text-sm text-gray-700">{delivery.deliveryAddress}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Order Items
                </h4>
                <div className="space-y-1">
                  {delivery.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-700">
                      <span>{item.name} x {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Delivery Agent Dashboard
          </h1>
          <p className="text-gray-600">Manage your delivery tasks</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCurrentView('assigned')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'assigned'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Truck className="h-5 w-5 mr-2" />
            Assigned Deliveries
          </button>
          <button
            onClick={() => setCurrentView('completed')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'completed'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Completed
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {currentView === 'assigned' && <AssignedDeliveries />}
          {currentView === 'completed' && <CompletedDeliveries />}
        </div>
      </div>
    </div>
  );
};

export default DeliveryAgentDashboard;