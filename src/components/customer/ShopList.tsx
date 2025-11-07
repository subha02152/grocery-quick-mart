import { Store, MapPin, Phone } from 'lucide-react';
import { Shop } from '../../types';

interface ShopListProps {
  onSelectShop: (shop: Shop) => void;
}

const ShopList = ({ onSelectShop }: ShopListProps) => {
  // Hardcoded shops - NO API CALLS
  const shops: Shop[] = [
    {
      id: '1',
      name: 'Fresh Grocery Store',
      description: 'Your neighborhood fresh grocery store with fresh produce and daily essentials',
      address: '123 Main Street, City Center',
      phone: '+1 (555) 123-4567',
      ownerId: '1',
      isActive: true,
      isOpen: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2', 
      name: 'Quick Mart',
      description: 'Fast and convenient shopping for all your grocery needs',
      address: '456 Oak Avenue, Downtown',
      phone: '+1 (555) 987-6543',
      ownerId: '2',
      isActive: true,
      isOpen: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Organic Market',
      description: '100% organic products and healthy food options',
      address: '789 Green Road, Westside',
      phone: '+1 (555) 456-7890',
      ownerId: '3',
      isActive: true,
      isOpen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Nearby Shops</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
            onClick={() => onSelectShop(shop)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <Store className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {shop.name}
                  </h3>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      shop.isOpen
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {shop.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>

            {shop.description && (
              <p className="text-gray-600 mb-4 text-sm">{shop.description}</p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{shop.address}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{shop.phone}</span>
              </div>
            </div>

            <button
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
              onClick={(e) => {
                e.stopPropagation();
                onSelectShop(shop);
              }}
            >
              View Products
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopList;