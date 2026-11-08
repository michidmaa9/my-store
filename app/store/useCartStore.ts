import { create } from 'zustand';

interface CartItem {
  cartItemId: string; // ID болон размерыг нийлүүлж ялгах уникал түлхүүр (Жишээ нь: 5-S)
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
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
}

let toastTimeout: NodeJS.Timeout | null = null;

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  toastMessage: null,
  addToCart: (product, size = '', quantity = 1) =>
    set((state) => {
      // Тухайн бараа болон сонгосон размерыг нь хамтад нь уникал ID болгоно
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

      // Өмнөх таймерыг цэвэрлэж байгаад шинээр 3 секунд тоолно
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
  removeFromCart: (cartItemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.cartItemId !== cartItemId),
    })),
  clearCart: () => set({ cart: [] }),
}));