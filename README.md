# Why OpenForms?

🚀 **Try the Interactive Sandbox & Documentation:** [openforms.hfps.dev](https://openforms.hfps.dev)

In modern enterprise applications, forms are the primary way users interact with business data. However, building form interfaces manually or licensing full-featured suites often introduces significant roadblocks.

**OpenForms** provides a lightweight, developer-friendly, and 100% open-source form designer and player suite.

📖 **Docs in this repo:** [Integration Guide](./INTEGRATION_GUIDE.md) · [Schema Reference](./SCHEMA_REFERENCE.md) · [Customization / Theming](./customization.md) · [Builder UI Translations](./builder-translations.json) · [Renderer UI Translations](./renderer-translations.json)

---

## 1. The Core Advantages

### 🆓 Free and Open-Source Visual Builder

Many popular form suites require a paid commercial license if you want to embed their Creator (visual form builder) inside a closed-source SaaS product or internal business tool.

* **OpenForms** licenses both the **Renderer** and the **Builder** under the developer-friendly **Apache 2.0 license**.
* You can embed the designer directly into your application, allowing your customers to design their own forms without paying any seat or distribution royalties.

### 🔌 Zero External Dependencies (True Vanilla ES6)

Other "vanilla" form libraries often bundle hidden third-party dependencies or framework runtimes under the hood.

* **OpenForms** is written in **pure ES6 Vanilla JavaScript and Modern CSS**.
* No package managers, no build step requirements, and no library overhead. This makes it ideal for environments like **OutSystems**, where importing npm modules directly into client scripts is restricted or complex.

### 🎨 Fully Customizable & Themeable

OpenForms is built on a clean semantic design system using native CSS variables.

* You do not need to override complex selectors or rebuild layouts. By simply redefining a few base HSL variables (like `--color-primary` or `--color-neutral-X`), OpenForms instantly inherits the hosting application's look, feel, and brand identity.

---

## 2. Limitations & Trade-offs (When NOT to use OpenForms)

While OpenForms is a strong choice for specific environments, it is not a direct feature-for-feature replacement for heavy commercial platforms. You should consider the following limitations before adopting it:

* **No Native Framework Integration:** If your application is built entirely in React, Vue, or Angular and you want native virtual-DOM performance, you will have to write manual wrapper components to integrate OpenForms. (Many heavy platforms provide native wrappers directly).
* **Naive Rendering Model:** OpenForms uses a simple DOM-redraw rendering engine rather than a virtual-DOM/diffing engine. The worst-case redundant-write pattern has been mitigated on both sides — the Builder debounces canvas rebuilds during rapid typing, and the Renderer computes business-rule state fully in memory before applying it to the DOM in a single pass — but full page redraws (e.g. page navigation) are still non-optimized full rebuilds, so extremely long forms (hundreds of fields) can still see performance drops.
* **No Complex Branching Logic:** OpenForms only supports linear progression (moving sequentially through Page 1 to Page 2). It does not natively support complex logic-based branching (e.g., "if Answer A is selected, skip to Page 4").
* **Simplified Logic Engine:** Unlike heavy proprietary string-based expression parsers, OpenForms requires structured JSON CNF rules (AND-of-ORs) for field logic — used consistently across both Conditional Business Rules and Cross-Field Validations — and limits numeric calculations to a regex-sanitized mathematical whitelist.
* **Backend-Dependent PDF Export (for programmatic generation):** `OpenFormRenderer.print()` lets an end-user save/print their own filled-out form as a PDF instantly, client-side, via the browser's native Print dialog — zero backend, zero extra dependency. Generating a PDF **programmatically**, with no user interaction (e.g. a server workflow emailing a receipt), still requires backend infrastructure (like a headless browser) to render the form and print it to PDF — that part of the limitation is unchanged. The client-side printout is a clean static document (values as text, signatures and image attachments as images, page titles kept), but the user still goes through the Print dialog, page headers/footers and margins depend on their browser settings, and attached PDFs/documents are listed by name only (not embedded).
* **In-Memory Base64 File Storage (Heavy Uploads):** All uploaded file attachments are converted to Base64 data URLs and stored directly within the form's local JavaScript state to be submitted as part of the JSON payload. Storing extremely heavy files (such as high-definition videos or large raw photos) in local browser memory will cause performance hits and potential crash risks, making it unsuitable for massive file hosting.

---

## 3. Comparison Summary

| Feature | Typical Commercial Builders | OpenForms |
| :--- | :--- | :--- |
| **Builder Licensing** | **Paid (Commercial)** | **Free (Apache 2.0)** |
| **External Dependencies** | Bundles framework libraries | **None (Pure Vanilla JS)** |
| **Framework Integration** | Native wrappers provided | **None (Requires manual wrappers)** |
| **Rendering Efficiency** | Virtual DOM / Reactive Diffing | **DOM Redraw (Full page/section)** |
| **PDF Generation** | In-browser client-side (`jspdf`) | **In-browser via the native Print dialog (`print()`); unattended/programmatic PDFs need a headless browser** |
| **Logic & Jumps** | Complex string parser & branching | **CNF rules (Linear flow only)** |
| **OutSystems Compatibility** | Complex (loads heavy dependencies) | **High (Direct copy/paste script)** |
