---
name: Emerald Finance
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#bdc7d9'
  on-secondary: '#27313f'
  secondary-container: '#404a59'
  on-secondary-container: '#afb9cb'
  tertiary: '#adc6ff'
  on-tertiary: '#002e6a'
  tertiary-container: '#71a1ff'
  on-tertiary-container: '#00367a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d9e3f6'
  secondary-fixed-dim: '#bdc7d9'
  on-secondary-fixed: '#121c2a'
  on-secondary-fixed-variant: '#3d4756'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
---

## Brand & Style

The brand personality is **authoritative yet energetic**, combining the sobriety of traditional banking with the agility of a modern fintech startup. The design system targets a tech-savvy demographic that values speed, precision, and a "premium" feel in their financial tools.

The visual style is **Corporate Modern with High-Contrast accents**. It utilizes a deep "Onyx" canvas to reduce eye strain and provide a sophisticated backdrop for financial data. The emerald green serves as a high-visibility signal for growth, action, and success. The interface prioritizes high-contrast legibility and a sleek, technical aesthetic that feels secure and high-performance.

Inspired by: https://ui8.net/sakma-studio/products/smarta---finance-tech-mobile-app?utm_source=Pinterest&utm_medium=organic

## Colors

The palette is rooted in a **pure dark mode** architecture.

- **Primary (Emerald):** Used for primary call-to-actions, positive balance indicators, and active states. It represents growth and financial health.
- **Secondary (Slate/Zinc):** Used for container backgrounds and secondary buttons to provide subtle depth against the pure black canvas.
- **Neutral/Background:** A range of deep grays starting from #09090B to ensure the OLED blacks remain deep while providing enough contrast for surface separation.
- **Semantic Colors:** Critical alerts use a vibrant coral/red, while informational links may use a technical blue to distinguish from primary green actions.

## Typography

This design system uses **Manrope** for its modern, geometric construction and high legibility in financial contexts. It feels technical yet approachable.

For data-heavy elements—such as transaction amounts, dates, and account numbers—we utilize **JetBrains Mono**. This monospaced font ensures that numerical data aligns perfectly in lists and tables, aiding in quick scanning of financial figures. 

**Hierarchy Rules:**
- Use `headline-lg` for primary balances and screen titles.
- Use `label-md` (monospaced) for all currency displays and timestamps.
- Maintain a high contrast ratio (minimum 7:1) for all body text against the dark background.

## Layout & Spacing

The system follows a **4px base grid** to ensure mathematical harmony. 

**Mobile-First Grid:**
- A **fluid 4-column grid** for mobile with 20px side margins and 16px gutters.
- Vertical spacing relies on `md` (16px) for related elements and `lg` (24px) for distinct sections.

**Desktop Reflow:**
- On larger screens, the layout transitions to a **12-column fixed grid** with a maximum content width of 1200px.
- Financial dashboards should utilize a "Sidebar + Main Feed + Right Detail" pattern to maximize data density without overcrowding.

## Elevation & Depth

In a dark high-contrast environment, depth is established through **Tonal Layering** rather than heavy shadows.

- **Level 0 (Background):** #09090B - The base canvas.
- **Level 1 (Surface/Cards):** #18181B - Used for primary content containers. These have a subtle 1px border (#27272A) to define edges against the background.
- **Level 2 (Active/Overlays):** #27272A - Used for modals, tooltips, and elevated interactive states.
- **Shadows:** When necessary (e.g., floating action buttons), use a highly diffused black shadow with 40% opacity to prevent "glow" on dark surfaces.

## Shapes

The shape language is **distinctly rounded** to soften the high-contrast color palette and make the app feel more accessible and user-friendly.

- **Standard Elements:** Buttons and input fields use a `0.5rem` (8px) radius.
- **Cards & Containers:** Use `1rem` (16px) for main content cards (e.g., Credit Card components, Savings Plans).
- **Icons & Avatars:** Use full circles (pill-shaped) for profile images and status indicators to create a clear visual distinction from structural UI elements.

## Components

### Buttons
- **Primary:** Background Emerald Green (#10B981), Text Black (#000000). High visibility for the "primary path."
- **Secondary:** Background Dark Gray (#27272A), Text White. Subtle, used for navigation or optional actions.
- **Ghost:** No background, Emerald Green border/text. Used for tertiary actions like "See All."

### Cards
Cards are the primary organizational unit. They should have a background of #18181B, 16px padding, and 16px corner radius. For "Special" cards (like the Main Balance), a subtle radial gradient or a faint topographic pattern can be applied in the primary color.

### Input Fields
Inputs should be dark (#09090B) with a subtle border. On focus, the border transitions to Emerald Green with a subtle outer glow. Use monospaced font for amount inputs.

### Chips & Badges
Small, high-contrast labels used for categories (e.g., "Food," "Travel"). Use a dark background with text in the category's assigned semantic color.

### Navigation Bar
A fixed bottom navigation bar (mobile) or left sidebar (desktop) with #18181B background. The active state is indicated by an Emerald Green icon or a bottom indicator bar.