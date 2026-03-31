import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Coupon} from '../../types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../../constants/theme';

interface Props {
  coupon: Coupon;
  onApply: () => void;
  onRemove: () => void;
}

const CouponCard: React.FC<Props> = ({coupon, onApply, onRemove}) => {
  const isFlat = coupon.discountType === 'flat';

  return (
    <View style={styles.card}>
      <View style={[styles.badge, isFlat ? styles.badgeTeal : styles.badgePurple]}>
        <Text style={styles.badgeAmount}>
          {isFlat ? `₹${coupon.discount}` : `${coupon.discount}%`}
        </Text>
        <Text style={styles.badgeOff}>OFF</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {coupon.description}
      </Text>
      <Text style={styles.code}>{coupon.code}</Text>
      {coupon.isApplied ? (
        <TouchableOpacity style={styles.appliedBtn} onPress={onRemove} activeOpacity={0.8}>
          <Text style={styles.appliedText}>✓ APPLIED</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.applyBtn} onPress={onApply} activeOpacity={0.7}>
          <Text style={styles.applyText}>APPLY</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 120,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.md,
    gap: SPACING.xs,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  badgeTeal: {backgroundColor: COLORS.offerPrimary},
  badgePurple: {backgroundColor: COLORS.offerPrimary},
  badgeAmount: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    lineHeight: 17,
  },
  badgeOff: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    lineHeight: 12,
  },
  description: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  code: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  applyBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 2,
  },
  applyText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  appliedBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  appliedText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
});

export default CouponCard;
