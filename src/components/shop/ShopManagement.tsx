import { useEffect, useState } from 'react';
import { Store, Edit2, Save, X } from 'lucide-react';
import api from '../../utils/api';
import { Shop } from '../../types';
import { toast } from '../../utils/toast';
import Loading from '../shared/Loading';
import { getUser } from '../../utils/auth';

const ShopManagement = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    isOpen: true,
  });
  const user = getUser();

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      const response = await api.get('/shops');
      const userShop = response.data.find(
        (s: Shop) => s.ownerId === user?.id
      );
      if (userShop) {
        setShop(userShop);
        setFormData({
          name: userShop.name,
          address: userShop.address,
          phone: userShop.phone,
          description: userShop.description || '',
          isOpen: userShop.isOpen,
        });
      }
    } catch (error: any) {
      toast.error('Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (shop) {
        await api.put(`/shops/${shop.id}`, formData);
        toast.success('Shop updated successfully');
      } else {
        const response = await api.post('/shops', formData);
        setShop(response.data);
        toast.success('Shop created successfully');
      }
      setEditing(false);
      fetchShop();
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Failed to save shop details';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    if (shop) {
      setFormData({
        name: shop.name,
        address: shop.address,
        phone: shop.phone,
        description: shop.description || '',
        isOpen: shop.isOpen,
      });
    }
    setEditing(false);
  };

  if (loading && !editing) {
    return <Loading message="Loading shop details..." />;
  }

  if (!shop && !editing) {
    return (
      <div className="text-center py-12">
        <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No shop registered
        </h3>
        <p className="text-gray-500 mb-6">Create your shop to get started</p>
        <button
          onClick={() => setEditing(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create Shop
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Shop Details</h2>
        {!editing && shop && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isOpen"
              checked={formData.isOpen}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Shop is currently open
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        shop && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">
                Shop Name
              </label>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {shop.name}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">
                Address
              </label>
              <p className="text-lg text-gray-900 mt-1">{shop.address}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <p className="text-lg text-gray-900 mt-1">{shop.phone}</p>
            </div>

            {shop.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-600">
                  Description
                </label>
                <p className="text-lg text-gray-900 mt-1">{shop.description}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">Status</label>
              <p className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    shop.isOpen
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {shop.isOpen ? 'Open' : 'Closed'}
                </span>
              </p>
            </div>
          </div>
        )
      )}

      {loading && <Loading fullScreen />}
    </div>
  );
};

export default ShopManagement;
