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
      <Text style={[styles.label, isSmall && styles.labelSm]}>
        {percent}% OFF
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.offerPrimary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeSm: {
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  label: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  labelSm: {
    fontSize: FONT_SIZES.xs,
  },
});

export default DiscountBadge;
