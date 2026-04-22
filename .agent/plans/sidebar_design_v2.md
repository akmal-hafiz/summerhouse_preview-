# Sidebar Redesign Implementation Plan

## Objective
Redesign the existing dark, large-text sidebar into a **Clean, Elegant, Light-themed** sidebar with smaller typography and generous spacing, addressing the "cramped/unfinished" feedback.

## 1. Visual Style & Color Palette
- **Background**: Change from Dark `#1E1E1E` to **Clean White** `#FFFFFF` (or very light cream `#FAFAF9` if preferred for warmth).
  - *Recommendation*: Use `#FFFFFF` for the crispest "clean" look referenced by the client.
- **Typography Color**: Update from White `#FFFFFF` to **Sage Green** `#7F8C78`.
  - This provides a softer, organic contrast compared to harsh black-on-white.

## 2. Layout & Dimensions
- **Sidebar Width**: Reduce from `w-full md:w-[480px]` (Very wide) to **`w-[300px] md:w-[360px]`**.
  - This creates a sleeker profile and allows more of the blurred backdrop to be visible.
- **Padding (Breathing Room)**:
  - Increase horizontal padding to `px-12` or `px-14` (approx 48px-56px).
  - This solves the "text mepet" (text too close to edge) issue.

## 3. Typography Updates
- **Font Size**: drastically reduce from `text-[56px]` (Display size) to **`text-3xl`** (approx 30px) or `text-2xl`.
  - *Proposed*: `text-3xl` for main links to maintain hierarchy but look refined.
- **Font Weight**: `font-light` or `font-normal`. Light weights look more elegant/premium.
- **Line Height/Spacing**: Increase vertical gap between items (`gap-6` or `gap-8`) to creates vertical "air".

## 4. Interaction Details
- **Close Button**:
  - Change Icon Color from White to `#7F8C78` (Green) or `#2E2E2C` (Dark Grey).
  - Position: Ensure it's aligned with the content padding (`px-12`).
- **Hover States**:
  - Text Color: Darken slightly on hover (e.g., to `#446B4A`).
  - Animation: Keep the subtle `translate-x` slide for interactive feel.

## 5. Summary of Code Changes
Files to modify: `components/common/Navbar.tsx`

```tsx
// Example Sidebar Container
<div className="bg-white w-[300px] md:w-[360px] ...">

// Example Menu Item
<Link className="text-3xl text-[#7F8C78] font-light hover:text-[#446B4A] ...">
```

## 6. Execution Steps
1. Update Sidebar Container class (`bg`, `width`).
2. Update Close Button color (SVG stroke).
3. Update Menu Links (`text-size`, `color`, `spacing`).
4. Update Footer text color (to a muted grey/green).
