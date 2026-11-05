(function () {
/**
 * Returns a debounced wrapper around fn: repeated calls within `delay` ms of each other
 * collapse into a single trailing call once things go quiet.
 */
function debounce(fn, delay) {
  let timeoutId;
  const debounced = function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
  // Lets destroy() drop a pending trailing call so it can't fire on a torn-down instance.
  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  };
  return debounced;
}

/**
 * OpenFormBuilder - The Visual Designer
 * Implementation of a high-fidelity drag-and-drop dynamic form builder
 * Supports Subsections (Section Headers), Pagination (Multi-page), and custom translations input.
 *
 * Developed by Henrique Silva (contact@hfps.dev)
 * Website: https://hfps.dev
 * License: Apache-2.0
 */
class OpenFormBuilder {
  static VERSION = '1.5.1';

  /** Current schema format version written by the builder (schemas without it are version 1). */
  static SCHEMA_VERSION = 2;
  /** Field types this build knows how to render. */
  static FIELD_TYPES = ['header', 'paragraph', 'text', 'textarea', 'number', 'date', 'boolean', 'dropdown', 'radio', 'checkbox', 'signature', 'file', 'repeater', 'matrix'];
  /** Condition operators the rule evaluator understands (`gte`/`lte` are aliases). */
  static CONDITION_OPERATORS = ['equals', 'notEquals', 'contains', 'notContains', 'greaterThan', 'greaterThanOrEquals', 'gte', 'lessThan', 'lessThanOrEquals', 'lte'];

  /**
   * Inline SVG icons (X1). Only the icons this file uses, so the component needs no icon library
   * and never touches the host page. Path data comes from Lucide (https://lucide.dev), ISC
   * License, Copyright (c) Lucide Icons and Contributors / Cole Bemis 2013-2022 (Feather, MIT).
   * Permission to use, copy, modify, and/or distribute this software for any purpose with or
   * without fee is hereby granted, provided that the above copyright notice and this permission
   * notice appear in all copies. The software is provided "as is" without warranty of any kind.
   */
  static ICONS = {
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'align-justify': '<path d="M3 5h18"/><path d="M3 12h18"/><path d="M3 19h18"/>',
    'align-left': '<path d="M21 5H3"/><path d="M15 12H3"/><path d="M17 19H3"/>',
    'binary': '<rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/>',
    'calculator': '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
    'calendar': '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>',
    'check-circle': '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    'check-square': '<path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"/><path d="m9 11 3 3L22 4"/>',
    'circle-dot': '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="12" r="10"/>',
    'columns': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>',
    'copy': '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'eye-off': '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    'file-text': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'folder': '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    'folder-plus': '<path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    'grid': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    'grip-horizontal': '<circle cx="12" cy="9" r="1"/><circle cx="19" cy="9" r="1"/><circle cx="5" cy="9" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="19" cy="15" r="1"/><circle cx="5" cy="15" r="1"/>',
    'grip-vertical': '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
    'heading': '<path d="M18 20V4"/><path d="M6 12H18"/><path d="M6 20V4"/>',
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'layers': '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    'list-collapse': '<path d="M10 5h11"/><path d="M10 12h11"/><path d="M10 19h11"/><path d="m3 10 3-3-3-3"/><path d="m3 20 3-3-3-3"/>',
    'pen-tool': '<path d="m18 13-.654-4.736a4 4 0 00-2.756-3.266l-9.163-2.9a2 2 0 00-2.017.493l-.82.819a2 2 0 00-.492 2.017l2.9 9.163a4 4 0 003.266 2.756L13 18"/><path d="M18.648 12.352a1.205 1.205 0 011.704 0l1.296 1.296a1.205 1.205 0 010 1.704l-6.296 6.296a1.205 1.205 0 01-1.704 0l-1.296-1.296a1.205 1.205 0 010-1.704z"/><path d="m3 3 6.586 6.586"/><circle cx="11" cy="11" r="2"/>',
    'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
    'plus-circle': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    'plus-square': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    'text-cursor-input': '<path d="M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6"/><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/><path d="M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1"/><path d="M9 6v12"/>',
    'toggle-left': '<circle cx="9" cy="12" r="3"/><rect width="20" height="14" x="2" y="5" rx="7"/>',
    'trash-2': '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    'upload-cloud': '<path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'
  };

  /** Palette entries in display order: field type, icon and the translation key of its label. */
  static PALETTE_ITEMS = [
    { type: 'header', icon: 'heading', label: 'sectionHeaderLabel' },
    { type: 'paragraph', icon: 'align-justify', label: 'paragraphLabel' },
    { type: 'text', icon: 'text-cursor-input', label: 'textInputLabel' },
    { type: 'textarea', icon: 'align-left', label: 'longTextAreaLabel' },
    { type: 'number', icon: 'binary', label: 'numericInputLabel' },
    { type: 'date', icon: 'calendar', label: 'dateFieldLabel' },
    { type: 'boolean', icon: 'toggle-left', label: 'booleanToggleLabel' },
    { type: 'dropdown', icon: 'list-collapse', label: 'dropdownLabel' },
    { type: 'radio', icon: 'circle-dot', label: 'radioButtonLabel' },
    { type: 'checkbox', icon: 'check-square', label: 'checkboxLabel' },
    { type: 'file', icon: 'upload-cloud', label: 'fileUploadLabel' },
    { type: 'signature', icon: 'pen-tool', label: 'canvasSignatureLabel' },
    { type: 'repeater', icon: 'layers', label: 'repeaterLabel' },
    { type: 'matrix', icon: 'grid', label: 'matrixLabel' }
  ];

  /**
   * Returns the markup of an inline SVG icon (decorative: aria-hidden, not focusable).
   * @param {string} name Key of OpenFormBuilder.ICONS (unknown names fall back to a help icon)
   * @param {string} [cls] Extra class names
   * @param {string} [style] Inline style (trusted literal)
   */
  static icon(name, cls = '', style = '') {
    const body = OpenFormBuilder.ICONS[name] || OpenFormBuilder.ICONS['help-circle'] || '';
    return `<svg class="of-icon${cls ? ' ' + cls : ''}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${style ? ` style="${style}"` : ''}>${body}</svg>`;
  }

  /**
   * S2: escapes a value for safe interpolation into HTML text or a quoted attribute.
   * Every schema-, translation- or user-derived string that goes into a template literal
   * assigned to innerHTML must pass through here. Kept as an identical copy in renderer.js
   * (no shared module by design) and guarded by a parity test.
   */
  static escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Short instance alias for OpenFormBuilder.escapeHtml, used inside template literals. */
  esc(value) {
    return OpenFormBuilder.escapeHtml(value);
  }

  /**
   * B10: translated UI string with `{name}` placeholders filled from `vars`.
   * Every user-visible string of the builder goes through this dictionary (`translations`).
   */
  t(key, vars) {
    const raw = this.translations[key];
    const text = typeof raw === 'string' ? raw : String(key);
    return vars ? text.replace(/\{(\w+)\}/g, (m, name) => (Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : m)) : text;
  }

  /** `t()` that picks `<key>One` when `vars.count === 1`, `<key>Other` otherwise. */
  tn(key, count, vars) {
    return this.t(key + (count === 1 ? 'One' : 'Other'), Object.assign({ count }, vars));
  }

  /**
   * `t()` for strings that carry light formatting, returned as safe HTML: the text is
   * escaped first, then `**x**` becomes <strong> and `` `x` `` becomes <code>.
   */
  tHtml(key, vars) {
    return this.esc(this.t(key, vars))
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
  }

  /**
   * @param {Object} options
   * @param {HTMLElement} options.containerEl Container element of the widget
   * @param {Function} options.onSchemaChange Callback fired when the schema changes
   * @param {Object} [options.translations] Custom translation overrides
   * @param {Object} [options.schema] Initial schema (cloned; same as calling loadSchema() right after construction, without the undo history)
   * @param {string[]} [options.fieldTypes] Allow-list of field types shown in the palette (default: all of OpenFormBuilder.FIELD_TYPES)
   * @param {boolean} [options.readOnly] View-only builder: no palette, no drag, no editing, no undo/redo shortcuts
   * @param {Array<{code: string, label: string}>} [options.locales] Languages offered in the "Editing Language" switcher (the base language is always first)
   * @param {Function} [options.confirm] `(message) => boolean | Promise<boolean>` replacing the built-in confirm dialog
   * @param {Function} [options.prompt] `(message, defaultValue) => string|null | Promise<string|null>` replacing the built-in prompt dialog
   */
  constructor({ containerEl, onSchemaChange, translations, schema, fieldTypes, readOnly, locales, confirm: confirmHook, prompt: promptHook }) {
    this.containerEl = containerEl;
    this.onSchemaChange = onSchemaChange;

    // A7: builder options.
    this.readOnly = !!readOnly;
    this.allowedFieldTypes = OpenFormBuilder._normalizeFieldTypes(fieldTypes);
    this.locales = OpenFormBuilder._normalizeLocales(locales);
    this._confirmHook = typeof confirmHook === 'function' ? confirmHook : null;
    this._promptHook = typeof promptHook === 'function' ? promptHook : null;
    this._dialog = null;

    // A1: everything this instance attaches outside its own container (document listeners,
    // toast nodes in the host's #toast-container, pending timers) is tracked here so
    // destroy() can remove it all.
    this._timers = new Set();
    this._toasts = new Set();
    this._documentListeners = [];
    this._isActive = false;
    this._destroyed = false;

    // Standard English Translation Dictionary
    this.translations = Object.assign({
      // Palette Sidebar
      paletteTitle: "Fields Palette",
      sectionHeaderLabel: "Section Title",
      sectionHeaderSubtitle: "Optional explanatory subtitle",
      textInputLabel: "Text Input",
      longTextAreaLabel: "Long Text (Area)",
      numericInputLabel: "Numeric Input",
      dateFieldLabel: "Date Field",
      booleanToggleLabel: "Toggle (Boolean)",
      dropdownLabel: "Dropdown",
      radioButtonLabel: "Radio Buttons (Single)",
      checkboxLabel: "Checkboxes (Multi)",
      canvasSignatureLabel: "Canvas Signature",
      fileUploadLabel: "File Upload",
      paragraphLabel: "Text Block",
      repeaterLabel: "Repeatable List",

      // Canvas / Editor Workspace
      formTitlePlaceholder: "Form Title",
      formDescPlaceholder: "Add a brief description for this form...",
      pagePrefix: "Page",
      deletePageTitle: "Delete page",
      deletePageConfirm: "Are you sure you want to delete this page? All fields inside it will be permanently deleted.",
      addPageLabel: "Add Page",
      emptyPageTitle: "is empty",
      emptyPageDesc: "Start by adding a row or dragging a field from the side palette to create responsive elements.",
      rowLabel: "Row",
      addColTitle: "Add Column in this Row",
      deleteRowTitle: "Delete Row",
      gripHorizontalTitle: "Drag to reorder",
      colDecreaseTitle: "Decrease width",
      colIncreaseTitle: "Increase width",
      colDeleteTitle: "Delete Column",
      dropFieldHere: "Drop field here",
      removeFieldTitle: "Remove Field",

      // Properties Panel
      propertiesPageTitle: "Page Properties",
      pageTitleLabel: "Page Title / Tab",
      pageTitleHint: "This text will be displayed in the progress bar and tabs.",
      propertiesHelpText: "Click on any field in the center canvas to configure its technical keys, conditional rules, and validators.",
      propertiesHeaderTitle: "Properties: Section Heading",
      sectionTitleLabel: "Section Title",
      sectionSubtitleLabel: "Subtitle (Optional)",
      sectionHeadingHint: "Section titles act as structural dividers and design elements. They do not have technical database keys and do not submit data.",
      propertiesFieldTitle: "Properties",
      fieldLabelLabel: "Label",
      fieldKeyLabel: "Database Key",
      fieldPlaceholderLabel: "Placeholder (Hint)",
      fieldRequiredLabel: "Required Field?",
      fieldRegexLabel: "Regex Validation (Optional)",
      fieldRegexPlaceholder: "e.g. ^[a-zA-Z]+$",
      fieldRegexErrorLabel: "Validator Error Message",
      fieldOptionsSourceLabel: "Options Source",
      fieldOptionsStaticLabel: "Static Options (Configured)",
      fieldOptionsApiLabel: "Dynamic REST API (URL Address)",
      fieldOptionsApiUrlLabel: "REST API URL",
      fieldOptionsApiUrlPlaceholder: "e.g. /api/countries",
      fieldOptionsApiUrlHint: "Options are supplied at runtime by the host page's optionsProvider; this URL is passed to it as a hint.",
      fieldCondNoOtherFields: "-- No other fields available --",

      // Default names
      defaultSectionTitle: "Section Title",
      defaultSectionSubtitle: "Optional explanatory subtitle",
      defaultTextPlaceholder: "Enter text...",
      defaultNumberPlaceholder: "0",
      defaultCustomLabel: "Custom Field",
      matrixLabel: "Question Matrix",
      matrixEmptyRows: "Empty Matrix rows. Click to configure rows in properties.",
      matrixRowsManagerLabel: "Matrix Rows Manager",
      matrixAddRowLabel: "Add Row",
      matrixRowLabel: "Row",
      matrixRowKeyLabel: "Row Key",

      // Conditional Business Rules Panel
      businessRulesTitle: "Conditional Business Rules",
      businessRulesLocaleNotice: "Switch to Default Language to edit business rules.",
      noBusinessRulesText: "No conditional business rules defined.",
      addBusinessRuleLabel: "Add Business Rule",
      ruleTargetVisibilityOption: "Show field if...",
      ruleTargetRequiredOption: "Make required if...",
      ruleTargetDisabledOption: "Disable field if...",
      ruleShowSectionIfLabel: "Show Section if...",
      ruleShowPageIfLabel: "Show Page if...",
      pageRulesHint: "A hidden page is skipped by Next/Previous and has no step tab. Conditions can use answers from earlier pages.",
      pageRulesBadgeTitle: "This page has visibility rules",
      ruleDeleteRuleTitle: "Delete Rule",
      ruleRemoveRuleLabel: "Remove Rule",
      ruleAddAndGroupLabel: "Add AND Group",
      ruleNoAndConditionsText: "No AND conditions. Add a group below.",
      ruleOrGroupTitle: "OR GROUP (ANY MET)",
      ruleDeleteGroupTitle: "Delete group",
      ruleDeleteGroupLabel: "Delete Group",
      ruleAddOrConditionLabel: "Add OR Condition",
      ruleNoOrConditionsText: "No OR conditions. Add one below.",
      ruleDeleteConditionTitle: "Delete Condition",
      ruleOperatorContains: "contains",
      ruleOperatorNotContains: "not contain",
      ruleCompareValueOption: "Value",
      ruleCompareFieldOption: "Field",
      ruleValueInputPlaceholder: "value",

      // Cross-Field Validations Panel
      crossFieldValidationsTitle: "Cross-Field Validations",
      crossFieldValidationsDesc: "Rules that compare multiple fields. A failed rule blocks submission and marks target fields as invalid.",
      crossFieldLocaleNotice: "Switch to Default Language to edit rule conditions. Error messages can still be translated below.",
      cfrNoRulesYetText: "No validation rules yet.",
      cfrAddValidationRuleLabel: "Add Validation Rule",
      cfrValidationRulePrefix: "Validation Rule #",
      cfrDeleteRuleTitle: "Delete rule",
      cfrLegacyNoticeText: "Legacy expression rule — click Migrate to convert to the structured builder.",
      cfrMigrateButtonLabel: "Migrate to Builder",
      cfrRuleInvalidWhenText: "Rule is invalid when ALL of the following AND groups are met:",
      cfrNoAndGroupsText: "No AND groups. Add one below.",
      cfrOrGroupLabel: "OR Group (any met)",
      cfrRemoveGroupTitle: "Remove group",
      cfrRemoveGroupLabel: "Remove Group",
      cfrNoConditionsText: "No conditions. Add one below.",
      cfrRemoveConditionTitle: "Remove condition",
      cfrOperatorContains: "contains",
      cfrOperatorNotContains: "not contains",
      cfrValueInputPlaceholder: "Value",
      cfrErrorMessageLabel: "Error Message",
      cfrErrorMessagePlaceholder: "e.g. End date must be after start date",
      cfrMarkAsInvalidLabel: "Mark as invalid:",
      cfrNoFieldsAvailableText: "No fields available.",

      // Dialogs (the built-in replacement for window.confirm / window.prompt)
      dialogOkLabel: "OK",
      dialogCancelLabel: "Cancel",
      addLocalePrompt: "Enter the language code (e.g. fr-FR, de-DE):",
      addLocaleTitle: "Add Custom Language Code",
      editingLanguageLabel: "Editing Language",
      localeDefaultLabel: "Default (Base)",
      localeCustomLabel: "{code} (Custom)",

      // Canvas
      addSectionLabel: "Add Section",
      addRowLabel: "Add Row",
      insertSectionHereTitle: "Insert Section Here",
      insertRowHereTitle: "Insert Row Here",
      sectionLabelPrefix: "Section:",
      sectionTitlePlaceholder: "Section Title...",
      emptySectionHint: "This Section is empty. Click \"+ Add Row\" in the header to start adding layout rows.",
      repeaterEmptyHint: "Empty Repeater list. Click 'Add Row' to start designing subfields.",
      formulaHiddenBadge: "hidden",

      // Toasts
      keepOneSectionToast: "You must keep at least one section on the page.",
      nestedRepeaterMatrixToast: "Nested repeaters or matrices are not supported.",
      nestedRepeaterToast: "Nested repeaters are not supported.",
      keyEmptyToast: "Field key cannot be empty.",
      keyInUseToast: "Key \"{key}\" is already used by another field.",
      keyRenamedToastOne: "Key renamed: updated {count} reference from \"{oldKey}\" to \"{newKey}\".",
      keyRenamedToastOther: "Key renamed: updated {count} references from \"{oldKey}\" to \"{newKey}\".",
      schemaProblemsToastOne: "Schema loaded with {count} problem: {message} [{path}]{more}",
      schemaProblemsToastOther: "Schema loaded with {count} problems: {message} [{path}]{more}",
      schemaProblemsMore: " (+{count} more)",
      cleanupRemovedPrefix: "Removed references to the deleted field: {parts}.",
      cleanupFormulaNotice: "Formula still references a deleted field: {formulas}.",
      cleanupConditionsOne: "{count} rule condition",
      cleanupConditionsOther: "{count} rule conditions",
      cleanupEmptiedRulesOne: "{count} emptied rule",
      cleanupEmptiedRulesOther: "{count} emptied rules",
      cleanupCrossTargetsOne: "{count} cross-field target",
      cleanupCrossTargetsOther: "{count} cross-field targets",
      cleanupCrossRulesOne: "{count} cross-field rule",
      cleanupCrossRulesOther: "{count} cross-field rules",
      cleanupTranslationsOne: "{count} translation entry",
      cleanupTranslationsOther: "{count} translation entries",

      // Properties panels
      propertiesSectionTitle: "Properties: Section",
      duplicateSectionLabel: "Duplicate Section",
      propertiesParagraphTitle: "Properties: Text Block",
      paragraphContentLabel: "Paragraph Content",
      paragraphBlockHint: "Use this block to display instructions, descriptions, or general text content in the form.",
      keyLocaleNotice: "Switch to Default Language to edit database keys.",
      maskLabel: "Custom Input Mask",
      maskPlaceholder: "e.g., 999.999.999-99",
      maskHint: "Use `9` for digits, `a` for letters, and `*` for alphanumeric. All other characters are literals.",
      maskCleanValueLabel: "Save Clean Value? (Strip symbols in answers)",
      calculatedFieldLabel: "Is Calculated Field? (Formula)",
      formulaExpressionLabel: "Formula Expression",
      formulaExpressionPlaceholder: "e.g., {price} * {quantity}",
      formulaInsertFieldLabel: "Insert field:",
      formulaNoNumericFields: "No other numeric fields available.",
      formulaInsertFunctionLabel: "Insert function:",
      formulaHelpText: "Wrap other numeric database keys in curly braces (e.g. `{price}`). Supported: operators `+ - * / %`, parentheses `( )`, comparisons `> < >= <= == !=`, ternary `condition ? a : b`, and `Math.min/max/round/abs/floor/ceil(...)`. Nothing else is evaluated.",
      formulaVisibleOnFormLabel: "Visible on Form?",
      formulaVisibleOnFormHint: "Uncheck to keep computing this value silently (e.g. as an input to a Cross-Field Validation) without showing it as a field on the rendered form.",
      fileAcceptedTypesLabel: "Accepted Attachment Types",
      fileAcceptedTypesPlaceholder: "e.g. .pdf,.docx,image/*",
      fileAcceptedTypesHint: "Comma-separated extensions or mime types (e.g. .pdf,image/*,.docx)",
      fileRequirementsLabel: "File Requirements Text",
      fileRequirementsPlaceholder: "e.g. Maximum size 10MB",
      fileRequirementsHint: "Help text indicating format/size limits.",
      fileMaxSizeLabel: "Maximum File Size (MB)",
      fileMaxSizeHint: "File size limit in Megabytes.",
      useNativeCameraLabel: "Use Native Camera (Cordova/Capacitor)?",
      nativeCameraSourceLabel: "Native Camera Source",
      nativeCameraOptionCamera: "Camera Only",
      nativeCameraOptionPhotos: "Photo Library Only",
      nativeCameraOptionPrompt: "Prompt (Camera or Library)",
      addOptionLabel: "Add Option",
      optionLabelPlaceholder: "Label",
      optionValuePlaceholder: "value",
      removeOptionTitle: "Remove option",
      translateOptionLabelsLabel: "Translate Option Labels",
      translationPlaceholder: "Translation...",
      repeaterMinItemsLabel: "Minimum Items",
      repeaterMaxItemsLabel: "Maximum Items",
      repeaterAddButtonLabel: "Add Button Label",
      removeRowTitle: "Remove Row",

      // Defaults written into newly created fields (authored content, editable afterwards)
      defaultRegexErrorMessage: "Incorrect value pattern.",
      defaultParagraphText: "This is an explanatory text block. You can write instructions here.",
      defaultRepeaterAddButton: "Add Item",
      defaultRepeaterItemName: "Item Name",
      defaultOptionLabel: "Option {n}",
      defaultMatrixRowLabel: "Question Row {n}",
      duplicatedSectionSuffix: "(Copy)",
      duplicatedSectionTitle: "Section Copy"
    }, translations || {});

    // Active page state
    this.activePageIndex = 0;

    // Currently selected field ID
    this.selectedFieldId = null;
    this.selectedSectionId = null;

    // Drag-and-drop state variables
    this.draggedFieldType = null;
    this.draggedSourceElement = null;
    this.draggedRowId = null;
    this.draggedSectionId = null;
    this.draggedSubRowId = null;

    // Initial Schema State: the `schema` option when given, otherwise an empty form.
    const initialSchema = schema && typeof schema === 'object' && !Array.isArray(schema) ? schema : null;
    const initialReport = initialSchema ? OpenFormBuilder.validateSchema(initialSchema) : null;
    this.schema = this.normalizeSchema(initialSchema ? JSON.parse(JSON.stringify(initialSchema)) : {
      formTitle: "Untitled Form",
      formDescription: "",
      pages: []
    });

    // Initialize Undo/Redo History Stacks
    this.undoStack = [];
    this.redoStack = [];
    this.isApplyingHistoryState = false;
    this.lastSavedStateString = JSON.stringify(this.schema);
    // A4: snapshot used by isDirty()/markSaved(); the empty initial form counts as saved.
    this.savedStateString = this.lastSavedStateString;
    // A4: typing burst being coalesced into one undo step (see notifyChange()).
    this._burst = null;
    this._burstTimer = null;
    this._pendingInput = null;

    this.editingLocale = 'default';

    // A3: full canvas teardown+rebuild is expensive on large forms — debounced so that
    // rapid-fire `input` events (typing in a label, placeholder, etc.) collapse into a
    // single re-render once the user pauses, instead of one per keystroke. Only used by
    // `input`-bound handlers; click/drag/`change`-driven calls stay on `this.render()`
    // directly since those fire once per discrete action, not in bursts. Schema mutation
    // and `notifyChange()` (undo stack + the live preview sync) are never debounced —
    // those stay perfectly in sync with what was typed, only this canvas's own visual
    // repaint lags slightly behind.
    this.debouncedRender = debounce(() => {
      if (!this._destroyed) this.render();
    }, 200);

    this.buildHTMLShell();
    this.init();
    this._bindInputBurstTracking();

    // Bind Keyboard Shortcuts for Undo/Redo
    this.bindKeyboardShortcuts();
    this._bindReadOnlyGuards();

    // Like loadSchema(): the schema always loads, problems are only reported.
    if (initialReport && initialReport.errors.length > 0) this._reportSchemaProblems(initialReport);
  }

  /** A7: keeps only known, unique field types; `null` means "all types". */
  static _normalizeFieldTypes(fieldTypes) {
    if (!Array.isArray(fieldTypes)) return null;
    const known = OpenFormBuilder.FIELD_TYPES;
    const result = [];
    fieldTypes.forEach(type => {
      if (!known.includes(type)) {
        if (typeof console !== 'undefined') console.warn(`OpenFormBuilder: unknown field type "${type}" in the fieldTypes option was ignored.`);
      } else if (!result.includes(type)) {
        result.push(type);
      }
    });
    return result;
  }

  /** A7: `[{ code, label }]` (invalid entries dropped); the default list when not an array. */
  static _normalizeLocales(locales) {
    if (!Array.isArray(locales)) {
      return [
        { code: 'pt-BR', label: 'Português (pt-BR)' },
        { code: 'en-US', label: 'English (en-US)' },
        { code: 'es-ES', label: 'Español (es-ES)' }
      ];
    }
    const result = [];
    locales.forEach(loc => {
      if (!loc || typeof loc.code !== 'string' || !loc.code.trim()) return;
      const code = loc.code.trim();
      if (code === 'default' || result.some(l => l.code === code)) return;
      result.push({ code, label: typeof loc.label === 'string' && loc.label ? loc.label : code });
    });
    return result;
  }

  /** A7: true when a palette type may be created (always true without a `fieldTypes` allow-list). */
  isFieldTypeAllowed(type) {
    return !this.readOnly && (!this.allowedFieldTypes || this.allowedFieldTypes.includes(type));
  }

  /**
   * Technical dynamic translations schema value retrieval
   */
  getTranslationValue(category, targetKey, subCategory, optKey) {
    if (!this.schema.translations || !this.schema.translations[this.editingLocale]) {
      return '';
    }
    const dict = this.schema.translations[this.editingLocale];
    if (category === 'fields') {
      if (!dict.fields || !dict.fields[targetKey]) return '';
      if (subCategory === 'options') {
        return (dict.fields[targetKey].options && dict.fields[targetKey].options[optKey]) || '';
      }
      if (subCategory === 'matrixRows') {
        return (dict.fields[targetKey].matrixRows && dict.fields[targetKey].matrixRows[optKey]) || '';
      }
      return dict.fields[targetKey][subCategory] || '';
    }
    if (category === 'sections') {
      return (dict.sections && dict.sections[targetKey] && dict.sections[targetKey].title) || '';
    }
    if (category === 'pages') {
      return (dict.pages && dict.pages[targetKey] && dict.pages[targetKey].title) || '';
    }
    if (category === 'form') {
      return dict[targetKey] || '';
    }
    if (category === 'crossFieldRules') {
      return (dict.crossFieldRules && dict.crossFieldRules[targetKey] && dict.crossFieldRules[targetKey].errorMessage) || '';
    }
    return '';
  }

  /**
   * Sets localized translations branch dynamically inside schema properties dictionary
   */
  setTranslationValue(category, targetKey, subCategory, optKeyOrValue, value) {
    if (this.readOnly) return;
    if (!this.schema.translations) {
      this.schema.translations = {};
    }
    if (!this.schema.translations[this.editingLocale]) {
      this.schema.translations[this.editingLocale] = {
        formTitle: '',
        formDescription: '',
        pages: {},
        sections: {},
        fields: {}
      };
    }
    const dict = this.schema.translations[this.editingLocale];

    if (category === 'form') {
      dict[targetKey] = optKeyOrValue;
    } else if (category === 'pages') {
      if (!dict.pages) dict.pages = {};
      if (!dict.pages[targetKey]) dict.pages[targetKey] = {};
      dict.pages[targetKey].title = optKeyOrValue;
    } else if (category === 'sections') {
      if (!dict.sections) dict.sections = {};
      if (!dict.sections[targetKey]) dict.sections[targetKey] = {};
      dict.sections[targetKey].title = optKeyOrValue;
    } else if (category === 'fields') {
      if (!dict.fields) dict.fields = {};
      if (!dict.fields[targetKey]) dict.fields[targetKey] = {};
      if (subCategory === 'options') {
        if (!dict.fields[targetKey].options) dict.fields[targetKey].options = {};
        dict.fields[targetKey].options[optKeyOrValue] = value;
      } else if (subCategory === 'matrixRows') {
        if (!dict.fields[targetKey].matrixRows) dict.fields[targetKey].matrixRows = {};
        dict.fields[targetKey].matrixRows[optKeyOrValue] = value;
      } else {
        dict.fields[targetKey][subCategory] = optKeyOrValue;
      }
    } else if (category === 'crossFieldRules') {
      if (!dict.crossFieldRules) dict.crossFieldRules = {};
      if (!dict.crossFieldRules[targetKey]) dict.crossFieldRules[targetKey] = {};
      dict.crossFieldRules[targetKey].errorMessage = optKeyOrValue;
    }
    this.notifyChange();
  }

  /**
   * Removes unused empty keys from properties translations dictionary
   */
  deleteTranslationValue(category, targetKey, subCategory, optKey) {
    if (this.readOnly) return;
    if (!this.schema.translations || !this.schema.translations[this.editingLocale]) return;
    const dict = this.schema.translations[this.editingLocale];
    if (category === 'form') {
      delete dict[targetKey];
    } else if (category === 'pages') {
      if (dict.pages && dict.pages[targetKey]) {
        delete dict.pages[targetKey];
      }
    } else if (category === 'sections') {
      if (dict.sections && dict.sections[targetKey]) {
        delete dict.sections[targetKey];
      }
    } else if (category === 'fields') {
      if (dict.fields && dict.fields[targetKey]) {
        if (subCategory === 'options') {
          if (dict.fields[targetKey].options) {
            delete dict.fields[targetKey].options[optKey];
            if (Object.keys(dict.fields[targetKey].options).length === 0) {
              delete dict.fields[targetKey].options;
            }
          }
        } else if (subCategory === 'matrixRows') {
          if (dict.fields[targetKey].matrixRows) {
            delete dict.fields[targetKey].matrixRows[optKey];
            if (Object.keys(dict.fields[targetKey].matrixRows).length === 0) {
              delete dict.fields[targetKey].matrixRows;
            }
          }
        } else {
          delete dict.fields[targetKey][subCategory];
        }
        if (Object.keys(dict.fields[targetKey]).length === 0) {
          delete dict.fields[targetKey];
        }
      }
    } else if (category === 'crossFieldRules') {
      if (dict.crossFieldRules && dict.crossFieldRules[targetKey]) {
        delete dict.crossFieldRules[targetKey];
      }
    }
    // Clean up empty objects to optimize JSON output size
    if (dict.fields && Object.keys(dict.fields).length === 0) delete dict.fields;
    if (dict.sections && Object.keys(dict.sections).length === 0) delete dict.sections;
    if (dict.pages && Object.keys(dict.pages).length === 0) delete dict.pages;
    if (dict.crossFieldRules && Object.keys(dict.crossFieldRules).length === 0) delete dict.crossFieldRules;
    if (Object.keys(dict).length === 0) {
      delete this.schema.translations[this.editingLocale];
    }
    this.notifyChange();
  }

  /**
   * Generates elegant, harmonized language switcher panel
   */
  renderLocaleSwitcherHTML() {
    const locales = [{ code: 'default', label: this.translations.localeDefaultLabel }].concat(this.locales);

    if (this.schema.translations) {
      Object.keys(this.schema.translations).forEach(code => {
        if (!locales.some(l => l.code === code)) {
          locales.push({ code, label: this.t('localeCustomLabel', { code }) });
        }
      });
    }

    const selectOptionsHTML = locales.map(loc =>
      `<option value="${this.esc(loc.code)}" ${this.editingLocale === loc.code ? 'selected' : ''}>${this.esc(loc.label)}</option>`
    ).join('');

    return `
      <div class="properties-locale-switcher" style="">
        <label class="prop-label" style="margin-bottom: 6px; display: block; font-size: var(--of-font-size-xs); text-transform: uppercase; letter-spacing: 0.5px; color: var(--of-color-neutral-7); font-weight: var(--of-font-weight-bold);">${this.esc(this.translations.editingLanguageLabel)}</label>
        <div style="display: flex; gap: var(--of-space-s); align-items: center;">
          <select id="prop-editing-locale" class="prop-input" style="flex: 1; padding: var(--of-space-xs) var(--of-space-s); font-size: var(--of-font-size-s); height: 30px; margin-bottom: 0;">
            ${selectOptionsHTML}
          </select>
          <button id="btn-add-locale" class="pg-btn pg-btn-secondary" style="padding: 0 var(--of-space-s); font-size: var(--of-font-size-xs); height: 30px; display: flex; align-items: center; justify-content: center;" title="${this.esc(this.translations.addLocaleTitle)}">
            ${OpenFormBuilder.icon('plus', '', 'width: 14px; height: 14px;')}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Binds change listeners and custom language creation events to switcher controls
   */
  bindLocaleSwitcherEvents() {
    const switcher = this.propertiesEl.querySelector('#prop-editing-locale');
    if (switcher) {
      switcher.addEventListener('change', (e) => {
        this.editingLocale = e.target.value;
        this.renderProperties();
        this.render(); // sync canvas preview to show translation instantly!
      });
    }

    const addBtn = this.propertiesEl.querySelector('#btn-add-locale');
    if (addBtn) {
      addBtn.addEventListener('click', async () => {
        if (this.readOnly) return;
        const code = await this.prompt(this.translations.addLocalePrompt, '');
        if (code && !this._destroyed && !this.readOnly) {
          const sanitized = code.trim().replace(/[^a-zA-Z\-]/g, '');
          if (sanitized) {
            this.editingLocale = sanitized;
            // Seed formTitle translation to ensure dictionary branch is initialized
            this.setTranslationValue('form', 'formTitle', null, this.getTranslationValue('form', 'formTitle') || this.schema.formTitle);
            this.renderProperties();
            this.render();
          }
        }
      });
    }
  }


  /**
   * Static, side-effect free schema check. Returns `{ valid, errors, warnings }` where every
   * entry is `{ path, code, message }` (path like `pages[0].sections[1].rows[0].columns[0].field`).
   * `valid` is true when there are no errors; warnings never invalidate. Accepts raw stored
   * schemas, including legacy shapes (flat `rows`, page `rows`, repeater `fields`).
   * NOTE: this implementation is duplicated verbatim in OpenFormBuilder and OpenFormRenderer
   * (kept identical by tests/shared/validate-schema-parity.test.js).
   */
  static validateSchema(schema) {
    const errors = [];
    const warnings = [];
    const addTo = (list) => (path, code, message) => list.push({ path, code, message });
    const err = addTo(errors);
    const warn = addTo(warnings);

    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
      err('', 'invalid-schema', 'The schema must be a JSON object.');
      return { valid: false, errors, warnings };
    }

    const fieldTypes = this.FIELD_TYPES;
    const operators = this.CONDITION_OPERATORS;
    const noKeyTypes = ['header', 'paragraph'];
    const optionTypes = ['dropdown', 'radio', 'checkbox', 'matrix'];

    if (schema.schemaVersion !== undefined) {
      if (!Number.isInteger(schema.schemaVersion) || schema.schemaVersion < 1) {
        warn('schemaVersion', 'invalid-schema-version', `schemaVersion should be a positive integer, got ${JSON.stringify(schema.schemaVersion)}.`);
      } else if (schema.schemaVersion > this.SCHEMA_VERSION) {
        warn('schemaVersion', 'newer-schema-version', `Schema version ${schema.schemaVersion} is newer than the supported version ${this.SCHEMA_VERSION}; it will be handled on a best-effort basis.`);
      }
    }

    const allKeys = new Set();
    const refChecks = []; // deferred: { path, key }
    const addRef = (path, key) => {
      if (typeof key === 'string' && key !== '') refChecks.push({ path, key });
    };
    const tokenRefs = (path, expression) => {
      if (typeof expression !== 'string') return;
      const re = /\{([^}]+)\}/g;
      let m;
      while ((m = re.exec(expression)) !== null) addRef(path, m[1]);
    };

    const checkRules = (path, rules) => {
      if (rules === undefined || rules === null) return;
      if (!Array.isArray(rules)) { err(path, 'invalid-rules', 'conditionalRules must be an array.'); return; }
      rules.forEach((rule, ri) => {
        (rule && Array.isArray(rule.andGroups) ? rule.andGroups : []).forEach((group, gi) => {
          (group && Array.isArray(group.conditions) ? group.conditions : []).forEach((cond, ci) => {
            checkCondition(`${path}[${ri}].andGroups[${gi}].conditions[${ci}]`, cond);
          });
        });
      });
    };
    const checkCondition = (path, cond) => {
      if (!cond || typeof cond !== 'object') return;
      if (!operators.includes(cond.operator)) {
        err(`${path}.operator`, 'unknown-operator', `Unknown operator ${JSON.stringify(cond.operator)}; the condition is never satisfied. Supported: ${operators.join(', ')}.`);
      }
      addRef(`${path}.dependentFieldKey`, cond.dependentFieldKey);
      if (cond.compareMode === 'field') addRef(`${path}.compareToFieldKey`, cond.compareToFieldKey);
    };

    // Page rules: which page each top-level key lives on, and the references to check against it
    const keyPage = new Map();
    const pageRefs = [];
    let currentPageIndex = -1;

    // Scopes: top-level fields share one key namespace; each repeater's sub-fields have their own.
    const scopes = new Map();
    const registerKey = (scope, key, path) => {
      if (!scopes.has(scope)) scopes.set(scope, new Map());
      const seen = scopes.get(scope);
      if (seen.has(key)) {
        err(`${path}.key`, 'duplicate-key', `Key "${key}" is already used at ${seen.get(key)}.`);
      } else {
        seen.set(key, path);
      }
    };

    const walkRows = (rows, basePath, scope) => {
      if (rows === undefined || rows === null) return;
      if (!Array.isArray(rows)) { err(basePath, 'invalid-rows', 'rows must be an array.'); return; }
      rows.forEach((row, ri) => {
        const rowPath = `${basePath}[${ri}]`;
        const columns = row && Array.isArray(row.columns) ? row.columns : [];
        columns.forEach((col, ci) => {
          const colPath = `${rowPath}.columns[${ci}]`;
          if (!col || typeof col !== 'object') return;
          if (!Number.isInteger(col.width) || col.width < 1 || col.width > 12) {
            err(`${colPath}.width`, 'invalid-width', `Column width must be an integer from 1 to 12, got ${JSON.stringify(col.width)}.`);
          }
          if (col.field) walkField(col.field, `${colPath}.field`, scope);
        });
      });
    };

    const walkField = (field, path, scope) => {
      if (!field || typeof field !== 'object') return;
      const type = field.type;
      if (typeof type !== 'string' || !fieldTypes.includes(type)) {
        err(`${path}.type`, 'unknown-field-type', type === undefined
          ? 'The field has no type.'
          : `Unknown field type ${JSON.stringify(type)}; it renders as an unsupported placeholder and is not part of the answers.`);
      }
      if (!noKeyTypes.includes(type)) {
        if (typeof field.key !== 'string' || field.key === '') {
          err(`${path}.key`, 'missing-key', 'Data fields need a key (the name their answer is stored under).');
        } else {
          allKeys.add(field.key);
          if (scope === '') keyPage.set(field.key, currentPageIndex);
          registerKey(scope, field.key, path);
        }
      }
      if (optionTypes.includes(type) && field.optionsType === 'api' && !field.optionsUrl) {
        warn(`${path}.optionsUrl`, 'missing-options-url', 'optionsType is "api" but optionsUrl is empty.');
      }
      checkRules(`${path}.conditionalRules`, field.conditionalRules);
      if (field.visibilityCondition) checkCondition(`${path}.visibilityCondition`, field.visibilityCondition);
      tokenRefs(`${path}.formulaExpression`, field.formulaExpression);
      if (type === 'repeater') {
        const subScope = path;
        if (Array.isArray(field.rows)) walkRows(field.rows, `${path}.rows`, subScope);
        else if (Array.isArray(field.fields)) {
          field.fields.forEach((sub, i) => walkField(sub, `${path}.fields[${i}]`, subScope));
        }
      }
    };

    // Legacy shapes: top-level `rows` is a single implicit page; page `rows` an implicit section.
    let pages = schema.pages;
    if (!Array.isArray(pages) && Array.isArray(schema.rows)) pages = [{ rows: schema.rows }];
    if (pages !== undefined && !Array.isArray(pages)) {
      err('pages', 'invalid-pages', 'pages must be an array.');
      pages = [];
    }
    (pages || []).forEach((page, pi) => {
      const pagePath = `pages[${pi}]`;
      if (!page || typeof page !== 'object') return;
      currentPageIndex = pi;
      // Page rules reuse the field/section condition checks; their references are verified
      // against the page order below (an answer the page itself or a later page provides).
      if (page.conditionalRules !== undefined && page.conditionalRules !== null && Array.isArray(page.conditionalRules)) {
        page.conditionalRules.forEach((rule, ri) => {
          (rule && Array.isArray(rule.andGroups) ? rule.andGroups : []).forEach((group, gi) => {
            (group && Array.isArray(group.conditions) ? group.conditions : []).forEach((cond, ci) => {
              if (!cond || typeof cond !== 'object') return;
              const condPath = `${pagePath}.conditionalRules[${ri}].andGroups[${gi}].conditions[${ci}]`;
              if (typeof cond.dependentFieldKey === 'string' && cond.dependentFieldKey !== '') pageRefs.push({ path: `${condPath}.dependentFieldKey`, key: cond.dependentFieldKey, pageIndex: pi });
              if (cond.compareMode === 'field' && typeof cond.compareToFieldKey === 'string' && cond.compareToFieldKey !== '') pageRefs.push({ path: `${condPath}.compareToFieldKey`, key: cond.compareToFieldKey, pageIndex: pi });
            });
          });
        });
      }
      checkRules(`${pagePath}.conditionalRules`, page.conditionalRules);
      let sections = page.sections;
      if (!Array.isArray(sections) && Array.isArray(page.rows)) sections = [{ rows: page.rows }];
      (Array.isArray(sections) ? sections : []).forEach((section, si) => {
        const secPath = `${pagePath}.sections[${si}]`;
        if (!section || typeof section !== 'object') return;
        checkRules(`${secPath}.conditionalRules`, section.conditionalRules);
        if (section.visibilityCondition) checkCondition(`${secPath}.visibilityCondition`, section.visibilityCondition);
        walkRows(section.rows, `${secPath}.rows`, '');
      });
    });

    if (schema.crossFieldRules !== undefined) {
      if (!Array.isArray(schema.crossFieldRules)) {
        err('crossFieldRules', 'invalid-rules', 'crossFieldRules must be an array.');
      } else {
        schema.crossFieldRules.forEach((rule, i) => {
          const rulePath = `crossFieldRules[${i}]`;
          if (!rule || typeof rule !== 'object') return;
          (Array.isArray(rule.targetFields) ? rule.targetFields : []).forEach((key, ti) => addRef(`${rulePath}.targetFields[${ti}]`, key));
          (Array.isArray(rule.andGroups) ? rule.andGroups : []).forEach((group, gi) => {
            (group && Array.isArray(group.conditions) ? group.conditions : []).forEach((cond, ci) => {
              checkCondition(`${rulePath}.andGroups[${gi}].conditions[${ci}]`, cond);
            });
          });
          tokenRefs(`${rulePath}.expression`, rule.expression);
        });
      }
    }

    refChecks.forEach(({ path, key }) => {
      if (!allKeys.has(key)) err(path, 'unknown-field-reference', `References unknown field key "${key}".`);
    });

    pageRefs.forEach(({ path, key, pageIndex }) => {
      const keyPageIndex = keyPage.get(key);
      if (keyPageIndex === undefined) return;
      if (keyPageIndex === pageIndex) {
        warn(path, 'page-rule-self-reference', `The rule of page ${pageIndex + 1} depends on "${key}", a field on that same page: the page would hide itself while it is being answered.`);
      } else if (keyPageIndex > pageIndex) {
        warn(path, 'page-rule-forward-reference', `The rule of page ${pageIndex + 1} depends on "${key}", which is on a later page: it has no answer the first time the form is filled in, so the page starts ${'hidden or shown by an empty value'}.`);
      }
    });

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Brings any supported schema up to the current shape. Ordered steps: detect the schema's
   * version (no `schemaVersion` = 1, the legacy shape-detected forms), run each migration
   * from that version onwards, then fill defaults and stamp the current `schemaVersion`.
   * A schema from a newer version skips migrations and keeps its own version (best effort).
   * NOTE: duplicated in OpenFormBuilder and OpenFormRenderer (tests/shared/normalize-schema-parity.test.js).
   */
  normalizeSchema(schema) {
    if (!schema) {
      schema = {
        formTitle: "Untitled Form",
        formDescription: "",
        pages: []
      };
    }

    const current = this.constructor.SCHEMA_VERSION;
    const declared = schema.schemaVersion;
    const version = Number.isInteger(declared) && declared >= 1 ? declared : 1;

    if (version > current) {
      this._applySchemaDefaults(schema);
      return schema;
    }

    this._schemaMigrations().forEach(step => {
      if (step.from >= version) {
        schema = step.run(schema) || schema;
        schema.schemaVersion = step.to;
      }
    });
    this._applySchemaDefaults(schema);
    schema.schemaVersion = current;
    return schema;
  }

  /** Ordered, named migration steps. Add a new `{ from, to, name, run }` entry per schema version bump. */
  _schemaMigrations() {
    return [
      { from: 1, to: 2, name: 'legacy-shapes', run: (schema) => this._migrateLegacyShapes(schema) }
    ];
  }

  /**
   * Migration 1 -> 2: converts the shape-detected legacy forms (flat `rows`, page `rows`,
   * `visibilityCondition`, repeater `fields`) into the current structure.
   */
  _migrateLegacyShapes(schema) {
    const visibilityToRule = (cond) => ({
      targetProperty: "visibility",
      andGroups: [
        {
          conditions: [
            {
              dependentFieldKey: cond.dependentFieldKey,
              operator: cond.operator,
              equalsValue: cond.equalsValue
            }
          ]
        }
      ]
    });

    // Legacy flat rows structure -> single page
    if (!schema.pages && schema.rows) {
      schema.pages = [{ pageId: "page-default", rows: schema.rows }];
      delete schema.rows;
    }
    if (!Array.isArray(schema.pages)) return schema;

    const migrateField = (field) => {
      if (!field) return;
      if (field.visibilityCondition) {
        if (!Array.isArray(field.conditionalRules)) field.conditionalRules = [];
        field.conditionalRules.push(visibilityToRule(field.visibilityCondition));
        delete field.visibilityCondition;
      }
      if (field.type === 'repeater') {
        if (field.fields && !field.rows) {
          field.rows = field.fields.map(subField => ({
            rowId: `r-sub-${Math.random().toString(36).substr(2, 9)}`,
            columns: [{ width: 12, field: subField }]
          }));
          delete field.fields;
        }
        (field.rows || []).forEach(r => (r.columns || []).forEach(c => migrateField(c.field)));
      }
    };

    schema.pages.forEach(page => {
      if (!page) return;
      // Page with `rows` but no `sections` -> one default section
      if (page.rows && (!page.sections || page.sections.length === 0)) {
        page.sections = [{ title: "", conditionalRules: [], rows: page.rows }];
        delete page.rows;
      }
      (Array.isArray(page.sections) ? page.sections : []).forEach(section => {
        if (!section) return;
        if (section.visibilityCondition) {
          if (!Array.isArray(section.conditionalRules)) section.conditionalRules = [];
          section.conditionalRules.push(visibilityToRule(section.visibilityCondition));
          delete section.visibilityCondition;
        }
        (Array.isArray(section.rows) ? section.rows : []).forEach(row => {
          (row && Array.isArray(row.columns) ? row.columns : []).forEach(col => migrateField(col && col.field));
        });
      });
    });
    return schema;
  }

  /** Fills in everything a schema of the current version may omit (pages, ids, titles, rule/row arrays). */
  _applySchemaDefaults(schema) {
    if (!schema.pages || !Array.isArray(schema.pages) || schema.pages.length === 0) {
      schema.pages = [
        {
          pageId: "page-default",
          title: `${this.translations.pagePrefix} 1`,
          sections: []
        }
      ];
    }

    const defaultField = (field) => {
      if (!field) return;
      if (!Array.isArray(field.conditionalRules)) field.conditionalRules = [];
      if (field.type === 'repeater') {
        if (!field.rows) field.rows = [];
        field.rows.forEach(r => {
          if (!r.columns) r.columns = [];
          r.columns.forEach(c => defaultField(c.field));
        });
      }
    };

    schema.pages.forEach((page, index) => {
      if (!page.pageId) page.pageId = `page-${Math.random().toString(36).substr(2, 9)}`;
      if (!page.title) page.title = `${this.translations.pagePrefix} ${index + 1}`;
      if (!Array.isArray(page.conditionalRules)) page.conditionalRules = [];

      if (!Array.isArray(page.sections)) {
        page.sections = [
          {
            sectionId: `sec-${Math.random().toString(36).substr(2, 9)}`,
            title: "",
            conditionalRules: [],
            rows: []
          }
        ];
      }

      page.sections.forEach(section => {
        if (!section.sectionId) section.sectionId = `sec-${Math.random().toString(36).substr(2, 9)}`;
        if (section.title === undefined) section.title = "";
        if (!Array.isArray(section.conditionalRules)) section.conditionalRules = [];
        if (!Array.isArray(section.rows)) section.rows = [];

        section.rows.forEach(row => {
          if (!row.columns) row.columns = [];
          row.columns.forEach(col => defaultField(col.field));
        });
      });
    });
  }

  /**
   * Build the 3-column layout inside the editor container
   */
  buildHTMLShell() {
    this.containerEl.innerHTML = `
      <div class="builder-layout">
        <!-- Palette Sidebar (not rendered in read-only mode) -->
        ${this.readOnly ? '' : `<aside class="builder-palette">
          <h4 class="section-label">${this.esc(this.translations.paletteTitle)}</h4>
          <div class="palette-grid">
            ${OpenFormBuilder.PALETTE_ITEMS.filter(item => this.isFieldTypeAllowed(item.type)).map(item => `
            <div class="palette-item" draggable="true" data-type="${item.type}">
              ${OpenFormBuilder.icon(item.icon)}
              <span>${this.esc(this.translations[item.label])}</span>
            </div>`).join('')}
          </div>
        </aside>`}
        
        <!-- Center Designer Canvas Workspace -->
        <div class="builder-canvas"></div>
        
        <!-- Right Properties Sidebar -->
        <aside class="builder-properties">
          <div class="properties-empty">
            ${OpenFormBuilder.icon('info')}
            <p>${this.esc(this.translations.propertiesHelpText)}</p>
          </div>
        </aside>
      </div>
    `;

    if (this.readOnly) this.containerEl.querySelector('.builder-layout').classList.add('is-readonly');

    // Cache structural queries locally
    this.canvasEl = this.containerEl.querySelector('.builder-canvas');
    this.propertiesEl = this.containerEl.querySelector('.builder-properties');
  }

  init() {
    this.setupDragAndDrop();
    this.render();
  }

  /**
   * Clears all drag-and-drop state variables. Called at the start of every dragstart
   * handler so a previous drag (e.g. one whose dragend never fired because the canvas was
   * rebuilt mid-drop) can't leave stale state that contaminates the next, unrelated drag.
   */
  resetDragState() {
    this.draggedFieldType = null;
    this.draggedRowId = null;
    this.draggedSectionId = null;
    this.draggedSubRowId = null;
    this.draggedSourceElement = null;
  }

  /**
   * Bind event listeners for sidebar palette item dragging
   */
  setupDragAndDrop() {
    const paletteItems = this.containerEl.querySelectorAll('.palette-item');
    paletteItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        this.resetDragState();
        this.draggedFieldType = item.getAttribute('data-type');
        e.dataTransfer.setData('text/plain', this.draggedFieldType);
        e.dataTransfer.effectAllowed = 'copy';
      });

      item.addEventListener('dragend', () => {
        this.draggedFieldType = null;
      });
    });
  }

  /**
   * Simple unique ID generator
   */
  generateUniqueId(prefix = 'f') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates standard default model properties for newly created fields
   */
  createDefaultField(type) {
    const id = this.generateUniqueId();
    const cleanTypeLabel = this.getFieldTypeLabel(type);

    // Core parameters
    const field = {
      id: id,
      key: `field_${id.replace('f-', '')}`,
      type: type,
      label: cleanTypeLabel,
      required: false
    };

    // Specific variables
    if (type === 'header') {
      field.label = this.translations.defaultSectionTitle;
      field.subtitle = this.translations.defaultSectionSubtitle;
      delete field.required;
      delete field.key;
    } else if (['text', 'textarea', 'number'].includes(type)) {
      field.placeholder = this.translations.defaultTextPlaceholder;
      if (['text', 'number'].includes(type)) {
        field.mask = '';
        field.maskCleanValue = true;
      }
    }

    if (type === 'text') {
      field.validationRegex = '';
      field.errorMessage = this.translations.defaultRegexErrorMessage;
    }

    if (type === 'number') {
      field.placeholder = this.translations.defaultNumberPlaceholder;
      field.isCalculated = false;
      field.formulaExpression = '';
    }

    if (type === 'boolean') {
      field.defaultValue = false;
    }

    if (['dropdown', 'radio', 'checkbox'].includes(type)) {
      field.optionsType = 'static';
      field.options = [
        { label: this.t('defaultOptionLabel', { n: 1 }), value: "option1" },
        { label: this.t('defaultOptionLabel', { n: 2 }), value: "option2" }
      ];
      field.optionsUrl = '';
    }

    if (type === 'file') {
      field.acceptedTypes = '.pdf,.docx,image/*';
      field.useNativeCamera = false;
      field.nativeCameraSource = 'camera';
    }

    if (type === 'paragraph') {
      field.label = this.translations.defaultParagraphText;
      delete field.required;
      delete field.key;
    }

    if (type === 'repeater') {
      field.minItems = 1;
      field.maxItems = 10;
      field.addButtonLabel = this.translations.defaultRepeaterAddButton;
      field.rows = [
        {
          rowId: `r-sub-${this.generateUniqueId('s')}`,
          columns: [
            {
              width: 12,
              field: { id: this.generateUniqueId('sub'), key: 'sub_col_1', type: 'text', label: this.translations.defaultRepeaterItemName, required: true }
            }
          ]
        }
      ];
    }

    if (type === 'matrix') {
      field.matrixRows = [
        { key: "row_1", label: this.t('defaultMatrixRowLabel', { n: 1 }) },
        { key: "row_2", label: this.t('defaultMatrixRowLabel', { n: 2 }) }
      ];
      field.optionsType = 'static';
      field.options = [
        { label: this.t('defaultOptionLabel', { n: 1 }), value: "option1" },
        { label: this.t('defaultOptionLabel', { n: 2 }), value: "option2" }
      ];
      field.optionsUrl = '';
    }

    return field;
  }

  /**
   * Fetches descriptive user-friendly English label for each technical type
   */
  getFieldTypeLabel(type) {
    const labels = {
      text: this.translations.textInputLabel,
      textarea: this.translations.longTextAreaLabel,
      number: this.translations.numericInputLabel,
      date: this.translations.dateFieldLabel,
      boolean: this.translations.booleanToggleLabel,
      dropdown: this.translations.dropdownLabel,
      radio: this.translations.radioButtonLabel,
      checkbox: this.translations.checkboxLabel,
      signature: this.translations.canvasSignatureLabel,
      file: this.translations.fileUploadLabel,
      header: this.translations.sectionHeaderLabel,
      paragraph: this.translations.paragraphLabel || "Text Block",
      repeater: this.translations.repeaterLabel || "Repeatable List",
      matrix: this.translations.matrixLabel || "Question Matrix"
    };
    return labels[type] || this.translations.defaultCustomLabel;
  }

  /**
   * Maps field type to Lucide icons
   */
  getFieldIcon(type) {
    const icons = {
      text: "text-cursor-input",
      textarea: "align-left",
      number: "binary",
      date: "calendar",
      boolean: "toggle-left",
      dropdown: "list-collapse",
      radio: "circle-dot",
      checkbox: "check-square",
      signature: "pen-tool",
      file: "upload-cloud",
      header: "heading",
      paragraph: "align-justify",
      repeater: "layers",
      matrix: "grid"
    };
    return icons[type] || "help-circle";
  }

  /**
   * Add a new page tab in the visual designer
   */
  addNewPage() {
    if (this.readOnly) return;
    const pageId = `page-${Math.random().toString(36).substr(2, 9)}`;
    const pageNum = this.schema.pages.length + 1;

    this.schema.pages.push({
      pageId: pageId,
      title: `${this.translations.pagePrefix} ${pageNum}`,
      conditionalRules: [],
      rows: []
    });

    // Jump focus to the new page
    this.activePageIndex = this.schema.pages.length - 1;
    this.selectedFieldId = null;

    this.notifyChange();
    this.render();
    this.renderProperties();
  }

  /**
   * Remove page layout tab and its internal row schemas
   */
  async deletePage(pageId) {
    if (this.readOnly) return;
    if (this.schema.pages.length <= 1) return;
    if (!this.schema.pages.some(p => p.pageId === pageId)) return;

    const confirmed = await this.confirm(this.translations.deletePageConfirm);
    if (!confirmed || this._destroyed || this.readOnly) return;

    // The schema may have changed while the dialog was open: look the page up again.
    const pageIndex = this.schema.pages.findIndex(p => p.pageId === pageId);
    if (pageIndex === -1 || this.schema.pages.length <= 1) return;

    const removedFields = [];
    (this.schema.pages[pageIndex].sections || []).forEach(sec => this._collectFieldsInRows(sec.rows, removedFields));
    this.schema.pages.splice(pageIndex, 1);
    this.activePageIndex = Math.min(this.activePageIndex, this.schema.pages.length - 1);
    this.selectedFieldId = null;
    this._reconcileState();
    this._cleanupAndReportRemovedFields(removedFields);

    this.notifyChange();
    this.render();
    this.renderProperties();
  }

  /**
   * Overwrite page title string
   */
  renamePage(pageId, newTitle) {
    if (this.readOnly) return;
    const page = this.schema.pages.find(p => p.pageId === pageId);
    if (page) {
      page.title = newTitle || `${this.translations.pagePrefix} ${this.schema.pages.indexOf(page) + 1}`;
      this.notifyChange();

      // Update visual tab content dynamically without rebuilding the entire canvas
      const tabs = this.canvasEl.querySelectorAll('.canvas-page-tab');
      const pageIndex = this.schema.pages.indexOf(page);
      if (tabs[pageIndex]) {
        const titleSpan = tabs[pageIndex].querySelector('span');
        if (titleSpan) titleSpan.textContent = page.title;
      }
    }
  }

  /**
   * Appends a new grid row at the bottom of the active page layout
   */
  /**
   * Helper that traverses the sectioned hierarchy to find a row and its containing section
   */
  getRow(rowId) {
    const activePage = this.schema.pages[this.activePageIndex];
    if (activePage.sections) {
      for (const section of activePage.sections) {
        const row = section.rows.find(r => r.rowId === rowId);
        if (row) return { row, section, repeaterField: null };

        for (const r of section.rows) {
          for (const col of r.columns) {
            if (col.field) {
              const found = this._getRowInField(col.field, rowId);
              if (found) return found;
            }
          }
        }
      }
    }
    return null;
  }

  _getRowInField(field, rowId) {
    if (field.type === 'repeater' && field.rows) {
      const row = field.rows.find(r => r.rowId === rowId);
      if (row) return { row, section: null, repeaterField: field };

      for (const r of field.rows) {
        for (const col of r.columns) {
          if (col.field) {
            const found = this._getRowInField(col.field, rowId);
            if (found) return found;
          }
        }
      }
    }
    return null;
  }

  getUniqueDatabaseKey(baseKey, reservedKeys = null) {
    let key = baseKey;
    const allKeys = new Set(this.getAllFields().map(f => f.key).filter(Boolean));
    // Keys already handed out in the same batch (e.g. duplicateSection) aren't in the schema yet.
    if (reservedKeys) reservedKeys.forEach(k => allKeys.add(k));

    let match = key.match(/^(.*?)_copy(\d*)$/);
    let prefix = key;
    let counter = 1;
    if (match) {
      prefix = match[1];
      counter = match[2] ? parseInt(match[2]) + 1 : 2;
    }

    let candidate = match ? `${prefix}_copy${counter}` : `${prefix}_copy`;
    while (allKeys.has(candidate)) {
      counter++;
      candidate = `${prefix}_copy${counter}`;
    }
    return candidate;
  }

  duplicateSection(sectionId) {
    if (this.readOnly) return;
    const activePage = this.schema.pages[this.activePageIndex];
    if (!activePage.sections) return;

    const sectionIndex = activePage.sections.findIndex(s => s.sectionId === sectionId);
    if (sectionIndex === -1) return;

    const originalSection = activePage.sections[sectionIndex];
    const clonedSection = JSON.parse(JSON.stringify(originalSection));

    // Update section ID and title
    clonedSection.sectionId = `sec-${this.generateUniqueId('s')}`;
    clonedSection.title = clonedSection.title ? `${clonedSection.title} ${this.translations.duplicatedSectionSuffix}` : this.translations.duplicatedSectionTitle;

    // B2: old -> new key/id maps so references among the duplicated fields (rules, formulas,
    // translations) can be pointed at the copies instead of the originals.
    const keyMap = new Map();
    const idMap = new Map();
    const reservedKeys = new Set();
    const clonedFields = [];

    const duplicateField = (field) => {
      if (!field) return null;
      const clonedField = JSON.parse(JSON.stringify(field));
      clonedField.id = this.generateUniqueId(String(clonedField.type || 'fld').substring(0, 3));
      idMap.set(field.id, clonedField.id);
      clonedFields.push(clonedField);

      if (clonedField.key && !['header', 'paragraph'].includes(clonedField.type)) {
        clonedField.key = this.getUniqueDatabaseKey(clonedField.key, reservedKeys);
        reservedKeys.add(clonedField.key);
        if (!keyMap.has(field.key)) keyMap.set(field.key, clonedField.key);
      }

      if (clonedField.type === 'repeater' && clonedField.rows) {
        clonedField.rows = clonedField.rows.map(row => {
          const newRowId = `r-sub-${this.generateUniqueId('s')}`;
          const newColumns = row.columns.map(col => {
            return {
              width: col.width,
              field: col.field ? duplicateField(col.field) : null
            };
          });
          return {
            rowId: newRowId,
            columns: newColumns
          };
        });
      }
      return clonedField;
    };

    // Update rows, columns and fields inside the cloned section
    clonedSection.rows = clonedSection.rows.map(row => {
      const newRowId = `row-${this.generateUniqueId('r')}`;
      const newColumns = row.columns.map(col => {
        return {
          width: col.width,
          field: col.field ? duplicateField(col.field) : null
        };
      });
      return {
        rowId: newRowId,
        columns: newColumns
      };
    });

    // Point rules/formulas inside the copy at the copied fields. References to fields
    // outside the section are kept as they are (they still point at real fields).
    const remapCond = (cond) => {
      if (keyMap.has(cond.dependentFieldKey)) cond.dependentFieldKey = keyMap.get(cond.dependentFieldKey);
      if (keyMap.has(cond.compareToFieldKey)) cond.compareToFieldKey = keyMap.get(cond.compareToFieldKey);
    };
    [clonedSection, ...clonedFields].forEach(owner => {
      (owner.conditionalRules || []).forEach(rule => this._forEachRuleCondition(rule, remapCond));
      if (typeof owner.formulaExpression === 'string') {
        // Single pass so a chain like a -> a_copy, a_copy -> a_copy2 can't cascade.
        owner.formulaExpression = owner.formulaExpression.replace(/\{([^}]+)\}/g, (token, key) =>
          keyMap.has(key) ? `{${keyMap.get(key)}}` : token
        );
      }
    });

    // Copy translations: fields are keyed by key (or by id for header/paragraph, which have
    // no key), sections by sectionId.
    Object.values(this.schema.translations || {}).forEach(dict => {
      if (!dict) return;
      if (dict.fields) {
        const copyEntry = (from, to) => {
          if (dict.fields[from] !== undefined && dict.fields[to] === undefined) {
            dict.fields[to] = JSON.parse(JSON.stringify(dict.fields[from]));
          }
        };
        keyMap.forEach((newKey, oldKey) => copyEntry(oldKey, newKey));
        idMap.forEach((newId, oldId) => copyEntry(oldId, newId));
      }
      if (dict.sections && dict.sections[originalSection.sectionId] !== undefined) {
        dict.sections[clonedSection.sectionId] = JSON.parse(JSON.stringify(dict.sections[originalSection.sectionId]));
      }
    });

    // Insert cloned section right after original section
    activePage.sections.splice(sectionIndex + 1, 0, clonedSection);

    // Focus the cloned section
    this.selectedSectionId = clonedSection.sectionId;

    this.notifyChange();
    this.render();
    this.renderProperties();
  }

  /**
   * Appends a new layout Section to the active page
   */
  addNewSection() {
    if (this.readOnly) return;
    const activePage = this.schema.pages[this.activePageIndex];
    if (!activePage.sections) activePage.sections = [];

    const sectionId = `sec-${this.generateUniqueId('s')}`;
    activePage.sections.push({
      sectionId: sectionId,
      title: `Section ${activePage.sections.length + 1}`,
      conditionalRules: [],
      rows: []
    });

    this.notifyChange();
    this.render();
  }

  /**
   * Inserts a new layout Section at a specific index in the active page
   */
  addNewSectionAt(index) {
    if (this.readOnly) return;
    const activePage = this.schema.pages[this.activePageIndex];
    if (!activePage.sections) activePage.sections = [];

    const sectionId = `sec-${this.generateUniqueId('s')}`;
    activePage.sections.splice(index, 0, {
      sectionId: sectionId,
      title: `Section ${activePage.sections.length + 1}`,
      conditionalRules: [],
      rows: []
    });

    this.notifyChange();
    this.render();
  }

  /**
   * Deletes a layout Section and all rows contained within it
   */
  deleteSection(sectionId) {
    if (this.readOnly) return;
    const activePage = this.schema.pages[this.activePageIndex];
    if (!activePage.sections || activePage.sections.length <= 1) {
      this.showToast(this.translations.keepOneSectionToast, true);
      return;
    }

    const index = activePage.sections.findIndex(s => s.sectionId === sectionId);
    if (index !== -1) {
      // Clear selected field selection if it resided in this section
      const section = activePage.sections[index];
      section.rows.forEach(row => {
        row.columns.forEach(col => {
          if (col.field && col.field.id === this.selectedFieldId) {
            this.selectedFieldId = null;
          }
        });
      });

      // Delete active section selection state if deleted
      if (this.selectedSectionId === sectionId) {
        this.selectedSectionId = null;
      }

      const removedFields = this._collectFieldsInRows(section.rows);
      activePage.sections.splice(index, 1);
      this._cleanupAndReportRemovedFields(removedFields);
      this.notifyChange();
      this.render();
      this.renderProperties();
    }
  }

  /**
   * Appends a new grid row at the bottom of the active page layout
   */
  addNewRow(sectionId = null) {
    if (this.readOnly) return;
    const activePage = this.schema.pages[this.activePageIndex];

    // Ensure at least one section exists
    if (!activePage.sections || activePage.sections.length === 0) {
      this.addNewSection();
    }

    const section = sectionId
      ? activePage.sections.find(s => s.sectionId === sectionId)
      : activePage.sections[0];

    if (section) {
      const rowId = `row-${this.generateUniqueId('r')}`;
      section.rows.push({
        rowId: rowId,
        columns: [
          {
            width: 12,
            field: null
          }
        ]
      });

      this.notifyChange();
      this.render();
    }
  }

  /**
   * Inserts a new grid row at a specific index in the section rows list
   */
  addNewRowAt(sectionId, index) {
    if (this.readOnly) return;
    const activePage = this.schema.pages[this.activePageIndex];
    if (!activePage.sections || activePage.sections.length === 0) {
      this.addNewSection();
    }

    const section = activePage.sections.find(s => s.sectionId === sectionId);
    if (section) {
      const rowId = `row-${this.generateUniqueId('r')}`;
      section.rows.splice(index, 0, {
        rowId: rowId,
        columns: [
          {
            width: 12,
            field: null
          }
        ]
      });

      this.notifyChange();
      this.render();
    }
  }

  /**
   * Delete row schema entirely
   */
  deleteRow(rowId) {
    if (this.readOnly) return;
    const res = this.getRow(rowId);
    if (res) {
      const { row, section, repeaterField } = res;
      row.columns.forEach(col => {
        if (col.field && col.field.id === this.selectedFieldId) {
          this.selectedFieldId = null;
        }
      });

      const removedFields = this._collectFieldsInRows([row]);
      if (section) {
        const rowIndex = section.rows.findIndex(r => r.rowId === rowId);
        if (rowIndex !== -1) {
          section.rows.splice(rowIndex, 1);
          this._cleanupAndReportRemovedFields(removedFields);
          this.notifyChange();
          this.render();
          this.renderProperties();
        }
      } else if (repeaterField) {
        const rowIndex = repeaterField.rows.findIndex(r => r.rowId === rowId);
        if (rowIndex !== -1) {
          repeaterField.rows.splice(rowIndex, 1);
          this._cleanupAndReportRemovedFields(removedFields);
          this.notifyChange();
          this.render();
          this.renderProperties();
        }
      }
    }
  }

  addRepeaterRow(repeaterField) {
    if (this.readOnly) return;
    if (!repeaterField.rows) repeaterField.rows = [];
    repeaterField.rows.push({
      rowId: `r-sub-${this.generateUniqueId('s')}`,
      columns: [
        {
          width: 12,
          field: null
        }
      ]
    });
    this.notifyChange();
    this.render();
  }

  /**
   * Insert column cell inside a row and automatically rebalances spans
   */
  addColumnToRow(rowId) {
    if (this.readOnly) return;
    const res = this.getRow(rowId);
    if (res) {
      const { row } = res;
      row.columns.push({
        width: 6,
        field: null
      });

      this.balanceRowColumns(row);
      this.notifyChange();
      this.render();
    }
  }

  /**
   * Remove column cell and balance the remaining ones to fill exactly 12 grid spaces
   */
  deleteColumnFromRow(rowId, colIndex) {
    if (this.readOnly) return;
    const res = this.getRow(rowId);
    if (res) {
      const { row } = res;
      if (row.columns.length > 1) {
        const col = row.columns[colIndex];
        if (col.field && col.field.id === this.selectedFieldId) {
          this.selectedFieldId = null;
        }

        const removedFields = this._collectFieldTree(col.field);
        row.columns.splice(colIndex, 1);
        this.balanceRowColumns(row);
        this._cleanupAndReportRemovedFields(removedFields);
        this.notifyChange();
        this.render();
        this.renderProperties();
      }
    }
  }

  /**
   * Proportional column width auto-balancing rules
   */
  balanceRowColumns(row) {
    const colCount = row.columns.length;
    if (colCount === 1) {
      row.columns[0].width = 12;
    } else if (colCount === 2) {
      row.columns[0].width = 6;
      row.columns[1].width = 6;
    } else if (colCount === 3) {
      row.columns[0].width = 4;
      row.columns[1].width = 4;
      row.columns[2].width = 4;
    } else if (colCount === 4) {
      row.columns[0].width = 3;
      row.columns[1].width = 3;
      row.columns[2].width = 3;
      row.columns[3].width = 3;
    } else {
      const defaultWidth = Math.max(1, Math.floor(12 / colCount));
      row.columns.forEach(col => {
        col.width = defaultWidth;
      });
    }
  }

  /**
   * Increase or decrease column width manually
   */
  adjustColumnWidth(rowId, colIndex, delta) {
    if (this.readOnly) return;
    const res = this.getRow(rowId);
    if (res) {
      const { row } = res;
      const col = row.columns[colIndex];
      const newWidth = col.width + delta;
      if (newWidth >= 1 && newWidth <= 12) {
        col.width = newWidth;
        this.notifyChange();
        this.render();
      }
    }
  }

  /**
   * Delete field data contained inside a column cell
   */
  deleteField(rowId, colIndex) {
    if (this.readOnly) return;
    const res = this.getRow(rowId);
    if (res) {
      const { row } = res;
      const col = row.columns[colIndex];
      if (col.field) {
        if (col.field.id === this.selectedFieldId) {
          this.selectedFieldId = null;
        }
        const removedFields = this._collectFieldTree(col.field);
        col.field = null;
        this._cleanupAndReportRemovedFields(removedFields);
        this.notifyChange();
        this.render();
        this.renderProperties();
      }
    }
  }

  /**
   * Triggers focus selection to highlight field and populates properties panel
   */
  selectField(fieldId) {
    this.selectedFieldId = fieldId;
    this.selectedSectionId = null; // Clear active section selection
    this.render();
    this.renderProperties();
  }

  /**
   * Selects a section to display properties
   */
  selectSection(sectionId) {
    this.selectedSectionId = sectionId;
    this.selectedFieldId = null; // Clear active field selection
    this.render();
    this.renderProperties();
  }

  /**
   * Returns current focused field schema representation
   */
  getSelectedField() {
    if (!this.selectedFieldId) return null;
    for (const page of this.schema.pages) {
      if (page.sections) {
        for (const section of page.sections) {
          for (const row of section.rows) {
            for (const col of row.columns) {
              if (col.field) {
                const found = this._getFieldByIdRecursive(col.field, this.selectedFieldId);
                if (found) return found;
              }
            }
          }
        }
      }
    }
    return null;
  }

  _getFieldByIdRecursive(field, id) {
    if (field.id === id) return field;
    if (field.type === 'repeater' && field.rows) {
      for (const row of field.rows) {
        for (const col of row.columns) {
          if (col.field) {
            const found = this._getFieldByIdRecursive(col.field, id);
            if (found) return found;
          }
        }
      }
    }
    return null;
  }

  isFieldInsideRepeater(id) {
    for (const page of this.schema.pages) {
      if (page.sections) {
        for (const section of page.sections) {
          for (const row of section.rows) {
            for (const col of row.columns) {
              if (col.field && col.field.type === 'repeater') {
                const found = this._getFieldByIdRecursive(col.field, id);
                if (found && col.field.id !== id) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
  }

  /** Returns the repeater field that directly contains the sub-field with this id, or null. */
  getParentRepeaterField(id) {
    for (const page of this.schema.pages) {
      if (page.sections) {
        for (const section of page.sections) {
          for (const row of section.rows) {
            for (const col of row.columns) {
              if (col.field && col.field.type === 'repeater') {
                const found = this._getFieldByIdRecursive(col.field, id);
                if (found && col.field.id !== id) {
                  return col.field;
                }
              }
            }
          }
        }
      }
    }
    return null;
  }

  /** Keys of a repeater's direct sub-fields (its own collision namespace — see A5). */
  getRepeaterSubFieldKeys(repeaterField, excludeId) {
    const keys = [];
    (repeaterField.rows || []).forEach(row => {
      (row.columns || []).forEach(col => {
        if (col.field && col.field.id !== excludeId && col.field.key) {
          keys.push(col.field.key);
        }
      });
    });
    return keys;
  }

  getAllFields() {
    const list = [];
    this.schema.pages.forEach(page => {
      if (page.sections) {
        page.sections.forEach(section => {
          section.rows.forEach(row => {
            row.columns.forEach(col => {
              if (col.field) {
                this._collectFieldsRecursive(col.field, list);
              }
            });
          });
        });
      }
    });
    return list;
  }

  /**
   * B16: the fields of the top-level key namespace — every field outside a repeater, plus the
   * repeater fields themselves (their sub-fields live in their own namespace).
   */
  getTopLevelFields() {
    const list = [];
    this.schema.pages.forEach(page => {
      (page.sections || []).forEach(section => {
        (section.rows || []).forEach(row => {
          (row.columns || []).forEach(col => {
            if (col.field) list.push(col.field);
          });
        });
      });
    });
    return list;
  }

  /** B16: the sub-fields (direct children) of a repeater. */
  getRepeaterSubFields(repeaterField) {
    const list = [];
    (repeaterField.rows || []).forEach(row => {
      (row.columns || []).forEach(col => {
        if (col.field) list.push(col.field);
      });
    });
    return list;
  }

  _collectFieldsRecursive(field, list) {
    list.push(field);
    if (field.type === 'repeater' && field.rows) {
      field.rows.forEach(row => {
        row.columns.forEach(col => {
          if (col.field) {
            this._collectFieldsRecursive(col.field, list);
          }
        });
      });
    }
  }

  // ---------------------------------------------------------------------------------------
  // B2: reference integrity. Fields are referenced by `key` from conditionalRules (fields
  // and sections), crossFieldRules (targetFields + conditions), `{key}` tokens in formulas /
  // legacy cross-field expressions, and translations[locale].fields[key]. These helpers keep
  // those references in sync when a key is renamed, a field is deleted or a section is
  // duplicated. Each runs before the single notifyChange() of its action, so one undo
  // reverts the action and its reference updates together.
  // ---------------------------------------------------------------------------------------

  /** Every object that can own conditionalRules: all fields (incl. repeater sub-fields), sections and pages. */
  _getRuleOwners() {
    const owners = this.getAllFields();
    this.schema.pages.forEach(page => {
      owners.push(page);
      (page.sections || []).forEach(section => owners.push(section));
    });
    return owners;
  }

  /** Calls cb(condition) for every condition inside a rule's andGroups. */
  _forEachRuleCondition(rule, cb) {
    (rule && rule.andGroups || []).forEach(group => {
      (group && group.conditions || []).forEach(cond => {
        if (cond) cb(cond);
      });
    });
  }

  /** Replaces `{oldKey}` tokens with `{newKey}` in an expression string. */
  _replaceKeyToken(expression, oldKey, newKey) {
    if (typeof expression !== 'string' || !expression) return { value: expression, count: 0 };
    const token = `{${oldKey}}`;
    const parts = expression.split(token);
    return { value: parts.join(`{${newKey}}`), count: parts.length - 1 };
  }

  /** Collects `field` and, for repeaters, all of its nested sub-fields. */
  _collectFieldTree(field, list = []) {
    if (field) this._collectFieldsRecursive(field, list);
    return list;
  }

  /** All fields (recursively) contained in a list of rows. */
  _collectFieldsInRows(rows, list = []) {
    (rows || []).forEach(row => {
      (row.columns || []).forEach(col => {
        if (col.field) this._collectFieldsRecursive(col.field, list);
      });
    });
    return list;
  }

  /**
   * Rewrites every reference to `oldKey` so it points at `newKey`. Call after the field's
   * own key has been changed. Returns the number of references updated.
   *
   * B16: keys are scoped like `validateSchema` scopes them — top-level fields share one
   * namespace, each repeater's sub-fields have their own (a sub-field may reuse a top-level
   * key). Pass the renamed `field` so only references in its scope are rewritten:
   *  - a sub-field: rules and formulas of the fields in the same repeater;
   *  - a top-level field: top-level fields, sections, cross-field rules, and the rules of
   *    sub-fields in repeaters that have no sub-field of their own called `oldKey`.
   * Translations are keyed by plain `key`, so they only move when no other field is left
   * using `oldKey` or already uses `newKey` (otherwise the entry is ambiguous and stays).
   * Without `field` (legacy call) the scope is unknown: nothing is rewritten while another
   * field still uses `oldKey`.
   */
  renameFieldKeyReferences(oldKey, newKey, field = null) {
    if (!oldKey || !newKey || oldKey === newKey) return 0;
    const allFields = this.getAllFields();
    const parentRepeater = field ? this.getParentRepeaterField(field.id) : null;
    if (!field && allFields.some(f => f.key === oldKey)) return 0;
    if (field && !parentRepeater && this.getTopLevelFields().some(f => f !== field && f.key === oldKey)) return 0;
    if (parentRepeater && this.getRepeaterSubFields(parentRepeater).some(f => f !== field && f.key === oldKey)) return 0;

    let count = 0;
    const remapCond = (cond) => {
      if (cond.dependentFieldKey === oldKey) { cond.dependentFieldKey = newKey; count++; }
      if (cond.compareToFieldKey === oldKey) { cond.compareToFieldKey = newKey; count++; }
    };
    const remapOwner = (owner) => {
      (owner.conditionalRules || []).forEach(rule => this._forEachRuleCondition(rule, remapCond));
      if (typeof owner.formulaExpression === 'string') {
        const res = this._replaceKeyToken(owner.formulaExpression, oldKey, newKey);
        owner.formulaExpression = res.value;
        count += res.count;
      }
    };

    if (parentRepeater) {
      // Sub-field rename: references can only come from the repeater's own fields.
      this.getRepeaterSubFields(parentRepeater).forEach(remapOwner);
    } else {
      // Owners whose references resolve in the top-level namespace.
      const subFieldsByRepeater = new Map();
      allFields.forEach(f => {
        if (f.type === 'repeater') subFieldsByRepeater.set(f, this.getRepeaterSubFields(f));
      });
      const subFieldSet = new Set();
      subFieldsByRepeater.forEach(subs => subs.forEach(f => subFieldSet.add(f)));
      this._getRuleOwners().forEach(owner => {
        if (!subFieldSet.has(owner)) remapOwner(owner);
      });
      // A sub-field's reference means a sibling when its repeater has a sub-field with that key.
      if (field) {
        subFieldsByRepeater.forEach(subs => {
          if (!subs.some(f => f.key === oldKey)) subs.forEach(remapOwner);
        });
      }

      (this.schema.crossFieldRules || []).forEach(rule => {
        if (Array.isArray(rule.targetFields)) {
          rule.targetFields = rule.targetFields.map(k => {
            if (k === oldKey) { count++; return newKey; }
            return k;
          });
        }
        this._forEachRuleCondition(rule, remapCond);
        if (typeof rule.expression === 'string') {
          const res = this._replaceKeyToken(rule.expression, oldKey, newKey);
          rule.expression = res.value;
          count += res.count;
        }
      });
    }

    const keyStillUsed = allFields.some(f => f !== field && (f.key === oldKey || f.key === newKey));
    if (!keyStillUsed) {
      Object.values(this.schema.translations || {}).forEach(dict => {
        if (dict && dict.fields && dict.fields[oldKey] !== undefined && dict.fields[newKey] === undefined) {
          dict.fields[newKey] = dict.fields[oldKey];
          delete dict.fields[oldKey];
          count++;
        }
      });
    }

    return count;
  }

  /**
   * Cleans references left dangling after `removedFields` were taken out of the schema
   * (call after the removal). Conditions pointing at a removed key are dropped; an AND
   * group emptied by that is dropped; a rule left with no groups is dropped (an empty
   * rule would otherwise evaluate to "never satisfied" and silently hide/lock its owner).
   * Cross-field rules lose removed target fields, and are dropped when they lose all their
   * targets or all their groups. Translations of removed keys are deleted. Formula tokens
   * can't be removed meaningfully, so those are only reported. Returns a summary, or null
   * when nothing referenced the removed fields.
   */
  cleanupRemovedFieldReferences(removedFields) {
    const remainingKeys = new Set(this.getAllFields().map(f => f.key).filter(Boolean));
    const removedKeys = new Set(
      (removedFields || []).map(f => f && f.key).filter(k => k && !remainingKeys.has(k))
    );
    if (removedKeys.size === 0) return null;

    const summary = { conditions: 0, groups: 0, rules: 0, crossFieldTargets: 0, crossFieldRules: 0, translations: 0, formulas: [] };
    const isDangling = (cond) =>
      removedKeys.has(cond.dependentFieldKey) ||
      (cond.compareMode === 'field' && removedKeys.has(cond.compareToFieldKey));

    // Drops dangling conditions/groups in place; returns true when the rule lost every group.
    const pruneRule = (rule) => {
      if (!Array.isArray(rule.andGroups)) return false;
      const hadGroups = rule.andGroups.length > 0;
      rule.andGroups = rule.andGroups.filter(group => {
        if (!group || !Array.isArray(group.conditions)) return true;
        const before = group.conditions.length;
        group.conditions = group.conditions.filter(cond => !(cond && isDangling(cond)));
        const removed = before - group.conditions.length;
        summary.conditions += removed;
        if (removed > 0 && group.conditions.length === 0) {
          summary.groups++;
          return false;
        }
        return true;
      });
      return hadGroups && rule.andGroups.length === 0;
    };

    const tokenRefs = (expression) => [...removedKeys].filter(k => typeof expression === 'string' && expression.includes(`{${k}}`));

    this._getRuleOwners().forEach(owner => {
      if (Array.isArray(owner.conditionalRules)) {
        owner.conditionalRules = owner.conditionalRules.filter(rule => {
          if (pruneRule(rule)) {
            summary.rules++;
            return false;
          }
          return true;
        });
      }
      const refs = tokenRefs(owner.formulaExpression);
      if (refs.length > 0) {
        summary.formulas.push({ field: owner.label || owner.key, keys: refs });
      }
    });

    if (Array.isArray(this.schema.crossFieldRules)) {
      const droppedRuleIds = [];
      this.schema.crossFieldRules = this.schema.crossFieldRules.filter(rule => {
        let lostAllTargets = false;
        if (Array.isArray(rule.targetFields)) {
          const before = rule.targetFields.length;
          rule.targetFields = rule.targetFields.filter(k => !removedKeys.has(k));
          const removed = before - rule.targetFields.length;
          summary.crossFieldTargets += removed;
          lostAllTargets = removed > 0 && rule.targetFields.length === 0;
        }
        const lostAllGroups = pruneRule(rule);
        if (lostAllTargets || lostAllGroups) {
          summary.crossFieldRules++;
          if (rule.ruleId) droppedRuleIds.push(rule.ruleId);
          return false;
        }
        const refs = tokenRefs(rule.expression);
        if (refs.length > 0) {
          summary.formulas.push({ field: 'Cross-field rule', keys: refs });
        }
        return true;
      });

      Object.values(this.schema.translations || {}).forEach(dict => {
        if (dict && dict.crossFieldRules) {
          droppedRuleIds.forEach(id => { delete dict.crossFieldRules[id]; });
          if (Object.keys(dict.crossFieldRules).length === 0) delete dict.crossFieldRules;
        }
      });
    }

    Object.values(this.schema.translations || {}).forEach(dict => {
      if (dict && dict.fields) {
        removedKeys.forEach(k => {
          if (dict.fields[k] !== undefined) {
            delete dict.fields[k];
            summary.translations++;
          }
        });
        if (Object.keys(dict.fields).length === 0) delete dict.fields;
      }
    });

    const touched = summary.conditions + summary.groups + summary.rules + summary.crossFieldTargets +
      summary.crossFieldRules + summary.translations + summary.formulas.length;
    return touched > 0 ? summary : null;
  }

  /** Runs cleanupRemovedFieldReferences and shows a toast describing what was cleaned. */
  _cleanupAndReportRemovedFields(removedFields) {
    const summary = this.cleanupRemovedFieldReferences(removedFields);
    if (!summary) return null;

    const parts = [];
    if (summary.conditions) parts.push(this.tn('cleanupConditions', summary.conditions));
    if (summary.rules) parts.push(this.tn('cleanupEmptiedRules', summary.rules));
    if (summary.crossFieldTargets) parts.push(this.tn('cleanupCrossTargets', summary.crossFieldTargets));
    if (summary.crossFieldRules) parts.push(this.tn('cleanupCrossRules', summary.crossFieldRules));
    if (summary.translations) parts.push(this.tn('cleanupTranslations', summary.translations));

    let message = parts.length > 0 ? this.t('cleanupRemovedPrefix', { parts: parts.join(', ') }) : '';
    if (summary.formulas.length > 0) {
      const formulaText = summary.formulas
        .map(f => `${f.field} (${f.keys.map(k => `{${k}}`).join(', ')})`)
        .join('; ');
      message += `${message ? ' ' : ''}${this.t('cleanupFormulaNotice', { formulas: formulaText })}`;
    }
    this.showToast(message, summary.formulas.length > 0);
    return summary;
  }

  /**
   * Load JSON schema configuration into the visual builder
   */
  loadSchema(newSchema) {
    // null/undefined/non-object clears the canvas to an empty form (documented in
    // SCHEMA_REFERENCE.md); normalizeSchema() fills in the default page/section.
    const source = newSchema && typeof newSchema === 'object' ? newSchema : {};
    this._endBurst();
    const report = OpenFormBuilder.validateSchema(source);
    this.schema = this.normalizeSchema(JSON.parse(JSON.stringify(source)));
    this.activePageIndex = 0;
    this.selectedFieldId = null;
    this.selectedSectionId = null;
    this.editingLocale = 'default'; // B8: a new template starts in the base language

    // Reset Undo/Redo Stacks on new template load
    this.undoStack = [];
    this.redoStack = [];
    this.lastSavedStateString = JSON.stringify(this.schema);
    this.savedStateString = this.lastSavedStateString; // A4: freshly loaded = not dirty
    this.isApplyingHistoryState = false;

    this.render();
    this.renderProperties();

    // The schema always loads; problems are only reported so the author can fix them.
    if (report.errors.length > 0) this._reportSchemaProblems(report);
  }

  /** Toast summarising the first validation error of a loaded schema. */
  _reportSchemaProblems(report) {
    const first = report.errors[0];
    const more = report.errors.length > 1 ? this.t('schemaProblemsMore', { count: report.errors.length - 1 }) : '';
    this.showToast(this.tn('schemaProblemsToast', report.errors.length, { message: first.message, path: first.path, more }), true);
  }

  /**
   * A4: returns a deep clone of the current schema. Mutating it never affects the builder.
   */
  getSchema() {
    return JSON.parse(JSON.stringify(this.schema));
  }

  /**
   * A4: true when the schema differs from the last loadSchema()/markSaved() snapshot
   * (undoing back to the saved state makes it clean again).
   */
  isDirty() {
    return JSON.stringify(this.schema) !== this.savedStateString;
  }

  /**
   * A4: records the current schema as the saved baseline (call it after persisting).
   */
  markSaved() {
    this.savedStateString = JSON.stringify(this.schema);
  }

  /**
   * B8: after the schema is replaced or shrinks (loadSchema, undo/redo, deletePage), drops
   * selections that no longer exist and falls back to the default language when the edited
   * locale's translations are gone, so the panels never stay bound to a vanished entity.
   */
  _reconcileState() {
    const pages = this.schema.pages || [];
    if (this.activePageIndex >= pages.length) {
      this.activePageIndex = Math.max(0, pages.length - 1);
    }
    if (this.selectedSectionId) {
      const exists = pages.some(p => (p.sections || []).some(sec => sec.sectionId === this.selectedSectionId));
      if (!exists) this.selectedSectionId = null;
    }
    if (this.selectedFieldId && !this.getSelectedField()) {
      this.selectedFieldId = null;
    }
    const presetLocales = ['default'].concat(this.locales.map(l => l.code));
    const loc = this.editingLocale;
    if (!presetLocales.includes(loc) && !(this.schema.translations && this.schema.translations[loc])) {
      this.editingLocale = 'default';
    }
  }

  /**
   * A4: tracks which element is being typed into so notifyChange() can fold a burst of
   * `input` events on the same control into a single undo step. Capture phase on the
   * container runs before the control's own handler (which calls notifyChange()).
   */
  _bindInputBurstTracking() {
    if (!this.containerEl) return;
    this.containerEl.addEventListener('input', (e) => {
      const t = e.target;
      if (!t || t.nodeType !== 1) return;
      this._pendingInput = {
        key: [t.id, t.name, t.className, t.getAttribute && t.getAttribute('data-key'), this.selectedFieldId, this.selectedSectionId, this.activePageIndex, this.editingLocale].join('|'),
        time: Date.now()
      };
    }, true);
    // Leaving the control (blur) closes the burst: the next edit is a new undo step.
    this.containerEl.addEventListener('focusout', () => this._endBurst());
  }

  _endBurst() {
    this._burst = null;
    this._pendingInput = null;
    if (this._burstTimer) {
      clearTimeout(this._burstTimer);
      this._timers.delete(this._burstTimer);
      this._burstTimer = null;
    }
  }

  /**
   * Bubble schema changes upward to orchestrator
   */
  notifyChange() {
    let currentStateString = null;
    if (!this.isApplyingHistoryState) {
      const BURST_MS = 500;
      const now = Date.now();
      const pending = this._pendingInput && now - this._pendingInput.time < 50 ? this._pendingInput : null;
      this._pendingInput = null;

      // Always serialize so lastSavedStateString is the latest state (undo/redo and the next
      // undo step rely on it).
      currentStateString = JSON.stringify(this.schema);
      const inBurst = !!(pending && this._burst && this._burst.key === pending.key && now - this._burst.time < BURST_MS);

      if (currentStateString !== this.lastSavedStateString) {
        if (!inBurst) {
          // A4: a new undo step — except while the same control keeps being edited inside the
          // burst window, where the undo stack already holds the pre-burst state.
          if (this.undoStack.length >= 100) {
            this.undoStack.shift();
          }
          this.undoStack.push(this.lastSavedStateString);
        }
        this.lastSavedStateString = currentStateString;
        // Clear redo stack on any new manual action
        this.redoStack = [];
      }

      if (pending) {
        this._burst = { key: pending.key, time: now };
        this._armBurstTimer(BURST_MS);
      } else {
        this._endBurst();
      }
    }

    if (this.onSchemaChange) {
      // A4: hand out a deep clone, never the live internal object.
      this.onSchemaChange(currentStateString ? JSON.parse(currentStateString) : this.getSchema());
    }
  }

  /** A4: closes the burst once typing pauses. */
  _armBurstTimer(ms) {
    if (this._burstTimer) {
      clearTimeout(this._burstTimer);
      this._timers.delete(this._burstTimer);
    }
    this._burstTimer = this._setTimer(() => {
      this._burstTimer = null;
      this._burst = null;
    }, ms);
  }

  /**
   * Helper that triggers high-fidelity modern styled Toasts (mirrors OpenFormRenderer.showToast,
   * reusing the same #toast-container / .toast CSS the host page already provides)
   */
  showToast(message, isError = false) {
    if (this._destroyed) return;
    // B9: self-sufficient — the builder must work as a standalone <script> without the host
    // page defining #toast-container. A container created here is tagged so destroy() only
    // removes what the builder itself created.
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container openforms-toast-container';
      container.setAttribute('data-openforms-builder', 'true');
      document.body.appendChild(container);
    }

    container.setAttribute('aria-live', isError ? 'assertive' : 'polite');
    container.setAttribute('role', isError ? 'alert' : 'status');

    // Give screen readers a beat to register the (possibly just-created) live region before
    // its content changes, as the renderer does.
    const frame = (typeof requestAnimationFrame === 'function') ? requestAnimationFrame : (fn) => setTimeout(fn, 16);
    frame(() => {
    if (this._destroyed) return;
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.innerHTML = OpenFormBuilder.icon(isError ? 'x-circle' : 'check-circle');
    // S2: message is often built from field keys/labels — set as text, never parsed as HTML.
    const messageEl = document.createElement('span');
    messageEl.textContent = message;
    toast.appendChild(messageEl);
    container.appendChild(toast);
    this._toasts.add(toast);


    this._setTimer(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      this._setTimer(() => {
        toast.remove();
        this._toasts.delete(toast);
      }, 300);
    }, 3500);
    });
  }

  renderSectionInsertionDivider(index) {
    const divider = document.createElement('div');
    divider.className = 'section-insertion-divider';

    const btn = document.createElement('button');
    btn.className = 'insertion-btn';
    btn.title = this.translations.insertSectionHereTitle;
    btn.type = 'button';
    btn.innerHTML = `${OpenFormBuilder.icon('plus')}`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.addNewSectionAt(index);
    });

    divider.appendChild(btn);
    return divider;
  }

  renderRowInsertionDivider(sectionId, index) {
    const divider = document.createElement('div');
    divider.className = 'row-insertion-divider';

    const btn = document.createElement('button');
    btn.className = 'insertion-btn';
    btn.title = this.translations.insertRowHereTitle;
    btn.type = 'button';
    btn.innerHTML = `${OpenFormBuilder.icon('plus')}`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.addNewRowAt(sectionId, index);
    });

    divider.appendChild(btn);
    return divider;
  }

  /**
   * Renders primary visual designer canvas tree
   */
  render() {
    this._renderCanvas();
    if (this.readOnly) this._applyReadOnlyCanvas();
  }

  _renderCanvas() {
    this.canvasEl.innerHTML = '';

    // Form Title Heading Input Edit Bar
    const canvasHeader = document.createElement('div');
    canvasHeader.className = 'canvas-header-bar';

    const formTitleVal = this.editingLocale === 'default' ? this.schema.formTitle : (this.getTranslationValue('form', 'formTitle') || '');
    const formDescVal = this.editingLocale === 'default' ? (this.schema.formDescription || '') : (this.getTranslationValue('form', 'formDescription') || '');

    canvasHeader.innerHTML = `
      <div class="form-input-wrapper" style="margin-bottom: 0;">
        <input type="text" id="canvas-form-title" class="form-input" 
               style="font-size: 18px; font-weight: var(--of-font-weight-bold); border: none; padding: var(--of-space-xs) var(--of-space-s); background: transparent; color: var(--of-color-neutral-10);"
               value="${this.esc(formTitleVal)}" placeholder="${this.esc(this.editingLocale === 'default' ? this.translations.formTitlePlaceholder : this.schema.formTitle)}" />
        <input type="text" id="canvas-form-desc" class="form-input" 
               style="font-size: var(--of-font-size-s); color: var(--of-color-neutral-7); border: none; padding: 2px var(--of-space-s); background: transparent;"
               value="${this.esc(formDescVal)}" placeholder="${this.esc(this.editingLocale === 'default' ? this.translations.formDescPlaceholder : (this.schema.formDescription || ''))}" />
      </div>
    `;
    this.canvasEl.appendChild(canvasHeader);

    // Bind description / title change handlers
    canvasHeader.querySelector('#canvas-form-title').addEventListener('change', (e) => {
      const newVal = e.target.value;
      if (this.editingLocale === 'default') {
        this.schema.formTitle = newVal;
      } else {
        if (newVal) {
          this.setTranslationValue('form', 'formTitle', null, newVal);
        } else {
          this.deleteTranslationValue('form', 'formTitle');
        }
      }
      this.notifyChange();
    });
    canvasHeader.querySelector('#canvas-form-desc').addEventListener('change', (e) => {
      const newVal = e.target.value;
      if (this.editingLocale === 'default') {
        this.schema.formDescription = newVal;
      } else {
        if (newVal) {
          this.setTranslationValue('form', 'formDescription', null, newVal);
        } else {
          this.deleteTranslationValue('form', 'formDescription');
        }
      }
      this.notifyChange();
    });

    // Pagination Tab Switcher
    const pagesBar = document.createElement('div');
    pagesBar.className = 'canvas-pages-bar';

    this.schema.pages.forEach((page, index) => {
      const isActive = index === this.activePageIndex;
      const tabEl = document.createElement('div');
      tabEl.className = `canvas-page-tab ${isActive ? 'active' : ''}`;

      const titleSpan = document.createElement('span');
      titleSpan.textContent = this.editingLocale === 'default' ? page.title : (this.getTranslationValue('pages', page.pageId) || page.title);
      tabEl.appendChild(titleSpan);

      // Pages with visibility rules are skipped for some answers: mark the tab
      if ((page.conditionalRules || []).some(r => r.targetProperty === 'visibility')) {
        const badge = document.createElement('span');
        badge.className = 'canvas-page-tab-rules-badge';
        badge.title = this.translations.pageRulesBadgeTitle;
        badge.setAttribute('role', 'img');
        badge.setAttribute('aria-label', this.translations.pageRulesBadgeTitle);
        badge.style.cssText = 'display: inline-flex; align-items: center; margin-left: var(--of-space-xs); color: var(--of-color-primary);';
        badge.innerHTML = OpenFormBuilder.icon('shield', '', 'width: 12px; height: 12px;');
        tabEl.appendChild(badge);
      }

      // Support deleting layout pages (if more than one page is instantiated)
      if (this.schema.pages.length > 1) {
        const delBtn = document.createElement('button');
        delBtn.className = 'canvas-page-tab-delete';
        delBtn.title = this.translations.deletePageTitle;
        delBtn.innerHTML = `${OpenFormBuilder.icon('x')}`;

        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deletePage(page.pageId);
        });
        tabEl.appendChild(delBtn);
      }

      tabEl.addEventListener('click', () => {
        this.activePageIndex = index;
        this.selectedFieldId = null;
        this.selectedSectionId = null;
        this.render();
        this.renderProperties();
      });

      pagesBar.appendChild(tabEl);
    });

    // Create New Page Button
    const addPageBtn = document.createElement('button');
    addPageBtn.className = 'canvas-page-add-btn';
    addPageBtn.innerHTML = `${OpenFormBuilder.icon('plus')} ${this.esc(this.translations.addPageLabel)}`;
    addPageBtn.addEventListener('click', () => this.addNewPage());
    pagesBar.appendChild(addPageBtn);

    // Create New Section Button
    const addSectionBtn = document.createElement('button');
    addSectionBtn.className = 'canvas-page-add-btn is-accent';
    addSectionBtn.innerHTML = `${OpenFormBuilder.icon('folder-plus')} ${this.esc(this.translations.addSectionLabel)}`;
    addSectionBtn.addEventListener('click', () => this.addNewSection());
    pagesBar.appendChild(addSectionBtn);

    this.canvasEl.appendChild(pagesBar);

    // Get Active Page Details
    const activePage = this.schema.pages[this.activePageIndex];

    if (!activePage.sections || activePage.sections.length === 0) {
      // Empty Canvas state
      const emptyState = document.createElement('div');
      emptyState.className = 'canvas-empty-state';
      emptyState.innerHTML = `
        ${OpenFormBuilder.icon('plus-square')}
        <h3>${this.esc(this.translations.pagePrefix)} "${this.esc(activePage.title)}" ${this.esc(this.translations.emptyPageTitle)}</h3>
        <p>${this.esc(this.translations.emptyPageDesc)}</p>
        <button id="btn-empty-add-section" class="pg-btn" style="margin-top: var(--of-space-s);">
          ${OpenFormBuilder.icon('folder-plus')} ${this.esc(this.translations.addSectionLabel)}
        </button>
      `;
      this.canvasEl.appendChild(emptyState);

      emptyState.querySelector('#btn-empty-add-section').addEventListener('click', () => this.addNewSection());

      return;
    }

    // Render Canvas Sections
    this.canvasEl.appendChild(this.renderSectionInsertionDivider(0));
    activePage.sections.forEach((section, sectionIndex) => {
      const isSectionSelected = this.selectedSectionId === section.sectionId;
      const sectionEl = document.createElement('div');
      sectionEl.className = `canvas-section ${isSectionSelected ? 'selected' : ''}`;
      sectionEl.setAttribute('data-section-id', section.sectionId);

      // Render Section Header Action Bar
      const sectionHeader = document.createElement('div');
      sectionHeader.className = 'canvas-section-header';
      sectionHeader.setAttribute('draggable', 'true');
      const sectionTitleVal = this.editingLocale === 'default' ? (section.title || '') : (this.getTranslationValue('sections', section.sectionId) || '');

      sectionHeader.innerHTML = `
        <div class="section-drag-handle">
          ${OpenFormBuilder.icon('grip-vertical', '', 'width: 14px; height: 14px; color: var(--of-color-neutral-6); cursor: grab; margin-right: var(--of-space-xs);')}
          <span style="font-weight: var(--of-font-weight-bold); font-size: var(--of-font-size-xs); text-transform: uppercase; letter-spacing: 0.8px; color: var(--of-color-primary); display: flex; align-items: center; gap: var(--of-space-xs);">
            ${OpenFormBuilder.icon('folder', '', 'width: var(--of-font-size-s); height: var(--of-font-size-s);')} ${this.esc(this.translations.sectionLabelPrefix)}
          </span>
          <input type="text" class="section-title-input" value="${this.esc(sectionTitleVal)}" placeholder="${this.esc(this.editingLocale === 'default' ? this.translations.sectionTitlePlaceholder : (section.title || this.translations.sectionTitlePlaceholder))}" style="flex: 1; font-weight: var(--of-font-weight-bold); background: transparent; border: none; ${sectionTitleVal == "" || sectionTitleVal == "Default Section" ? "color: var(--of-text-secondary);" : ""} font-size: var(--of-font-size-s); outline: none; margin-left: 6px; color: var(--of-color-neutral-10);" />
        </div>
        <div class="section-operations" style="display: flex; gap: 6px; align-items: center;">
          <button class="pg-btn pg-btn-secondary btn-sec-add-row" style="padding: var(--of-space-xs) 10px; font-size: var(--of-font-size-xs);">
            ${OpenFormBuilder.icon('plus', '', 'width: 12px; height: 12px;')} ${this.esc(this.translations.addRowLabel)}
          </button>
          <button class="pg-btn pg-btn-secondary btn-sec-delete">
            ${OpenFormBuilder.icon('trash-2', '', 'width: 12px; height: 12px;')}
          </button>
        </div>
      `;
      sectionEl.appendChild(sectionHeader);

      // Section selection handler
      sectionEl.addEventListener('click', (e) => {
        if (e.target.closest('.section-operations') || e.target.closest('.canvas-row') || e.target.closest('.section-title-input')) {
          return;
        }
        this.selectSection(section.sectionId);
      });

      // Section title inline rename handler
      const titleInput = sectionHeader.querySelector('.section-title-input');
      titleInput.addEventListener('change', (e) => {
        const newVal = e.target.value;
        if (this.editingLocale === 'default') {
          section.title = newVal || `Section ${sectionIndex + 1}`;
        } else {
          if (newVal) {
            this.setTranslationValue('sections', section.sectionId, null, newVal);
          } else {
            this.deleteTranslationValue('sections', section.sectionId);
          }
        }
        this.notifyChange();
      });

      // Section operations buttons
      sectionHeader.querySelector('.btn-sec-add-row').addEventListener('click', (e) => {
        e.stopPropagation();
        this.addNewRow(section.sectionId);
      });
      sectionHeader.querySelector('.btn-sec-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteSection(section.sectionId);
      });

      // DRAG & DROP FOR SECTION REORDERING
      sectionHeader.addEventListener('dragstart', (e) => {
        this.resetDragState();
        this.draggedSectionId = section.sectionId;
        sectionEl.classList.add('dragging-section');
        e.dataTransfer.setData('text/plain', section.sectionId);
        e.dataTransfer.effectAllowed = 'move';
      });

      sectionHeader.addEventListener('dragend', () => {
        sectionEl.classList.remove('dragging-section');
        this.draggedSectionId = null;
      });

      sectionEl.addEventListener('dragover', (e) => {
        if (this.draggedSectionId && this.draggedSectionId !== section.sectionId) {
          e.preventDefault();
          sectionEl.classList.add('drag-over-section');
        }
      });

      sectionEl.addEventListener('dragleave', () => {
        sectionEl.classList.remove('drag-over-section');
      });

      sectionEl.addEventListener('drop', (e) => {
        if (this.draggedSectionId && this.draggedSectionId !== section.sectionId) {
          e.preventDefault();
          sectionEl.classList.remove('drag-over-section');

          const draggedIndex = activePage.sections.findIndex(s => s.sectionId === this.draggedSectionId);
          const targetIndex = activePage.sections.findIndex(s => s.sectionId === section.sectionId);

          if (draggedIndex !== -1 && targetIndex !== -1) {
            const [draggedSec] = activePage.sections.splice(draggedIndex, 1);
            activePage.sections.splice(targetIndex, 0, draggedSec);
            this.notifyChange();
            this.render();
          }
        }
      });

      // Render Rows Container inside this Section
      const rowsContainer = document.createElement('div');
      rowsContainer.className = 'canvas-section-rows';

      if (section.rows.length === 0) {
        // Render a drop zone indicator inside empty sections
        const emptySecDrop = document.createElement('div');
        emptySecDrop.className = 'empty-section-drop-zone';
        emptySecDrop.innerHTML = `
          <div style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-6); text-align: center; padding: 20px; border: 1px dashed var(--of-border); border-radius: var(--of-border-radius-s);">
            ${this.esc(this.translations.emptySectionHint)}
          </div>
        `;
        rowsContainer.appendChild(emptySecDrop);
      } else {
        rowsContainer.appendChild(this.renderRowInsertionDivider(section.sectionId, 0));
      }

      section.rows.forEach((row, rowIndex) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'canvas-row';
        rowEl.setAttribute('data-row-id', row.rowId);

        // DRAG & DROP FOR ROW REORDERING (Within Section)
        rowEl.addEventListener('dragover', (e) => {
          if (this.draggedRowId && this.draggedRowId !== row.rowId) {
            e.preventDefault();
            rowEl.classList.add('drag-over-row');
          }
        });

        rowEl.addEventListener('dragleave', () => {
          rowEl.classList.remove('drag-over-row');
        });

        rowEl.addEventListener('drop', (e) => {
          e.preventDefault();
          rowEl.classList.remove('drag-over-row');
          if (this.draggedRowId && this.draggedRowId !== row.rowId) {
            let sourceSection = null;
            let draggedIndex = -1;
            for (const sec of activePage.sections) {
              const idx = sec.rows.findIndex(r => r.rowId === this.draggedRowId);
              if (idx !== -1) {
                sourceSection = sec;
                draggedIndex = idx;
                break;
              }
            }

            const targetIndex = section.rows.findIndex(r => r.rowId === row.rowId);
            if (sourceSection && draggedIndex !== -1 && targetIndex !== -1) {
              const [draggedRow] = sourceSection.rows.splice(draggedIndex, 1);
              section.rows.splice(targetIndex, 0, draggedRow);
              this.notifyChange();
              this.render();
            }
          }
        });

        // Row Actions Toolbar Markup
        const rowBar = document.createElement('div');
        rowBar.className = 'row-actions-bar';
        rowBar.innerHTML = `
          <div class="row-drag-handle" draggable="true" title="${this.esc(this.translations.gripHorizontalTitle)}">
            ${OpenFormBuilder.icon('grip-horizontal')} ${this.esc(this.translations.rowLabel)} ${rowIndex + 1}
          </div>
          <div class="row-operations">
            <button class="row-op-btn add-col" title="${this.esc(this.translations.addColTitle)}">
              ${OpenFormBuilder.icon('columns')}
            </button>
            <button class="row-op-btn delete" title="${this.esc(this.translations.deleteRowTitle)}">
              ${OpenFormBuilder.icon('trash-2')}
            </button>
          </div>
        `;
        rowEl.appendChild(rowBar);

        // Setup Row Drag handles
        const handleEl = rowBar.querySelector('.row-drag-handle');
        handleEl.addEventListener('dragstart', (e) => {
          this.resetDragState();
          this.draggedRowId = row.rowId;
          rowEl.classList.add('dragging');
          e.dataTransfer.setData('text/plain', row.rowId);
          e.dataTransfer.effectAllowed = 'move';
        });

        handleEl.addEventListener('dragend', () => {
          rowEl.classList.remove('dragging');
          this.draggedRowId = null;
        });

        // Bind Row Toolbar events
        rowBar.querySelector('.add-col').addEventListener('click', () => this.addColumnToRow(row.rowId));
        rowBar.querySelector('.delete').addEventListener('click', () => this.deleteRow(row.rowId));

        // Columns Grid
        const colsGrid = document.createElement('div');
        colsGrid.className = 'canvas-row-columns';

        row.columns.forEach((col, colIndex) => {
          const colCell = document.createElement('div');
          colCell.className = `canvas-column-cell col-${col.width}`;
          colCell.setAttribute('data-col-index', colIndex);

          // Column Span controls and action details
          const colControls = document.createElement('div');
          colControls.className = 'column-controls';
          colControls.innerHTML = `
            <button class="col-btn col-dec" title="${this.esc(this.translations.colDecreaseTitle)}">-</button>
            <span class="col-badge">${col.width}/12</span>
            <button class="col-btn col-inc" title="${this.esc(this.translations.colIncreaseTitle)}">+</button>
            ${row.columns.length > 1 ? `<button class="col-btn col-del" title="${this.esc(this.translations.colDeleteTitle)}" style="color: var(--of-color-error)">x</button>` : ''}
          `;
          colCell.appendChild(colControls);

          // Bind Column Width event adjusters
          colControls.querySelector('.col-dec').addEventListener('click', (e) => {
            e.stopPropagation();
            this.adjustColumnWidth(row.rowId, colIndex, -1);
          });
          colControls.querySelector('.col-inc').addEventListener('click', (e) => {
            e.stopPropagation();
            this.adjustColumnWidth(row.rowId, colIndex, 1);
          });
          if (row.columns.length > 1) {
            colControls.querySelector('.col-del').addEventListener('click', (e) => {
              e.stopPropagation();
              this.deleteColumnFromRow(row.rowId, colIndex);
            });
          }

          // Populate field inside the column cell if defined
          if (col.field) {
            const field = col.field;
            const isSelected = field.id === this.selectedFieldId;

            const fieldEl = document.createElement('div');
            fieldEl.className = `canvas-field ${isSelected ? 'selected' : ''}`;
            fieldEl.setAttribute('draggable', 'true');

            // Local dragging of columns to move/swap elements
            fieldEl.addEventListener('dragstart', (e) => {
              e.stopPropagation();
              this.resetDragState();
              this.draggedSourceElement = { rowId: row.rowId, colIndex: colIndex, field: field };
              fieldEl.classList.add('dragging');
              e.dataTransfer.setData('text/plain', field.id);
              e.dataTransfer.effectAllowed = 'move';
            });

            fieldEl.addEventListener('dragend', () => {
              fieldEl.classList.remove('dragging');
              this.draggedSourceElement = null;
            });

            if (field.type === 'header') {
              // Visual accent structure for Section Title headings
              const displayLabel = this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key || field.id, 'label') || field.label);
              const displaySub = this.editingLocale === 'default' ? (field.subtitle || '') : (this.getTranslationValue('fields', field.key || field.id, 'subtitle') || (field.subtitle || ''));
              fieldEl.innerHTML = `
                <div class="canvas-field-info" style="width: 100%; padding-left: 6px;">
                  ${OpenFormBuilder.icon('heading', 'canvas-field-icon', 'color: var(--of-color-primary)')}
                  <div style="flex: 1; min-width: 0;">
                    <div class="canvas-field-title" style="font-weight: var(--of-font-weight-bold); color: var(--of-color-neutral-10); font-size: var(--of-font-size-s); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4; max-height: 2.8em;">${this.esc(displayLabel)}</div>
                    <span style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displaySub ? this.esc(displaySub) : `(${this.esc(this.translations.sectionHeaderSubtitle)})`}</span>
                  </div>
                </div>
                <div class="canvas-field-actions">
                  <button class="canvas-field-btn delete" title="${this.esc(this.translations.removeFieldTitle)}">
                    ${OpenFormBuilder.icon('x')}
                  </button>
                </div>
              `;
            } else if (field.type === 'paragraph') {
              // Visual display for explanatory paragraph text blocks
              const displayLabel = this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key || field.id, 'label') || field.label);
              fieldEl.innerHTML = `
                <div class="canvas-field-info" style="width: 100%; border-left: 3px dashed var(--of-color-neutral-5); padding-left: 6px;">
                  ${OpenFormBuilder.icon('align-justify', 'canvas-field-icon', 'color: var(--of-color-neutral-7)')}
                  <div style="flex: 1; min-width: 0;">
                    <div class="canvas-field-title" style="font-weight: var(--of-font-weight-normal); color: var(--of-color-neutral-8); font-size: var(--of-font-size-s); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4; max-height: 2.8em;">${this.esc(displayLabel)}</div>
                    <span style="font-size: 9px; color: var(--of-color-neutral-6); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.esc(this.translations.paragraphLabel)}</span>
                  </div>
                </div>
                <div class="canvas-field-actions">
                  <button class="canvas-field-btn delete" title="${this.esc(this.translations.removeFieldTitle)}">
                    ${OpenFormBuilder.icon('x')}
                  </button>
                </div>
              `;
            } else if (field.type === 'repeater') {
              // Repeatable list visual card
              const displayLabel = this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key, 'label') || field.label);
              fieldEl.innerHTML = `
                <div class="canvas-field-info canvas-field-repeater-wrapper" style="width: 100%; flex-direction: column; align-items: flex-start; gap: var(--of-space-s);">
                  <div style="display: flex; align-items: center; gap: var(--of-space-s); width: 100%;">
                    ${OpenFormBuilder.icon('layers', 'canvas-field-icon', 'color: var(--of-color-primary);')}
                    <div style="flex: 1;">
                      <div class="canvas-field-title" style="font-weight: var(--of-font-weight-bold); color: var(--of-color-neutral-10); font-size: var(--of-font-size-s);">${this.esc(displayLabel)}</div>
                      <span class="canvas-field-key">${this.esc(field.key)}</span>
                    </div>
                    <div class="repeater-operations">
                      <button class="repeater-op-btn add-row" title="${this.esc(this.translations.addRowLabel)}" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; color: var(--of-color-primary); font-size: var(--of-font-size-xs); gap: var(--of-space-xs); padding: 2px 6px;">
                        ${OpenFormBuilder.icon('plus', '', 'width: 12px; height: 12px;')} ${this.esc(this.translations.addRowLabel)}
                      </button>
                    </div>
                  </div>
                  <div class="canvas-repeater-rows-container" style="width: 100%; display: flex; flex-direction: column; gap: var(--of-space-m); border-left: 2px solid var(--of-color-neutral-4); padding-left: 10px; margin-top: var(--of-space-xs);">
                    <!-- Rows will be appended here -->
                  </div>
                </div>
                <div class="canvas-field-actions">
                  <button class="canvas-field-btn delete" title="${this.esc(this.translations.removeFieldTitle)}">
                    ${OpenFormBuilder.icon('x')}
                  </button>
                </div>
              `;

              // Bind repeater actions
              const deleteBtn = fieldEl.querySelector('.canvas-field-actions .delete');
              if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  this.deleteField(row.rowId, colIndex);
                });
              }

              const addRowBtn = fieldEl.querySelector('.repeater-op-btn.add-row');
              if (addRowBtn) {
                addRowBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  this.addRepeaterRow(field);
                });
              }

              const rowsContainer = fieldEl.querySelector('.canvas-repeater-rows-container');
              if (!field.rows || field.rows.length === 0) {
                const emptyZone = document.createElement('div');
                emptyZone.style.cssText = "font-size: var(--of-font-size-xs); color: var(--of-color-neutral-6); text-align: center; padding: 15px; border: 1px dashed var(--of-border); border-radius: var(--of-border-radius-s); width: 100%;";
                emptyZone.textContent = this.translations.repeaterEmptyHint;
                rowsContainer.appendChild(emptyZone);
              } else {
                field.rows.forEach((subRow, subRowIndex) => {
                  const subRowEl = document.createElement('div');
                  subRowEl.className = 'canvas-row';
                  subRowEl.setAttribute('data-row-id', subRow.rowId);
                  subRowEl.style.margin = '4px 0';

                  // Row Actions Toolbar for Repeater Row
                  const subRowBar = document.createElement('div');
                  subRowBar.className = 'row-actions-bar';
                  subRowBar.innerHTML = `
                    <div style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); font-weight: var(--of-font-weight-semibold);">
                      ${this.esc(this.translations.rowLabel)} ${subRowIndex + 1}
                    </div>
                    <div class="row-operations">
                      <button class="row-op-btn add-col" title="${this.esc(this.translations.addColTitle)}">
                        ${OpenFormBuilder.icon('columns')}
                      </button>
                      <button class="row-op-btn delete" title="${this.esc(this.translations.deleteRowTitle)}">
                        ${OpenFormBuilder.icon('trash-2')}
                      </button>
                    </div>
                  `;
                  subRowEl.appendChild(subRowBar);

                  // Setup sub-row reordering (drag row inside repeater)
                  subRowBar.style.cursor = 'grab';
                  subRowBar.setAttribute('draggable', 'true');
                  subRowBar.addEventListener('dragstart', (e) => {
                    e.stopPropagation();
                    this.resetDragState();
                    this.draggedSubRowId = subRow.rowId;
                    subRowEl.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', subRow.rowId);
                  });
                  subRowBar.addEventListener('dragend', () => {
                    subRowEl.classList.remove('dragging');
                    this.draggedSubRowId = null;
                  });

                  subRowEl.addEventListener('dragover', (e) => {
                    if (this.draggedSubRowId && this.draggedSubRowId !== subRow.rowId) {
                      e.preventDefault();
                      subRowEl.classList.add('drag-over-row');
                    }
                  });
                  subRowEl.addEventListener('dragleave', () => {
                    subRowEl.classList.remove('drag-over-row');
                  });
                  subRowEl.addEventListener('drop', (e) => {
                    e.preventDefault();
                    subRowEl.classList.remove('drag-over-row');
                    if (this.draggedSubRowId && this.draggedSubRowId !== subRow.rowId) {
                      const idx = field.rows.findIndex(r => r.rowId === this.draggedSubRowId);
                      const targetIdx = field.rows.findIndex(r => r.rowId === subRow.rowId);
                      if (idx !== -1 && targetIdx !== -1) {
                        const [dragged] = field.rows.splice(idx, 1);
                        field.rows.splice(targetIdx, 0, dragged);
                        this.notifyChange();
                        this.render();
                      }
                    }
                  });

                  subRowBar.querySelector('.add-col').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.addColumnToRow(subRow.rowId);
                  });
                  subRowBar.querySelector('.delete').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteRow(subRow.rowId);
                  });

                  // Columns Grid
                  const colsGrid = document.createElement('div');
                  colsGrid.className = 'canvas-row-columns';

                  subRow.columns.forEach((subCol, subColIndex) => {
                    const colCell = document.createElement('div');
                    colCell.className = `canvas-column-cell col-${subCol.width}`;
                    colCell.setAttribute('data-col-index', subColIndex);

                    const colControls = document.createElement('div');
                    colControls.className = 'column-controls';
                    colControls.innerHTML = `
                      <button class="col-btn col-dec" title="${this.esc(this.translations.colDecreaseTitle)}">-</button>
                      <span class="col-badge">${subCol.width}/12</span>
                      <button class="col-btn col-inc" title="${this.esc(this.translations.colIncreaseTitle)}">+</button>
                      ${subRow.columns.length > 1 ? `<button class="col-btn col-del" title="${this.esc(this.translations.colDeleteTitle)}" style="color: var(--of-color-error)">x</button>` : ''}
                    `;
                    colCell.appendChild(colControls);

                    colControls.querySelector('.col-dec').addEventListener('click', (e) => {
                      e.stopPropagation();
                      this.adjustColumnWidth(subRow.rowId, subColIndex, -1);
                    });
                    colControls.querySelector('.col-inc').addEventListener('click', (e) => {
                      e.stopPropagation();
                      this.adjustColumnWidth(subRow.rowId, subColIndex, 1);
                    });
                    if (subRow.columns.length > 1) {
                      colControls.querySelector('.col-del').addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.deleteColumnFromRow(subRow.rowId, subColIndex);
                      });
                    }

                    if (subCol.field) {
                      const subField = subCol.field;
                      const subIsSelected = subField.id === this.selectedFieldId;

                      const subFieldEl = document.createElement('div');
                      subFieldEl.className = `canvas-field ${subIsSelected ? 'selected' : ''}`;
                      subFieldEl.setAttribute('draggable', 'true');

                      subFieldEl.addEventListener('dragstart', (e) => {
                        e.stopPropagation();
                        this.resetDragState();
                        this.draggedSourceElement = { rowId: subRow.rowId, colIndex: subColIndex, field: subField };
                        subFieldEl.classList.add('dragging');
                        e.dataTransfer.setData('text/plain', subField.id);
                      });

                      subFieldEl.addEventListener('dragend', () => {
                        subFieldEl.classList.remove('dragging');
                        this.draggedSourceElement = null;
                      });

                      const displaySubLabel = this.editingLocale === 'default' ? subField.label : (this.getTranslationValue('fields', subField.key || subField.id, 'label') || subField.label);
                      subFieldEl.innerHTML = `
                        <div class="canvas-field-info" style="width: 100%;">
                          ${OpenFormBuilder.icon(this.getFieldIcon(subField.type), 'canvas-field-icon')}
                          <div style="flex: 1;">
                            <div class="canvas-field-title" style="font-weight: var(--of-font-weight-semibold); font-size: var(--of-font-size-s); color: var(--of-color-neutral-10);">${this.esc(displaySubLabel)}</div>
                            <span class="canvas-field-key" style="font-size: 9px;">${this.esc(subField.key)}</span>
                          </div>
                        </div>
                        <div class="canvas-field-actions">
                          <button class="canvas-field-btn delete" title="${this.esc(this.translations.removeFieldTitle)}">
                            ${OpenFormBuilder.icon('x')}
                          </button>
                        </div>
                      `;

                      subFieldEl.querySelector('.canvas-field-actions .delete').addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.deleteField(subRow.rowId, subColIndex);
                      });

                      subFieldEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.selectedFieldId = subField.id;
                        this.selectedSectionId = null;
                        this.render();
                        this.renderProperties();
                      });

                      colCell.appendChild(subFieldEl);
                    } else {
                      const emptyIndicator = document.createElement('div');
                      emptyIndicator.className = 'column-empty-indicator';
                      emptyIndicator.textContent = this.translations.dropFieldHere;
                      colCell.appendChild(emptyIndicator);
                    }

                    this.setupCellDragAndDrop(colCell, subRow.rowId, subColIndex);
                    colsGrid.appendChild(colCell);
                  });

                  subRowEl.appendChild(colsGrid);
                  rowsContainer.appendChild(subRowEl);
                });
              }
            } else if (field.type === 'matrix') {
              // Question matrix visual card
              let rowsHtml = '';
              if (field.matrixRows && field.matrixRows.length > 0) {
                rowsHtml = field.matrixRows.map(r => {
                  const displayRowLabel = this.editingLocale === 'default'
                    ? r.label
                    : (this.getTranslationValue('fields', field.key, 'matrixRows', r.key) || r.label);
                  return `
                    <div class="canvas-matrix-row-tag">
                      ${OpenFormBuilder.icon('align-justify')}
                      <span>${this.esc(displayRowLabel)} (${this.esc(r.key)})</span>
                    </div>
                  `;
                }).join('');
              } else {
                rowsHtml = `<div class="canvas-matrix-empty-rows">${this.esc(this.translations.matrixEmptyRows || 'Empty Matrix rows. Click to configure rows in properties.')}</div>`;
              }

              const displayLabel = this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key, 'label') || field.label);
              fieldEl.innerHTML = `
                <div class="canvas-field-info canvas-field-matrix-wrapper" style="width: 100%; flex-direction: column; align-items: flex-start; gap: var(--of-space-s);">
                  <div style="display: flex; align-items: center; gap: var(--of-space-s); width: 100%;">
                    ${OpenFormBuilder.icon('grid', 'canvas-field-icon', 'color: var(--of-color-primary);')}
                    <div style="flex: 1;">
                      <div class="canvas-field-title" style="font-weight: var(--of-font-weight-bold); color: var(--of-color-neutral-10); font-size: var(--of-font-size-s);">${this.esc(displayLabel)}</div>
                      <span class="canvas-field-key">${this.esc(field.key)}</span>
                    </div>
                  </div>
                  <div class="canvas-matrix-rows-container">
                    ${rowsHtml}
                  </div>
                </div>
                <div class="canvas-field-actions">
                  <button class="canvas-field-btn delete" title="${this.esc(this.translations.removeFieldTitle)}">
                    ${OpenFormBuilder.icon('x')}
                  </button>
                </div>
              `;
            } else {
              // Standard form input layouts
              const displayLabel = this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key, 'label') || field.label);
              fieldEl.innerHTML = `
                <div class="canvas-field-info">
                  ${OpenFormBuilder.icon(this.getFieldIcon(field.type), 'canvas-field-icon')}
                  <div>
                    <div class="canvas-field-title">
                      ${this.esc(displayLabel)} ${field.required ? '<span style="color: var(--of-color-error)">*</span>' : ''}
                      ${field.isCalculated ? `<span class="canvas-formula-badge" style="font-size: 9px; padding: 2px 6px; border-radius: 10px; background: color-mix(in srgb, var(--of-color-primary) 10%, transparent); color: var(--of-color-primary); margin-left: 6px; font-weight: var(--of-font-weight-semibold); display: inline-flex; align-items: center; gap: 3px;">${OpenFormBuilder.icon('calculator', '', 'width: 10px; height: 10px;')} fx</span>` : ''}
                      ${field.isCalculated && field.isVisibleOnForm === false ? `<span class="canvas-formula-badge" style="font-size: 9px; padding: 2px 6px; border-radius: 10px; background: var(--of-color-neutral-3); color: var(--of-color-neutral-7); margin-left: 6px; font-weight: var(--of-font-weight-semibold); display: inline-flex; align-items: center; gap: 3px;">${OpenFormBuilder.icon('eye-off', '', 'width: 10px; height: 10px;')} ${this.esc(this.translations.formulaHiddenBadge)}</span>` : ''}
                    </div>
                    <span class="canvas-field-key">${this.esc(field.key)}</span>
                  </div>
                </div>
                <div class="canvas-field-actions">
                  <button class="canvas-field-btn delete" title="${this.esc(this.translations.removeFieldTitle)}">
                    ${OpenFormBuilder.icon('x')}
                  </button>
                </div>
              `;
            }

            colCell.appendChild(fieldEl);

            // Focus field properties on click
            fieldEl.addEventListener('click', (e) => {
              e.stopPropagation();
              this.selectField(field.id);
            });

            fieldEl.querySelector('.delete').addEventListener('click', (e) => {
              e.stopPropagation();
              this.deleteField(row.rowId, colIndex);
            });

          } else {
            // Render visual drop zone inside empty column cells
            const emptyIndicator = document.createElement('div');
            emptyIndicator.className = 'column-empty-indicator';
            emptyIndicator.textContent = this.translations.dropFieldHere;
            colCell.appendChild(emptyIndicator);
          }

          // Setup dropzones on each individual column cell
          this.setupCellDragAndDrop(colCell, row.rowId, colIndex);

          colsGrid.appendChild(colCell);
        });

        rowEl.appendChild(colsGrid);
        rowsContainer.appendChild(rowEl);
        rowsContainer.appendChild(this.renderRowInsertionDivider(section.sectionId, rowIndex + 1));
      });

      sectionEl.appendChild(rowsContainer);
      this.canvasEl.appendChild(sectionEl);
      this.canvasEl.appendChild(this.renderSectionInsertionDivider(sectionIndex + 1));
    });

  }

  /**
   * Bind event handlers for dropping fields inside visual cells (supports insertion and swap mechanics)
   */
  setupCellDragAndDrop(cellEl, rowId, colIndex) {
    cellEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cellEl.classList.add('drag-over');
    });

    cellEl.addEventListener('dragleave', (e) => {
      e.stopPropagation();
      cellEl.classList.remove('drag-over');
    });

    cellEl.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cellEl.classList.remove('drag-over');

      if (this.readOnly) return;
      if (this.draggedFieldType) {
        // Drop new field from sidebar palette
        if (!this.isFieldTypeAllowed(this.draggedFieldType)) return;
        const res = this.getRow(rowId);
        if (res) {
          const { row, repeaterField } = res;
          // Prevent nesting repeaters/matrices inside repeaters
          if (repeaterField && ['repeater', 'matrix'].includes(this.draggedFieldType)) {
            this.showToast(this.translations.nestedRepeaterMatrixToast, true);
            return;
          }
          const newField = this.createDefaultField(this.draggedFieldType);
          const replacedFields = this._collectFieldTree(row.columns[colIndex].field);
          row.columns[colIndex].field = newField;
          this._cleanupAndReportRemovedFields(replacedFields);

          this.selectedFieldId = newField.id;
          this.notifyChange();
          this.render();
          this.renderProperties();
        }
      } else if (this.draggedSourceElement) {
        // Drag moving / swapping fields between cells local to the canvas
        if (this.draggedSourceElement.rowId === rowId && this.draggedSourceElement.colIndex === colIndex) {
          this.draggedSourceElement = null;
          return;
        }

        const targetRes = this.getRow(rowId);
        const sourceRes = this.getRow(this.draggedSourceElement.rowId);

        if (targetRes && sourceRes) {
          const targetRow = targetRes.row;
          const sourceRow = sourceRes.row;
          const sourceField = this.draggedSourceElement.field;
          const targetField = targetRow.columns[colIndex].field || null;

          if (targetRes.repeaterField && sourceField.type === 'repeater') {
            this.showToast(this.translations.nestedRepeaterToast, true);
            return;
          }

          // Perform clean swap
          sourceRow.columns[this.draggedSourceElement.colIndex].field = targetField;
          targetRow.columns[colIndex].field = sourceField;

          this.selectedFieldId = sourceField.id;
          this.draggedSourceElement = null;

          this.notifyChange();
          this.render();
          this.renderProperties();
        }
      }
    });
  }

  /**
   * Renders the reactive Properties Panel on the right sidebar
   */
  /**
   * Dispatches to the appropriate properties-panel renderer based on current selection.
   * Was previously a single ~530-line method mixing 5 unrelated panel types; split into
   * one focused method per panel (A1).
   */
  renderProperties() {
    this._renderPropertiesPanel();
    if (this.readOnly) this._applyReadOnlyProperties();
  }

  _renderPropertiesPanel() {
    if (this.selectedSectionId) {
      const activePage = this.schema.pages[this.activePageIndex];
      const section = activePage.sections.find(s => s.sectionId === this.selectedSectionId);
      if (!section) return;
      this.renderSectionPropertiesPanel(section);
      return;
    }

    const field = this.getSelectedField();

    if (!field) {
      this.renderPagePropertiesPanel();
      return;
    }

    if (field.type === 'paragraph') {
      this.renderParagraphPropertiesPanel(field);
      return;
    }

    if (field.type === 'header') {
      this.renderHeaderPropertiesPanel(field);
      return;
    }

    this.renderStandardFieldPropertiesPanel(field);
  }

  /**
   * Properties panel for a selected Section (title, duplicate, visibility business rules).
   */
  renderSectionPropertiesPanel(section) {
      this.propertiesEl.innerHTML = `
        <div class="properties-form" style="max-height: 100%; overflow-y: auto; padding-right: var(--of-space-xs);">
          ${this.renderLocaleSwitcherHTML()}
          <div class="prop-header">
            ${OpenFormBuilder.icon('folder')}
            <span class="prop-title">${this.esc(this.translations.propertiesSectionTitle)}</span>
          </div>

          <!-- Section Title Input -->
          <div class="prop-group">
            <label class="prop-label">${this.esc(this.translations.sectionTitleLabel)}</label>
            <input type="text" id="prop-section-title" class="prop-input" 
                   value="${this.esc(this.editingLocale === 'default' ? (section.title || '') : (this.getTranslationValue('sections', section.sectionId) || ''))}" 
                   placeholder="${this.esc(this.editingLocale === 'default' ? '' : (section.title || ''))}" />
          </div>

          <div class="prop-group" style="margin-top: var(--of-space-m);">
            <button type="button" class="pg-btn pg-btn-secondary" id="btn-duplicate-section" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: var(--of-space-s);"
                    ${this.editingLocale !== 'default' ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              ${OpenFormBuilder.icon('copy', '', 'width: 14px; height: 14px;')} ${this.esc(this.translations.duplicateSectionLabel)}
            </button>
          </div>

          <hr style="border: none; border-top: 1px solid var(--of-color-neutral-4); margin: var(--of-space-base) 0;" />

          <!-- Business Rules Editor for Section -->
          ${this.renderBusinessRulesEditorHTML(section, false)}
        </div>
      `;

      this.bindLocaleSwitcherEvents();

      // Rename section event
      const sectionTitleInput = this.propertiesEl.querySelector('#prop-section-title');
      if (sectionTitleInput) {
        sectionTitleInput.addEventListener('input', (e) => {
          const newVal = e.target.value;
          if (this.editingLocale === 'default') {
            section.title = newVal;
          } else {
            if (newVal) {
              this.setTranslationValue('sections', section.sectionId, null, newVal);
            } else {
              this.deleteTranslationValue('sections', section.sectionId);
            }
          }
          this.notifyChange();
          this.debouncedRender(); // sync canvas
        });
      }

      // Duplicate section event
      const duplicateBtn = this.propertiesEl.querySelector('#btn-duplicate-section');
      if (duplicateBtn && this.editingLocale === 'default') {
        duplicateBtn.addEventListener('click', () => {
          this.duplicateSection(section.sectionId);
        });
      }

      this.bindBusinessRulesEvents(section);
  }

  /**
   * Properties panel shown when no field/section is selected — page title + cross-field
   * validation rules editor.
   */
  renderPagePropertiesPanel() {
      const activePage = this.schema.pages[this.activePageIndex];
      this.propertiesEl.innerHTML = `
        <div class="properties-form" style="max-height: 100%; overflow-y: auto; padding-right: var(--of-space-xs);">
          ${this.renderLocaleSwitcherHTML()}
          <div class="prop-header">
            ${OpenFormBuilder.icon('file-text')}
            <span class="prop-title">${this.esc(this.translations.propertiesPageTitle)}</span>
          </div>
          
          <div class="prop-group">
            <label class="prop-label">${this.esc(this.translations.pageTitleLabel)}</label>
            <input type="text" id="prop-page-title" class="prop-input" 
                   value="${this.esc(this.editingLocale === 'default' ? activePage.title : (this.getTranslationValue('pages', activePage.pageId) || ''))}" 
                   placeholder="${this.esc(this.editingLocale === 'default' ? '' : activePage.title)}" />
            <span style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); margin-top: 2px;">${this.esc(this.translations.pageTitleHint)}</span>
          </div>
          
          <hr style="border: none; border-top: 1px solid var(--of-color-neutral-4); margin: var(--of-space-base) 0;" />

          <!-- Page branching: visibility rules for this page -->
          <div class="page-rules-hint" style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); line-height: 1.4; margin-bottom: var(--of-space-s);">${this.esc(this.translations.pageRulesHint)}</div>
          ${this.renderBusinessRulesEditorHTML(activePage, false, 'page')}

          <hr style="border: none; border-top: 1px solid var(--of-color-neutral-4); margin: var(--of-space-base) 0;" />
          ${this.renderCrossFieldRulesEditorHTML()}

          <hr style="border: none; border-top: 1px solid var(--of-color-neutral-4); margin: var(--of-space-base) 0;" />
          <div style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); text-align: center; line-height: 1.4;">
            ${this.esc(this.translations.propertiesHelpText)}
          </div>
        </div>
      `;

      this.bindLocaleSwitcherEvents();
      this.bindBusinessRulesEvents(activePage);
      this.bindCrossFieldRulesEvents();

      const pageTitleInput = this.propertiesEl.querySelector('#prop-page-title');
      if (pageTitleInput) {
        pageTitleInput.addEventListener('input', (e) => {
          const newVal = e.target.value;
          if (this.editingLocale === 'default') {
            this.renamePage(activePage.pageId, newVal);
          } else {
            if (newVal) {
              this.setTranslationValue('pages', activePage.pageId, null, newVal);
            } else {
              this.deleteTranslationValue('pages', activePage.pageId);
            }
            this.notifyChange();
            this.debouncedRender(); // sync page tabs preview
          }
        });
      }
  }

  /**
   * Properties panel for a selected `paragraph` field (static text block — no key/required).
   */
  renderParagraphPropertiesPanel(field) {
      this.propertiesEl.innerHTML = `
        <div class="properties-form">
          ${this.renderLocaleSwitcherHTML()}
          <div class="prop-header">
            ${OpenFormBuilder.icon('align-justify')}
            <span class="prop-title">${this.esc(this.translations.propertiesParagraphTitle)}</span>
          </div>
          
          <!-- Text Content -->
          <div class="prop-group">
            <label class="prop-label">${this.esc(this.translations.paragraphContentLabel)}</label>
            <textarea id="prop-paragraph-label" class="prop-input" rows="6" style="resize: vertical; font-family: inherit; font-size: var(--of-font-size-s); line-height: 1.5; padding: var(--of-space-s);">${this.esc(this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key || field.id, 'label') || ''))}</textarea>
          </div>
          
          <hr style="border: none; border-top: 1px solid var(--of-color-neutral-4); margin: var(--of-space-m) 0;" />
          <div style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); line-height: 1.4;">
            ${this.esc(this.translations.paragraphBlockHint)}
          </div>
        </div>
      `;

      this.bindLocaleSwitcherEvents();

      const paraLabel = this.propertiesEl.querySelector('#prop-paragraph-label');
      if (paraLabel) {
        paraLabel.addEventListener('input', (e) => {
          const newVal = e.target.value;
          if (this.editingLocale === 'default') {
            field.label = newVal;
          } else {
            if (newVal) {
              this.setTranslationValue('fields', field.key || field.id, 'label', newVal);
            } else {
              this.deleteTranslationValue('fields', field.key || field.id, 'label');
            }
          }
          this.notifyChange();
          this.debouncedRender();
        });
      }
  }

  /**
   * Properties panel for a selected `header` field (section title divider — label + subtitle,
   * no key/required).
   */
  renderHeaderPropertiesPanel(field) {
      this.propertiesEl.innerHTML = `
        <div class="properties-form">
          ${this.renderLocaleSwitcherHTML()}
          <div class="prop-header">
            ${OpenFormBuilder.icon('heading')}
            <span class="prop-title">${this.esc(this.translations.propertiesHeaderTitle)}</span>
          </div>
          
          <!-- Primary Heading Label -->
          <div class="prop-group">
            <label class="prop-label">${this.esc(this.translations.sectionTitleLabel)}</label>
            <input type="text" id="prop-header-label" class="prop-input" 
                   value="${this.esc(this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key || field.id, 'label') || ''))}" 
                   placeholder="${this.esc(this.editingLocale === 'default' ? '' : field.label)}" />
          </div>
          
          <!-- Secondary Subtitle -->
          <div class="prop-group">
            <label class="prop-label">${this.esc(this.translations.sectionSubtitleLabel)}</label>
            <input type="text" id="prop-header-subtitle" class="prop-input" 
                   value="${this.esc(this.editingLocale === 'default' ? (field.subtitle || '') : (this.getTranslationValue('fields', field.key || field.id, 'subtitle') || ''))}" 
                   placeholder="${this.esc(this.editingLocale === 'default' ? '' : (field.subtitle || ''))}" />
          </div>
          
          <hr style="border: none; border-top: 1px solid var(--of-color-neutral-4); margin: var(--of-space-m) 0;" />
          <div style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); line-height: 1.4;">
            ${this.esc(this.translations.sectionHeadingHint)}
          </div>
        </div>
      `;

      this.bindLocaleSwitcherEvents();

      const headerLabel = this.propertiesEl.querySelector('#prop-header-label');
      if (headerLabel) {
        headerLabel.addEventListener('input', (e) => {
          const newVal = e.target.value;
          if (this.editingLocale === 'default') {
            field.label = newVal;
          } else {
            if (newVal) {
              this.setTranslationValue('fields', field.key || field.id, 'label', newVal);
            } else {
              this.deleteTranslationValue('fields', field.key || field.id, 'label');
            }
          }
          this.notifyChange();
          this.debouncedRender();
        });
      }

      const headerSubtitle = this.propertiesEl.querySelector('#prop-header-subtitle');
      if (headerSubtitle) {
        headerSubtitle.addEventListener('input', (e) => {
          const newVal = e.target.value;
          if (this.editingLocale === 'default') {
            field.subtitle = newVal;
          } else {
            if (newVal) {
              this.setTranslationValue('fields', field.key || field.id, 'subtitle', newVal);
            } else {
              this.deleteTranslationValue('fields', field.key || field.id, 'subtitle');
            }
          }
          this.notifyChange();
          this.debouncedRender();
        });
      }
  }

  /**
   * Properties panel for any "standard" field type (everything except section/page/paragraph/
   * header — text, number, dropdown, file, repeater, matrix, etc). Still the largest of the
   * five panels since it composes every type-specific config block, but is now an isolated,
   * clearly-scoped method rather than mixed into a 530-line dispatcher.
   */
  renderStandardFieldPropertiesPanel(field) {
    this.propertiesEl.innerHTML = `
      <div class="properties-form" style="max-height: 100%; overflow-y: auto; padding-right: var(--of-space-xs);">
        ${this.renderLocaleSwitcherHTML()}
        <div class="prop-header">
          ${OpenFormBuilder.icon(this.getFieldIcon(field.type))}
          <span class="prop-title">${this.esc(this.translations.propertiesFieldTitle)}: ${this.esc(this.getFieldTypeLabel(field.type))}</span>
        </div>
        
        <!-- Label Input -->
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.fieldLabelLabel)}</label>
          <input type="text" id="prop-field-label" class="prop-input" 
                 value="${this.esc(this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key, 'label') || ''))}" 
                 placeholder="${this.esc(this.editingLocale === 'default' ? '' : field.label)}" />
        </div>
        
        <!-- Alphanumeric Database Key -->
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.fieldKeyLabel)}</label>
          <input type="text" id="prop-field-key" class="prop-input" value="${this.esc(field.key)}" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--of-color-neutral-3); cursor: not-allowed;"' : ''} />
          ${this.editingLocale !== 'default' ? `<span style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); margin-top: 2px; display: block;">${this.esc(this.translations.keyLocaleNotice)}</span>` : ''}
        </div>
        
        <!-- Optional Placeholder -->
        ${'placeholder' in field ? `
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.fieldPlaceholderLabel)}</label>
          <input type="text" id="prop-field-placeholder" class="prop-input" 
                 value="${this.esc(this.editingLocale === 'default' ? field.placeholder : (this.getTranslationValue('fields', field.key, 'placeholder') || ''))}" 
                 placeholder="${this.esc(this.editingLocale === 'default' ? '' : field.placeholder)}" />
        </div>` : ''}

        <!-- Required Field Toggle Checkbox -->
        <div class="prop-group">
          <label class="prop-checkbox-label">
            <input type="checkbox" id="prop-field-required" ${field.required ? 'checked' : ''} 
                   ${this.editingLocale !== 'default' ? 'disabled' : ''} />
            <span>${this.esc(this.translations.fieldRequiredLabel)}</span>
          </label>
        </div>

        <!-- Custom Input Masking (Only applies to text and number inputs) -->
        ${['text', 'number'].includes(field.type) ? `
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.maskLabel)}</label>
          <input type="text" id="prop-field-mask" class="prop-input" value="${this.esc(field.mask || '')}" placeholder="${this.esc(this.translations.maskPlaceholder)}" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--of-color-neutral-3); cursor: not-allowed;"' : ''} />
          <span style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); margin-top: var(--of-space-xs); display: block; line-height: 1.4;">
            ${this.tHtml('maskHint')}
          </span>
        </div>
        
        <div class="prop-group" id="prop-field-mask-clean-group" style="${field.mask ? '' : 'display: none;'}">
          <label class="prop-checkbox-label">
            <input type="checkbox" id="prop-field-mask-clean" ${field.maskCleanValue !== false ? 'checked' : ''} 
                   ${this.editingLocale !== 'default' ? 'disabled' : ''} />
            <span>${this.esc(this.translations.maskCleanValueLabel)}</span>
          </label>
        </div>
        ` : ''}

        <!-- Calculated Formula Fields (Only applies to number inputs) -->
        ${field.type === 'number' ? `
        <div class="prop-group">
          <label class="prop-checkbox-label">
            <input type="checkbox" id="prop-field-calculated" ${field.isCalculated ? 'checked' : ''} 
                   ${this.editingLocale !== 'default' ? 'disabled' : ''} />
            <span>${this.esc(this.translations.calculatedFieldLabel)}</span>
          </label>
        </div>
        
        <div class="prop-group" id="prop-field-formula-group" style="${field.isCalculated ? '' : 'display: none;'}">
          <label class="prop-label">${this.esc(this.translations.formulaExpressionLabel)}</label>
          <input type="text" id="prop-field-formula-expression" class="prop-input" value="${this.esc(field.formulaExpression || '')}" placeholder="${this.esc(this.translations.formulaExpressionPlaceholder)}"
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--of-color-neutral-3); cursor: not-allowed;"' : ''} />

          <div class="formula-token-chips">
            <span class="formula-chip-row-label">${this.esc(this.translations.formulaInsertFieldLabel)}</span>
            <div class="formula-chip-row">
              ${this.getAllFields().filter(f => f.type === 'number' && f.key !== field.key).map(f =>
                `<button type="button" class="formula-token-chip" data-token="{${this.esc(f.key)}}" title="${this.esc(f.key)}" ${this.editingLocale !== 'default' ? 'disabled' : ''}>${this.esc(f.label)}</button>`
              ).join('') || `<span class="formula-chip-empty">${this.esc(this.translations.formulaNoNumericFields)}</span>`}
            </div>
            <span class="formula-chip-row-label">${this.esc(this.translations.formulaInsertFunctionLabel)}</span>
            <div class="formula-chip-row">
              ${['min', 'max', 'round', 'abs', 'floor', 'ceil'].map(fn =>
                `<button type="button" class="formula-token-chip formula-fn-chip" data-token="Math.${fn}(" title="Math.${fn}(...)" ${this.editingLocale !== 'default' ? 'disabled' : ''}>${fn}</button>`
              ).join('')}
            </div>
          </div>

          <span style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); margin-top: var(--of-space-xs); display: block; line-height: 1.4;">
            ${this.tHtml('formulaHelpText')}
          </span>

          <label class="prop-checkbox-label" style="margin-top: var(--of-space-s);">
            <input type="checkbox" id="prop-field-visible-on-form" ${field.isVisibleOnForm === false ? '' : 'checked'}
                   ${this.editingLocale !== 'default' ? 'disabled' : ''} />
            <span>${this.esc(this.translations.formulaVisibleOnFormLabel)}</span>
          </label>
          <span style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); margin-top: 2px; display: block; line-height: 1.4;">
            ${this.esc(this.translations.formulaVisibleOnFormHint)}
          </span>
        </div>
        ` : ''}

        <!-- Custom Validation Regex (Only applies to text inputs) -->
        ${field.type === 'text' ? `
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.fieldRegexLabel)}</label>
          <input type="text" id="prop-field-regex" class="prop-input" value="${this.esc(field.validationRegex || '')}" placeholder="${this.esc(this.translations.fieldRegexPlaceholder)}" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--of-color-neutral-3); cursor: not-allowed;"' : ''} />
        </div>
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.fieldRegexErrorLabel)}</label>
          <input type="text" id="prop-field-err-msg" class="prop-input" 
                 value="${this.esc(this.editingLocale === 'default' ? (field.errorMessage || '') : (this.getTranslationValue('fields', field.key, 'errorMessage') || ''))}" 
                 placeholder="${this.esc(this.editingLocale === 'default' ? '' : (field.errorMessage || ''))}" />
        </div>` : ''}

        <!-- Custom Accepted Types (Only applies to file uploaders) -->
        ${field.type === 'file' ? `
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.fileAcceptedTypesLabel)}</label>
          <input type="text" id="prop-field-accepted-types" class="prop-input" value="${this.esc(field.acceptedTypes || '.pdf,.docx,image/*')}" placeholder="${this.esc(this.translations.fileAcceptedTypesPlaceholder)}" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--of-color-neutral-3); cursor: not-allowed;"' : ''} />
          <span style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); margin-top: 2px;">${this.esc(this.translations.fileAcceptedTypesHint)}</span>
        </div>
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.fileRequirementsLabel)}</label>
          <input type="text" id="prop-field-requirements-text" class="prop-input" 
                 value="${this.esc(this.editingLocale === 'default' ? (field.fileRequirementsText || '') : (this.getTranslationValue('fields', field.key || field.id, 'fileRequirementsText') || ''))}" 
                 placeholder="${this.esc(this.editingLocale === 'default' ? this.translations.fileRequirementsPlaceholder : (field.fileRequirementsText || this.translations.fileRequirementsPlaceholder))}" />
          <span style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); margin-top: 2px;">${this.esc(this.translations.fileRequirementsHint)}</span>
        </div>
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.fileMaxSizeLabel)}</label>
          <input type="number" id="prop-field-max-size" class="prop-input" 
                 value="${this.esc(field.maxFileSizeMB !== undefined ? field.maxFileSizeMB : 5)}" 
                 placeholder="5" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--of-color-neutral-3); cursor: not-allowed;"' : ''} />
          <span style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); margin-top: 2px;">${this.esc(this.translations.fileMaxSizeHint)}</span>
        </div>
        <div class="prop-group">
          <label class="prop-checkbox-label">
            <input type="checkbox" id="prop-field-use-native-camera" ${field.useNativeCamera ? 'checked' : ''} 
                   ${this.editingLocale !== 'default' ? 'disabled' : ''} />
            <span>${this.esc(this.translations.useNativeCameraLabel)}</span>
          </label>
        </div>
        <div class="prop-group" id="prop-field-native-camera-source-group" style="${field.useNativeCamera ? '' : 'display: none;'}">
          <label class="prop-label">${this.esc(this.translations.nativeCameraSourceLabel)}</label>
          <select id="prop-field-native-camera-source" class="prop-input" style="padding: 6px 10px;"
                  ${this.editingLocale !== 'default' ? 'disabled style="background: var(--of-color-neutral-3); cursor: not-allowed;"' : ''}>
            <option value="camera" ${field.nativeCameraSource === 'camera' ? 'selected' : ''}>${this.esc(this.translations.nativeCameraOptionCamera)}</option>
            <option value="photos" ${field.nativeCameraSource === 'photos' ? 'selected' : ''}>${this.esc(this.translations.nativeCameraOptionPhotos)}</option>
            <option value="prompt" ${field.nativeCameraSource === 'prompt' ? 'selected' : ''}>${this.esc(this.translations.nativeCameraOptionPrompt)}</option>
          </select>
        </div>` : ''}

        <!-- Options Feed Source configurations (dropdown, radios, multi-select checkboxes) -->
        ${['dropdown', 'radio', 'checkbox', 'matrix'].includes(field.type) ? `
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.fieldOptionsSourceLabel)}</label>
          <select id="prop-field-options-type" class="prop-input" style="padding: 6px 10px;" 
                  ${this.editingLocale !== 'default' ? 'disabled style="background: var(--of-color-neutral-3); cursor: not-allowed;"' : ''}>
            <option value="static" ${field.optionsType === 'static' ? 'selected' : ''}>${this.esc(this.translations.fieldOptionsStaticLabel)}</option>
            <option value="api" ${field.optionsType === 'api' ? 'selected' : ''}>${this.esc(this.translations.fieldOptionsApiLabel)}</option>
          </select>
        </div>
        
        <div id="prop-box-static-options" class="nested-prop-box" style="display: ${field.optionsType === 'static' ? 'flex' : 'none'}; flex-direction: column;">
          ${this.editingLocale === 'default' ? `
            <label class="prop-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>${this.esc(this.translations.fieldOptionsStaticLabel)}</span>
              <button type="button" class="pg-btn pg-btn-secondary" id="btn-static-option-add" style="padding: 2px 8px; font-size: var(--of-font-size-xs); height: auto;">
                ${OpenFormBuilder.icon('plus', '', 'width: 10px; height: 10px;')} ${this.esc(this.translations.addOptionLabel)}
              </button>
            </label>
            <div class="static-options-list" style="display: flex; flex-direction: column; gap: var(--of-space-s); margin-top: var(--of-space-xs);">
              ${(field.options || []).map((opt, idx) => `
                <div class="static-option-row" data-option-index="${idx}" style="display: flex; align-items: center; gap: var(--of-space-s);">
                  <input type="text" class="prop-input static-option-label-input" data-option-index="${idx}"
                         style="flex: 2; font-size: var(--of-font-size-xs); padding: var(--of-space-xs) var(--of-space-s); margin-bottom: 0;"
                         value="${this.esc(opt.label)}" placeholder="${this.esc(this.translations.optionLabelPlaceholder)}" />
                  <input type="text" class="prop-input static-option-value-input" data-option-index="${idx}"
                         style="flex: 1; font-size: var(--of-font-size-xs); padding: var(--of-space-xs) var(--of-space-s); margin-bottom: 0; font-family: monospace; color: var(--of-color-neutral-7);"
                         value="${this.esc(opt.value)}" placeholder="${this.esc(this.translations.optionValuePlaceholder)}" />
                  <button type="button" class="pg-btn pg-btn-secondary static-option-delete-btn" data-option-index="${idx}"
                          style="padding: 2px 6px; height: auto; color: var(--of-color-error); border-color: transparent; background: transparent; flex-shrink: 0;" title="${this.esc(this.translations.removeOptionTitle)}">
                    ${OpenFormBuilder.icon('x', '', 'width: 12px; height: 12px;')}
                  </button>
                </div>
              `).join('')}
            </div>
          ` : `
            <label class="prop-label" style="margin-bottom: 6px;">${this.esc(this.translations.translateOptionLabelsLabel)}</label>
            <div style="display: flex; flex-direction: column; gap: var(--of-space-s);">
              ${(field.options || []).map(opt => `
                <div style="display: flex; align-items: center; gap: var(--of-space-s);">
                  <span style="font-size: var(--of-font-size-xs); flex: 1; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--of-color-neutral-7);" title="${this.esc(opt.label)}">${this.esc(opt.label)}:</span>
                  <input type="text" class="prop-input option-translation-input" style="flex: 2; font-size: var(--of-font-size-xs); padding: var(--of-space-xs) var(--of-space-s); margin-bottom: 0;"
                         data-option-value="${this.esc(opt.value)}" 
                         value="${this.esc(this.getTranslationValue('fields', field.key, 'options', opt.value) || '')}"
                         placeholder="${this.esc(this.translations.translationPlaceholder)}" />
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <div id="prop-box-api-options" class="nested-prop-box" style="display: ${field.optionsType === 'api' ? 'flex' : 'none'};">
          <label class="prop-label">${this.esc(this.translations.fieldOptionsApiUrlLabel)}</label>
          <input type="text" id="prop-field-api-url" class="prop-input" value="${this.esc(field.optionsUrl || '')}" placeholder="${this.esc(this.translations.fieldOptionsApiUrlPlaceholder)}" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--of-color-neutral-3); cursor: not-allowed;"' : ''} />
          <span style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7);">${this.esc(this.translations.fieldOptionsApiUrlHint)}</span>
        </div>` : ''}
        <!-- Custom Repeater Configuration (Only applies to repeaters) -->
        ${field.type === 'repeater' ? `
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.repeaterMinItemsLabel)}</label>
          <input type="number" id="prop-field-min-items" class="prop-input" value="${this.esc(field.minItems || 1)}" min="0" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--of-color-neutral-3); cursor: not-allowed;"' : ''} />
        </div>
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.repeaterMaxItemsLabel)}</label>
          <input type="number" id="prop-field-max-items" class="prop-input" value="${this.esc(field.maxItems || 10)}" min="1" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--of-color-neutral-3); cursor: not-allowed;"' : ''} />
        </div>
        <div class="prop-group">
          <label class="prop-label">${this.esc(this.translations.repeaterAddButtonLabel)}</label>
          <input type="text" id="prop-field-add-btn-label" class="prop-input" 
                 value="${this.esc(this.editingLocale === 'default' ? (field.addButtonLabel || this.translations.defaultRepeaterAddButton) : (this.getTranslationValue('fields', field.key, 'addButtonLabel') || ''))}" 
                 placeholder="${this.esc(this.editingLocale === 'default' ? '' : (field.addButtonLabel || this.translations.defaultRepeaterAddButton))}" />
        </div>
        
        ` : ''}

        <!-- Custom Matrix Configuration (Only applies to matrix) -->
        ${field.type === 'matrix' ? `
        <hr style="border: none; border-top: 1px solid var(--of-color-neutral-4); margin: var(--of-space-m) 0;" />
        
        <div class="prop-group">
          <label class="prop-label" style="display: flex; justify-content: space-between; align-items: center;">
            <span>${this.esc(this.translations.matrixRowsManagerLabel || 'Matrix Rows Manager')}</span>
            <button type="button" class="pg-btn pg-btn-secondary" id="btn-matrix-add-row" style="padding: 2px 6px; font-size: var(--of-font-size-xs); height: auto;" 
                    ${this.editingLocale !== 'default' ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              ${OpenFormBuilder.icon('plus', '', 'width: 10px; height: 10px;')} ${this.esc(this.translations.matrixAddRowLabel || 'Add Row')}
            </button>
          </label>
          <div class="matrix-rows-list" style="display: flex; flex-direction: column; gap: var(--of-space-s); margin-top: 6px;">
            ${this.renderMatrixRowsHTML(field)}
          </div>
        </div>
        ` : ''}

        <!-- Advanced Business Rules Panel -->
        ${this.isFieldInsideRepeater(field.id) ? '' : `
        <hr style="border: none; border-top: 1px solid var(--of-color-neutral-4); margin: var(--of-space-base) 0;" />
        ${this.renderBusinessRulesEditorHTML(field, true)}
        `}

      </div>
    `;


    this.bindPropertiesEvents(field);
    if (!this.isFieldInsideRepeater(field.id)) {
      this.bindBusinessRulesEvents(field);
    }
  }

  /**
   * Serializes {label, value} object arrays into raw editable 'label:value' string rows
   */
  serializeStaticOptions(options) {
    if (!Array.isArray(options)) return '';
    return options.map(opt => `${opt.label}:${opt.value}`).join('\n');
  }

  /**
   * Parses 'label:value' string lines back into standard option structures
   */
  parseStaticOptions(text) {
    if (!text) return [];
    return text.split('\n')
      .map(line => line.trim())
      .filter(line => line.includes(':'))
      .map(line => {
        const separatorIndex = line.indexOf(':');
        return {
          label: line.slice(0, separatorIndex).trim(),
          value: line.slice(separatorIndex + 1).trim()
        };
      });
  }

  /**
   * Renders properties manager markup for sub-rows of a Question Matrix
   */
  renderMatrixRowsHTML(field) {
    if (!field.matrixRows) field.matrixRows = [];

    if (this.editingLocale === 'default') {
      return field.matrixRows.map((row, index) => `
        <div class="matrix-row-card" data-row-index="${index}" style="border: 1px solid var(--of-color-neutral-4); border-radius: var(--of-border-radius-s); padding: 10px; background: var(--of-color-neutral-2); display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: var(--of-font-size-xs); font-weight: var(--of-font-weight-bold); color: var(--of-color-neutral-8);">${this.esc(this.translations.matrixRowLabel)} #${index + 1}</span>
            <button type="button" class="pg-btn pg-btn-secondary matrix-row-delete-btn" style="padding: 2px; color: var(--of-color-error); border-color: transparent; background: transparent; height: auto;" title="${this.esc(this.translations.removeRowTitle)}">
              ${OpenFormBuilder.icon('trash-2', '', 'width: 12px; height: 12px;')}
            </button>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div class="prop-group" style="margin-bottom: 0;">
              <label class="prop-label" style="font-size: var(--of-font-size-xs); margin-bottom: var(--of-space-xs);">${this.esc(this.translations.fieldLabelLabel)}</label>
              <input type="text" class="prop-input matrix-row-label-input" style="font-size: var(--of-font-size-xs); padding: var(--of-space-xs); margin-bottom: 0;" value="${this.esc(row.label || '')}" />
            </div>
            <div class="prop-group" style="margin-bottom: 0;">
              <label class="prop-label" style="font-size: var(--of-font-size-xs); margin-bottom: var(--of-space-xs);">${this.esc(this.translations.matrixRowKeyLabel)}</label>
              <input type="text" class="prop-input matrix-row-key-input" style="font-size: var(--of-font-size-xs); padding: var(--of-space-xs); margin-bottom: 0;" value="${this.esc(row.key || '')}" />
            </div>
          </div>
        </div>
      `).join('');
    } else {
      return `
        <div style="display: flex; flex-direction: column; gap: var(--of-space-s);">
          ${field.matrixRows.map((row, index) => `
            <div style="display: flex; align-items: center; gap: var(--of-space-s);">
              <span style="font-size: var(--of-font-size-xs); flex: 1; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--of-color-neutral-7);" title="${this.esc(row.label)}">${this.esc(row.label)}:</span>
              <input type="text" class="prop-input matrix-row-translation-input" style="flex: 2; font-size: var(--of-font-size-xs); padding: var(--of-space-xs) var(--of-space-s); margin-bottom: 0;"
                     data-row-key="${this.esc(row.key)}" 
                     value="${this.esc(this.getTranslationValue('fields', field.key, 'matrixRows', row.key) || '')}"
                     placeholder="${this.esc(this.translations.translationPlaceholder)}" />
            </div>
          `).join('')}
        </div>
      `;
    }
  }



  /**
   * Gathers valid conditional dependency field references (excludes headers and self)
   */
  getConditionalFieldsOptions(currentFieldId, selectedKey, entity = null) {
    const fields = this._ruleFieldChoices(entity, currentFieldId);
    // A reference the schema already holds (e.g. to a later page) stays selectable
    if (selectedKey && !fields.some(f => f.key === selectedKey)) {
      const kept = this.getAllFields().find(f => f.key === selectedKey && f.type !== 'header' && f.type !== 'paragraph');
      if (kept) fields.push(kept);
    }
    if (fields.length === 0) {
      return `<option value="">${this.esc(this.translations.fieldCondNoOtherFields)}</option>`;
    }

    return fields.map(f => {
      const isSelected = f.key === selectedKey ? 'selected' : '';
      return `<option value="${this.esc(f.key)}" ${isSelected}>${this.esc(f.label)} (${this.esc(f.key)})</option>`;
    }).join('');
  }

  /**
   * The fields a rule of `entity` can depend on. A page rule only offers fields on earlier
   * pages (a page is evaluated before its own fields can be answered); fields and sections
   * offer every other field.
   */
  _ruleFieldChoices(entity, currentFieldId = '') {
    const answerable = (f) => f.type !== 'header' && f.type !== 'paragraph';
    const pageIndex = entity ? this.schema.pages.indexOf(entity) : -1;
    if (pageIndex === -1) {
      return this.getAllFields().filter(f => f.id !== currentFieldId && answerable(f));
    }
    const earlier = [];
    this.schema.pages.slice(0, pageIndex).forEach(page => {
      (page.sections || []).forEach(sec => this._collectFieldsInRows(sec.rows, earlier));
    });
    return earlier.filter(answerable);
  }

  /**
   * Binds direct property change listeners to update layout schema reactively
   */
  bindPropertiesEvents(field) {
    // `immediate`: discrete actions (checkboxes, selects — one `change` per click) render
    // synchronously as before; free-typing `input` handlers default to the debounced
    // canvas repaint (A3) so a burst of keystrokes doesn't tear down/rebuild the canvas
    // on every character. Schema mutation and notifyChange() are never debounced either way.
    const updateFieldProperty = (propName, value, immediate = false) => {
      if (this.editingLocale === 'default') {
        field[propName] = value;
      } else {
        if (['label', 'placeholder', 'errorMessage', 'addButtonLabel', 'subtitle', 'fileRequirementsText'].includes(propName)) {
          if (value) {
            this.setTranslationValue('fields', field.key || field.id, propName, value);
          } else {
            this.deleteTranslationValue('fields', field.key || field.id, propName);
          }
        }
      }
      this.notifyChange();
      if (immediate) {
        this.render();
      } else {
        this.debouncedRender();
      }
    };

    // Label
    const labelInput = this.propertiesEl.querySelector('#prop-field-label');
    if (labelInput) {
      labelInput.addEventListener('input', (e) => updateFieldProperty('label', e.target.value));
    }

    // Key (Technical DB name)
    const keyInput = this.propertiesEl.querySelector('#prop-field-key');
    if (keyInput && this.editingLocale === 'default') {
      keyInput.addEventListener('change', (e) => {
        // Sanitize database keys to maintain compliant casing format rules
        const sanitized = e.target.value
          .replace(/[^a-zA-Z0-9]/g, '')
          .replace(/^\d+/, '');

        // A5: enforce key uniqueness within the field's own collision namespace — top-level
        // fields must not collide with each other (submittedAnswers[key] would silently
        // overwrite), and a repeater's sub-fields must not collide with their siblings
        // (items[i][key] would do the same). Cross-namespace collisions (a top-level field
        // vs. a sub-field inside some repeater) don't actually collide in the output shape,
        // so they're intentionally not checked here.
        const parentRepeater = this.getParentRepeaterField(field.id);
        const existingKeys = parentRepeater
          ? this.getRepeaterSubFieldKeys(parentRepeater, field.id)
          : this.getTopLevelFields().filter(f => f.id !== field.id).map(f => f.key);

        if (!sanitized) {
          this.showToast(this.translations.keyEmptyToast, true);
          e.target.value = field.key;
          return;
        }
        if (existingKeys.includes(sanitized)) {
          this.showToast(this.t('keyInUseToast', { key: sanitized }), true);
          e.target.value = field.key;
          return;
        }

        e.target.value = sanitized;
        if (sanitized === field.key) return;

        // B2: rename the field and every reference to it in one step (single undo entry).
        const oldKey = field.key;
        field.key = sanitized;
        const updated = this.renameFieldKeyReferences(oldKey, sanitized, field);
        this.notifyChange();
        this.render();
        if (updated > 0) {
          this.showToast(this.tn('keyRenamedToast', updated, { oldKey, newKey: sanitized }));
        }
      });
    }

    // Placeholder
    const placeholderInput = this.propertiesEl.querySelector('#prop-field-placeholder');
    if (placeholderInput) {
      placeholderInput.addEventListener('input', (e) => updateFieldProperty('placeholder', e.target.value));
    }

    // Required checkbox
    const requiredCheckbox = this.propertiesEl.querySelector('#prop-field-required');
    if (requiredCheckbox && this.editingLocale === 'default') {
      requiredCheckbox.addEventListener('change', (e) => updateFieldProperty('required', e.target.checked, true));
    }

    // Input Mask custom input
    const maskInput = this.propertiesEl.querySelector('#prop-field-mask');
    if (maskInput && this.editingLocale === 'default') {
      maskInput.addEventListener('input', (e) => {
        const val = e.target.value;
        field.mask = val;
        if (!val) {
          delete field.maskCleanValue;
        } else {
          field.maskCleanValue = field.maskCleanValue !== undefined ? field.maskCleanValue : true;
        }

        // Dynamically toggle the clean value group to prevent focus loss on typing
        const cleanGroup = this.propertiesEl.querySelector('#prop-field-mask-clean-group');
        if (cleanGroup) {
          if (val) {
            cleanGroup.style.display = 'block';
          } else {
            cleanGroup.style.display = 'none';
          }
        }

        this.notifyChange();
        this.debouncedRender();
      });
    }

    // Input Mask clean value checkbox
    const maskCleanCheckbox = this.propertiesEl.querySelector('#prop-field-mask-clean');
    if (maskCleanCheckbox && this.editingLocale === 'default') {
      maskCleanCheckbox.addEventListener('change', (e) => {
        updateFieldProperty('maskCleanValue', e.target.checked, true);
      });
    }

    // Calculated Field checkbox
    const calculatedCheckbox = this.propertiesEl.querySelector('#prop-field-calculated');
    if (calculatedCheckbox && this.editingLocale === 'default') {
      calculatedCheckbox.addEventListener('change', (e) => {
        const val = e.target.checked;
        field.isCalculated = val;

        // Dynamically toggle the formula expression group
        const formulaGroup = this.propertiesEl.querySelector('#prop-field-formula-group');
        if (formulaGroup) {
          if (val) {
            formulaGroup.style.display = 'block';
          } else {
            formulaGroup.style.display = 'none';
          }
        }

        this.notifyChange();
        this.render();
      });
    }

    // Formula Expression text input
    const formulaExpressionInput = this.propertiesEl.querySelector('#prop-field-formula-expression');
    if (formulaExpressionInput && this.editingLocale === 'default') {
      formulaExpressionInput.addEventListener('input', (e) => {
        updateFieldProperty('formulaExpression', e.target.value);
      });
    }

    // Formula token chips (insert field key / Math function at cursor position)
    const formulaChipsContainer = this.propertiesEl.querySelector('.formula-token-chips');
    if (formulaChipsContainer && formulaExpressionInput && this.editingLocale === 'default') {
      formulaChipsContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.formula-token-chip');
        if (!chip) return;

        const token = chip.getAttribute('data-token');
        const start = formulaExpressionInput.selectionStart ?? formulaExpressionInput.value.length;
        const end = formulaExpressionInput.selectionEnd ?? formulaExpressionInput.value.length;
        const current = formulaExpressionInput.value;

        const newValue = current.slice(0, start) + token + current.slice(end);
        formulaExpressionInput.value = newValue;
        field.formulaExpression = newValue;
        this.notifyChange();

        const cursorPos = start + token.length;
        formulaExpressionInput.focus();
        formulaExpressionInput.setSelectionRange(cursorPos, cursorPos);
      });
    }

    // Visible on Form checkbox (calculated fields only)
    const visibleOnFormCheckbox = this.propertiesEl.querySelector('#prop-field-visible-on-form');
    if (visibleOnFormCheckbox && this.editingLocale === 'default') {
      visibleOnFormCheckbox.addEventListener('change', (e) => {
        field.isVisibleOnForm = e.target.checked;
        this.notifyChange();
        this.render();
      });
    }

    // Regex Validator rules
    const regexInput = this.propertiesEl.querySelector('#prop-field-regex');
    if (regexInput && this.editingLocale === 'default') {
      regexInput.addEventListener('input', (e) => updateFieldProperty('validationRegex', e.target.value));
    }

    // Validation Error string override
    const errMsgInput = this.propertiesEl.querySelector('#prop-field-err-msg');
    if (errMsgInput) {
      errMsgInput.addEventListener('input', (e) => updateFieldProperty('errorMessage', e.target.value));
    }

    // File Accepted Types configuration
    const acceptedTypesInput = this.propertiesEl.querySelector('#prop-field-accepted-types');
    if (acceptedTypesInput && this.editingLocale === 'default') {
      acceptedTypesInput.addEventListener('input', (e) => updateFieldProperty('acceptedTypes', e.target.value));
    }

    // File Requirements Text configuration
    const requirementsTextInput = this.propertiesEl.querySelector('#prop-field-requirements-text');
    if (requirementsTextInput) {
      requirementsTextInput.addEventListener('input', (e) => updateFieldProperty('fileRequirementsText', e.target.value));
    }

    // File Maximum Size configuration
    const maxFileSizeInput = this.propertiesEl.querySelector('#prop-field-max-size');
    if (maxFileSizeInput && this.editingLocale === 'default') {
      maxFileSizeInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        updateFieldProperty('maxFileSizeMB', isNaN(val) ? 5 : val);
      });
    }

    // File Use Native Camera configuration
    const useNativeCameraCheckbox = this.propertiesEl.querySelector('#prop-field-use-native-camera');
    if (useNativeCameraCheckbox && this.editingLocale === 'default') {
      useNativeCameraCheckbox.addEventListener('change', (e) => {
        const checked = e.target.checked;
        field.useNativeCamera = checked;

        const sourceGroup = this.propertiesEl.querySelector('#prop-field-native-camera-source-group');
        if (sourceGroup) {
          sourceGroup.style.display = checked ? 'block' : 'none';
        }

        this.notifyChange();
        this.render();
      });
    }

    // File Native Camera Source configuration
    const nativeCameraSourceSelect = this.propertiesEl.querySelector('#prop-field-native-camera-source');
    if (nativeCameraSourceSelect && this.editingLocale === 'default') {
      nativeCameraSourceSelect.addEventListener('change', (e) => {
        updateFieldProperty('nativeCameraSource', e.target.value, true);
      });
    }

    // Option lists sources dropdown
    const optionsTypeSelect = this.propertiesEl.querySelector('#prop-field-options-type');
    if (optionsTypeSelect && this.editingLocale === 'default') {
      optionsTypeSelect.addEventListener('change', (e) => {
        const type = e.target.value;
        field.optionsType = type;

        this.propertiesEl.querySelector('#prop-box-static-options').style.display = type === 'static' ? 'flex' : 'none';
        this.propertiesEl.querySelector('#prop-box-api-options').style.display = type === 'api' ? 'flex' : 'none';

        this.notifyChange();
      });
    }

    // Static Options structured list — Add button
    const addOptionBtn = this.propertiesEl.querySelector('#btn-static-option-add');
    if (addOptionBtn && this.editingLocale === 'default') {
      addOptionBtn.addEventListener('click', () => {
        if (!field.options) field.options = [];
        field.options.push({ label: '', value: '' });
        this.notifyChange();
        this.renderProperties();
        // Focus the new label input
        const list = this.propertiesEl.querySelector('.static-options-list');
        if (list) {
          const lastInput = list.querySelector('.static-option-row:last-child .static-option-label-input');
          if (lastInput) lastInput.focus();
        }
      });
    }

    // Static Options structured list — input and delete via event delegation
    const staticOptionsList = this.propertiesEl.querySelector('.static-options-list');
    if (staticOptionsList && this.editingLocale === 'default') {
      // Live label/value edits
      staticOptionsList.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-option-index'));
        if (isNaN(idx) || !field.options[idx]) return;

        if (e.target.classList.contains('static-option-label-input')) {
          field.options[idx].label = e.target.value;
        } else if (e.target.classList.contains('static-option-value-input')) {
          field.options[idx].value = e.target.value;
        }
        this.notifyChange();
      });

      // Delete row
      staticOptionsList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.static-option-delete-btn');
        if (!deleteBtn) return;
        const idx = parseInt(deleteBtn.getAttribute('data-option-index'));
        if (!isNaN(idx)) {
          field.options.splice(idx, 1);
          this.notifyChange();
          this.renderProperties();
        }
      });
    }

    // Option translations input listeners
    const optionTransInputs = this.propertiesEl.querySelectorAll('.option-translation-input');
    optionTransInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const optVal = e.target.getAttribute('data-option-value');
        const textVal = e.target.value;
        if (textVal) {
          this.setTranslationValue('fields', field.key, 'options', optVal, textVal);
        } else {
          this.deleteTranslationValue('fields', field.key, 'options', optVal);
        }
        this.debouncedRender(); // sync canvas
      });
    });

    // URL path endpoint configuration
    const apiUrlInput = this.propertiesEl.querySelector('#prop-field-api-url');
    if (apiUrlInput && this.editingLocale === 'default') {
      apiUrlInput.addEventListener('input', (e) => {
        field.optionsUrl = e.target.value;
        this.notifyChange();
      });
    }

    // Add Row to Matrix Button
    const addMatrixRowBtn = this.propertiesEl.querySelector('#btn-matrix-add-row');
    if (addMatrixRowBtn && this.editingLocale === 'default') {
      addMatrixRowBtn.addEventListener('click', () => {
        if (!field.matrixRows) field.matrixRows = [];
        field.matrixRows.push({
          key: `row_${field.matrixRows.length + 1}`,
          label: `Question Row ${field.matrixRows.length + 1}`
        });
        this.notifyChange();
        this.renderProperties();
        this.render(); // sync canvas
      });
    }

    // Event Delegation inside Matrix Rows Manager List
    const matrixRowsList = this.propertiesEl.querySelector('.matrix-rows-list');
    if (matrixRowsList) {
      if (this.editingLocale === 'default') {
        matrixRowsList.addEventListener('input', (e) => {
          const rowCard = e.target.closest('.matrix-row-card');
          if (!rowCard) return;
          const idx = parseInt(rowCard.getAttribute('data-row-index'));
          const r = field.matrixRows[idx];
          if (!r) return;

          if (e.target.classList.contains('matrix-row-label-input')) {
            r.label = e.target.value;
            this.notifyChange();
            this.debouncedRender(); // update canvas preview
          }
        });

        matrixRowsList.addEventListener('change', (e) => {
          const rowCard = e.target.closest('.matrix-row-card');
          if (!rowCard) return;
          const idx = parseInt(rowCard.getAttribute('data-row-index'));
          const r = field.matrixRows[idx];
          if (!r) return;

          if (e.target.classList.contains('matrix-row-key-input')) {
            const sanitized = e.target.value
              .replace(/[^a-zA-Z0-9]/g, '')
              .replace(/^\d+/, '');
            e.target.value = sanitized;
            r.key = sanitized;
            this.notifyChange();
            this.render();
          }
        });

        matrixRowsList.addEventListener('click', (e) => {
          const deleteBtn = e.target.closest('.matrix-row-delete-btn');
          if (deleteBtn) {
            const rowCard = deleteBtn.closest('.matrix-row-card');
            if (!rowCard) return;
            const idx = parseInt(rowCard.getAttribute('data-row-index'));
            field.matrixRows.splice(idx, 1);
            this.notifyChange();
            this.renderProperties();
            this.render();
          }
        });
      } else {
        // Translation inputs for matrix rows
        const matrixRowTransInputs = matrixRowsList.querySelectorAll('.matrix-row-translation-input');
        matrixRowTransInputs.forEach(input => {
          input.addEventListener('input', (e) => {
            const rowKey = e.target.getAttribute('data-row-key');
            const textVal = e.target.value;
            if (textVal) {
              this.setTranslationValue('fields', field.key, 'matrixRows', rowKey, textVal);
            } else {
              this.deleteTranslationValue('fields', field.key, 'matrixRows', rowKey);
            }
            this.debouncedRender(); // sync canvas
          });
        });
      }
    }

    // Minimum Items for Repeatable List
    const minItemsInput = this.propertiesEl.querySelector('#prop-field-min-items');
    if (minItemsInput && this.editingLocale === 'default') {
      minItemsInput.addEventListener('change', (e) => {
        updateFieldProperty('minItems', Math.max(0, parseInt(e.target.value) || 0), true);
      });
    }

    // Maximum Items for Repeatable List
    const maxItemsInput = this.propertiesEl.querySelector('#prop-field-max-items');
    if (maxItemsInput && this.editingLocale === 'default') {
      maxItemsInput.addEventListener('change', (e) => {
        updateFieldProperty('maxItems', Math.max(1, parseInt(e.target.value) || 1), true);
      });
    }

    // Add Button Label for Repeatable List
    const addBtnLabelInput = this.propertiesEl.querySelector('#prop-field-add-btn-label');
    if (addBtnLabelInput) {
      addBtnLabelInput.addEventListener('input', (e) => {
        updateFieldProperty('addButtonLabel', e.target.value);
      });
    }



    this.bindLocaleSwitcherEvents();
  }

  /**
   * Renders advanced business rules AND-of-ORs HTML block
   */
  renderBusinessRulesEditorHTML(entity, isField, kind = isField ? 'field' : 'section') {
    if (!entity.conditionalRules) {
      entity.conditionalRules = [];
    }

    const isDefaultLocale = this.editingLocale === 'default';
    const disabledAttr = isDefaultLocale ? '' : 'disabled';

    let rulesHtml = '';

    entity.conditionalRules.forEach((rule, ruleIndex) => {
      let andGroupsHtml = '';

      rule.andGroups = rule.andGroups || [];
      rule.andGroups.forEach((group, groupIndex) => {
        let conditionsHtml = '';

        group.conditions = group.conditions || [];
        group.conditions.forEach((cond, condIndex) => {
          const compareMode = cond.compareMode || 'value';
          conditionsHtml += `
            <div class="rules-row" data-rule="${ruleIndex}" data-group="${groupIndex}" data-cond="${condIndex}">
              <select class="prop-input rule-cond-field" ${disabledAttr}>
                ${this.getConditionalFieldsOptions(entity.id || '', cond.dependentFieldKey, entity)}
              </select>
              <select class="prop-input rule-cond-operator" ${disabledAttr}>
                <option value="equals" ${cond.operator === 'equals' ? 'selected' : ''}>==</option>
                <option value="notEquals" ${cond.operator === 'notEquals' ? 'selected' : ''}>!=</option>
                <option value="contains" ${cond.operator === 'contains' ? 'selected' : ''}>${this.esc(this.translations.ruleOperatorContains)}</option>
                <option value="notContains" ${cond.operator === 'notContains' ? 'selected' : ''}>${this.esc(this.translations.ruleOperatorNotContains)}</option>
                <option value="greaterThan" ${cond.operator === 'greaterThan' ? 'selected' : ''}>&gt;</option>
                <option value="greaterThanOrEquals" ${cond.operator === 'greaterThanOrEquals' || cond.operator === 'gte' ? 'selected' : ''}>&gt;=</option>
                <option value="lessThan" ${cond.operator === 'lessThan' ? 'selected' : ''}>&lt;</option>
                <option value="lessThanOrEquals" ${cond.operator === 'lessThanOrEquals' || cond.operator === 'lte' ? 'selected' : ''}>&lt;=</option>
              </select>
              <div class="rule-cond-value-wrap">
                <select class="prop-input rule-cond-compare-mode" ${disabledAttr}>
                  <option value="value" ${compareMode === 'value' ? 'selected' : ''}>${this.esc(this.translations.ruleCompareValueOption)}</option>
                  <option value="field" ${compareMode === 'field' ? 'selected' : ''}>${this.esc(this.translations.ruleCompareFieldOption)}</option>
                </select>
                ${compareMode === 'field' ? `
                  <select class="prop-input rule-cond-compare-field" ${disabledAttr}>
                    ${this.getConditionalFieldsOptions(entity.id || '', cond.compareToFieldKey, entity)}
                  </select>
                ` : `
                  <input type="text" class="prop-input rule-cond-value" value="${this.esc(cond.equalsValue !== undefined ? cond.equalsValue : '')}" placeholder="${this.esc(this.translations.ruleValueInputPlaceholder)}" ${disabledAttr} />
                `}
              </div>
              <button type="button" class="pg-btn pg-btn-secondary rule-delete-cond" title="${this.esc(this.translations.ruleDeleteConditionTitle)}" ${disabledAttr}>
                ${OpenFormBuilder.icon('x')}
              </button>
            </div>
          `;
        });

        if (conditionsHtml === '') {
          conditionsHtml = `<div class="rules-empty-state">${this.esc(this.translations.ruleNoOrConditionsText)}</div>`;
        }

        andGroupsHtml += `
          <div class="prop-box-condition and-group-card" data-rule="${ruleIndex}" data-group="${groupIndex}">
            <div class="and-group-header">
              <span class="and-group-title">${this.esc(this.translations.ruleOrGroupTitle)}</span>
              <button type="button" class="pg-btn pg-btn-secondary rule-delete-group" title="${this.esc(this.translations.ruleDeleteGroupTitle)}" ${disabledAttr}>
                ${OpenFormBuilder.icon('trash-2')} ${this.esc(this.translations.ruleDeleteGroupLabel)}
              </button>
            </div>
            <div class="conditions-list-container">
              ${conditionsHtml}
            </div>
            <button type="button" class="pg-btn pg-btn-secondary rule-add-cond" ${disabledAttr}>
              ${OpenFormBuilder.icon('plus')} ${this.esc(this.translations.ruleAddOrConditionLabel)}
            </button>
          </div>
        `;
      });

      if (andGroupsHtml === '') {
        andGroupsHtml = `<div class="rules-empty-state">${this.esc(this.translations.ruleNoAndConditionsText)}</div>`;
      }

      // Render the rule card
      rulesHtml += `
        <div class="rule-card" data-rule="${ruleIndex}">
          <div class="rule-card-header">
            ${isField ? `
              <select class="prop-input rule-target-prop" ${disabledAttr}>
                <option value="visibility" ${rule.targetProperty === 'visibility' ? 'selected' : ''}>${this.esc(this.translations.ruleTargetVisibilityOption)}</option>
                <option value="required" ${rule.targetProperty === 'required' ? 'selected' : ''}>${this.esc(this.translations.ruleTargetRequiredOption)}</option>
                <option value="disabled" ${rule.targetProperty === 'disabled' ? 'selected' : ''}>${this.esc(this.translations.ruleTargetDisabledOption)}</option>
              </select>
            ` : `
              <span class="rule-section-title">${this.esc(kind === 'page' ? this.translations.ruleShowPageIfLabel : this.translations.ruleShowSectionIfLabel)}</span>
            `}
            <button type="button" class="pg-btn pg-btn-secondary rule-delete-rule" title="${this.esc(this.translations.ruleDeleteRuleTitle)}" ${disabledAttr}>
              ${OpenFormBuilder.icon('trash-2')} ${this.esc(this.translations.ruleRemoveRuleLabel)}
            </button>
          </div>
          <div class="and-groups-list-container">
            ${andGroupsHtml}
          </div>
          <button type="button" class="pg-btn pg-btn-secondary rule-add-group" ${disabledAttr}>
            ${OpenFormBuilder.icon('plus')} ${this.esc(this.translations.ruleAddAndGroupLabel)}
          </button>
        </div>
      `;
    });

    if (rulesHtml === '') {
      rulesHtml = `
        <div class="rules-empty-state rules-empty-panel">
          ${this.esc(this.translations.noBusinessRulesText)}
        </div>
      `;
    }

    return `
      <div class="business-rules-panel">
        <h4 class="business-rules-title">
          ${OpenFormBuilder.icon('shield')} ${this.esc(this.translations.businessRulesTitle)}
        </h4>
        ${!isDefaultLocale ? `<div class="rules-locale-notice">${this.esc(this.translations.businessRulesLocaleNotice)}</div>` : ''}
        <div class="rules-list-container">
          ${rulesHtml}
        </div>
        <button type="button" id="btn-add-business-rule" class="pg-btn pg-btn-secondary btn-add-rule" ${disabledAttr}>
          ${OpenFormBuilder.icon('plus-circle')} ${this.esc(this.translations.addBusinessRuleLabel)}
        </button>
      </div>
    `;
  }

  /**
   * Binds event handlers for rules engine blocks dynamically
   */
  bindBusinessRulesEvents(entity) {
    const rulesContainer = this.propertiesEl.querySelector('.business-rules-panel');
    if (!rulesContainer) return;

    // Add Business Rule
    const addRuleBtn = rulesContainer.querySelector('#btn-add-business-rule');
    if (addRuleBtn) {
      addRuleBtn.addEventListener('click', () => {
        if (!entity.conditionalRules) entity.conditionalRules = [];
        entity.conditionalRules.push({
          targetProperty: "visibility",
          targetValue: true,
          andGroups: [
            {
              conditions: [
                {
                  dependentFieldKey: this._ruleFieldChoices(entity, entity.id || '')[0]?.key || '',
                  operator: "equals",
                  equalsValue: ""
                }
              ]
            }
          ]
        });
        this.notifyChange();
        this.renderProperties();
      });
    }

    // Event delegation for actions inside rule cards
    rulesContainer.addEventListener('click', (e) => {
      // 1. Delete Rule
      const deleteRuleBtn = e.target.closest('.rule-delete-rule');
      if (deleteRuleBtn) {
        const ruleCard = deleteRuleBtn.closest('.rule-card');
        const ruleIdx = parseInt(ruleCard.getAttribute('data-rule'));
        entity.conditionalRules.splice(ruleIdx, 1);
        this.notifyChange();
        this.renderProperties();
        return;
      }

      // 2. Add Group
      const addGroupBtn = e.target.closest('.rule-add-group');
      if (addGroupBtn) {
        const ruleCard = addGroupBtn.closest('.rule-card');
        const ruleIdx = parseInt(ruleCard.getAttribute('data-rule'));
        entity.conditionalRules[ruleIdx].andGroups.push({
          conditions: [
            {
              dependentFieldKey: this._ruleFieldChoices(entity, entity.id || '')[0]?.key || '',
              operator: "equals",
              equalsValue: ""
            }
          ]
        });
        this.notifyChange();
        this.renderProperties();
        return;
      }

      // 3. Delete Group
      const deleteGroupBtn = e.target.closest('.rule-delete-group');
      if (deleteGroupBtn) {
        const groupCard = deleteGroupBtn.closest('.and-group-card');
        const ruleIdx = parseInt(groupCard.getAttribute('data-rule'));
        const groupIdx = parseInt(groupCard.getAttribute('data-group'));
        entity.conditionalRules[ruleIdx].andGroups.splice(groupIdx, 1);
        this.notifyChange();
        this.renderProperties();
        return;
      }

      // 4. Add Condition
      const addCondBtn = e.target.closest('.rule-add-cond');
      if (addCondBtn) {
        const groupCard = addCondBtn.closest('.and-group-card');
        const ruleIdx = parseInt(groupCard.getAttribute('data-rule'));
        const groupIdx = parseInt(groupCard.getAttribute('data-group'));
        entity.conditionalRules[ruleIdx].andGroups[groupIdx].conditions.push({
          dependentFieldKey: this._ruleFieldChoices(entity, entity.id || '')[0]?.key || '',
          operator: "equals",
          equalsValue: ""
        });
        this.notifyChange();
        this.renderProperties();
        return;
      }

      // 5. Delete Condition
      const deleteCondBtn = e.target.closest('.rule-delete-cond');
      if (deleteCondBtn) {
        const row = deleteCondBtn.closest('.rules-row');
        const ruleIdx = parseInt(row.getAttribute('data-rule'));
        const groupIdx = parseInt(row.getAttribute('data-group'));
        const condIdx = parseInt(row.getAttribute('data-cond'));
        entity.conditionalRules[ruleIdx].andGroups[groupIdx].conditions.splice(condIdx, 1);
        this.notifyChange();
        this.renderProperties();
        return;
      }
    });

    // Handle inputs changes to prevent focus loss
    rulesContainer.addEventListener('change', (e) => {
      const select = e.target;

      // Target Property change
      if (select.classList.contains('rule-target-prop')) {
        const ruleCard = select.closest('.rule-card');
        const ruleIdx = parseInt(ruleCard.getAttribute('data-rule'));
        entity.conditionalRules[ruleIdx].targetProperty = select.value;
        this.notifyChange();
        return;
      }

      // Condition row inputs change
      const row = select.closest('.rules-row');
      if (row) {
        const ruleIdx = parseInt(row.getAttribute('data-rule'));
        const groupIdx = parseInt(row.getAttribute('data-group'));
        const condIdx = parseInt(row.getAttribute('data-cond'));
        const cond = entity.conditionalRules[ruleIdx].andGroups[groupIdx].conditions[condIdx];

        if (select.classList.contains('rule-cond-field')) {
          cond.dependentFieldKey = select.value;
        } else if (select.classList.contains('rule-cond-operator')) {
          cond.operator = select.value;
        } else if (select.classList.contains('rule-cond-compare-mode')) {
          cond.compareMode = select.value;
          this.notifyChange();
          this.renderProperties();
          return;
        } else if (select.classList.contains('rule-cond-compare-field')) {
          cond.compareToFieldKey = select.value;
        }

        this.notifyChange();
      }
    });

    rulesContainer.addEventListener('input', (e) => {
      const input = e.target;
      if (input.classList.contains('rule-cond-value')) {
        const row = input.closest('.rules-row');
        if (row) {
          const ruleIdx = parseInt(row.getAttribute('data-rule'));
          const groupIdx = parseInt(row.getAttribute('data-group'));
          const condIdx = parseInt(row.getAttribute('data-cond'));
          const cond = entity.conditionalRules[ruleIdx].andGroups[groupIdx].conditions[condIdx];

          const val = input.value;
          if (val === 'true') cond.equalsValue = true;
          else if (val === 'false') cond.equalsValue = false;
          else if (!isNaN(val) && val !== '') cond.equalsValue = Number(val);
          else cond.equalsValue = val;

          this.notifyChange();
        }
      }
    });
  }

  /**
   * Reverts the visual form builder canvas back to the previous historical state
   */
  undo() {
    if (this.readOnly) return;
    if (this.undoStack.length === 0) return;

    // Save current state to redo stack
    this.redoStack.push(JSON.stringify(this.schema));

    // Retrieve previous state
    const previousStateString = this.undoStack.pop();
    this.lastSavedStateString = previousStateString;

    // Apply state
    this.isApplyingHistoryState = true;
    this.schema = JSON.parse(previousStateString);

    this._endBurst();
    this._reconcileState(); // B8

    this.render();
    this.renderProperties();
    this.notifyChange();
    this.isApplyingHistoryState = false;
  }

  /**
   * Re-applies the next historically recorded template builder state
   */
  redo() {
    if (this.readOnly) return;
    if (this.redoStack.length === 0) return;

    // Save current state to undo stack
    this.undoStack.push(JSON.stringify(this.schema));

    // Retrieve next state
    const nextStateString = this.redoStack.pop();
    this.lastSavedStateString = nextStateString;

    // Apply state
    this.isApplyingHistoryState = true;
    this.schema = JSON.parse(nextStateString);

    this._endBurst();
    this._reconcileState(); // B8

    this.render();
    this.renderProperties();
    this.notifyChange();
    this.isApplyingHistoryState = false;
  }

  /**
   * Binds Ctrl/Cmd + Z (Undo) and Ctrl/Cmd + Y / Ctrl/Cmd + Shift + Z (Redo), scoped to this
   * builder (A1). The listener lives on `document` so shortcuts still work after clicking a
   * non-focusable canvas card (focus then falls back to <body>), but it only acts when:
   *   - the event target is inside this builder's container, or
   *   - focus is on <body> and the user's last pointer/focus interaction was inside this
   *     container (so two builders on one page don't both undo, and Ctrl+Z elsewhere on the
   *     host page is left alone).
   * Native text undo inside inputs/textareas/selects/contenteditable is never intercepted.
   */
  bindKeyboardShortcuts() {
    const trackActivity = (e) => {
      this._isActive = !!(e.target && this.containerEl.contains(e.target));
    };
    this._addDocumentListener('pointerdown', trackActivity, true);
    this._addDocumentListener('mousedown', trackActivity, true);
    this._addDocumentListener('focusin', trackActivity, true);

    this._addDocumentListener('keydown', (e) => {
      if (this._destroyed || this.readOnly) return;

      const target = e.target;
      const targetInside = !!(target && target.nodeType === 1 && this.containerEl.contains(target));
      const targetIsPageRoot = !target || target === document.body || target === document.documentElement || target === document;
      if (!targetInside && !(targetIsPageRoot && this._isActive)) {
        return; // Not ours — leave the host page's shortcuts alone
      }

      // Avoid intercepting browser native undo/redo inside active focus inputs/textareas
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        activeEl.isContentEditable
      );

      if (isInputFocused) {
        return; // Allow native input text undo/redo
      }

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && typeof e.key === 'string') {
        const key = e.key.toLowerCase();
        if (key === 'z') {
          e.preventDefault();
          e.stopPropagation();
          if (e.shiftKey) {
            this.redo();
          } else {
            this.undo();
          }
        } else if (key === 'y') {
          e.preventDefault();
          e.stopPropagation();
          this.redo();
        }
      }
    });
  }

  // ---------------------------------------------------------------------------------------
  // A7: read-only mode
  // ---------------------------------------------------------------------------------------

  /**
   * Read-only is enforced three ways: mutating methods return early, the render passes below
   * strip every editing control, and these capture-phase listeners swallow drag/drop and
   * edit events before any handler runs (the Properties panel stays inspectable).
   */
  _bindReadOnlyGuards() {
    if (!this.readOnly || !this.containerEl) return;
    const block = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    ['dragstart', 'dragover', 'drop'].forEach(type => this._addContainerListener(type, block, true));
    const blockInProperties = (e) => {
      if (!this.propertiesEl || !this.propertiesEl.contains(e.target)) return;
      // Switching the language being *viewed* is allowed; everything else is inert.
      if (e.target.id === 'prop-editing-locale') return;
      e.stopImmediatePropagation();
    };
    ['click', 'input', 'change'].forEach(type => this._addContainerListener(type, blockInProperties, true));
  }

  /** Adds a listener on the container and records it so destroy() can remove it. */
  _addContainerListener(type, handler, capture = false) {
    this.containerEl.addEventListener(type, handler, capture);
    this._containerListeners = this._containerListeners || [];
    this._containerListeners.push({ type, handler, capture });
  }

  /** Removes editing affordances from the freshly rendered canvas. */
  _applyReadOnlyCanvas() {
    const remove = [
      '.canvas-page-add-btn', '.canvas-page-tab-delete', '.section-insertion-divider', '.row-insertion-divider',
      '.section-operations', '.row-operations', '.col-btn', '.canvas-field-actions', '.repeater-operations',
      '.empty-section-drop-zone', '#btn-empty-add-section'
    ].join(',');
    this.canvasEl.querySelectorAll(remove).forEach(el => el.remove());
    this.canvasEl.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
    this.canvasEl.querySelectorAll('input, textarea').forEach(el => el.setAttribute('readonly', ''));
  }

  /** Disables every control of the Properties panel (except the language being viewed). */
  _applyReadOnlyProperties() {
    this.propertiesEl.querySelectorAll('input, select, textarea, button').forEach(el => {
      if (el.id !== 'prop-editing-locale') el.setAttribute('disabled', '');
    });
  }

  // ---------------------------------------------------------------------------------------
  // A7: confirm / prompt (hooks or the built-in accessible modal)
  // ---------------------------------------------------------------------------------------

  /**
   * Asks the user to confirm `message`. Uses the `confirm` option when given
   * (`(message) => boolean | Promise<boolean>`), otherwise the built-in dialog.
   * Always resolves to a boolean (a throwing or rejecting hook counts as "no").
   */
  async confirm(message) {
    if (this._confirmHook) {
      try {
        return (await this._confirmHook(message)) === true;
      } catch (err) {
        if (typeof console !== 'undefined') console.error('OpenFormBuilder: confirm hook failed', err);
        return false;
      }
    }
    const result = await this._openDialog({ message, withInput: false });
    return result === true;
  }

  /**
   * Asks the user for a text value. Uses the `prompt` option when given
   * (`(message, defaultValue) => string | null | Promise<string | null>`), otherwise the
   * built-in dialog. Resolves to a string, or `null` when cancelled.
   */
  async prompt(message, defaultValue = '') {
    if (this._promptHook) {
      try {
        const value = await this._promptHook(message, defaultValue);
        return value === null || value === undefined ? null : String(value);
      } catch (err) {
        if (typeof console !== 'undefined') console.error('OpenFormBuilder: prompt hook failed', err);
        return null;
      }
    }
    const result = await this._openDialog({ message, withInput: true, defaultValue });
    return typeof result === 'string' ? result : null;
  }

  /**
   * Built-in modal: role="dialog" + aria-modal, focus moves in and is trapped, Escape and a
   * click on the backdrop cancel, Enter confirms a prompt, focus returns to where it was.
   * Resolves to `true`/`false` (confirm) or the typed string/`null` (prompt).
   */
  _openDialog({ message, withInput, defaultValue }) {
    if (this._destroyed) return Promise.resolve(withInput ? null : false);
    this._closeDialog(withInput ? null : false); // only one dialog at a time

    return new Promise(resolve => {
      const host = this.containerEl.querySelector('.builder-layout') || this.containerEl;
      const uid = this.generateUniqueId('dlg');
      const backdrop = document.createElement('div');
      backdrop.className = 'of-dialog-backdrop';
      backdrop.innerHTML = `
        <div class="of-dialog" role="dialog" aria-modal="true" aria-labelledby="${uid}-msg">
          <p class="of-dialog-message" id="${uid}-msg">${this.esc(message)}</p>
          ${withInput ? `<input type="text" class="prop-input of-dialog-input" aria-labelledby="${uid}-msg" />` : ''}
          <div class="of-dialog-actions">
            <button type="button" class="pg-btn pg-btn-secondary of-dialog-cancel">${this.esc(this.translations.dialogCancelLabel)}</button>
            <button type="button" class="pg-btn of-dialog-ok">${this.esc(this.translations.dialogOkLabel)}</button>
          </div>
        </div>
      `;
      const dialogEl = backdrop.querySelector('.of-dialog');
      const input = backdrop.querySelector('.of-dialog-input');
      const okBtn = backdrop.querySelector('.of-dialog-ok');
      const cancelBtn = backdrop.querySelector('.of-dialog-cancel');
      if (input) input.value = defaultValue === undefined || defaultValue === null ? '' : String(defaultValue);

      const finish = (confirmed) => {
        if (withInput) this._closeDialog(confirmed ? input.value : null);
        else this._closeDialog(confirmed === true);
      };
      okBtn.addEventListener('click', () => finish(true));
      cancelBtn.addEventListener('click', () => finish(false));
      backdrop.addEventListener('mousedown', (e) => {
        if (e.target === backdrop) finish(false);
      });
      backdrop.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          finish(false);
        } else if (e.key === 'Enter' && e.target === input) {
          e.preventDefault();
          finish(true);
        } else if (e.key === 'Tab') {
          const focusables = Array.from(dialogEl.querySelectorAll('input, button')).filter(el => !el.disabled);
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const active = document.activeElement;
          if (e.shiftKey && (active === first || !dialogEl.contains(active))) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && (active === last || !dialogEl.contains(active))) {
            e.preventDefault();
            first.focus();
          }
        }
      });

      host.appendChild(backdrop);
      this._dialog = { el: backdrop, resolve, previousFocus: document.activeElement };
      // Destructive confirmations start on "Cancel"; prompts start in the text field.
      (input || cancelBtn).focus();
      if (input && input.select) input.select();
    });
  }

  /** Closes the open built-in dialog (if any) and resolves its promise with `result`. */
  _closeDialog(result) {
    const dialog = this._dialog;
    if (!dialog) return;
    this._dialog = null;
    dialog.el.remove();
    if (dialog.previousFocus && typeof dialog.previousFocus.focus === 'function' && document.contains(dialog.previousFocus)) {
      dialog.previousFocus.focus();
    }
    dialog.resolve(result);
  }

  /** Adds a listener on `document` and records it so destroy() can remove it. */
  _addDocumentListener(type, handler, capture = false) {
    document.addEventListener(type, handler, capture);
    this._documentListeners.push({ type, handler, capture });
  }

  /** setTimeout that destroy() can cancel. */
  _setTimer(fn, delay) {
    const id = setTimeout(() => {
      this._timers.delete(id);
      fn();
    }, delay);
    this._timers.add(id);
    return id;
  }

  /**
   * Tears the builder down (A1): removes every listener it added outside its container,
   * cancels the debounced render and any pending timers, removes its toasts from the host's
   * toast container and empties the container. Safe to call more than once.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    this._documentListeners.forEach(({ type, handler, capture }) => {
      document.removeEventListener(type, handler, capture);
    });
    this._documentListeners = [];
    (this._containerListeners || []).forEach(({ type, handler, capture }) => {
      if (this.containerEl) this.containerEl.removeEventListener(type, handler, capture);
    });
    this._containerListeners = [];
    this._closeDialog(null);

    if (this.debouncedRender && this.debouncedRender.cancel) {
      this.debouncedRender.cancel();
    }
    this._timers.forEach(id => clearTimeout(id));
    this._timers.clear();

    this._toasts.forEach(toast => toast.remove());
    this._toasts.clear();
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer && toastContainer.getAttribute('data-openforms-builder') === 'true' && toastContainer.children.length === 0) {
      toastContainer.remove();
    }

    this._endBurst();
    this.resetDragState();
    if (this.containerEl) {
      this.containerEl.innerHTML = '';
    }
    this.canvasEl = null;
    this.propertiesEl = null;
  }

  /**
   * Returns all fields available for use in cross-field conditions (all pages, all types except header/paragraph)
   */
  getCrossFieldOptions(selectedKey = '') {
    const fields = this.getAllFields().filter(f => f.type !== 'header' && f.type !== 'paragraph');
    if (fields.length === 0) {
      return `<option value="">${this.esc(this.translations.fieldCondNoOtherFields)}</option>`;
    }
    return fields.map(f => {
      const isSelected = f.key === selectedKey ? 'selected' : '';
      return `<option value="${this.esc(f.key)}" ${isSelected}>${this.esc(f.label)} (${this.esc(f.key)})</option>`;
    }).join('');
  }

  /**
   * Renders the cross field validations list using a structured AND/OR condition builder
   */
  renderCrossFieldRulesEditorHTML() {
    this.schema.crossFieldRules = this.schema.crossFieldRules || [];
    this.schema.crossFieldRules.forEach(rule => {
      if (!rule.ruleId) rule.ruleId = `cfr-${Math.random().toString(36).substr(2, 9)}`;
    });

    const isDefaultLocale = this.editingLocale === 'default';
    const disabledAttr = isDefaultLocale ? '' : 'disabled';

    const renderConditionRow = (ruleIdx, groupIdx, condIdx, cond) => {
      const compareMode = cond.compareMode || 'value';
      return `
        <div class="cfr-cond-row" data-rule="${ruleIdx}" data-group="${groupIdx}" data-cond="${condIdx}"
             style="display: flex; align-items: center; gap: var(--of-space-xs); flex-wrap: wrap; padding: 6px; background: var(--of-color-neutral-0); border: 1px solid var(--of-color-neutral-3); border-radius: var(--of-border-radius-xs);">
          <select class="prop-input cfr-cond-field" style="flex: 2; min-width: 100px; font-size: var(--of-font-size-xs); padding: 4px 6px;" ${disabledAttr}>
            ${this.getCrossFieldOptions(cond.dependentFieldKey)}
          </select>
          <select class="prop-input cfr-cond-operator" style="flex: 1; min-width: 70px; font-size: var(--of-font-size-xs); padding: 4px 6px;" ${disabledAttr}>
            <option value="equals" ${cond.operator === 'equals' ? 'selected' : ''}>=</option>
            <option value="notEquals" ${cond.operator === 'notEquals' ? 'selected' : ''}>≠</option>
            <option value="greaterThan" ${cond.operator === 'greaterThan' ? 'selected' : ''}>&gt;</option>
            <option value="greaterThanOrEquals" ${cond.operator === 'greaterThanOrEquals' || cond.operator === 'gte' ? 'selected' : ''}>&gt;=</option>
            <option value="lessThan" ${cond.operator === 'lessThan' ? 'selected' : ''}>&lt;</option>
            <option value="lessThanOrEquals" ${cond.operator === 'lessThanOrEquals' || cond.operator === 'lte' ? 'selected' : ''}>&lt;=</option>
            <option value="contains" ${cond.operator === 'contains' ? 'selected' : ''}>${this.esc(this.translations.cfrOperatorContains)}</option>
            <option value="notContains" ${cond.operator === 'notContains' ? 'selected' : ''}>${this.esc(this.translations.cfrOperatorNotContains)}</option>
          </select>
          <div style="display: flex; align-items: center; gap: var(--of-space-xs); flex: 3; min-width: 120px;">
            <select class="prop-input cfr-cond-compare-mode" style="font-size: var(--of-font-size-xs); padding: 4px 6px; width: 70px; flex-shrink: 0;" ${disabledAttr}>
              <option value="value" ${compareMode === 'value' ? 'selected' : ''}>${this.esc(this.translations.ruleCompareValueOption)}</option>
              <option value="field" ${compareMode === 'field' ? 'selected' : ''}>${this.esc(this.translations.ruleCompareFieldOption)}</option>
            </select>
            ${compareMode === 'field' ? `
              <select class="prop-input cfr-cond-compare-field" style="flex: 1; font-size: var(--of-font-size-xs); padding: 4px 6px;" ${disabledAttr}>
                ${this.getCrossFieldOptions(cond.compareToFieldKey)}
              </select>
            ` : `
              <input type="text" class="prop-input cfr-cond-value" value="${this.esc(cond.equalsValue !== undefined ? cond.equalsValue : '')}" placeholder="${this.esc(this.translations.cfrValueInputPlaceholder)}"
                     style="flex: 1; font-size: var(--of-font-size-xs); padding: 4px 6px; margin-bottom: 0;" ${disabledAttr} />
            `}
          </div>
          <button type="button" class="cfr-delete-cond" title="${this.esc(this.translations.cfrRemoveConditionTitle)}" ${disabledAttr}
                  style="background: none; border: none; color: var(--of-color-neutral-5); cursor: pointer; padding: 2px; display: flex; align-items: center; flex-shrink: 0;">
            ${OpenFormBuilder.icon('x', '', 'width: 12px; height: 12px;')}
          </button>
        </div>
      `;
    };

    const renderAndGroup = (ruleIdx, groupIdx, group) => {
      const conditions = (group.conditions || []).map((cond, condIdx) =>
        renderConditionRow(ruleIdx, groupIdx, condIdx, cond)
      ).join('');

      return `
        <div class="cfr-and-group" data-rule="${ruleIdx}" data-group="${groupIdx}"
             style="background: var(--of-color-neutral-2); border: 1px solid var(--of-color-neutral-4); border-radius: var(--of-border-radius-xs); padding: 8px; display: flex; flex-direction: column; gap: var(--of-space-xs);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span style="font-size: 9px; font-weight: var(--of-font-weight-bold); text-transform: uppercase; color: var(--of-color-neutral-6); letter-spacing: 0.5px;">${this.esc(this.translations.cfrOrGroupLabel)}</span>
            <button type="button" class="cfr-delete-group" title="${this.esc(this.translations.cfrRemoveGroupTitle)}" ${disabledAttr}
                    style="background: none; border: none; color: var(--of-color-error); cursor: pointer; padding: 2px; display: flex; align-items: center; font-size: var(--of-font-size-xs); gap: 3px;">
              ${OpenFormBuilder.icon('trash-2', '', 'width: 10px; height: 10px;')} ${this.esc(this.translations.cfrRemoveGroupLabel)}
            </button>
          </div>
          <div class="cfr-conditions-list" style="display: flex; flex-direction: column; gap: var(--of-space-xs);">
            ${conditions || `<div style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-5); font-style: italic; padding: 4px;">${this.esc(this.translations.cfrNoConditionsText)}</div>`}
          </div>
          <button type="button" class="pg-btn pg-btn-secondary cfr-add-cond" style="justify-content: center; font-size: var(--of-font-size-xs); padding: 3px 8px; height: auto; margin-top: 2px;" ${disabledAttr}>
            ${OpenFormBuilder.icon('plus', '', 'width: 10px; height: 10px;')} ${this.esc(this.translations.ruleAddOrConditionLabel)}
          </button>
        </div>
      `;
    };

    const renderRuleCard = (rule, ruleIdx) => {
      // Legacy migration notice for old expression-based rules
      if (rule.expression && !rule.andGroups) {
        return `
          <div class="cfr-rule-card" data-rule="${ruleIdx}"
               style="padding: 10px; background: var(--of-color-neutral-2); border: 1px solid rgba(219,60,60,0.3); border-radius: var(--of-border-radius-soft); position: relative;">
            <button class="cfr-delete-rule" data-index="${ruleIdx}" title="${this.esc(this.translations.cfrDeleteRuleTitle)}" ${disabledAttr}
                    style="position: absolute; top: 8px; right: 8px; border: none; background: transparent; color: var(--of-color-neutral-6); cursor: pointer; display: flex; align-items: center;">
              ${OpenFormBuilder.icon('trash-2', '', 'width: 12px; height: 12px;')}
            </button>
            <div style="font-size: var(--of-font-size-xs); color: var(--of-color-error); margin-bottom: 6px; display: flex; align-items: center; gap: 4px; padding-right: 20px;">
              ${OpenFormBuilder.icon('alert-triangle', '', 'width: 12px; height: 12px;')}
              ${this.esc(this.translations.cfrLegacyNoticeText)}
            </div>
            <code style="font-size: 9px; color: var(--of-color-neutral-7); display: block; margin-bottom: 8px; word-break: break-all;">${this.esc(rule.expression)}</code>
            <button type="button" class="pg-btn pg-btn-secondary cfr-migrate-rule" data-index="${ruleIdx}" style="font-size: var(--of-font-size-xs); padding: 4px 10px; height: auto;" ${disabledAttr}>
              ${OpenFormBuilder.icon('refresh-cw', '', 'width: 10px; height: 10px;')} ${this.esc(this.translations.cfrMigrateButtonLabel)}
            </button>
          </div>
        `;
      }

      const andGroups = (rule.andGroups || []).map((group, groupIdx) =>
        renderAndGroup(ruleIdx, groupIdx, group)
      ).join('');

      const targetChips = (this.getAllFields().filter(f => f.type !== 'header' && f.type !== 'paragraph')).map(f => {
        const isSelected = (rule.targetFields || []).includes(f.key);
        return `
          <button type="button" class="cfr-target-chip" data-field-key="${this.esc(f.key)}" data-rule="${ruleIdx}" ${disabledAttr}
                  style="font-size: 9px; padding: 2px 8px; border-radius: 10px; cursor: pointer; transition: all 0.15s ease;
                         background: ${isSelected ? 'var(--of-color-primary)' : 'var(--of-color-neutral-3)'};
                         color: ${isSelected ? 'var(--of-color-neutral-0)' : 'var(--of-color-neutral-7)'};
                         border: 1px solid ${isSelected ? 'var(--of-color-primary)' : 'var(--of-color-neutral-4)'};
                         font-weight: ${isSelected ? 'var(--of-font-weight-semibold)' : 'var(--of-font-weight-normal)'}">
            ${this.esc(f.label)}
          </button>
        `;
      }).join('');

      const errorMessageVal = isDefaultLocale ? (rule.errorMessage || '') : (this.getTranslationValue('crossFieldRules', rule.ruleId) || '');
      const errorMessagePlaceholder = isDefaultLocale ? this.translations.cfrErrorMessagePlaceholder : (rule.errorMessage || '');

      return `
        <div class="cfr-rule-card" data-rule="${ruleIdx}" data-rule-id="${this.esc(rule.ruleId)}"
             style="padding: 10px; background: var(--of-color-neutral-2); border: 1px solid var(--of-color-neutral-4); border-radius: var(--of-border-radius-soft);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--of-space-s);">
            <span style="font-size: var(--of-font-size-xs); font-weight: var(--of-font-weight-bold); color: var(--of-color-neutral-8);">${this.esc(this.translations.cfrValidationRulePrefix)}${ruleIdx + 1}</span>
            <button class="cfr-delete-rule" data-index="${ruleIdx}" title="${this.esc(this.translations.cfrDeleteRuleTitle)}" ${disabledAttr}
                    style="border: none; background: transparent; color: var(--of-color-neutral-5); cursor: pointer; display: flex; align-items: center;">
              ${OpenFormBuilder.icon('trash-2', '', 'width: 12px; height: 12px;')}
            </button>
          </div>

          <div style="font-size: 9px; font-weight: var(--of-font-weight-bold); text-transform: uppercase; color: var(--of-color-neutral-6); letter-spacing: 0.5px; margin-bottom: var(--of-space-xs);">${this.esc(this.translations.cfrRuleInvalidWhenText)}</div>
          <div class="cfr-and-groups-list" style="display: flex; flex-direction: column; gap: var(--of-space-s); margin-bottom: var(--of-space-s);">
            ${andGroups || `<div style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-5); font-style: italic; padding: 4px;">${this.esc(this.translations.cfrNoAndGroupsText)}</div>`}
          </div>
          <button type="button" class="pg-btn pg-btn-secondary cfr-add-group" style="font-size: var(--of-font-size-xs); padding: 3px 8px; height: auto; width: 100%; justify-content: center; margin-bottom: var(--of-space-s);" ${disabledAttr}>
            ${OpenFormBuilder.icon('plus', '', 'width: 10px; height: 10px;')} ${this.esc(this.translations.ruleAddAndGroupLabel)}
          </button>

          <hr style="border: none; border-top: 1px solid var(--of-color-neutral-3); margin: var(--of-space-s) 0;" />

          <div class="prop-group" style="margin-bottom: var(--of-space-s);">
            <label class="prop-label" style="font-size: 9px; text-transform: uppercase;">${this.esc(this.translations.cfrErrorMessageLabel)}</label>
            <input type="text" class="prop-input cfr-rule-message" value="${this.esc(errorMessageVal)}" placeholder="${this.esc(errorMessagePlaceholder)}"
                   style="font-size: var(--of-font-size-xs); padding: 4px 6px; margin-bottom: 0;" />
          </div>

          <div class="prop-group" style="margin-bottom: 0;">
            <label class="prop-label" style="font-size: 9px; text-transform: uppercase; margin-bottom: var(--of-space-xs);">${this.esc(this.translations.cfrMarkAsInvalidLabel)}</label>
            <div class="cfr-target-chips" style="display: flex; flex-wrap: wrap; gap: var(--of-space-xs);">
              ${targetChips || `<span style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-5); font-style: italic;">${this.esc(this.translations.cfrNoFieldsAvailableText)}</span>`}
            </div>
          </div>
        </div>
      `;
    };

    const rulesHtml = this.schema.crossFieldRules.map((rule, idx) => renderRuleCard(rule, idx)).join('');

    return `
      <hr style="border: none; border-top: 1px solid var(--of-color-neutral-4); margin: var(--of-space-base) 0;" />
      <div class="cross-field-rules-section" style="margin-top: var(--of-space-s);">
        <div style="font-weight: var(--of-font-weight-bold); font-size: var(--of-font-size-s); color: var(--of-color-neutral-9); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          ${OpenFormBuilder.icon('shield-alert', '', 'width: 14px; height: 14px; color: var(--of-color-primary);')}
          ${this.esc(this.translations.crossFieldValidationsTitle)}
        </div>
        <div style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7); margin-bottom: var(--of-space-m); line-height: 1.3;">
          ${this.esc(this.translations.crossFieldValidationsDesc)}
        </div>
        ${!isDefaultLocale ? `<div class="rules-locale-notice">${this.esc(this.translations.crossFieldLocaleNotice)}</div>` : ''}

        <div id="cfr-rules-list" style="display: flex; flex-direction: column; gap: var(--of-space-m); margin-bottom: var(--of-space-m);">
          ${rulesHtml || `<div style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-5); font-style: italic; text-align: center; padding: var(--of-space-m);">${this.esc(this.translations.cfrNoRulesYetText)}</div>`}
        </div>

        <button id="btn-add-cross-rule" class="pg-btn pg-btn-secondary" style="width: 100%; font-size: var(--of-font-size-xs); padding: 6px var(--of-space-m); display: flex; align-items: center; justify-content: center; gap: 6px;" ${disabledAttr}>
          ${OpenFormBuilder.icon('plus-circle', '', 'width: 12px; height: 12px;')} ${this.esc(this.translations.cfrAddValidationRuleLabel)}
        </button>
      </div>
    `;
  }

  /**
   * Binds all event handlers for the structured cross-field validation builder
   */
  bindCrossFieldRulesEvents() {
    const section = this.propertiesEl.querySelector('.cross-field-rules-section');
    if (!section) return;

    const getRule = (idx) => this.schema.crossFieldRules[idx];
    const getGroup = (ruleIdx, groupIdx) => (getRule(ruleIdx)?.andGroups || [])[groupIdx];
    const getCond = (ruleIdx, groupIdx, condIdx) => (getGroup(ruleIdx, groupIdx)?.conditions || [])[condIdx];
    const firstField = () => this.getAllFields().find(f => f.type !== 'header' && f.type !== 'paragraph')?.key || '';

    // Add new rule
    const btnAdd = section.querySelector('#btn-add-cross-rule');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        this.schema.crossFieldRules = this.schema.crossFieldRules || [];
        this.schema.crossFieldRules.push({
          ruleId: `cfr-${Math.random().toString(36).substr(2, 9)}`,
          andGroups: [{ conditions: [{ dependentFieldKey: firstField(), operator: 'greaterThan', compareMode: 'field', compareToFieldKey: firstField(), equalsValue: '' }] }],
          targetFields: [],
          errorMessage: ''
        });
        this.notifyChange();
        this.renderProperties();
      });
    }

    // Event delegation for the entire rules section
    section.addEventListener('click', (e) => {
      // Delete rule
      const deleteRuleBtn = e.target.closest('.cfr-delete-rule');
      if (deleteRuleBtn) {
        const idx = parseInt(deleteRuleBtn.getAttribute('data-index'));
        this.schema.crossFieldRules.splice(idx, 1);
        this.notifyChange();
        this.renderProperties();
        return;
      }

      // Migrate legacy expression rule
      const migrateBtn = e.target.closest('.cfr-migrate-rule');
      if (migrateBtn) {
        const idx = parseInt(migrateBtn.getAttribute('data-index'));
        const rule = getRule(idx);
        if (rule) {
          rule.andGroups = [{ conditions: [{ dependentFieldKey: firstField(), operator: 'greaterThan', compareMode: 'field', compareToFieldKey: firstField(), equalsValue: '' }] }];
          delete rule.expression;
          this.notifyChange();
          this.renderProperties();
        }
        return;
      }

      // Add AND group
      const addGroupBtn = e.target.closest('.cfr-add-group');
      if (addGroupBtn) {
        const ruleCard = addGroupBtn.closest('.cfr-rule-card');
        const ruleIdx = parseInt(ruleCard.getAttribute('data-rule'));
        const rule = getRule(ruleIdx);
        if (rule) {
          rule.andGroups = rule.andGroups || [];
          rule.andGroups.push({ conditions: [{ dependentFieldKey: firstField(), operator: 'equals', compareMode: 'value', equalsValue: '' }] });
          this.notifyChange();
          this.renderProperties();
        }
        return;
      }

      // Delete AND group
      const deleteGroupBtn = e.target.closest('.cfr-delete-group');
      if (deleteGroupBtn) {
        const groupEl = deleteGroupBtn.closest('.cfr-and-group');
        const ruleIdx = parseInt(groupEl.getAttribute('data-rule'));
        const groupIdx = parseInt(groupEl.getAttribute('data-group'));
        const rule = getRule(ruleIdx);
        if (rule) {
          rule.andGroups.splice(groupIdx, 1);
          this.notifyChange();
          this.renderProperties();
        }
        return;
      }

      // Add condition
      const addCondBtn = e.target.closest('.cfr-add-cond');
      if (addCondBtn) {
        const groupEl = addCondBtn.closest('.cfr-and-group');
        const ruleIdx = parseInt(groupEl.getAttribute('data-rule'));
        const groupIdx = parseInt(groupEl.getAttribute('data-group'));
        const group = getGroup(ruleIdx, groupIdx);
        if (group) {
          group.conditions.push({ dependentFieldKey: firstField(), operator: 'equals', compareMode: 'value', equalsValue: '' });
          this.notifyChange();
          this.renderProperties();
        }
        return;
      }

      // Delete condition
      const deleteCondBtn = e.target.closest('.cfr-delete-cond');
      if (deleteCondBtn) {
        const row = deleteCondBtn.closest('.cfr-cond-row');
        const ruleIdx = parseInt(row.getAttribute('data-rule'));
        const groupIdx = parseInt(row.getAttribute('data-group'));
        const condIdx = parseInt(row.getAttribute('data-cond'));
        const group = getGroup(ruleIdx, groupIdx);
        if (group) {
          group.conditions.splice(condIdx, 1);
          this.notifyChange();
          this.renderProperties();
        }
        return;
      }

      // Toggle target field chip
      const chip = e.target.closest('.cfr-target-chip');
      if (chip) {
        const ruleIdx = parseInt(chip.getAttribute('data-rule'));
        const fieldKey = chip.getAttribute('data-field-key');
        const rule = getRule(ruleIdx);
        if (rule) {
          rule.targetFields = rule.targetFields || [];
          const pos = rule.targetFields.indexOf(fieldKey);
          if (pos === -1) {
            rule.targetFields.push(fieldKey);
          } else {
            rule.targetFields.splice(pos, 1);
          }
          this.notifyChange();
          this.renderProperties();
        }
        return;
      }
    });

    // Change delegation (selects and inputs)
    section.addEventListener('change', (e) => {
      const row = e.target.closest('.cfr-cond-row');
      if (row) {
        const ruleIdx = parseInt(row.getAttribute('data-rule'));
        const groupIdx = parseInt(row.getAttribute('data-group'));
        const condIdx = parseInt(row.getAttribute('data-cond'));
        const cond = getCond(ruleIdx, groupIdx, condIdx);
        if (!cond) return;

        if (e.target.classList.contains('cfr-cond-field')) {
          cond.dependentFieldKey = e.target.value;
        } else if (e.target.classList.contains('cfr-cond-operator')) {
          cond.operator = e.target.value;
        } else if (e.target.classList.contains('cfr-cond-compare-mode')) {
          cond.compareMode = e.target.value;
          // Re-render to swap value input <-> field selector
          this.notifyChange();
          this.renderProperties();
          return;
        } else if (e.target.classList.contains('cfr-cond-compare-field')) {
          cond.compareToFieldKey = e.target.value;
        }
        this.notifyChange();
        return;
      }
    });

    // Input delegation (text value fields and error messages)
    section.addEventListener('input', (e) => {
      // Condition value input
      const row = e.target.closest('.cfr-cond-row');
      if (row && e.target.classList.contains('cfr-cond-value')) {
        const ruleIdx = parseInt(row.getAttribute('data-rule'));
        const groupIdx = parseInt(row.getAttribute('data-group'));
        const condIdx = parseInt(row.getAttribute('data-cond'));
        const cond = getCond(ruleIdx, groupIdx, condIdx);
        if (cond) {
          const val = e.target.value;
          if (val === 'true') cond.equalsValue = true;
          else if (val === 'false') cond.equalsValue = false;
          else if (!isNaN(val) && val !== '') cond.equalsValue = Number(val);
          else cond.equalsValue = val;
          this.notifyChange();
        }
        return;
      }

      // Error message input
      const ruleCard = e.target.closest('.cfr-rule-card');
      if (ruleCard && e.target.classList.contains('cfr-rule-message')) {
        const ruleIdx = parseInt(ruleCard.getAttribute('data-rule'));
        const rule = getRule(ruleIdx);
        if (rule) {
          if (this.editingLocale === 'default') {
            rule.errorMessage = e.target.value;
            this.notifyChange();
          } else {
            const val = e.target.value;
            if (val) {
              this.setTranslationValue('crossFieldRules', rule.ruleId, null, val);
            } else {
              this.deleteTranslationValue('crossFieldRules', rule.ruleId);
            }
          }
        }
        return;
      }
    });
  }
}

// UMD footer: CommonJS/bundlers get `module.exports`; a plain <script> attaches to the global.
// Nothing here touches `window`/`document` unguarded, so importing in Node/SSR is safe.
if (typeof module === 'object' && module && module.exports) {
  module.exports = OpenFormBuilder;
} else {
  const root = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
  const existing = root.OpenFormBuilder;
  if (existing && existing !== OpenFormBuilder) {
    // Double-load guard (e.g. an OutSystems block and a screen both requiring this script):
    // keep the first definition so live instances and `instanceof` checks stay valid.
    if (existing.VERSION !== OpenFormBuilder.VERSION && typeof console !== 'undefined') {
      console.warn('OpenFormBuilder: v' + OpenFormBuilder.VERSION + ' was loaded after v' + existing.VERSION + '; keeping the first (v' + existing.VERSION + ').');
    }
  } else {
    root.OpenFormBuilder = OpenFormBuilder;
  }
}

}).call(this);
