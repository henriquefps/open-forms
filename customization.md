# Customization Guide

This guide explains how to customize the styling of the **OpenForms** component using CSS Custom Properties (CSS variables).

## CSS Custom Properties (Variables)

To override the default theme, define these variables in your own stylesheet under the `:root` selector or a specific theme class (e.g., `.dark`).

### Neutral Scale (Neutral 0 to 10)
Used for backgrounds, borders, inputs, and text hierarchies.

| CSS Variable | Description | Default (Light) |
| :--- | :--- | :--- |
| `--color-neutral-0` | Main canvas/farthest background | `#ffffff` |
| `--color-neutral-1` | Light backgrounds / sidebar | `#fafafb` |
| `--color-neutral-2` | Secondary surfaces / muted elements | `#f5f6f8` |
| `--color-neutral-3` | Standard borders | `#eeeeee` |
| `--color-neutral-4` | Focused/interacted borders & dividers | `#dedede` |
| `--color-neutral-5` | Secondary borders / ring indicators | `#b0b0b0` |
| `--color-neutral-6` | Placeholder & muted text | `#a0a0a0` |
| `--color-neutral-7` | Muted/disabled labels and metadata | `#666666` |
| `--color-neutral-8` | Secondary body text | `#4a4a4a` |
| `--color-neutral-9` | Standard text / headers | `#333333` |
| `--color-neutral-10` | Primary text / high-contrast titles | `#1a1a1a` |

### Brand & Semantic Colors
Used for actions, status indicators, and selected states.

| CSS Variable | Description | Default (Light) |
| :--- | :--- | :--- |
| `--color-primary` | Primary action color / active state indicator | `#1068eb` |
| `--color-primary-selected` | Background for selected elements | `#e7f0fd` |
| `--color-primary-hover` | Hover state for primary actions | `#0d52ba` |
| `--color-secondary` | Secondary action text & icons | `#4a5673` |
| `--color-error` | Destructive actions, validation errors | `#db3c3c` |
| `--color-success` | Success confirmations & valid states | `#2e7d32` |
| `--color-warning` | Warning state alerts | `#f9a825` |

### Typography
| CSS Variable | Description | Default |
| :--- | :--- | :--- |
| `--font-family` | Base font family | `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |

---

## Example Implementations

### 1. Simple Brand Accent Override
If you want to keep the clean grey/zinc UI but change only the primary accent color to a custom brand color (e.g., Purple):

```css
:root {
  --color-primary: oklch(0.584 0.235 292.8);          /* Royal Purple */
  --color-primary-hover: oklch(0.485 0.221 292.8);    /* Darker Purple */
  --color-primary-selected: oklch(0.94 0.02 292.8);   /* Soft Tint */
}
```

### 2. Creating a Custom Dark Mode Theme
Apply this block under a `.dark` class or `[data-theme="dark"]` attribute wrapper:

```css
.dark {
  --color-neutral-0: oklch(0.153 0.006 107.1);
  --color-neutral-1: oklch(0.228 0.013 107.4);
  --color-neutral-2: oklch(0.286 0.016 107.4);
  --color-neutral-3: oklch(1 0 0 / 10%);
  --color-neutral-4: oklch(1 0 0 / 15%);
  --color-neutral-5: oklch(0.466 0.025 107.3);
  --color-neutral-6: oklch(0.58 0.031 107.3);
  --color-neutral-7: oklch(0.737 0.021 106.9);
  --color-neutral-8: oklch(0.88 0.011 106.6);
  --color-neutral-9: oklch(0.93 0.007 106.5);
  --color-neutral-10: oklch(0.988 0.003 106.5);

  --color-primary: oklch(0.93 0.007 106.5);
  --color-primary-selected: oklch(0.286 0.016 107.4);
  --color-primary-hover: oklch(0.988 0.003 106.5);
  --color-secondary: oklch(0.737 0.021 106.9);
  
  --color-error: oklch(0.704 0.191 22.216);
}
```
