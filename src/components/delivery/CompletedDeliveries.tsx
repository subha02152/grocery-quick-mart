import { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Truck, 
  RefreshCw,
  Star,
  TrendingUp,
  Award,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Order } from '../../types';
import { deliveryAPI } from '../../utils/api';
import Loading from '../shared/Loading';

const CompletedDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchCompletedDeliveries();
  }, []);

  const fetchCompletedDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveryAPI.getCompletedOrders();
      if (response.success) {
        setDeliveries(response.data.orders || []);
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
    return (order as any).deliveredAt || order.updatedAt;
  };

  const getShopName = (order: Order) => {
    return (order as any).shopName || (order as any).shopId?.name || 'Unknown Shop';
  };

  const getFilteredDeliveries = () => {
    const now = new Date();
    const filtered = deliveries.filter(order => {
      const deliveryDate = new Date(getDeliveryDate(order));
      
      switch (timeFilter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return deliveryDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return deliveryDate >= monthAgo;
        default:
          return true;
      }
    });
    
    return filtered.sort((a, b) => 
      new Date(getDeliveryDate(b)).getTime() - new Date(getDeliveryDate(a)).getTime()
    );
  };

  const filteredDeliveries = getFilteredDeliveries();

  const getStats = () => {
    const totalRevenue = filteredDeliveries.reduce((total, order) => total + order.totalAmount, 0);
    const avgOrderValue = filteredDeliveries.length > 0 ? totalRevenue / filteredDeliveries.length : 0;
    const completedCount = filteredDeliveries.length;

    return { totalRevenue, avgOrderValue, completedCount };
  };

  const { totalRevenue, avgOrderValue, completedCount } = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Loading message="Loading your delivery history..." />
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <CheckCircle className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-700 mb-4">No Delivery History Yet</h3>
            <p className="text-gray-500 text-lg mb-8">
              Your completed deliveries will appear here once you start delivering orders. 
              Keep up the great work!
            </p>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center mx-auto space-x-2"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Delivery History</h1>
            <p className="text-gray-600 text-lg">Track your completed deliveries and earnings</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Time Filter */}
            <div className="bg-white rounded-xl p-2 shadow-sm border">
              <div className="flex space-x-1">
                {[
                  { key: 'all', label: 'All Time' },
                  { key: 'month', label: 'This Month' },
                  { key: 'week', label: 'This Week' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTimeFilter(key as any)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      timeFilter === key
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-green-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={refreshData}
              disabled={refreshing}
              className="bg-white text-green-600 px-6 py-3 rounded-xl hover:bg-green-50 transition-all duration-200 disabled:opacity-50 border border-green-200 shadow-sm hover:shadow-md flex items-center space-x-2 font-semibold"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{completedCount}</p>
                <p className="text-gray-500 text-sm mt-1">Deliveries</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalRevenue.toFixed(2)}</p>
                <p className="text-gray-500 text-sm mt-1">Earnings</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Avg. Order</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{avgOrderValue.toFixed(2)}</p>
                <p className="text-gray-500 text-sm mt-1">Per Delivery</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        <div className="space-y-6">
          {filteredDeliveries.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="font-bold text-2xl">Order #{order.orderNumber}</span>
                      <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>SUCCESSFULLY DELIVERED</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-green-100">
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
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
                  
                  <div className="text-right ml-6">
                    <p className="text-3xl font-bold">₹{order.totalAmount.toFixed(2)}</p>
                    <p className="text-green-200 text-sm mt-1">Order Value</p>
                  </div>
                </div>
              </div>

              {/* Customer & Delivery Info */}
              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4 flex items-center text-lg">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Customer Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-gray-700">Customer Name</span>
                        <span className="text-gray-900 font-semibold">{order.customerName}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-gray-700 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Contact
                        </span>
                        <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:text-blue-700 font-semibold">
                          {order.customerPhone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4 flex items-center text-lg">
                      <MapPin className="h-5 w-5 mr-2 text-green-600" />
                      Delivery Address
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 h-full">
                      <p className="text-gray-900 leading-relaxed">{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Delivered */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center text-lg">
                  <Package className="h-5 w-5 mr-2 text-purple-600" />
                  Items Delivered ({order.items.length})
                </h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900 block text-lg">{item.name}</span>
                        <span className="text-gray-600">
                          {item.quantity} {item.unit} × ₹{item.price} each
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 block text-xl">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Order Summary */}
                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-300">
                    <span className="font-bold text-gray-900 text-xl">Order Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                  <span className="flex items-center mb-2 sm:mb-0">
                    <Clock className="h-4 w-4 mr-2" />
                    Order created: {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                    ID: {order.id.slice(-8)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Summary */}
        {filteredDeliveries.length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border">
            <div className="text-center">
              <p className="text-gray-600 text-lg">
                Showing <span className="font-semibold text-green-600">{filteredDeliveries.length}</span> completed 
                deliver{filteredDeliveries.length > 1 ? 'ies' : 'y'} • 
                Total Revenue: <span className="font-bold text-green-600 text-xl">
                  ₹{totalRevenue.toFixed(2)}
                </span>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Filter: {timeFilter === 'all' ? 'All Time' : timeFilter === 'month' ? 'This Month' : 'This Week'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedDeliveries;