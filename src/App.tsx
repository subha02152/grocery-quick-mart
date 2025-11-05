import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from './utils/auth';
import Navbar from './components/shared/Navbar';
import Toast from './components/shared/Toast';
import OfflineIndicator from './components/shared/OfflineIndicator';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ShopOwnerDashboard from './pages/shop/ShopOwnerDashboard';
import DeliveryAgentDashboard from './pages/delivery/DeliveryAgentDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Toast />
        <OfflineIndicator />

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard/customer"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/shop_owner"
            element={
              <ProtectedRoute allowedRoles={['shop_owner']}>
                <ShopOwnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/delivery_agent"
            element={
              <ProtectedRoute allowedRoles={['delivery_agent']}>
                <DeliveryAgentDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
