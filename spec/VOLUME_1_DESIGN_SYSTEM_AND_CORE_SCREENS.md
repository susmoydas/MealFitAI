# MealFit AI — Volume 1: Design System, Global Rules, Navigation & Core Screens

> **Product**: MealFit AI — AI-powered Food Decision Assistant
> **Author**: UI Specification Document
> **Version**: 1.0

---

## Table of Contents

1. [Product Vision & Design Principles](#1-product-vision--design-principles)
2. [Global Design System](#2-global-design-system)
3. [Color Palette](#3-color-palette)
4. [Typography](#4-typography)
5. [Spacing System (8px Grid)](#5-spacing-system-8px-grid)
6. [Border Radius](#6-border-radius)
7. [Shadows & Elevation](#7-shadows--elevation)
8. [Icons](#8-icons)
9. [Illustrations & Food Images](#9-illustrations--food-images)
10. [Image Rules](#10-image-rules)
11. [Component Rules](#11-component-rules)
12. [Card System](#12-card-system)
13. [Buttons](#13-buttons)
14. [Bottom Navigation](#14-bottom-navigation)
15. [Animation Rules](#15-animation-rules)
16. [Navigation System](#16-navigation-system)
17. [Home Screen](#17-home-screen)
18. [Recipe Details Screen](#18-recipe-details-screen)
19. [Alternative Meals Screen](#19-alternative-meals-screen)
20. [Video Screen](#20-video-screen)
21. [Responsive Rules](#21-responsive-rules)

---

## 1. Product Vision & Design Principles

### Vision
MealFit AI is an AI-powered Food Decision Assistant — not a recipe app. It answers one question: *"What should I eat right now based on my lifestyle, weather, nutrition, meal history, and health goals?"*

### Core Design Principles

| Principle | Description |
|-----------|-------------|
| **Decision First** | Every UI element exists to help the user make a faster, better food decision. Remove anything that doesn't serve this goal. |
| **Zero Friction** | No login, no sign-up, no calorie counting. The app works instantly from install. |
| **Context-Aware** | Every recommendation considers weather, season, location, history, health goals, and dietary preferences. |
| **Honest & Transparent** | Every recommendation includes a clear reason. The user always knows *why* a meal was suggested. |
| **Visual First** | High-quality food images drive engagement. Every meal card MUST have a beautiful image, proper loading state, and graceful fallback. Never show broken images. |
| **Consistent Rhythm** | The 8px grid governs all spacing decisions. Every margin, padding, and gap is a multiple of 4 (8px base). |

### UX Goals

| Goal | Metric |
|------|--------|
| Time to first meal recommendation | < 10 seconds from app open |
| Time to log a meal | < 30 seconds |
| Time to find any recipe | < 3 taps |
| Daily active usage | User opens app at meal times |

---

## 2. Global Design System

### 2.1 Design Token Architecture

All visual properties are defined as design tokens. Components NEVER use raw values — they reference tokens exclusively.

```
Token Categories:
  COLORS.*         → Color values
  SPACING.*        → Spacing values (8px grid)
  FONT_SIZES.*     → Font size values
  FONT_WEIGHTS.*   → Font weight values
  RADIUS.*         → Border radius values
  SHADOWS.*        → Box shadow/elevation values
  ANIMATION.*      → Duration values
```

### 2.2 Token File Structure

Tokens live in `src/constants/index.ts`. A single source of truth.

```
src/constants/
  index.ts          → PRIMARY design tokens (used by all components)
  design.ts         → SECONDARY/alternative token set (for theme switching)
```

**IMPORTANT**: The primary token set in `index.ts` is the AUTHORITATIVE source. The `design.ts` file is a DEPRECATED secondary set that should be merged into `index.ts` or removed.

---

## 3. Color Palette

### 3.1 Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `COLORS.primary` | `#1E7D50` | Primary brand color. Used for CTAs, active tab icons, primary buttons, high-protein indicators. |
| `COLORS.primaryDark` | `#145C3A` | Darker variant for text-on-light badges, pressed button states. |
| `COLORS.primaryLight` | `#E8F5EE` | Light background for nutrition cards, section headers. |
| `COLORS.accent` | `#FEF9EE` | Warm accent for substitute cards, highlight banners, AI insight cards. |

### 3.2 Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| `COLORS.background` | `#FFFFFF` | Screen backgrounds. |
| `COLORS.surface` | `#F9FAFB` | Card backgrounds, elevated surfaces. |
| `COLORS.cardBg` | `#F8FAF9` | Slightly off-white for card grouping. |
| `COLORS.text` | `#111827` | Primary body text, headings. |
| `COLORS.textSecondary` | `#6B7280` | Secondary text, subtitles, metadata. |
| `COLORS.textMuted` | `#9CA3AF` | Tertiary text, placeholders, timestamps. |
| `COLORS.border` | `#E5E7EB` | Card borders, input borders, dividers. |
| `COLORS.divider` | `#F3F4F6` | Light separators between sections. |

### 3.3 Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `COLORS.error` | `#DC2626` | Error text, destructive actions. |
| `COLORS.errorLight` | `#FEE2E2` | Error background, warning banners. |
| `COLORS.success` | `#16A34A` | Success states, positive indicators. |
| `COLORS.successLight` | `#DCFCE7` | Success background. |
| `COLORS.warning` | `#D97706` | Warning text, medium-level indicators. |
| `COLORS.warningLight` | `#FEF3C7` | Warning background. |

### 3.4 Nutrition Indicator Colors

| Token | Hex | Maps To |
|-------|-----|---------|
| `COLORS.proteinHigh` | `#1E7D50` | High protein/carbs/fiber |
| `COLORS.proteinMed` | `#D97706` | Medium nutrition level |
| `COLORS.proteinLow` | `#6B7280` | Low nutrition level |

### 3.5 Tab Bar Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Tab bar background | `#FFFFFF` | White background with top border |
| Tab icon active | `#1E7D50` | Active tab icon tint |
| Tab icon inactive | `#9CA3AF` | Inactive tab icon tint |
| Tab label active | `#1E7D50` | Active tab label |
| Tab label inactive | `#9CA3AF` | Inactive tab label |

---

## 4. Typography

### 4.1 Font Family
- **System Default**: San Francisco (iOS), Roboto (Android)
- **Fallback**: `System` (cross-platform)

No custom fonts are loaded. The app uses platform-native system fonts for performance and consistency.

### 4.2 Font Size Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `FONT_SIZES.caption` | 11px | 14px | Badge text, timestamps, tiny labels |
| `FONT_SIZES.label` | 12px | 16px | Chip labels, tab labels, secondary metadata |
| `FONT_SIZES.body` | 14px | 20px | Primary body text, ingredient names |
| `FONT_SIZES.bodyLg` | 15px | 22px | Card subtitles, meal meta |
| `FONT_SIZES.subhead` | 16px | 22px | Section headers, card titles |
| `FONT_SIZES.title` | 18px | 24px | Screen titles, meal names |
| `FONT_SIZES.heading` | 20px | 28px | Major section headers |
| `FONT_SIZES.h2` | 24px | 32px | Screen-level headings |
| `FONT_SIZES.h1` | 28px | 36px | Hero headings |
| `FONT_SIZES.hero` | 36px | 44px | Splash/onboarding hero text |

### 4.3 Font Weight Scale

| Token | Weight | Usage |
|-------|--------|-------|
| `FONT_WEIGHTS.regular` | 400 | Body text, descriptions |
| `FONT_WEIGHTS.medium` | 500 | Labels, subtitles, button text |
| `FONT_WEIGHTS.semiBold` | 600 | Card titles, section headers |
| `FONT_WEIGHTS.bold` | 700 | Screen titles, hero text |
| `FONT_WEIGHTS.extraBold` | 800 | Numerical highlights, scores |

### 4.4 Text Color Mapping

| Context | Token | Weight |
|---------|-------|--------|
| Screen title | `COLORS.text` | Bold |
| Section header | `COLORS.text` | SemiBold |
| Card title | `COLORS.text` | SemiBold |
| Card subtitle | `COLORS.textSecondary` | Regular |
| Body text | `COLORS.textSecondary` | Regular |
| Caption/badge | `COLORS.textMuted` | Medium |
| CTA button | `#FFFFFF` | SemiBold |

---

## 5. Spacing System (8px Grid)

### 5.1 Base Unit
The base unit is **4px**. All spacing values are multiples of 4. The primary grid unit is **8px** (2 base units).

### 5.2 Spacing Scale

| Token | Value | Typical Usage |
|-------|-------|---------------|
| `SPACING.xs` | 4px | Icon-to-text gap, badge padding |
| `SPACING.sm` | 8px | Content gap within a row |
| `SPACING.md` | 12px | Vertical gap between related elements |
| `SPACING.lg` | 16px | Card internal padding, section gap |
| `SPACING.xl` | 20px | Between cards in a list |
| `SPACING.xxl` | 24px | Section spacing, screen padding |
| `SPACING.xxxl` | 32px | Major section separation |
| `SPACING.huge` | 40px | Content group separation |
| `SPACING.massive` | 48px | Top/bottom screen padding |

### 5.3 Layout Rules

```
Screen horizontal padding:   SPACING.lg (16px)
Card horizontal padding:     SPACING.lg (16px)
Card vertical padding:       SPACING.lg (16px)
Between cards in a list:     SPACING.xl (20px)
Between sections:            SPACING.xxxl (32px)
Image-to-text below image:   SPACING.md (12px)
Button height:               48px (internal padding: 14px top/bottom)
Tab bar height:              64px (with safe area bottom)
```

---

## 6. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `RADIUS.sm` | 6px | Badges, small chips, pills |
| `RADIUS.md` | 10px | Input fields, small cards |
| `RADIUS.lg` | 12px | Standard cards, modals |
| `RADIUS.xl` | 16px | Large cards, screen-level containers |
| `RADIUS.round` | 100px | Circular elements (avatars, circular indicators) |

### Image Border Radius Rules
- **Hero images** (full-width, top of screen): `borderRadius: 0` (edge-to-edge) or `RADIUS.lg` (if inset)
- **Card thumbnails**: `RADIUS.lg` (12px) top-left + top-right
- **Circular nutrition indicators**: `RADIUS.round`
- **Small thumbnails in carousels**: `RADIUS.md` (10px)

---

## 7. Shadows & Elevation

### 7.1 Shadow Tokens

| Token | iOS (shadow) | Android (elevation) | Usage |
|-------|-------------|---------------------|-------|
| `SHADOWS.sm` | 0px 1px 2px rgba(0,0,0,0.05) | 1dp | Subtle elevation — secondary cards, small elements |
| `SHADOWS.md` | 0px 2px 8px rgba(0,0,0,0.08) | 3dp | Standard card elevation — meal cards, recommendation cards |
| `SHADOWS.lg` | 0px 8px 24px rgba(0,0,0,0.12) | 6dp | Elevated elements — modals, FABs, bottom sheets |

### 7.2 Shadow Application Rules
- **Cards**: Always use `SHADOWS.md` at minimum
- **Interactive cards** (pressable): Animate from `SHADOWS.md` to `SHADOWS.lg` on press
- **Bottom sheet/modals**: `SHADOWS.lg`
- **Never** apply shadows to: icons, text, badges, pills

---

## 8. Icons

### 8.1 Icon System
Use **emoji icons** as the primary icon system. No custom icon font or SVG library is used.

### 8.2 Emoji Icon Mapping

| Context | Emoji | Usage |
|---------|-------|-------|
| Search | 🔍 | Search bar icon |
| Weather/Season | 🌤️ | Weather card |
| Hydration | 💧 | Water tracking card |
| Nutrition | 🥗 | Nutrition section |
| Protein | 🥩 | Protein indicator |
| Carbs | 🌾 | Carbs indicator |
| Fiber | 🥬 | Fiber indicator |
| Calories | 🔥 | Calorie badge |
| Time | ⏱️ | Prep time badge |
| Difficulty | 🎯 | Difficulty indicator |
| Heart/Health | ❤️ | Health benefits |
| Video | ▶️ | Video play button |
| Back | ← | Back navigation |
| Close | ✕ | Modal close |
| Camera | 📷 | Scanner screen |
| Checkmark | ✓ | Success indicator |
| Warning | ⚠️ | Warning indicator |
| Tip | 💡 | Tip indicator |
| Positive | 🎉 | Positive feedback |
| Favorite | ☆ / ★ | Save/favorite toggle |
| Share | ↗️ | Share action |
| More | ⋯ | More options |

### 8.3 Icon Size Rules
- Tab bar icons: 24px (emoji)
- Card icons (weather, nutrition): 20px
- Inline icons (with text): 16px
- Badge icons: 12px
- Hero icons (onboarding): 80px (large emoji)

---

## 9. Illustrations & Food Images

### 9.1 Illustration Policy
MealFit AI uses **no custom illustrations**. All visual content comes from:
1. **Real food photography** from Unsplash (via meal `image_url`)
2. **Emoji** for UI icons and status indicators
3. **Skeleton loaders** for image loading states

### 9.2 Food Image Sources
- **Primary meals**: Select from `image_url` field in meals database (Unsplash)
- **User-uploaded**: Not supported (no authentication)
- **Scanner preview**: Live camera feed (expo-camera)

---

## 10. Image Rules

### 10.1 Image Categories

| Category | Type | Aspect Ratio | Max Height | Usage |
|----------|------|-------------|------------|-------|
| **Hero Image** | Full-width | 16:9 (1.78:1) | 220px | Meal detail screen, top of page |
| **Card Thumbnail** | Primary card | 4:3 (1.33:1) | 180px | Home screen primary meal |
| **Carousel Thumbnail** | Alternative card | 1:1 (square) | 110px | Alternative meals carousel |
| **Small Thumbnail** | List item | 1:1 (square) | 64px | Search results, history list |

### 10.2 Image Loading States

Every image component MUST implement:

```
State Machine:
  [ImageLoad] → Show skeleton/blur placeholder
  [ImageLoaded] → Fade in image (300ms), remove skeleton
  [ImageError] → Show fallback image (never show broken icon)
  [Retry] → On press, reload image URL
```

### 10.3 Image Component Specification

```typescript
interface ImageProps {
  uri: string;
  aspectRatio: number;         // width/height ratio
  borderRadius?: number;       // from RADIUS tokens
  resizeMode?: 'cover' | 'contain';
  fallback?: string;           // fallback image URI
  onLoad?: () => void;
  onError?: () => void;
}
```

### 10.4 Fallback Image Rules

| Context | Fallback Behavior |
|---------|-------------------|
| **Hero image fails** | Show gradient background with meal name text overlay |
| **Card image fails** | Show `IMAGE_FALLBACK` placeholder (placehold.co) |
| **Scanner image fails** | Show camera icon with "Retake photo" prompt |

### 10.5 Skeleton Loader Specification

```
Height: Same as target image
Width: 100% of container
Color: backgroundColor = COLORS.border
Animation: Shimmer effect (left-to-right gradient sweep, 1200ms loop)
Border radius: Same as target image
```

---

## 11. Component Rules

### 11.1 Component File Structure

```
src/components/
  MealCard.tsx           → Meal card (primary + alternative variants)
  WeatherStrip.tsx       → Weather summary strip
  NutritionPills.tsx     → P/C/F nutrition level indicators
  IngredientsList.tsx    → Bulleted ingredient list
  SubstituteCard.tsx     → Ingredient replacement suggestions
  SkeletonLoader.tsx     → Reusable shimmer loading component
  ImageWithFallback.tsx  → Image component with skeleton + fallback
  CalorieBadge.tsx       → Calorie count pill
  TimeBadge.tsx          → Prep time pill
  NutritionBadge.tsx     → Single nutrition level badge
  ProgressBar.tsx        → Horizontal progress bar (hydration, nutrition)
  SectionHeader.tsx      → Section title with optional "See all" link
  EmptyState.tsx         → Empty state with emoji + message + action
  ErrorState.tsx         → Error state with retry button
  LoadingState.tsx       → Loading state with skeleton cards
```

### 11.2 Component Design Principles

1. **No raw tokens**: Every component uses the token system. Never write `padding: 16` — always `padding: SPACING.lg`.
2. **No inline styles**: All styles defined via `StyleSheet.create()`.
3. **Consistent export pattern**: Default export for screens, named exports for components.
4. **Props are typed**: Every component has an explicit `interface Props`.
5. **Error boundaries**: Components that fetch data have loading, error, and empty states.
6. **Accessibility**: All pressable elements have `accessibilityRole` and `accessibilityLabel`.

---

## 12. Card System

### 12.1 Card Layout Specification

Every card follows the same structural pattern:

```
┌─────────────────────────────────┐  ← border: COLORS.border, shadow: SHADOWS.md
│  [Image]                        │  ← aspect ratio varies by card type
│  [Title]                        │  ← FONT_SIZES.title, FONT_WEIGHTS.semiBold
│  [Subtitle / Meta Row]          │  ← badges, time, calories
│  [Content / Description]        │  ← optional, varies by card type
│  [Footer / Action]              │  ← optional CTA, tags
└─────────────────────────────────┘
```

### 12.2 Card Type Specifications

| Card Type | Width | Internal Padding | Image Height | Border Radius |
|-----------|-------|-----------------|--------------|---------------|
| **Primary Meal Card** | 100% (screen - 32px) | 16px all sides | 180px (4:3) | lg (12px) |
| **Alternative Meal Card** | 160px (fixed) | 12px all sides | 110px (square) | md (10px) |
| **Weather Card** | 100% | 16px all sides | 60px icon | lg (12px) |
| **AI Insight Card** | 100% | 16px all sides | none | lg (12px) |
| **Hydration Card** | 100% | 16px all sides | none | lg (12px) |
| **Nutrition Card** | 100% | 16px all sides | none | lg (12px) |
| **Health Tip Card** | 100% | 16px all sides | none | lg (12px) |
| **Substitute Card** | 100% | 14px all sides | none | md (10px) |
| **Scanner Result Card** | 100% | 16px all sides | 60px thumbnail | lg (12px) |

### 12.3 Card Background Colors

| Card Type | Background |
|-----------|------------|
| Standard card | `COLORS.background` (#FFFFFF) |
| Weather card | `COLORS.surface` (#F9FAFB) |
| AI Insight card | `COLORS.primaryLight` (#E8F5EE) |
| Substitute card | `COLORS.substituteCard` (#FEF9EE) |
| Health Tip card | `COLORS.surface` (#F9FAFB) |
| Nutrition card | `COLORS.primaryLight` (#E8F5EE) |

---

## 13. Buttons

### 13.1 Button Variants

| Variant | Background | Text Color | Border | Usage |
|---------|-----------|------------|--------|-------|
| **Primary** | `COLORS.primary` | `#FFFFFF` | None | Main CTA (log meal, save) |
| **Secondary** | `COLORS.primaryLight` | `COLORS.primaryDark` | None | Secondary actions (view recipe) |
| **Outline** | Transparent | `COLORS.primary` | `COLORS.primary`, 1px | Tertiary actions (scan again) |
| **Ghost** | Transparent | `COLORS.textSecondary` | None | Text-only actions (cancel) |
| **Icon** | Transparent | — | None | Icon-only buttons (search, back) |

### 13.2 Button Specifications

| Property | Value |
|----------|-------|
| Height | 48px |
| Horizontal padding | `SPACING.xl` (20px) |
| Border radius | `RADIUS.md` (10px) |
| Font | `FONT_SIZES.body` (14px), `FONT_WEIGHTS.semiBold` (600) |
| Icon gap | `SPACING.sm` (8px) between icon and text |
| Min width | 48px (for icon-only buttons) |
| Min height | 44px (touch target) |

### 13.3 Button States

| State | Visual |
|-------|--------|
| Default | As specified above |
| Pressed | Opacity 0.85 + scale 0.98 |
| Disabled | Opacity 0.5 |
| Loading | Show ActivityIndicator + hide text |

---

## 14. Bottom Navigation

### 14.1 Tab Bar Structure

```
┌──────────────────────────────────────────────┐
│                                              │
│  🏠         📷         📝         👤         │
│  Home       Scan       Journal    Profile     │
│                                              │
└──────────────────────────────────────────────┘
```

### 14.2 Tab Specifications

| Property | Value |
|----------|-------|
| Height | 64px (including safe area bottom) |
| Background | `#FFFFFF` |
| Top border | 0.5px, `COLORS.border` |
| Icon size | 24px (emoji) |
| Label font | `FONT_SIZES.caption` (11px), weight 500 |
| Active color | `COLORS.primary` (#1E7D50) |
| Inactive color | `COLORS.textMuted` (#9CA3AF) |

### 14.3 Tab Configuration

| Tab | Icon | Label | Screen | Stack |
|-----|------|-------|--------|-------|
| Home | 🏠 | Home | HomeScreen → MealDetailScreen → SearchScreen | HomeStack |
| Scan | 📷 | Scan | ScannerScreen | — |
| Journal | 📝 | Journal | JournalScreen | — |
| Profile | 👤 | Profile | ProfileScreen → SettingsScreen | — |

### 14.4 Tab Behavior Rules

1. **Home tab is always the initial tab.**
2. **Pressing an active tab pops to root** of that stack.
3. **Scanner tab** uses `expo-camera` — permission is requested on first scan.
4. **Journal tab** shows Food Journal (replaces old "History").
5. **Profile tab** is a simple form — no scrolling required.

---

## 15. Animation Rules

### 15.1 Animation Duration Tokens

| Token | Duration | Usage |
|-------|----------|-------|
| `ANIMATION.fast` | 200ms | Button press, toggle, icon rotation |
| `ANIMATION.normal` | 300ms | Page transitions, card appear, image fade-in |
| `ANIMATION.slow` | 500ms | Modal appear, skeleton shimmer cycle, onboarding slide |

### 15.2 Animation Specifications

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| **Card appear** | 300ms | ease-out | On screen mount (stagger: 80ms between cards) |
| **Image fade-in** | 300ms | ease-in-out | When image loads |
| **Button press** | 100ms | ease-in | On press in |
| **Button release** | 100ms | ease-out | On press out |
| **Page transition** | 300ms | platform default | Stack navigation push/pop |
| **Skeleton shimmer** | 1200ms (loop) | linear | While loading |
| **Pull to refresh** | 200ms | spring | Pull gesture |

### 15.3 Page Transition Rules

```
iOS: Slide from right (default stack animation)
Android: Fade + slide up (default stack animation)
Bottom tab switch: Immediate (no animation)
Modal: Slide up from bottom (500ms, ease-out)
```

---

## 16. Navigation System

### 16.1 Complete Screen Tree

```
NavigationContainer
  Stack.Navigator (root, screenOptions: { headerShown: false })
    │
    ├── [if !onboarded]
    │   ├── Welcome       → WelcomeScreen
    │   ├── CountrySetup  → CountrySetupScreen
    │   └── DietSetup     → DietSetupScreen
    │
    └── [if onboarded]
        └── Main → Tab.Navigator (HomeTabs)
              │
              ├── Home    → Stack.Navigator (HomeStack)
              │     ├── HomeMain    → HomeScreen
              │     ├── MealDetail  → MealDetailScreen
              │     └── Search      → SearchScreen
              │
              ├── Scanner → ScannerScreen
              │
              ├── Journal → JournalScreen
              │
              └── Profile → Stack.Navigator (ProfileStack)
                    ├── ProfileMain → ProfileScreen
                    └── Settings    → SettingsScreen
```

### 16.2 Navigation Rules

1. **Onboarding is shown once.** After `markOnboarded()`, the navigator switches to Main.
2. **No header is shown** — all navigation UI is custom.
3. **Back navigation** is implemented per-screen (not via React Navigation header).
4. **Deep linking** is not implemented (MVP).

### 16.3 Screen-to-Screen Flow

```
WelcomeScreen
  → tap "Get Started"
  → CountrySetupScreen
  → select country
  → DietSetupScreen
  → tap "Start eating smart"
  → [markOnboarded] → HomeScreen

HomeScreen
  → tap primary meal card → MealDetailScreen (meal data)
  → tap alternative meal card → MealDetailScreen (meal data)
  → tap search icon → SearchScreen

MealDetailScreen
  → tap "I ate this" → [log meal] → toast → navigate back
  → tap alternative in "You may also like" → MealDetailScreen (new meal)
  → tap play video → VideoScreen (YouTube link)
  → tap "View Full Recipe" → scroll to recipe section

SearchScreen
  → type query → results appear
  → tap result → MealDetailScreen (meal data)
  → tap back → HomeScreen

ScannerScreen
  → tap "Scan Food" → capture photo → scan result card
  → tap "Log this meal" → [log meal] → toast
  → tap "Scan again" → reset scanner

JournalScreen
  → tap "+" on a meal slot → SearchScreen (meal type pre-selected)
  → tap existing meal entry → MealDetailScreen (meal data)

ProfileScreen
  → edit fields → tap "Save changes" → [update profile] → toast
  → tap "Settings" → SettingsScreen

SettingsScreen
  → toggle preferences → [update] → toast
  → tap back → ProfileScreen
```

---

## 17. Home Screen

### 17.1 Screen Purpose
The Home screen is the **primary decision interface**. It answers "What should I eat right now?" in a single scroll view.

### 17.2 UX Goal
The user should see a clear, compelling meal recommendation within **3 seconds** of opening the app. Every element above the fold drives toward the primary recommendation.

### 17.3 Visual Hierarchy

```
1. Status Bar (system)
2. Header Bar
   [🏠 "MealFit AI"]                         [🔍]
3. Weather Card
   [🌤️ "Stable · 28°C · Summer"]            [💧 2000ml]
4. AI Food Insight Card
   [🤖 "Perfect weather for light meals..."]
5. Today's Best Match
   ┌─────────────────────────────────┐
   │  [Food Image - 16:9 cover]      │
   │  🔥 380 cal  ⏱️ 25 min         │
   │  Ilish Bhapa                     │
   │  🇧🇩 Bangladeshi · Fish         │
   │  📝 "Seasonal pick for monsoon"  │
   │  🥩 H  🌾 L  🥬 L              │
   └─────────────────────────────────┘
6. More Recommendations
   [←  [Card]  [Card]  [Card]  →]  (horizontal scroll)
7. Today's Goals
   ├─ 💧 Hydration  ████████░░ 1600/2500ml
   ├─ 🥗 Meals Logged  2/4
   └─ ❤️ Health Tip: "High protein today..."
8. Bottom Tab Bar
```

### 17.4 Layout Specification (Top → Bottom)

#### 17.4.1 Header Bar

| Property | Value |
|----------|-------|
| Height | 56px |
| Padding horizontal | `SPACING.lg` (16px) |
| Background | `COLORS.background` (#FFFFFF) |
| Bottom border | 0.5px, `COLORS.border` |

```
Left: "🏠 MealFit AI" → FONT_SIZES.title (18px), COLORS.text, Bold
Right: 🔍 search icon → onPress → navigate to SearchScreen
```

#### 17.4.2 Weather Card

| Property | Value |
|----------|-------|
| Margin top | `SPACING.lg` (16px) |
| Margin horizontal | `SPACING.lg` (16px) |
| Height | auto (min 64px) |
| Padding | `SPACING.lg` (16px) all |
| Background | `COLORS.surface` (#F9FAFB) |
| Border radius | `RADIUS.lg` (12px) |

**Components** (horizontal layout, flex-direction: row):
- Left: "🌤️" (20px emoji) + "Stable" (label) + "28°C" (body)
- Right: "💧 2000ml recommended"

**Data source**: `WeatherContext.weather`
**Loading state**: Skeleton card matching dimensions
**Empty/Error state**: Show default values (22°C, Stable, 2000ml)

#### 17.4.3 AI Food Insight Card

| Property | Value |
|----------|-------|
| Margin top | `SPACING.md` (12px) |
| Margin horizontal | `SPACING.lg` (16px) |
| Padding | `SPACING.lg` (16px) all |
| Background | `COLORS.primaryLight` (#E8F5EE) |
| Border radius | `RADIUS.lg` (12px) |

**Content**:
- Icon: "🤖" + Title: "AI Food Insight" (FONT_SIZES.subhead, Bold, COLORS.primaryDark)
- Body: Weather-based analysis text (FONT_SIZES.body, Regular, COLORS.textSecondary)
- Example: *"It's a warm monsoon day in Bangladesh. The humidity is high, making lighter, probiotic-rich meals ideal. Ilish Bhapa is a traditional choice."*

**Data source**: Generated by recommendation engine (AI or rule-based)
**Empty state**: Hide card if no insight available

#### 17.4.4 Today's Best Match (Primary Meal Card)

| Property | Value |
|----------|-------|
| Margin top | `SPACING.lg` (16px) |
| Margin horizontal | `SPACING.lg` (16px) |
| Background | `COLORS.background` (#FFFFFF) |
| Border radius | `RADIUS.lg` (12px) |
| Shadow | `SHADOWS.md` |

**Internal Layout** (column):

```
Top: Section Header
  "What should I eat today?" → FONT_SIZES.title (18px), COLORS.text, Bold, paddingBottom SPACING.sm

Image Container
  Height: 200px
  Width: 100%
  Border radius: RADIUS.lg top left + right
  Overflow: hidden
  Content: ImageWithFallback(uri=meal.image_url, aspectRatio=16/9)

Meta Row (horizontal, padding: SPACING.lg horizontal, SPACING.md top)
  Left badges: 🔥 380 cal (CalorieBadge)  |  ⏱️ 25 min (TimeBadge)  |  🎯 Medium (DifficultyBadge)
  Right: ❤️ Save icon

Title Row (padding: 0 SPACING.lg)
  Meal name → FONT_SIZES.heading (20px), COLORS.text, Bold, numberOfLines=2

Subtitle Row (padding: SPACING.xs SPACING.lg)
  🇧🇩 Cuisine · Protein tag  → FONT_SIZES.bodyLg (15px), COLORS.textSecondary, Regular

AI Reason Banner (margin: SPACING.sm SPACING.lg)
  "🤖 Seasonal pick for monsoon" → FONT_SIZES.body (14px), COLORS.primaryDark, Medium
  Background: COLORS.primaryLight, padding: SPACING.sm SPACING.md, borderRadius: RADIUS.sm

Nutrition Mini-Pills (padding: SPACING.sm SPACING.lg SPACING.lg)
  [🥩 H] [🌾 L] [🥬 L]  → NutritionPills component, size: small
```

**States**:
- **Loading**: Skeleton card (image skeleton + text line skeletons)
- **Empty**: Show "No recommendations available" with retry button
- **Error**: Show "Couldn't load recommendations" with retry button + cached fallback

#### 17.4.5 Recommended Meals Carousel

| Property | Value |
|----------|-------|
| Margin top | `SPACING.xxl` (24px) |
| Background | transparent |

**Section Header** (padding: 0 SPACING.lg):
  "More Recommendations" → FONT_SIZES.subhead, COLORS.text, SemiBold

**Carousel** (horizontal FlatList):
  - Item width: 160px
  - Item height: auto
  - Item spacing: `SPACING.md` (12px)
  - Padding left: `SPACING.lg` (16px)
  - Padding right: `SPACING.lg` (16px) (via ListFooterComponent)
  - Shows 2 full items + peek of third
  - Snap behavior: normal scroll (no snap)
  - `showsHorizontalScrollIndicator`: false

**Each Carousel Card**:
```
┌──────────────┐
│ [Image]      │ → 110px height, 1:1 crop, RADIUS.md
│ 🔥 340 cal  │ → CalorieBadge (overlaid bottom-left of image)
│ Chicken Tinga│ → FONT_SIZES.body (14px), Bold, numberOfLines=1
│ 🇲🇽 Mexican  │ → FONT_SIZES.label (12px), COLORS.textSecondary
│ 🥩 H 🌾 L   │ → Mini pills inline
└──────────────┘
```

#### 17.4.6 Today's Goals Section

| Property | Value |
|----------|-------|
| Margin top | `SPACING.xxxl` (32px) |
| Padding horizontal | `SPACING.lg` (16px) |
| Background | transparent |

**Section Header**:
  "Today's Goals" → FONT_SIZES.subhead, COLORS.text, SemiBold

**Cards** (vertical stack):

**Hydration Card**:
```
Background: COLORS.surface (#F9FAFB)
Border radius: RADIUS.lg, padding: SPACING.lg
Margin bottom: SPACING.sm

Row: 💧 "Hydration" (title) | "1600/2500ml" (value)
Progress bar: ████████░░ (80% width, COLORS.primary track, COLORS.border background)
```

**Health Tip Card**:
```
Background: COLORS.surface (#F9FAFB)
Border radius: RADIUS.lg, padding: SPACING.lg
Margin bottom: SPACING.sm

Row: 💡 "Today's Tip" (title)
Text: "High protein intake today — great for muscle recovery."
```

#### 17.4.7 Bottom Padding

```
ScrollView contentContainerStyle paddingBottom: 24px (for tab bar clearance)
```

### 17.5 API Binding

| Section | API Endpoint | Parameters | Frequency |
|---------|-------------|------------|-----------|
| Weather Card | `GET /api/weather` | userId, lat, lon | Every 30 min |
| AI Insight | Part of `GET /api/meals/recommend` | userId, lat, lon | Every 30 min (cached) |
| Primary Meal | `GET /api/meals/recommend` → `primary` | userId, lat, lon | Every 30 min (cached) |
| Alternatives | `GET /api/meals/recommend` → `alternatives` | userId, lat, lon | Every 30 min (cached) |
| Hydration | Derived from weather response | temp, humidity, activity | Real-time |

### 17.6 Edge Cases

| Scenario | Behavior |
|----------|----------|
| No network | Show cached recommendations from SecureStore, show "offline" banner |
| No GPS permission | Default to Bangladesh (lat=23.8, lon=90.4) |
| Empty recommendations | Show EmptyState with "Explore meals" button → SearchScreen |
| User has no history | Show generic recommendations based on country + weather |
| API timeout (>15s) | Fall back to cache, show error banner |

---

## 18. Recipe Details Screen

### 18.1 Screen Purpose
Display the full meal detail — why it was recommended, how to cook it, what nutrition it provides, and how to log it.

### 18.2 UX Goal
The user should understand why this meal was chosen, see a beautiful hero image, access the recipe and video in ≤2 taps, and log it with 1 tap.

### 18.3 Visual Hierarchy

```
1. Status Bar (transparent overlay on image)
2. Hero Image (full-width, 16:9)
3. Back Button (overlaid on image, top-left) + Save (top-right)
4. Title Section [below image]
   Meal Name | Cuisine | Protein Tag
5. Meta Row
   ⏱️ 25 min  |  🔥 380 cal  |  🎯 Medium  |  🇧🇩 Bangladeshi
6. AI Recommendation Banner
   "🤖 Recommended because it's monsoon season..."
7. Nutrition Section
   [Circular indicator P] [Circular indicator C] [Circular indicator F]
8. Best Time to Eat / Not Ideal Section
9. Ingredients List
   • Hilsa fish (4 pieces) ✓
   • Mustard seeds (3 tbsp) ✓
   • Coconut milk (2 tbsp) ✗ [Hard to find]
     → Substitute: Yogurt or Cashew paste
10. Health Benefits
    ✓ High in protein ✓ Rich in Omega-3
11. Who Should Eat This
    👥 "Ideal for: Active individuals, Fish lovers"
12. Recipe Tab [tab selector: Recipe | Video]
    [Recipe Tab Active]
    Step-by-step cooking instructions
13. Video Tab [tab selector: Recipe | Video]
    [Video Tab Active]
    Large video card with play button
14. Similar Meals (horizontal carousel)
15. Bottom CTA: "I Ate This" button
```

### 18.4 Layout Specification (Top → Bottom)

#### 18.4.1 Hero Image Section

| Property | Value |
|----------|-------|
| Width | 100% of screen |
| Height | 240px (fixed) |
| Position | Top of screen, behind status bar |

```
Image: ImageWithFallback(uri=meal.image_url, aspectRatio=16/9, height=240px)
Overlay: Linear gradient (transparent → black 20%) at bottom for text visibility
```

**Overlaid Controls** (absolute positioned):
- Top-left: ← Back button (white, opacity 0.9, padding 16px)
- Top-right: ☆ Save button (white, opacity 0.9, padding 16px)

#### 18.4.2 Title Section

| Property | Value |
|----------|-------|
| Padding | `SPACING.lg` (16px) horizontal, `SPACING.md` (12px) top |
| Background | `COLORS.background` |

```
Meal name: FONT_SIZES.h2 (24px), COLORS.text, Bold, numberOfLines=2
Subtitle: 🇧🇩 Cuisine · Protein tag → FONT_SIZES.bodyLg (15px), COLORS.textSecondary
```

#### 18.4.3 Meta Row

| Property | Value |
|----------|-------|
| Padding | `SPACING.lg` (16px) horizontal, `SPACING.sm` (8px) vertical |

```
Horizontal row of badges:
  ⏱️ "25 min"    → TimeBadge (COLORS.surface bg)
  🔥 "380 cal"   → CalorieBadge (primaryLight bg)
  🎯 "Medium"    → DifficultyBadge
  🇧🇩 "Bangladeshi" → CuisineBadge
```

#### 18.4.4 AI Recommendation Banner

| Property | Value |
|----------|-------|
| Padding horizontal | `SPACING.lg` (16px) |
| Margin vertical | `SPACING.sm` (8px) |

```
Background: COLORS.primaryLight, padding: SPACING.sm SPACING.md, borderRadius: RADIUS.sm
🤖 + reason text → FONT_SIZES.body (14px), COLORS.primaryDark, Medium
```

#### 18.4.5 Nutrition Section

| Property | Value |
|----------|-------|
| Padding | `SPACING.lg` (16px) all |
| Margin horizontal | `SPACING.lg` (16px) |
| Background | `COLORS.cardBg` (#F8FAF9) |
| Border radius | `RADIUS.lg` (12px) |

**Title**: "🥗 Nutrition Overview" → FONT_SIZES.subhead, SemiBold

**Circular Nutrition Indicators** (horizontal row, flex: 1, centered):

```
[P]    [C]    [F]
 H      L      L
```

Each circular indicator:
- Size: 72px diameter
- Stroke: 4px (COLORS.proteinHigh/Med/Low based on level)
- Center text: "H" or "M" or "L" (FONT_SIZES.h2, Bold)
- Label below: "Protein" / "Carbs" / "Fiber" (FONT_SIZES.label, COLORS.textSecondary)
- Sub-label below: "High" / "Medium" / "Low" (FONT_SIZES.caption)

#### 18.4.6 Best Time to Eat Section

| Property | Value |
|----------|-------|
| Padding horizontal | `SPACING.lg` (16px) |
| Margin vertical | `SPACING.sm` (8px) |

```
✅ Best time: Lunch (12pm-2pm) → FONT_SIZES.body, COLORS.success, Medium
  "Perfect for midday fuel, pairs with the monsoon weather."
⚠️ Not ideal: Dinner (after 8pm) → FONT_SIZES.body, COLORS.warning, Medium
  "Could be heavy close to bedtime."
```

#### 18.4.7 Ingredients List

| Property | Value |
|----------|-------|
| Padding horizontal | `SPACING.lg` (16px) |
| Margin vertical | `SPACING.sm` (8px) |

**Title**: "🛒 Ingredients" → FONT_SIZES.subhead, SemiBold

Each ingredient row:
```
• Hilsa fish (4 pieces)        ✓ Available
• Mustard seeds (3 tbsp)       ✓ Available
• Coconut milk (2 tbsp)        ⚠️ Hard to find
```

- Available items: COLORS.textSecondary
- Unavailable items: COLORS.warning, show SubstituteCard below

#### 18.4.8 Substitute Card (conditional)

| Property | Value |
|----------|-------|
| Margin horizontal | `SPACING.lg` (16px) |
| Background | `COLORS.substituteCard` (#FEF9EE) |
| Border radius | `RADIUS.md` (10px) |
| Padding | `SPACING.md` (12px) all |

```
⚠️ "Coconut milk is not commonly available in Bangladesh"
→ "Try: Yogurt (thinned with water) or Cashew paste"
→ "Why: Coconut milk is imported..." (FONT_SIZES.caption, COLORS.textMuted)
```

#### 18.4.9 Health Benefits Section

| Property | Value |
|----------|-------|
| Padding horizontal | `SPACING.lg` (16px) |
| Margin vertical | `SPACING.sm` (8px) |

**Title**: "❤️ Health Benefits" → FONT_SIZES.subhead, SemiBold

Benefits as vertical checklist:
```
✓ High in protein (25g per serving)
✓ Rich in Omega-3 fatty acids
✓ Supports muscle recovery
✓ Traditional fermented preparation aids digestion
```

#### 18.4.10 Recipe / Video Tabs

| Property | Value |
|----------|-------|
| Margin vertical | `SPACING.md` (12px) |
| Padding horizontal | `SPACING.lg` (16px) |

**Tab Selector**:
```
[Recipe]  [Video]
```

Both tabs: `height: 36px`, equal width, rounded toggle:
- Active tab: COLORS.primary bg, white text
- Inactive tab: COLORS.surface bg, COLORS.textSecondary text
- Border radius: RADIUS.round (pill style)

**Recipe Tab Content**:
```
Title: "How to cook" → FONT_SIZES.subhead
Recipe text: FONT_SIZES.body, lineHeight 24, COLORS.textSecondary
Step markings: Separated by periods, each step formatted as bullet
```

**Video Tab Content**:
```
Large video card:
  Background: COLORS.surface
  Border radius: RADIUS.lg
  Height: 200px
  Content:
    Image: YouTube thumbnail (https://img.youtube.com/vi/{video_id}/maxresdefault.jpg)
    Overlay: ▶️ Play button (white circle, 56px, centered)
    Bottom bar: Video title, cooking duration if available
  On press: Open YouTube URL in-app or via Linking.openURL
```

#### 18.4.11 Similar Meals Carousel

| Property | Value |
|----------|-------|
| Margin vertical | `SPACING.xxl` (24px) |

Same specification as Home screen alternative meals carousel.

**Title**: "You may also like" → FONT_SIZES.subhead, SemiBold, paddingLeft SPACING.lg

#### 18.4.12 Bottom CTA

| Property | Value |
|----------|-------|
| Height | 80px (48px button + 16px padding top + bottom) |
| Padding horizontal | `SPACING.lg` (16px) |
| Background | `COLORS.background` (#FFFFFF) |
| Top border | 0.5px, `COLORS.border` |

```
Button: "I Ate This 🍽️"
Type: Primary (COLORS.primary bg, white text)
Full width, height 48px, borderRadius RADIUS.md
On press: Log meal, show toast "✅ Logged!", navigate back
```

### 18.5 Data Flow

```
Screen receives: meal object (from navigation params)
Screen renders: All meal fields (name, image_url, recipe_text, etc.)
Screen actions:
  - Log meal: POST /api/history/log { meal_id, meal_name, meal_type, protein_tag, source }
  - Fetch video: video_id from meal object (not a separate API call)
  - Fetch alternatives: already included in meal data from recommendation
```

### 18.6 Edge Cases

| Scenario | Behavior |
|----------|----------|
| No video_id | Hide Video tab, show only Recipe tab |
| No recipe_text | Show "Recipe coming soon" placeholder |
| No nutrition data | Hide Nutrition section |
| No substitutes | Hide SubstituteCard |
| No health benefits | Hide Health Benefits section |
| Image fails to load | Show gradient overlay with meal name |

---

## 19. Alternative Meals Screen

### 19.1 Screen Purpose
Show all alternative meal recommendations in a scrollable vertical list for comparison browsing.

### 19.2 Layout

```
Header: "More Recommendations" + back button
Filter chips: [All] [Breakfast] [Lunch] [Dinner] [Snack] (horizontal scroll)

Vertical Meal Cards:
  ┌─────────────────────────────────────────────┐
  │  [Image - 4:3 thumb]                        │
  │  🔥 380 cal    ⏱️ 25 min                    │
  │  Ilish Bhapa                                 │
  │  🇧🇩 Bangladeshi · Fish                     │
  │  🥩 H  🌾 L  🥬 L                           │
  │  📝 "Seasonal pick for monsoon"              │
  └─────────────────────────────────────────────┘
```

### 19.3 Card Specifications

| Property | Value |
|----------|-------|
| Width | 100% (screen - 32px) |
| Height | auto |
| Image height | 140px (4:3 ratio) |
| Padding | SPACING.lg all |
| Margin bottom | SPACING.md |
| Border radius | RADIUS.lg |
| Shadow | SHADOWS.md |

### 19.4 Empty State
"No alternatives found" with "Try adjusting your diet preferences" link → ProfileScreen

---

## 20. Video Screen

### 20.1 Screen Purpose
Play the cooking video in a dedicated full-screen view.

### 20.2 Layout

```
Header: Video title (collapsed) | Close button
Video Player: Full-width, max 400px height
  - Loads YouTube video via video_id
  - Video thumbnail as placeholder
  - Play button overlay
  - On play: Open YouTube URL externally (Linking.openURL)

Below Player:
  Video title → FONT_SIZES.title, Bold
  Source: "YouTube" → label

Related Videos (if available):
  Horizontal carousel of similar cooking videos
```

### 20.3 Auto-Play Rules

| Scenario | Behavior |
|----------|----------|
| Screen opens | Show thumbnail, DO NOT auto-play |
| User taps play | Open YouTube app/browser (external) |
| User taps back | Close screen, no audio continues |

---

## 21. Responsive Rules

### 21.1 Device Breakpoints

| Category | Width Range | Notes |
|----------|-------------|-------|
| Phone (compact) | 320-428px | iPhone SE to Pro Max, small Android |
| Phone (regular) | 360-428px | Most Android devices |
| Large phone | 414-428px | iPhone Plus/Pro Max |
| Tablet | 768-1024px | iPad, Android tablets |

### 21.2 Adaptive Layout Rules

| Element | Phone | Tablet |
|---------|-------|--------|
| Card width | Full-width (screen - 32px) | Max 400px, centered in grid |
| Columns | 1 column | 2 columns (recommendations grid) |
| Image height | 200px (hero), 180px (card) | 280px (hero), 240px (card) |
| Font sizes | Standard scale | +2px on body sizes |
| Horizontal padding | 16px | 24px |

### 21.3 Safe Area Rules

- **Top safe area**: `paddingTop = useSafeAreaInsets().top` for the header bar
- **Bottom safe area**: `paddingBottom = useSafeAreaInsets().bottom` for the tab bar and bottom CTAs
- **Status bar**: `StatusBar` with `barStyle="dark-content"` and `backgroundColor="#FFFFFF"`
- **Dynamic Island**: Handled automatically by SafeAreaProvider

### 21.4 Android-Specific Rules

- **Status bar**: Transparent with dark icons, content should extend behind status bar
- **Elevation**: Use Android `elevation` property instead of iOS shadow
- **Back button**: Hardware back button should navigate back in stack
- **Ripple effect**: Use `TouchableNativeFeedback` for pressable elements on Android 5+

---

*End of Volume 1*
