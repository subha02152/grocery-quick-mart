import { ShoppingBag, LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHome = () => {
    if (user) {
      navigate(`/dashboard/${user.role}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center cursor-pointer"
            onClick={handleHome}
          >
            <ShoppingBag className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              QuickMart
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <span className="text-gray-700 font-medium">{user.name}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={handleHome}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Home"
                >
                  <Home className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-gray-600" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
