import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ordersAPI, API_BASE_URL } from '../api';
import toast from 'react-hot-toast';

interface OrderItem {
  product_id: string;
  variant_sku: string;
  title: string;
  size: string;
  color: string;
  unit_price: number;
  quantity: number;
  image?: string;
}



interface Order {
  _id: string;
  user_id: string;
  status: string;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  shipping_address: {
    full_name: string;
    address_line_1: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  created_at: string;
}

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-2 border-zinc-300 border-t-zinc-900"
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold">No orders yet</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Your completed orders will appear here.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-3xl font-semibold tracking-tight"
        >
          Your Orders
        </motion.h1>

        <div className="space-y-6">
          {orders.map((order, index) => (
            <OrderCard key={order._id} order={order} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  index: number;
}

function OrderCard({ order, index }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusStyles: Record<string, string> = {
    PENDING: 'bg-zinc-100 text-zinc-700',
    PROCESSING: 'bg-blue-50 text-blue-700',
    SHIPPED: 'bg-indigo-50 text-indigo-700',
    DELIVERED: 'bg-emerald-50 text-emerald-700',
    CANCELLED: 'bg-red-50 text-red-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-zinc-50"
      >
        <div>
          <p className="text-sm font-medium">
            Order #{order._id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.status] || 'bg-zinc-100 text-zinc-700'
              }`}
          >
            {order.status}
          </span>

          <div className="text-right">
            <p className="text-sm font-medium">
              ${Number(order.total_amount).toFixed(2)}
            </p>
            <p className="text-xs text-zinc-500">
              {order.items.length} items
            </p>
          </div>

          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            className="h-5 w-5 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </motion.svg>
        </div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: expanded ? 'auto' : 0,
          opacity: expanded ? 1 : 0,
        }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden border-t border-zinc-200"
      >
        <div className="space-y-8 bg-zinc-50 px-6 py-6 text-sm">
          {/* Items */}
          <div>
            <h4 className="mb-3 font-medium">Items</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.variant_sku}
                  className="flex items-center gap-4 justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={`${API_BASE_URL}${item.image}`}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-zinc-300">T</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-zinc-500">
                        {item.size} {item.color}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(item.unit_price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div>
            <h4 className="mb-2 font-medium">Shipping Address</h4>
            <div className="rounded-md border border-zinc-200 bg-white p-4">
              <p className="font-medium">
                {order.shipping_address.full_name}
              </p>
              <p className="text-zinc-600">
                {order.shipping_address.address_line_1}
              </p>
              <p className="text-zinc-600">
                {order.shipping_address.city},{' '}
                {order.shipping_address.state}{' '}
                {order.shipping_address.zip_code}
              </p>
              <p className="text-zinc-600">
                {order.shipping_address.country}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-white p-4">
            <span className="font-medium">Total</span>
            <span className="text-xl font-semibold">
              ${Number(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default OrdersPage;