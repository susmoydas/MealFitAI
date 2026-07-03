# MealFit AI — Volume 2: Scanner, Food Journal, Search, Notifications, Profile & Settings

> **Product**: MealFit AI — AI-powered Food Decision Assistant
> **Author**: UI Specification Document
> **Version**: 1.0

---

## Table of Contents

1. [Scanner Screen](#1-scanner-screen)
2. [Food Journal (History) Screen](#2-food-journal-history-screen)
3. [Add Meal Screen](#3-add-meal-screen)
4. [Search Screen](#4-search-screen)
5. [Notifications Screen](#5-notifications-screen)
6. [Profile Screen](#6-profile-screen)
7. [Settings Screen](#7-settings-screen)

---

## 1. Scanner Screen

### 1.1 Screen Purpose
Identify food from a live camera capture and instantly log it to the Food Journal. The scanner is the fastest way to log a meal — point, shoot, confirm, done.

### 1.2 UX Goal
Complete a food scan and log in under 20 seconds. The scanner should feel like a camera app, not a nutrition tool.

### 1.3 Visual Hierarchy

```
1. Status Bar (transparent, light content)
2. Header Bar
   [← Back]  "Food Scanner"  [💡 Tip]
3. Camera Preview (full screen area)
   ┌──────────────────────────────┐
   │                              │
   │       📷 Camera Feed         │  → expo-camera, full preview
   │                              │
   │     ┌──────────────────┐     │
   │     │   Scanning Frame │     │  → Corner brackets, centered
   │     │     ┌──┐  ┌──┐   │     │
   │     │     │  │  │  │   │     │
   │     │     └──┘  └──┘   │     │
   │     │     ┌──┐  ┌──┐   │     │
   │     │     │  │  │  │   │     │
   │     │     └──┘  └──┘   │     │
   │     └──────────────────┘     │
   │                              │
   │     [📸 Scan Food]           │  → Capture button (bottom center)
   │                              │
   └──────────────────────────────┘
4. Scan Result Card (slides up from bottom after capture)
   ┌──────────────────────────────┐
   │  📸 Photo Preview (small)    │
   │  Identified: Chicken Biryani │
   │  🥩 H  🌾 H  🥬 L          │
   │  "A hearty rice dish..."     │
   │                              │
   │  [Log this meal] [Scan again]│
   └──────────────────────────────┘
```

### 1.4 Layout Specification (Top → Bottom)

#### 1.4.1 Header

| Property | Value |
|----------|-------|
| Height | 56px (absolute, overlaid on camera) |
| Text color | `#FFFFFF` |
| Background | transparent |

```
Left: ← Back (white, 24px)
Center: "Food Scanner" → FONT_SIZES.title, Bold, white
Right: 💡 Tip icon → shows camera tips in an alert
```

#### 1.4.2 Camera Preview

| Property | Value |
|----------|-------|
| Width | 100% |
| Height | Fill remaining screen (flex: 1) |
| Type | `expo-camera` with `ratio: "4:3"` |
| Flash | Off by default, toggle button in corner |

**Permission Handling**:
- If permission not granted: Show permission prompt with "Allow Camera Access" button
- If permission denied: Show "Camera access is required" with "Open Settings" button
- Never show a black/empty camera view

#### 1.4.3 Scanning Frame

| Property | Value |
|----------|-------|
| Width | 250px |
| Height | 250px |
| Position | Centered in camera area |
| Border | 2px white corner brackets (4 corners, each 40px long) |

```
Corners:
┌──┐                    ┌──┐
│                        │
│                        │
└──┘                    └──┘

Frame is centered: position: absolute, top: 50%, left: 50%, transform: translate(-125, -125)
4 corner brackets: absolute positioned at each corner, 2px stroke, white, borderRadius 4
Background outside frame: semi-transparent black overlay (for focus effect)
```

#### 1.4.4 Capture Button

| Property | Value |
|----------|-------|
| Position | Bottom center, 80px from bottom of camera area |
| Size | 72px × 72px |
| Outer circle | 72px, white border (4px), transparent center |
| Inner circle | 64px, white fill |
| On press | Animate: scale(0.9) → take photo → animate: scale(1.0) |

```
┌───────────┐
│  ╭─────╮  │
│  │ ●   │  │  → White circle, pressed state scales down
│  ╰─────╯  │
└───────────┘
```

#### 1.4.5 Scan Result Card (Post-Capture)

| Property | Value |
|----------|-------|
| Animation | Slide up from bottom (300ms, ease-out) |
| Background | `COLORS.background` (#FFFFFF) |
| Border radius top | `RADIUS.xl` (16px) |
| Shadow | `SHADOWS.lg` |

**Card Layout** (padding: SPACING.lg all):

```
Row 1: [Photo Thumbnail 64x64, RADIUS.md] + [Meal Name (FONT_SIZES.title, Bold)]
Row 2: NutritionPills (H/M/L for P/C/F)
Row 3: Guidance text → FONT_SIZES.body, COLORS.textSecondary (1-2 lines)
Row 4: Meal type selector → [Breakfast] [Lunch] [Dinner] [Snack] (pill selector)
Row 5: 
  [📝 Log this meal] → Primary button, full width
  [🔄 Scan again]    → Outline button, full width (marginTop: SPACING.sm)
```

**Empty/Error State** (scan failed):
```
Icon: ❌ (48px)
Text: "Couldn't identify that food"
Subtext: "Try taking the photo from a different angle"
Button: "Try Again"
```

### 1.5 Data Flow

```
User taps "Scan Food"
  → Camera takes photo
  → POST /api/scanner/identify { userId, imageBase64 }
  → Response: ScanResult { name, protein_level, carbs_level, fiber_level, guidance }
  → Show Scan Result Card

User taps "Log this meal"
  → POST /api/history/log { meal_id?, meal_name, meal_type, protein_tag, source: "scanner" }
  → Show toast "✅ Logged!"
  → Reset scanner for next scan
```

**Note**: The scanner API is a placeholder. Until a vision API is integrated:
- Store the photo base64
- Generate a response based on mock/rule-based identification
- Store the raw image for future processing

### 1.6 Edge Cases

| Scenario | Behavior |
|----------|----------|
| Camera permission denied | Show "Camera access required" with "Open Settings" CTA |
| Low light | Auto-enable flash, show "🌙 Low light" indicator |
| Scan API fails | Show "Couldn't identify" error state with retry |
| User scans same food twice | Allow it — log as separate entry with dedup note |
| No network (post-scan) | Cache scan result locally, log when online |

---

## 2. Food Journal (History) Screen

### 2.1 Screen Purpose
Track what the user has eaten, organized by day and meal type. The Journal automatically builds a complete 7-day eating history. The user never has to recall past meals — they log as they eat.

### 2.2 UX Goal
Log a meal in under 30 seconds. See today's progress at a glance. The AI automatically analyzes the journal to generate insights and improve recommendations.

### 2.3 Visual Hierarchy

```
1. Status Bar (dark content, white background)
2. Header
   [📝 Food Journal]
3. Date Navigation
   [← Jun 28] [Jun 29] [Jun 30] [Today →]   (horizontal scroll, snap to selected)
4. AI Insights Section
   ┌─────────────────────────────────────┐
   │ ⚠️ "You've had chicken 3 days in    │  → warning card (COLORS.warningLight)
   │    a row. Try a fish or lentil meal  │
   │    tomorrow."                        │
   └─────────────────────────────────────┘
   ┌─────────────────────────────────────┐
   │ 💡 "Your fiber intake is low this   │  → tip card (COLORS.primaryLight)
   │    week. Try adding chickpeas or     │
   │    lentils to your meals."           │
   └─────────────────────────────────────┘
   ┌─────────────────────────────────────┐
   │ 🎉 "Great variety in your meals     │  → positive card (COLORS.successLight)
   │    today! 3 different protein types" │
   └─────────────────────────────────────┘
5. Today's Meals Section
   ┌─ Breakfast ─────────────────────────┐
   │  🥣 [+] Add Breakfast              │  → Mealslot (empty state)
   └─────────────────────────────────────┘
   ┌─ Lunch ─────────────────────────────┐
   │  🍽️ Ilish Bhapa 🔥380 🥩H 🌾L 🥬L │  → Mealslot (filled state)
   │     12:30 PM · Primary suggestion   │
   └─────────────────────────────────────┘
   ┌─ Dinner ────────────────────────────┐
   │  🥗 [+] Add Dinner                 │  → Mealslot (empty state)
   └─────────────────────────────────────┘
   ┌─ Snack ─────────────────────────────┐
   │  🥨 [+] Add Snack                  │  → Mealslot (empty state)
   └─────────────────────────────────────┘
6. Weekly Summary Card
   ┌─────────────────────────────────────┐
   │ "This Week"                         │
   │ ┌──────┬──────┬──────┬──────┬──────┐│
   │ │ Meals│ Avg  │ High │  Var  │Streak││
   │ │  12  │ 340  │Prot  │  7    │  3d  ││
   │ └──────┴──────┴──────┴──────┴──────┘│
   └─────────────────────────────────────┘
7. Previous Days
   ┌─ Yesterday (Jun 29) ────────────────┐
   │  🍽️ Breakfast: Oatmeal 🔥310      │
   │  🍽️ Lunch: Dal 🔥280              │
   │  🍽️ Dinner: Biryani 🔥550         │
   └─────────────────────────────────────┘
   ┌─ Jun 28 ────────────────────────────┐
   │  🍽️ Lunch: Salmon 🔥420            │
   │  🍽️ Dinner: Miso Soup 🔥160        │
   └─────────────────────────────────────┘
8. Bottom Tab Bar
```

### 2.4 Layout Specification (Top → Bottom)

#### 2.4.1 Header

| Property | Value |
|----------|-------|
| Height | 56px |
| Padding horizontal | `SPACING.lg` (16px) |
| Background | `COLORS.background` (#FFFFFF) |

```
Left: 📝 emoji + "Food Journal" → FONT_SIZES.title, Bold, COLORS.text
Right: No actions (empty space for balance)
```

#### 2.4.2 Date Navigation

| Property | Value |
|----------|-------|
| Height | 44px |
| Padding horizontal | `SPACING.lg` (16px) |
| Background | `COLORS.background` (#FFFFFF) |
| Bottom border | 0.5px, `COLORS.border` |

```
Horizontal FlatList:
  Items: Last 7 days (6 past + today)
  Item width: auto (based on text)
  Item padding: SPACING.sm SPACING.md
  Selected day: COLORS.primary bg, white text, borderRadius: RADIUS.round
  Unselected: COLORS.surface bg, COLORS.textSecondary text
  Snap: to center of selected day
  Default: Today selected
```

#### 2.4.3 AI Insights Section (Conditional)

| Property | Value |
|----------|-------|
| Padding horizontal | `SPACING.lg` (16px) |
| Margin top | `SPACING.md` (12px) |

Up to 3 insight cards, one per insight type:

**Warning Card** (type: 'warning'):
```
Background: COLORS.warningLight, borderRadius: RADIUS.lg, padding: SPACING.lg
Icon: ⚠️ (20px)
Text: Dynamic insight → FONT_SIZES.body, COLORS.warning (darkened)
```

**Tip Card** (type: 'tip'):
```
Background: COLORS.primaryLight, borderRadius: RADIUS.lg, padding: SPACING.lg
Icon: 💡 (20px)
Text: Dynamic tip → FONT_SIZES.body, COLORS.primaryDark
```

**Positive Card** (type: 'positive'):
```
Background: COLORS.successLight, borderRadius: RADIUS.lg, padding: SPACING.lg
Icon: 🎉 (20px)
Text: Dynamic positive → FONT_SIZES.body, COLORS.success
```

**Empty state**: If no insights, hide the entire section.

#### 2.4.4 Today's Meals Section

| Property | Value |
|----------|-------|
| Padding horizontal | `SPACING.lg` (16px) |
| Margin top | `SPACING.xl` (20px) |

**Title**: "Today's Meals" → FONT_SIZES.subhead, SemiBold, COLORS.text

**Meal Slot** (4 slots: Breakfast, Lunch, Dinner, Snack):

Each slot:
```
Margin bottom: SPACING.sm
Background: COLORS.surface (#F9FAFB)
Border radius: RADIUS.lg (12px)
Border: 1px, COLORS.border (dashed for empty, solid for filled)
Padding: SPACING.lg all
```

**Empty Slot**:
```
Row: 🥣 "Add Breakfast" → FONT_SIZES.body, COLORS.textMuted
Right: "+" icon → 24px, COLORS.primary
On press: Navigate to AddMealScreen with { mealType: "breakfast" }
```

**Filled Slot**:
```
Row 1: 🍽️ Ilish Bhapa | 🔥 380 cal | 12:30 PM
  - Meal name: FONT_SIZES.body, SemiBold, COLORS.text
  - Calorie badge: FONT_SIZES.caption, COLORS.textSecondary
  - Time: FONT_SIZES.caption, COLORS.textMuted
Row 2: NutritionPills (H/M/L) | Source: "Primary suggestion"
  - FONT_SIZES.caption, COLORS.textMuted
On press: Navigate to MealDetailScreen with meal data
```

#### 2.4.5 Weekly Summary Card

| Property | Value |
|----------|-------|
| Margin horizontal | `SPACING.lg` (16px) |
| Margin top | `SPACING.xl` (20px) |
| Background | `COLORS.cardBg` (#F8FAF9) |
| Border radius | `RADIUS.lg` (12px) |
| Padding | `SPACING.lg` all |

**Title**: "📊 This Week" → FONT_SIZES.subhead, SemiBold

**Stats Grid** (5 columns, equal width):
```
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│  Meals  │ Avg Cal │  High   │ Variety │ Streak  │
│   12    │   340   │ Protein │   7     │   3d    │
└─────────┴─────────┴─────────┴─────────┴─────────┘
```

Each stat box:
- Label: FONT_SIZES.caption, COLORS.textMuted, centered
- Value: FONT_SIZES.title, Bold, COLORS.text, centered

**Empty State** (no entries this week):
```
Hide stats grid, show: "📝 Start logging meals to see your weekly summary!"
```

#### 2.4.6 Previous Days Section

| Property | Value |
|----------|-------|
| Margin top | `SPACING.xxl` (24px) |
| Padding horizontal | `SPACING.lg` (16px) |

Each previous day:
```
Title: "Yesterday (Jun 29)" → FONT_SIZES.subhead, SemiBold, COLORS.text
Meals: Listed vertically with bullet-style entries
  🍽️ Breakfast: Oatmeal 🔥310
  🍽️ Lunch: Dal 🔥280
  
No bottom border between days, separated by SPACING.lg vertical gap
```

**Empty day**: Skip rendering (don't show empty days)

#### 2.4.7 Bottom Padding

```
contentContainerStyle: paddingBottom: 24px
```

### 2.5 Data Flow

```
Screen loads:
  → Load entries from JournalContext (which syncs from SecureStore + API)
  → Calculate daySummaries for selected day
  → Generate insights from accumulated entry data
  
User taps "Add Breakfast/Lunch/Dinner/Snack":
  → Navigate to AddMealScreen with { mealType }

User taps existing meal entry:
  → Navigate to MealDetailScreen with meal data

User swipes date or taps a date:
  → Update selectedDate state
  → Filter entries by selected date
  → Update UI
```

### 2.6 Insights Generation Logic

| Insight Type | Condition | Example |
|-------------|-----------|---------|
| warning | Same protein_tag in 3+ consecutive meals | "You've had chicken 3 days in a row..." |
| warning | Low fiber (<2 High-fiber meals in 3 days) | "Your fiber intake is low this week..." |
| tip | High protein + Low fiber pattern | "Balance your high-protein meals with fiber-rich sides..." |
| tip | Skipping breakfast 3+ days | "Try adding breakfast to your routine..." |
| positive | 3+ different protein tags today | "Great variety in your meals today!" |
| positive | Logged all 4 meal types today | "Complete day! You logged all 4 meals!" |
| positive | High fiber in 2+ consecutive days | "Excellent fiber intake this week!" |

Maximum 4 insights shown at once. Prioritize: warning > tip > positive.
Cap at 2 warnings, 1 tip, 1 positive.

### 2.7 Edge Cases

| Scenario | Behavior |
|----------|----------|
| No entries today | Show "No meals logged today" prompt with "Add a meal" CTA |
| No entries this week | Show empty state with encouragement |
| API unavailable | Load from SecureStore cache, show offline indicator |
| Concurrent log attempts | Debounce (300ms) to prevent duplicate entries |
| Meal type already filled | Tapping a filled slot opens MealDetailScreen |
| User logs same meal twice | Allow it — show "(2x)" badge on repeated entries |

---

## 3. Add Meal Screen

### 3.1 Screen Purpose
Quickly log a meal that the user just ate. This is a lightweight screen — the fastest path from "I just ate" to "logged."

### 3.2 UX Goal
Complete meal logging in under 5 taps and 20 seconds.

### 3.3 Visual Hierarchy

```
1. Header
   [← Back]  "Add Meal"  [Save ✓]
2. Meal Type Selector (pre-selected from JournalScreen)
   [Breakfast] [Lunch] [Dinner] [Snack]  → pill selector, already filled
3. Search Section
   ┌──────────────────────────────────┐
   │ 🔍 Search meals...              │  → auto-focused TextInput
   └──────────────────────────────────┘
4. AI Suggestions (if no search query)
   ┌──────────────────────────────────┐
   │ "🤖 Based on your history..."   │
   │ [Oatmeal] [Dal] [Salmon]        │  → quick-add chips
   └──────────────────────────────────┘
5. Recent Meals (if no search query)
   "Recent"
   ┌──────────────────────────────────┐
   │ 🍽️ Ilish Bhapa    [Lunch]  [+] │
   │ 🍽️ Oatmeal        [Bkfst]  [+] │
   └──────────────────────────────────┘
6. Search Results (if search query)
   ┌──────────────────────────────────┐
   │ [Result Card 1]                 │
   │ [Result Card 2]                 │
   └──────────────────────────────────┘
7. Save Animation (on successful log)
   ✓ "Logged!" → toast + navigate back
```

### 3.4 Layout Specification

#### 3.4.1 Header

| Property | Value |
|----------|-------|
| Height | 56px |
| Padding horizontal | SPACING.lg |

```
Left: ← Back (COLORS.text, onPress: goBack)
Center: "Add Meal" → FONT_SIZES.title, Bold
Right: "Save" → COLORS.primary (disabled if no meal selected)
```

#### 3.4.2 Meal Type Selector

| Property | Value |
|----------|-------|
| Padding | SPACING.lg horizontal, SPACING.md bottom |

```
Horizontal row, 4 pill buttons:
  [🥣 Breakfast] [🍽️ Lunch] [🍽️ Dinner] [🥨 Snack]

Active pill: COLORS.primary bg, white text, RADIUS.round
Inactive pill: transparent bg, COLORS.border 1px, COLORS.textSecondary text
Height: 36px, paddingHorizontal: SPACING.lg
```

#### 3.4.3 Search Input

| Property | Value |
|----------|-------|
| Margin horizontal | SPACING.lg |
| Height | 44px |
| Background | COLORS.surface |
| Border radius | RADIUS.md |
| Padding | SPACING.md left |

```
Icon: 🔍 (16px) left of text
Placeholder: "Search meals..."
Font: FONT_SIZES.body
Auto-focus: true
Return key: "search"
Clear button: ✕ appears when text is entered
```

#### 3.4.4 AI Suggestions (Conditional)

| Property | Value |
|----------|-------|
| Margin | SPACING.lg horizontal, SPACING.md top |

Shown only when: search query is empty AND user has meal history.

```
Header: "🤖 AI Suggestions" → FONT_SIZES.subhead, SemiBold
Subtitle: "Based on your eating patterns" → FONT_SIZES.caption, COLORS.textMuted

Chips: Horizontal scroll (no wrap)
  Each chip: Background COLORS.primaryLight, text COLORS.primaryDark
  Border radius: RADIUS.round, padding: SPACING.sm SPACING.lg
  44px height, marginRight: SPACING.sm
  On press: Select meal, enable Save
```

#### 3.4.5 Recent Meals (Conditional)

| Property | Value |
|----------|-------|
| Margin | SPACING.xxl horizontal, SPACING.md top |

Shown only when: search query is empty.

```
Header: "Recent" → FONT_SIZES.subhead, SemiBold

List: Max 5 most recent entries from JournalContext
Each row:
  ┌────────────────────────────────────────────┐
  │ 🍽️ Ilish Bhapa       Lunch          [+]  │
  │    Yesterday · 12:30 PM                    │
  └────────────────────────────────────────────┘

Row layout:
  Left: 🍽️ icon
  Center: Meal name (SemiBold) + meta (COLORS.textSecondary, caption)
  Right: [+] button (COLORS.primary, 32px)
  
  Background: COLORS.background
  Border bottom: 0.5px, COLORS.divider
  Height: 56px
```

#### 3.4.6 Search Results (Conditional)

Shown when: search query is non-empty.

Results use the same MealCard component (alternative variant), listed vertically with SPACING.sm gap.

**Empty results**:
```
Icon: 🔍 (48px)
Text: "No meals found for '{query}'"
Subtext: "Try a different search term"
```

### 3.5 Save Animation

```
User taps "Save":
  1. Animate checkmark over the meal type pill (scale 0→1, 200ms)
  2. Toast at bottom: "✅ Breakfast logged!" (2000ms)
  3. Navigate back to JournalScreen
```

### 3.6 Data Flow

```
Screen receives: { mealType } from navigation params (pre-selected)
User selects a meal: Enable Save button
User taps Save:
  → JournalContext.addEntry(meal, mealType, 'manual', userId)
  → Entry persisted to SecureStore
  → POST /api/history/log called silently (background)
  → Navigate back to JournalScreen
```

### 3.7 Edge Cases

| Scenario | Behavior |
|----------|----------|
| User taps Save without selecting meal | Button disabled, nothing happens |
| Search returns no results | Show empty state with "Add custom meal" (future) |
| Network offline | Save locally, sync when online |
| User presses back without saving | Entry discarded (no confirmation dialog for MVP) |
| Rapid double-tap on Save | Debounce — only process first tap |

---

## 4. Search Screen

### 4.1 Screen Purpose
Find any meal in the database by name, cuisine, or ingredient. The search is the entry point to explore the full meal library.

### 4.2 UX Goal
Find a meal in under 3 seconds and navigate to its detail screen in 1 tap.

### 4.3 Visual Hierarchy

```
1. Header
   🔍 [Search meals...              ] [✕]
2. Trending Foods (initial state, no query)
   [🌍 Trending]
   [Meal Card] [Meal Card] [Meal Card]
3. Recent Searches (initial state, no query)
   [🕐 Recent]
   • Chicken
   • Rice
   • Bangladeshi
4. AI Search Suggestions (initial state, no query)
   [🤖 Try searching for:]
   [Light meals] [High protein] [Breakfast ideas]
5. Search Results (query state)
   [Meal Card 1]
   [Meal Card 2]
   [Meal Card 3]
   ...
```

### 4.4 Layout Specification

#### 4.4.1 Search Bar

| Property | Value |
|----------|-------|
| Margin | SPACING.lg all sides |
| Height | 48px |
| Background | COLORS.surface |
| Border radius | RADIUS.md |
| Border | 1px, COLORS.border (focused: COLORS.primary) |

```
Left icon: 🔍 (16px, COLORS.textMuted)
Input: FONT_SIZES.body, COLORS.text
Placeholder: "Search meals, cuisines, ingredients..."
Right icon: ✕ (visible when text > 0, clears input)
Auto-focus: false (user taps to focus)
```

#### 4.4.2 Trending Foods (Initial State)

| Property | Value |
|----------|-------|
| Padding horizontal | SPACING.lg |

```
Header: "🌍 Trending" → FONT_SIZES.subhead, SemiBold

Horizontal carousel of 4-6 meal cards (alternative variant)
Same as Home screen alternative carousel
Items from: GET /api/meals/search?trending=true (or top 6 shuffled from DB)
```

#### 4.4.3 Recent Searches (Initial State)

| Property | Value |
|----------|-------|
| Padding horizontal | SPACING.lg |
| Margin top | SPACING.xxl |

```
Header: "🕐 Recent" → FONT_SIZES.subhead, SemiBold

Chips: Horizontal scroll
  Each chip: Background COLORS.surface, text COLORS.textSecondary
  Border radius: RADIUS.round
  Height: 36px, padding: SPACING.sm SPACING.lg
  Right: ✕ small icon to remove from recent
  On press: Execute that search query
  
Stored in: SecureStore (MAX_RECENT_SEARCHES = 10)
```

#### 4.4.4 AI Search Suggestions (Initial State)

| Property | Value |
|----------|-------|
| Padding horizontal | SPACING.lg |
| Margin top | SPACING.xxl |

```
Header: "🤖 Try searching for:" → FONT_SIZES.subhead, SemiBold

Horizontal scrollable chips:
  "Light meals" | "High protein" | "Breakfast" | "Comfort food" | "Quick meals"
  
Same chip style as Recent Searches
On press: Execute that search query
```

#### 4.4.5 Search Results (Query State)

When user types ≥ 2 characters:
```
Call: GET /api/meals/search?q={query}&userId={id}
Response: Meal[] from backend

Results: Vertical FlatList of meal cards
  Each card: Alternative variant (160px wide won't work here)
  Use compact vertical list format:
    Height: 88px
    Padding: SPACING.md
    Layout:
      [Image 64x64, RADIUS.md] | [Name + Cuisine + Nutrition pills]
    Separator: 0.5px COLORS.divider
```

**Loading State**: Show skeleton cards (3-4 shimmer lines)
**Empty State**: "No meals found for '{query}'" with retry
**Error State**: "Couldn't search. Check your connection." with retry button

### 4.5 Data Flow

```
User types in search bar:
  → Debounce 300ms
  → GET /api/meals/search?q={query}&userId={userId}
  → Display results
  → On result tap: Navigate to MealDetailScreen(meal)

User searches "Chicken":
  → Save "Chicken" to recent searches
  → Show results
```

### 4.6 Edge Cases

| Scenario | Behavior |
|----------|----------|
| Query < 2 characters | Don't trigger search, show initial state |
| No results | Show "No meals found" with suggestion chips |
| API error | Show error state with retry |
| Empty query (user cleared input) | Return to initial state |
| Very long query (>50 chars) | Truncate display, search with full string |
| User taps recent search chip | Execute search immediately |

---

## 5. Notifications Screen

### 5.1 Screen Purpose
Display all intelligent notifications generated by the AI system. Notifications are not just alerts — they're personalized guidance based on the user's eating patterns, weather, and health goals.

### 5.2 UX Goal
The user understands why each notification was sent and can take action directly from the notification.

### 5.3 Visual Hierarchy

```
1. Header
   [🔔 Notifications]
2. Today Section
   ┌─────────────────────────────────────┐
   │ ⏰ Time for lunch!                  │
   │   12:00 PM · Based on your history  │
   └─────────────────────────────────────┘
   ┌─────────────────────────────────────┐
   │ 💧 Drink more water                │
   │   It's 32°C today. Stay hydrated!  │
   └─────────────────────────────────────┘
3. Earlier This Week
   ┌─────────────────────────────────────┐
   │ 🥗 Try something light today       │
   │   Hot weather alert               │
   └─────────────────────────────────────┘
   ┌─────────────────────────────────────┐
   │ 🌾 Increase fiber intake           │
   │   Low fiber detected this week     │
   └─────────────────────────────────────┘
   ┌─────────────────────────────────────┐
   │ 🚫 Avoid repeating chicken         │
   │   3 days in a row                  │
   └─────────────────────────────────────┘
4. Older (if any)
   [Same card style, collapsed by default]
```

### 5.4 Layout Specification

#### 5.4.1 Header

| Property | Value |
|----------|-------|
| Height | 56px |
| Padding horizontal | SPACING.lg |

```
Left: 🔔 + "Notifications" → FONT_SIZES.title, Bold
Right: "Mark all read" (COLORS.primary, onPress: clear badge)
```

#### 5.4.2 Notification Card

Each notification:
```
Background: COLORS.background
Border radius: RADIUS.lg
Margin: SPACING.sm SPACING.lg
Padding: SPACING.lg
Shadow: SHADOWS.sm
Border left: 3px solid (color based on type)
```

**Notification Types**:

| Type | Icon | Border Color | Priority |
|------|------|-------------|----------|
| Meal reminder | ⏰ | COLORS.primary | High |
| Water reminder | 💧 | COLORS.primary | High |
| Weather alert | 🌤️ | COLORS.warning | Medium |
| Nutrition alert | 🥗 | COLORS.warning | Medium |
| Variety alert | 🚫 | COLORS.error | High |
| Achievement | 🎉 | COLORS.success | Low |

**Card Content**:
```
Row 1: Icon + Title (FONT_SIZES.body, SemiBold) → e.g., "⏰ Time for lunch!"
Row 2: Message (FONT_SIZES.body, Regular, COLORS.textSecondary) → e.g., "It's 12 PM and you haven't logged lunch yet."
Row 3: Timestamp (FONT_SIZES.caption, COLORS.textMuted) → e.g., "12:00 PM"
```

**Unread Indicator**: Small green dot (8px, COLORS.primary, borderRadius: round) at top-right of card.

#### 5.4.3 Section Grouping

```
"Today" (section header)
  Cards with date === today

"Earlier This Week" (section header)
  Cards with date < today and >= 7 days ago
```

#### 5.4.4 Empty State

```
🔔 icon (48px)
"No notifications yet"
"Notifications will appear here when the AI has suggestions for you."
```

### 5.5 Notification Generation (Backend Logic)

| Trigger | Condition | Type | Message |
|---------|-----------|------|---------|
| Meal time | Current time is meal type time AND no meal logged | Meal reminder | "Time for {meal_type}!" |
| Hydration | Weather temp > 30°C AND low water logs | Water reminder | "Hot day! Drink more water." |
| Weather change | Condition changes to heatwave/cold | Weather alert | "Weather alert: {condition}" |
| Protein repetition | Same protein_tag 3+ consecutive meals | Variety alert | "Avoid repeating {protein}" |
| Low fiber | <2 High-fiber meals in 3 days | Nutrition alert | "Increase fiber intake" |
| Achievement | All 4 meal types logged today | Achievement | "Complete day!" |

Notifications are generated by `POST /api/notifications/check` and stored in the `notifications` table.

### 5.6 Edge Cases

| Scenario | Behavior |
|----------|----------|
| No notifications | Show empty state |
| 50+ notifications | Show "View all" button, cap at 50 visible |
| User taps notification | Navigate to relevant screen (meal → MealDetail, water → Home) |
| All read | "Mark all read" disappears |

---

## 6. Profile Screen

### 6.1 Screen Purpose
View and edit the user's profile, dietary preferences, health goals, and account information.

### 6.2 UX Goal
Update any profile field in under 2 taps. Changes automatically sync to the backend.

### 6.3 Visual Hierarchy

```
1. Header
   [👤 Profile]
2. Profile Header
   [🥑 Avatar emoji (large)]          → Display only, 80px
   [Name / User ID]
3. Personal Information Section
   ┌─ Name ───────────────────────────┐
   │  [TextInput: "Your name"]        │
   └──────────────────────────────────┘
   ┌─ Country ────────────────────────┐
   │  [BD] [IN] [PK] [DE] [UK] ...   │ → horizontal pill selector
   └──────────────────────────────────┘
4. Dietary Preferences Section
   ┌─ Diet Preference ────────────────┐
   │  [Omnivore] [Vegetarian] [Vegan] │ → horizontal pill selector
   └──────────────────────────────────┘
   ┌─ Allergies ──────────────────────┐
   │  [+ Add allergy]                 │
   │  [None specified]                 │
   └──────────────────────────────────┘
5. Health Goals Section
   ┌─ Activity Level ─────────────────┐
   │  [Low] [Medium] [High]          │ → pill selector
   └──────────────────────────────────┘
   ┌─ Health Goal ────────────────────┐
   │  [Balanced] [Weight loss]        │ → horizontal pills
   │  [Muscle gain] [General health]  │
   └──────────────────────────────────┘
6. Save Button
   [💾 Save Changes]                  → Primary button, full width
7. Footer
   "MealFit AI v1.0"
   "Free. No login. No calorie counting."
```

### 6.4 Layout Specification

#### 6.4.1 Profile Header

| Property | Value |
|----------|-------|
| Padding | SPACING.xxxl vertical, centered |

```
Avatar: Large emoji (80px) → 🥑
  Displayed in a circle container (80x80, RADIUS.round, COLORS.primaryLight bg)
Name: "Your Name" or "User" → FONT_SIZES.heading, Bold, COLORS.text
User ID: "ID: abc123..." → FONT_SIZES.caption, COLORS.textMuted (truncated to 12 chars)
```

#### 6.4.2 Form Sections

Each section follows the same pattern:

```
Section Title: FONT_SIZES.subhead, SemiBold, COLORS.text, paddingHorizontal: SPACING.lg, marginTop: SPACING.xxl

Card: Background COLORS.surface, borderRadius RADIUS.lg
  Margin horizontal: SPACING.lg
  Padding: SPACING.lg
  Margin bottom: SPACING.sm
```

**Name Input**:
```
TextInput: FONT_SIZES.body, COLORS.text
Placeholder: "Your name" → COLORS.textMuted
Border bottom: 1px, COLORS.border
Height: 44px
On change: Update local state (no auto-save)
```

**Pill Selectors**: Same specification as Meal Type Selector (Volume 1, section 17.4.2)
- Horizontal wrap (FlexBox, flexWrap: 'wrap', gap: SPACING.sm)
- Active: COLORS.primary bg, white text
- Inactive: transparent bg, COLORS.border, COLORS.textSecondary text

**Allergies**:
```
If empty: "None specified" → FONT_SIZES.body, COLORS.textMuted
Add button: "+ Add allergy" → COLORS.primary
  On press: Show TextInput inline
  On enter: Add allergy as chip (removable with ✕)
```

#### 6.4.3 Save Button

| Property | Value |
|----------|-------|
| Margin | SPACING.xxxl horizontal, SPACING.lg top |
| Height | 48px |
| Background | COLORS.primary |
| Border radius | RADIUS.md |

```
Text: "💾 Save Changes" → FONT_SIZES.body, SemiBold, #FFFFFF
On press: PUT /api/user/profile { updated profile }
  → Success: Toast "✅ Saved!"
  → Error: Toast "❌ Couldn't save. Try again."
```

### 6.5 Data Flow

```
Screen loads:
  → Load profile from UserContext.profile (from SecureStore + backend)
  → Pre-populate all fields

User edits a field:
  → Update local state (optimistic)

User taps "Save Changes":
  → UserContext.updateProfile(updatedFields)
  → PUT /api/user/profile { profile }
  → On success: Update SecureStore, show toast
  → On error: Revert local state, show error toast
```

### 6.6 Edge Cases

| Scenario | Behavior |
|----------|----------|
| Profile not yet loaded | Show skeleton loading state |
| No network on save | Cache update locally, sync when online |
| User clears name field | Save as empty string (no default) |
| Long name (>50 chars) | Truncate in display, store full value |

---

## 7. Settings Screen

### 7.1 Screen Purpose
Configure app-level settings: units, app preferences, data management, and information.

### 7.2 UX Goal
All settings should be self-explanatory. One tap to change any toggle. Changes apply immediately.

### 7.3 Visual Hierarchy

```
1. Header
   [← Back]  [⚙️ Settings]
2. Units Section
   ┌─ Units ──────────────────────────┐
   │  [Metric] [Imperial]             │ → pill selector
   └──────────────────────────────────┘
3. Notifications Section
   ┌─ Meal Reminders ─────────────────┐
   │  🍽️ Breakfast          [ON/OFF]  │
   │  🍽️ Lunch              [ON/OFF]  │
   │  🍽️ Dinner             [ON/OFF]  │
   │  🍽️ Snack              [ON/OFF]  │
   └──────────────────────────────────┘
   ┌─ Other Reminders ────────────────┐
   │  💧 Water reminder     [ON/OFF]  │
   │  🌤️ Weather alerts     [ON/OFF]  │
   │  🥗 Nutrition tips     [ON/OFF]  │
   └──────────────────────────────────┘
4. Data Section
   ┌──────────────────────────────────┐
   │  🗑️ Clear meal history          │ → Destructive action
   │     "Removes all logged meals"   │
   └──────────────────────────────────┘
5. About Section
   ┌──────────────────────────────────┐
   │  ℹ️ Version: 1.0.0              │
   │  📧 Contact: mealfit@app.com    │
   └──────────────────────────────────┘
```

### 7.4 Layout Specification

#### 7.4.1 Settings Card

| Property | Value |
|----------|-------|
| Margin horizontal | SPACING.lg |
| Background | COLORS.background |
| Border radius | RADIUS.lg |
| Shadow | SHADOWS.sm |

Each setting row:
```
Height: 48px
Padding horizontal: SPACING.lg
Border bottom: 0.5px, COLORS.divider (last row: none)

Left: Label → FONT_SIZES.body, COLORS.text
Right: Toggle / selector → Switch (iOS) or Checkbox (Android)
```

#### 7.4.2 Toggle Switch

| Property | Value |
|----------|-------|
| Active color | COLORS.primary |
| Inactive color | COLORS.border |
| Size | 48x28 (standard) |

#### 7.4.3 Destructive Action

| Property | Value |
|----------|-------|
| Text color | COLORS.error |
| No toggle | Just a pressable row |

```
On press: Show confirmation Alert
  Title: "Clear meal history?"
  Message: "This will remove all logged meals. This action cannot be undone."
  Buttons: ["Cancel", "Clear"] (Clear is red/destructive)
  
On confirm: 
  → Clear SecureStore entries
  → POST /api/history/clear (future endpoint)
  → Show toast "✅ History cleared"
```

### 7.5 Data Flow

```
Toggle change → Update local state → Store in SecureStore
  (No backend sync needed for settings — they're device-local)
```

### 7.6 Edge Cases

| Scenario | Behavior |
|----------|----------|
| User toggles rapidly | Debounce updates (200ms) |
| Clear history confirmed | Clear + toast, no additional confirmation |
| Settings not saved | Setting changes persist immediately via SecureStore |

---

*End of Volume 2*
