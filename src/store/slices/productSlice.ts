import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Product} from '../../types';
import {MOCK_PRODUCTS} from '../../constants/mockData';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  selectedOptionId: string | null;
}

const initialState: ProductState = {
  products: MOCK_PRODUCTS,
  selectedProduct: null,
  selectedOptionId: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    selectProduct(state, action: PayloadAction<string>) {
      state.selectedProduct =
        state.products.find(p => p.id === action.payload) || null;
      if (state.selectedProduct) {
        state.selectedOptionId = state.selectedProduct.options[0]?.id || null;
      }
    },
    selectOption(state, action: PayloadAction<string>) {
      state.selectedOptionId = action.payload;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
      state.selectedOptionId = null;
    },
  },
});

export const {selectProduct, selectOption, clearSelectedProduct} =
  productSlice.actions;
export default productSlice.reducer;
