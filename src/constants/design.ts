// ── Design Tokens (Single Source of Truth) ────────────────────────────────
// All screens must use these tokens. No hardcoded values outside this file.

export const Colors = {
  // Primary palette
  primary: '#1D9E75',       // Health green (matches CSS --primary)
  primaryForeground: '#FFFFFF',
  
  // Semantic colors
  background: '#FFFFFF',
  foreground: '#0A0A0A',
  card: '#FFFFFF',
  cardForeground: '#0A0A0A',
  muted: '#F5F5F5',
  mutedForeground: '#737373',
  border: '#E5E7EB',
  
  // Status colors
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  
  // Nutrition-specific
  protein: '#22C55E',       // Green
  carbs: '#F59E0B',         // Amber
  fiber: '#3B82F6',         // Blue
  fat: '#A855F7',           // Purple
  calories: '#EF4444',      // Red
  
  // Shadow
  shadow: '#0000001A',
};

export const Typography = {
  fontFamily: {
    regular: 'Urbanist_400Regular',
    medium: 'Urbanist_500Medium',
    semiBold: 'Urbanist_600SemiBold',
    bold: 'Urbanist_700Bold',
  },
  // ── Size Scale ──────────────────────────────────────────────────────
  // Section title: 20-22px, Card title: 16-18px, Body: 14-16px,
  // Caption/Tag: 11-12px, Nav label: 11-12px
  fontSize: {
    caption: 11,       // Tags, nav labels
    small: 12,         // Captions, badges
    body: 14,          // Default body text
    bodyLarge: 16,     // Card titles, emphasis
    title: 18,         // Section subtitles
    sectionTitle: 20,  // Section headers
    sectionTitleLg: 22, // Large section headers
    hero: 24,          // Hero text (use sparingly)
  },
  lineHeight: {
    caption: 16,
    small: 16,
    body: 20,
    bodyLarge: 24,
    title: 24,
    sectionTitle: 28,
    sectionTitleLg: 28,
    hero: 32,
  },
};

// ── Spacing Scale ────────────────────────────────────────────────────────
// Allowed values: 4, 8, 12, 16, 20, 24, 32
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

// ── Icon Sizes ──────────────────────────────────────────────────────────
// ONLY allowed sizes: 16, 20, 24
export const IconSize = {
  sm: 16,    // Inline icons, badges, small buttons
  md: 20,    // Standard icons, nav tabs, cards
  lg: 24,    // Feature icons, headers
} as const;

export type IconSize = typeof IconSize[keyof typeof IconSize];

export const Shadows = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const AnimationDurations = {
  fast: 200,
  normal: 300,
  slow: 500,
};

export const TouchTarget = {
  minHeight: 44,
  minWidth: 44,
};