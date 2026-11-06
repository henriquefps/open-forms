# Changelog

All notable changes to OpenForms. Versions follow [semantic versioning](https://semver.org/); tags have no `v` prefix, so the CDN URL for a version is `https://cdn.jsdelivr.net/gh/henriquefps/open-forms@<version>/src/...`. The full notes for each version are on the [GitHub releases page](https://github.com/henriquefps/open-forms/releases).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.6.0] - 2026-11-06

### Added
- `capture` on `file` fields: `"picker"` (default), `"camera"` (browser camera through the standard `capture` attribute) or `"host"` (the host app captures the file, for example with a Cordova or Capacitor camera plugin, so it never passes through JavaScript). New renderer option `captureProvider(field, { locale, signal, onProgress })`; it resolves to the same reference as `uploadProvider`. Without a provider a `"host"` field falls back to the file picker.
- Builder: a "Capture" select in the properties of a file field.
- `validateSchema` checks `capture` (`invalid-capture`).

## [1.5.3] - 2026-11-05

### Fixed
- A callback that throws no longer breaks the component: the builder keeps redrawing after an `onSchemaChange` error, and the renderer keeps working after an error in `onFieldChange`, `onPageChange` or `onValidationError`. The error is logged to the console.

## [1.5.2] - 2026-11-04

### Fixed
- Repeater item rows that render nothing no longer leave an empty gap; item rows collapse and keep their columns in place exactly like top-level rows, also in read-only view and `print()`.

## [1.5.1] - 2026-11-04

### Documentation
- Documentation refresh; repository icon and social preview image.
- New README with a quick start, and this changelog.
- Schema Reference: complete renderer options and methods summary; `matrix` is not supported inside a `repeater`; rules on repeater sub-fields are written in the JSON (the builder hides the rules panel for them); `gte` / `lte` aliases.
- OutSystems guide: save with `getSchema()` / `markSaved()`, empty number answers are `null`, full option and method lists.

No change to the component code.

## [1.5.0] - 2026-11-04

### Added
- Page branching: pages accept `conditionalRules` (visibility). Hidden pages are skipped by navigation, step tabs, validation and `print()`. New `getVisiblePages()`; `goToPage()` returns `false` for a hidden page.
- Drafts: `getDraft()`, `restoreDraft()`, `clearDraft()`, `onDraftChange`, built-in `draftStorage` (`'local'`, `'session'` or an adapter), `draftKey` and `resumeDraft: 'ask' | 'auto' | 'never'`.
- 14 more design tokens (59 `--of-*` tokens in total).
- `AI_SCHEMA_PROMPT.md`, a system prompt for drafting schemas with an AI assistant.

### Changed
- Default error colour `#d43838` (was `#db3c3c`) so error text meets WCAG AA on white.

## [1.4.0] - 2026-11-04

### Added
- `uploadProvider(file, { field, locale, signal, onProgress })`: files go to your backend or upload queue and the answer holds only a small reference. Progress, cancel and retry.
- `onFileRemoved(reference, { field, reason })` so you can delete removed files on your server.

## [1.3.0] - 2026-11-04

### Added
- Builder options: `schema`, `fieldTypes`, `readOnly`, `locales`, `confirm`, `prompt`.
- Every built-in text is translatable in both components (English, pt-BR, es-ES).

### Changed
- Repeater sub-fields evaluate their own `conditionalRules` per item.
- Calculated number fields show the locale number format.
- Masks: `a` accepts any Unicode letter, `*` any letter or digit.
- Dropped files are checked against `acceptedTypes`.
- The builder uses its own accessible dialogs instead of `window.confirm` / `window.prompt`.

### Fixed
- pt-BR dictionary when the locale is set in the constructor; signature pad sharpness and performance; masks inside repeaters.

## [1.2.0] - 2026-11-04

### Added
- Renderer API: `validate()`, `submit()`, `getAnswers()`, `setValue()`, `goToPage()`, `onPageChange`, `onValidationError`, `idPrefix`.
- Builder API: `getSchema()`, `isDirty()`, `markSaved()`.
- `schemaVersion` with migrations, and `validateSchema()` on both classes.
- TypeScript declarations (`src/openforms.d.ts`), built-in SVG icons, safe double loading and `require()` support.

### Changed
- `number` answers are numbers, or `null` when empty.
- `onFieldChange(answers, changedKey)` receives a copy; `render()` never modifies your objects.
- Formulas use a dedicated parser instead of `new Function` (works under a strict Content-Security-Policy).
- CSS is scoped to OpenForms and its tokens are namespaced `--of-*`; nothing on the host page is styled.
- No external requests by default: the handwriting font is opt-in through `handwritingFontUrl`.

## [1.1.1] - 2026-11-04

### Documentation
- The OutSystems integration guide is published, with corrected `$actions` usage and file answer shapes.

## [1.1.0] - 2026-11-04

### Added
- `renderer.print({ title })`: client-side print and "Save as PDF".
- `optionsProvider(field, { locale, readOnly })` for options loaded from your API.
- `destroy()` on both classes, and `VERSION` on both classes.

### Changed
- `optionsType: 'api'` no longer shows mock options; `paragraph` is plain text.
- The builder keeps rules consistent when a field is renamed or deleted.

### Security
- HTML escaping of every schema and user string in both components.

## [1.0.7] - 2026-07-04

### Added
- Builder translations for the rules and validation panels; `builder-translations.json` and `renderer-translations.json`.

## [1.0.6] - 2026-07-03

### Added
- Visual editors for static options, cross-field validations and field-to-field rule comparisons; hidden calculated fields (`isVisibleOnForm`).

### Fixed
- Repeater values kept when items are added or removed; date comparisons; listener leaks in the live preview; validation of pages that are not visible.

## [1.0.5] - 2026-06-28

### Added
- `customization.md`, the theming guide.

## [1.0.4] - 2026-06-25

### Changed
- File sizes are formatted in the renderer; long titles no longer overflow in the builder.

## [1.0.3] - 2026-06-15

### Fixed
- Signature and file fields inside repeaters.

### Changed
- The builder hides the rules panel for fields inside a repeater.

## [1.0.2] - 2026-06-14

First published release of the builder and renderer (see the [1.0.0 release](https://github.com/henriquefps/open-forms/releases)).

## [1.0.0] - 2026-06-14

Initial tag.

[1.5.3]: https://github.com/henriquefps/open-forms/releases/tag/1.5.3
[1.5.2]: https://github.com/henriquefps/open-forms/releases/tag/1.5.2
[1.5.1]: https://github.com/henriquefps/open-forms/releases/tag/1.5.1
[1.5.0]: https://github.com/henriquefps/open-forms/releases/tag/1.5.0
[1.4.0]: https://github.com/henriquefps/open-forms/releases/tag/1.4.0
[1.3.0]: https://github.com/henriquefps/open-forms/releases/tag/1.3.0
[1.2.0]: https://github.com/henriquefps/open-forms/releases/tag/1.2.0
[1.1.1]: https://github.com/henriquefps/open-forms/releases/tag/1.1.1
[1.1.0]: https://github.com/henriquefps/open-forms/releases/tag/1.1.0
[1.0.7]: https://github.com/henriquefps/open-forms/releases/tag/1.0.7
[1.0.6]: https://github.com/henriquefps/open-forms/releases/tag/1.0.6
[1.0.5]: https://github.com/henriquefps/open-forms/releases/tag/1.0.5
[1.0.4]: https://github.com/henriquefps/open-forms/releases/tag/1.0.4
[1.0.3]: https://github.com/henriquefps/open-forms/releases/tag/1.0.3
[1.0.2]: https://github.com/henriquefps/open-forms/releases/tag/1.0.2
[1.0.0]: https://github.com/henriquefps/open-forms/tree/1.0.0
