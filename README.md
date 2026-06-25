# Why OpenForms?

🚀 **Try the Interactive Sandbox & Documentation:** [openforms.hfps.dev](https://openforms.hfps.dev)

In modern enterprise applications, forms are the primary way users interact with business data. However, building form interfaces manually or licensing full-featured suites often introduces significant roadblocks.

**OpenForms** provides a lightweight, developer-friendly, and 100% open-source form designer and player suite.

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
* **Naive Rendering Model:** OpenForms uses a simple DOM-redraw rendering engine. When state changes structurally, it redraws large portions of the canvas instead of performing optimized diff-based virtual DOM updates. It can experience performance drops on extremely long forms (hundreds of fields).
* **No Complex Branching Logic:** OpenForms only supports linear progression (moving sequentially through Page 1 to Page 2). It does not natively support complex logic-based branching (e.g., "if Answer A is selected, skip to Page 4").
* **Simplified Lógica Engine:** Unlike heavy proprietary string-based expression parsers, OpenForms requires structured JSON CNF rules (AND-of-ORs) for field logic and limits numeric calculations to a regex-sanitized mathematical whitelist.
* **Backend-Dependent PDF Export:** OpenForms does not generate PDFs directly in the client browser. Exporting a form to PDF currently requires setting up backend infrastructure (like a headless Playwright browser) to render the form and print it to PDF.
* **In-Memory Base64 File Storage (Heavy Uploads):** All uploaded file attachments are converted to Base64 data URLs and stored directly within the form's local JavaScript state to be submitted as part of the JSON payload. Storing extremely heavy files (such as high-definition videos or large raw photos) in local browser memory will cause performance hits and potential crash risks, making it unsuitable for massive file hosting.

---

## 3. Comparison Summary

| Feature | Typical Commercial Builders | OpenForms |
| :--- | :--- | :--- |
| **Builder Licensing** | **Paid (Commercial)** | **Free (Apache 2.0)** |
| **External Dependencies** | Bundles framework libraries | **None (Pure Vanilla JS)** |
| **Framework Integration** | Native wrappers provided | **None (Requires manual wrappers)** |
| **Rendering Efficiency** | Virtual DOM / Reactive Diffing | **DOM Redraw (Full page/section)** |
| **PDF Generation** | In-browser client-side (`jspdf`) | **Server-side (requires headless browser)** |
| **Logic & Jumps** | Complex string parser & branching | **CNF rules (Linear flow only)** |
| **OutSystems Compatibility** | Complex (loads heavy dependencies) | **High (Direct copy/paste script)** |
