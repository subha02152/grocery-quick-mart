import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication only once when component mounts
    const checkAuth = () => {
      const currentUser = getUser();
      setUser(currentUser);
      setAuthChecked(true);
    };

    checkAuth();
  }, []); // Empty dependency array - runs only once

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      if (user?.role === 'customer') {
        return <Navigate to="/dashboard/customer" replace />;
      } else if (user?.role === 'shop_owner') {
        return <Navigate to="/dashboard/shop_owner" replace />;
      } else if (user?.role === 'delivery_agent') {
        return <Navigate to="/delivery" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;