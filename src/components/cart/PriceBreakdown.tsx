import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PriceBreakdown as PriceBreakdownType} from '../../types';
import {COLORS, FONT_SIZES, SPACING} from '../../constants/theme';
import {formatPrice} from '../../utils';

interface Props {
  breakdown: PriceBreakdownType;
  hasAddress: boolean;
  savedAmount?: number;
}

const PriceBreakdownCard: React.FC<Props> = ({
  breakdown,
  hasAddress,
  savedAmount = 0,
}) => {
  return (
    <View style={styles.container}>
      {/* Item Total */}
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Text style={styles.rowIcon}>ⓘ</Text>
          <Text style={styles.label}> Item total</Text>
          {savedAmount > 0 && (
            <View style={styles.savedBadge}>
              <Text style={styles.savedBadgeText}>Saved ₹{savedAmount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.value}>{formatPrice(breakdown.itemTotal)}</Text>
      </View>

      {/* Delivery Fee */}
      <View style={styles.col}>
        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Text style={styles.rowIcon}>🛵</Text>
            <Text style={styles.label}> Delivery fee</Text>
            {hasAddress && breakdown.deliveryFee === 0 && (
              <Text style={styles.strikeValue}>  ₹40</Text>
            )}
          </View>
          {hasAddress ? (
            <Text
              style={[
                styles.value,
                breakdown.deliveryFee === 0 && styles.freeText,
              ]}>
              {breakdown.deliveryFee === 0
                ? 'FREE'
                : formatPrice(breakdown.deliveryFee)}
            </Text>
          ) : (
            <Text style={styles.dashText}>--</Text>
          )}
        </View>
        {!hasAddress && (
          <Text style={styles.deliverySubText}>
            Add address to get the exact fee
          </Text>
        )}
      </View>

      {/* Discount */}
      {breakdown.discount > 0 && (
        <View style={styles.row}>
          <View style={styles.labelRow}>
            <Text style={styles.rowIcon}>⊘</Text>
            <Text style={styles.label}> Discount</Text>
          </View>
          <Text style={[styles.value, styles.discountText]}>
            −{formatPrice(breakdown.discount)}
          </Text>
        </View>
      )}

      {/* Platform Fee */}
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Text style={styles.rowIcon}>🏷</Text>
          <Text style={styles.label}> Platform fee</Text>
        </View>
        <Text style={[styles.value, styles.discountText]}>
          −{formatPrice(breakdown.platformFee)}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total payable amount</Text>
        <Text style={styles.totalValue}>
          {hasAddress ? formatPrice(breakdown.totalPayable) : '--'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  col: {
    paddingVertical: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  strikeValue: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  savedBadge: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: SPACING.xs,
  },
  savedBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  value: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  dashText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  freeText: {color: COLORS.primary},
  discountText: {color: COLORS.error},
  deliverySubText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent,
    marginLeft: 20,
    paddingBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
  },
});

export default PriceBreakdownCard;
