import { useState, useEffect } from 'react';
import { Package, MapPin, Phone, User, Clock, CheckCircle, XCircle, Truck, RefreshCw } from 'lucide-react';

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
}

const AssignedDeliveries = () => {
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch orders assigned to this logged-in delivery agent
      const response = await fetch('http://localhost:5000/api/delivery/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setAssignedOrders(data.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching assigned orders:', error);
      showToast('Failed to load assigned orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/delivery/orders/${orderId}/status`, {
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
        
        // Update local state
        setAssignedOrders(prev => 
          prev.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus } 
              : order
          ).filter(order => order.status !== 'delivered') // Remove delivered orders
        );
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
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'dispatched':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'packed':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'confirmed':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getOrdersByStatus = (status: string) => {
    return assignedOrders.filter(order => order.status === status);
  };

  if (loading && assignedOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading your deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Deliveries</h1>
          <p className="text-gray-600 mt-1">Manage your assigned delivery orders</p>
        </div>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500 shadow">
          <p className="text-orange-600 text-sm font-medium">Confirmed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{getOrdersByStatus('confirmed').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500 shadow">
          <p className="text-purple-600 text-sm font-medium">Packed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{getOrdersByStatus('packed').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow">
          <p className="text-blue-600 text-sm font-medium">Out for Delivery</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{getOrdersByStatus('dispatched').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow">
          <p className="text-green-600 text-sm font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{assignedOrders.length}</p>
        </div>
      </div>

      {/* Orders List */}
      {assignedOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Deliveries Assigned</h3>
          <p className="text-gray-500">Orders assigned to you will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignedOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-bold text-gray-900 text-lg">Order #{order.orderNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
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
                  <p className="text-2xl font-bold text-blue-600">₹{order.totalAmount.toFixed(2)}</p>
                  {order.shopName && (
                    <p className="text-xs text-gray-500 mt-1">from {order.shopName}</p>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Name:</span>
                    <span className="text-gray-900">{order.customerName}</span>
                  </p>
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-700 w-20">Phone:</span>
                    <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:underline">
                      {order.customerPhone}
                    </a>
                  </p>
                  <p className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                    <span className="font-medium text-gray-700 w-20">Address:</span>
                    <span className="text-gray-900 flex-1">{order.deliveryAddress}</span>
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Items ({order.items.length})
                </h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                      <span className="text-gray-900">
                        {item.name} <span className="text-gray-500">x {item.quantity} {item.unit}</span>
                      </span>
                      <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'packed')}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Mark as Packed
                  </button>
                )}
                
                {order.status === 'packed' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'dispatched')}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Mark as Dispatched
                  </button>
                )}
                
                {order.status === 'dispatched' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </button>
                )}
                
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'cancelled')}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedDeliveries;