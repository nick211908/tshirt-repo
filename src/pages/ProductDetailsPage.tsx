import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { productsAPI, cartAPI, API_BASE_URL } from '../api';
import { useAuthStore, useCartStore } from '../store';
import toast from 'react-hot-toast';

interface Variant {
  sku: string;
  size: string;
  color: string;
  stock_quantity: number;
  price_adjustment: number;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  base_price: number;
  slug: string;
  variants: Variant[];
  images: string[];
  is_published: boolean;
  created_at: string;
}



function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { setCart } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (!slug) return;
        const response = await productsAPI.getBySlug(slug);
        setProduct(response.data);
        // Set default selections
        if (response.data.variants.length > 0) {
          setSelectedSize(response.data.variants[0].size);
          setSelectedColor(response.data.variants[0].color);
        }
      } catch (error) {
        toast.error('Failed to load product');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  // Handle Size Change: Auto-select available color
  useEffect(() => {
    if (product && selectedSize) {
      const validColors = product.variants
        .filter((v) => v.size === selectedSize)
        .map((v) => v.color);

      if (!validColors.includes(selectedColor) && validColors.length > 0) {
        setSelectedColor(validColors[0]);
      }
    }
  }, [selectedSize, product, selectedColor]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const getSelectedVariant = () => {
    return product?.variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
  };

  const handleAddToCart = async () => {
    if (!token) {
      toast.error('Please sign in to add items to cart');
      navigate('/auth?redirect=/products/' + slug);
      return;
    }

    const variant = getSelectedVariant();
    if (!variant) {
      toast.error('Please select size and color');
      return;
    }

    try {
      setAddingToCart(true);
      const response = await cartAPI.addItem(product!._id, variant.sku, quantity);
      setCart(response.data);
      toast.success('Added to cart!');
      setQuantity(1);
    } catch (error: any) {
      console.error('Add to cart error:', error);

      let errorMessage = 'Failed to add to cart';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
        } else {
          errorMessage = JSON.stringify(detail);
        }
      }

      if (error.response?.status === 401) {
        toast.error('Session expired. Please sign in again.');
        // Clear invalid token
        useAuthStore.getState().logout();
        navigate('/auth?redirect=/products/' + slug);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-600 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Product not found</p>
      </div>
    );
  }

  const availableSizes = [...new Set(product.variants.map((v) => v.size))];
  const availableColors = product.variants
    .filter((v) => v.size === selectedSize)
    .map((v) => v.color);
  const selectedVariant = getSelectedVariant();

  return (
    <div className="min-h-screen bg-zinc-50 py-12 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Shop
        </button>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Product Image */}
          <div className="flex items-center justify-center rounded-2xl bg-white p-8 border border-zinc-200">
            <div className="aspect-[4/5] w-full max-w-md rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={`${API_BASE_URL}${product.images[0]}`}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-8xl font-bold text-zinc-300">T</span>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              {product.title}
            </h1>
            <div className="mt-4">
              <span className="text-2xl font-bold text-zinc-900">
                ${(Number(product.base_price) + (Number(selectedVariant?.price_adjustment) || 0)).toFixed(2)}
              </span>
            </div>

            <p className="mt-6 text-base leading-relaxed text-zinc-600">
              {product.description}
            </p>

            <div className="mt-8 border-t border-zinc-200 pt-8">
              {/* Size Selection */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-zinc-900">
                  Select Size
                </label>
                {product.variants.length === 0 ? (
                  <div className="text-sm text-zinc-500 italic">No sizes available</div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] rounded-md border px-4 py-2 text-sm font-medium transition-all ${selectedSize === size
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-zinc-900">
                  Select Color
                </label>
                {product.variants.length === 0 ? (
                  <div className="text-sm text-zinc-500 italic">No colors available</div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`min-w-[4rem] rounded-md border px-4 py-2 text-sm font-medium transition-all ${selectedColor === color
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50'
                          }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Stock Status */}
              {product.variants.length === 0 ? (
                <div className="mb-6">
                  <p className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                    <span className="h-2 w-2 rounded-full bg-zinc-500" />
                    Currently Unavailable
                  </p>
                </div>
              ) : selectedVariant ? (
                <div className="mb-6">
                  {selectedVariant.stock_quantity > 0 ? (
                    <p className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                      In Stock
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 text-sm text-red-600 font-medium">
                      Out of Stock
                    </p>
                  )}
                </div>
              ) : null}

              {/* Actions */}
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center rounded-md border border-zinc-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-11 w-11 items-center justify-center text-zinc-500 hover:text-zinc-900"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-11 w-11 items-center justify-center text-zinc-500 hover:text-zinc-900"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !selectedVariant || selectedVariant.stock_quantity === 0}
                  className="flex-1 rounded-md bg-zinc-900 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 disabled:opacity-50"
                >
                  {addingToCart ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      Adding...
                    </span>
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
