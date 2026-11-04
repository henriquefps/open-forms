# Customization Guide

This guide explains how to style **OpenForms** with CSS custom properties (CSS variables), and what `openforms.css` does and doesn't touch on your page.

## What the stylesheet touches

`openforms.css` only styles OpenForms' own elements. Every rule sits under one of the component roots:

| Root | Rendered by |
| :--- | :--- |
| `.builder-layout` | `OpenFormBuilder` (the designer) |
| `.renderer-sandbox` | `OpenFormRenderer` (the form player) |
| `.lightbox-overlay` | the renderer's image preview, appended to `<body>` |
| `.openforms-action-sheet-backdrop` | the renderer's mobile "camera / file" picker, appended to `<body>` |
| `#openforms-print-root` | the snapshot drawn by `renderer.print()` |
| `.openforms-toast-container` | the builder's toast container, appended to `<body>` (`#toast-container` carries the tokens for a host-provided one) |

So the stylesheet doesn't:

- define or change any variable on `:root`. All of its tokens are named `--of-*` and live on the roots above.
- style your page's own `input[type=checkbox]`, `input[type=radio]`, `button:disabled`, focus outlines, `.sr-only`, `.pg-btn` or `.is-disabled`.
- apply any builder rule on a page that only loads the renderer. Builder rules all sit under `.builder-layout`.

The one exception is printing. While `renderer.print()` is pending, `<html>` gets the class `openforms-printing` and `@media print` hides the rest of the page (see the Integration Guide).

Rules are scoped with `:where(<root>) .selector`. `:where()` adds no specificity, so your overrides of OpenForms classes win exactly as they did before scoping.

## Design tokens

Every token is declared on the component roots. They fall into two groups.

**Colours and border radii inherit from the host.** These read the **same-named OutSystems UI token** first, and the literal is used only when your page doesn't define it:

```css
--of-color-primary: var(--color-primary, #1068eb);
--of-border-radius-soft: var(--border-radius-soft, 8px);
```

Colours and corner style are what make a form look like part of your app (brand colour, neutrals, light or dark theme, rounded or square). Following the app's tokens gives that without any setup:

- **OutSystems UI apps** get the app theme's palette and radii automatically.
- **Other hosts** that already define variables with those names (on `:root` or any ancestor of the container) theme OpenForms through them, as before.
- **Hosts that define none of them** get the defaults below.

**Spacing, typography and shadows use OpenForms' own values.** `--of-space-*`, `--of-font-family`, `--of-font-size-*`, `--of-font-weight-*` and `--of-shadow-*` are plain values and never read host tokens:

```css
--of-space-m: 12px;
--of-font-size-base: 14px;
```

The builder and renderer layouts (field grid, card padding, label sizes, the builder's three panels) are tuned to this scale. A host whose `--space-m` or `--font-size-base` means something else would make forms looser, tighter or overflow, so these tokens stay fixed. To change them, set the `--of-*` tokens on the roots (see "Theming only OpenForms" below).

### Neutral Scale (Neutral 0 to 10)

Used for backgrounds, borders, inputs, and text hierarchies.

| OpenForms token | Reads first | Description | Default |
| :--- | :--- | :--- | :--- |
| `--of-color-neutral-0` | `--color-neutral-0` | Main canvas/farthest background | `#ffffff` |
| `--of-color-neutral-1` | `--color-neutral-1` | Light backgrounds / sidebar | `#fafafb` |
| `--of-color-neutral-2` | `--color-neutral-2` | Secondary surfaces / muted elements | `#f5f6f8` |
| `--of-color-neutral-3` | `--color-neutral-3` | Standard borders | `#eeeeee` |
| `--of-color-neutral-4` | `--color-neutral-4` | Focused/interacted borders & dividers | `#dedede` |
| `--of-color-neutral-5` | `--color-neutral-5` | Secondary borders / ring indicators | `#b0b0b0` |
| `--of-color-neutral-6` | `--color-neutral-6` | Placeholder & muted text | `#a0a0a0` |
| `--of-color-neutral-7` | `--color-neutral-7` | Muted/disabled labels and metadata | `#666666` |
| `--of-color-neutral-8` | `--color-neutral-8` | Secondary body text | `#4a4a4a` |
| `--of-color-neutral-9` | `--color-neutral-9` | Standard text / headers | `#333333` |
| `--of-color-neutral-10` | `--color-neutral-10` | Primary text / high-contrast titles | `#1a1a1a` |

### Brand & Semantic Colors

| OpenForms token | Reads first | Description | Default |
| :--- | :--- | :--- | :--- |
| `--of-color-primary` | `--color-primary` | Primary action color / active state indicator | `#1068eb` |
| `--of-color-primary-selected` | `--color-primary-selected` | Background for selected elements | `#e7f0fd` |
| `--of-color-primary-hover` | `--color-primary-hover` | Hover state for primary actions | `#0d52ba` |
| `--of-color-secondary` | `--color-secondary` | Secondary action text & icons | `#4a5673` |
| `--of-color-error` | `--color-error` | Destructive actions, validation errors | `#d43838` |
| `--of-color-success` | `--color-success` | Success confirmations & valid states | `#2e7d32` |
| `--of-color-warning` | `--color-warning` | Warning state alerts | `#f9a825` |

### Typography

Own values: these don't read `--font-*` from the host.

| OpenForms token | Description | Default |
| :--- | :--- | :--- |
| `--of-font-family` | Base font family | `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| `--of-font-size-xs` | Micro text: chips, badges, helper hints | `11px` |
| `--of-font-size-s` | Small text: labels, secondary UI copy | `13px` |
| `--of-font-size-base` | Default body/input text size | `14px` |
| `--of-font-size-m` | Section/subsection titles | `16px` |
| `--of-font-weight-normal` | Body text | `400` |
| `--of-font-weight-medium` | Buttons, emphasized labels | `500` |
| `--of-font-weight-semibold` | Field labels, card titles | `600` |
| `--of-font-weight-bold` | Section titles, headings | `700` |

### Spacing Scale

Used across the builder and renderer for padding, gaps and margins. Own values: these don't read `--space-*` from the host.

| OpenForms token | Description | Default |
| :--- | :--- | :--- |
| `--of-space-xs` | Tightest spacing: icon gaps, chip padding | `4px` |
| `--of-space-s` | Compact spacing: form control internal padding | `8px` |
| `--of-space-m` | Standard spacing: card padding, list gaps | `12px` |
| `--of-space-base` | Default spacing: section padding, button padding | `16px` |
| `--of-space-l` | Loose spacing: panel margins | `24px` |
| `--of-space-xl` | Widest spacing: page/card outer padding | `32px` |

### Border Radius

| OpenForms token | Reads first | Description | Default |
| :--- | :--- | :--- | :--- |
| `--of-border-radius-xs` | `--border-radius-xs` | Chips, small badges | `4px` |
| `--of-border-radius-s` | `--border-radius-s` | Inputs, buttons | `6px` |
| `--of-border-radius-m` | `--border-radius-m` | Standard rounding | `8px` |
| `--of-border-radius-soft` | `--border-radius-soft` | Cards, panels | `8px` |
| `--of-border-radius-l` | `--border-radius-l` | Larger cards | `12px` |
| `--of-border-radius-pill` | `--border-radius-pill` | Fully rounded pill buttons/badges | `50px` |

### Shadows

Own values: these don't read `--shadow-*` from the host.

| OpenForms token | Description | Default |
| :--- | :--- | :--- |
| `--of-shadow-sm` | Subtle elevation: inputs, small cards | `0 1px 3px rgba(0, 0, 0, 0.1)` |
| `--of-shadow-md` | Standard elevation: panels, dropdowns | `0 4px 6px rgba(0, 0, 0, 0.1)` |
| `--of-shadow-lg` | Prominent elevation: modals, the renderer form card | `0 10px 15px rgba(0, 0, 0, 0.15)` |

### Borders, focus ring, inputs and the form card

These tokens were added so the usual brand decisions don't need selector overrides. Their defaults reproduce the previous look exactly. The ones marked *alias* are derived from another token by default, so they follow it until you set them on their own. Like spacing and typography, they never read host tokens.

| OpenForms token | Description | Default |
| :--- | :--- | :--- |
| `--of-border-width` | Width of input, card and divider borders | `1px` |
| `--of-color-border` | Colour of input, card and divider borders (*alias* of `--of-color-neutral-4`) | `#dedede` |
| `--of-color-border-subtle` | Lighter dividers (*alias* of `--of-color-neutral-3`) | `#eeeeee` |
| `--of-focus-ring-color` | Keyboard focus outline colour (*alias* of `--of-color-primary`) | `#1068eb` |
| `--of-focus-ring-width` | Keyboard focus outline width | `2px` |
| `--of-focus-ring-offset` | Gap between the element and its focus outline | `2px` |
| `--of-focus-halo-color` | Soft glow around the focus outline (*alias* of `--of-color-primary-selected`) | `#e7f0fd` |
| `--of-focus-halo-width` | Width of that glow; `0px` turns it off | `3px` |
| `--of-input-bg` | Input background (*alias* of `--of-color-neutral-0`) | `#ffffff` |
| `--of-input-color` | Input text (*alias* of `--of-color-neutral-10`) | `#1a1a1a` |
| `--of-input-padding-y` | Input vertical padding | `10px` |
| `--of-card-bg` | Form card background (*alias* of `--of-color-neutral-0`) | `#ffffff` |
| `--of-card-padding` | Form card padding (*alias* of `--of-space-xl`) | `32px` |
| `--of-card-shadow` | Form card shadow | `0 4px 16px rgba(0, 0, 0, 0.05)` |

### OpenForms-only tokens

These have no OutSystems UI equivalent, so they don't read a host variable either. To change them, set them on the roots (see "Theming only OpenForms" below).

| OpenForms token | Description | Default |
| :--- | :--- | :--- |
| `--of-border` | Hairline borders on the image lightbox and a few dashed drop zones | `rgba(255, 255, 255, 0.08)` |
| `--of-text-primary` | Lightbox close button | `#f3f4f6` |
| `--of-text-secondary` | Lightbox caption | `#9ca3af` |

---

## Theming

### 1. Through your existing (OutSystems UI) tokens

You don't need to do anything. If your page sets `--color-primary`, `--color-neutral-*`, `--border-radius-soft` and so on, OpenForms follows them. Spacing and typography tokens on your page are ignored (see above).

```css
:root {
  --color-primary: oklch(0.584 0.235 292.8);          /* Royal Purple */
  --color-primary-hover: oklch(0.485 0.221 292.8);
  --color-primary-selected: oklch(0.94 0.02 292.8);
}
```

### 2. Theming only OpenForms

Each `--of-*` token is declared on the component roots themselves, so setting an `--of-*` variable on `:root` has **no effect**: the root's own declaration wins over the inherited value. Pick one of these instead.

For colours and radii, set the OutSystems UI-named tokens on **the container you pass to the builder/renderer**. They only reach OpenForms, not the rest of your page:

```css
#my-form-container {
  --color-primary: #c2185b;
  --border-radius-soft: 4px;
}
```

Or target the roots directly. This is the only way to change spacing, typography, shadows and the OpenForms-only tokens, and also how to give OpenForms colours that differ from your app's tokens of the same name:

```css
.builder-layout,
.renderer-sandbox,
.lightbox-overlay,
.openforms-action-sheet-backdrop {
  --of-color-primary: #c2185b;
  --of-space-m: 10px;
  --of-font-size-base: 15px;
  --of-border: #e4e4e7;
}
```

The lightbox and the mobile picker are appended to `<body>`, outside your container. If you theme through the container, also include `.lightbox-overlay` and `.openforms-action-sheet-backdrop` when you want those to match.

### 3. A dark theme

Apply the OutSystems UI-named tokens under a class or attribute on any ancestor of the container (e.g. `<html class="dark">`):

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

### 4. Adjusting density (spacing & radius)

For a more compact UI (e.g. inside a dense admin dashboard), set the `--of-*` spacing and radius tokens on the roots. Spacing has to be set as `--of-*`, because OpenForms ignores the host's `--space-*`:

```css
.builder-layout,
.renderer-sandbox {
  --of-space-xs: 3px;
  --of-space-s: 6px;
  --of-space-m: 10px;
  --of-space-base: 12px;
  --of-space-l: 18px;
  --of-space-xl: 24px;

  --of-border-radius-xs: 3px;
  --of-border-radius-s: 4px;
  --of-border-radius-m: 6px;
  --of-border-radius-soft: 6px;
}
```

---

## Theme builder (Playground)

The Playground has a **Customize** button next to the theme selector. It opens a panel that edits every token above with a live preview of both the designer and the form:

- **Presets** to start from: the four page themes (Lime Dark, Lime Light, Premium Dark, Default Light) and *OutSystems UI*, *Minimal mono*, *Soft pastel*, *High contrast* and *Rounded friendly*. Every preset reaches WCAG AA (4.5:1) for the text pairs the form draws; a test enforces it.
- **Controls**: colour pickers with hex input, sliders for sizes, a font-stack select (system and web-safe stacks only, nothing is downloaded), shadow presets. A contrast list checks the pairs the form draws (text, secondary text, primary, button text, errors) against 4.5:1 and warns next to the colour you are editing.
- **Reset section** and **Reset all** put the values back to the preset you started from.
- **Save** keeps a named theme in this browser (`localStorage`, key `openforms-playground:themes:v1`). Saved themes appear under *My themes* in the theme selector and can be renamed, duplicated, deleted and edited again. The active theme and any unsaved edits survive a reload.
- **Export** gives you the CSS to paste, with two scopes, plus **Copy** and **Download**:
  - *Whole page*: the tokens on the component roots (`.builder-layout`, `.renderer-sandbox`, `.lightbox-overlay`, `.openforms-action-sheet-backdrop`, `#openforms-print-root`, `#toast-container`, `.openforms-toast-container`). Load it after `openforms.css`.
  - *One class*: the tokens under a class of your choice, e.g. `.my-form-theme`. Put the class on the element you pass as `containerEl` and the form picks it up. The roots declare every token on themselves, so the generated selector is `.my-form-theme :is(<roots>)`; a bare `.my-form-theme { --of-color-primary: ... }` would not win. The image viewer, the mobile picker, the print snapshot and the toasts are appended to `<body>`, outside your container: put the class on `<body>` to theme them too.
  - By default only values that differ from the OpenForms defaults are exported, so everything else keeps following your host's tokens.
- **Theme JSON** export/import (format `openforms-theme`, version 1) to share a theme. Import validates every value and refuses anything that is not a known token with a safe value.
- **Get code** can inline the exported theme in the Web snippet when a non-page theme is active.

## Migrating from 1.1.x and earlier

Before this change, `openforms.css` declared the tokens on `:root` with the unprefixed names (`--color-primary`, `--space-m`, …) and styled some elements globally.

- **You themed OpenForms by setting `--color-*` or `--border-radius-*` on `:root` or a wrapper.** Nothing to change: OpenForms still reads those names.
- **You changed OpenForms' spacing or type through `--space-*`, `--font-size-*`, `--font-weight-*`, `--font-family` or `--shadow-*`.** These are no longer read. Set the `--of-*` equivalents on the roots instead (see "Adjusting density").
- **Your own CSS used `var(--color-primary)`, `var(--space-m)` and so on, and relied on `openforms.css` to define them.** Those variables are no longer defined on your page. Define them yourself (OutSystems UI apps already do).
- **Your page relied on OpenForms' global rules**: custom-drawn checkboxes and radios, `button:disabled` dimming, the focus ring, `.sr-only`, `.pg-btn` or `.is-disabled` outside the components. Copy the rules you want into your own stylesheet; they now only apply inside OpenForms.
- **You overrode a token for OpenForms only by declaring `--of-*`-style values on `:root`.** That doesn't work, because the roots declare their own value. Use the container or the roots instead (see "Theming only OpenForms").
- **OutSystems apps.** Previously, when `openforms.css` was pasted into the Theme style sheet, its `:root` block could override the app theme's tokens, both in OpenForms and in the rest of the app. Now the app keeps its own tokens, and OpenForms follows the app's colours and border radii while keeping its own spacing and type scale. To keep OpenForms' old colours instead, set the `--of-color-*` tokens on the roots.
