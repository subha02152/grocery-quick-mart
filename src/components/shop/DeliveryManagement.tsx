import { useState, useEffect } from 'react';
import { Truck, User, MapPin, Phone, Clock, Package, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Order, DeliveryAgent } from '../../types';
import { toast } from '../../utils/toast';
import { deliveryAPI, orderAPI } from '../../utils/api';
import Loading from '../shared/Loading';

const DeliveryManagement = () => {
  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [assignedDeliveries, setAssignedDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchReadyOrders(),
        fetchAssignedDeliveries(),
        fetchDeliveryAgents()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load delivery data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReadyOrders = async () => {
    try {
      // Get orders that are confirmed (ready for delivery)
      const response = await orderAPI.getOrders('confirmed');
      if (response.success) {
        setReadyOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching ready orders:', error);
      toast.error('Failed to load ready orders');
    }
  };

  const fetchAssignedDeliveries = async () => {
    try {
      // Get orders that are dispatched (out for delivery)
      const response = await orderAPI.getOrders('dispatched');
      if (response.success) {
        setAssignedDeliveries(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching assigned deliveries:', error);
      toast.error('Failed to load assigned deliveries');
    }
  };

  const fetchDeliveryAgents = async () => {
    try {
      const response = await deliveryAPI.getDeliveryAgents();
      if (response.success) {
        setDeliveryAgents(response.data.agents || []);
      }
    } catch (error) {
      console.error('Error fetching delivery agents:', error);
      setDeliveryAgents([]);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await fetchAllData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const assignOrderToAgent = async (orderId: string, agentId: string) => {
    try {
      setLoading(true);
      
      const response = await deliveryAPI.assignOrderToAgent(orderId, agentId);
      if (response.success) {
        toast.success('Order assigned to delivery agent successfully!');
        
        // Update local state
        const assignedOrder = readyOrders.find(order => order.id === orderId);
        if (assignedOrder) {
          setAssignedDeliveries(prev => [...prev, { ...assignedOrder, status: 'dispatched' }]);
          setReadyOrders(prev => prev.filter(order => order.id !== orderId));
        }
        
        setSelectedOrder(null);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Error assigning order:', error);
      toast.error(error.message || 'Failed to assign order to delivery agent');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await deliveryAPI.updateOrderStatus(orderId, status);
      if (response.success) {
        toast.success(`Order marked as ${status}`);
        
        if (status === 'delivered') {
          // Remove from assigned deliveries
          setAssignedDeliveries(prev => prev.filter(order => order.id !== orderId));
        }
        
        refreshData();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getAvailableAgents = () => {
    return deliveryAgents.filter(agent => agent.isAvailable);
  };

  const getAgentStatusColor = (isAvailable: boolean) => {
    return isAvailable 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'dispatched': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'confirmed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'dispatched': return 'Out for Delivery';
      case 'confirmed': return 'Ready for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return <Loading message="Loading delivery management..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Management</h2>
          <div className="text-sm text-gray-600 mt-1">
            Manage order deliveries and assign to agents
          </div>
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Agents</p>
              <p className="text-2xl font-bold text-gray-900">{getAvailableAgents().length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-full p-3 mr-4">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ready for Delivery</p>
              <p className="text-2xl font-bold text-gray-900">{readyOrders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{assignedDeliveries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Delivery Agents Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Truck className="h-5 w-5 mr-2 text-blue-600" />
          Available Delivery Agents ({getAvailableAgents().length})
        </h3>
        
        {getAvailableAgents().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No delivery agents available at the moment</p>
            <button 
              onClick={fetchDeliveryAgents}
              className="text-blue-600 hover:text-blue-700 mt-2"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAvailableAgents().map((agent) => (
              <div
                key={agent.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getAgentStatusColor(agent.isAvailable)}`}>
                        {agent.isAvailable ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {agent.phone}
                  </div>
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    {agent.vehicleType}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {agent.currentLocation}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>⭐ {agent.rating}</span>
                    <span>Deliveries: {agent.totalDeliveries}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders Ready for Delivery Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2 text-orange-600" />
          Orders Ready for Delivery ({readyOrders.length})
        </h3>

        {readyOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No orders ready for delivery</p>
            <p className="text-sm">Confirmed orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {readyOrders.map((order) => (
              <div
                key={order.id}
                className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">
                      ₹{order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {item.name} x {item.quantity} {item.unit}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Delivery Info:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{order.customerName}</p>
                      <p>{order.deliveryAddress}</p>
                      <p>{order.customerPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Assign Delivery Agent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assigned Deliveries Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Truck className="h-5 w-5 mr-2 text-green-600" />
          Active Deliveries ({assignedDeliveries.length})
        </h3>

        {assignedDeliveries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No active deliveries</p>
            <p className="text-sm">Assigned orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedDeliveries.map((order) => (
              <div
                key={order.id}
                className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getOrderStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Out for delivery
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      ₹{order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>Customer: {order.customerName} ({order.customerPhone})</p>
                  <p>Address: {order.deliveryAddress}</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Delivered
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Assign Delivery Agent</h3>
            <p className="text-gray-600 mb-4">
              Assign Order #{selectedOrder.orderNumber} to a delivery agent
            </p>
            
            {getAvailableAgents().length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Truck className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No available delivery agents</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {getAvailableAgents().map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-gray-600">{agent.vehicleType} • {agent.currentLocation}</p>
                    </div>
                    <button
                      onClick={() => assignOrderToAgent(selectedOrder.id, agent.id)}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {loading ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setSelectedOrder(null)}
              disabled={loading}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;