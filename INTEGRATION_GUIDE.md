# OpenForms — Generic Integration Guide

This guide describes how to integrate **OpenForms** (both the visual form builder and form player/renderer) into any modern web application (such as React, Vue, Angular, or pure HTML/JS sites).

> Looking for the JSON schema shape (field types, conditional rules, cross-field validation, calculated fields)? See **[SCHEMA_REFERENCE.md](./SCHEMA_REFERENCE.md)**.
> Want an AI (ChatGPT, Claude, Gemini) to write the schema for you? See **[AI_SCHEMA_PROMPT.md](./AI_SCHEMA_PROMPT.md)**: a ready-made prompt plus how to validate the answer.

---

## 1. Distribution & CDNs

You can load OpenForms assets directly using **jsDelivr**:

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.3/src/openforms.css">

<!-- Visual Builder (OpenFormBuilder) -->
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.3/src/builder.js"></script>

<!-- Form Player / Renderer (OpenFormRenderer) -->
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.3/src/renderer.js"></script>
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
/// <reference path="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.3/src/openforms.d.ts" />
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
| `onDraftChange` | `(draft) => void` | Debounced after a real change (see "Drafts and resume"). Not called by `render()` or `restoreDraft()`. |
| `onValidationError` | `(errors) => void` | When validation blocks a user action or `submit()`/`goToPage()`. `errors` has the same shape as `validate().errors`. |

Callbacks always receive copies: changing them does not change the form.

### Methods

```javascript
renderer.validate();                       // { valid, errors: [{ key, message, pageIndex, type }] }
renderer.validate({ showErrors: true });   // ...and mark the invalid fields on the current page
renderer.getAnswers();                     // what a submit would send right now (deep copy)
renderer.setValue('country', 'PT');        // set an answer from code
renderer.goToPage(2);                      // true if page 2 is now shown
renderer.getVisiblePages();                // [0, 3]: indices of the pages not hidden by a page rule
renderer.getDraft();                       // the form in progress (see "Drafts and resume")
renderer.restoreDraft(draft);              // put it back
await renderer.clearDraft();               // delete the stored draft
await renderer.submit();                   // same as clicking the submit button
```

- **`validate({ showErrors = false })`** checks every page (including pages not opened yet) without toasts or callbacks. Each error is `{ key, message, pageIndex, type }`, where `type` is `"required"`, `"pattern"`, `"crossField"` or `"uploadPending"` (a file is still uploading); an error inside a repeater item also has `itemIndex` and `subKey` (and `key` is the repeater's key). `showErrors: true` marks the invalid fields that are on screen; it does not change page. To show another page's errors, call `goToPage(errors[0].pageIndex)` and then `validate({ showErrors: true })`.
- **`getAnswers()`** returns `{ fieldKey: value }` for the fields that are visible and enabled according to the rules, the same filtering as a submit. Headers and paragraphs are left out. It is a copy and never contains internal keys.
- **`setValue(key, value)`** sets a top-level field's answer as if the user had entered it: the field on screen updates, formulas and rules run, and `onFieldChange(answers, key)` fires. It works for fields on other pages too. A repeater takes an array of item objects, a file takes `{ name, size, type, content }`. It returns `false` (and logs a warning) when no field has that key. If a rule hides the field, the rule clears the value again, just as it would after a user edit.
- **`goToPage(index)`** follows the same rules as the step tabs: going back is always allowed; going forward requires every page from the current one up to the page before `index` to be valid. If one isn't, the form stays on the current page, marks its invalid fields, shows the validation toast, fires `onValidationError` and returns `false`.
- **`getVisiblePages()`** returns the absolute indices of the pages that page rules (`conditionalRules` on a page, see the [Schema Reference](SCHEMA_REFERENCE.md#page-branching-rules-on-a-page)) currently leave visible. With page branching, `goToPage(index)` returns `false` for a hidden page, Next/Previous and the step tabs skip hidden pages, `onPageChange(index, page)` still reports the absolute index (also when the current page was hidden by an answer and the form moved to a visible one), `getDraft().pageIndex` stays absolute and `restoreDraft()` onto a hidden page opens the nearest visible one.
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

### Uploading files (`uploadProvider`)

By default a `file` field reads the file into a Base64 data URL and keeps it in the answers (and in your submit payload). That is fine for small documents, but a few large photos can exhaust the memory of a phone or a webview. Pass an `uploadProvider` to keep the content **out** of the form: the renderer hands the file to you, you upload it wherever you like, and the answer holds only the **reference** you return.

```javascript
const renderer = new OpenFormRenderer({
  containerEl: document.getElementById('form-renderer-container'),
  onSubmit: (answers) => { /* answers.photo = { name, size, type, url, id } — no Base64 */ },

  // (file, { field, locale, signal, onProgress }) => Promise<FileReference>
  uploadProvider: (file, { field, signal, onProgress }) => new Promise((resolve, reject) => {
    // XMLHttpRequest, because fetch() cannot report upload progress
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/uploads');
    xhr.setRequestHeader('Authorization', `Bearer ${getAccessToken()}`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) return reject(new Error(`Upload failed (HTTP ${xhr.status})`));
      const saved = JSON.parse(xhr.responseText);          // e.g. { "id": "9f2c", "url": "https://files.example.com/9f2c" }
      resolve({ name: file.name, size: file.size, type: file.type, id: saved.id, url: saved.url });
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'));
    signal.addEventListener('abort', () => xhr.abort());   // Cancel, re-render and destroy() all abort the signal
    const body = new FormData();
    body.append('file', file, file.name);
    body.append('fieldKey', field.key);
    xhr.send(body);
  }),

  // Optional: the user deleted an uploaded file, so remove it on the server too
  onFileRemoved: (reference, { field }) => fetch(`/api/uploads/${reference.id}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${getAccessToken()}` }
  })
});
```

With `fetch` the same provider is shorter but has no progress bar (the bar stays at 0% until it completes): `const res = await fetch('/api/uploads', { method: 'POST', body, signal })`.

**What the provider receives:** `file` is a `File`/`Blob` (a Cordova/Capacitor camera capture is converted from its data URL to a Blob first); `field` is the schema field (for a repeater sub-field its own `key`/`id`, plus `repeater: { key, itemIndex }`); `signal` is an `AbortSignal`; `onProgress(fraction)` takes a number from 0 to 1 and is optional to call.

**What it resolves to:** a `FileReference` — `{ name, size, type, url?, id?, ...anything else }`. Missing `name`/`size`/`type` are filled in from the file, and extra keys of your own are kept as they are. This object is the field's answer, and what `getAnswers()`, `onFieldChange` and `onSubmit` receive. Store it as is, or keep just the `id`.

**Behaviour:**

- The upload starts as soon as the user picks, drops or captures a file, after the usual `maxFileSizeMB` and `acceptedTypes` checks. The field shows the name, size and a progress bar (`role="progressbar"` with `aria-valuenow`), a **Cancel** button while uploading, and **Retry** (plus a remove button) with your error message if the promise rejects (an error without a message shows the translated `uploadFailedDefault`).
- Cancel, `render()` and `destroy()` abort the `signal`. Ignore the rejection that follows; a result that arrives after an abort is never stored in the answers; it is reported through `onFileRemoved` with `reason: "discarded"` so you can clean up.
- A required file field is satisfied only by a completed upload. While any upload is still running, `validate()` and `submit()` report an error of `type: "uploadPending"` on that field ("Wait for the upload to finish."); submit never waits silently. A failed upload counts as no file. `getAnswers()` never includes an upload in progress.
- `onFieldChange` fires when an upload completes and when a file is removed, not on progress ticks.
- `onFileRemoved(reference, { field, reason })` tells you a reference left the form, so you can delete the file on your server. It is called for references only (also ones you pre-filled through `render(schema, answers)`), never for Base64 answers. A throw or rejection in it is logged, never shown. `reason` says why:

  | `reason` | When |
  | :--- | :--- |
  | `"removed"` | The user deleted the uploaded file. |
  | `"replaced"` | A new upload completed in a field that already held a reference (the old one is reported). |
  | `"hidden"` | A conditional rule hid the field (top-level, or a repeater sub-field, or a whole repeater) and its answer was reset. |
  | `"itemRemoved"` | The user deleted the repeater item that held the file. |
  | `"discarded"` | An upload resolved **after** it was aborted (Cancel, a retry, `render()`, `destroy()`, or the field being hidden). The reference was never an answer: delete what you stored. |

  Dismissing a failed upload does not call it (there is no reference). `field` is as described above (repeater sub-fields carry `repeater: { key, itemIndex }`).
- Works for file fields inside repeaters (each item uploads on its own; deleting a repeater item aborts the uploads still running in that repeater).
- Images uploaded in the session are previewed from an object URL, revoked when the file is deleted, the form re-rendered or `destroy()` is called. A stored reference is previewed and linked from its `url` only if it starts with `https:`, `http:`, `blob:` or `data:`; anything else (`javascript:`, ...) is ignored and the file is shown by name and size. `print()` shows images from safe URLs and lists the other files by name.
- Pre-filled answers can be references too: `render(schema, { photo: { name: 'a.jpg', size: 1234, type: 'image/jpeg', id: '9f2c' } })`.
- Without an `uploadProvider` nothing changes: Base64 in the answers, with the memory cost described above.

### Drafts and resume

Let people leave a long form and come back to it. A draft is the form in progress: the answers and the page the person was on.

```javascript
const draft = renderer.getDraft();
// { version: 1, schemaVersion: 2, formId?: 'claim', answers: {...}, pageIndex: 1,
//   savedAt: '2026-11-04T12:03:11.000Z', complete: false }

renderer.render(schema);
renderer.restoreDraft(draft);   // true; answers + page restored, rules and formulas re-run
```

- **`getDraft()`** returns a deep copy. `answers` holds every field, also the ones a rule currently hides or disables (like `onFieldChange`, unlike `getAnswers()`). Uploads still in flight (`uploadProvider`) are never included. It returns `null` before `render()` and after `destroy()`.
- **`restoreDraft(draft)`** (call it after `render(schema)`; it also accepts the JSON string) puts the answers back and opens the saved page straight away: the page is clamped to the pages that exist, and, unlike `goToPage()`, nothing is validated on the way. Formulas and rules are re-evaluated, signatures and files are redrawn. It fires no `onSubmit`, `onFieldChange`, `onPageChange` or `onDraftChange`. It returns `false` when the draft is not usable.
- **Schema changed since the draft was saved?** Answers whose key no longer exists (or whose value no longer fits the field, e.g. text where a checkbox is now expected) are dropped, a single `console.warn` lists them, and the form still opens. Nothing throws.
- **`onDraftChange(draft)`** is called after a real change (typing, choices, signature, upload completed or removed, repeater items, `setValue()`, page changes), debounced by `draftDebounceMs` (default `800`). A change still waiting when `destroy()` runs, or the page is being hidden, is delivered first so nothing is lost.

#### Built-in persistence

```javascript
const renderer = new OpenFormRenderer({
  containerEl,
  draftStorage: 'local',        // 'local' | 'session' | { get, set, remove }
  // draftKey: 'claim-form',    // default: "openforms-draft:<formId or formTitle>:v<schemaVersion>"
  // resumeDraft: 'ask',        // 'ask' (default) | 'auto' | 'never'
  // draftDebounceMs: 800,
});
```

| Option | Meaning |
| :--- | :--- |
| `draftStorage` | Saves the draft (after the debounce) and looks for one on `render()`. `'local'` / `'session'` use `localStorage` / `sessionStorage`; an adapter object has `get(key)`, `set(key, value)` and `remove(key)`, each of which may return a promise. `value` is always the draft as a **JSON string** (store it as text); `get` may return that string or the draft object. Errors (quota, private mode, network) are logged and never break the form. |
| `draftKey` | Storage key. The default uses the schema's optional `formId` (set it if two forms share a title) or its `formTitle`, plus `schemaVersion`. |
| `resumeDraft` | What `render()` does with a stored draft. `'ask'`: a small prompt above the form, announced politely to screen readers (`aria-live="polite"`) without moving focus or scrolling the page; "Resume your draft?" with *Resume* and *Start over* buttons (translated; the keys are `draftResumePrompt`, `draftResumeButton`, `draftDiscardButton`, `draftSavedAt`). `'auto'`: restores it without asking. `'never'`: ignores it (it is still overwritten by the next change). Read-only forms never resume. |

The stored draft is offered once per record: a plain `render(schema)` refresh of the same form (for example a live preview) does not ask again, but `render(schema, answers)` starts a new record and does. After `onSubmit` succeeds (its promise resolves) the stored draft is deleted; if `onSubmit` throws or rejects, the draft stays. `renderer.clearDraft()` deletes it on demand (for example from a "Discard" button) and returns a promise.

> **Size.** Without an `uploadProvider`, files and signatures are Base64 inside the draft, and `localStorage` holds only about 5 MB, so a draft with photos can fail to save (logged, form unaffected). For forms with uploads use an `uploadProvider`: the draft then holds small references only.
>
> **Privacy.** A draft in `localStorage` is readable by anyone using that browser profile. For sensitive forms prefer `'session'` or your own adapter, and call `clearDraft()` on sign-out.

Server-side drafts are just an adapter (or `onDraftChange` + `restoreDraft`):

```javascript
new OpenFormRenderer({
  containerEl,
  draftStorage: {
    get: (key) => fetch(`/api/drafts/${key}`).then(r => (r.ok ? r.text() : null)),
    set: (key, value) => fetch(`/api/drafts/${key}`, { method: 'PUT', body: value }),
    remove: (key) => fetch(`/api/drafts/${key}`, { method: 'DELETE' })
  }
});
```

### Unmounting (`destroy()`)

In single-page apps, call `renderer.destroy()` before removing the form's container or navigating away:

```javascript
renderer.destroy();
```

It aborts uploads in flight (their `signal`), revokes preview object URLs, removes the `window` listeners and ResizeObservers used by signature pads, cancels pending timers, removes this instance's toasts and print snapshot, ignores `optionsProvider` results that arrive later, and empties the container. The image lightbox, a `#toast-container` the renderer created itself, and the opt-in handwriting font `<link>` are shared by every renderer on the page, so they are removed only when no other renderer is still mounted. A `#toast-container` that your page provides is never removed. `destroy()` can be called more than once, and other methods do nothing after it.

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
renderer.render(schema, renderer.getDraft().answers, false);
```

`getDraft().answers` is a copy of every answer, including fields a rule currently hides, so nothing is lost when the rules change again. Use `renderer.getAnswers()` instead if you only want what a submit would send.

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
   - hidden fields/sections/pages (conditional rules), wizard steps and buttons are left out;
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
