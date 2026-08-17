---
name: Modern Corporate
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e5'
  on-secondary-container: '#626567'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e0e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
  surface-pure: '#FFFFFF'
  border-subtle: '#E2E8F0'
  text-muted: '#64748B'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  container-max: 1280px
---

## Brand & Style

The design system is built on the pillars of **Trust, Transparency, and Efficiency**. It transitions away from dark-tech aesthetics toward a **Premium Minimalism** that resonates with business professionals and enterprise stakeholders. The brand personality is authoritative yet approachable, favoring clarity and high-quality imagery over decorative effects.

The chosen style is **Corporate / Modern**. It utilizes a sophisticated "Light Mode" foundation characterized by expansive whitespace, a refined color palette, and a focus on content hierarchy. The visual language conveys stability and professional excellence, ensuring that complex business data feels manageable and reliable. High-quality photography with natural lighting should be used to humanize the professional environment, replacing tech-heavy illustrations or glowing gradients.

## Colors

The color strategy is rooted in a "Clean Light" philosophy, prioritizing legibility and a sense of architectural openness.

- **Primary (#0F172A):** A deep, trustworthy Navy used for primary actions, navigation headers, and core typography. It provides the necessary weight to anchor the light interface.
- **Secondary / Container (#F8FAFC):** A soft light-grey used for secondary containers, background sections, and grouping elements to differentiate them from the pure white surface.
- **Neutral / Surface (#FFFFFF):** Pure white serves as the base surface color, maximizing the sense of whitespace and "Trust."
- **Functional Accents:** Use a refined palette for system states—muted emerald for success, soft slate for disabled states, and a clean crimson for errors—ensuring they do not disrupt the professional harmony.

## Typography

The typography system uses **Plus Jakarta Sans** to balance corporate professionalism with a modern, approachable geometric touch. 

Hierarchy is established through significant weight contrast and generous letter spacing, particularly in body and label styles, to enhance breathability. Headlines are kept tight and impactful, while body text uses a 1.6x line-height to ensure maximum readability in information-dense business documents. All uppercase labels should include a slight tracking increase (5%) to maintain a premium feel.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for desktop to maintain a controlled, editorial-like presentation of information, while transitioning to a fluid model for mobile devices.

- **Grid:** A 12-column grid with a 1280px max-width container. 
- **Rhythm:** An 8px linear scale drives all padding and margins. Use larger "Oxygen" gaps (64px+) between major page sections to emphasize the premium nature of the brand.
- **Breakpoints:** 
  - **Desktop (1024px+):** Full 12-column display with 64px margins.
  - **Tablet (768px - 1023px):** 8-column display with 40px margins.
  - **Mobile (Under 768px):** 4-column fluid display with 20px margins; typography scales down to mobile-specific variants.

## Elevation & Depth

Depth is handled with extreme subtlety to maintain the "Minimalist" aesthetic. The system avoids heavy drop shadows in favor of **Tonal Layers** and **Low-contrast outlines**.

- **Surface Tiers:** Primary content lives on the `#FFFFFF` surface. Background sections or "wells" use `#F8FAFC`.
- **Outlines:** Use a 1px solid border of `#E2E8F0` for cards and input fields. This provides structure without the visual "noise" of shadows.
- **Elevated States:** For floating elements like modals or dropdowns, use a very soft, high-diffusion shadow: `0 10px 25px -5px rgba(15, 23, 42, 0.05)`. This tinted shadow uses the Navy primary color at a very low opacity to maintain color harmony.

## Shapes

The shape language is **Rounded and Approachable**, moving away from the sharp technical corners of the previous system. 

The base roundedness is 0.5rem (8px), which is applied to buttons, input fields, and standard cards. This "Round Eight" approach softens the corporate edges, making the software feel modern and user-friendly. Large containers or featured imagery sections may use `rounded-xl` (1.5rem) to create a distinctive, premium silhouette.

## Components

### Buttons
- **Primary:** Solid Navy (#0F172A) fill with White text. High-contrast and authoritative.
- **Secondary:** Light-grey (#F8FAFC) fill with Navy text. No border.
- **Tertiary:** Ghost style; Navy text with no background until hover, where it takes a light-grey tint.

### Input Fields
Inputs should be minimal with a 1px `#E2E8F0` border. On focus, the border thickens slightly or transitions to Navy, with no outer glow. Labels sit outside the field in `label-sm` style for clarity.

### Cards
Cards are defined by their 1px border rather than shadows. Use a pure white background for the card and the soft-grey background for the page to create a natural "lift."

### Chips & Tags
Use a 100% rounded (pill) shape for status chips to distinguish them from rectangular buttons. Fills should be very pale versions of the status color with high-contrast text.

### Data Visualization
Charts and graphs should use a refined palette of Navy, Slate, and muted Blue. Avoid "neon" or high-saturation colors; focus on clean lines and generous spacing between data points.