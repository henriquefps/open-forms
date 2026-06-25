# OpenForms — Generic Integration Guide

This guide describes how to integrate **OpenForms** (both the visual form builder and form player/renderer) into any modern web application (such as React, Vue, Angular, or pure HTML/JS sites).

---

## 1. Distribution & CDNs

You can load OpenForms assets directly using **jsDelivr**:

```html
<!-- Stylesheet -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.0.4/src/openforms.css">

<!-- Visual Builder (OpenFormBuilder) -->
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.0.4/src/builder.js"></script>

<!-- Form Player / Renderer (OpenFormRenderer) -->
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.0.4/src/renderer.js"></script>
```

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

  // Load the schema into the player
  renderer.loadSchema(schema);
</script>
```

## 3. Implementing the Visual Builder (Designer)

To allow administrators to visually create/edit forms:

```html
<div id="form-builder-container"></div>

<script>
  const builder = new OpenFormBuilder({
    containerEl: document.getElementById('form-builder-container'),
    onChange: (updatedSchema) => {
      console.log("Schema updated in real-time:", updatedSchema);
    }
  });

  // Optionally load an existing schema to edit, or pass null/empty object for a new form
  builder.loadSchema(initialSchema);

  // Retrieve the generated JSON anytime
  const finalSchema = builder.getSchema();
</script>
```

---

## 4. Read-Only / View Mode

To render completed forms in read-only mode (e.g. for detail pages or audit logs), pass the `readOnly` parameter or pre-populated answers:

```javascript
const renderer = new OpenFormRenderer({
  containerEl: document.getElementById('form-renderer-container'),
  onSubmit: (answers) => {}
});

renderer.loadSchema(schema);
renderer.setAnswers(savedAnswers);
renderer.setReadOnly(true); // Locks all fields, hides submit/reset buttons
```

---

## 4. Taking Pictures

OpenForms supports capturing photos directly from the user's device camera through the File Upload widget. The behavior varies depending on your application type:

* **PWA / Web Apps:** The upload widget works out of the box. Clicking the upload area on a mobile browser automatically triggers the device's native camera or gallery selection natively.
* **Native Hybrid Apps (Cordova / Capacitor):** If you are running inside a native wrapper (like Capacitor or Cordova), you must install the respective camera plugin:
  * **Capacitor:** Install `@capacitor/camera`
  * **Cordova:** Install `cordova-plugin-camera`

    Once the plugin is installed, enable the **"Use Native Camera"** option inside the File Upload widget properties in the Visual Builder. The renderer will automatically detect the plugin and invoke the native device camera interface instead of the standard web file picker.

---

## 5. Downloading / Sharing Files on Mobile

When a user taps an uploaded file attachment (like a PDF or DOCX) to view it:

* **Web / PWA:** OpenForms triggers a standard web download using the browser.
* **Native Hybrid Apps (Cordova / Capacitor):** Browsers inside webviews do not support standard web downloads directly. To allow users to download and save files on mobile devices, OpenForms automatically detects and uses native sharing plugins:
  * **Cordova:** Install `cordova-plugin-x-socialsharing` (`window.plugins.socialsharing`). The app will trigger the native OS share sheet directly with the file.
  * **Capacitor:** Install both `@capacitor/share` and `@capacitor/filesystem`. OpenForms will write the file cache to the device's storage and open the native share sheet.

    If no sharing plugins are detected, OpenForms falls back to the standard web download method.
