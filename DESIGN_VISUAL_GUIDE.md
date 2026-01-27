# 🎨 LANDING PAGE DESIGN UPDATE - Visual Guide

**Date:** 27 Januari 2026  
**Version:** 2.0  
**Component:** Hero Section + Navigation  

---

## 📐 Layout Specifications

### Hero Section Dimensions

```
┌────────────────────────────────────────────────────────────────┐
│ 100% VIEWPORT WIDTH (100vw)                                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  HERO CONTAINER: 90vh minimum height                           │
│  Background: Hero image + dark overlay                        │
│  Content max-width: 1200px                                    │
│  Horizontal padding: 24px each side                           │
│                                                                │
│  DESKTOP GRID (>1024px):                                      │
│  ┌──────────────────────────────┬─────────────────────────┐  │
│  │ LEFT COLUMN (60%)            │ RIGHT COLUMN (40%)      │  │
│  │                              │                         │  │
│  │ • Headline (H1)              │ • Form Card             │  │
│  │ • Description                │   - Max-width: 420px    │  │
│  │ • Value points (3x ✓)        │   - Padding: 32px       │  │
│  │                              │   - White background    │  │
│  │ Max-width: 90% of column     │   - Vertically centered │  │
│  │ Align: Left                  │   - Rounded corners     │  │
│  │                              │                         │  │
│  └──────────────────────────────┴─────────────────────────┘  │
│                                                                │
│  TABLET GRID (768px - 1024px):                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ SINGLE COLUMN                                          │  │
│  │ • Headline (reduced to text-5xl)                       │  │
│  │ • Description                                          │  │
│  │ • Value points                                         │  │
│  │ • Form card below (full width)                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  MOBILE GRID (<768px):                                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ SINGLE COLUMN - FULL WIDTH                             │  │
│  │ • Headline (text-4xl)                                  │  │
│  │ • Description                                          │  │
│  │ • Value points                                         │  │
│  │ • Form card (100% width with gutters)                  │  │
│  │ All elements: 100% width, max-width limits removed     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Palette

### Brand Colors
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  PRIMARY: #212A65 (Deep Navy Blue)                    │
│  ███████████████████████████████████████████           │
│  RGB: 33, 42, 101                                     │
│  Used for: Main buttons, headings, primary CTAs       │
│                                                         │
│  SECONDARY: #1C6CCE (Bright Blue)                     │
│  ███████████████████████████████████████████           │
│  RGB: 28, 108, 206                                    │
│  Used for: Accents, highlights, value checkmarks      │
│                                                         │
│  TERTIARY: #93C5FF (Light Blue)                       │
│  ███████████████████████████████████████████           │
│  RGB: 147, 197, 255                                   │
│  Used for: Subtle highlights, hover states            │
│                                                         │
│  BACKGROUND: #E9ECF6 (White-Blue)                     │
│  ███████████████████████████████████████████           │
│  RGB: 233, 236, 246                                   │
│  Used for: Page background, light surfaces            │
│                                                         │
│  NEUTRAL: #BDC0BF (White-Grey)                        │
│  ███████████████████████████████████████████           │
│  RGB: 189, 192, 191                                   │
│  Used for: Borders, dividers, subtle elements         │
│                                                         │
│  TEXT: #FFFFFF (White)                                │
│  ███████████████████████████████████████████           │
│  On dark overlay, hero section                        │
│                                                         │
│  TEXT: #212A65 (Primary)                              │
│  On white/light backgrounds                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Color Usage Map
```
Navigation
├── Background: #FFFFFF (white)
├── Text: #212A65 (primary)
├── Border: #BDC0BF (grey)
└── CTA Button: #212A65 background

Hero Section
├── Background: Image + dark overlay
├── Left content text: #FFFFFF (white)
├── Headline: Bold white
├── Description: White, 85% opacity
├── Value points: ✓ #1C6CCE (secondary) + white text
└── Form card
    ├── Background: #FFFFFF (white)
    ├── Title: #212A65 (primary)
    ├── Input fields: bg-gray-100, disabled (MVP)
    └── Button: #212A65 background, white text
```

---

## 📝 Typography Scale

### Font Family
**All text:** Inter (system fallback: ui-sans-serif, sans-serif)

### Size Scale
```
┌────────────────────────────────────────┐
│ HEADLINE (H1)                          │
├────────────────────────────────────────┤
│                                        │
│ Desktop:   text-6xl (3.75rem, 60px)  │
│ Tablet:    text-5xl (3rem, 48px)     │
│ Mobile:    text-4xl (2.25rem, 36px)  │
│                                        │
│ Font-weight: Bold (700)                │
│ Line-height: tight (1.25)              │
│ Max-width: 90% of column               │
│ Text-align: Left                       │
│ Color: White (#FFFFFF)                 │
│                                        │
│ Example:                               │
│ "Tingkatkan Level UMKM mu bersama kami"│
│                                        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ BODY TEXT (Description)                │
├────────────────────────────────────────┤
│                                        │
│ Desktop:   text-lg (1.125rem, 18px)  │
│ Mobile:    text-base (1rem, 16px)    │
│                                        │
│ Font-weight: Regular (400)             │
│ Line-height: relaxed (1.625)           │
│ Max-width: 80% of column               │
│ Opacity: 85% (on white)                │
│ Color: White (#FFFFFF)                 │
│                                        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ VALUE POINTS (List)                    │
├────────────────────────────────────────┤
│                                        │
│ Size:      text-base (16px)           │
│ Weight:    Regular (400)               │
│ Format:    ✓ Icon + text               │
│ Icon color: #1C6CCE (secondary)        │
│ Text color: White (#FFFFFF)            │
│ Spacing:   16px between items          │
│                                        │
│ Example:                               │
│ ✓ Evaluasi mendalam tingkat kematangan│
│ ✓ Pendampingan langsung dari mentor   │
│ ✓ Akses ribuan materi pembelajaran    │
│                                        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ FORM TITLE                             │
├────────────────────────────────────────┤
│                                        │
│ Size:      text-xl (1.25rem, 20px)   │
│ Weight:    Semi-bold (600)             │
│ Color:     #212A65 (primary)           │
│ Margin:    20px bottom                 │
│                                        │
│ Example:                               │
│ "Daftar UMKM untuk bergabung"         │
│                                        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ FORM INPUT LABELS (Placeholder)        │
├────────────────────────────────────────┤
│                                        │
│ Size:      text-base (16px)           │
│ Weight:    Regular (400)               │
│ Color:     Gray placeholder            │
│ Background: Light gray (#F3F4F6)      │
│                                        │
│ Examples:                              │
│ • Nama lengkap Anda                   │
│ • Email@gmail.com                     │
│ • 08xxx                                │
│ • Nama lengkap Anda (business name)   │
│                                        │
└────────────────────────────────────────┘
```

---

## 🖼️ Background Image Specification

### Image Details
```
┌─────────────────────────────────────┐
│ BACKGROUND IMAGE                    │
├─────────────────────────────────────┤
│                                     │
│ File: /assets/hero-semindo-1@2x.png│
│ Size: 2x resolution (for Retina)   │
│ Format: PNG/JPG (optimized)        │
│ Coverage: Full hero section         │
│ Object-fit: cover                   │
│ Position: center center             │
│                                     │
│ Layer stacking:                     │
│ 1. Background image (z-0)           │
│ 2. Dark overlay gradient (z-0)      │
│ 3. Content (z-10)                   │
│                                     │
└─────────────────────────────────────┘

DARK OVERLAY GRADIENT:
┌─────────────────────────────────────┐
│ From top:                           │
│ rgba(10, 20, 60, 0.65)  65% opacity │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░ │
│                                     │
│ To bottom:                          │
│ rgba(10, 20, 60, 0.85)  85% opacity │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░ │
│                                     │
│ Purpose:                            │
│ • Ensures text readability          │
│ • Creates depth effect              │
│ • Darker at bottom (focus shift)    │
│                                     │
└─────────────────────────────────────┘
```

---

## 📱 Responsive Behavior Grid

### DESKTOP (>1024px)
```
┌──────────────────────────────────────────────────┐
│ HERO SECTION - FULL WIDTH (100vw)               │
├──────────────────────────────────────────────────┤
│                                                  │
│ HEIGHT: 90vh (or minimum content height)        │
│ CONTENT MAX-WIDTH: 1200px                       │
│ PADDING: 24px left & right                      │
│                                                  │
│ GRID: 2 columns (60% | 40%)                     │
│ ┌────────────────────┬─────────────────────┐    │
│ │ LEFT (60%)         │ RIGHT (40%)         │    │
│ │ • H1: text-6xl     │ • Form: max-420px   │    │
│ │ • P: text-lg       │ • Vertically center │    │
│ │ • Values: ✓ ✓ ✓    │                     │    │
│ │ Align: left        │ Align: right        │    │
│ └────────────────────┴─────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

### TABLET (768px - 1024px)
```
┌──────────────────────────────────────────────────┐
│ HERO SECTION - RESPONSIVE                       │
├──────────────────────────────────────────────────┤
│                                                  │
│ HEIGHT: Variable (auto)                         │
│ CONTENT MAX-WIDTH: 100% with padding            │
│ PADDING: 20px left & right (reduced)            │
│                                                  │
│ GRID: Transitioning to 1 column                 │
│ ┌──────────────────────────────────────┐        │
│ │ • H1: text-5xl (reduced)             │        │
│ │ • P: text-base                       │        │
│ │ • Values: ✓ ✓ ✓                      │        │
│ │ • Form: below content, full width    │        │
│ └──────────────────────────────────────┘        │
│                                                  │
└──────────────────────────────────────────────────┘
```

### MOBILE (<768px)
```
┌──────────────────────────────────────────────────┐
│ HERO SECTION - FULL MOBILE                      │
├──────────────────────────────────────────────────┤
│                                                  │
│ WIDTH: 100% viewport                            │
│ HEIGHT: Auto (content driven)                   │
│ PADDING: 20px (gutters on sides)                │
│                                                  │
│ LAYOUT: Single column stack                     │
│ ┌──────────────────────────────────────┐        │
│ │ • H1: text-4xl (12 columns)          │        │
│ │   "Tingkatkan Level UMKM mu          │        │
│ │    bersama kami"                     │        │
│ │                                      │        │
│ │ • P: text-base                       │        │
│ │   "Semindo bantu UMKM Indonesia..."  │        │
│ │                                      │        │
│ │ • Values: ✓ ✓ ✓                      │        │
│ │   100% width, stacked vertically     │        │
│ │                                      │        │
│ │ • Form: 100% width                   │        │
│ │   Max-width: 100% (no limit)         │        │
│ │   Full padding inside viewport       │        │
│ │                                      │        │
│ │   Fields (100% width):               │        │
│ │   [Nama Lengkap]                     │        │
│ │   [Email]                            │        │
│ │   [Telepon]                          │        │
│ │   [Nama Usaha]                       │        │
│ │                                      │        │
│ │   [Daftar UMKM Sekarang]  (44px min) │        │
│ │                                      │        │
│ └──────────────────────────────────────┘        │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🔘 Form Input States

### NORMAL STATE (MVP - Disabled)
```
┌─────────────────────────────────────────┐
│ Input Field (Disabled/Greyed)           │
├─────────────────────────────────────────┤
│                                         │
│ Background: #F3F4F6 (light gray)       │
│ Border: None                            │
│ Text color: #6B7280 (gray)             │
│ Cursor: not-allowed                     │
│ Opacity: 100% (but greyed color)        │
│ Placeholder: visible                    │
│                                         │
│ [Nama lengkap Anda]                    │
│ ^- placeholder text, greyed appearance │
│                                         │
└─────────────────────────────────────────┘

BUTTON STATE (MVP - Enabled)
┌─────────────────────────────────────────┐
│ Button                                  │
├─────────────────────────────────────────┤
│                                         │
│ Background: #212A65 (primary)          │
│ Text: White (#FFFFFF)                  │
│ Width: 100% (full form width)           │
│ Height: 44px (minimum)                  │
│ Font-weight: Bold/Medium (700/600)      │
│ Border-radius: Medium (4px)             │
│ Cursor: pointer                         │
│                                         │
│ [Daftar UMKM Sekarang]                 │
│                                         │
│ Hover state (future):                  │
│ Background: Slightly darker             │
│ Shadow: Subtle elevation                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔲 Component Spacing

### Hero Section Spacing
```
┌─────────────────────────────────────────┐
│ Hero Container                          │
│ ┌───────────────────────────────────┐   │
│ │ Padding: 24px (horizontal)        │   │
│ │                                   │   │
│ │ ┌──────────────┐  ┌────────────┐  │   │
│ │ │ LEFT COLUMN  │  │ FORM CARD  │  │   │
│ │ │              │  │            │  │   │
│ │ │ H1           │  │ Title      │  │   │
│ │ │ Margin-b: 24 │  │ Margin-b:20│  │   │
│ │ │              │  │            │  │   │
│ │ │ Desc         │  │ Field 1    │  │   │
│ │ │ Margin-b: 32 │  │ Margin-b: 20  │   │
│ │ │              │  │            │  │   │
│ │ │ Values       │  │ Field 2    │  │   │
│ │ │ Spacing: 16  │  │ Margin-b: 20  │   │
│ │ │ between items│  │            │  │   │
│ │ │              │  │ Field 3    │  │   │
│ │ │              │  │ Margin-b: 20  │   │
│ │ │              │  │            │  │   │
│ │ │              │  │ Field 4    │  │   │
│ │ │              │  │ Margin-b: 20  │   │
│ │ │              │  │            │  │   │
│ │ │              │  │ Button     │  │   │
│ │ │              │  │ Margin-t: 32  │   │
│ │ │              │  │ Height: 44px   │   │
│ │ │              │  │            │  │   │
│ │ │              │  └────────────┘  │   │
│ │ └──────────────┘                  │   │
│ │                                   │   │
│ │ Form padding: 32px inside card    │   │
│ │                                   │   │
│ └───────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📐 Form Card Specifications

### Form Card Container
```
┌─────────────────────────────────┐
│ FORM CARD                       │
├─────────────────────────────────┤
│                                 │
│ Background: White (#FFFFFF)     │
│ Border-radius: Medium (~8px)    │
│ Padding: 32px                   │
│ Max-width: 420px                │
│ Box-shadow: Soft (0 4px 6px)    │
│ Position: Vertically centered   │
│ (relative to hero height)       │
│                                 │
│ Desktop: Right-aligned          │
│ Tablet: Below content           │
│ Mobile: 100% width (minus pad)  │
│                                 │
└─────────────────────────────────┘
```

---

## ✨ Design Principles

### Visual Hierarchy
1. **Headline** - Largest, primary focus
2. **Description** - Secondary info
3. **Value points** - Supporting details
4. **Form card** - Secondary focus (right side)
5. **Form fields** - Tertiary (greyed out MVP)
6. **Submit button** - Clear call-to-action

### Color Hierarchy
1. Primary (#212A65) - Main actions
2. Secondary (#1C6CCE) - Accents
3. White (#FFFFFF) - Content
4. Neutral (#BDC0BF) - Subtle elements
5. Gray scale - Text on light backgrounds

### Spacing Hierarchy
- Large gaps: Between sections
- Medium gaps: Between elements
- Small gaps: Within elements
- Consistent 4px, 8px, 16px, 24px, 32px scale

---

**Version:** 2.0  
**Last Updated:** 27 Januari 2026  
**Status:** ✅ Ready for Implementation  
