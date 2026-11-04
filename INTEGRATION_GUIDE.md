# OpenForms — Generic Integration Guide

This guide describes how to integrate **OpenForms** (both the visual form builder and form player/renderer) into any modern web application (such as React, Vue, Angular, or pure HTML/JS sites).

> Looking for the JSON schema shape (field types, conditional rules, cross-field validation, calculated fields)? See **[SCHEMA_REFERENCE.md](./SCHEMA_REFERENCE.md)**.

---

## 1. Distribution & CDNs

You can load OpenForms assets directly using **jsDelivr**:

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.3.0/src/openforms.css">

<!-- Visual Builder (OpenFormBuilder) -->
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.3.0/src/builder.js"></script>

<!-- Form Player / Renderer (OpenFormRenderer) -->
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.3.0/src/renderer.js"></script>
```

Both scripts are plain classic `<script>` tags — no bundler, no ES module imports required. Each one is fully self-contained; load only `renderer.js` if you just need to play back forms, without ever loading `builder.js`.

**Global scope and double loading.** Each script is wrapped in a function, so the only thing it adds to the page is its class (`window.OpenFormBuilder` / `window.OpenFormRenderer`). It declares no other globals, so a host page with its own `const debounce = …` is safe. Loading the same script twice (for example an OutSystems Block and a Screen that both require it) does not throw: the **first** definition is kept, so existing instances and `instanceof` checks stay valid, and if the second copy has a different `VERSION` a single `console.warn` says which one was kept.

**Bundlers, Node and SSR.** When CommonJS is present (`module.exports`), the script exports its class instead of attaching a global:

```js
const OpenFormRenderer = require('./openforms/renderer.js'); // or: import OpenFormRenderer from './openforms/renderer.js'
```

Importing never touches `window` or `document`, so it is safe in Node or during server-side rendering; only constructing an instance and calling `render()` need a DOM.

**TypeScript.** `src/openforms.d.ts` declares both classes, their options and callbacks, and the schema and answer types (`FormSchema`, `Field`, `FormAnswers`, …). Reference it from your project, for example by copying it next to your sources, or straight from the CDN:

```ts
/// <reference path="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.3.0/src/openforms.d.ts" />
```

and `import type { FormSchema } from './openforms'` when you use a local copy.

`openforms.css` is scoped to the components: it declares no `:root` variables and styles none of your page's own elements. Its colour and border-radius tokens follow the OutSystems UI-named tokens (`--color-primary`, `--border-radius-soft`, …) when your page defines them. Spacing and typography use OpenForms' own values. See [customization.md](./customization.md) for theming.

---

## 2. Implementing the Form Renderer (Player)

To render a dynamic form from a saved schema JSON:

```html
<div id="form-renderer-container"></div>

<script>
  const schema = {
    formTitle: "Feedback Form",
    pages: [
      {
        pageId: "page-1",
        title: "Questions",
        sections: [
          {
            sectionId: "sec-1",
            title: "General",
            rows: [
              {
                rowId: "row-1",
                columns: [
                  {
                    width: 12,
                    field: {
                      id: "f-name",
                      key: "fullName",
                      type: "text",
                      label: "Your Name",
                      required: true
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  const renderer = new OpenFormRenderer({
    containerEl: document.getElementById('form-renderer-container'),
    // May return a promise: the success toast waits for it (see "Submitting" below)
    onSubmit: async (answers) => {
      console.log("Form Submitted! Answers:", answers);
      await saveToYourApi(answers);
    },
    onFieldChange: (answers, changedKey) => {
      console.log(`"${changedKey}" changed. Answers so far:`, answers);
    }
  });

  // Mount the schema — the single entry point that (re)draws the form.
  // Signature: render(schemaJSON, answers = null, readOnly = false)
  renderer.render(schema);
</script>
```

> There is no separate `loadSchema()` method on the renderer. `render()` is the one call that mounts (and re-mounts, if called again) the form — see section 4 for passing pre-filled answers and read-only mode through its 2nd and 3rd parameters.

Each `render()` call starts a fresh record: attachments, signature pads and loaded API options from the previous call are dropped. Passing `answers` also opens the form on its first page; `render(schema)` with no answers keeps the current answers and page.

`render()` works on copies: the schema and answers objects you pass are never modified, and later edits never write back into them. Read the current state with `getAnswers()` or from `onFieldChange`.

### Callbacks

| Option | Signature | When |
| :--- | :--- | :--- |
| `onSubmit` | `(answers) => void \| Promise` | After a submit passed validation. `answers` is the same object `getAnswers()` returns. |
| `onFieldChange` | `(answers, changedKey) => void` | After every answer change: typing, choices, signatures (when a stroke ends, and while typing a typed signature), file upload/delete, camera photos, repeater items added/removed, `setValue()`. `answers` is a deep copy of **all** answers (including fields currently hidden or disabled; useful for drafts). `changedKey` is the top-level field key (the repeater's key for an edit inside a repeater item). |
| `onPageChange` | `(index, page) => void` | After the visible page changes (Next/Previous, step tabs, `goToPage()`, or a failed submit jumping to the invalid page). `page` is a copy of the page's schema. Not called by `render()`. |
| `onValidationError` | `(errors) => void` | When validation blocks a user action or `submit()`/`goToPage()`. `errors` has the same shape as `validate().errors`. |

Callbacks always receive copies: changing them does not change the form.

### Methods

```javascript
renderer.validate();                       // { valid, errors: [{ key, message, pageIndex, type }] }
renderer.validate({ showErrors: true });   // ...and mark the invalid fields on the current page
renderer.getAnswers();                     // what a submit would send right now (deep copy)
renderer.setValue('country', 'PT');        // set an answer from code
renderer.goToPage(2);                      // true if page 2 is now shown
await renderer.submit();                   // same as clicking the submit button
```

- **`validate({ showErrors = false })`** checks every page (including pages not opened yet) without toasts or callbacks. Each error is `{ key, message, pageIndex, type }`, where `type` is `"required"`, `"pattern"` or `"crossField"`; an error inside a repeater item also has `itemIndex` and `subKey` (and `key` is the repeater's key). `showErrors: true` marks the invalid fields that are on screen; it does not change page. To show another page's errors, call `goToPage(errors[0].pageIndex)` and then `validate({ showErrors: true })`.
- **`getAnswers()`** returns `{ fieldKey: value }` for the fields that are visible and enabled according to the rules, the same filtering as a submit. Headers and paragraphs are left out. It is a copy and never contains internal keys.
- **`setValue(key, value)`** sets a top-level field's answer as if the user had entered it: the field on screen updates, formulas and rules run, and `onFieldChange(answers, key)` fires. It works for fields on other pages too. A repeater takes an array of item objects, a file takes `{ name, size, type, content }`. It returns `false` (and logs a warning) when no field has that key. If a rule hides the field, the rule clears the value again, just as it would after a user edit.
- **`goToPage(index)`** follows the same rules as the step tabs: going back is always allowed; going forward requires every page from the current one up to the page before `index` to be valid. If one isn't, the form stays on the current page, marks its invalid fields, shows the validation toast, fires `onValidationError` and returns `false`.
- **`submit()`** runs the submit button's path and returns a promise of `{ submitted, answers?, errors, error? }`. If validation fails, it opens the first page with errors, marks them, shows the validation toast and fires `onValidationError`; `onSubmit` is not called. Read-only forms never submit.

### Validating stored schemas

Schemas saved by older builds, edited by hand or generated by another system can contain mistakes (unknown field types, duplicate keys, rules pointing at missing fields…). Check them before rendering:

```javascript
const result = OpenFormRenderer.validateSchema(storedSchema);
// { valid, errors: [{ path, code, message }], warnings: [{ path, code, message }] }
if (!result.valid) console.error('Invalid form schema', result.errors);
renderer.render(storedSchema); // still renders best-effort
```

It is static, does not modify the schema and does not need a renderer instance (`OpenFormBuilder.validateSchema` gives the same result). Unknown field types render a visible "Unsupported field type" placeholder and are left out of the answers; conditions with an unknown operator are never satisfied. A schema whose `schemaVersion` is newer than your renderer supports logs one `console.warn` and renders best-effort, so keep the renderer at least as new as the builder that saved the schema. See SCHEMA_REFERENCE.md, section 1, for the codes.

### Submitting

`onSubmit` can return a promise, for example the `fetch()` that saves the answers:

- the submit button is disabled (and the form has `aria-busy="true"`) until the promise settles; calling `submit()` again in the meantime returns the same pending promise;
- the success toast (`validationToastSuccess`) appears only once the promise resolves;
- if it rejects (or `onSubmit` throws), an error toast (`submitErrorToast`, translated, overridable via `translations`) is shown, the form stays as it was and the user can submit again. `submit()` then resolves with `{ submitted: false, error }`.

If `onSubmit` returns nothing, the success toast is shown right after it runs.

### Answer values

Answers are keyed by field `key`; see the value shape per field type in the [Schema Reference](SCHEMA_REFERENCE.md#field-types-reference). `number` fields always hold a JS number, or `null` when empty, both at the top level and inside repeater items. Pre-filled answers stored as strings (`"42"`) are converted when you call `render()`. An empty number never matches `greaterThan`/`lessThan`-style conditions, and still matches `equals ""`. Every field gets its default value on `render()` (`""`, `null` for numbers, `false` for switches, `[]` for repeaters with `minItems` empty items…), including fields on pages the user hasn't opened yet.

### Texts and languages

Every text the renderer adds itself (buttons, "Yes / No", "Add Item", "Item #{n}", upload and image-preview labels, error messages, file-size units, print strings) is translated for English, pt-BR and es-ES through the `locale` option / `setLocale()`. Override any of them with `translations: { key: 'text' }`; the keys are listed in `docs/renderer-translations.json` (`{n}` and `{date}` are replaced). Numbers shown by the renderer (calculated fields, file sizes, print) use the active locale's format, while the stored answer stays a plain number. Texts that belong to the form itself (labels, placeholders, `errorMessage` of fields and cross-field rules, options) are translated in the schema's `translations` node — see SCHEMA_REFERENCE.md.

### Several forms on one page

Every element id the renderer creates starts with a per-instance prefix (`ofr1-`, `ofr2-`, … in creation order), for example `ofr1-input-<fieldId>`, `ofr1-label-<fieldId>`, `ofr1-renderer-form-title`. Two renderers, or a form and its `print()` copy, never share an id, and each label and `aria-*` reference points to its own form. To get predictable ids (CSS or end-to-end tests), pass `idPrefix`:

```javascript
new OpenFormRenderer({ containerEl, onSubmit, idPrefix: 'checkout-' }); // ids: checkout-input-<fieldId>, ...
```

Elements shared by all renderers keep fixed ids: `#lightbox-modal`, `#toast-container`, `#openforms-print-root`.

### Icons and fonts: no external requests

Both scripts ship their icons as inline SVG (Lucide paths, ISC license), so there is no icon library to load and the components never touch `window.lucide` or any other element of your page. Page icons you draw with Lucide yourself keep working untouched.

Typed signatures are drawn with the font stack `'Caveat', 'Segoe Script', 'Bradley Hand', cursive`: Caveat if your page already loaded it, a handwriting face from the OS otherwise. To have the renderer load a webfont for it, pass the stylesheet URL (this is the only way the renderer ever makes an external request):

```javascript
new OpenFormRenderer({
  containerEl, onSubmit,
  handwritingFontUrl: 'https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap'
});
```

The `<link id="form-handwriting-font">` is added the first time a signature field is shown, and the typed signature is drawn only after the font has loaded. Self-hosting the stylesheet works the same way.

### API-sourced options (`optionsProvider`)

Fields with `optionsType: "api"` don't fetch anything on their own. The renderer asks the host for their options through the `optionsProvider` constructor option, so the host controls the URL, authentication, caching and error handling:

```javascript
const renderer = new OpenFormRenderer({
  containerEl: document.getElementById('form-renderer-container'),
  onSubmit: (answers) => { /* ... */ },
  // (field, { locale, readOnly }) => Promise<Array<{ label, value }>>
  optionsProvider: async (field, { locale }) => {
    const res = await fetch(field.optionsUrl, {
      headers: { Authorization: `Bearer ${getAccessToken()}`, 'Accept-Language': locale }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    return rows.map(row => ({ label: row.name, value: row.id }));
  }
});
```

- `field.optionsUrl` is just a string from the schema; use it as a URL, a lookup key, or ignore it.
- The provider runs once per field per `render()` (and per locale); page navigation reuses the result.
- While it is pending, the field shows its loading text. If the promise rejects, or no provider is configured, the field shows a translated message (`optionsLoadError` / `optionsSourceUnavailable`, overridable via `translations`) and offers no options. The renderer never invents placeholder options.
- A previously saved answer is re-selected once the options arrive.

### Unmounting (`destroy()`)

In single-page apps, call `renderer.destroy()` before removing the form's container or navigating away:

```javascript
renderer.destroy();
```

It removes the `window` listeners and ResizeObservers used by signature pads, cancels pending timers, removes this instance's toasts and print snapshot, ignores `optionsProvider` results that arrive later, and empties the container. The image lightbox, a `#toast-container` the renderer created itself, and the opt-in handwriting font `<link>` are shared by every renderer on the page, so they are removed only when no other renderer is still mounted. A `#toast-container` that your page provides is never removed. `destroy()` can be called more than once, and other methods do nothing after it.

## 3. Implementing the Visual Builder (Designer)

To allow administrators to visually create/edit forms:

```html
<div id="form-builder-container"></div>

<script>
  const builder = new OpenFormBuilder({
    containerEl: document.getElementById('form-builder-container'),
    onSchemaChange: (updatedSchema) => {
      console.log("Schema updated in real-time:", updatedSchema);
      // Persist updatedSchema to your backend here (e.g. debounced autosave)
    }
  });

  // Optionally load an existing schema to edit, or pass null/{} for a new blank form
  builder.loadSchema(initialSchema);

  // Read the current schema as a deep clone (safe to keep or mutate):
  const finalSchema = builder.getSchema();

  // Unsaved-changes tracking: isDirty() compares against the last loadSchema()/markSaved().
  if (builder.isDirty()) {
    saveToBackend(finalSchema);
    builder.markSaved();
  }

  // When the builder's screen goes away (SPA navigation, OutSystems Reactive screen
  // change, closing a modal), tear it down:
  builder.destroy();
</script>
```

### Builder options

| Option | Type | What it does |
|--------|------|--------------|
| `containerEl` | `HTMLElement` | Required. |
| `onSchemaChange` | `(schema) => void` | Fired on every change with a deep clone. |
| `schema` | `FormSchema` | Initial schema, cloned and normalized. Like calling `loadSchema()` right after construction, but with no undo history, `isDirty()` is `false` and `onSchemaChange` does not fire. If it has validation errors a toast reports them; it still loads. |
| `fieldTypes` | `FieldType[]` | Allow-list of types in the palette (default: all of `OpenFormBuilder.FIELD_TYPES`). Only restricts what can be **created**: fields of other types already in a loaded schema still render and can be edited or deleted. Unknown names are ignored with a `console.warn`. |
| `readOnly` | `boolean` | View-only builder: no palette, no drag and drop, no add/delete/duplicate buttons, canvas inputs read-only, Properties panel visible but every control disabled, undo/redo shortcuts off. Selecting a field and switching the viewed language still work. Mutating methods (`undo()`, `deletePage()`, …) do nothing. `loadSchema()` still works, so you can show different forms. Set once at construction; create a new instance to change it. |
| `locales` | `Array<{ code, label }>` | Languages in the "Editing Language" switcher, replacing the built-in list (`pt-BR`, `en-US`, `es-ES`). The base language (`default`) is always first; entries without a string `code` and duplicates are dropped; a missing `label` falls back to the code. Locales already present in the loaded schema's `translations` are still listed as "(Custom)". The "+" button still lets users type any other code. |
| `confirm` | `(message) => boolean \| Promise<boolean>` | Replaces the built-in confirmation dialog (used when deleting a page). Only `true` counts as yes; a rejection or exception counts as no. |
| `prompt` | `(message, defaultValue) => string \| null \| Promise<string \| null>` | Replaces the built-in text dialog (used to add a language code). `null` cancels. |
| `translations` | `Record<string, string>` | Overrides the UI strings (every key and its English default is in `docs/builder-translations.json`). |

```js
const builder = new OpenFormBuilder({
  containerEl,
  schema: savedSchema,
  fieldTypes: ['text', 'textarea', 'number', 'date', 'dropdown'],
  locales: [{ code: 'pt-BR', label: 'Português' }, { code: 'fr-FR', label: 'Français' }],
  // Use your design system's dialogs instead of the built-in ones:
  confirm: (message) => myDialogs.confirm(message),
  prompt: (message, defaultValue) => myDialogs.prompt(message, defaultValue),
  onSchemaChange: autosave
});
```

**Dialogs.** The builder never calls `window.confirm` / `window.prompt`. Without hooks it opens a small modal inside its own container: `role="dialog"` with `aria-modal`, focus moves into it (to "Cancel" for confirmations, to the text field for prompts) and is trapped until it closes, Escape or a click outside cancels, Enter confirms a prompt, and focus returns to where it was. The button labels are translatable (`dialogOkLabel`, `dialogCancelLabel`) as are the messages (`deletePageConfirm`, `addLocalePrompt`). `builder.confirm(message)` and `builder.prompt(message, defaultValue)` are public and use the same hooks or modal. `deletePage()` now returns a Promise because the confirmation is asynchronous.

**Translating the builder UI.** All visible text comes from the `translations` dictionary, including toasts and the default text of new fields ("Option 1", "Add Item", …). Strings can contain `{name}` placeholders (keep them in your override), and a few use light formatting: `` `code` `` and `**bold**`. Messages with a count come as `…One` / `…Other` pairs.

**Key scoping.** Renaming a field key follows the schema's key scopes: top-level fields share one namespace and each repeater's sub-fields have their own, so a sub-field may reuse a top-level key. Renaming a sub-field only rewrites rules and formulas inside its repeater; renaming a top-level field does not touch rules inside a repeater that has a sub-field of the same name.

### Schema API, dirty state and undo

- `onSchemaChange(schema)` receives a **deep clone** on every change; mutating it never affects the builder. `builder.getSchema()` returns the same kind of clone on demand.
- The builder stamps `schemaVersion` on every schema it outputs. `loadSchema()` validates what it receives (`OpenFormBuilder.validateSchema`) and shows a toast if there are errors; the schema still loads.
- `builder.isDirty()` is `true` when the schema differs from the last `loadSchema()` / `markSaved()`; undoing back to the saved state makes it `false` again. Call `builder.markSaved()` after persisting.
- Typing in a field is one undo step per burst: consecutive edits to the same control within ~500 ms (or until it loses focus) are grouped. History keeps the last 100 steps.
- `loadSchema()`, undo/redo and deleting a page reset the selection and editing language when the selected section/field/translation no longer exists. `loadSchema(null)` (or `{}`) clears the canvas to an empty form.
- If the host page has no `#toast-container`, the builder creates its own (`role`/`aria-live`, styled by `openforms.css`) and `destroy()` removes it. Load `openforms.css` or provide your own container.

### Tearing down: `destroy()`

`builder.destroy()` removes every listener the builder added outside its container (the undo/redo shortcut listeners on `document`), cancels the pending debounced canvas render and any pending timers, removes the toasts it added (and the toast container, if the builder created it), and empties `containerEl`. It is idempotent: calling it again does nothing. Don't use the instance after destroying it; create a new `OpenFormBuilder` to mount again.

### Undo / redo shortcuts

Ctrl/Cmd+Z (undo) and Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z (redo) apply only to keyboard events inside the builder's container, or to events on `<body>` when the user's last click or focus was inside the builder. Shortcuts elsewhere on the host page are left alone, and with several builders on one page only the one in use responds. Native text undo inside inputs and textareas is never intercepted.

### Options from an API (`optionsType: 'api'`)

The builder only stores `optionsType: 'api'` and `optionsUrl` in the schema. The options themselves are supplied at runtime by the host's `optionsProvider` on the renderer, which receives the field (including `optionsUrl`).

---

## 4. Read-Only / View Mode & Pre-Filled Answers

`render()` takes the answers to pre-fill and the read-only flag as its 2nd and 3rd arguments — there's no separate `setAnswers()`/`setReadOnly()` call:

```javascript
const renderer = new OpenFormRenderer({
  containerEl: document.getElementById('form-renderer-container'),
  onSubmit: (answers) => {}
});

// render(schemaJSON, answers, readOnly)
renderer.render(schema, savedAnswers, true); // pre-filled + locked, hides the submit button
```

To later unlock the same instance (e.g. an "Edit" button toggling out of view mode), just call `render()` again with `readOnly: false`:

```javascript
renderer.render(schema, renderer.answers, false);
```

`render()` copies the answers you pass, so the object you hold is never modified by later edits. Read the current answers back with `renderer.getAnswers()` (what a submit would send) or from `onFieldChange`.

---

## 5. Client-Side Print / Save-as-PDF

Call `renderer.print()` to let the end-user print or save their own filled-out form as a PDF using the browser's native Print dialog — no backend, no third-party library:

```javascript
renderer.print();

// Optional: the document title while the dialog is open. Browsers use it as the
// default "Save as PDF" file name and in their page header. Defaults to the form title.
renderer.print({ title: 'Inspection 2026-11-04 - Maria Souza' });
```

Under the hood, `print()`:

1. Flattens every page of the form into one continuous, read-only view. On multi-page forms each page title is kept as a heading before that page's sections.
2. Renders that view into a throwaway `#openforms-print-root` and turns it into a static document:
   - text, number, date and dropdown answers are printed as plain text that wraps and grows (long answers are never clipped by an input box); dates and decimals use the form's locale;
   - switches print as **Yes** / **No**;
   - radios, checkboxes and matrices list every option with the selected ones marked using borders, so they still show when "Background graphics" is off in the dialog (the default);
   - signatures (drawn or typed, also inside repeater items) print as the stored image; empty ones as a blank box to sign on paper;
   - image attachments print as a preview, other attachments by file name and size;
   - hidden fields/sections (conditional rules), wizard steps and buttons are left out;
   - a "Generated on &lt;date&gt;" line is added under the form title.
3. Waits for API-loaded options and for images to decode, then calls `window.print()`, and cleans up once the dialog closes (`afterprint`).

While the printout is pending, `<html>` has the class `openforms-printing`: only then does the print CSS hide the rest of your page and set the page margins (`@page { margin: 14mm 12mm }`). Your page's own `window.print()` is unaffected the rest of the time. Fields are kept whole on a page (label + value), and a section title is never left alone at the bottom of a page; repeaters and matrices can break between items/rows. The 12-column layout is kept on paper (the phone layout does not kick in at paper width). The printout is always black on white, whatever theme the form uses on screen. Paper size (A4/Letter) is whatever the user picks.

The live, in-progress form the user is filling out is never touched — `print()` renders into a separate, throwaway view.

Print strings can be translated or changed through the `translations` option (built in: English, pt-BR, es-ES): `printYes`, `printNo` and `printGeneratedOn` (`{date}` is replaced; set it to `''` to drop the line).

**Known limitations**

- The user goes through the browser's Print dialog and picks "Save as PDF". The browser's own header/footer (date, URL, page numbers) is controlled by the user's "Headers and footers" setting, not by OpenForms.
- Attached PDFs/documents are listed by name, not embedded in the printout.
- Mobile browsers handle `window.print()` differently: on some (e.g. Chrome on Android) the dialog doesn't block, and the `afterprint` cleanup timing isn't guaranteed. Test there if mobile printing matters to you.
- Generating a PDF *programmatically*, without any user interaction (e.g. a backend workflow emailing a receipt), still requires server-side infrastructure with a headless browser — that's a fundamentally different capability from client-side printing.


---

## 6. Taking Pictures

OpenForms supports capturing photos directly from the user's device camera through the File Upload widget. The behavior varies depending on your application type:

* **PWA / Web Apps:** The upload widget works out of the box. Clicking the upload area on a mobile browser automatically triggers the device's native camera or gallery selection natively.
* **Native Hybrid Apps (Cordova / Capacitor):** If you are running inside a native wrapper (like Capacitor or Cordova), you must install the respective camera plugin:
  * **Capacitor:** Install `@capacitor/camera`
  * **Cordova:** Install `cordova-plugin-camera`

    Once the plugin is installed, enable the **"Use Native Camera"** option inside the File Upload widget properties in the Visual Builder. The renderer will automatically detect the plugin and invoke the native device camera interface instead of the standard web file picker.

---

## 7. Downloading / Sharing Files on Mobile

When a user taps an uploaded file attachment (like a PDF or DOCX) to view it:

* **Web / PWA:** OpenForms triggers a standard web download using the browser.
* **Native Hybrid Apps (Cordova / Capacitor):** Browsers inside webviews do not support standard web downloads directly. To allow users to download and save files on mobile devices, OpenForms automatically detects and uses native sharing plugins:
  * **Cordova:** Install `cordova-plugin-x-socialsharing` (`window.plugins.socialsharing`). The app will trigger the native OS share sheet directly with the file.
  * **Capacitor:** Install both `@capacitor/share` and `@capacitor/filesystem`. OpenForms will write the file cache to the device's storage and open the native share sheet.

    If no sharing plugins are detected, OpenForms falls back to the standard web download method.
