import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {COLORS, FONT_SIZES, SPACING, BORDER_RADIUS} from '../../constants/theme';
import {MOCK_PRODUCTS, MOCK_ADDRESSES} from '../../constants/mockData';
import {formatPrice} from '../../utils';
import {useAppDispatch, useAppSelector} from '../../hooks/useRedux';
import {addItem, incrementQuantity, setAddress} from '../../store/slices/cartSlice';
import DiscountBadge from '../../components/common/DiscountBadge';
import ProductCard from '../../components/product/ProductCard';
import OptionsBottomSheet from '../../components/product/OptionsBottomSheet';
import {useCart} from '../../hooks/useCart';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC<Props> = ({route, navigation}) => {
  const dispatch = useAppDispatch();
  const cart = useCart();
  const {productId} = route.params;
  const product = MOCK_PRODUCTS.find(p => p.id === productId) || MOCK_PRODUCTS[1];
  const cartItems = useAppSelector(s => s.cart.items);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [optionQuantities, setOptionQuantities] = useState<Record<string, number>>({});
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    product.options[0]?.id || '',
  );
  const [sideProduct, setSideProduct] = useState<typeof product | null>(null);
  const [sideOptionQuantities, setSideOptionQuantities] = useState<Record<string, number>>({});
  const [deliveryType, setDeliveryType] = useState<'instant' | 'slot'>('instant');

  // Count ALL items in cart (not just current product)
  const totalCartItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  // Count for current product only (for the options button active state)
  const totalInCurrentProduct = cartItems
    .filter(i => i.productId === product.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  const handleOptionIncrement = (optionId: string) => {
    setOptionQuantities(prev => ({...prev, [optionId]: (prev[optionId] || 0) + 1}));
  };

  const handleOptionDecrement = (optionId: string) => {
    setOptionQuantities(prev => {
      const cur = prev[optionId] || 0;
      if (cur <= 1) {
        const next = {...prev};
        delete next[optionId];
        return next;
      }
      return {...prev, [optionId]: cur - 1};
    });
  };

  const handleConfirmOptions = () => {
    Object.entries(optionQuantities).forEach(([optionId, qty]) => {
      const option = product.options.find(o => o.id === optionId);
      if (!option || qty === 0) {return;}
      const cartItemId = `${product.id}_${optionId}`;
      const existingItem = cartItems.find(i => i.id === cartItemId);
      if (existingItem) {
        for (let i = 0; i < qty; i++) {dispatch(incrementQuantity(cartItemId));}
      } else {
        dispatch(addItem({
          id: cartItemId,
          productId: product.id,
          name: product.name,
          brand: product.brand,
          weight: product.weight,
          price: option.price,
          originalPrice: option.originalPrice,
          image: product.images[0],
          quantity: qty,
          optionId,
          optionLabel: option.label,
          isOutOfStock: false,
        }));
      }
    });
    setOptionQuantities({});
    setShowOptions(false);
  };

  const handleSideConfirm = () => {
    if (!sideProduct) {return;}
    Object.entries(sideOptionQuantities).forEach(([optionId, qty]) => {
      const option = sideProduct.options.find(o => o.id === optionId);
      if (!option || qty === 0) {return;}
      const cartItemId = `${sideProduct.id}_${optionId}`;
      const existingItem = cartItems.find(i => i.id === cartItemId);
      if (existingItem) {
        for (let i = 0; i < qty; i++) {dispatch(incrementQuantity(cartItemId));}
      } else {
        dispatch(addItem({
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
        }));
      }
    });
    setSideOptionQuantities({});
    setSideProduct(null);
  };

  const switchAddress = () => {
    const other = MOCK_ADDRESSES.find(a => a.id !== cart.selectedAddress?.id);
    if (other) {dispatch(setAddress(other));}
  };

  const similarProducts = MOCK_PRODUCTS.filter(p => p.id !== product.id);
  const customersAlsoBought = MOCK_PRODUCTS.slice(0, 3);

  // ── Bottom Bar ──────────────────────────────────────────────────────────────
  const renderBottomBar = () => {
    // State 1: No address set
    if (!cart.hasAddress) {
      return (
        <View style={styles.bottomBarNoAddr}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.whereText}>Where would you like to deliver?</Text>
          </View>
          <View style={styles.noAddrActions}>
            <TouchableOpacity
              style={styles.addAddressBtn}
              onPress={() => dispatch(setAddress(MOCK_ADDRESSES[0]))}
              activeOpacity={0.9}>
              <Text style={styles.addAddressBtnText}>Add address</Text>
            </TouchableOpacity>
          </View>
          {totalCartItems > 0 && (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.mainOptionsBtn, totalInCurrentProduct > 0 && styles.mainOptionsBtnActive]}
                onPress={() => setShowOptions(true)}
                activeOpacity={0.8}>
                <Text style={styles.mainOptionsBtnText}>
                  {product.options.length} options ▾
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewCartBtn, {flex: 1}]}
                onPress={() => navigation.navigate('Cart')}
                activeOpacity={0.9}>
                <Text style={styles.viewCartText}>
                  View Cart ({totalCartItems} items)
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {totalCartItems === 0 && (
            <TouchableOpacity
              style={[styles.mainOptionsBtn, totalInCurrentProduct > 0 && styles.mainOptionsBtnActive]}
              onPress={() => setShowOptions(true)}
              activeOpacity={0.8}>
              <Text style={styles.mainOptionsBtnText}>
                {product.options.length} options ▾
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    const addr = cart.selectedAddress!;

    // State 2: Address set but not serviceable
    if (!cart.isServiceable) {
      return (
        <View style={styles.bottomBarError}>
          <View style={styles.addrInfoRow}>
            <View style={styles.addrLeft}>
              <Ionicons name="location" size={16} color={COLORS.error} />
              <View style={styles.addrTexts}>
                <Text style={styles.notServiceableText}>Location not serviceable</Text>
                <Text style={styles.addrSnippet} numberOfLines={1}>
                  {addr.fullAddress}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={switchAddress}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.mainOptionsBtn}
              onPress={() => setShowOptions(true)}
              activeOpacity={0.8}>
              <Text style={styles.mainOptionsBtnText}>
                {product.options.length} options ▾
              </Text>
            </TouchableOpacity>
            {totalCartItems > 0 && (
              <TouchableOpacity
                style={[styles.viewCartBtn, {flex: 1}]}
                onPress={() => navigation.navigate('Cart')}
                activeOpacity={0.9}>
                <Text style={styles.viewCartText}>
                  View Cart ({totalCartItems} items)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    // State 3: Serviceable, not logged in
    if (!cart.isLoggedIn) {
      return (
        <View style={styles.bottomBar}>
          <View style={styles.addrInfoRow}>
            <View style={styles.addrLeft}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <View style={styles.addrTexts}>
                <Text style={styles.deliverInText}>
                  Deliver in {addr.deliveryTime} ⚡
                </Text>
                <Text style={styles.addrSnippet} numberOfLines={1}>
                  {addr.label} · {addr.fullAddress}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={switchAddress}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => cart.setLoggedIn(true)}
              activeOpacity={0.9}>
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
            {totalCartItems > 0 && (
              <TouchableOpacity
                style={styles.viewCartBtn}
                onPress={() => navigation.navigate('Cart')}
                activeOpacity={0.9}>
                <Text style={styles.viewCartText}>
                  View Cart ({totalCartItems})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    // State 4: Serviceable + logged in
    return (
      <View style={styles.bottomBar}>
        <View style={styles.addrInfoRow}>
          <View style={styles.addrLeft}>
            <Ionicons name="location" size={16} color={COLORS.primary} />
            <View style={styles.addrTexts}>
              <Text style={styles.deliverInText}>
                Deliver in {addr.deliveryTime} ⚡
              </Text>
              <Text style={styles.addrSnippet} numberOfLines={1}>
                {addr.label} · {addr.fullAddress}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={switchAddress}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.deliveryTypeRow}>
          <TouchableOpacity
            style={[
              styles.deliveryTypeBtn,
              deliveryType === 'instant' && styles.deliveryTypeBtnActive,
            ]}
            onPress={() => setDeliveryType('instant')}
            activeOpacity={0.8}>
            <Text style={[styles.deliveryTypeIcon, deliveryType === 'instant' && styles.deliveryTypeIconActive]}>⚡</Text>
            <Text style={[styles.deliveryTypeText, deliveryType === 'instant' && styles.deliveryTypeTextActive]}>
              Instant
            </Text>
            <Text style={[styles.deliveryTypeSubText, deliveryType === 'instant' && styles.deliveryTypeSubTextActive]}>
              {addr.deliveryTime}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.deliveryTypeBtn,
              deliveryType === 'slot' && styles.deliveryTypeBtnActive,
            ]}
            onPress={() => setDeliveryType('slot')}
            activeOpacity={0.8}>
            <Text style={[styles.deliveryTypeIcon, deliveryType === 'slot' && styles.deliveryTypeIconActive]}>📅</Text>
            <Text style={[styles.deliveryTypeText, deliveryType === 'slot' && styles.deliveryTypeTextActive]}>
              Schedule
            </Text>
            <Text style={[styles.deliveryTypeSubText, deliveryType === 'slot' && styles.deliveryTypeSubTextActive]}>
              Pick a slot
            </Text>
          </TouchableOpacity>
        </View>
        {totalCartItems > 0 && (
          <TouchableOpacity
            style={styles.viewCartBtn}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.9}>
            <Text style={styles.viewCartText}>
              View Cart ({totalCartItems} items)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-social-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          {product.discount && product.discount > 0 && (
            <View style={styles.discountBadgeWrapper}>
              <DiscountBadge percent={product.discount} />
            </View>
          )}
          <FlatList
            data={product.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={e => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setActiveImageIndex(idx);
            }}
            renderItem={({item}) => (
              <View style={{width: SCREEN_WIDTH}}>
                <Image
                  source={item}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
          <View style={styles.dots}>
            {product.images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeImageIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.weight}>{product.weight}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.optionsBtn,
              totalInCurrentProduct > 0 && styles.optionsBtnActive,
            ]}
            onPress={() => setShowOptions(true)}
            activeOpacity={0.8}>
            <Text style={styles.optionsBtnText}>
              {product.options.length} options ▾
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDivider} />

        {/* Similar Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar product</Text>
          <FlatList
            data={similarProducts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => p.id}
            contentContainerStyle={{paddingVertical: SPACING.sm}}
            renderItem={({item}) => (
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.replace('ProductDetail', {productId: item.id})
                }
                onOptionsPress={() => setSideProduct(item)}
                showOptions={item.options.length > 1}
              />
            )}
          />
        </View>

        <View style={styles.sectionDivider} />

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.sectionDivider} />

        {/* Customers Also Bought */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customers also bought</Text>
          <FlatList
            data={customersAlsoBought}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => `also_${p.id}`}
            contentContainerStyle={{paddingVertical: SPACING.sm}}
            renderItem={({item}) => (
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.replace('ProductDetail', {productId: item.id})
                }
                onOptionsPress={() => setSideProduct(item)}
                showOptions={item.options.length > 1}
              />
            )}
          />
        </View>

        <View style={{height: 220}} />
      </ScrollView>

      {/* Dynamic Bottom Bar */}
      {renderBottomBar()}

      {/* Main Product Options BottomSheet */}
      <OptionsBottomSheet
        visible={showOptions}
        product={product}
        selectedOptionId={selectedOptionId}
        quantities={optionQuantities}
        onSelectOption={setSelectedOptionId}
        onIncrement={handleOptionIncrement}
        onDecrement={handleOptionDecrement}
        onConfirm={handleConfirmOptions}
        onClose={() => {
          setOptionQuantities({});
          setShowOptions(false);
        }}
      />

      {/* Side Product Options BottomSheet */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: COLORS.white},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backBtn: {padding: SPACING.xs, width: 40, justifyContent: 'center'},
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: SPACING.sm,
  },
  shareBtn: {
    padding: SPACING.xs,
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scroll: {flex: 1},

  // Carousel
  carouselContainer: {backgroundColor: COLORS.background, position: 'relative'},
  discountBadgeWrapper: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    zIndex: 1,
  },
  productImage: {width: SCREEN_WIDTH, height: 260},
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  dot: {width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.textLight},
  dotActive: {backgroundColor: COLORS.primary, width: 16},

  // Product Info
  infoSection: {padding: SPACING.lg, backgroundColor: COLORS.white},
  brand: {fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginBottom: 2},
  productName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: 4,
  },
  weight: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  price: {fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text},
  originalPrice: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.strikethrough,
    textDecorationLine: 'line-through',
  },
  optionsBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    alignSelf: 'flex-start',
  },
  optionsBtnActive: {backgroundColor: COLORS.primaryBg},
  optionsBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },

  // Sections
  sectionDivider: {height: 8, backgroundColor: COLORS.background},
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // ── Bottom Bar: No Address ────────────────────────────────────────────────
  bottomBarNoAddr: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  whereText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  noAddrActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addAddressBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addAddressBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },

  // ── Bottom Bar: Error / Base ──────────────────────────────────────────────
  bottomBarError: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  bottomBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  addrInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  addrLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: SPACING.xs,
    marginRight: SPACING.sm,
  },
  addrTexts: {flex: 1},
  deliverInText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.text,
  },
  notServiceableText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.error,
  },
  addrSnippet: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  changeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // ── Delivery Type Selector ────────────────────────────────────────────────
  deliveryTypeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  deliveryTypeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    gap: 2,
  },
  deliveryTypeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  deliveryTypeIcon: {
    fontSize: 18,
  },
  deliveryTypeIconActive: {},
  deliveryTypeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  deliveryTypeTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  deliveryTypeSubText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  deliveryTypeSubTextActive: {
    color: COLORS.primary,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  btnRow: {flexDirection: 'row', gap: SPACING.sm},
  loginBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  mainOptionsBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  mainOptionsBtnActive: {backgroundColor: COLORS.primaryBg},
  mainOptionsBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  viewCartBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewCartText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});

export default ProductDetailScreen;
