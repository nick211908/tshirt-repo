import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../api';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  title: string;
  description: string;
  base_price: number;
  slug: string;
  variants: Array<{ color: string; size: string }>;
  images: string[];
  is_published: boolean;
  created_at: string;
}

function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll(0, 20);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  // Generate more intense antigravity particles
  const particles = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1, // varied sizes
    duration: Math.random() * 10 + 5, // Faster movement (5-15s)
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.3,
  }));

  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Intense Antigravity Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Professional Ambient Glows - Deep Indigo/Violet */}
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-indigo-900/10 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[800px] w-[800px] rounded-full bg-violet-900/10 blur-[130px]" />

        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ y: "110vh", x: `${particle.x}vw`, opacity: 0 }}
            animate={{
              y: "-10vh",
              opacity: [0, particle.opacity, particle.opacity, 0]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear",
            }}
            className="absolute rounded-full bg-white blur-[0.5px]"
            style={{
              width: particle.size,
              height: particle.size,
              boxShadow: `0 0 ${particle.size * 2}px rgba(255, 255, 255, 0.4)`
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-28 text-white"
        >
          {/* Ambient Motion */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute top-20 left-20 h-72 w-72 rounded-full bg-indigo-500 blur-[140px]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-violet-500 blur-[140px]"
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{
                opacity: 1,
                y: [0, -15, 0], // Permanent levitation loop
              }}
              transition={{
                opacity: { duration: 0.8, delay: 0.2 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" } // Slow float
              }}
              className="text-6xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-[0_20px_20px_rgba(255,255,255,0.15)]"
              style={{
                textShadow: "0 0 40px rgba(255,255,255,0.3)" // Extra glow
              }}
            >
              Elevated Everyday T-Shirts
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300"
            >
              Precision-crafted essentials made from premium fabrics, designed for comfort and longevity.
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => {
                document.getElementById('product-collection')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-10 inline-flex items-center rounded-lg bg-white px-8 py-4 text-sm font-semibold text-zinc-900 shadow-lg transition hover:bg-zinc-100"
            >
              Explore Collection
            </motion.button>
          </div>
        </motion.section>

        {/* Products Section */}
        <section id="product-collection" className="mx-auto max-w-7xl px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              Our Collection
            </h2>
            <div className="mx-auto mt-4 h-[2px] w-16 bg-gradient-to-r from-indigo-600 to-violet-600" />
          </motion.div>

          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-10 w-10 rounded-full border-2 border-zinc-300 border-t-zinc-900"
              />
            </div>
          ) : (
            <div className="space-y-12">
              {/* Men's Collection */}
              {products.some(p => p.slug.toLowerCase().includes('men') && !p.slug.toLowerCase().includes('women')) && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-white">Men's Collection</h3>
                    <div className="h-[1px] flex-1 bg-white/10 ml-6" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {products
                      .filter(p => p.slug.toLowerCase().includes('men') && !p.slug.toLowerCase().includes('women'))
                      .slice(0, 5)
                      .map((product, index) => (
                        <ProductCard key={product._id} product={product} index={index} />
                      ))}
                  </div>
                </div>
              )}

              {/* Women's Collection */}
              {products.some(p => p.slug.toLowerCase().includes('women')) && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-white">Women's Collection</h3>
                    <div className="h-[1px] flex-1 bg-white/10 ml-6" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {products
                      .filter(p => p.slug.toLowerCase().includes('women'))
                      .slice(0, 5)
                      .map((product, index) => (
                        <ProductCard key={product._id} product={product} index={index} />
                      ))}
                  </div>
                </div>
              )}



              {/* Show message if no products at all */}
              {products.length === 0 && (
                <p className="py-24 text-center text-zinc-500">
                  No products available
                </p>
              )}

              {/* All Products / Latest Arrivals */}
              {/* Show this section to ensure all products are visible, even if they don't fit categories above */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-semibold text-white">Latest Arrivals</h3>
                  <div className="h-[1px] flex-1 bg-white/10 ml-6" />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {products.slice(0, 12).map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="relative overflow-hidden border-t border-white/5 bg-zinc-900/30 py-32 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                The Premium Experience
              </h2>
              <div className="mx-auto mt-4 h-[1px] w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Global Fast Shipping',
                  description: 'Expedited delivery options available worldwide.',
                  icon: (
                    <svg className="h-6 w-6 text-zinc-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                },
                {
                  title: 'Uncompromised Quality',
                  description: 'Crafted from the finest sustainable materials.',
                  icon: (
                    <svg className="h-6 w-6 text-zinc-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  title: 'Secure Transactions',
                  description: 'Bank-level encryption for your peace of mind.',
                  icon: (
                    <svg className="h-6 w-6 text-zinc-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/50 p-8 text-center transition-all duration-300 hover:border-white/10 hover:bg-zinc-800/50"
                >
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-white transition-colors group-hover:bg-zinc-700">
                    {feature.icon}
                  </div>

                  <h3 className="text-lg font-semibold text-zinc-100">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
export default HomePage;
