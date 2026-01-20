import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import { cartAPI, API_BASE_URL } from '../api';
import toast from 'react-hot-toast';

function CartPage() {
  const { cart, setCart, removeItem } = useCartStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart');
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleRemoveItem = async (productId: string, variantSku: string) => {
    try {
      const response = await cartAPI.removeItem(productId, variantSku);
      setCart(response.data);
      removeItem(productId, variantSku);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!token) {
      navigate('/auth?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <svg
              className="h-10 w-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900">Your cart is empty</h2>
          <p className="mt-2 text-zinc-500">Start shopping to populate your cart.</p>
          <Link
            to="/"
            className="mt-8 inline-block rounded-md bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const totalPrice = cart.total_price;

  return (
    <div className="min-h-screen bg-zinc-50 py-16 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="mb-10 text-3xl font-semibold tracking-tight">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item, index) => (
                <CartItemRow
                  key={item.variant_sku}
                  item={item}
                  index={index}
                  onRemove={() => handleRemoveItem(item.product_id, item.variant_sku)}
                />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="sticky top-24 h-fit rounded-xl border border-zinc-200 bg-white p-8">
            <h3 className="mb-6 text-lg font-semibold">Order Summary</h3>

            <div className="mb-6 space-y-3 border-b border-zinc-100 pb-6 text-sm text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>${(totalPrice * 0.1).toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-8 flex items-center justify-between">
              <span className="text-base font-medium">Total</span>
              <span className="text-2xl font-semibold">
                ${(totalPrice * 1.1).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full rounded-md bg-zinc-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/"
              className="mt-4 block w-full rounded-md border border-zinc-200 py-3 text-center text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CartItemRowProps {
  item: any;
  index: number;
  onRemove: () => void;
}



function CartItemRow({ item, index, onRemove }: CartItemRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-zinc-100 bg-zinc-50">
          {item.image ? (
            <img
              src={`${API_BASE_URL}${item.image}`}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-300">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium text-zinc-900">{item.title}</h4>
          <p className="text-sm text-zinc-500">SKU: {item.variant_sku}</p>
          <div className="mt-1 flex items-center gap-4 text-sm text-zinc-500">
            <span>${item.price.toFixed(2)} x {item.quantity}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <span className="font-medium text-zinc-900">
          ${(item.price * item.quantity).toFixed(2)}
        </span>
        <button
          onClick={onRemove}
          className="rounded-md p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span className="sr-only">Remove</span>
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export default CartPage;
