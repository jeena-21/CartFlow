import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CartItem, Coupon, Address, DeliveryInstruction, CartState} from '../../types';
import {INITIAL_CART_ITEMS} from '../../constants/mockData';

const initialState: CartState = {
  items: INITIAL_CART_ITEMS,
  appliedCoupon: null,
  selectedAddress: null,
  deliveryInstruction: null,
  isLoggedIn: false,
  cashbackAmount: 500,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    incrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },
    decrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        if (item.quantity <= 1) {
          state.items = state.items.filter(i => i.id !== action.payload);
        } else {
          item.quantity -= 1;
        }
      }
    },
    applyCoupon(state, action: PayloadAction<Coupon>) {
      state.appliedCoupon = {...action.payload, isApplied: true};
    },
    removeCoupon(state) {
      state.appliedCoupon = null;
    },
    setAddress(state, action: PayloadAction<Address>) {
      state.selectedAddress = action.payload;
    },
    setDeliveryInstruction(state, action: PayloadAction<DeliveryInstruction>) {
      state.deliveryInstruction = action.payload;
    },
    setLoggedIn(state, action: PayloadAction<boolean>) {
      state.isLoggedIn = action.payload;
    },
    markOutOfStock(state, action: PayloadAction<string>) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        item.isOutOfStock = true;
      }
    },
    clearCart(state) {
      state.items = [];
      state.appliedCoupon = null;
    },
  },
});

export const {
  addItem,
  removeItem,
  incrementQuantity,
  decrementQuantity,
  applyCoupon,
  removeCoupon,
  setAddress,
  setDeliveryInstruction,
  setLoggedIn,
  markOutOfStock,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
