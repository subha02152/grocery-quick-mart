import { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  RefreshCw,
  Star,
  Navigation,
  AlertCircle
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{ name: string; quantity: number; unit: string; price: number }>;
  createdAt: string;
  deliveryAgentId: string;
  shopName?: string;
  shopAddress?: string;
}

const AssignedDeliveries = () => {
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/delivery/assigned-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setAssignedOrders(data.data.orders || []);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Error fetching assigned orders:', error);
      showToast(error.message || 'Failed to load assigned orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      
      let endpoint = '';
      
      if (newStatus === 'delivered') {
        endpoint = `http://localhost:5000/api/delivery/orders/${orderId}/deliver`;
      } else {
        endpoint = `http://localhost:5000/api/delivery/orders/${orderId}/status`;
      }
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        showToast(`Order marked as ${newStatus}`, 'success');
        
        if (newStatus === 'delivered') {
          setAssignedOrders(prev => prev.filter(order => order._id !== orderId));
        } else {
          setAssignedOrders(prev => 
            prev.map(order => 
              order._id === orderId 
                ? { ...order, status: newStatus } 
                : order
            )
          );
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      showToast(error.message || 'Failed to update order status', 'error');
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAssignedOrders();
    showToast('Data refreshed', 'success');
    setRefreshing(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const existingToasts = document.querySelectorAll('[data-toast]');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.setAttribute('data-toast', 'true');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      case 'dispatched':
        return 'bg-blue-500 text-white';
      case 'packed':
        return 'bg-purple-500 text-white';
      case 'confirmed':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Star className="h-4 w-4" />;
      case 'packed':
        return <Package className="h-4 w-4" />;
      case 'dispatched':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getOrdersByStatus = (status: string) => {
    return assignedOrders.filter(order => order.status === status);
  };

  const getPriorityOrders = () => {
    return assignedOrders.filter(order => 
      ['confirmed', 'packed'].includes(order.status)
    );
  };

  if (loading && assignedOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-700">Loading Your Deliveries</h3>
          <p className="text-gray-500 mt-2">Getting your assigned orders ready...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Deliveries</h1>
            <p className="text-gray-600 text-lg">Manage and track your delivery assignments</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <p className="text-sm text-gray-500">Active Orders</p>
              <p className="text-2xl font-bold text-blue-600">{assignedOrders.length}</p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="bg-white text-blue-600 px-4 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 border border-blue-200 shadow-sm hover:shadow-md flex items-center space-x-2"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-semibold uppercase tracking-wide">Confirmed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{getOrdersByStatus('confirmed').length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wide">Packed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{getOrdersByStatus('packed').length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide">In Transit</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{getOrdersByStatus('dispatched').length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-semibold uppercase tracking-wide">Priority</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{getPriorityOrders().length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {assignedOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <Truck className="h-24 w-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Active Deliveries</h3>
              <p className="text-gray-500 mb-6 text-lg">
                You don't have any assigned deliveries at the moment. New orders will appear here when assigned to you.
              </p>
              <button
                onClick={refreshData}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Check for New Orders
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {assignedOrders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-bold text-xl">Order #{order.orderNumber}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status.toUpperCase()}</span>
                        </span>
                      </div>
                      <p className="text-blue-100 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">₹{order.totalAmount.toFixed(2)}</p>
                      {order.shopName && (
                        <p className="text-blue-200 text-sm mt-1">from {order.shopName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center text-lg">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700">Name</span>
                      <span className="text-gray-900 font-semibold">{order.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700 flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Phone
                      </span>
                      <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:text-blue-700 font-semibold">
                        {order.customerPhone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center text-lg">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Delivery Address
                  </h4>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-gray-900 leading-relaxed">{order.deliveryAddress}</p>
                    <button className="mt-3 flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium">
                      <Navigation className="h-4 w-4" />
                      <span>Open in Maps</span>
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-700 mb-4 flex items-center text-lg">
                    <Package className="h-5 w-5 mr-2 text-purple-600" />
                    Order Items ({order.items.length})
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div>
                          <span className="font-medium text-gray-900 block">{item.name}</span>
                          <span className="text-sm text-gray-600">
                            {item.quantity} {item.unit} × ₹{item.price}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900 text-lg">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'packed')}
                        className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                      >
                        <Package className="h-5 w-5" />
                        <span>Mark as Packed</span>
                      </button>
                    )}
                    
                    {order.status === 'packed' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'dispatched')}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                      >
                        <Truck className="h-5 w-5" />
                        <span>Start Delivery</span>
                      </button>
                    )}
                    
                    {order.status === 'dispatched' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'delivered')}
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span>Mark Delivered</span>
                      </button>
                    )}
                    
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        className="bg-red-600 text-white py-3 px-6 rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                      >
                        <XCircle className="h-5 w-5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedDeliveries;