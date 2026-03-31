import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS, FONT_SIZES, BORDER_RADIUS} from '../../constants/theme';

interface Props {
  percent: number;
  size?: 'sm' | 'md';
}

const DiscountBadge: React.FC<Props> = ({percent, size = 'md'}) => {
  const isSmall = size === 'sm';
  return (
    <View style={[styles.badge, isSmall && styles.badgeSm]}>
      <Text style={[styles.percent, isSmall && styles.percentSm]}>
        {percent}%
      </Text>
      <Text style={[styles.off, isSmall && styles.offSm]}>OFF</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 40,
  },
  badgeSm: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 32,
  },
  percent: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    lineHeight: 14,
  },
  percentSm: {
    fontSize: FONT_SIZES.xs,
    lineHeight: 12,
  },
  off: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    lineHeight: 12,
  },
  offSm: {
    fontSize: 8,
    lineHeight: 10,
  },
});

export default DiscountBadge;
