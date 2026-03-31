import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLORS, FONT_SIZES, BORDER_RADIUS} from '../../constants/theme';

interface Props {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'sm' | 'md';
}

const QuantitySelector: React.FC<Props> = ({
  quantity,
  onIncrement,
  onDecrement,
  size = 'md',
}) => {
  const isSmall = size === 'sm';

  return (
    <View style={[styles.container, isSmall && styles.containerSm]}>
      <TouchableOpacity
        style={[styles.btn, isSmall && styles.btnSm]}
        onPress={onDecrement}
        activeOpacity={0.7}>
        <Text style={[styles.btnText, isSmall && styles.btnTextSm]}>−</Text>
      </TouchableOpacity>
      <Text style={[styles.qty, isSmall && styles.qtySm]}>{quantity}</Text>
      <TouchableOpacity
        style={[styles.btn, isSmall && styles.btnSm]}
        onPress={onIncrement}
        activeOpacity={0.7}>
        <Text style={[styles.btnText, isSmall && styles.btnTextSm]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  containerSm: {
    borderRadius: BORDER_RADIUS.sm,
  },
  btn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSm: {
    width: 26,
    height: 26,
  },
  btnText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: 22,
  },
  btnTextSm: {
    fontSize: FONT_SIZES.md,
    lineHeight: 18,
  },
  qty: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  qtySm: {
    minWidth: 22,
    fontSize: FONT_SIZES.sm,
  },
});

export default QuantitySelector;
