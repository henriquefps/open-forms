# OpenForms — Schema Reference

This is the complete reference for `FormSchemaJSON`, the plain JSON object that both `OpenFormBuilder` and `OpenFormRenderer` consume. Every property listed here was verified directly against the current `src/builder.js`/`src/renderer.js` source — not against an older draft.

---

## 1. Top-Level Object

```json
{
  "formTitle": "Employee Onboarding Form",
  "formDescription": "Please fill in all fields before your first day.",
  "pages": [ /* Page[] */ ],
  "crossFieldRules": [ /* CrossFieldRule[], optional */ ],
  "translations": { /* optional, see section 7 */ }
}
```

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `formTitle` | `string` | recommended | The form's heading |
| `formDescription` | `string` | optional | Subtitle displayed below the title |
| `pages` | `Page[]` | recommended | Array of pages. A single page renders without a step/progress bar; 2+ pages get one automatically |
| `crossFieldRules` | `CrossFieldRule[]` | optional | Validation rules that compare two or more fields (see section 6) |
| `translations` | `object` | optional | Locale-keyed dictionary for multi-language forms (see section 7) |

> You don't have to hand-build this structure — `OpenFormBuilder.normalizeSchema()` fills in every missing/legacy piece (default page, default section, generated IDs, etc.) the moment you call `loadSchema()`. Passing `{}` or `null` is valid and produces a single empty page.

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
| `paragraph` | Static text block — no answer key, nothing submitted | — |
| `text` | Single-line text input | `string` |
| `textarea` | Multi-line text area | `string` |
| `number` | Numeric input (can be calculated — see section 6) | `number` |
| `date` | Native date picker | `string` (`YYYY-MM-DD`) |
| `boolean` | Toggle switch | `boolean` |
| `dropdown` | Single-select dropdown | `string` (selected value) |
| `radio` | Radio group (single selection) | `string` (selected value) |
| `checkbox` | Checkbox group (multi-select) | `string[]` |
| `matrix` | Question grid (one selection per row) | `{ [rowKey]: string }` |
| `repeater` | Repeatable list of sub-fields | `Array<{ [subFieldKey]: any }>` — one object per item |
| `signature` | Canvas signature pad | `string` — base64 PNG data URL |
| `file` | File upload | `{ name: string, size: number, type: string, content: string }` — `content` is a base64 data URL. **Not** a raw browser `File` object |

### Type-specific properties

| Field type | Extra properties |
| :--- | :--- |
| `header` | `subtitle` (`string`, optional) |
| `text` | `placeholder`, `mask` (custom mask pattern, `9`=digit/`a`=letter/`*`=alphanumeric), `maskCleanValue` (`boolean`, strip mask chars before storing), `validationRegex`, `errorMessage` |
| `textarea` | `placeholder` |
| `number` | `placeholder`, `mask`, `maskCleanValue`, `isCalculated` (`boolean`), `formulaExpression` (`string`, see section 6), `isVisibleOnForm` (`boolean`, default `true` — only meaningful when `isCalculated` is `true`) |
| `boolean` | `defaultValue` (`boolean`) |
| `dropdown` / `radio` / `checkbox` | `optionsType` (`"static"` \| `"api"`), `options` (`Array<{label, value}>`, when static), `optionsUrl` (`string`, when `api`) |
| `matrix` | `matrixRows` (`Array<{key, label}>`), plus the same `optionsType`/`options`/`optionsUrl` as above (shared across every row) |
| `repeater` | `minItems`, `maxItems` (`integer`), `addButtonLabel` (`string`), `rows` (`Row[]` — the sub-field layout repeated per item; only `text`/`textarea`/`number`/`date`/`boolean`/`dropdown`/`radio`/`checkbox`/`matrix`/`signature`/`file` are supported inside a repeater, **not** another `repeater` or nested `matrix`) |
| `signature` | *(no extra properties)* |
| `file` | `acceptedTypes` (`string`, comma-separated extensions/MIME patterns), `useNativeCamera` (`boolean`, Cordova/Capacitor), `nativeCameraSource` (`"camera"` \| `"gallery"`), `maxFileSizeMB` (`number`, default `5`), `fileRequirementsText` (`string`, optional override of the default hint text) |

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

Used on **Field** objects (any `targetProperty`) and **Section** objects (visibility only) to react to another field's answer.

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
| `targetProperty` | `string` | `"visibility"` \| `"required"` \| `"disabled"`. Sections only ever use `"visibility"` |
| `andGroups` | `AndGroup[]` | The rule is satisfied when **every** group has **at least one** satisfied condition — AND between groups, OR within a group |

### Condition object

| Property | Type | Notes |
| :--- | :--- | :--- |
| `dependentFieldKey` | `string` | The field whose current answer is checked |
| `operator` | `string` | `equals` \| `notEquals` \| `contains` \| `notContains` \| `greaterThan` \| `greaterThanOrEquals` \| `lessThan` \| `lessThanOrEquals` |
| `compareMode` | `string` | `"value"` (default) \| `"field"` |
| `equalsValue` | `any` | The static value to compare against — used when `compareMode` is `"value"` or omitted |
| `compareToFieldKey` | `string` | Another field's key to compare against live — used when `compareMode` is `"field"` |

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

`formulaExpression` supports: arithmetic (`+ - * / %`), parentheses, comparisons (`> < >= <= == !=`), the ternary operator (`condition ? a : b`), and `Math.min`, `Math.max`, `Math.round`, `Math.abs`, `Math.floor`, `Math.ceil`. Anything outside that character set is rejected and the expression evaluates to `0` — this is a hard allow-list, not a best-effort filter.

---

## 7. Translations

```json
{
  "translations": {
    "pt-BR": {
      "form": { "formTitle": "Formulário de Contacto" },
      "pages": { "page-001": "Informação Pessoal" },
      "sections": { "sec-001": "Dados de Contacto" },
      "fields": {
        "full_name": { "label": "Nome Completo", "placeholder": "ex. João Silva" }
      },
      "crossFieldRules": {
        "cfr-dates-1": { "errorMessage": "A data final não pode ser anterior à inicial." }
      }
    }
  }
}
```

Translations are keyed by locale, then by category (`form`, `pages`, `sections`, `fields`, `crossFieldRules`), then by the relevant `pageId`/`sectionId`/field `key`/`ruleId`. Structural properties (database keys, field `type`, operators, target field keys, formula expressions) are **not** translatable by design — only display text (labels, titles, placeholders, error messages, option labels) is. Switch locales at runtime with `renderer.setLocale('pt-BR')`.

---

## 8. Public API Quick Reference

### `OpenFormRenderer`

```js
const renderer = new OpenFormRenderer({
  containerEl,          // required, HTMLElement
  onSubmit,             // (answers) => void, fired on successful validated submit
  onFieldChange,        // (answers) => void, fired on every real-time field edit
  translations,         // optional, overrides the built-in UI string dictionary (not form content)
  locale                // optional, initial locale, default 'default'
});

renderer.render(schemaJSON, answers, readOnly);
// schemaJSON: FormSchemaJSON — required
// answers:    object | null  — pre-fill existing answers (e.g. viewing a past submission)
// readOnly:   boolean        — locks all fields, hides the submit button

renderer.setLocale('pt-BR');   // switches locale reactively, keeps current answers
renderer.answers;              // current answers object, readable anytime
```

There is no separate `loadSchema()`/`setAnswers()`/`setReadOnly()` on the renderer — all three are parameters of the single `render()` call. Calling `render()` again with a new schema/answers/readOnly combination re-renders in place.

### `OpenFormBuilder`

```js
const builder = new OpenFormBuilder({
  containerEl,      // required, HTMLElement
  onSchemaChange,   // (schema) => void, fired on every schema mutation
  translations      // optional, overrides the built-in UI string dictionary
});

builder.loadSchema(existingSchema); // pass null/{} for a blank canvas
builder.schema;                     // current schema, readable anytime (also passed into onSchemaChange)
builder.undo();
builder.redo();
```

There is no `getSchema()` method — read `builder.schema` directly, or capture it from the `onSchemaChange` callback.
