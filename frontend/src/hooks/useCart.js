/**
 * Custom hook for cart state management using Zustand.
 * Persists cart to localStorage.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const CART_STORAGE_KEY = 'restaurant-cart';

/**
 * Cart item structure
 * @typedef {Object} CartItem
 * @property {number} id - Menu item ID
 * @property {string} name - Item name
 * @property {number} price - Item price
 * @property {number} quantity - Quantity
 * @property {string} image_url - Item image URL
 */

/**
 * Cart store
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,

      // Set table ID
      setTableId: (tableId) => {
        // Clear cart if table changes
        const currentTableId = get().tableId;
        if (currentTableId && currentTableId !== tableId) {
          set({ items: [], tableId });
        } else {
          set({ tableId });
        }
      },

      // Add item to cart
      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.id === item.id);

        if (existingItem) {
          // Update quantity
          set({
            items: items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          // Add new item
          set({
            items: [...items, { ...item, quantity: item.quantity || 1 }],
          });
        }
      },

      // Remove item from cart
      removeItem: (itemId) => {
        set({
          items: get().items.filter((i) => i.id !== itemId),
        });
      },

      // Update item quantity
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        });
      },

      // Clear cart
      clearCart: () => {
        set({ items: [] });
      },

      // Get total items count
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Get total price
      getTotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        tableId: state.tableId,
      }),
    }
  )
);

export default useCartStore;
