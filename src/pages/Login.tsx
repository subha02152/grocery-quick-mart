import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Mail, Lock } from 'lucide-react';
import { authAPI } from '../utils/api'; // Use authAPI instead of direct api
import { setAuthToken, setUser } from '../utils/auth';
import { toast } from '../utils/toast';
import Loading from '../components/shared/Loading';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use authAPI.login instead of direct api.post
      const response = await authAPI.login(formData);
      
      if (response.success) {
        const { token, user } = response.data;

        setAuthToken(token);
        setUser(user);

        toast.success(`Welcome back, ${user.name}!`);
        navigate(`/dashboard/${user.role}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      toast.error(message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test login function
  const handleTestLogin = (role: 'customer' | 'shop_owner' | 'delivery_agent') => {
    const testUser = {
      id: 'test-' + Date.now(),
      name: `Test ${role.replace('_', ' ')}`,
      email: `test-${role}@example.com`,
      role: role,
      phone: '1234567890',
      address: 'Test Address'
    };
    
    setUser(testUser);
    setAuthToken('test-token-' + Date.now());
    toast.success(`Test login as ${role}`);
    navigate(`/dashboard/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ShoppingBag className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Login to your QuickMart account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Test login buttons */}
        <div className="mt-4 space-y-2">
          <p className="text-center text-sm text-gray-500">Or test directly:</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleTestLogin('customer')}
              className="flex-1 bg-blue-100 text-blue-700 py-2 rounded text-sm hover:bg-blue-200"
            >
              Customer
            </button>
            <button
              onClick={() => handleTestLogin('shop_owner')}
              className="flex-1 bg-orange-100 text-orange-700 py-2 rounded text-sm hover:bg-orange-200"
            >
              Shop Owner
            </button>
            <button
              onClick={() => handleTestLogin('delivery_agent')}
              className="flex-1 bg-purple-100 text-purple-700 py-2 rounded text-sm hover:bg-purple-200"
            >
              Delivery
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-green-600 font-semibold hover:text-green-700"
            >
              Register here
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 text-sm hover:text-gray-700"
          >
            Back to Home
          </button>
        </div>
      </div>

      {loading && <Loading fullScreen />}
    </div>
  );
};

export default Login;