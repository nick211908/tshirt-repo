import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post('/auth/register', data),
  me: () =>
    api.get('/auth/me'),
  login: (email: string, password: string) =>
    api.post('/auth/token', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
};

export const productsAPI = {
  getAll: (skip: number = 0, limit: number = 20) =>
    api.get(`/products/?skip=${skip}&limit=${limit}`),
  getBySlug: (slug: string) =>
    api.get(`/products/${slug}`),
  create: (data: any) =>
    api.post('/products/', data),
  update: (id: string, data: any) =>
    api.put(`/products/${id}`, data),
  delete: (id: string) =>
    api.delete(`/products/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const cartAPI = {
  get: () => api.get('/cart/'),
  addItem: (productId: string, variantSku: string, quantity: number) =>
    api.post('/cart/items', { product_id: productId, variant_sku: variantSku, quantity }),
  removeItem: (productId: string, variantSku: string) =>
    api.delete(`/cart/items/${productId}/${variantSku}`),
};

export const ordersAPI = {
  create: (data: any) =>
    api.post<{ order: any; client_secret: string }>('/orders/', data),
  getAll: () =>
    api.get('/orders/'),
};

export default api;
