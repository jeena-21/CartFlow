# CartFlow

A React Native e-commerce cart flow app demonstrating product detail, cart management, delivery address states, coupons, and order flow.

---

## Prerequisites

Complete the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) before proceeding.

- Node.js >= 18
- JDK 17 (Android)
- Android Studio + emulator **or** Xcode + iOS Simulator

---

## Installation

```sh
# Install JS dependencies
npm install

# iOS only — install native dependencies
bundle install
bundle exec pod install
```

---

## Running the App

### Step 1 — Start Metro

```sh
npm start
```

### Step 2 — Launch on device/emulator

```sh
# Android
npm run android

# iOS
npm run ios
```

---

## App Screens

### 1. Product Detail Screen
Entry point of the app. Launched with product ID `'2'` (Cadbury Dairy Milk) by default via `AppNavigator`.

**What to explore:**
- Image carousel with dot indicators
- Discount badge overlay
- "X options ▾" button opens the Options Bottom Sheet to select quantity per variant
- Similar Products and Customers Also Bought horizontal lists — tapping "options ▾" on these opens a bottom sheet for that product (does not navigate away)
- Bottom bar changes based on address/login state (see scenarios below)

---

### 2. Review Cart Screen
Navigate here via the **View Cart** button in the Product Detail bottom bar, or by pressing **View Cart** after adding items.

**What to explore:**
- Savings banner (teal) when item prices are discounted
- High demand delay banner
- Out-of-stock item (ci4 — Tata Tea 3×1kg) shown highlighted in pink with "Similar items" list
- Active cart items with quantity selectors
- "Did you forget?" horizontal product list
- Coupon section — apply/remove coupons
- Cashback section
- Delivery instructions chips + free-text input
- Price breakdown with saved badge and conditional delivery fee
- Cancellation policy
- Bottom bar changes based on address/login state (see scenarios below)

---

## Scenario Walkthrough

All state is held in Redux. No backend is needed — all data comes from `src/constants/mockData.ts`.

### Delivery / Address States

Both **Product Detail** and **Review Cart** screens share the same 4-state bottom bar driven by Redux.

| State | How to trigger | What you see |
|---|---|---|
| **No address** | Fresh app launch (default) | "Where would you like to deliver?" + Add address button |
| **Not serviceable** | Add address → tap **Change** to switch to the Office address (not serviceable) | Red location icon + "Location not serviceable" + disabled Proceed |
| **Serviceable, not logged in** | Home address selected (default after tapping Add address) | Delivery time + address + Login / Login to continue button |
| **Serviceable + logged in** | Tap **Login** / **Login to continue** | Delivery time + address + ⚡ Instant / 📅 Schedule selector + Proceed/View Cart |

> To reset back to no-address state, reload the app (Metro fast refresh resets Redux state to initial).

### Triggering address states step by step

```
1. Launch app  →  Product Detail loads  →  Bottom bar: "Where would you like to deliver?"
2. Tap "Add address"  →  Home address set  →  Bottom bar: serviceable, not logged in
3. Tap "Login"  →  Logged in  →  Bottom bar: Instant / Schedule selector + View Cart
4. Tap "View Cart"  →  Review Cart opens
5. In Review Cart, tap "Change"  →  Switches to Office (not serviceable)
   →  Bottom bar: "Location not serviceable" + Proceed disabled
6. Tap "Change" again  →  Back to Home (serviceable)
```

### Coupon Scenarios

| Scenario | How to trigger |
|---|---|
| Apply flat coupon (₹250 off) | Tap **APPLY** on the first coupon card (min order ₹500 required) |
| Apply percent coupon (6% off) | Tap **APPLY** on second or third coupon card |
| Savings text appears | After applying any coupon, "You are saving ₹X with this coupon" shows below cards |
| Remove coupon | Tap **✓ APPLIED** on the active coupon card |

> If item total is below the coupon's minimum order, the apply action is silently ignored.

### Out-of-Stock Scenario

One cart item (`ci4` — Tata Tea 3×1kg) is pre-set as out-of-stock in `src/constants/mockData.ts`:

```ts
// src/constants/mockData.ts  →  INITIAL_CART_ITEMS  →  ci4
isOutOfStock: true
```

This causes the Review Cart to show:
- Pink-highlighted "This item is out of stock" banner
- Faded product image with a **Delete** button
- "Similar items" horizontal list below the out-of-stock item

To restore it as in-stock, change `isOutOfStock: true` → `false` in `mockData.ts`.

### Delivery Type (Product Detail — logged in state only)

Once logged in on the Product Detail screen, two tabs appear in the bottom bar:

| Tab | Shows |
|---|---|
| ⚡ Instant | Delivery time from the selected address (e.g. "30-40 mins") |
| 📅 Schedule | "Pick a slot" label |

Tapping either tab highlights it with a green border and background.

### Cashback Banner (Review Cart)

| State | Banner text |
|---|---|
| Not logged in | "Add items worth ₹X more to get 1% cashback / No coupon needed" |
| Logged in | "Yay! You've received a cashback of ₹500 / The cashback will be added in your Aforro wallet" |

---

## Project Structure

```
src/
├── asset/              # Local images (tea, chocolate, apple, icons)
├── components/
│   ├── cart/           # CartItemRow, CouponCard, PriceBreakdown
│   ├── common/         # DiscountBadge, QuantitySelector
│   └── product/        # ProductCard, OptionsBottomSheet
├── constants/
│   ├── mockData.ts     # All mock products, cart items, coupons, addresses
│   └── theme.ts        # Colors, font sizes, spacing, border radius
├── hooks/
│   ├── useCart.ts      # Cart state + price calculation hook
│   └── useRedux.ts     # Typed useSelector / useDispatch
├── navigation/
│   └── AppNavigator.tsx
├── screens/
│   ├── Cart/           # CartScreen
│   └── ProductDetail/  # ProductDetailScreen
├── store/
│   ├── index.ts
│   └── slices/
│       ├── cartSlice.ts
│       └── productSlice.ts
├── types/index.ts
└── utils/index.ts
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Metro bundler error | Run `npm start -- --reset-cache` |
| Android build fails | Run `cd android && ./gradlew clean`, then `npm run android` |
| iOS pod issues | Run `bundle exec pod install --repo-update` in the root directory |
| State not resetting | Reload the app in the emulator (double-tap R on Android, R on iOS simulator) |
