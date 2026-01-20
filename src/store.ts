import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface CartItem {
  product_id: string;
  variant_sku: string;
  quantity: number;
  added_at: string;
  title: string;
  price: number;
  image: string | null;
}

interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  updated_at: string;
  total_price: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  logout: () => void;
}

interface CartStore {
  cart: Cart | null;
  setCart: (cart: Cart | null) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantSku: string) => void;
  clearCart: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token'),
  isLoading: false,
  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  setIsLoading: (loading) => set({ isLoading: loading }),
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    useCartStore.getState().clearCart();
  },
}));

export const useCartStore = create<CartStore>((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),
  addItem: (item) =>
    set((state) => ({
      cart: state.cart
        ? {
          ...state.cart,
          items: [
            ...state.cart.items.filter((i) => i.variant_sku !== item.variant_sku),
            item,
          ],
        }
        : null,
    })),
  removeItem: (productId, variantSku) =>
    set((state) => ({
      cart: state.cart
        ? {
          ...state.cart,
          items: state.cart.items.filter((i) => i.variant_sku !== variantSku),
        }
        : null,
    })),
  clearCart: () => set({ cart: null }),
}));
