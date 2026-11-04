# OpenForms — Generic Integration Guide

This guide describes how to integrate **OpenForms** (both the visual form builder and form player/renderer) into any modern web application (such as React, Vue, Angular, or pure HTML/JS sites).

> Looking for the JSON schema shape (field types, conditional rules, cross-field validation, calculated fields)? See **[SCHEMA_REFERENCE.md](./SCHEMA_REFERENCE.md)**.

---

## 1. Distribution & CDNs

You can load OpenForms assets directly using **jsDelivr**:

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.1.0/src/openforms.css">

<!-- Visual Builder (OpenFormBuilder) -->
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.1.0/src/builder.js"></script>

<!-- Form Player / Renderer (OpenFormRenderer) -->
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.1.0/src/renderer.js"></script>
```

Both scripts are plain classic `<script>` tags — no bundler, no ES module imports required. Each one is fully self-contained; load only `renderer.js` if you just need to play back forms, without ever loading `builder.js`.

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
    onSubmit: (answers) => {
      console.log("Form Submitted! Answers:", answers);
      // Send answers to your server/API database
    },
    onFieldChange: (answers) => {
      console.log("Real-time answers updated:", answers);
    }
  });

  // Mount the schema — the single entry point that (re)draws the form.
  // Signature: render(schemaJSON, answers = null, readOnly = false)
  renderer.render(schema);
</script>
```

> There is no separate `loadSchema()` method on the renderer. `render()` is the one call that mounts (and re-mounts, if called again) the form — see section 4 for passing pre-filled answers and read-only mode through its 2nd and 3rd parameters.

Each `render()` call starts a fresh record: attachments, signature pads and loaded API options from the previous call are dropped. Passing `answers` also opens the form on its first page; `render(schema)` with no answers keeps the current answers and page.

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

It removes the `window` listeners and ResizeObservers used by signature pads, cancels pending timers, removes this instance's toasts and print snapshot, ignores `optionsProvider` results that arrive later, and empties the container. The image lightbox, a `#toast-container` the renderer created itself, and the handwriting font `<link>` are shared by every renderer on the page, so they are removed only when no other renderer is still mounted. A `#toast-container` that your page provides is never removed. `destroy()` can be called more than once, and other methods do nothing after it.

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

  // The current schema is always readable directly off the instance — there is no
  // separate getSchema() method.
  const finalSchema = builder.schema;

  // When the builder's screen goes away (SPA navigation, OutSystems Reactive screen
  // change, closing a modal), tear it down:
  builder.destroy();
</script>
```

### Tearing down: `destroy()`

`builder.destroy()` removes every listener the builder added outside its container (the undo/redo shortcut listeners on `document`), cancels the pending debounced canvas render and any pending timers, removes the toasts it added to the host's `#toast-container`, and empties `containerEl`. It is idempotent: calling it again does nothing. Don't use the instance after destroying it; create a new `OpenFormBuilder` to mount again.

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
