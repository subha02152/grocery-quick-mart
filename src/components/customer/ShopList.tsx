import { Store, MapPin, Phone } from 'lucide-react';
import { Shop } from '../../types';
import Loading from '../shared/Loading';

interface ShopListProps {
  shops: Shop[];
  onSelectShop: (shop: Shop) => void;
  loading: boolean;
}

const ShopList = ({ shops, onSelectShop, loading }: ShopListProps) => {
  if (loading) {
    return <Loading message="Loading shops..." />;
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No shops available
        </h3>
        <p className="text-gray-500 mb-4">
          There are no active shops in your area at the moment.
        </p>
        <p className="text-sm text-gray-400">
          Make sure to initialize sample data from the server.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Nearby Shops</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {shops.map((shop) => (
          <div
            key={shop._id || shop.id}
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