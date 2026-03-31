export const formatPrice = (price: number): string => `₹${price}`;

export const formatDiscount = (
  discount: number,
  type: 'flat' | 'percent',
): string => {
  return type === 'flat' ? `₹${discount} OFF` : `${discount}% OFF`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

export const calculateDiscountPercent = (
  original: number,
  current: number,
): number => {
  if (original <= 0) {
    return 0;
  }
  return Math.round(((original - current) / original) * 100);
};
