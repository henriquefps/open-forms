# OpenForms — Generic Integration Guide

This guide describes how to integrate **OpenForms** (both the visual form builder and form player/renderer) into any modern web application (such as React, Vue, Angular, or pure HTML/JS sites).

> Looking for the JSON schema shape (field types, conditional rules, cross-field validation, calculated fields)? See **[SCHEMA_REFERENCE.md](./SCHEMA_REFERENCE.md)**.

---

## 1. Distribution & CDNs

You can load OpenForms assets directly using **jsDelivr**:

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.0.7/src/openforms.css">

<!-- Visual Builder (OpenFormBuilder) -->
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.0.7/src/builder.js"></script>

<!-- Form Player / Renderer (OpenFormRenderer) -->
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.0.7/src/renderer.js"></script>
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
</script>
```

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

## 5. Taking Pictures

OpenForms supports capturing photos directly from the user's device camera through the File Upload widget. The behavior varies depending on your application type:

* **PWA / Web Apps:** The upload widget works out of the box. Clicking the upload area on a mobile browser automatically triggers the device's native camera or gallery selection natively.
* **Native Hybrid Apps (Cordova / Capacitor):** If you are running inside a native wrapper (like Capacitor or Cordova), you must install the respective camera plugin:
  * **Capacitor:** Install `@capacitor/camera`
  * **Cordova:** Install `cordova-plugin-camera`

    Once the plugin is installed, enable the **"Use Native Camera"** option inside the File Upload widget properties in the Visual Builder. The renderer will automatically detect the plugin and invoke the native device camera interface instead of the standard web file picker.

---

## 6. Downloading / Sharing Files on Mobile

When a user taps an uploaded file attachment (like a PDF or DOCX) to view it:

* **Web / PWA:** OpenForms triggers a standard web download using the browser.
* **Native Hybrid Apps (Cordova / Capacitor):** Browsers inside webviews do not support standard web downloads directly. To allow users to download and save files on mobile devices, OpenForms automatically detects and uses native sharing plugins:
  * **Cordova:** Install `cordova-plugin-x-socialsharing` (`window.plugins.socialsharing`). The app will trigger the native OS share sheet directly with the file.
  * **Capacitor:** Install both `@capacitor/share` and `@capacitor/filesystem`. OpenForms will write the file cache to the device's storage and open the native share sheet.

    If no sharing plugins are detected, OpenForms falls back to the standard web download method.
