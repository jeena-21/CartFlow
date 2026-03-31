import {useMemo} from 'react';
import {useAppDispatch, useAppSelector} from './useRedux';
import {
  addItem,
  removeItem,
  incrementQuantity,
  decrementQuantity,
  applyCoupon,
  removeCoupon,
  setAddress,
  setDeliveryInstruction,
  setLoggedIn,
} from '../store/slices/cartSlice';
import {
  CartItem,
  Coupon,
  Address,
  DeliveryInstruction,
  PriceBreakdown,
} from '../types';

const PLATFORM_FEE = 4;
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 40;

export const useCart = () => {
  const dispatch = useAppDispatch();
  const {
    items,
    appliedCoupon,
    selectedAddress,
    deliveryInstruction,
    isLoggedIn,
    cashbackAmount,
  } = useAppSelector(state => state.cart);

  const activeItems = useMemo(
    () => items.filter(i => !i.isOutOfStock),
    [items],
  );

  const outOfStockItems = useMemo(
    () => items.filter(i => i.isOutOfStock),
    [items],
  );

  const priceBreakdown = useMemo((): PriceBreakdown => {
    const itemTotal = activeItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const deliveryFee = itemTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'flat') {
        discount = appliedCoupon.discount;
      } else {
        discount = Math.round((itemTotal * appliedCoupon.discount) / 100);
      }
    }

    const totalPayable = Math.max(
      itemTotal + deliveryFee + PLATFORM_FEE - discount,
      0,
    );

    return {
      itemTotal,
      deliveryFee,
      discount,
      platformFee: PLATFORM_FEE,
      totalPayable,
    };
  }, [activeItems, appliedCoupon]);

  const savingsAmount = useMemo(
    () =>
      activeItems.reduce(
        (sum, item) =>
          sum + (item.originalPrice - item.price) * item.quantity,
        0,
      ),
    [activeItems],
  );

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const isServiceable = selectedAddress?.isServiceable ?? false;
  const hasAddress = selectedAddress !== null;
  const canProceed =
    isLoggedIn && hasAddress && isServiceable && activeItems.length > 0;

  return {
    items,
    activeItems,
    outOfStockItems,
    appliedCoupon,
    selectedAddress,
    deliveryInstruction,
    isLoggedIn,
    cashbackAmount,
    priceBreakdown,
    savingsAmount,
    totalItems,
    isServiceable,
    hasAddress,
    canProceed,
    addItem: (item: CartItem) => dispatch(addItem(item)),
    removeItem: (id: string) => dispatch(removeItem(id)),
    incrementQuantity: (id: string) => dispatch(incrementQuantity(id)),
    decrementQuantity: (id: string) => dispatch(decrementQuantity(id)),
    applyCoupon: (coupon: Coupon) => dispatch(applyCoupon(coupon)),
    removeCoupon: () => dispatch(removeCoupon()),
    setAddress: (address: Address) => dispatch(setAddress(address)),
    setDeliveryInstruction: (instr: DeliveryInstruction) =>
      dispatch(setDeliveryInstruction(instr)),
    setLoggedIn: (val: boolean) => dispatch(setLoggedIn(val)),
  };
};
