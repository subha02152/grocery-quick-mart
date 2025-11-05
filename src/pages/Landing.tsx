import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Users, Package, Truck, MapPin, Wifi } from 'lucide-react';
import { useEffect } from 'react';
import { isAuthenticated, getUser } from '../utils/auth';

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser();
      if (user) {
        navigate(`/dashboard/${user.role}`);
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <ShoppingBag className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            QuickMart
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-2">
            Rural Grocery Delivery Made Simple
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connecting local shops with customers in rural and town areas. Fast,
            reliable, and designed for low internet connectivity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Customers</h3>
            <p className="text-gray-600">
              Browse local shops, order groceries, and track deliveries from your
              neighborhood stores.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Shop Owners</h3>
            <p className="text-gray-600">
              Manage your inventory, receive orders, and grow your business with
              digital tools.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Delivery Agents</h3>
            <p className="text-gray-600">
              Accept delivery tasks, navigate to customers, and earn by delivering
              groceries efficiently.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Built for Rural Areas
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <MapPin className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Nearby Shops</h4>
                <p className="text-sm text-gray-600">
                  Find grocery stores in your local area
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Wifi className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Low Data Usage</h4>
                <p className="text-sm text-gray-600">
                  Optimized for slow internet connections
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Truck className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Fast Delivery</h4>
                <p className="text-sm text-gray-600">
                  Real-time tracking and quick delivery
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-50 transition border-2 border-green-600"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
