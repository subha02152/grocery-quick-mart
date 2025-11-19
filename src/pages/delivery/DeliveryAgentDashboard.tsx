import { useState } from 'react';
import { Truck, CheckCircle, UserPlus } from 'lucide-react';
import AssignedDeliveries from '../../components/delivery/AssignedDeliveries';
import CompletedDeliveries from '../../components/delivery/CompletedDeliveries';
// @ts-ignore: no declaration file for CreateDeliveryAccount.jsx
import CreateDeliveryAccount from '../../components/delivery/CreateDeliveryAccount';

type View = 'assigned' | 'completed' | 'create-account';

const DeliveryAgentDashboard = () => {
  const [currentView, setCurrentView] = useState<View>('assigned');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Delivery Agent Dashboard
          </h1>
          <p className="text-gray-600">Manage your delivery tasks</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCurrentView('assigned')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'assigned'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Truck className="h-5 w-5 mr-2" />
            Assigned Deliveries
          </button>
          <button
            onClick={() => setCurrentView('completed')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'completed'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Completed Deliveries
          </button>
          <button
            onClick={() => setCurrentView('create-account')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'create-account'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Create Delivery Account
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {currentView === 'assigned' && <AssignedDeliveries />}
          {currentView === 'completed' && <CompletedDeliveries />}
          {currentView === 'create-account' && <CreateDeliveryAccount />}
        </div>
      </div>
    </div>
  );
};

export default DeliveryAgentDashboard;