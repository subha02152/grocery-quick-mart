import { useState } from 'react';
import { Store, Package, ShoppingBag } from 'lucide-react';
import ShopManagement from '../../components/shop/ShopManagement';
import ProductManagement from '../../components/shop/ProductManagement';
import ShopOrders from '../../components/shop/ShopOrders';

type View = 'shop' | 'products' | 'orders';

const ShopOwnerDashboard = () => {
  const [currentView, setCurrentView] = useState<View>('shop');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shop Owner Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your shop, products, and orders
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCurrentView('shop')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'shop'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Store className="h-5 w-5 mr-2" />
            My Shop
          </button>
          <button
            onClick={() => setCurrentView('products')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'products'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="h-5 w-5 mr-2" />
            Products
          </button>
          <button
            onClick={() => setCurrentView('orders')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'orders'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {currentView === 'shop' && <ShopManagement />}
          {currentView === 'products' && <ProductManagement />}
          {currentView === 'orders' && <ShopOrders />}
        </div>
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;
