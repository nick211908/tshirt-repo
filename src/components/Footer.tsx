import React from 'react';
import { Link } from 'react-router-dom';


function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-zinc-950">
                <span className="text-lg font-bold">T</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">TeeStore</h3>
            </div>
            <p className="text-sm text-zinc-400">
              Premium quality t-shirts ensuring comfort and style for every occasion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Shop</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">My Cart</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Support</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>
                <button className="hover:text-white transition-colors">Contact Us</button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">FAQs</button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">Shipping & Returns</button>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Connect</h4>
            <div className="flex gap-4">
              {/* Facebook */}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-[#1877F2] hover:text-white transition-all duration-300"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </button>

              {/* Instagram */}
              <button
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-300 overflow-hidden relative"
                aria-label="Instagram"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <svg className="relative h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </button>

              {/* Twitter / X */}
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-black hover:text-white transition-all duration-300"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/5 pt-8 text-center text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} TeeStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
