import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {CartItem as CartItemType} from '../../types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../../constants/theme';
import {formatPrice} from '../../utils';
import QuantitySelector from '../common/QuantitySelector';

interface Props {
  item: CartItemType;
  onIncrement: () => void;
  onDecrement: () => void;
  onDelete?: () => void;
}

const CartItemRow: React.FC<Props> = ({
  item,
  onIncrement,
  onDecrement,
  onDelete,
}) => {
  if (item.isOutOfStock) {
    return (
      <View style={[styles.container, styles.outOfStockContainer]}>
        <Image
          source={item.image}
          style={[styles.image, styles.imageFaded]}
          resizeMode="contain"
        />
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.weight}>{item.optionLabel}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={item.image}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.weight}>{item.optionLabel}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          {item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>
              {formatPrice(item.originalPrice)}
            </Text>
          )}
        </View>
      </View>
      <QuantitySelector
        quantity={item.quantity}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        size="sm"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    gap: SPACING.md,
  },
  outOfStockContainer: {
    backgroundColor: '#FFF5F5',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.borderLight,
  },
  imageFaded: {
    opacity: 0.4,
  },
  details: {
    flex: 1,
  },
  outOfStockLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    fontWeight: '600',
    marginBottom: 2,
  },
  name: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 2,
  },
  weight: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  originalPrice: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.strikethrough,
    textDecorationLine: 'line-through',
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});

export default CartItemRow;
