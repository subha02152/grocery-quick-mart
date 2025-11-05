import { useEffect, useState } from 'react';
import { Store, Package, ShoppingCart } from 'lucide-react';
import api from '../../utils/api';
import { Shop } from '../../types';
import { toast } from '../../utils/toast';
import Loading from '../../components/shared/Loading';
import ShopList from '../../components/customer/ShopList';
import ProductList from '../../components/customer/ProductList';
import Cart from '../../components/customer/Cart';
import OrderList from '../../components/customer/OrderList';

type View = 'shops' | 'products' | 'cart' | 'orders';

const CustomerDashboard = () => {
  const [currentView, setCurrentView] = useState<View>('shops');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop);
    setCurrentView('products');
  };

  const handleBackToShops = () => {
    setCurrentView('shops');
    setSelectedShop(null);
  };

  const handleViewCart = () => {
    setCurrentView('cart');
  };

  const handleViewOrders = () => {
    setCurrentView('orders');
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Customer Dashboard
          </h1>
          <p className="text-gray-600">
            Browse nearby shops and order your groceries
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCurrentView('shops')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'shops'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Store className="h-5 w-5 mr-2" />
            Shops
          </button>
          <button
            onClick={handleViewCart}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition relative ${
              currentView === 'cart'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
          <button
            onClick={handleViewOrders}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'orders'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="h-5 w-5 mr-2" />
            My Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {currentView === 'shops' && <ShopList onSelectShop={handleShopSelect} />}
          {currentView === 'products' && selectedShop && (
            <ProductList
              shop={selectedShop}
              onBack={handleBackToShops}
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          )}
          {currentView === 'cart' && (
            <Cart
              cartItems={cartItems}
              setCartItems={setCartItems}
              onOrderPlaced={() => setCurrentView('orders')}
            />
          )}
          {currentView === 'orders' && <OrderList />}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
