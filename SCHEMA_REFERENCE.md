# OpenForms — Schema Reference

This is the complete reference for `FormSchemaJSON`, the plain JSON object that both `OpenFormBuilder` and `OpenFormRenderer` consume. Every property listed here was verified directly against the current `src/builder.js`/`src/renderer.js` source — not against an older draft.

---

## 1. Top-Level Object

```json
{
  "schemaVersion": 2,
  "formTitle": "Employee Onboarding Form",
  "formDescription": "Please fill in all fields before your first day.",
  "pages": [ /* Page[] */ ],
  "crossFieldRules": [ /* CrossFieldRule[], optional */ ],
  "translations": { /* optional, see section 7 */ }
}
```

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `schemaVersion` | `integer` | written by the builder | Format version of the schema (currently `2`). A schema without it is version 1 (the older forms). See "Schema version and migrations" below |
| `formId` | `string` | optional | A stable identifier you choose for the form. Not shown; the renderer uses it only for the default draft storage key (and puts it in drafts). The builder keeps it as is |
| `formTitle` | `string` | recommended | The form's heading |
| `formDescription` | `string` | optional | Subtitle displayed below the title |
| `pages` | `Page[]` | recommended | Array of pages. A single page renders without a step/progress bar; 2+ pages get one automatically |
| `crossFieldRules` | `CrossFieldRule[]` | optional | Validation rules that compare two or more fields (see section 6) |
| `translations` | `object` | optional | Locale-keyed dictionary for multi-language forms (see section 7) |

> You don't have to hand-build this structure — `OpenFormBuilder.normalizeSchema()` fills in every missing/legacy piece (default page, default section, generated IDs, etc.) the moment you call `loadSchema()`. Passing `{}` or `null` is valid and produces a single empty page.

### Schema version and migrations

- `OpenFormBuilder` writes `schemaVersion` (currently `2`) on every schema it outputs (`builder.schema`, `getSchema()`, `onSchemaChange`). You never need to set it by hand.
- A schema **without** `schemaVersion` is treated as version 1: the older shapes (flat top-level `rows`, page-level `rows`, `visibilityCondition`, repeater `fields`). When loaded by the builder or rendered by the renderer, `normalizeSchema()` detects the version, runs the ordered, named migration steps from that version up to the current one (today only `1 → 2`, `legacy-shapes`), fills in missing defaults and stamps the current version. Migrated copies are in memory only; your stored JSON is never rewritten until you save what the builder gives you.
- **Migration policy:** a change that breaks the shape of existing schemas bumps `schemaVersion` and ships a new step; steps are never edited after release, and old versions keep loading. Purely additive properties do not bump the version.
- A schema with a **newer** `schemaVersion` than the build supports is rendered best-effort (no migrations run, its version is kept). The renderer logs a single `console.warn` (no UI), and `validateSchema()` reports a `newer-schema-version` warning.

### Validating a schema: `validateSchema(schema)`

`OpenFormBuilder.validateSchema(schema)` and `OpenFormRenderer.validateSchema(schema)` are static, identical and side-effect free. They accept raw stored schemas (including legacy shapes) and return:

```js
{
  valid: boolean,                                   // true when `errors` is empty
  errors:   [{ path: 'pages[0].sections[0].rows[1].columns[0].field.key', code: 'duplicate-key', message: '...' }],
  warnings: [{ path, code, message }]               // never make `valid` false
}
```

| Code | Level | Meaning |
| :--- | :--- | :--- |
| `invalid-schema` | error | Not a JSON object |
| `unknown-field-type` | error | Missing or unknown `type`. The renderer shows a translated "Unsupported field type" placeholder and leaves the field out of the answers |
| `missing-key` | error | A data field (anything except `header`/`paragraph`) has no `key` |
| `duplicate-key` | error | Two fields share a key in the same scope. Top-level fields share one scope; a repeater's sub-fields have their own (a sub-field may reuse a top-level key) |
| `unknown-operator` | error | A condition's `operator` is not one of those in section 5. The renderer treats it as **not satisfied** |
| `unknown-field-reference` | error | A rule condition (`dependentFieldKey`, `compareToFieldKey`), a cross-field `targetFields` entry or a `{key}` in a formula/expression names a key that no field has |
| `invalid-width` | error | A column `width` that is not an integer from 1 to 12 |
| `invalid-pages` / `invalid-rows` / `invalid-rules` | error | `pages`, `rows` or `conditionalRules`/`crossFieldRules` is not an array |
| `page-rule-self-reference` / `page-rule-forward-reference` | warning | A page rule depends on a field on the same page / on a later page (section 5, page branching) |
| `missing-options-url` | warning | `optionsType: "api"` without `optionsUrl` |
| `newer-schema-version` / `invalid-schema-version` | warning | `schemaVersion` is newer than supported / not a positive integer |

`OpenFormBuilder.loadSchema()` runs it and, if there are errors, shows a toast summarizing them; the schema still loads so it can be fixed in the editor.

---

## 2. Page → Section → Row → Column

```json
{
  "pageId": "page-001",
  "title": "Personal Information",
  "sections": [
    {
      "sectionId": "sec-001",
      "title": "",
      "conditionalRules": [],
      "rows": [
        {
          "rowId": "row-001",
          "columns": [
            { "width": 6, "field": { "...": "Field object, see section 3" } },
            { "width": 6, "field": { "...": "..." } }
          ]
        }
      ]
    }
  ]
}
```

| Object | Property | Type | Notes |
| :--- | :--- | :--- | :--- |
| **Page** | `pageId` | `string` | Unique. Auto-generated if omitted |
| | `title` | `string` | Shown in the page tabs / step progress bar |
| | `conditionalRules` | `Rule[]` | Optional. Visibility rules for the whole page (page branching, see section 5) |
| | `sections` | `Section[]` | A page is always made of sections, never bare rows |
| **Section** | `sectionId` | `string` | Unique. Auto-generated if omitted |
| | `title` | `string` | Optional visual sub-heading |
| | `conditionalRules` | `Rule[]` | Visibility rules for the whole section (see section 5) |
| | `rows` | `Row[]` | |
| **Row** | `rowId` | `string` | Unique. Auto-generated if omitted |
| | `columns` | `Column[]` | 1–4 columns per row is the practical range |
| **Column** | `width` | `integer` | Grid span out of 12: `3`, `4`, `6`, `8`, `9`, `12` are the values the Builder UI offers |
| | `field` | `Field` | The field placed in this column |

There is no `colId` property on Column — that was a documentation error carried over from an older draft.

---

## 3. Field Object

### Common properties (every field type)

| Property | Type | Notes |
| :--- | :--- | :--- |
| `id` | `string` | Unique DOM identifier, distinct from `key` |
| `key` | `string` | **Answer key** — the property name under which the value is submitted. Not present on `header`/`paragraph` (they submit no value) |
| `type` | `string` | See the Field Types table below |
| `label` | `string` | Field label |
| `required` | `boolean` | Blocks submission if empty. Not present on `header`/`paragraph` |
| `disabled` | `boolean` | Static disabled state, optional (independent from rule-driven disabling — see section 5) |
| `conditionalRules` | `Rule[]` | Visibility/required/disabled rules driven by other fields' answers (see section 5) |

### Field Types Reference

| `type` | Widget | Submitted value shape |
| :--- | :--- | :--- |
| `header` | Section title / visual divider — no answer key, nothing submitted | — |
| `paragraph` | Static text block — no answer key, nothing submitted. Plain text only: HTML is shown literally, line breaks are kept | — |
| `text` | Single-line text input | `string` |
| `textarea` | Multi-line text area | `string` |
| `number` | Numeric input (can be calculated — see section 6) | `number`, or `null` when empty (also inside repeater items; pre-filled strings such as `"42"` are converted on `render()`) |
| `date` | Native date picker | `string` (`YYYY-MM-DD`) |
| `boolean` | Toggle switch | `boolean` |
| `dropdown` | Single-select dropdown | `string` (selected value) |
| `radio` | Radio group (single selection) | `string` (selected value) |
| `checkbox` | Checkbox group (multi-select) | `string[]` |
| `matrix` | Question grid (one selection per row) | `{ [rowKey]: string }` |
| `repeater` | Repeatable list of sub-fields | `Array<{ [subFieldKey]: any }>` — one object per item |
| `signature` | Canvas signature pad | `string` — base64 PNG data URL |
| `file` | File upload | Without an `uploadProvider`: `{ name: string, size: number, type: string, content: string }` — `content` is a base64 data URL (kept in memory and in the submit payload). With an `uploadProvider`: the **FileReference** the host returned, `{ name, size, type, url?, id?, ...extra }`, with no `content`. Never a raw browser `File` object. Empty: `""` |

### Type-specific properties

| Field type | Extra properties |
| :--- | :--- |
| `header` | `subtitle` (`string`, optional) |
| `text` | `placeholder`, `mask` (custom mask pattern, `9`=digit/`a`=any letter, including accented and non-Latin ones/`*`=letter or digit), `maskCleanValue` (`boolean`, strip mask chars before storing), `validationRegex`, `errorMessage` |
| `textarea` | `placeholder` |
| `number` | `placeholder`, `mask`, `maskCleanValue`, `isCalculated` (`boolean`), `formulaExpression` (`string`, see section 6), `isVisibleOnForm` (`boolean`, default `true` — only meaningful when `isCalculated` is `true`) |
| `boolean` | `defaultValue` (`boolean`) |
| `dropdown` / `radio` / `checkbox` | `optionsType` (`"static"` \| `"api"`), `options` (`Array<{label, value}>`, when static), `optionsUrl` (`string`, when `api` — an identifier handed to your `optionsProvider`; the renderer never fetches it itself, see section 8) |
| `matrix` | `matrixRows` (`Array<{key, label}>`), plus the same `optionsType`/`options`/`optionsUrl` as above (shared across every row) |
| `repeater` | `minItems`, `maxItems` (`integer`), `addButtonLabel` (`string`), `rows` (`Row[]` — the sub-field layout repeated per item; only `text`/`textarea`/`number`/`date`/`boolean`/`dropdown`/`radio`/`checkbox`/`matrix`/`signature`/`file` are supported inside a repeater, **not** another `repeater` or nested `matrix`) |
| `signature` | *(no extra properties)* |
| `file` | `acceptedTypes` (`string`, comma-separated extensions/MIME patterns such as `.pdf,image/*`, default `.pdf,.docx,image/*`; enforced by the file picker and also for dragged-and-dropped files), `useNativeCamera` (`boolean`, Cordova/Capacitor), `nativeCameraSource` (`"camera"` \| `"photos"` \| `"prompt"`: camera only, photo library only, or ask each time; default `"camera"`), `maxFileSizeMB` (`number`, default `5`), `fileRequirementsText` (`string`, optional override of the default hint text) |

---

## 4. A Complete Example

```json
{
  "formTitle": "Project Timeline & Resource Allocation",
  "pages": [
    {
      "pageId": "page-1",
      "title": "Project Scope",
      "sections": [
        {
          "sectionId": "sec-1",
          "rows": [
            {
              "rowId": "row-1",
              "columns": [
                { "width": 6, "field": { "id": "f-start", "key": "startDate", "type": "date", "label": "Start Date", "required": true } },
                { "width": 6, "field": { "id": "f-end", "key": "endDate", "type": "date", "label": "End Date", "required": true } }
              ]
            },
            {
              "rowId": "row-2",
              "columns": [
                { "width": 12, "field": {
                  "id": "f-notify",
                  "key": "sendReminder",
                  "type": "boolean",
                  "label": "Send a reminder before the deadline?"
                } },
                { "width": 12, "field": {
                  "id": "f-days",
                  "key": "reminderDays",
                  "type": "number",
                  "label": "Days before deadline",
                  "required": true,
                  "conditionalRules": [
                    {
                      "targetProperty": "visibility",
                      "andGroups": [
                        { "conditions": [ { "dependentFieldKey": "sendReminder", "operator": "equals", "equalsValue": true } ] }
                      ]
                    }
                  ]
                } }
              ]
            }
          ]
        }
      ]
    }
  ],
  "crossFieldRules": [
    {
      "ruleId": "cfr-dates-1",
      "targetFields": ["startDate", "endDate"],
      "andGroups": [
        {
          "conditions": [
            { "dependentFieldKey": "endDate", "operator": "lessThan", "compareMode": "field", "compareToFieldKey": "startDate" }
          ]
        }
      ],
      "errorMessage": "End date cannot be before the start date."
    }
  ]
}
```

This shows the two conditional-logic mechanisms side by side: `reminderDays` only appears when `sendReminder` is checked (field-level `conditionalRules`, section 5), and the cross-field rule blocks submission when `endDate` is before `startDate` (section 6).

---

## 5. Conditional Business Rules (`conditionalRules`)

Used on **Field** objects (any `targetProperty`), **Section** objects and **Page** objects (visibility only) to react to another field's answer.

```json
{
  "targetProperty": "visibility",
  "andGroups": [
    { "conditions": [ /* Condition[] — ANY one satisfies this group (OR) */ ] },
    { "conditions": [ /* another group — ALL groups must be satisfied (AND) */ ] }
  ]
}
```

| Rule property | Type | Notes |
| :--- | :--- | :--- |
| `targetProperty` | `string` | `"visibility"` \| `"required"` \| `"disabled"`. Sections and pages only ever use `"visibility"` |
| `andGroups` | `AndGroup[]` | The rule is satisfied when **every** group has **at least one** satisfied condition — AND between groups, OR within a group |

### Condition object

| Property | Type | Notes |
| :--- | :--- | :--- |
| `dependentFieldKey` | `string` | The field whose current answer is checked |
| `operator` | `string` | `equals` \| `notEquals` \| `contains` \| `notContains` \| `greaterThan` \| `greaterThanOrEquals` \| `lessThan` \| `lessThanOrEquals` |
| `compareMode` | `string` | `"value"` (default) \| `"field"` |
| `equalsValue` | `any` | The static value to compare against — used when `compareMode` is `"value"` or omitted |
| `compareToFieldKey` | `string` | Another field's key to compare against live — used when `compareMode` is `"field"` |

**Rules on repeater sub-fields.** A sub-field inside a repeater can carry `conditionalRules` too. They are evaluated **per item**: `dependentFieldKey` (and `compareToFieldKey`) naming another sub-field of the same repeater reads that item's value; any other key reads the form's top-level answer. So in one item a field can be shown while in the next it is hidden. A hidden sub-field is reset and left out of `getAnswers()` / `onSubmit` (same as a hidden top-level field), its required asterisk and `aria-required` follow `"required"` rules, and a hidden or disabled sub-field is not required when validating. Rules are re-evaluated on every change and when items are added or removed.

### Page branching (rules on a page)

A `Page` can carry `conditionalRules` with `"targetProperty": "visibility"`, written exactly like the rules of a section or field (same `andGroups`, same operators). A page with no visibility rule is always shown; with rules it is shown when **any** of them is satisfied. This is how a form skips ahead: **"if the answer on page 1 is No, jump to page 4" means pages 2 and 3 are hidden when the answer is No.**

```json
{
  "pages": [
    { "pageId": "page-1", "title": "Interest", "sections": [ /* radio "interested" Yes / No */ ] },
    { "pageId": "page-2", "title": "Details",
      "conditionalRules": [ { "targetProperty": "visibility", "andGroups": [ { "conditions": [ { "dependentFieldKey": "interested", "operator": "equals", "equalsValue": "Yes" } ] } ] } ],
      "sections": [ /* ... */ ] },
    { "pageId": "page-3", "title": "Budget",
      "conditionalRules": [ { "targetProperty": "visibility", "andGroups": [ { "conditions": [ { "dependentFieldKey": "interested", "operator": "equals", "equalsValue": "Yes" } ] } ] } ],
      "sections": [ /* ... */ ] },
    { "pageId": "page-4", "title": "Contact", "sections": [ /* always shown */ ] }
  ]
}
```

A hidden page behaves as follows, re-evaluated live as the answers change:

- **Navigation:** Next/Previous go to the next/previous visible page; the step tabs list only the visible pages, numbered `1..n` again, and the progress bar and the "Step x of n" header count visible pages. The Submit button is on the last visible page. A form whose pages are all hidden but one becomes a single-page form.
- **Current page hidden:** if an answer hides the page the user is on (for example after `setValue()`), the form moves to the nearest previous visible page (or the next one if there is none before it) and fires `onPageChange`.
- **Answers:** fields on a hidden page are not validated and are left out of `getAnswers()` / `onSubmit`. As with a hidden field or section, their answers are **reset** when the page becomes hidden (an uploaded file reference is reported through `onFileRemoved` with reason `"hidden"`), so showing the page again starts empty.
- **API:** `goToPage(index)` returns `false` for a hidden page, `getVisiblePages()` returns the visible indices, `getDraft().pageIndex` stays the absolute index in `pages` and `restoreDraft()` onto a hidden page opens the nearest visible one. `print()` leaves hidden pages out.
- **Which fields a page rule can use:** answers from **earlier pages**. A page rule that depends on a field on its own page is meaningless (the page would hide itself while it is being answered) and one that depends on a later page reads an answer that does not exist yet the first time through; `validateSchema()` warns about both (`page-rule-self-reference`, `page-rule-forward-reference`). The Builder only offers fields of earlier pages.
- **Schema version:** unchanged (`schemaVersion` 2): `conditionalRules` on a page is purely additive, and a renderer from before this feature ignores it and shows every page.

The `greaterThan`/`lessThan` family of operators is date-aware: `"2026-07-01"` compares chronologically against `"2026-06-30"`, not lexicographically.

> **Legacy format:** older schemas may carry a `visibilityCondition` object directly on a Field/Section instead of `conditionalRules`. `normalizeSchema()` migrates this automatically into the `andGroups` format on load — you never need to write `visibilityCondition` in a new schema.

---

## 6. Cross-Field Validations (`crossFieldRules`)

Root-level array for rules that compare **multiple fields against each other** before allowing submission (e.g. "end date must not be before start date", "these three percentages must not sum above 100"). Uses the exact same `andGroups`/`Condition` shape as section 5.

| Property | Type | Notes |
| :--- | :--- | :--- |
| `ruleId` | `string` | Unique identifier |
| `targetFields` | `string[]` | Field keys that get marked invalid when this rule fires |
| `andGroups` | `AndGroup[]` | The rule is **invalid** (blocks submission) when every group has at least one satisfied condition |
| `errorMessage` | `string` | Shown next to each target field when the rule fires |

> An `andGroups` array present but empty (`[]`) is inert by design — it never blocks submission. This matters if you're generating schemas programmatically: don't emit a rule with zero groups expecting it to validate anything.

> **Legacy format:** old rules may carry a free-text `expression` string instead of `andGroups` (e.g. `"{endDate} >= {startDate}"`). The renderer still evaluates these for backwards compatibility, but new schemas should use `andGroups`.

### Calculated fields feeding a cross-field rule

A `number` field can be `isCalculated: true` with a `formulaExpression`, and optionally `isVisibleOnForm: false` to compute a value silently (e.g. a running total) without rendering it as a visible input — useful when the only reason the field exists is to be a `dependentFieldKey`/`targetFields` entry in a rule.

```json
{
  "id": "f-total", "key": "totalShare", "type": "number",
  "isCalculated": true, "isVisibleOnForm": false,
  "formulaExpression": "{devShare} + {pmShare} + {qaShare}"
}
```

`formulaExpression` supports: arithmetic (`+ - * / %`, and `**`), unary `-`/`+`/`!`, parentheses, comparisons (`> < >= <= == != === !==`), the ternary operator (`condition ? a : b`), and `Math.min`, `Math.max`, `Math.round`, `Math.abs`, `Math.floor`, `Math.ceil` (comma-separated arguments). Operator precedence and results are the same as in JavaScript. Anything outside that character set is rejected and the expression evaluates to `0` — this is a hard allow-list, not a best-effort filter. The result is rounded to 2 decimal places; division by zero, `NaN`, invalid syntax and any other error also give `0`.

Legacy cross-field `expression` rules use the same grammar plus `&&`, `||` (and the bitwise `&`, `|`). Each `{fieldKey}` is replaced by the field's number (booleans become `1`/`0`, `YYYY-MM-DD` dates become milliseconds, empty values and text that isn't a number become `0`). An expression that is invalid or errors counts as **failed**, so the rule shows its error.

**Content-Security-Policy:** formulas and expression rules are parsed and evaluated by the renderer itself, with no `eval` or `new Function`. They work under a strict CSP such as `script-src 'self'` (no `'unsafe-eval'` needed). The renderer never looks up properties on arbitrary objects; it can only call the six `Math` functions listed above.

> **Changed in the CSP-safe evaluator:** a few JavaScript constructs the allow-listed characters could spell by accident are now rejected instead of run: arrow functions (`()=>1`), regex literals (`/1/`), spread (`...`), HTML-style comments (`<!--`, `-->`) and assignments (`Math.max = 5`, which used to overwrite the page's global `Math.max`). A formula using one of these gives `0`, and a rule using one fails. Nothing in the documented grammar is affected.

---

## 7. Translations

```json
{
  "translations": {
    "pt-BR": {
      "form": { "formTitle": "Formulário de Contacto" },
      "pages": { "page-001": { "title": "Informação Pessoal" } },
      "sections": { "sec-001": { "title": "Dados de Contacto" } },
      "fields": {
        "full_name": { "label": "Nome Completo", "placeholder": "ex. João Silva", "errorMessage": "Use apenas letras." }
      },
      "crossFieldRules": {
        "cfr-dates-1": { "errorMessage": "A data final não pode ser anterior à inicial." }
      }
    }
  }
}
```

Translations are keyed by locale, then by category (`form`, `pages`, `sections`, `fields`, `crossFieldRules`), then by the relevant `pageId`/`sectionId`/field `key`/`ruleId`. Structural properties (database keys, field `type`, operators, target field keys, formula expressions) are **not** translatable by design — only display text (labels, titles, placeholders, error messages, option labels) is. Switch locales at runtime with `renderer.setLocale('pt-BR')`.

A rule's `errorMessage` is translated under `crossFieldRules[ruleId].errorMessage`, and a text field's `errorMessage` (the message for a failed `validationRegex`) under `fields[key].errorMessage`. Without a translation the schema's own message is shown; a rule without any `errorMessage` shows the built-in, translated `crossFieldDefaultError` ("Invalid field combination."). The renderer's own UI texts (buttons, "Yes / No", "Add Item", upload hints, ...) are separate: they come from the built-in dictionaries (English, pt-BR, es-ES) and can be overridden with the `translations` constructor option — see `docs/renderer-translations.json` for every key.

`translations[locale].fields` is keyed by plain field `key`. A repeater sub-field may reuse a top-level key (keys are unique per scope, see `duplicate-key` in section 1), in which case both fields share that translation entry.

---

## 8. Public API Quick Reference

### `OpenFormRenderer`

```js
const renderer = new OpenFormRenderer({
  containerEl,          // required, HTMLElement
  onSubmit,             // (answers) => void | Promise, fired on successful validated submit
  onFieldChange,        // optional, (answers, changedKey) => void, fired on every answer change
  onPageChange,         // optional, (index, page) => void, fired after the visible page changes
  onValidationError,    // optional, (errors) => void, fired when validation blocks an action
  translations,         // optional, overrides the built-in UI string dictionary (not form content)
  locale,               // optional, initial locale, default 'default'
  optionsProvider,      // optional, (field, { locale, readOnly }) => Promise<Array<{label, value}>>
  idPrefix              // optional, prefix for every generated DOM id (default: unique 'ofr<N>-')
});

renderer.render(schemaJSON, answers, readOnly);
// schemaJSON: FormSchemaJSON — required (copied, never modified)
// answers:    object | null  — pre-fill existing answers (copied, never modified)
// readOnly:   boolean        — locks all fields, hides the submit button

renderer.validate({ showErrors }); // { valid, errors: [{ key, message, pageIndex, type }] }, no toasts
renderer.submit();             // same as the submit button; Promise<{ submitted, answers?, errors, error? }>
renderer.getAnswers();         // deep copy of what a submit would send (visible + enabled fields)
renderer.setValue(key, value); // sets an answer as if typed: DOM, formulas, rules, onFieldChange
renderer.goToPage(index);      // true if shown; forward moves need the pages in between to be valid; false for a page hidden by a page rule
renderer.getVisiblePages();    // absolute indices of the pages not hidden by a page rule
renderer.setLocale('pt-BR');   // switches locale reactively, keeps current answers
renderer.answers;              // the live internal answers object (prefer getAnswers())
OpenFormRenderer.validateSchema(schema); // static: { valid, errors: [{ path, code, message }], warnings } (section 1)
renderer.destroy();            // unmounts; removes window listeners, observers, timers, shared nodes
OpenFormRenderer.escapeHtml(s); // static helper used for every string the renderer puts in HTML
```

All callbacks receive copies. `onSubmit` may return a promise: the submit button stays disabled until it settles, the success toast waits for it, and a rejection shows the translated `submitErrorToast` and keeps the form editable. See the Integration Guide, section 2, for details on each method and callback.

There is no separate `loadSchema()`/`setAnswers()`/`setReadOnly()` on the renderer — all three are parameters of the single `render()` call. Calling `render()` again with a new schema/answers/readOnly combination re-renders in place. Each call drops per-record state from the previous one (attachments, signature pads, loaded API options); passing `answers` also returns to the first page, while `render(schema)` with no answers keeps the current answers and page (useful for live preview refreshes).

**API-sourced options.** Fields with `optionsType: "api"` get their options from `optionsProvider`, called once per field per `render()` (and per locale). It receives the field (with `optionsUrl`, `key`, …) and `{ locale, readOnly }` and must resolve to `[{ label, value }]`. The host does the request, so it can add auth headers or call a server action. While it is pending the field shows its loading state; if it rejects, or no provider is configured, the field shows a translated message (`optionsLoadError` / `optionsSourceUnavailable`) and offers **no** options. Results that arrive after a re-render or `destroy()` are ignored.

```js
const renderer = new OpenFormRenderer({
  containerEl,
  onSubmit,
  optionsProvider: async (field, { locale }) => {
    const res = await fetch(field.optionsUrl, {
      headers: { Authorization: `Bearer ${getToken()}`, 'Accept-Language': locale }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return rows.map(r => ({ label: r.name, value: r.code }));
  }
});
```

**`destroy()`.** Call it when the host view goes away (SPA navigation, OutSystems `OnDestroy`). It removes the window `mouseup`/`touchend` listeners and ResizeObservers of signature pads, cancels pending toast/animation timers, removes this instance's toasts and print snapshot, ignores in-flight `optionsProvider` results and empties the container. Page-level nodes shared by all renderers (`#lightbox-modal`, a `#toast-container` the renderer created, the Caveat font `<link id="form-handwriting-font">`) are removed only when no other renderer is still mounted; a `#toast-container` supplied by the host page is left alone. Calling it twice is safe, and other methods become no-ops afterwards.

### `OpenFormBuilder`

```js
const builder = new OpenFormBuilder({
  containerEl,      // required, HTMLElement
  onSchemaChange,   // (schema) => void, fired on every schema mutation (receives a deep clone)
  translations,     // optional, overrides the built-in UI string dictionary (docs/builder-translations.json)
  schema,           // optional, initial schema (cloned, normalized; no undo history, not dirty)
  fieldTypes,       // optional, allow-list for the palette, e.g. ['text', 'number', 'dropdown'] (default: all)
  readOnly,         // optional, view-only builder (default false)
  locales,          // optional, [{ code, label }] languages of the "Editing Language" switcher
  confirm,          // optional, (message) => boolean | Promise<boolean>
  prompt            // optional, (message, defaultValue) => string | null | Promise<string | null>
});

builder.loadSchema(existingSchema); // pass null/{} for a blank canvas
builder.getSchema();                // deep clone of the current schema
builder.isDirty();                  // differs from the last loadSchema()/markSaved()
builder.markSaved();
builder.undo();
builder.redo();
builder.destroy();
OpenFormBuilder.validateSchema(schema); // static, same result as the renderer's (section 1)
```

`fieldTypes` only limits what the **palette** can create; a loaded schema may still contain other types and they keep rendering and editing normally. Values must come from `OpenFormBuilder.FIELD_TYPES` (unknown ones are ignored with a `console.warn`); an empty array leaves the palette empty. `readOnly` shows the form without the palette and without any editing control (no drag, no add/delete buttons, no undo/redo shortcuts); selecting a field still opens the Properties panel, with every control disabled, and the language being viewed can still be switched. See INTEGRATION_GUIDE.md section 3 for details on `locales`, `confirm` and `prompt`.
