import { create } from 'zustand';

interface CartItem {
  id: number;
  title: string;
  price: number;
  image_url?: string;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  toastMessage: string | null;
  addToCart: (product: any) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  toastMessage: null,
  addToCart: (product) =>
    set((state) => {
      const existingIndex = state.cart.findIndex((item) => item.id === product.id);
      let updatedCart;

      if (existingIndex > -1) {
        updatedCart = [...state.cart];
        updatedCart[existingIndex].quantity += 1;
      } else {
        updatedCart = [
          ...state.cart,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            image_url: product.image_url || product.imageUrl,
            quantity: 1,
          },
        ];
      }

      return {
        cart: updatedCart,
        toastMessage: `"${product.title}" сагсанд нэмэгдлээ.`,
      };
    }),
  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),
  clearCart: () => set({ cart: [] }),
}));