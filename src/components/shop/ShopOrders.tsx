import { useState, useEffect } from 'react';
import { Package, Clock, Truck, User, Phone } from 'lucide-react';
import { Order, Shop } from '../../types';
import { toast } from '../../utils/toast';
import { orderAPI, shopAPI, deliveryAPI } from '../../utils/api';

const ShopOrders = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryAgents, setDeliveryAgents] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchShopAndOrders();
  }, []);

  const fetchShopAndOrders = async () => {
    try {
      setLoading(true);
      
      const [shopResponse, ordersResponse] = await Promise.all([
        shopAPI.getShop(),
        orderAPI.getOrders()
      ]);

      if (shopResponse.success) {
        setShop(shopResponse.data.shop);
      }

      if (ordersResponse.success) {
        setOrders(ordersResponse.data.orders);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load shop orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch delivery agents for assignment
  const fetchDeliveryAgents = async () => {
    try {
      const response = await deliveryAPI.getDeliveryAgents();
      if (response.success) {
        setDeliveryAgents(response.data.agents || []);
      }
    } catch (error) {
      console.error('Error fetching delivery agents:', error);
      toast.error('Failed to load delivery agents');
    }
  };

  // Open assignment modal
  const openAssignmentModal = async (order: Order) => {
    setSelectedOrder(order);
    await fetchDeliveryAgents();
  };

  // Assign order to delivery agent
  const assignOrderToAgent = async (agentId: string) => {
    if (!selectedOrder) return;
    
    try {
      setAssigning(true);
      
      const response = await deliveryAPI.assignOrderToAgent(selectedOrder.id, agentId);
      if (response.success) {
        toast.success('Order assigned to delivery agent successfully!');
        
        // Refresh orders to get updated data from MongoDB
        await fetchShopAndOrders();
        
        setSelectedOrder(null);
        setDeliveryAgents([]);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Error assigning order:', error);
      toast.error(error.message || 'Failed to assign order');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'dispatched':
        return 'bg-blue-100 text-blue-800';
      case 'packed':
        return 'bg-purple-100 text-purple-800';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getAvailableAgents = () => {
    return deliveryAgents.filter(agent => agent.isAvailable);
  };

  if (!shop) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Shop Required
        </h3>
        <p className="text-gray-500">
          Please create a shop first to view orders
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No orders yet
        </h3>
        <p className="text-gray-500">Orders will appear here once customers place them</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders ({orders.length})</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    Order #{order.orderNumber}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      order.status
                    )}`}
                  >
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
              <h4 className="font-semibold mb-2">Items:</h4>
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

            <div className="border-t pt-4 mb-4 text-sm text-gray-600">
              <p>
                <span className="font-medium">Customer:</span>{' '}
                {order.customerName}
              </p>
              <p>
                <span className="font-medium">Delivery Address:</span>{' '}
                {order.deliveryAddress}
              </p>
              <p>
                <span className="font-medium">Contact:</span>{' '}
                {order.customerPhone}
              </p>
              
              {/* ✅ SHOW DELIVERY AGENT IF ASSIGNED */}
              {order.deliveryAgentName && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    Delivery Agent: {order.deliveryAgentName}
                  </p>
                  {order.deliveryAgentPhone && (
                    <p className="text-blue-700 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {order.deliveryAgentPhone}
                    </p>
                  )}
                  {order.deliveryAgentVehicle && (
                    <p className="text-blue-700 text-sm">
                      Vehicle: {order.deliveryAgentVehicle}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ✅ FIXED: NOW SHOWS ASSIGN BUTTON FOR PENDING ORDERS TOO */}
            {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'packed') && !order.deliveryAgentId && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openAssignmentModal(order)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center"
                >
                  <Truck className="h-4 w-4 mr-1" />
                  Assign Delivery Agent
                </button>
              </div>
            )}
          </div>
        ))}
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
                <button 
                  onClick={fetchDeliveryAgents}
                  className="text-blue-600 hover:text-blue-700 mt-2"
                >
                  Retry
                </button>
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
                      <p className="text-sm text-gray-600">{agent.vehicleType} • {agent.phone}</p>
                    </div>
                    <button
                      onClick={() => assignOrderToAgent(agent.id)}
                      disabled={assigning}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                    >
                      {assigning ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setSelectedOrder(null);
                setDeliveryAgents([]);
              }}
              disabled={assigning}
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

export default ShopOrders;