# OpenForms — OutSystems Integration Guide

> **Compatible with:** OutSystems 11 (Reactive Web) and OutSystems Developer Cloud (ODC)  
> **Component version:** the examples pin `open-forms@1.5.0` on jsDelivr; use the version you are deploying.  
> **Author:** Henrique Silva (contact@hfps.dev) — [hfps.dev](https://hfps.dev)

This guide shows how to run the OpenForms **renderer** (and, optionally, the **builder**) inside an OutSystems Reactive app, in both O11 and ODC. For the generic API see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md); for the schema see [SCHEMA_REFERENCE.md](./SCHEMA_REFERENCE.md); for theming see [customization.md](./customization.md).

---

## Table of Contents

1. [Overview](#overview)
2. [How to call Client Actions from a JavaScript node](#how-to-call-client-actions-from-a-javascript-node)
3. [Add the scripts and styles](#add-the-scripts-and-styles)
4. [Render a form in a Block](#render-a-form-in-a-block)
5. [Dynamic options (`optionsProvider`)](#dynamic-options-optionsprovider)
6. [Handle the submitted answers](#handle-the-submitted-answers)
7. [Clean up in OnDestroy (`destroy()`)](#clean-up-in-ondestroy-destroy)
8. [Read-only view](#read-only-view)
9. [Print / Save as PDF (`print()`)](#print--save-as-pdf-print)
10. [Languages](#languages)
11. [Using the visual designer (Builder)](#using-the-visual-designer-builder)
12. [Persisting and loading schemas](#persisting-and-loading-schemas)
13. [Storing answers](#storing-answers)
14. [Files and signatures in the answers](#files-and-signatures-in-the-answers)
15. [Uploading files (`uploadProvider`)](#uploading-files-uploadprovider)
16. [Drafts and resume](#drafts-and-resume)
17. [Troubleshooting](#troubleshooting)

---

## Overview

OpenForms is plain HTML/CSS/JavaScript with no build step and no npm dependencies:

| Module | Global class | Purpose |
|---|---|---|
| **Builder** | `window.OpenFormBuilder` | Visual form designer; produces a `FormSchemaJSON` |
| **Renderer** | `window.OpenFormRenderer` | Form player; consumes a `FormSchemaJSON`, collects and validates answers |

Files shipped in the repository:

```
src/
├── renderer.js      # OpenFormRenderer
├── builder.js       # OpenFormBuilder
└── openforms.css    # styles for both
```

Typical flow in an OutSystems app:

```
[Admin screen]     OpenFormBuilder → onSchemaChange → Client Action → Server Action → DB (SchemaJSON)
[End-user screen]  DB (SchemaJSON) → Block with OpenFormRenderer → onSubmit → Client Action → Server Action → DB (AnswersJSON)
```

The schema and the answers are JSON text: store them in `Text` attributes with **Length = 0** (unlimited) in your own entities. The component never calls your server by itself; every server call goes through Client Actions that you write.

**Dependencies.** The renderer and builder load no third-party library. Icons are inline SVG inside the two scripts (no icon library to load, and nothing on the host page is touched), and signatures are drawn on a canvas by the component itself. The components make no external request. Typed signatures use the font stack `'Caveat', 'Segoe Script', 'Bradley Hand', cursive`; to load the Caveat webfont, pass `handwritingFontUrl` (see the Integration Guide).

---

## How to call Client Actions from a JavaScript node

In a JavaScript node (Reactive Web in O11, and ODC) you call a Client Action as `$actions.ActionName(...)`:

- **Arguments are positional, in the order of the action's input parameters.** For an action with inputs `FieldKey`, `Source`, `Locale` you write `$actions.GetFieldOptions(fieldKey, source, locale)`. Do **not** pass an object such as `{ FieldKey: ... }`.
- It returns a **promise** that resolves to an object with the action's **output parameters**: `.then(function (result) { result.OptionsJSON })`.
- To use an action in a JavaScript node, add it to the node's *Client Actions* list in Service Studio / ODC Studio (or the call will not be generated).

Every action used in this guide lists its input parameters in call order.

---

## Add the scripts and styles

**Option A — Scripts resource (recommended, works offline).**

1. Download the files pinned to the version you use:
   - `https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.0/src/renderer.js`
   - `https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.0/src/builder.js` (only for designer screens)
   - `https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.0/src/openforms.css`
2. O11 Reactive: **Interface → Scripts → Import Script…**. ODC: **Interface → Scripts → Import script**. Import `renderer.js` (and `builder.js`).
3. Select your Block (or Screen) and add the script to its **Required Scripts**.
   Adding the same script to both a Block and a Screen is safe: loading it twice keeps the first definition and only logs a warning if the versions differ.
4. Paste `openforms.css` into the app Theme (or the Block's Style Sheet).

   The stylesheet only styles OpenForms' own elements and follows your app's OutSystems UI colour and border-radius tokens (`--color-primary`, `--color-neutral-*`, `--border-radius-soft`, …), so forms pick up the app theme. Spacing and type keep OpenForms' own scale. It doesn't redefine those tokens for the rest of the app. To give OpenForms different values, see [customization.md](./customization.md#2-theming-only-openforms).

**Option B — CDN.**

- CSS: first line of the Theme style sheet:

  ```css
  @import url("https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.0/src/openforms.css");
  ```

- JS: in the Block's `OnInitialize`, use the OutSystems UI **RequireScript** action with `URL = "https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.0/src/renderer.js"`. Make sure the script has finished loading before the `OnReady` JavaScript node runs.

> Use the CDN only if your environment allows external scripts (CSP, offline use). Pin the version (`@1.1.0`), never `@latest`.

---

## Render a form in a Block

Create a reusable Block `OpenFormsRenderer`:

- **Input parameters:** `FormSchemaJSON` (Text, mandatory), `SavedAnswersJSON` (Text, optional), `IsReadOnly` (Boolean, default `False`)
- **Event:** `OnSubmitted` with parameter `AnswersJSON` (Text)
- **A Container** named `FormContainer` (empty)
- **Client Action `TriggerOnSubmitted`**, input `AnswersJSON` (Text): it only does *Trigger Event → OnSubmitted(AnswersJSON)*. The JavaScript node calls it to raise the Block event.
- **OnReady** and **OnDestroy** handlers (below). Each JavaScript node has an input parameter `ContainerId = FormContainer.Id`.

**`OnReady` → JavaScript node** (inputs: `ContainerId`, `FormSchemaJSON`, `SavedAnswersJSON`, `IsReadOnly`):

```javascript
var renderer = new OpenFormRenderer({
  containerEl: document.getElementById($parameters.ContainerId),
  locale: "default", // or "pt-BR", "es-ES", ...
  optionsProvider: function (field, context) { /* see "Dynamic options" */ },
  onSubmit: function (answers) {
    // TriggerOnSubmitted inputs, in order: AnswersJSON
    $actions.TriggerOnSubmitted(JSON.stringify(answers));
  }
});

var saved = $parameters.SavedAnswersJSON ? JSON.parse($parameters.SavedAnswersJSON) : null;

// render(schema, answers = null, readOnly = false)
renderer.render(JSON.parse($parameters.FormSchemaJSON), saved, $parameters.IsReadOnly);

// Keep a reference for OnDestroy and other actions (one renderer per container)
window._openForms = window._openForms || {};
window._openForms[$parameters.ContainerId] = renderer;
```

Constructor options: `containerEl`, `onSubmit(answers)` (required), `onFieldChange(answers, changedKey)` (optional, fired on every answer change, including signatures and uploads), `onPageChange(index, page)`, `onValidationError(errors)`, `locale`, `translations`, `optionsProvider`, `idPrefix`. `OpenFormRenderer.VERSION` returns the library version at runtime.

The renderer also has methods you can call from other JavaScript nodes through `window._openForms[ContainerId]`: `validate()`, `submit()`, `getAnswers()`, `setValue(key, value)`, `goToPage(index)` and `getVisiblePages()`. Pages can be skipped with page-level `conditionalRules` (see the [Schema Reference](SCHEMA_REFERENCE.md#page-branching-rules-on-a-page)); `goToPage` returns `false` for a skipped page. See the [Integration Guide](INTEGRATION_GUIDE.md#methods).

On the parent screen, handle the Block's `OnSubmitted` event with a Client Action `OnFormSubmitted` (input `AnswersJSON`, Text) — see [Handle the submitted answers](#handle-the-submitted-answers).

---

## Dynamic options (`optionsProvider`)

Fields with `optionsType: "api"` (dropdown, radio, checkbox, matrix columns) do **not** fetch anything by themselves. The renderer calls the `optionsProvider(field, { locale, readOnly })` you pass to the constructor and expects a promise of `[{ label, value }]`. `field.optionsUrl` is only a string you choose (a REST URL, or a name such as `"Countries"`). Without a provider the field shows *"Options source not configured."*; if the promise rejects it shows *"Could not load options."*. The renderer never invents options.

**Option 1 — a Client Action** (recommended; it can run an aggregate, a Server Action or a consumed REST API).

Create the Client Action `GetFieldOptions`:

- **Inputs, in this order:** `FieldKey` (Text), `Source` (Text), `Locale` (Text)
- **Output:** `OptionsJSON` (Text) — a serialized list of `{ "label": ..., "value": ... }`

```javascript
optionsProvider: function (field, context) {
  // GetFieldOptions inputs, in order: FieldKey, Source, Locale
  return $actions.GetFieldOptions(field.key, field.optionsUrl, context.locale)
    .then(function (result) {
      return JSON.parse(result.OptionsJSON); // [{ label, value }]
    });
}
```

**Option 2 — a REST endpoint** with the user's token:

```javascript
optionsProvider: function (field, context) {
  return fetch(field.optionsUrl, {
    headers: { "Authorization": "Bearer " + $parameters.AccessToken, "Accept-Language": context.locale }
  }).then(function (res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }).then(function (rows) {
    return rows.map(function (r) { return { label: r.Name, value: r.Code }; });
  });
}
```

The provider is called once per field each time `render()` runs (and again if the locale changes); moving between pages reuses the result.

---

## Handle the submitted answers

`onSubmit` receives a plain object `{ fieldKey: value, ... }`. Fields hidden by conditional rules, and disabled fields, are not included. `number` answers are numbers, or `null` when left empty.

`onSubmit` may return a promise, and `$actions` calls return one. When it does, the renderer disables the submit button until the promise settles, shows its success message only if it resolves, and shows an error message (the `submitErrorToast` translation) if it rejects, so the user can try again. The renderer waits for exactly the promise you return, so return the call to the Client Action that does the saving:

```javascript
onSubmit: function (answers) {
  // OnFormSubmitted inputs, in order: AnswersJSON
  return $actions.OnFormSubmitted(JSON.stringify(answers));
}
```

Client Action `OnFormSubmitted` (on the parent screen, handler of the Block's `OnSubmitted`):

```
// Client Action: OnFormSubmitted
// Input: AnswersJSON (Text)
1. Server Action: SaveFormAnswers (FormId, AnswersJSON)
2. Show a success message / navigate
```

Server Action `SaveFormAnswers` stores `AnswersJSON` in a `Text` (Length = 0) attribute next to the form id. See [Storing answers](#storing-answers).

If the submit needs to call a Client Action directly from the JavaScript node (for example, a screen without a Block), the same rule applies: positional arguments in the order of the input parameters.

```javascript
// OnFormSubmitted inputs, in order: AnswersJSON
$actions.OnFormSubmitted(JSON.stringify(answers));
```

---

## Clean up in OnDestroy (`destroy()`)

Reactive screens change without a page reload, so call `destroy()` when the Block goes away. Add a JavaScript node to the Block's **OnDestroy** event (input `ContainerId = FormContainer.Id`):

```javascript
var map = window._openForms || {};
if (map[$parameters.ContainerId]) {
  map[$parameters.ContainerId].destroy();
  delete map[$parameters.ContainerId];
}
```

`destroy()` removes the renderer's `window` listeners, signature ResizeObservers, pending timers, toasts and the container content, and ignores options that arrive later. Shared nodes (the image lightbox, a toast container the renderer created, the handwriting font `<link>`) are removed only when no other renderer is still on the page. It is idempotent, so calling it twice is safe. The same applies to `OpenFormBuilder`.

---

## Read-only view

Show submitted answers without allowing edits (admin review, response history):

```javascript
// render(schema, answers, readOnly)
renderer.render(JSON.parse($parameters.FormSchemaJSON), JSON.parse($parameters.SavedAnswersJSON), true);
```

In the Block above, just set `IsReadOnly = True`. In read-only mode fields are static, the Submit button is hidden, multi-page navigation still works, attachments can be previewed/downloaded and signatures are shown as images. `optionsProvider` also receives `readOnly: true` in its context.

---

## Print / Save as PDF (`print()`)

`renderer.print({ title? })` flattens every page into one read-only view and opens the browser's Print dialog (the user chooses "Save as PDF" there). No server or extra library is needed. `title` sets the document title, which browsers use as the default PDF file name.

Add a button to your Block or screen with a Client Action `PrintForm` and a JavaScript node (input `ContainerId`):

```javascript
var r = (window._openForms || {})[$parameters.ContainerId];
if (r) r.print({ title: "Employee onboarding" });
```

Notes: the user still goes through the Print dialog; the browser's own headers/footers follow their settings; generating PDFs unattended on a server needs a headless browser, which is outside OpenForms.

---

## Languages

The renderer ships `pt-BR` and `es-ES` UI dictionaries (plus the default English). Forms can carry their own `translations` node in the schema (see [SCHEMA_REFERENCE.md](./SCHEMA_REFERENCE.md)). Pass `locale` to the constructor, or switch at runtime without losing answers:

```javascript
window._openForms[$parameters.ContainerId].setLocale("pt-BR");
```

Custom UI strings can be passed with `translations: { ... }` in the constructor (see `renderer-translations.json` and `builder-translations.json` in the repository for the keys). Every text the renderer shows on its own is in that list, including "Yes / No", "Add Item", "Item #{n}", the upload sheet and the image preview labels; `{n}` and `{date}` are replaced.

---

## Using the visual designer (Builder)

Create a designer screen with a Container `FormBuilderContainer`, import `builder.js` (see [Add the scripts and styles](#add-the-scripts-and-styles)) and add this to the screen's **OnReady** JavaScript node (inputs: `ContainerId`, `ExistingSchemaJSON`):

```javascript
var timer = null;

var builder = new OpenFormBuilder({
  containerEl: document.getElementById($parameters.ContainerId),
  // Optional: schema, fieldTypes (palette allow-list), readOnly, locales, confirm / prompt
  // (see INTEGRATION_GUIDE.md, "Builder options"). Pass the stored form as `schema` instead
  // of calling loadSchema() below, e.g. schema: JSON.parse($parameters.ExistingSchemaJSON)
  onSchemaChange: function (schema) {
    // called on every design change: debounce before hitting the server
    clearTimeout(timer);
    timer = setTimeout(function () {
      // AutoSaveSchema inputs, in order: SchemaJSON
      $actions.AutoSaveSchema(JSON.stringify(schema));
    }, 1500);
  }
});

if ($parameters.ExistingSchemaJSON) {
  builder.loadSchema(JSON.parse($parameters.ExistingSchemaJSON));
}

window._osDynBuilder = builder;
```

Save button (Client Action with a JavaScript node):

```javascript
// SaveSchema inputs, in order: SchemaJSON
$actions.SaveSchema(JSON.stringify(window._osDynBuilder.schema));
```

**OnDestroy:** the builder has a `destroy()` too. Call it, and clear the debounce timer, when the screen goes away:

```javascript
if (window._osDynBuilder) {
  window._osDynBuilder.destroy();
  window._osDynBuilder = null;
}
```

---

## Persisting and loading schemas

### Recommended entity design

Create an OutSystems Entity called `DynamicForm`:

| Attribute | Data Type | Notes |
|---|---|---|
| `Id` | AutoNumber | Primary key |
| `Name` | Text(100) | Human-readable form name |
| `SchemaJSON` | Text(0) (Long Text) | Full `FormSchemaJSON` |
| `IsActive` | Boolean | Soft-delete flag |
| `IsMapped` | Boolean | Whether answers are mapped to a specific entity |
| `MappingExpression` | Text(0) (Long Text) | JSONata expression to transform answers (optional) |
| `CreatedBy` | UserId | Who designed it |
| `CreatedAt` | DateTime | Creation timestamp |
| `UpdatedAt` | DateTime | Last save timestamp |

Create a second Entity for responses: `DynamicFormResponse`:

| Attribute | Data Type | Notes |
|---|---|---|
| `Id` | AutoNumber | Primary key |
| `DynamicFormId` | DynamicForm Id | FK to form |
| `AnswersJSON` | Text(0) (Long Text) | Raw submitted answers as JSON (always stored) |
| `SubmittedBy` | UserId | Respondent |
| `SubmittedAt` | DateTime | Timestamp |

### Server Action: SaveDynamicForm

```
Input: Name (Text), SchemaJSON (Text), IsMapped (Boolean), MappingExpression (Text)
Output: FormId (DynamicForm Identifier)

1. CreateOrUpdateRecord DynamicForm
   Name = Name
   SchemaJSON = SchemaJSON
   IsMapped = IsMapped
   MappingExpression = MappingExpression
   UpdatedAt = CurrDateTime()
Output: FormId = DynamicForm.Id
```

### Server Action: GetFormSchema

```
Input: FormId (DynamicForm Identifier)
Output: SchemaJSON (Text), IsMapped (Boolean), MappingExpression (Text)

1. Aggregate: GetDynamicFormById
   Filter: DynamicForm.Id = FormId
Output:
  SchemaJSON = GetDynamicFormById.List.Current.DynamicForm.SchemaJSON
  IsMapped = GetDynamicFormById.List.Current.DynamicForm.IsMapped
  MappingExpression = GetDynamicFormById.List.Current.DynamicForm.MappingExpression
```

---

---

## Storing answers

This section covers the different strategies for persisting submitted form answers and how to map them to database fields.

> **First: don't use `Binary Data`** for JSON storage. Use a `Text` attribute with **max length = 0** — OutSystems' way of declaring an unlimited / LongText field.

---

### Strategy 1 — JSON Blob (Always do this)

The simplest and most flexible approach: store the raw `AnswersJSON` as a `LongText` attribute on the `DynamicFormResponse` entity. This is your source of truth and requires zero schema knowledge.

```
Entity: DynamicFormResponse
├── Id             (AutoNumber)
├── DynamicFormId  (FK → DynamicForm)
├── AnswersJSON    (Text, Length = 0)  ← raw answers blob
├── SubmittedBy    (UserId)
└── SubmittedAt    (DateTime)
```

**Pros:** Zero friction, forward-compatible with schema changes, perfect audit trail.  
**Cons:** Cannot filter or report on individual field values using SQL Aggregates.

> ✅ **Always persist the raw blob regardless of which other strategy you use.** It is your fallback for re-processing, auditing, and future migrations.

---

### Strategy 2 — Direct Structure Mapping (No transformation needed)

This is the cleanest approach for forms that map to a known entity. The trick is **disciplined `key` naming** — if your field keys exactly match your OutSystems Structure attribute names, `JSON Deserialize` handles the mapping automatically.

**Example: An "Employee Request" form with intentional key names:**

| Field `key` in schema | OutSystems Structure attribute | Data Type |
|---|---|---|
| `FullName` | `FullName` | Text |
| `Department` | `Department` | Text |
| `StartDate` | `StartDate` | Date |
| `IsRemote` | `IsRemote` | Boolean |

> OutSystems `JSON Deserialize` is **case-insensitive** on keys, so `full_name`, `FullName`, and `fullname` all map to a `FullName` attribute. Choose one convention and stick to it.

**Server Action flow:**

```
Input: AnswersJSON (Text)

1. JSON Deserialize
   JSON = AnswersJSON
   Data Type = EmployeeRequest  ← your OutSystems Structure

2. CreateOrUpdateEmployeeRequest
   FullName   = EmployeeRequest.FullName
   Department = EmployeeRequest.Department
   StartDate  = EmployeeRequest.StartDate
   IsRemote   = EmployeeRequest.IsRemote
```

No JSONata required — `JSON Deserialize` is sufficient when key names are intentional.

---

### Strategy 3 — JSONata Transformation

JSONata becomes valuable when:

- **The form has different key naming than your entity** (e.g., you can't change an inherited schema)
- **You need to reshape or compute values** from multiple fields before persisting

**3a. Renaming / reshaping keys:**

```jsonata
{
  "FullName": first_name & " " & last_name,
  "Department": dept_code,
  "StartDate": $substringBefore(start_date_iso, "T"),
  "IsRemote": work_location = "remote"
}
```

**3b. Aggregating multi-select checkbox answers:**

```jsonata
{
  "Skills": $join(selected_skills, ", "),
  "SeniorityLevel": $number(years_experience) > 5 ? "Senior" : "Junior"
}
```

#### How to run JSONata in OutSystems Reactive Web

**Step 1 — Load the library** in your module's HTML Head or `OnApplicationReady`:

```html
<script src="https://cdn.jsdelivr.net/npm/jsonata@2.0.5/jsonata.min.js"></script>
```

**Step 2 — JavaScript node: `TransformAnswers`**

```javascript
// Inputs:  AnswersJSON (Text), MappingExpression (Text)
// Outputs: MappedJSON (Text)

var answers = JSON.parse($parameters.AnswersJSON);
var expr = jsonata($parameters.MappingExpression);
expr.evaluate(answers).then(function(result) {
  $resolve({ MappedJSON: JSON.stringify(result) });
});
```

**Step 3 — Store the expression in your `DynamicForm` entity**

Because `MappingExpression` lives alongside the `SchemaJSON` in the `DynamicForm` entity, each form definition carries its own transformation rule. Your submission logic becomes generic and reusable:

```
// Client Action: OnFormSubmitted
1. JS node: TransformAnswers
   AnswersJSON = RawAnswersJSON
   MappingExpression = GetFormSchema.MappingExpression   ← from DB
   → MappedJSON

2. Server Action: SaveMappedRecord
   MappedJSON = MappedJSON
   (JSON Deserialize → CreateOrUpdate target entity)

3. Server Action: SaveDynamicFormResponse
   AnswersJSON = RawAnswersJSON   ← always save the raw blob too
```

---

### Strategy 4 — EAV (Entity-Attribute-Value)

Use this only when you need to **query by individual field values** across many different form types — for example, "find all responses where `department = 'Engineering'`" using a standard Aggregate.

```
Entity: FormResponseAnswer
├── Id           (AutoNumber)
├── ResponseId   (FK → DynamicFormResponse)
├── FieldKey     (Text 100)
├── ValueText    (Text, Length = 0)
├── ValueNumber  (Decimal)
├── ValueDate    (Date)
└── ValueBoolean (Boolean)
```

Populate it by iterating the answers in a Server Action using `JSON Deserialize` into a generic list, then inserting one row per field key.

**Cons:** Complex aggregates, many rows per response, harder to report with standard OutSystems Aggregates. Only use this if you genuinely need ad-hoc field-level filtering.

---

### Recommended Hybrid Approach

For most OutSystems projects, this hybrid covers every case:

```
┌──────────────────────────────────────────────────────────────┐
│ 1. ALWAYS persist raw AnswersJSON → DynamicFormResponse       │
│    (LongText, zero-effort, full audit trail)                 │
│                                                              │
│ 2. For forms mapped to known entities (IsMapped = true):     │
│    - Name field keys to match Structure attributes exactly   │
│    - JSON Deserialize → CreateOrUpdate entity directly       │
│                                                              │
│ 3. For complex reshaping (MappingExpression is set):         │
│    - Run JSONata client-side before calling the Server Action │
│    - POST the mapped JSON alongside the raw blob             │
└──────────────────────────────────────────────────────────────┘
```

The `IsMapped` boolean + `MappingExpression` column on `DynamicForm` keeps your submission Client Action **fully generic** — one flow handles all form types without conditionals per form.

---

---

## Files and signatures in the answers

The answers object is plain JSON-serializable data, so `JSON.stringify(answers)` is enough, including files and signatures:

- **`file` fields** are objects `{ name, size, type, content }`, where `content` is a base64 **data URL** (with an [`uploadProvider`](#uploading-files-uploadprovider) they hold only the reference `{ name, size, type, id, url?, ... }` instead, which is the better choice on mobile). They are **not** browser `File` objects. Store them inside `AnswersJSON`, or, for large files, split them out in the Client Action and send them to a Binary Data attribute or a REST API (convert `content` with `fetch(dataUrl).then(r => r.blob())`). Mind OutSystems request size limits and the field's `maxFileSizeMB` (default 5).
- **`signature` fields** are a PNG data URL string (`data:image/png;base64,...`). Store it as a `Text` (Length = 0) attribute and show it back with an `<img src="...">`, or render the form in [read-only](#read-only-view) mode.

---

## Uploading files (`uploadProvider`)

By default a file chosen in a `file` field is read into a Base64 data URL and sits in the answers, then in your `AnswersJSON`. A handful of phone photos can exhaust the memory of a mobile app (and of the webview's JSON serialisation). With an `uploadProvider` the file goes to your backend or upload queue as soon as it is picked, and the answer keeps **only a reference** (`{ name, size, type, id, url? }`), so `AnswersJSON` stays small. Positional `$actions` only.

The provider is `(file, { field, locale, signal, onProgress }) => Promise<FileReference>`. `file` is a browser `File`/`Blob` (camera photos from Cordova/Capacitor are converted to a Blob first).

**Reactive Web / O11 and ODC — POST to a REST endpoint.** Expose an endpoint that takes multipart form data, stores the file (Binary Data attribute, or an external store) and returns the record id. Send the user's token. `XMLHttpRequest` gives a real progress bar:

```javascript
uploadProvider: function (file, context) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", $parameters.UploadUrl);   // e.g. https://myenv/MyModule/rest/Files/Upload
    xhr.setRequestHeader("Authorization", "Bearer " + $parameters.AccessToken);
    xhr.upload.onprogress = function (e) { if (e.lengthComputable) context.onProgress(e.loaded / e.total); };
    xhr.onload = function () {
      if (xhr.status < 200 || xhr.status >= 300) { reject(new Error("HTTP " + xhr.status)); return; }
      var saved = JSON.parse(xhr.responseText);          // { "Id": 123 }
      resolve({ name: file.name, size: file.size, type: file.type, id: saved.Id });
    };
    xhr.onerror = function () { reject(new Error("Network error")); };
    xhr.onabort = function () { reject(new Error("Cancelled")); };
    context.signal.addEventListener("abort", function () { xhr.abort(); });
    var body = new FormData();
    body.append("file", file, file.name);
    body.append("fieldKey", context.field.key);
    xhr.send(body);
  });
}
```

Alternatively, a **Client Action** can do the upload through an ODC service action or an aggregate-backed Server Action. Convert the Blob to what the action accepts first (for a Binary Data input, `file.arrayBuffer()`), and pass the result positionally:

```javascript
uploadProvider: function (file, context) {
  return file.arrayBuffer().then(function (buffer) {
    // SaveAttachment inputs, in order: FileName, MimeType, FieldKey, Content
    return $actions.SaveAttachment(file.name, file.type, context.field.key, new Uint8Array(buffer));
  }).then(function (result) {
    return { name: file.name, size: file.size, type: file.type, id: result.AttachmentId };
  });
}
```

(An action call cannot report progress or be aborted: the bar stays at 0% until it completes and Cancel only discards the result. Use the REST/XHR variant for large files.)

**Mobile apps — background upload queue.** In an offline-capable audit app, don't make the user wait for the network: hand the Blob to your native/background-sync queue and resolve straight away with a **local id**:

```javascript
uploadProvider: function (file, context) {
  // EnqueueUpload inputs, in order: LocalFileName, MimeType, Content; it writes the file to local storage
  // and the sync timer sends it later. It returns the local id of the queue entry.
  return file.arrayBuffer().then(function (buffer) {
    return $actions.EnqueueUpload(file.name, file.type, new Uint8Array(buffer));
  }).then(function (result) {
    return { name: file.name, size: file.size, type: file.type, id: result.LocalId };
  });
}
```

The answer keeps only `{ name, size, type, id }`; your sync logic replaces the local id by the server id when the upload finishes, and `AnswersJSON` never carries the image.

**Cleaning up.** Add `onFileRemoved: function (reference, context) { return $actions.DeleteAttachment(reference.id); }` so files that leave the form don't stay orphaned in your database. It is called with `context.reason`:

| `reason` | When |
| :--- | :--- |
| `removed` | The user deleted the file. |
| `replaced` | A new upload took the place of an existing reference. |
| `hidden` | A rule hid the field (or the repeater holding it) and its answer was reset. |
| `itemRemoved` | The user deleted the repeater item that held the file. |
| `discarded` | An upload finished after it was cancelled / re-rendered / destroyed / hidden. It was never in the answers, delete what you stored. |

It is never called for Base64 answers. With the mobile queue pattern, `reference.id` is the local id: cancel or delete the queue entry (and the server record, if it already synced).

**Submitting.** While an upload runs, `submit()` reports an error on that field ("Wait for the upload to finish.", `type: "uploadPending"`) instead of waiting; a required file field is satisfied only by a completed upload. Show references back with `reference.url` (only `https:`, `http:`, `blob:` or `data:` URLs are linked or previewed; without one the file is listed by name).

---

## Drafts and resume

Let users leave a long form and continue later. The renderer gives you the draft (`getDraft()`, `onDraftChange`) and takes it back (`restoreDraft()`); you decide where it lives. See "Drafts and resume" in the Integration Guide for the full API.

**Option 1 — an entity (works across devices).** Create an entity `FormDraft` with `FormKey` (Text), `UserId` (User Identifier), `DraftJSON` (Text), `UpdatedOn` (Date Time), and two Client Actions that call a Server Action / aggregate:

- `SaveDraft` — inputs, in this order: `FormKey` (Text), `DraftJSON` (Text)
- `LoadDraft` — input: `FormKey` (Text); output: `DraftJSON` (Text, empty when there is none)

Save through `draftStorage` (the renderer already debounces it, so the action runs after typing pauses, not on every key):

```javascript
draftStorage: {
  get: function (key) {
    // LoadDraft inputs, in order: FormKey
    return $actions.LoadDraft(key).then(function (result) { return result.DraftJSON || null; });
  },
  set: function (key, value) {
    // SaveDraft inputs, in order: FormKey, DraftJSON
    return $actions.SaveDraft(key, value);
  },
  remove: function (key) {
    return $actions.DeleteDraft(key);
  }
},
draftKey: $parameters.FormKey
```

Add `SaveDraft`, `LoadDraft` and `DeleteDraft` to the JavaScript node's *Client Actions* list. By default the user is asked "Resume your draft?"; pass `resumeDraft: "auto"` to restore silently. The draft is deleted when `onSubmit` succeeds, which only counts as success if your submit action finishes without error.

**Option 2 — only `onDraftChange` + `restoreDraft`**, if you prefer to control the flow from Service Studio (for instance to load the draft in the screen's *OnInitialize* and pass it as an input parameter):

```javascript
onDraftChange: function (draft) {
  // SaveDraft inputs, in order: FormKey, DraftJSON
  $actions.SaveDraft($parameters.FormKey, JSON.stringify(draft));
}
// ...after renderer.render(schema):
if ($parameters.DraftJSON) renderer.restoreDraft($parameters.DraftJSON); // also accepts the JSON text
```

**Mobile apps (offline).** Use `draftStorage: "local"` for a quick start, or a Local Storage entity: the same adapter shape with `get` / `set` / `remove` Client Actions that read and write that entity (they run offline).

Keep drafts small: files and signatures are Base64 inside the draft unless you use an `uploadProvider` (see above), and Text attributes are limited in size. With an `uploadProvider` the draft only holds the references.

---

## Troubleshooting

**The form is not rendering / the container is empty**

- Make sure `renderer.js` (and `builder.js`) and `openforms.css` are loaded **before** the JavaScript node runs. Use the Block's `OnReady` event, not `OnInitialize`, because the container must be in the DOM.
- Check the browser console. `OpenFormRenderer is not defined` means the script is not loaded yet (see *Required Scripts*).

**Options do not appear in a dropdown / radio / checkbox**

- For `optionsType: "api"`, make sure an `optionsProvider` is passed to the constructor.
- *"Could not load options."* means the promise rejected: check the console and, if you use `fetch`, CORS and authentication.
- The provider must resolve to an **array** of `{ label, value }`.
- `$actions.X(...)` does nothing or throws: check that the action is in the JavaScript node's Client Actions list and that arguments are **positional**, in the order of its input parameters.

**Submitted answers are incomplete**

- `field.key` must be unique across all pages; duplicates overwrite each other.
- Fields hidden by rules, or inside hidden sections, and disabled fields are intentionally excluded.

**The form misbehaves after navigating away and back**

- Call `destroy()` in `OnDestroy` and create a fresh renderer in `OnReady`.

**Schema changes are saved too frequently**

- Debounce `onSchemaChange` (see [Using the visual designer](#using-the-visual-designer-builder)).

---

*For feature requests, bugs or contributions, contact **Henrique Silva** at <contact@hfps.dev> — [hfps.dev](https://hfps.dev), or open an issue on [GitHub](https://github.com/henriquefps/open-forms).*
