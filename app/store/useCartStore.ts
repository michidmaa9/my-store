import { create } from 'zustand';

interface CartItem {
  cartItemId: string;
  id: number;
  title: string;
  price: number;
  image_url?: string;
  size?: string;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  toastMessage: string | null;
  addToCart: (product: any, size?: string, quantity?: number) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
}

let toastTimeout: NodeJS.Timeout | null = null;

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  toastMessage: null,
  addToCart: (product, size = '', quantity = 1) =>
    set((state) => {
      const cartItemId = `${product.id}-${size || 'nosize'}`;
      const existingIndex = state.cart.findIndex((item) => item.cartItemId === cartItemId);
      let updatedCart;

      if (existingIndex > -1) {
        updatedCart = [...state.cart];
        updatedCart[existingIndex].quantity += quantity;
      } else {
        const displayTitle = size ? `${product.title} (${size})` : product.title;
        updatedCart = [
          ...state.cart,
          {
            cartItemId,
            id: product.id,
            title: displayTitle,
            price: product.price,
            image_url: product.image_url || product.imageUrl,
            size,
            quantity,
          },
        ];
      }

      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        set({ toastMessage: null });
      }, 3000);

      const toastText = size ? `"${product.title} (${size})" сагсанд нэмэгдлээ.` : `"${product.title}" сагсанд нэмэгдлээ.`;

      return {
        cart: updatedCart,
        toastMessage: toastText,
      };
    }),
  
  // Сагсан доторх барааны тоог + / - болгож өөрчлөх функц
  updateQuantity: (cartItemId, delta) =>
    set((state) => {
      const updatedCart = state.cart.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[];

      return { cart: updatedCart };
    }),

  removeFromCart: (cartItemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.cartItemId !== cartItemId),
    })),
  clearCart: () => set({ cart: [] }),
}));