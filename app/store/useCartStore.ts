import { create } from 'zustand';

export interface Product {
  id: number;
  title: string;
  price: number;
  isPreorder: boolean;
  imageUrl: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  
  // Сагсанд нэмэх
  addToCart: (product) => {
    const currentCart = get().cart;
    const existingItem = currentCart.find((item) => item.id === product.id);

    if (existingItem) {
      set({
        cart: currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ cart: [...currentCart, { ...product, quantity: 1 }] });
    }
  },

  // Сагснаас хасах
  removeFromCart: (id) => {
    set({
      cart: get().cart.filter((item) => item.id !== id),
    });
  },

  // Сагс цэвэрлэх
  clearCart: () => set({ cart: [] }),

  // Нийт үнэ бодох
  getTotalPrice: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  // Нийт барааны тоо
  getTotalCount: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },
}));
