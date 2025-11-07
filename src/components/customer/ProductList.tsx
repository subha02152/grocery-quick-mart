import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Package } from 'lucide-react';
import { Shop, Product, CartItem } from '../../types';
import { toast } from '../../utils/toast';
import { customerAPI } from '../../utils/api';
import Loading from '../shared/Loading';

interface ProductListProps {
  shop: Shop;
  onBack: () => void;
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
}

const ProductList = ({ shop, onBack, cartItems, setCartItems }: ProductListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products for the selected shop
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const shopId = shop._id || shop.id;
        const response = await customerAPI.getShopProducts(shopId);
        if (response.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (shop) {
      fetchProducts();
    }
  }, [shop]);

  const getCartQuantity = (productId: string) => {
    const item = cartItems.find((item) => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const addToCart = (product: Product) => {
    const productId = product._id || product.id;
    const existingItem = cartItems.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.warning('Cannot add more. Stock limit reached.');
        return;
      }
      setCartItems(
        cartItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        productId: productId,
        shopId: product.shopId,
        name: product.name,
        price: product.price,
        quantity: 1,
        unit: product.unit,
        imageUrl: product.images?.[0] || '',
      };
      setCartItems([...cartItems, newItem]);
    }
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: string) => {
    const existingItem = cartItems.find((item) => item.productId === productId);
    if (existingItem && existingItem.quantity > 1) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setCartItems(cartItems.filter((item) => item.productId !== productId));
    }
  };

  if (loading) {
    return <Loading message="Loading products..." />;
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-green-600 hover:text-green-700 mb-6 font-medium"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Shops
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{shop.name}</h2>
        <p className="text-gray-600">{shop.address}</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No products available
          </h3>
          <p className="text-gray-500">
            This shop doesn't have any products listed yet.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const productId = product._id || product.id;
            const cartQty = getCartQuantity(productId);
            return (
              <div
                key={productId}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <div className="bg-gray-100 h-48 flex items-center justify-center">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-green-600">
                      ₹{product.price}/{product.unit}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>

                  {!product.isAvailable || product.stock === 0 ? (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  ) : cartQty > 0 ? (
                    <div className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                      <button
                        onClick={() => removeFromCart(productId)}
                        className="bg-white rounded-full p-1 hover:bg-gray-100"
                      >
                        <Minus className="h-5 w-5 text-green-600" />
                      </button>
                      <span className="font-semibold text-lg">{cartQty}</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-white rounded-full p-1 hover:bg-gray-100"
                        disabled={cartQty >= product.stock}
                      >
                        <Plus className="h-5 w-5 text-green-600" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductList;