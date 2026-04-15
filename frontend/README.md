# UniFlow Smart Campus

Welcome to the UniFlow Smart Campus frontend codebase! 

This repository houses the frontend system designed to streamline campus management, including ticketing and incident reporting, built with React and Tailwind CSS v4.

## UI Design & Global Colors 🎨

We've established a modern, glassmorphic dark theme for the overall aesthetics. To keep styling consistent across different modules, we've extracted the main UI colors into standard variables inside `src/index.css`. 

When building new components or pages, you can easily apply these theme colors using standard **Tailwind Utility Classes** or as normal **CSS Variables**.

### Core Theme Colors

| Color Variable / Class | Hex Value / HSLA | Description |
|-----------|-----------|-----------|
| `bg-brand-bg-dark` / `var(--brand-bg-dark)` | `#020617` | The primary, deep dark background used globally. |
| `bg-brand-primary` / `var(--brand-primary)` | `#2563eb` | Primary accent color for prominent buttons and active states. |
| `bg-brand-primary-hover` / `var(--brand-primary-hover)` | `#3b82f6` | Hover state color for primary accents. |
| `var(--brand-glow-purple)` | `hsla(253, 40%, 15%, 1)` | The deep purple ambient background glow. |
| `var(--brand-glow-blue)` | `hsla(225, 50%, 15%, 0.8)` | The deep blue ambient background glow. |
| `var(--brand-glow-pink)` | `hsla(339, 40%, 10%, 0.9)` | The dark pink ambient background glow. |
| `var(--brand-glass-overlay)` | `rgba(15, 23, 42, 0.4)` | Used as a standard backdrop for glass panels. |
| `var(--brand-border)` | `rgba(255, 255, 255, 0.1)` | Standard subtle white borders for cards and sections. |
| `var(--brand-danger)` | `rgba(127, 29, 29, 0.4)` | The background for error or danger action items. |

### How to use them

**In standard JSX (Tailwind):**
```jsx
<div className="bg-brand-bg-dark">
   <button className="bg-brand-primary hover:bg-brand-primary-hover text-white">
     Submit Request
   </button>
</div>
```

**In custom CSS:**
```css
.my-custom-card {
  background-color: var(--brand-glass-overlay);
  border: 1px solid var(--brand-border);
  box-shadow: 0 4px 15px var(--brand-glow-blue);
}
```

## Running Locally

To launch the project:
```bash
npm install
npm run dev
```
