import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import {Product} from '../../types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../../constants/theme';
import DiscountBadge from '../common/DiscountBadge';
import {formatPrice} from '../../utils';

interface Props {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  onOptionsPress?: () => void;
  showOptions?: boolean;
}

const ProductCard: React.FC<Props> = ({
  product,
  onPress,
  onAddToCart,
  onOptionsPress,
  showOptions = true,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {product.discount && product.discount > 0 && (
          <View style={styles.badge}>
            <DiscountBadge percent={product.discount} size="sm" />
          </View>
        )}
        <Image
          source={product.image}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.weight}>{product.weight}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {product.originalPrice > product.price && (
            <Text style={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
        </View>
        {showOptions ? (
          <TouchableOpacity
            style={styles.optionsBtn}
            onPress={onOptionsPress ?? onPress}
            activeOpacity={0.7}>
            <Text style={styles.optionsBtnText}>
              {product.options.length} options ▾
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAddToCart}
            activeOpacity={0.7}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 130,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.background,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    zIndex: 1,
  },
  image: {
    width: 80,
    height: 80,
  },
  info: {
    padding: SPACING.sm,
  },
  brand: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  name: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
    lineHeight: 14,
    minHeight: 28,
  },
  weight: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  price: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  originalPrice: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.strikethrough,
    textDecorationLine: 'line-through',
  },
  optionsBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  optionsBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});

export default ProductCard;
