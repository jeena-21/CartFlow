import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList, Coupon, Product} from '../../types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../../constants/theme';
import {MOCK_COUPONS, MOCK_ADDRESSES, MOCK_PRODUCTS} from '../../constants/mockData';
import {useCart} from '../../hooks/useCart';
import {formatPrice} from '../../utils';
import CartItemRow from '../../components/cart/CartItemRow';
import CouponCard from '../../components/cart/CouponCard';
import PriceBreakdownCard from '../../components/cart/PriceBreakdown';
import ProductCard from '../../components/product/ProductCard';
import OptionsBottomSheet from '../../components/product/OptionsBottomSheet';
import {useAppDispatch} from '../../hooks/useRedux';
import {addItem, incrementQuantity} from '../../store/slices/cartSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'Cart'>;

const CASHBACK_THRESHOLD = 500;

const DELIVERY_INSTRUCTIONS = [
  {key: 'avoid-bell' as const, label: "Don't ring the bell", icon: '🔕'},
  {key: 'door-step' as const, label: "Don't call", icon: '📵'},
  {key: 'leave-with-guard' as const, label: 'Leave order with guard', icon: '👤'},
];

const CartScreen: React.FC<Props> = ({navigation}) => {
  const cart = useCart();
  const dispatch = useAppDispatch();
  const [coupons, setCoupons] = useState(MOCK_COUPONS);
  const [customInstruction, setCustomInstruction] = useState('');
  const [showLoginSheet, setShowLoginSheet] = useState(false);
  const [sideProduct, setSideProduct] = useState<Product | null>(null);
  const [sideOptionQuantities, setSideOptionQuantities] = useState<Record<string, number>>({});

  const handleApplyCoupon = (coupon: Coupon) => {
    if (cart.priceBreakdown.itemTotal < coupon.minOrder) {return;}
    cart.applyCoupon(coupon);
    setCoupons(prev => prev.map(c => ({...c, isApplied: c.id === coupon.id})));
  };

  const handleRemoveCoupon = () => {
    cart.removeCoupon();
    setCoupons(prev => prev.map(c => ({...c, isApplied: false})));
  };

  const handleSideConfirm = () => {
    if (!sideProduct) {return;}
    Object.entries(sideOptionQuantities).forEach(([optionId, qty]) => {
      const option = sideProduct.options.find(o => o.id === optionId);
      if (!option || qty === 0) {return;}
      const cartItemId = `${sideProduct.id}_${optionId}`;
      const existingItem = cart.items.find(i => i.id === cartItemId);
      if (existingItem) {
        for (let i = 0; i < qty; i++) {
          dispatch(incrementQuantity(cartItemId));
        }
      } else {
        dispatch(
          addItem({
            id: cartItemId,
            productId: sideProduct.id,
            name: sideProduct.name,
            brand: sideProduct.brand,
            weight: sideProduct.weight,
            price: option.price,
            originalPrice: option.originalPrice,
            image: sideProduct.images[0],
            quantity: qty,
            optionId,
            optionLabel: option.label,
            isOutOfStock: false,
          }),
        );
      }
    });
    setSideOptionQuantities({});
    setSideProduct(null);
  };

  const handleAddSingleOption = (product: Product) => {
    const option = product.options[0];
    if (!option) {return;}
    const cartItemId = `${product.id}_${option.id}`;
    const existingItem = cart.items.find(i => i.id === cartItemId);
    if (existingItem) {
      dispatch(incrementQuantity(cartItemId));
    } else {
      dispatch(
        addItem({
          id: cartItemId,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          weight: product.weight,
          price: option.price,
          originalPrice: option.originalPrice,
          image: product.images[0],
          quantity: 1,
          optionId: option.id,
          optionLabel: option.label,
          isOutOfStock: false,
        }),
      );
    }
  };

  const forgetProducts = MOCK_PRODUCTS.filter(
    p => !cart.items.some(i => i.productId === p.id),
  );

  const cashbackRemaining = Math.max(
    0,
    CASHBACK_THRESHOLD - cart.priceBreakdown.itemTotal,
  );

  // ── Empty Cart ──────────────────────────────────────────────────────────────
  if (cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Cart</Text>
          <View style={{width: 40}} />
        </View>
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('ProductDetail', {productId: '2'})}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Bottom Bar ──────────────────────────────────────────────────────────────
  const renderBottomBar = () => {
    const addr = cart.selectedAddress;

    // State 1: No address
    if (!cart.hasAddress) {
      return (
        <View style={styles.bottomBarNoAddress}>
          <View style={styles.deliverRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.deliverWhereText}>
              Where would you like to deliver?
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addAddressBtn}
            onPress={() => cart.setAddress(MOCK_ADDRESSES[0])}
            activeOpacity={0.9}>
            <Text style={styles.addAddressBtnText}>Add address</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const isServiceable = addr!.isServiceable;
    const switchAddr = () => {
      const other = MOCK_ADDRESSES.find(a => a.id !== addr!.id);
      if (other) {cart.setAddress(other);}
    };

    // State 2: Has address, not serviceable
    if (!isServiceable) {
      return (
        <View style={styles.bottomBar}>
          <View style={styles.addressRow}>
            <View style={styles.addressLeft}>
              <Ionicons name="location" size={16} color={COLORS.error} />
              <View>
                <Text style={styles.notServiceableText}>
                  Location not serviceable
                </Text>
                <Text style={styles.addressSnippet} numberOfLines={1}>
                  {addr!.label}{'  '}
                  <Text style={styles.addressDetail}>{addr!.fullAddress}</Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={switchAddr}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ctaRow}>
            <View>
              <Text style={styles.toPayLabel}>To Pay</Text>
              <Text style={styles.toPayAmount}>
                {formatPrice(cart.priceBreakdown.itemTotal)}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.proceedBtn, styles.proceedBtnDisabled]}
              disabled
              activeOpacity={1}>
              <Text style={styles.proceedBtnText}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // State 3: Serviceable, not logged in
    if (!cart.isLoggedIn) {
      return (
        <View style={styles.bottomBar}>
          <View style={styles.addressRow}>
            <View style={styles.addressLeft}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <View>
                <Text style={styles.deliverTimeText}>
                  Deliver in {addr!.deliveryTime} ⚡
                </Text>
                <Text style={styles.addressSnippet} numberOfLines={1}>
                  {addr!.label}{'  '}
                  <Text style={styles.addressDetail}>{addr!.fullAddress}</Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={switchAddr}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ctaRow}>
            <View>
              <Text style={styles.toPayLabel}>To Pay</Text>
              <Text style={styles.toPayAmount}>
                {formatPrice(cart.priceBreakdown.totalPayable)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.proceedBtn}
              onPress={() => setShowLoginSheet(true)}
              activeOpacity={0.9}>
              <Text style={styles.proceedBtnText}>Login to continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // State 4: Serviceable + logged in
    return (
      <View style={styles.bottomBar}>
        <View style={styles.addressRow}>
          <View style={styles.addressLeft}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <View>
              <Text style={styles.deliverTimeText}>
                Deliver in {addr!.deliveryTime} ⚡
              </Text>
              <Text style={styles.addressSnippet} numberOfLines={1}>
                {addr!.label}{'  '}
                <Text style={styles.addressDetail}>{addr!.fullAddress}</Text>
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={switchAddr}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.ctaRow}>
          <View>
            <Text style={styles.toPayLabel}>To Pay</Text>
            <Text style={styles.toPayAmount}>
              {formatPrice(cart.priceBreakdown.totalPayable)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.proceedBtn}
            onPress={() => {}}
            activeOpacity={0.9}>
            <Text style={styles.proceedBtnText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Main Render ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Cart</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* Savings Banner */}
        {cart.savingsAmount > 0 && (
          <View style={styles.savingsBanner}>
            <Text style={styles.savingsBannerText}>
              You are saving{' '}
              <Text style={styles.savingsBold}>₹{cart.savingsAmount}</Text>{' '}
              with this order!
            </Text>
          </View>
        )}

        {/* High Demand Banner */}
        <View style={styles.highDemandBanner}>
          <Text style={styles.highDemandIcon}>⚠️</Text>
          <Text style={styles.highDemandText}>
            Your order is slightly delayed due to high demand
          </Text>
        </View>

        {/* Out-of-stock items */}
        {cart.outOfStockItems.length > 0 && (
          <View style={styles.outOfStockSection}>
            <View style={styles.outOfStockBanner}>
              <Text style={styles.outOfStockBannerText}>
                This item is out of stock
              </Text>
            </View>
            {cart.outOfStockItems.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                onIncrement={() => {}}
                onDecrement={() => {}}
                onDelete={() => cart.removeItem(item.id)}
              />
            ))}
            <View style={styles.similarSection}>
              <Text style={styles.similarTitle}>Similar items</Text>
              <FlatList
                data={MOCK_PRODUCTS.slice(0, 3)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={p => `sim_${p.id}`}
                contentContainerStyle={{paddingTop: SPACING.sm}}
                renderItem={({item}) => (
                  <ProductCard
                    product={item}
                    onPress={() =>
                      navigation.navigate('ProductDetail', {productId: item.id})
                    }
                    onOptionsPress={() => setSideProduct(item)}
                    showOptions={item.options.length > 1}
                    onAddToCart={() => handleAddSingleOption(item)}
                  />
                )}
              />
            </View>
          </View>
        )}

        {/* Cart Items */}
        {cart.activeItems.length > 0 && (
          <View style={styles.cartItemsSection}>
            {cart.activeItems.map((item, idx) => (
              <React.Fragment key={item.id}>
                <CartItemRow
                  item={item}
                  onIncrement={() => cart.incrementQuantity(item.id)}
                  onDecrement={() => cart.decrementQuantity(item.id)}
                  onDelete={() => cart.removeItem(item.id)}
                />
                {idx < cart.activeItems.length - 1 && (
                  <View style={styles.itemDivider} />
                )}
              </React.Fragment>
            ))}
          </View>
        )}

        <View style={styles.sectionDivider} />

        {/* Did you forget? */}
        {forgetProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Did you forget?</Text>
            <FlatList
              data={forgetProducts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={p => `forget_${p.id}`}
              contentContainerStyle={{paddingTop: SPACING.sm}}
              renderItem={({item}) => (
                <ProductCard
                  product={item}
                  onPress={() =>
                    navigation.navigate('ProductDetail', {productId: item.id})
                  }
                  onOptionsPress={() => setSideProduct(item)}
                  showOptions={item.options.length > 1}
                  onAddToCart={() => handleAddSingleOption(item)}
                />
              )}
            />
          </View>
        )}

        <View style={styles.sectionDivider} />

        {/* Top Coupons */}
        <View style={styles.couponSection}>
          <Text style={styles.couponSectionTitle}>🎟 Top coupons for you 🎟</Text>
          <FlatList
            data={coupons}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={c => c.id}
            contentContainerStyle={{paddingTop: SPACING.md, paddingBottom: SPACING.xs}}
            renderItem={({item}) => (
              <CouponCard
                coupon={item}
                onApply={() => handleApplyCoupon(item)}
                onRemove={handleRemoveCoupon}
              />
            )}
          />
          {cart.appliedCoupon && (
            <>
              <Text style={styles.couponSavingsText}>
                🎉 You are saving{' '}
                <Text style={styles.couponSavingsBold}>
                  ₹
                  {cart.appliedCoupon.discountType === 'flat'
                    ? cart.appliedCoupon.discount
                    : Math.round(
                        (cart.priceBreakdown.itemTotal *
                          cart.appliedCoupon.discount) /
                          100,
                      )}
                </Text>{' '}
                with this coupon 🎉
              </Text>
              <TouchableOpacity style={styles.viewMoreRow}>
                <Text style={styles.viewMoreText}>View more coupons and offers</Text>
                <Text style={styles.viewMoreArrow}> ›</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.sectionDivider} />

        {/* Cashback */}
        <View style={styles.cashbackSection}>
          <View style={styles.cashbackIcon}>
            <Text style={styles.cashbackIconText}>💰</Text>
          </View>
          <View style={styles.cashbackInfo}>
            {cart.isLoggedIn ? (
              <>
                <Text style={styles.cashbackTitle}>
                  Yay! You've received a cashback of ₹{cart.cashbackAmount}
                </Text>
                <Text style={styles.cashbackSub}>
                  The cashback will be added in your Aforro wallet
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.cashbackTitle}>
                  Add items worth ₹{cashbackRemaining} more to get 1% cashback
                </Text>
                <Text style={styles.cashbackSub}>No coupon needed</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.sectionDivider} />

        {/* Delivery Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery instructions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.instrScroll}>
            {DELIVERY_INSTRUCTIONS.map(instr => (
              <TouchableOpacity
                key={instr.key}
                style={[
                  styles.instrChip,
                  cart.deliveryInstruction === instr.key && styles.instrChipActive,
                ]}
                onPress={() => cart.setDeliveryInstruction(instr.key)}
                activeOpacity={0.7}>
                <Text style={styles.instrIcon}>{instr.icon}</Text>
                <Text
                  style={[
                    styles.instrLabel,
                    cart.deliveryInstruction === instr.key && styles.instrLabelActive,
                  ]}>
                  {instr.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput
            style={styles.instrInput}
            placeholder="Type in any instructions..."
            placeholderTextColor={COLORS.textMuted}
            value={customInstruction}
            onChangeText={setCustomInstruction}
          />
        </View>

        <View style={styles.sectionDivider} />

        {/* Price Breakdown */}
        <PriceBreakdownCard
          breakdown={cart.priceBreakdown}
          hasAddress={cart.hasAddress}
          savedAmount={cart.savingsAmount}
        />

        {/* Bottom Savings Banner */}
        {cart.savingsAmount > 0 && (
          <View style={styles.savingsBanner}>
            <Text style={styles.savingsBannerText}>
              You are saving{' '}
              <Text style={styles.savingsBold}>₹{cart.savingsAmount}</Text>{' '}
              with this order!
            </Text>
          </View>
        )}

        <View style={styles.sectionDivider} />

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation policy</Text>
          <Text style={styles.cancellationText}>
            You can cancel your order for free within the first 90 seconds.
            After that, a cancellation fee will apply.
          </Text>
        </View>

        <View style={{height: 120}} />
      </ScrollView>

      {renderBottomBar()}

      {/* OptionsBottomSheet for Did you forget / Similar items */}
      <OptionsBottomSheet
        visible={sideProduct !== null}
        product={sideProduct}
        selectedOptionId={sideProduct?.options[0]?.id ?? null}
        quantities={sideOptionQuantities}
        onSelectOption={() => {}}
        onIncrement={optionId =>
          setSideOptionQuantities(prev => ({
            ...prev,
            [optionId]: (prev[optionId] || 0) + 1,
          }))
        }
        onDecrement={optionId =>
          setSideOptionQuantities(prev => {
            const cur = prev[optionId] || 0;
            if (cur <= 1) {
              const next = {...prev};
              delete next[optionId];
              return next;
            }
            return {...prev, [optionId]: cur - 1};
          })
        }
        onConfirm={handleSideConfirm}
        onClose={() => {
          setSideOptionQuantities({});
          setSideProduct(null);
        }}
      />

      {/* Login Bottom Sheet */}
      <Modal
        visible={showLoginSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLoginSheet(false)}>
        <TouchableOpacity
          style={styles.loginOverlay}
          activeOpacity={1}
          onPress={() => setShowLoginSheet(false)}
        />
        <View style={styles.loginSheet}>
          <View style={styles.loginHandle} />
          <Text style={styles.loginTitle}>Login to proceed</Text>
          <Text style={styles.loginSubtitle}>
            Log in or sign up to proceed with your order
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => {
              cart.setLoggedIn(true);
              setShowLoginSheet(false);
            }}
            activeOpacity={0.9}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.background},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {padding: SPACING.xs, width: 40},
  backArrow: {fontSize: 28, color: COLORS.text, lineHeight: 32},
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },

  scroll: {flex: 1},

  // Savings Banner
  savingsBanner: {
    backgroundColor: COLORS.tealLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  savingsBannerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.teal,
    fontWeight: '500',
  },
  savingsBold: {fontWeight: '800'},

  // High Demand Banner
  highDemandBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.warning,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  highDemandIcon: {fontSize: FONT_SIZES.sm},
  highDemandText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: '#795548',
    lineHeight: 16,
    fontWeight: '500',
  },

  // Out of stock
  outOfStockSection: {
    backgroundColor: COLORS.white,
    marginBottom: 0,
  },
  outOfStockBanner: {
    backgroundColor: '#FFEBEE',
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  outOfStockBannerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '600',
  },
  similarSection: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  similarTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },

  // Cart Items
  cartItemsSection: {backgroundColor: COLORS.white},
  itemDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.lg,
  },

  // Sections
  sectionDivider: {height: 8, backgroundColor: COLORS.background},
  section: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  // Coupons
  couponSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  couponSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  couponSavingsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.offerPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  couponSavingsBold: {fontWeight: '800'},
  viewMoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  viewMoreText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  viewMoreArrow: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Cashback
  cashbackSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  cashbackIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cashbackBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashbackIconText: {fontSize: 22},
  cashbackInfo: {flex: 1},
  cashbackTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
  },
  cashbackSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Delivery Instructions
  instrScroll: {marginTop: SPACING.sm},
  instrChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    gap: 4,
    backgroundColor: COLORS.white,
  },
  instrChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  instrIcon: {fontSize: FONT_SIZES.sm},
  instrLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  instrLabelActive: {color: COLORS.primary, fontWeight: '600'},
  instrInput: {
    marginTop: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },

  // Cancellation
  cancellationText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: SPACING.xs,
  },

  // Bottom Bar - No Address
  bottomBarNoAddress: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  deliverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  deliverIcon: {fontSize: 16, color: COLORS.primary},
  deliverWhereText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  addAddressBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addAddressBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },

  // Bottom Bar - Has Address
  bottomBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: SPACING.xs,
    marginRight: SPACING.sm,
  },
  deliverTimeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.text,
  },
  notServiceableText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.error,
  },
  addressSnippet: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 1,
  },
  addressDetail: {
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  changeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  toPayLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  toPayAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  proceedBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  proceedBtnDisabled: {backgroundColor: COLORS.textMuted},
  proceedBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },

  // Login Sheet
  loginOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'},
  loginSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
    paddingTop: SPACING.sm,
  },
  loginHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  loginTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  loginSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },

  // Empty Cart
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyCartIcon: {fontSize: 60},
  emptyCartText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  shopBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  shopBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});

export default CartScreen;
