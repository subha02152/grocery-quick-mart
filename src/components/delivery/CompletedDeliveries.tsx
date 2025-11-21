import { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, User, MapPin, Phone, Truck } from 'lucide-react';
import { Order } from '../../types';
import { deliveryAPI } from '../../utils/api';
import Loading from '../shared/Loading';

const CompletedDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCompletedDeliveries();
  }, []);

  const fetchCompletedDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveryAPI.getCompletedOrders();
      if (response.success) {
        setDeliveries(response.data.orders || []);
        console.log('✅ Loaded completed deliveries:', response.data.orders?.length || 0);
      } else {
        console.error('Failed to fetch completed deliveries:', response.message);
      }
    } catch (error) {
      console.error('Error fetching completed deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchCompletedDeliveries();
    setRefreshing(false);
  };

  const getDeliveryDate = (order: Order) => {
    // Use deliveredAt if available, otherwise use updatedAt
    return (order as any).deliveredAt || order.updatedAt;
  };

  const getShopName = (order: Order) => {
    return (order as any).shopName || (order as any).shopId?.name || 'Unknown Shop';
  };

  if (loading) {
    return <Loading message="Loading completed deliveries..." />;
  }

  if (deliveries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Completed Deliveries
          </h3>
          <p className="text-gray-500 mb-6">
            Your delivery history will appear here once you complete deliveries
          </p>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center mx-auto"
          >
            <Clock className="h-4 w-4 mr-2" />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Delivery History</h2>
          <p className="text-gray-600 mt-1">Your completed delivery orders</p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center"
        >
          <Clock className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow">
          <p className="text-green-600 text-sm font-medium">Total Completed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{deliveries.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow">
          <p className="text-blue-600 text-sm font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{deliveries.reduce((total, order) => total + order.totalAmount, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500 shadow">
          <p className="text-purple-600 text-sm font-medium">Avg. Order Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{(deliveries.reduce((total, order) => total + order.totalAmount, 0) / deliveries.length).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-6">
        {deliveries.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md border-l-4 border-green-500 hover:shadow-lg transition"
          >
            {/* Order Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-bold text-gray-900 text-lg">
                      Order #{order.orderNumber}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Successfully Delivered
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Delivered: {new Date(getDeliveryDate(order)).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="flex items-center">
                      <Truck className="h-4 w-4 mr-2" />
                      Shop: {getShopName(order)}
                    </p>
                    <p className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-green-600">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Total Amount</p>
                </div>
              </div>
            </div>

            {/* Customer & Delivery Info */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center">
                      <span className="font-medium text-gray-700 w-16">Name:</span>
                      <span className="text-gray-900">{order.customerName}</span>
                    </p>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium text-gray-700 w-16">Phone:</span>
                      <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">
                        {order.customerPhone}
                      </a>
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Delivery Address
                  </h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {order.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Delivered */}
            <div className="p-6">
              <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Items Delivered ({order.items.length})
              </h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 block">
                        {item.name}
                      </span>
                      <span className="text-sm text-gray-600">
                        Quantity: {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900 block">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600">
                        ₹{item.price} each
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Order Summary */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Order Total</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  Order created: {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <span>
                  Order ID: {order.id}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Summary */}
      {deliveries.length > 0 && (
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border">
          <div className="text-center text-gray-600">
            <p>
              Showing {deliveries.length} completed delivery{deliveries.length > 1 ? 's' : ''} • 
              Total Revenue: <span className="font-semibold text-green-600">
                ₹{deliveries.reduce((total, order) => total + order.totalAmount, 0).toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedDeliveries;