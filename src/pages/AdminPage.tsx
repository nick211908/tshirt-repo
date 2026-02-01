import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { productsAPI } from '../api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: string; // Supabase uses 'id'
    title: string;
    description: string;
    base_price: number;
    slug: string;
    is_published: boolean;
    product_variants: any[]; // Supabase join returns this
    images: string[];
}

function AdminPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // Redirect if not admin
    useEffect(() => {
        if (!user || user.role !== 'ADMIN') {
            toast.error('Access denied');
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getAll(0, 100);
            setProducts(response.data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await productsAPI.delete(id);
            toast.success('Product deleted');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        base_price: 0,
        slug: '',
        variants: [],
        images: [] as string[],
        is_published: true
    });


    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            category: product.slug.includes('men') && !product.slug.includes('women') ? 'Men' : product.slug.includes('women') ? 'Women' : product.slug.includes('high-neck') ? 'High Neck' : '',
            description: product.description,
            base_price: product.base_price,
            slug: product.slug,
            variants: product.product_variants || [], // Map from Supabase key
            images: product.images || [],
            is_published: product.is_published
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { variants, ...rest } = formData;
            const dataToSubmit = { ...rest, product_variants: variants }; // Map to API expected key

            if (editingProduct) {
                await productsAPI.update(editingProduct.id, dataToSubmit);
                toast.success('Product updated');
            } else {
                await productsAPI.create(dataToSubmit);
                toast.success('Product created');
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({
                title: '',
                category: '',
                description: '',
                base_price: 0,
                slug: '',
                variants: [],
                images: [],
                is_published: true
            });
            fetchProducts();
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setFormData({
                                title: '',
                                category: '',
                                description: '',
                                base_price: 0,
                                slug: '',
                                variants: [],
                                images: [],
                                is_published: true
                            });
                            setIsModalOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-fit"
                    >
                        Add New Product
                    </button>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-bold">
                                <tr>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{product.title}</td>
                                        <td className="px-6 py-4 text-gray-900">${Number(product.base_price).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-bold ${product.is_published
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {product.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-900 font-medium"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            >
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold mb-4 text-black">
                                        {editingProduct ? 'Edit Product' : 'Create New Product'}
                                    </h2>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-black mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.title}
                                                    onChange={(e) => {
                                                        const title = e.target.value;
                                                        const slug = `${formData.category ? formData.category.toLowerCase().replace(/ /g, '-') + '-' : ''}${title.toLowerCase().replace(/ /g, '-')}`;
                                                        setFormData({ ...formData, title, slug });
                                                    }}
                                                    className="w-full px-3 py-2
                                                        border border-gray-300
                                                        rounded-lg
                                                        text-black
                                                        bg-white
                                                        focus:outline-none
                                                        focus:ring-2
                                                        focus:ring-blue-500
                                                        focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-black mb-1">Category</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => {
                                                        const category = e.target.value;
                                                        const slug = `${category ? category.toLowerCase().replace(/ /g, '-') + '-' : ''}${formData.title.toLowerCase().replace(/ /g, '-')}`;
                                                        setFormData({ ...formData, category, slug });
                                                    }}
                                                    className="w-full px-3 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Select Category</option>
                                                    <option value="Men">Men</option>
                                                    <option value="Women">Women</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Auto-generated)</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Used for URL and categorization (e.g. men-..., women-..., high-neck-...)</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                required
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={formData.base_price}
                                                    onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                                                    className="w-full px-3 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="flex items-center pt-6">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.is_published}
                                                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-gray-700 font-medium">Published</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                                            <div className="flex flex-wrap gap-4 mb-2">
                                                {formData.images.map((img, index) => (
                                                    <div key={index} className="relative group w-24 h-24 border rounded-lg overflow-hidden">
                                                        <img
                                                            src={img}
                                                            alt={`Product ${index}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImages = [...formData.images];
                                                                newImages.splice(index, 1);
                                                                setFormData({ ...formData, images: newImages });
                                                            }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    <span className="text-xs text-gray-500 mt-1">Add Image</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                try {
                                                                    const loader = toast.loading('Uploading...');
                                                                    const res = await productsAPI.uploadImage(file);
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        images: [...prev.images, res.url]
                                                                    }));
                                                                    toast.dismiss(loader);
                                                                    toast.success('Image uploaded');
                                                                } catch (err) {
                                                                    toast.dismiss();
                                                                    toast.error('Upload failed');
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Variants Editor */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-medium text-gray-700">Variants</label>
                                            </div>

                                            {/* List of added variants */}
                                            {formData.variants.length > 0 && (
                                                <div className="mb-4 space-y-2">
                                                    {formData.variants.map((variant: any, index: number) => (
                                                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                            <div className="flex gap-4 text-sm">
                                                                <span className="font-medium text-gray-900">{variant.sku}</span>
                                                                <span className="text-gray-600">{variant.color} - {variant.size}</span>
                                                                <span className="text-gray-500">Qty: {variant.stock_quantity}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newVariants = [...formData.variants];
                                                                    newVariants.splice(index, 1);
                                                                    setFormData({ ...formData, variants: newVariants });
                                                                }}
                                                                className="text-red-500 hover:text-red-700 p-1"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Add New Variant Form */}
                                            <div className="grid grid-cols-4 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                <input
                                                    type="text"
                                                    placeholder="SKU"
                                                    className="col-span-1 px-3 py-2 text-sm border rounded bg-white text-gray-900 focus:ring-1 focus:ring-blue-500"
                                                    id="new-variant-sku"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Color"
                                                    className="col-span-1 px-3 py-2 text-sm border rounded bg-white text-gray-900 focus:ring-1 focus:ring-blue-500"
                                                    id="new-variant-color"
                                                />
                                                <select
                                                    className="col-span-1 px-3 py-2 text-sm border rounded bg-white text-gray-900 focus:ring-1 focus:ring-blue-500"
                                                    id="new-variant-size"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Size</option>
                                                    <option value="XS">XS</option>
                                                    <option value="S">S</option>
                                                    <option value="M">M</option>
                                                    <option value="L">L</option>
                                                    <option value="XL">XL</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    placeholder="Qty"
                                                    className="col-span-1 px-3 py-2 text-sm border rounded bg-white text-gray-900 focus:ring-1 focus:ring-blue-500"
                                                    id="new-variant-qty"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const skuInput = document.getElementById('new-variant-sku') as HTMLInputElement;
                                                        const colorInput = document.getElementById('new-variant-color') as HTMLInputElement;
                                                        const sizeInput = document.getElementById('new-variant-size') as HTMLSelectElement;
                                                        const qtyInput = document.getElementById('new-variant-qty') as HTMLInputElement;

                                                        if (!skuInput.value || !colorInput.value || !sizeInput.value || !qtyInput.value) {
                                                            toast.error('Please fill all variant fields');
                                                            return;
                                                        }

                                                        const newVariant = {
                                                            sku: skuInput.value,
                                                            color: colorInput.value,
                                                            size: sizeInput.value,
                                                            stock_quantity: parseInt(qtyInput.value)
                                                        };

                                                        setFormData({
                                                            ...formData,
                                                            variants: [...formData.variants, newVariant]
                                                        });

                                                        // Reset inputs
                                                        skuInput.value = '';
                                                        colorInput.value = '';
                                                        sizeInput.value = '';
                                                        qtyInput.value = '';
                                                    }}
                                                    className="col-span-4 mt-2 py-2 bg-zinc-900 text-white text-sm font-medium rounded hover:bg-zinc-800 transition"
                                                >
                                                    Add Variant
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setIsModalOpen(false)}
                                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                {editingProduct ? 'Save Changes' : 'Create Product'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default AdminPage;
