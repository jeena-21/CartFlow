import {ImageSourcePropType} from 'react-native';

export interface Product {
  id: string;
  brand: string;
  name: string;
  weight: string;
  price: number;
  originalPrice: number;
  discount?: number;
  image: ImageSourcePropType;
  images: ImageSourcePropType[];
  description: string;
  options: ProductOption[];
}

export interface ProductOption {
  id: string;
  label: string;
  price: number;
  originalPrice: number;
  stock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  weight: string;
  price: number;
  originalPrice: number;
  image: ImageSourcePropType;
  quantity: number;
  optionId: string;
  optionLabel: string;
  isOutOfStock?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  discountType: 'flat' | 'percent';
  minOrder: number;
  description: string;
  isApplied?: boolean;
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  pincode: string;
  isServiceable: boolean;
  deliveryTime?: string;
}

export interface PriceBreakdown {
  itemTotal: number;
  deliveryFee: number;
  discount: number;
  platformFee: number;
  totalPayable: number;
}

export type DeliveryInstruction = 'avoid-bell' | 'door-step' | 'leave-with-guard';

export interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  selectedAddress: Address | null;
  deliveryInstruction: DeliveryInstruction | null;
  isLoggedIn: boolean;
  cashbackAmount: number;
}

export type RootStackParamList = {
  ProductDetail: {productId: string};
  Cart: undefined;
  AddAddress: undefined;
  Login: undefined;
};
