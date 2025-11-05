import { useEffect, useState } from 'react';
import { Store, MapPin, Phone, Clock } from 'lucide-react';
import api from '../../utils/api';
import { Shop } from '../../types';
import { toast } from '../../utils/toast';
import Loading from '../shared/Loading';

interface ShopListProps {
  onSelectShop: (shop: Shop) => void;
}

const ShopList = ({ onSelectShop }: ShopListProps) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await api.get('/shops');
      setShops(response.data);
    } catch (error: any) {
      toast.error('Failed to load shops. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading nearby shops..." />;
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No shops available
        </h3>
        <p className="text-gray-500">
          Check back later for nearby grocery stores
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
