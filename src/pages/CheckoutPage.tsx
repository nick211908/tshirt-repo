import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ordersAPI } from '../api';
import { useAuthStore, useCartStore } from '../store';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function CheckoutPage() {
  const { user } = useAuthStore();
  const { cart, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.full_name || '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
  });

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (
      !shippingAddress.address_line_1 ||
      !shippingAddress.city ||
      !shippingAddress.zip_code
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const items = cart?.items || [];
      const orderData = {
        shipping_address: shippingAddress,
        items: items,
        total_amount: cart?.total_price || 0,
        status: 'PENDING',
        currency: 'USD'
      };

      const order = await ordersAPI.create(orderData);

      toast.success('Order placed successfully!');
      clearCart();
      navigate('/orders'); // Redirect to orders page
    } catch (error: any) {
      console.error('Order creation failed:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart?.total_price || 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-zinc-50 py-16 text-zinc-900">
      <div className="mx-auto max-w-6xl px-6">
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-3xl font-semibold tracking-tight"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-xl border border-zinc-200 bg-white p-10"
            >
              {/* Steps */}
              <div className="mb-12 flex items-center justify-between">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${step >= s
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-200 text-zinc-600'
                        }`}
                    >
                      {s}
                    </div>
                    <span className="hidden text-sm font-medium sm:block">
                      {s === 1
                        ? 'Shipping'
                        : 'Review & Pay'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <div className="space-y-8">
                  <h2 className="text-xl font-semibold">
                    Shipping Address
                  </h2>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {[
                      { label: 'Full Name', name: 'full_name', className: 'md:col-span-2' },
                      { label: 'Address Line 1', name: 'address_line_1', className: 'md:col-span-2' },
                      { label: 'Address Line 2', name: 'address_line_2', className: 'md:col-span-2' },
                      { label: 'City', name: 'city' },
                      { label: 'State', name: 'state' },
                      { label: 'ZIP Code', name: 'zip_code' },
                      { label: 'Country', name: 'country', type: 'select' },
                    ].map((f) =>
                      f.type === 'select' ? (
                        <div key={f.name} className={f.className}>
                          <label className="mb-1 block text-sm font-medium">
                            {f.label}
                          </label>
                          <select
                            name={f.name}
                            value={(shippingAddress as any)[f.name]}
                            onChange={handleAddressChange}
                            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                          >
                            <option>USA</option>
                            <option>Canada</option>
                            <option>UK</option>
                          </select>
                        </div>
                      ) : (
                        <div key={f.name} className={f.className}>
                          <label className="mb-1 block text-sm font-medium">
                            {f.label}
                          </label>
                          <input
                            name={f.name}
                            value={(shippingAddress as any)[f.name]}
                            onChange={handleAddressChange}
                            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                          />
                        </div>
                      )
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setStep(2)}
                    className="w-full rounded-md bg-zinc-900 py-3 text-sm font-semibold text-white"
                  >
                    Continue
                  </motion.button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="space-y-8">
                  <h2 className="text-xl font-semibold">Review Order</h2>

                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-sm">
                    <p className="font-medium">{shippingAddress.full_name}</p>
                    <p className="text-zinc-600">
                      {shippingAddress.address_line_1}
                    </p>
                    <p className="text-zinc-600">
                      {shippingAddress.city},{' '}
                      {shippingAddress.state}{' '}
                      {shippingAddress.zip_code}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    {cart?.items.map((i) => (
                      <div
                        key={i.variant_sku}
                        className="flex justify-between text-zinc-700"
                      >
                        <span className="flex-1">
                          {i.title} ({i.variant_sku}) × {i.quantity}
                        </span>
                        <span>${(i.price * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-md border border-zinc-300 py-3 text-sm font-medium"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 rounded-md bg-zinc-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {loading ? 'Processing…' : 'Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-24 h-fit rounded-xl border border-zinc-200 bg-white p-8"
          >
            <h3 className="mb-6 text-lg font-semibold">Order Summary</h3>

            <div className="space-y-3 border-b pb-6 text-sm text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-semibold">
                ${total.toFixed(2)}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
