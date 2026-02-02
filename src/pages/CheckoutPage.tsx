import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuthStore, useCartStore } from '../store';
import { ordersAPI } from '../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { loadRazorpay, openRazorpay } from '../utils/razorpay';
import MapPicker from '../components/MapPicker';

function CheckoutPage() {
  const { user } = useAuthStore();
  const { cart, clearCart } = useCartStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [addressFromMap, setAddressFromMap] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.full_name || '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India',
    latitude: null as number | null,
    longitude: null as number | null,
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

    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      // Calculate total amount in smallest currency unit (paise for INR)
      const subtotal = cart.total_price;
      const tax = subtotal * 0.1; // 10% tax
      const totalAmount = subtotal + tax;
      const amountInPaise = Math.round(totalAmount * 100);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
        amount: amountInPaise,
        currency: 'INR',
        name: 'BeAware',
        description: 'Payment for your order',
        image: '/images/logo.jpeg',
        // No order_id for client-side flow
        prefill: {
          name: shippingAddress.full_name,
          email: user?.email,
        },
        modal: {
          ondismiss: () => setLoading(false)
        },
        theme: {
          color: '#18181b', // Zinc-900
        },
        handler: async (response: any) => {
          try {
            setLoading(true);
            toast.loading('Processing order...', { id: 'processing-order' });

            // Create order in database after successful payment
            await ordersAPI.create({
              items: cart.items,
              total_amount: totalAmount,
              currency: 'INR',
              status: 'PAID',
              shipping_address: shippingAddress,
              payment_intent_id: response.razorpay_payment_id
            });

            toast.dismiss('processing-order');
            toast.success('Payment successful! Order placed.');
            clearCart();
            navigate('/orders');
          } catch (err: any) {
            console.error('Order creation failed:', err);
            toast.dismiss('processing-order');
            toast.error(err?.message || 'Failed to create order despite payment success. Please contact support.');
          } finally {
            setLoading(false);
          }
        }
      };

      openRazorpay(options);
    } catch (err: any) {
      console.error('Payment init failed:', err);
      toast.error(err?.message || 'Failed to start payment');
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
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Shipping Address</h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsMapOpen(true)}
                      type="button"
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Select on Map
                    </motion.button>
                  </div>

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
                            <option>India</option>

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
                            readOnly={addressFromMap && f.name !== 'full_name'}
                            className={`w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none ${addressFromMap && f.name !== 'full_name' ? 'bg-zinc-50' : ''}`}
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
                        <span>{`₹${(i.price * i.quantity).toFixed(2)}`}</span>
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
                      {loading ? 'Processing…' : 'Pay with Razorpay'}
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
                <span>{`₹${subtotal.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{`₹${tax.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-2xl font-semibold">
                {`₹${total.toFixed(2)}`}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Map Picker Modal */}
      <MapPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={(addressData) => {
          setShippingAddress((prev) => ({
            ...prev,
            address_line_1: addressData.address_line_1,
            city: addressData.city,
            state: addressData.state,
            zip_code: addressData.zip_code,
            country: addressData.country,
            latitude: addressData.latitude,
            longitude: addressData.longitude,
          }));
          setAddressFromMap(true);
        }}
      />
    </div>
  );
}

export default CheckoutPage;
