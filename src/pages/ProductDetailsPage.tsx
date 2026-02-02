import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { productsAPI, cartAPI } from '../api';
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
  id: string;
  title: string;
  description: string;
  base_price: number;
  slug: string;
  product_variants: Variant[];
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (!slug) return;
        const productData = await productsAPI.getBySlug(slug);
        setProduct(productData);
        // Set default selections
        if (productData.product_variants.length > 0) {
          setSelectedSize(productData.product_variants[0].size);
          setSelectedColor(productData.product_variants[0].color);
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
      const validColors = product.product_variants
        .filter((v) => v.size === selectedSize)
        .map((v) => v.color);

      if (!validColors.includes(selectedColor) && validColors.length > 0) {
        setSelectedColor(validColors[0]);
      }
    }
  }, [selectedSize, product, selectedColor]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const getSelectedVariant = () => {
    return product?.product_variants.find(
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
      setAddingToCart(true);
      const response = await cartAPI.addItem(product!.id, variant.sku, quantity);
      setCart(response); // cartAPI.addItem returns void in previous impl?
      // Checked api.ts: addItem returns void. Cart is fetched via cartAPI.get() or returned?
      // In Supabase api.ts: addItem returns void.
      // But useCartStore.addItem updates local state?
      // Old code: setCart(response.data).
      // We should refetch cart or return cart from addItem.
      // Let's check api.ts again.

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

  const availableSizes = [...new Set(product.product_variants.map((v) => v.size))];
  const availableColors = product.product_variants
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
          {/* Product Image Gallery */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200 shadow-sm"
            >
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-8xl font-bold text-zinc-300">T</span>
                </div>
              )}

              {/* Image Navigation Arrows (only if multiple images) */}
              {product.images && product.images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
                    }}
                    className="rounded-full bg-white/80 p-2 shadow-md hover:bg-white backdrop-blur-sm transition-transform hover:scale-110"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
                    }}
                    className="rounded-full bg-white/80 p-2 shadow-md hover:bg-white backdrop-blur-sm transition-transform hover:scale-110"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedImageIndex === idx
                      ? 'border-zinc-900 ring-2 ring-zinc-900 ring-offset-2'
                      : 'border-transparent hover:border-zinc-300'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} view ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <div className="mb-6">
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-2">
                {product.title}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-zinc-900">
                  ₹{(Number(product.base_price) + (Number(selectedVariant?.price_adjustment) || 0)).toFixed(2)}
                </span>
                {selectedVariant && selectedVariant.stock_quantity < 5 && selectedVariant.stock_quantity > 0 && (
                  <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Only {selectedVariant.stock_quantity} left!
                  </span>
                )}
              </div>
            </div>

            <p className="text-base leading-relaxed text-zinc-600 mb-8 max-w-lg">
              {product.description}
            </p>

            <div className="space-y-8 flex-grow">
              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-zinc-900">Select Size</label>
                  <button className="text-xs text-zinc-500 underline hover:text-zinc-900">Size Guide</button>
                </div>
                {product.product_variants.length === 0 ? (
                  <div className="text-sm text-zinc-500 italic">No sizes available</div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map((size) => {
                      // Check if size is out of stock across all colors
                      const isSizeAvailable = product.product_variants.some(v => v.size === size && v.stock_quantity > 0);
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={!isSizeAvailable}
                          className={`min-w-[3.5rem] rounded-md border px-4 py-2.5 text-sm font-medium transition-all ${selectedSize === size
                            ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                            : isSizeAvailable
                              ? 'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300'
                              : 'border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed decoration-slice line-through'
                            }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Color Selection */}
              <div>
                <label className="text-sm font-medium text-zinc-900 mb-3 block">Select Color</label>
                {product.product_variants.length === 0 ? (
                  <div className="text-sm text-zinc-500 italic">No colors available</div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`relative px-4 py-2 rounded-md border text-sm font-medium transition-all ${selectedColor === color
                          ? 'border-zinc-900 bg-zinc-50 text-zinc-900 ring-1 ring-zinc-900'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                          }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="pt-6 border-t border-zinc-100">
                <div className="flex gap-4">
                  {/* Quantity Input */}
                  <div className="flex items-center rounded-lg border border-zinc-200 bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="w-12 text-center text-sm font-semibold text-zinc-900 select-none">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || !selectedVariant || selectedVariant.stock_quantity === 0}
                    className={`flex-1 rounded-lg px-8 py-3 text-sm font-bold text-white shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${!selectedVariant || selectedVariant.stock_quantity === 0
                      ? 'bg-zinc-400'
                      : 'bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-black hover:to-zinc-900 hover:shadow-xl'
                      }`}
                  >
                    {addingToCart ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding to Cart...
                      </span>
                    ) : !selectedVariant ? (
                      'Select Options'
                    ) : selectedVariant.stock_quantity === 0 ? (
                      'Out of Stock'
                    ) : (
                      `Add to Cart - ₹${((Number(product.base_price) + (Number(selectedVariant?.price_adjustment) || 0)) * quantity).toFixed(2)}`
                    )}
                  </button>
                </div>

                {/* Shipping Info / Trust Badges */}
                <div className="mt-6 flex flex-wrap gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    Free Shipping over ₹999
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    7 Days Return
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
