const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // ── Typography Scale (RNR standard) ──────────────────────────────
      // Section title: 20-22px, Card title: 16-18px, Body: 14-16px,
      // Caption/Tag: 11-12px, Nav label: 11-12px
      fontSize: {
        xs: ['0.6875rem', { lineHeight: '1rem' }],        /* 11px */
        sm: ['0.75rem', { lineHeight: '1rem' }],           /* 12px */
        base: ['0.875rem', { lineHeight: '1.25rem' }],     /* 14px */
        lg: ['1rem', { lineHeight: '1.5rem' }],            /* 16px */
        xl: ['1.125rem', { lineHeight: '1.5rem' }],        /* 18px */
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }],     /* 20px */
        '3xl': ['1.375rem', { lineHeight: '1.75rem' }],    /* 22px */
        '4xl': ['1.5rem', { lineHeight: '2rem' }],         /* 24px */
        '5xl': ['1.75rem', { lineHeight: '2.25rem' }],     /* 28px */
      },
      // ── Spacing Scale (4, 8, 12, 16, 20, 24, 32) ──────────────────
      spacing: {
        '0.5': '0.125rem',   /* 2px */
        '1': '0.25rem',      /* 4px */
        '1.5': '0.375rem',   /* 6px */
        '2': '0.5rem',       /* 8px */
        '3': '0.75rem',      /* 12px */
        '4': '1rem',         /* 16px */
        '5': '1.25rem',      /* 20px */
        '6': '1.5rem',       /* 24px */
        '8': '2rem',         /* 32px */
        '10': '2.5rem',      /* 40px */
        '12': '3rem',        /* 48px */
      },
      // ── Colors (CSS variables) ──────────────────────────────────────
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      // ── Border Radius ───────────────────────────────────────────────
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      // ── Icon Sizes (16 / 20 / 24px only) ───────────────────────────
      // Use via: <Icon size="icon.sm" /> or <Icon size="icon.md" />
      width: {
        'icon-sm': '1rem',     /* 16px */
        'icon-md': '1.25rem',  /* 20px */
        'icon-lg': '1.5rem',   /* 24px */
      },
      height: {
        'icon-sm': '1rem',     /* 16px */
        'icon-md': '1.25rem',  /* 20px */
        'icon-lg': '1.5rem',   /* 24px */
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require('tailwindcss-animate')],
};
