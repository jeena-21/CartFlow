import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import {Product, ProductOption} from '../../types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../../constants/theme';
import {formatPrice} from '../../utils';
import QuantitySelector from '../common/QuantitySelector';

interface Props {
  visible: boolean;
  product: Product | null;
  selectedOptionId: string | null;
  quantities: Record<string, number>;
  onSelectOption: (optionId: string) => void;
  onIncrement: (optionId: string) => void;
  onDecrement: (optionId: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const OptionsBottomSheet: React.FC<Props> = ({
  visible,
  product,
  quantities,
  onSelectOption,
  onIncrement,
  onDecrement,
  onConfirm,
  onClose,
}) => {
  if (!product) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.productHeader}>
          <Image
            source={product.images[0]}
            style={styles.productImage}
            resizeMode="contain"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productBrand}>{product.brand}</Text>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <ScrollView
          style={styles.optionsList}
          showsVerticalScrollIndicator={false}>
          {product.options.map((option: ProductOption) => {
            const qty = quantities[option.id] || 0;
            const isOutOfStock = option.stock === 0;
            return (
              <View key={option.id} style={styles.optionRow}>
                <View style={styles.optionLeft}>
                  {option.stock > 0 && option.stock <= 3 && (
                    <Text style={styles.urgencyDot}>● </Text>
                  )}
                  <Text
                    style={[
                      styles.optionLabel,
                      isOutOfStock && styles.optionLabelMuted,
                    ]}>
                    {option.label}
                  </Text>
                </View>
                <View style={styles.optionRight}>
                  <View style={styles.optionPrices}>
                    <Text
                      style={[
                        styles.optionPrice,
                        isOutOfStock && styles.optionPriceMuted,
                      ]}>
                      {formatPrice(option.price)}
                    </Text>
                    {option.originalPrice > option.price && (
                      <Text style={styles.optionOriginalPrice}>
                        {formatPrice(option.originalPrice)}
                      </Text>
                    )}
                  </View>
                  {isOutOfStock ? (
                    <View style={styles.outOfStockBtn}>
                      <Text style={styles.outOfStockText}>Out of stock</Text>
                    </View>
                  ) : qty > 0 ? (
                    <QuantitySelector
                      quantity={qty}
                      onIncrement={() => onIncrement(option.id)}
                      onDecrement={() => onDecrement(option.id)}
                      size="sm"
                    />
                  ) : (
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => {
                        onSelectOption(option.id);
                        onIncrement(option.id);
                      }}
                      activeOpacity={0.7}>
                      <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={onConfirm}
            activeOpacity={0.8}>
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background,
    marginRight: SPACING.md,
  },
  productInfo: {flex: 1},
  productBrand: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  productName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
  },
  optionsList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  urgencyDot: {
    color: COLORS.error,
    fontSize: FONT_SIZES.xs,
  },
  optionLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  optionLabelMuted: {color: COLORS.textMuted},
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionPrices: {alignItems: 'flex-end'},
  optionPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionPriceMuted: {color: COLORS.textMuted},
  optionOriginalPrice: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.strikethrough,
    textDecorationLine: 'line-through',
  },
  outOfStockBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  outOfStockText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});

export default OptionsBottomSheet;
