<img src="docs/img/icon.svg" alt="" width="96" height="96">

# OpenForms

OpenForms is a visual form builder (`OpenFormBuilder`) and a form renderer (`OpenFormRenderer`) for web pages, WebViews and OutSystems apps. You design a form in the builder, save it as JSON, and the renderer turns that JSON into a working form with validation, conditional rules, calculations and multi-page navigation. Both are plain JavaScript classes with no dependencies, loaded with a `<script>` tag, under the Apache 2.0 license.

- **Website and Playground:** [openforms.hfps.dev](https://openforms.hfps.dev) · [Playground](https://openforms.hfps.dev/playground) (try the builder and renderer in the browser)
- **Guides:** [Integration Guide](./INTEGRATION_GUIDE.md) · [Schema Reference](./SCHEMA_REFERENCE.md) · [OutSystems Guide](./OUTSYSTEMS_INTEGRATION.md) · [Customization and theming](./customization.md) · [Generate forms with AI](./AI_SCHEMA_PROMPT.md)
- **Translation keys:** [builder](./builder-translations.json) · [renderer](./renderer-translations.json)
- **Versions:** [CHANGELOG](./CHANGELOG.md) · [Releases](https://github.com/henriquefps/open-forms/releases)

## Quick start

Load the stylesheet and the scripts from jsDelivr, pinned to a version (`builder.js` is only needed on pages that design forms):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.1/src/openforms.css">
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.1/src/builder.js"></script>
<script src="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.1/src/renderer.js"></script>
```

Design a form:

```html
<div id="builder"></div>
<script>
  const builder = new OpenFormBuilder({
    containerEl: document.getElementById('builder'),
    onSchemaChange: (schema) => localStorage.setItem('my-form', JSON.stringify(schema))
  });
</script>
```

Render it and collect the answers:

```html
<div id="form"></div>
<script>
  const renderer = new OpenFormRenderer({
    containerEl: document.getElementById('form'),
    onSubmit: (answers) => console.log(answers) // { fieldKey: value, ... }
  });
  renderer.render(JSON.parse(localStorage.getItem('my-form')));
</script>
```

You can also copy the files from `src/` into your project; nothing has to be built. TypeScript declarations are in `src/openforms.d.ts`. The [Integration Guide](./INTEGRATION_GUIDE.md) covers every option, method and callback.

---

## Why OpenForms?

In business applications, forms are the main way users enter data. Building each form by hand is slow, and full-featured form suites often need a paid license to embed their visual designer. OpenForms is a small, open-source builder and renderer you can put inside your own product.

### Free and open-source visual builder

Many form suites require a commercial license to embed their visual builder in a closed-source product or internal tool.

* OpenForms licenses both the **renderer** and the **builder** under the **Apache 2.0 license**.
* You can embed the designer in your application so your customers design their own forms, with no seat or distribution fees.

### No external dependencies

* OpenForms is plain ES6 JavaScript and CSS. No package manager, no build step and no framework runtime.
* Icons are inline SVG and the components make no external request (no icon library, no font CDN); a handwriting webfont for typed signatures is opt-in (`handwritingFontUrl`).
* Formulas and expression rules are evaluated by a small built-in parser, not `eval` or `new Function`, so they work under a strict Content-Security-Policy.
* This suits environments like **OutSystems**, where importing npm modules into client scripts is restricted or complex.

### Themeable

* The stylesheet only styles OpenForms' own elements and exposes its design as `--of-*` CSS custom properties (colours, radius, borders, focus ring, inputs, form card).
* Colour and radius tokens follow the OutSystems UI tokens of the host app (`--color-primary`, `--color-neutral-*`, `--border-radius-soft`) when they exist, so a form picks up the app theme without extra work. Set the `--of-*` tokens to give OpenForms its own look; see [customization.md](./customization.md). The Playground has a Theme Builder with presets and contrast checks.

### Built for real forms

* **Rules:** show, hide, require or disable fields and sections, and show or hide whole pages (page branching: "if the answer is No, skip to page 4"), with AND/OR conditions on other answers. Cross-field validations compare several fields.
* **Calculations:** calculated number fields with formulas such as `{price} * {quantity}`.
* **Files:** by default an upload is stored in the answers as a Base64 data URL. With an `uploadProvider` the file goes to your backend or upload queue (with progress, cancel and retry) and the answer keeps only a small reference.
* **Drafts:** `getDraft()` / `restoreDraft()`, or built-in saving to local or session storage, with a "Resume your draft?" prompt.
* **Schema checks:** `validateSchema(schema)` reports unknown field types, duplicate keys, broken rule references and more. Stored schemas carry a `schemaVersion` and older ones are migrated when loaded.
* **TypeScript:** declarations for both classes and the schema in `src/openforms.d.ts`.
* **AI:** [AI_SCHEMA_PROMPT.md](./AI_SCHEMA_PROMPT.md) is a system prompt that lets an AI assistant draft a schema from a plain description; check the result with `validateSchema()`.
* **Languages:** every built-in text is translatable (English, Portuguese and Spanish included), and a form can carry its own translations.
* **Accessibility:** built to WCAG 2.1 AA guidelines; the renderer is tested with the keyboard and VoiceOver.
* **Print:** `renderer.print()` lets the user print or save the filled form as a PDF through the browser's Print dialog.

---

### Limitations and trade-offs (when not to use OpenForms)

OpenForms is a good fit for specific environments, but it is not a feature-for-feature replacement for large commercial platforms:

* **No framework wrappers:** in a React, Vue or Angular app you write a small wrapper component yourself.
* **Simple rendering model:** OpenForms redraws the DOM instead of diffing a virtual DOM. The builder debounces canvas rebuilds while you type, and the renderer computes rule state in memory before applying it in one pass, but page changes are full rebuilds, so very long forms (hundreds of fields on a page) can feel slower.
* **Structured logic, not an expression language:** rules are JSON (AND groups of OR conditions), and page branching works by hiding pages rather than by jump targets. Formulas allow arithmetic, comparisons, the ternary operator and a few `Math` functions; anything else evaluates to `0`.
* **Limited nesting:** a repeater cannot contain another repeater or a matrix.
* **PDF only through the browser:** `print()` works client-side, but the user goes through the Print dialog, headers and margins follow their browser settings, and attached documents are listed by name, not embedded. Generating PDFs unattended on a server (for example, emailing a receipt) needs a headless browser, outside OpenForms.
* **Base64 uploads by default:** without an `uploadProvider`, attachments travel inside the answers JSON. Large files (video, many big photos) cost memory and can crash a phone or WebView, so configure an `uploadProvider` for those. See *Uploading files* in the Integration Guide.

---

### Comparison summary

| Feature | Typical commercial builders | OpenForms |
| :--- | :--- | :--- |
| **Builder licensing** | Paid (commercial) | **Free (Apache 2.0)** |
| **External dependencies** | Bundled framework libraries | **None (plain JavaScript)** |
| **Framework integration** | Native wrappers provided | **None (write a small wrapper)** |
| **Rendering** | Virtual DOM / reactive diffing | **DOM redraw per page or section** |
| **PDF generation** | Often a bundled PDF library | **Browser Print dialog (`print()`); unattended PDFs need a headless browser** |
| **Logic and branching** | Expression languages and jump targets | **JSON rules (AND/OR) on fields, sections and pages** |
| **OutSystems compatibility** | Often complex (heavy dependencies) | **High (plain scripts and a stylesheet)** |

## License

[Apache 2.0](./LICENSE)
