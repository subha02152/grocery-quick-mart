import { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../../types';
import { toast } from '../../utils/toast';
import { getUser } from '../../utils/auth';
import { customerAPI } from '../../utils/api';
import Loading from '../shared/Loading';

interface CartProps {
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
  onOrderPlaced: () => void;
}

const Cart = ({ cartItems, setCartItems, onOrderPlaced }: CartProps) => {
  const [loading, setLoading] = useState(false);
  const user = getUser();

  const updateQuantity = (productId: string, change: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
    toast.success('Item removed from cart');
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please login to place order');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const shopId = cartItems[0]?.shopId;
      
      const orderData = {
        shopId,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          image: item.imageUrl
        })),
        totalAmount: calculateTotal(),
        deliveryAddress: user.address || 'Default address',
        paymentMethod: 'cash'
      };

      await customerAPI.createOrder(orderData);

      toast.success('Order placed successfully!');
      setCartItems([]);
      onOrderPlaced();
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-500">Add some products to get started</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>

      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div
            key={item.productId}
            className="flex items-center bg-gray-50 rounded-lg p-4"
          >
            <div className="bg-white rounded-lg p-2 mr-4">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-16 w-16 object-cover rounded"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">
                ₹{item.price}/{item.unit}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white rounded-lg border border-gray-300">
                <button
                  onClick={() => updateQuantity(item.productId, -1)}
                  className="p-2 hover:bg-gray-100 rounded-l-lg"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, 1)}
                  className="p-2 hover:bg-gray-100 rounded-r-lg"
                >
                  <Plus className="h-4 w-5" />
                </button>
              </div>

              <div className="text-right w-24">
                <p className="font-bold text-green-600">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => removeItem(item.productId)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-semibold">Total Amount:</span>
          <span className="text-2xl font-bold text-green-600">
            ₹{calculateTotal().toFixed(2)}
          </span>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Cart;