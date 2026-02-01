import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuthStore, useCartStore } from '../store';
import toast from 'react-hot-toast';

function Navbar() {
  const { user, logout } = useAuthStore();
  const { cart } = useCartStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/logo.jpeg" alt="BeAware Logo" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-xl font-bold tracking-tight text-white">
              BeAware
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden space-x-8 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Shop
            </Link>
            {user && (
              <Link
                to="/orders"
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                Orders
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="text-sm font-medium text-red-400 transition-colors hover:text-red-300"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-zinc-300 transition-colors hover:text-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-zinc-950">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden items-center gap-2 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-200 border border-white/10">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
