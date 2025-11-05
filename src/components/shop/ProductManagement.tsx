import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import api from '../../utils/api';
import { Product, Shop } from '../../types';
import { toast } from '../../utils/toast';
import Loading from '../shared/Loading';
import { getUser } from '../../utils/auth';
import ProductForm from './ProductForm';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const user = getUser();

  useEffect(() => {
    fetchShopAndProducts();
  }, []);

  const fetchShopAndProducts = async () => {
    try {
      const shopsResponse = await api.get('/shops');
      const userShop = shopsResponse.data.find(
        (s: Shop) => s.ownerId === user?.id
      );

      if (userShop) {
        setShop(userShop);
        const productsResponse = await api.get(
          `/products?shopId=${userShop.id}`
        );
        setProducts(productsResponse.data);
      }
    } catch (error: any) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchShopAndProducts();
    } catch (error: any) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchShopAndProducts();
  };

  if (loading) {
    return <Loading message="Loading products..." />;
  }

  if (!shop) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No shop registered
        </h3>
        <p className="text-gray-500">Please create your shop first</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <ProductForm
        shop={shop}
        product={editingProduct}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No products yet
          </h3>
          <p className="text-gray-500 mb-6">
            Add your first product to start selling
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Add Product
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {product.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.isAvailable ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {product.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-green-600">
                    ₹{product.price}/{product.unit}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
