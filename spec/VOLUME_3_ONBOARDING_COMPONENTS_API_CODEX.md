# MealFit AI — Volume 3: Onboarding, Component Library, API Binding, Responsive Rules, Animations & Codex Implementation Rules

> **Product**: MealFit AI — AI-powered Food Decision Assistant
> **Author**: UI Specification Document
> **Version**: 1.0

---

## Table of Contents

1. [Onboarding Screens](#1-onboarding-screens)
2. [Authentication System](#2-authentication-system)
3. [Component Library — Complete Reference](#3-component-library--complete-reference)
4. [API Integration Rules](#4-api-integration-rules)
5. [Component-to-API Binding Matrix](#5-component-to-api-binding-matrix)
6. [Responsive & Platform Rules](#6-responsive--platform-rules)
7. [Animation & Interaction Specification](#7-animation--interaction-specification)
8. [Image & Video Rules](#8-image--video-rules)
9. [Codex Implementation Rules](#9-codex-implementation-rules)
10. [Validation Checklist](#10-validation-checklist)

---

## 1. Onboarding Screens

### 1.1 Screen Purpose
Guide the user from first launch to their first meal recommendation in under 30 seconds. The onboarding is minimal — 3 screens, no account creation, no unnecessary questions.

### 1.2 UX Goal
The user reaches the Home screen with a personalized recommendation within 3 taps.

### 1.3 Onboarding Flow

```
Splash Screen (1.5s, auto-advance)
  ↓
WelcomeScreen (hero + CTA)
  ↓
CountrySetupScreen (country picker)
  ↓
DietSetupScreen (diet preference + health goal)
  ↓
→ HomeScreen (first recommendation)
```

### 1.4 Splash Screen

| Property | Value |
|----------|-------|
| Duration | 1500ms (auto-advance to WelcomeScreen or HomeScreen) |
| Background | `COLORS.primary` (#1E7D50) |
| Content | Centered |

**Layout**:
```
Vertical center:
  🥑 (80px emoji)
  "MealFit AI" → FONT_SIZES.h1 (28px), Bold, #FFFFFF
  "Your food decision assistant" → FONT_SIZES.body (14px), Medium, rgba(255,255,255,0.8)

Bottom:
  White loading indicator (optional, if loading user data)
```

**Logic**:
```
On mount:
  → Check SecureStore for ONBOARDED flag
  → If onboarded: navigate to HomeScreen immediately (skip onboarding)
  → If not onboarded: show splash for 1.5s, navigate to WelcomeScreen
```

### 1.5 WelcomeScreen

| Property | Value |
|----------|-------|
| Background | `COLORS.background` (#FFFFFF) |
| Padding | `SPACING.xxxl` (32px) all |

**Layout** (top to bottom, vertically centered):
```
🥑 (80px emoji, centered)
SPACING.xxl gap

"MealFit AI" → FONT_SIZES.hero (36px), Bold, COLORS.text, centered
"Free. No login. No calorie counting." → FONT_SIZES.body, Regular, COLORS.textSecondary, centered

SPACING.huge gap

Feature list (3 items, left-aligned with icon):
  🍽️ "AI-powered meal recommendations"
  🌤️ "Weather & season aware"
  📝 "Smart food journal"

SPACING.huge gap

[Get Started →] 
  Primary button, full width, 48px height
  On press: navigate to CountrySetupScreen
```

**Image placement**: No images. Emoji-only for brand identity.

### 1.6 CountrySetupScreen

| Property | Value |
|----------|-------|
| Background | `COLORS.background` (#FFFFFF) |
| Padding | `SPACING.xxxl` (32px) all |

**Layout** (top to bottom):
```
Header: [Progress: ●●●○○○]
  "Where are you?" → FONT_SIZES.h2 (24px), Bold, COLORS.text
  "We'll recommend meals available in your country" → FONT_SIZES.body, COLORS.textSecondary

SPACING.xl gap

🔍 Search bar (filter countries)
  Height: 44px, borderRadius: RADIUS.md
  Background: COLORS.surface

SPACING.md gap

Country list (FlatList, full height):
  Each row:
    [🇧🇩 Flag emoji]  "Bangladesh"
    Height: 56px, borderBottom: COLORS.divider
    On press: Save country → navigate to DietSetupScreen({ country: 'BD' })

Bottom: Selected country pill (if any) above Continue button
  [Continue →] → Primary button, disabled until country selected
```

**Data source**: `COUNTRIES` constant from `src/constants/index.ts` (12 countries).

| Country | Code | Flag |
|---------|------|------|
| Bangladesh | BD | 🇧🇩 |
| India | IN | 🇮🇳 |
| Pakistan | PK | 🇵🇰 |
| Germany | DE | 🇩🇪 |
| United States | US | 🇺🇸 |
| United Kingdom | UK | 🇬🇧 |
| Mexico | MX | 🇲🇽 |
| Australia | AU | 🇦🇺 |
| Japan | JP | 🇯🇵 |
| Turkey | TR | 🇹🇷 |
| Egypt | EG | 🇪🇬 |
| South Africa | ZA | 🇿🇦 |

**Edge Cases**:
- No country selected: Continue button disabled (opacity 0.5)
- Search filters to 0 results: Show "No countries match your search"
- User presses back: Go to WelcomeScreen

### 1.7 DietSetupScreen

| Property | Value |
|----------|-------|
| Background | `COLORS.background` (#FFFFFF) |
| Padding | `SPACING.xxxl` (32px) all |

**Layout** (top to bottom):
```
Header: [Progress: ●●●●○○]
  "Your diet preference?" → FONT_SIZES.h2 (24px), Bold, COLORS.text
  "We'll filter meals based on your choice" → FONT_SIZES.body, COLORS.textSecondary

SPACING.xl gap

4 diet option cards (vertical stack):
  
  ┌─ Omnivore ───────────────────────┐
  │  🍗 "I eat everything"           │
  └──────────────────────────────────┘
  
  ┌─ Vegetarian ─────────────────────┐
  │  🥦 "No meat or fish"            │
  └──────────────────────────────────┘
  
  ┌─ Vegan ─────────────────────────┐
  │  🌱 "No animal products"         │
  └──────────────────────────────────┘
  
  ┌─ Pescatarian ───────────────────┐
  │  🐟 "Fish & seafood, no meat"    │
  └──────────────────────────────────┘
  
  Each card:
    Height: 72px
    Background: COLORS.surface (selected: COLORS.primaryLight)
    Border: 1px COLORS.border (selected: 1px COLORS.primary)
    Border radius: RADIUS.lg
    Padding: SPACING.lg
    Left: icon (24px) | Title (FONT_SIZES.body, SemiBold) | Subtitle (FONT_SIZES.caption, COLORS.textMuted)

Bottom spacer

[Start eating smart 🎯]
  Primary button, full width, 48px height
  Disabled until diet selected
  On press: 
    1. Call UserContext.setupUser({ country, diet_preference })
    2. Call UserContext.markOnboarded()
    3. Navigate to HomeScreen
```

**Edge Cases**:
- No selection: Button disabled
- User presses back: Go to CountrySetupScreen
- API call fails on setup: Show error toast but still proceed to HomeScreen
  (Profile will sync in background)

---

## 2. Authentication System

### 2.1 Authentication Philosophy
**There is no authentication.** MealFit AI is anonymous by design. The user is identified by a device-generated UUID stored in SecureStore.

### 2.2 User Identity Flow

```
App first launch:
  1. expo-crypto.randomUUID() → userId
  2. Store userId in SecureStore (STORAGE_KEYS.USER_ID)
  3. All API calls include userId as a query/body parameter

Subsequent launches:
  1. Load userId from SecureStore
  2. Load profile from SecureStore (cached)
  3. Optionally fetch profile from API for updates
```

### 2.3 Data Privacy
- No email, phone number, or name is required
- The name field in Profile is optional
- All data is associated with an anonymous UUID
- No third-party tracking or analytics

---

## 3. Component Library — Complete Reference

### 3.1 Component Inventory

| # | Component | File | Variants | Used In |
|---|-----------|------|----------|---------|
| 1 | `MealCard` | `src/components/MealCard.tsx` | `primary`, `alternative` | Home, Search, Alternatives |
| 2 | `WeatherStrip` | `src/components/WeatherStrip.tsx` | default | Home |
| 3 | `NutritionPills` | `src/components/NutritionPills.tsx` | `default`, `mini` | MealCard, MealDetail, ScanResult |
| 4 | `IngredientsList` | `src/components/IngredientsList.tsx` | default | MealDetail |
| 5 | `SubstituteCard` | `src/components/SubstituteCard.tsx` | default | MealDetail |
| 6 | `ImageWithFallback` | `src/components/ImageWithFallback.tsx` | `hero`, `card`, `thumb` | Every screen with images |
| 7 | `SkeletonLoader` | `src/components/SkeletonLoader.tsx` | `card`, `image`, `text` | Loading states |
| 8 | `CalorieBadge` | `src/components/CalorieBadge.tsx` | default | MealCard |
| 9 | `TimeBadge` | `src/components/TimeBadge.tsx` | default | MealCard |
| 10 | `NutritionBadge` | `src/components/NutritionBadge.tsx` | default | MealCard, alternative cards |
| 11 | `ProgressBar` | `src/components/ProgressBar.tsx` | default | Hydration card, goals |
| 12 | `SectionHeader` | `src/components/SectionHeader.tsx` | `withLink` | Home sections |
| 13 | `EmptyState` | `src/components/EmptyState.tsx` | default | All screens |
| 14 | `ErrorState` | `src/components/ErrorState.tsx` | default | All screens |
| 15 | `LoadingState` | `src/components/LoadingState.tsx` | default | All screens |

### 3.2 Component Specifications

#### 3.2.1 MealCard

```typescript
interface MealCardProps {
  meal: Meal;
  onPress: (meal: Meal) => void;
  variant?: 'primary' | 'alternative';
}
```

**Primary Variant** (full-width, featured):
```
┌─────────────────────────────────────┐  ← COLORS.background, SHADOWS.md, RADIUS.lg
│  [Image 4:3, 200px max]            │  ← ImageWithFallback(variant='card')
│  🔥 380 ⏱️ 25 min                  │  ← Badges overlaid on image bottom-left
│  Ilish Bhapa                        │  ← FONT_SIZES.heading, Bold, COLORS.text
│  🇧🇩 Bangladeshi · Fish            │  ← FONT_SIZES.bodyLg, COLORS.textSecondary
│  📝 Seasonal pick for monsoon       │  ← AI Reason banner (COLORS.primaryLight)
│  🥩 H  🌾 L  🥬 L                  │  ← NutritionPills(variant='mini')
└─────────────────────────────────────┘
```

**Alternative Variant** (horizontal scroll item):
```
┌──────────────────┐  ← 160px wide, RADIUS.md
│ [Image 1:1, 110px]│
│ 🔥 340           │  ← CalorieBadge overlaid on image
│ Chicken Tinga    │  ← FONT_SIZES.body, Bold, numberOfLines=1
│ 🇲🇽 Mexican      │  ← FONT_SIZES.caption, COLORS.textSecondary
└──────────────────┘
```

#### 3.2.2 ImageWithFallback

```typescript
interface ImageWithFallbackProps {
  uri: string;
  variant: 'hero' | 'card' | 'thumb';
  onPress?: () => void;
}
```

| Variant | Dimensions | Border Radius | Behavior |
|---------|-----------|---------------|----------|
| `hero` | width: 100%, height: 240px | 0 (edge-to-edge) | Full-width hero at top of MealDetail |
| `card` | width: 100%, height: 180-200px | RADIUS.lg top | Primary meal card image |
| `thumb` | width: 110px, height: 110px | RADIUS.md | Carousel thumbnail |

**State Machine**:
```
IDLE → LOADING (show skeleton) → LOADED (fade in image, 300ms)
                                  → ERROR (show fallback image)
                                     → RETRY (user taps)
```

#### 3.2.3 NutritionPills

```typescript
interface NutritionPillsProps {
  protein: NutritionLevel;
  carbs: NutritionLevel;
  fiber: NutritionLevel;
  variant?: 'default' | 'mini';
  fat?: NutritionLevel;
  calories?: number;
}
```

| Variant | Size | Layout |
|---------|------|--------|
| `default` | 72px circular indicators | Row, centered, with labels below |
| `mini` | 36px rounded pills | Row, inline text: "🥩 H" "🌾 L" "🥬 L" |

**Color mapping**:
| Level | High | Medium | Low |
|-------|------|--------|-----|
| Color | COLORS.proteinHigh (#1E7D50) | COLORS.proteinMed (#D97706) | COLORS.proteinLow (#6B7280) |

#### 3.2.4 SkeletonLoader

```typescript
interface SkeletonLoaderProps {
  variant: 'card' | 'image' | 'text';
  width?: number | string;
  height?: number;
  borderRadius?: number;
}
```

**Shimmer animation**: Linear gradient sweep left-to-right, 1200ms loop.
**Base color**: `COLORS.border` (#E5E7EB)
**Highlight color**: `COLORS.divider` (#F3F4F6)

#### 3.2.5 EmptyState

```typescript
interface EmptyStateProps {
  icon: string;          // emoji
  title: string;
  subtitle?: string;
  actionLabel?: string;  // CTA text
  onAction?: () => void;
}
```

**Layout**:
```
Centered vertically in container:
  {icon} (48px emoji)
  {title} → FONT_SIZES.title, Bold, COLORS.text, centered
  {subtitle} → FONT_SIZES.body, COLORS.textSecondary, centered (optional)
  [{actionLabel}] → Primary button (optional)
```

#### 3.2.6 ErrorState

```typescript
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}
```

**Layout**:
```
Centered vertically:
  ❌ (48px)
  {message} → FONT_SIZES.title, COLORS.text
  [Try Again] → Primary button
```

#### 3.2.7 LoadingState

```typescript
interface LoadingStateProps {
  variant: 'screen' | 'inline';
  count?: number;  // number of skeleton items to show
}
```

- `screen`: Full-page skeleton (3-4 skeleton cards)
- `inline`: Single skeleton card matching parent dimensions

---

## 4. API Integration Rules

### 4.1 API Architecture

```
Frontend (React Native)
  │
  ├── src/services/api.ts → HTTP client
  │     ├── setupUser()         POST /api/user/setup
  │     ├── getProfile()        GET  /api/user/profile?userId=
  │     ├── updateProfile()     PUT  /api/user/profile
  │     ├── recommend()         GET  /api/meals/recommend?userId=&lat=&lon=
  │     ├── search()            GET  /api/meals/search?q=&userId=
  │     ├── logMeal()           POST /api/history/log
  │     ├── getHistory()        GET  /api/history/recent?userId=&hours=
  │     ├── getWeather()        GET  /api/weather?userId=&lat=&lon=
  │     ├── identify()          POST /api/scanner/identify
  │     └── checkNotifications() POST /api/notifications/check
  │
  ├── src/services/storage.ts → SecureStore (offline cache)
  │
  └── src/data/mockMeals.ts → Mock data (development fallback)
        (REMOVE before production)
```

### 4.2 API Call Rules

1. **Every API call must have:**
   - Timeout (15s default, configurable)
   - Error handling (catch + fallback)
   - Loading state (skeleton or indicator)
   - Retry capability (user action or auto-retry once for GET)

2. **Offline Behavior:**
   - All critical data (profile, last recommendations) cached in SecureStore
   - On API failure: serve from cache, show "offline" banner
   - Meal logs: save to SecureStore, queue for background sync

3. **Caching Rules (Backend KV):**

| Data | Cache TTL | Cache Key Pattern |
|------|-----------|-------------------|
| Recommendations | 30 min | `rec:{userId}` |
| Weather | 30 min | `weather:{lat}:{lon}` |
| User Profile | 5 min | `profile:{userId}` |
| Notifications | 6 hours | `notif_dedup:{userId}:{type}` |

### 4.3 API Error Handling Matrix

| HTTP Status | Meaning | Frontend Behavior |
|-------------|---------|-------------------|
| 200 | Success | Parse response, update state |
| 400 | Bad request | Show validation error toast |
| 404 | Not found | Show empty state |
| 429 | Rate limited | Wait 5s, retry once |
| 500 | Server error | Show "Something went wrong" + retry |
| Network error | No connection | Serve from cache + "You're offline" banner |

### 4.4 Security Rules

- No API keys in frontend code
- CORS enabled on all endpoints (backend handles via middleware)
- All requests over HTTPS
- User ID is UUID, never email or phone
- No authentication tokens required

---

## 5. Component-to-API Binding Matrix

This is the authoritative reference for which component gets data from which API.

| Component / Screen | Data Source | API Endpoint | Cache Strategy | Fallback |
|--------------------|-------------|-------------|----------------|----------|
| **HomeScreen** | | | | |
| WeatherStrip | WeatherContext | `GET /api/weather` | KV (30 min) | Default: 22°C, Stable, 2000ml |
| AI Insight Card | RecommendationResponse | `GET /api/meals/recommend` | KV (30 min) + SecureStore | Hide section |
| Primary Meal Card | RecommendationResponse.primary | `GET /api/meals/recommend` | KV (30 min) + SecureStore | Mock data |
| Alternative Carousel | RecommendationResponse.alternatives | `GET /api/meals/recommend` | KV (30 min) + SecureStore | Mock data |
| Hydration Card | WeatherContext.hydration_target_ml | `GET /api/weather` | KV (30 min) | Default 2000ml |
| Health Tip | JournalContext.insights | Local (SecureStore) | — | Hide section |
| **MealDetailScreen** | | | | |
| Hero Image | meal.image_url | Direct URL | Image cache | Gradient fallback |
| Meal data | meal object | Navigation params | — | — |
| Nutrition | meal.protein/carbs/fiber | Navigation params | — | Hide section |
| Ingredients | meal.ingredients | Navigation params | — | Show empty list |
| Substitutes | meal.replacements | Navigation params | — | Hide section |
| Video | meal.video_id | YouTube URL | — | Hide Video tab |
| Similar meals | RecommendationResponse.alternatives | From context | — | Hide carousel |
| **JournalScreen** | | | | |
| Today's meals | JournalContext.todayEntries | Local (SecureStore) | SecureStore | Empty state |
| AI Insights | JournalContext.insights | Local calculation | SecureStore | Hide section |
| Weekly summary | JournalContext.weekEntries | Local (SecureStore) | SecureStore | Hide section |
| Previous days | JournalContext.daySummaries | Local (SecureStore) | SecureStore | Empty list |
| **SearchScreen** | | | | |
| Trending | `GET /api/meals/search?trending=true` | Backend API | None | Mock trending |
| Search results | `GET /api/meals/search?q=` | Backend API | None | "No results" state |
| Recent searches | SecureStore | Local | SecureStore | Hide section |
| **AddMealScreen** | | | | |
| AI suggestions | JournalContext (last 3 unique meals) | Local | SecureStore | Hide section |
| Recent meals | JournalContext (last 5 entries) | Local | SecureStore | Hide section |
| **ScannerScreen** | | | | |
| Camera feed | expo-camera | Device | — | Permission prompt |
| Scan result | `POST /api/scanner/identify` | Backend API | None | "Couldn't identify" state |
| **ProfileScreen** | | | | |
| Profile | UserContext.profile | `GET /api/user/profile` | SecureStore (5 min) | Default values |
| Save | UserContext.updateProfile | `PUT /api/user/profile` | SecureStore | Error toast |
| **NotificationsScreen** | | | | |
| Notifications | `POST /api/notifications/check` | Backend API | None | Empty state |

---

## 6. Responsive & Platform Rules

### 6.1 Safe Area Implementation

```typescript
// ALL screens MUST use SafeAreaView from react-native-safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context';

// NEVER use SafeAreaView from react-native (it doesn't handle notches correctly)
// CORRECT:
<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
  {/* screen content */}
</SafeAreaView>
```

### 6.2 Status Bar Configuration

```typescript
// App.tsx — set once, never per-screen
<StatusBar
  barStyle="dark-content"
  backgroundColor={COLORS.background}
  translucent={false}
/>
```

### 6.3 Device-Specific Rules

| Feature | iOS | Android |
|---------|-----|---------|
| Safe area | `useSafeAreaInsets()` handles notch + home indicator | `useSafeAreaInsets()` handles status bar + nav bar |
| Back navigation | Swipe gesture left-to-right | Hardware back button + gesture |
| Press feedback | Opacity 0.8 on press | `TouchableNativeFeedback` ripple effect |
| Shadows | `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` | `elevation` property |
| Font rendering | System font (San Francisco) | System font (Roboto) |
| Status bar style | dark-content (black text, white bg) | dark-content (black text, white bg) |

### 6.4 Tablet Adaptations

| Element | Phone (≤428px) | Tablet (>768px) |
|---------|---------------|-----------------|
| Card width | 100% - 32px | 50% - 24px (2-column grid) |
| Meal cards | Single column | 2-column grid with 12px gap |
| Font sizes | Standard | +2px for body text |
| Horizontal padding | 16px | 24px |
| Max content width | 100% | 600px (centered) |

### 6.5 Dynamic Island / Notch Support

Handled automatically by `SafeAreaProvider` from `react-native-safe-area-context`. No manual margin/padding adjustments needed for notches or the Dynamic Island.

---

## 7. Animation & Interaction Specification

### 7.1 Animation Token Reference

```typescript
// Defined in src/constants/index.ts
export const ANIMATION = {
  fast: 200,    // button press, toggle, icon rotation
  normal: 300,  // page transitions, card appear, image fade-in
  slow: 500,    // modal appear, skeleton shimmer cycle, onboarding slide
};
```

### 7.2 Card Animation (Appear on Screen)

```typescript
// Implementation pattern using Animated API
const fadeIn = (delay = 0) => {
  Animated.timing(opacity, {
    toValue: 1,
    duration: ANIMATION.normal,
    delay,
    useNativeDriver: true,
  }).start();
};

// Stagger: Index-based delay (80ms between each card)
{items.map((item, index) => (
  <Animated.View
    key={item.id}
    style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
  >
    <MealCard ... />
  </Animated.View>
))}
```

### 7.3 Image Loading Animation

```typescript
// When image loads:
Animated.timing(imageOpacity, {
  toValue: 1,
  duration: ANIMATION.normal,
  useNativeDriver: true,
}).start();

// Skeleton shimmer:
// Linear gradient background, Animated.View with translateX loop
```

### 7.4 Button Press Animation

```typescript
// Scale down on press in, scale up on press out
const handlePressIn = () => {
  Animated.spring(scale, {
    toValue: 0.97,
    useNativeDriver: true,
  }).start();
};

const handlePressOut = () => {
  Animated.spring(scale, {
    toValue: 1,
    friction: 3,
    useNativeDriver: true,
  }).start();
};
```

### 7.5 Page Transition Animation

| Navigation Type | Animation | Duration |
|----------------|-----------|----------|
| Stack push (iOS) | Slide from right | 300ms |
| Stack push (Android) | Fade + slide up | 300ms |
| Stack pop (iOS) | Slide to right | 300ms |
| Stack pop (Android) | Fade + slide down | 300ms |
| Tab switch | Immediate (no animation) | 0ms |
| Modal present | Slide up from bottom | 500ms |
| Modal dismiss | Slide down | 300ms |

### 7.6 Pull to Refresh

```typescript
// Use ScrollView's refreshControl
<ScrollView
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={COLORS.primary}
      colors={[COLORS.primary]}
    />
  }
>
```

### 7.7 Toast / Snackbar

| Property | Value |
|----------|-------|
| Animation | Slide up from bottom (200ms) |
| Display duration | 2000ms |
| Auto-dismiss | Yes |
| Background | COLORS.text (#111827) |
| Text color | #FFFFFF |

---

## 8. Image & Video Rules

### 8.1 Image Loading Pipeline

```
1. Start loading → Show SkeletonLoader (matching dimensions)
2. Image starts loading → Keep skeleton visible
3. Image loads → Fade in image (300ms) → Remove skeleton
4. Image fails → Show fallback image → Remove skeleton
5. User taps fallback → Retry loading from step 1
```

### 8.2 Image Fallback Chain

```
For meal.image_url:
  1. Try meal.image_url (Unsplash)
  2. On failure → Try IMAGE_FALLBACK from constants (placehold.co)
  3. On failure → Show gradient background with meal name text
```

### 8.3 Image Aspect Ratios

| Context | Aspect Ratio | Width | Height | Variant |
|---------|-------------|-------|--------|---------|
| Hero (MealDetail) | 16:9 | 100% | 240px | hero |
| Primary card (Home) | 4:3 | 100% | 200px | card |
| Alternative card | 1:1 | 110px | 110px | thumb |
| Search result row | 1:1 | 64px | 64px | small |
| Scan result thumbnail | 1:1 | 64px | 64px | small |

### 8.4 Video Playback

| Property | Value |
|----------|-------|
| Source | YouTube (via `video_id` from meal) |
| Thumbnail | `https://img.youtube.com/vi/{video_id}/maxresdefault.jpg` |
| Play action | `Linking.openURL('https://www.youtube.com/watch?v=' + video_id)` |
| In-app player | Not implemented (opens YouTube app/browser) |
| Fallback (no video_id) | Hide Video tab / button |
| Fallback (broken link) | User will see YouTube error page |

### 8.5 Video Fallback Rules

```
If meal.video_id exists:
  → Show Video Tab in MealDetail
  → Show YouTube thumbnail
  → On press: Open YouTube URL

If meal.video_id is null/undefined:
  → Hide Video Tab entirely
  → Show only Recipe Tab

If video_id exists but YouTube returns 404:
  → User sees "Video unavailable" on YouTube (acceptable for MVP)
  → Future: Validate video_id on seed
```

---

## 9. Codex Implementation Rules

### 9.1 File Organization

```
src/
  constants/      → Design tokens, API URL, configuration
  types/          → TypeScript interfaces and type aliases
  context/        → React Context providers (one per domain)
  navigation/     → Navigation configuration
  screens/        → Screen components (one per screen)
  components/     → Reusable UI components
  services/       → API client, storage, external service wrappers
  data/           → Mock data (REMOVE before production)
  utils/          → Pure utility functions
```

### 9.2 Import Order Rules

```
1. React / React Native
2. Third-party libraries (react-navigation, expo-*, date-fns)
3. Context providers
4. Types
5. Constants
6. Components
7. Services / Utils
8. Local files (./same-directory)
```

### 9.3 Code Style Rules

1. **No inline styles** — all styles via `StyleSheet.create()`
2. **No raw token values** — always reference `COLORS.*`, `SPACING.*` etc.
3. **No console.log** — use proper error handling
4. **Default exports** for screens, **named exports** for components
5. **Interface Props** defined at top of component file
6. **No comments in production code** — use self-documenting code
7. **Consistent naming**: PascalCase for components, camelCase for functions/variables

### 9.4 State Management Rules

| State Type | Where | Method |
|------------|-------|--------|
| User identity | UserContext | React Context + SecureStore |
| Profile | UserContext | React Context + SecureStore |
| Weather | WeatherContext | React Context |
| Recommendations | MealContext | React Context + SecureStore cache |
| Active meal | MealContext | React Context (no persistence) |
| Journal entries | JournalContext | React Context + SecureStore |
| UI state (loading, error) | Local useState | Component state |

### 9.5 Navigation Rules

1. **All navigation params are typed** via React Navigation types
2. **No navigation.reset()** — use conditional rendering for onboarding
3. **useSafeAreaInsets()** for all safe area adjustments
4. **headerShown: false** — all headers are custom

### 9.6 Data Flow Rules

```
User action → Component handler → Context action → API call → Context state update → Re-render

Network failure: → Catch error → Serve from SecureStore cache → Show offline banner
Log meal: → Save to SecureStore first (optimistic) → POST API → Confirm/Retry
```

### 9.7 Context Provider Hierarchy

```
App.tsx:
  SafeAreaProvider
    StatusBar
      UserProvider
        WeatherProvider
          MealProvider
            JournalProvider
              AppNavigator
```

Providers are ordered by dependency:
- `UserProvider` — foundational (userId, profile)
- `WeatherProvider` — independent (weather data)
- `MealProvider` — depends on UserProvider (needs userId)
- `JournalProvider` — depends on UserProvider (needs userId)

### 9.8 Screen Implementation Template

```typescript
// screens/ExampleScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, SHADOWS, RADIUS } from '../constants';
import { useSomeContext } from '../context/SomeContext';
import { LoadingState, ErrorState, EmptyState } from '../components';
import { SomeType } from '../types';

interface Props {
  navigation: any;
  route: any;
}

export default function ExampleScreen({ navigation, route }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SomeType | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // API call
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  if (loading) return <LoadingState variant="screen" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <EmptyState icon="📭" title="Nothing here" />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Screen content */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
});
```

### 9.9 API Service Implementation Template

```typescript
// Every API function follows this pattern:
export async function someApiCall(params: ParamsType): Promise<ResponseType> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${API_BASE}/api/endpoint`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new ApiError(response.status, await response.text());
    return await response.json();
  } catch (e: any) {
    if (e.name === 'AbortError') throw new Error('Request timed out');
    if (e instanceof ApiError) throw e;
    throw new Error('Network request failed');
  } finally {
    clearTimeout(timeout);
  }
}
```

### 9.10 Context Provider Template

```typescript
// Every context provider follows this pattern:
interface SomeContextType {
  data: DataType | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (params: UpdateParams) => Promise<void>;
}

const SomeContext = createContext<SomeContextType | undefined>(undefined);

export function SomeProvider({ children }: { children: React.ReactNode }) {
  // State + effects + API calls
  
  return (
    <SomeContext.Provider value={{ data, loading, error, refresh, update }}>
      {children}
    </SomeContext.Provider>
  );
}

export function useSomeContext(): SomeContextType {
  const context = useContext(SomeContext);
  if (!context) throw new Error('useSomeContext must be used within SomeProvider');
  return context;
}
```

---

## 10. Validation Checklist

Before considering any feature complete, verify every item:

### 10.1 Screen Checklist

| Check | Description |
|-------|-------------|
| □ | Screen renders without errors |
| □ | Loading state shows skeleton |
| □ | Error state shows with retry |
| □ | Empty state shows when no data |
| □ | All images load (or fallback shows) |
| □ | All CTA buttons navigate correctly |
| □ | Back navigation works |
| □ | Pull-to-refresh reloads data |
| □ | Works in light mode only (no dark mode for MVP) |
| □ | ScrollView scrolls through full content |

### 10.2 Data Flow Checklist

| Check | Description |
|-------|-------------|
| □ | API endpoint returns correct data |
| □ | Loading indicator shows during API call |
| □ | Error state shows on API failure |
| □ | Cache serves data when offline |
| □ | Logged meals persist in SecureStore |
| □ | Profile changes sync to backend |
| □ | Weather data refreshes periodically |

### 10.3 Navigation Checklist

| Check | Description |
|-------|-------------|
| □ | All screens accessible from tab bar |
| □ | Back button returns to previous screen |
| □ | Tab switches without data loss |
| □ | Deep press works on all pressable elements |
| □ | No duplicate navigation entries |

### 10.4 Design Consistency Checklist

| Check | Description |
|-------|-------------|
| □ | All spacing uses SPACING tokens |
| □ | All colors use COLORS tokens |
| □ | All fonts use FONT_SIZES tokens |
| □ | All shadows use SHADOWS tokens |
| □ | All borders use RADIUS tokens |
| □ | All images have loading + fallback |
| □ | No inline style values |

---

*End of Volume 3 — End of Complete UI Specification*
