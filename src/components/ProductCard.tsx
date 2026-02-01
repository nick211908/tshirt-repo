import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import { cartAPI } from '../api';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  title: string;
  description: string;
  base_price: number;
  slug: string;
  product_variants: Array<{
    color: string;
    size: string;
    stock_quantity: number;
    sku: string;
    price_adjustment?: number;
  }>;
  images?: string[];
  is_published: boolean;
  created_at: string;
}

interface ProductCardProps {
  product: Product;
  index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
  const navigate = useNavigate();
  const { setCart } = useCartStore();
  const { token } = useAuthStore();

  const isOutOfStock = !product.product_variants || product.product_variants.length === 0 || product.product_variants.every(v => v.stock_quantity === 0);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error('Please login to add items to cart');
      navigate('/auth');
      return;
    }

    const availableVariant = product.product_variants.find(v => v.stock_quantity > 0) || product.product_variants[0];
    if (!availableVariant) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      const response = await cartAPI.addItem(product.id, availableVariant.sku, 1);
      setCart(response);
      toast.success(`${product.title} added to cart!`);
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-xl bg-zinc-800/50 border border-white/5 aspect-[4/5] mb-4">
          <div className="absolute inset-0 bg-zinc-800/20" />

          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
            />
          ) : (
            <div className={`absolute inset-0 flex items-center justify-center text-zinc-600 ${isOutOfStock ? 'opacity-60' : ''}`}>
              <span className="text-4xl">T</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {isOutOfStock ? (
              <div className="rounded-full bg-black/80 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm border border-white/10">
                Out of Stock
              </div>
            ) : (
              <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-zinc-900 shadow-sm backdrop-blur-sm">
                New
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-zinc-100 transition-colors group-hover:text-zinc-300">
            {product.title}
          </h3>
          <p className="mt-1 text-xs text-zinc-400 line-clamp-1">
            {product.description}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className={`text-base font-semibold ${isOutOfStock ? 'text-zinc-500' : 'text-zinc-100'}`}>
                ${Number(product.base_price).toFixed(2)}
              </span>
            </div>

            {!isOutOfStock && (
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: '#ffffff', color: '#000000' }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default ProductCard;
