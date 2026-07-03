export const API_BASE = 'https://mealfit-api.susmoydas6.workers.dev'; // Cloudflare Workers backend URL

// ── Colors ────────────────────────────────────────────────────────────────
export const COLORS = {
  primary:       '#1D9E75',    // Health green
  primaryDark:   '#157A5A',
  primaryLight:  '#E6F7F0',
  primaryForeground: '#FFFFFF',

  cardBg:        '#F8F9FA',
  background:    '#FFFFFF',
  surface:       '#F8F9FA',
  foreground:    '#0A0A0A',

  text:          '#0A0A0A',
  textSecondary: '#737373',
  textMuted:     '#A3A3A3',
  border:        '#E5E7EB',
  divider:       '#F0F2F5',

  white:         '#FFFFFF',
  black:         '#000000',
  error:         '#EF4444',
  errorLight:    '#FEE2E2',
  success:       '#22C55E',
  successLight:  '#DCFCE7',
  warning:       '#F59E0B',
  warningLight:  '#FEF3C7',

  // Nutrition-specific
  protein:       '#22C55E',
  carbs:         '#F59E0B',
  fiber:         '#3B82F6',
  fat:           '#A855F7',
  calories:      '#EF4444',

  substituteBg:  '#FFFBEB',
  substituteBorder: '#D97706',
  overlay:       'rgba(0,0,0,0.3)',
  shadow:        'rgba(0,0,0,0.06)',
};

// ── Spacing Scale ─────────────────────────────────────────────────────────
// Allowed: 4, 8, 12, 16, 20, 24, 32
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

// ── Typography Scale ──────────────────────────────────────────────────────
// Section title: 20-22px, Card title: 16-18px, Body: 14-16px,
// Caption/Tag: 11-12px, Nav label: 11-12px
export const FONT_SIZES = {
  caption:  11,     // Tags, nav labels
  small:    12,     // Captions, badges
  body:     14,     // Default body text
  bodyLg:   16,     // Card titles, emphasis
  title:    18,     // Section subtitles
  sectionTitle: 20, // Section headers
  sectionTitleLg: 22, // Large section headers
  hero:     24,     // Hero text (use sparingly)
} as const;

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium:  '500' as const,
  semiBold: '600' as const,
  bold:    '700' as const,
};

// ── Border Radius ─────────────────────────────────────────────────────────
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
} as const;

// ── Icon Sizes ────────────────────────────────────────────────────────────
// ONLY: 16, 20, 24
export const ICON_SIZE = {
  sm: 16,    // Inline, badges, small buttons
  md: 20,    // Standard, nav tabs, cards
  lg: 24,    // Feature icons, headers
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export const FOOD_PREFERENCES = [
  { value: 'omnivore', label: 'Non-Vegetarian' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'keto', label: 'Keto' },
  { value: 'low_carb', label: 'Low Carb' },
  { value: 'other', label: 'Other' },
] as const;

export const DIET_OPTIONS = FOOD_PREFERENCES.map(p => p.value) as readonly string[];
export const HEALTH_GOALS = [
  { value: 'general_health', label: 'General Health' },
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'gain_weight', label: 'Gain Weight' },
  { value: 'build_muscle', label: 'Build Muscle' },
  { value: 'maintain_weight', label: 'Maintain Weight' },
  { value: 'more_energy', label: 'More Energy' },
  { value: 'better_digestion', label: 'Better Digestion' },
  { value: 'other', label: 'Other' },
] as const;
export const COUNTRIES = [
  { code: 'BD', name: 'Bangladesh' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'TR', name: 'Turkey' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ZA', name: 'South Africa' },
];

export const STORAGE_KEYS = {
  USER_ID:      'mealfit_user_id',
  USER_PROFILE: 'mealfit_profile',
  LAST_RECS:    'mealfit_last_recs',
  PENDING_LOGS: 'mealfit_pending_logs',
  ONBOARDED:    'mealfit_onboarded',
};

export const IMAGE_PLACEHOLDER = 'https://placehold.co/400x400/E6F7F0/1D9E75?text=MealFit';
export const IMAGE_FALLBACK = 'https://placehold.co/400x400/F0F2F5/B0B3B8?text=No+Image';
