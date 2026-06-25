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
  /**
   * @param {Object} options
   * @param {HTMLElement} options.containerEl Container element of the widget
   * @param {Function} options.onSchemaChange Callback fired when the schema changes
   * @param {Object} [options.translations] Custom translation overrides
   */
  constructor({ containerEl, onSchemaChange, translations }) {
    this.containerEl = containerEl;
    this.onSchemaChange = onSchemaChange;

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

      // Canvas / Editor Workspace
      formTitlePlaceholder: "Form Title",
      formDescPlaceholder: "Add a brief description for this form...",
      pagePrefix: "Page",
      deletePageTitle: "Delete page",
      deletePageConfirm: "Are you sure you want to delete this page? All fields inside it will be permanently deleted.",
      addPageLabel: "Add Page",
      emptyPageTitle: "is empty",
      emptyPageDesc: "Start by adding a row or dragging a field from the side palette to create responsive elements.",
      emptyPageAddRow: "Add Row",
      rowLabel: "Row",
      addColTitle: "Add Column in this Row",
      deleteRowTitle: "Delete Row",
      gripHorizontalTitle: "Drag to reorder",
      colDecreaseTitle: "Decrease width",
      colIncreaseTitle: "Increase width",
      colDeleteTitle: "Delete Column",
      dropFieldHere: "Drop field here",
      removeFieldTitle: "Remove Field",
      addGridRowZone: "Add New Grid Row",

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
      fieldOptionsStaticPlaceholder: "Label1:value1\nLabel2:value2",
      fieldOptionsStaticHint: "Configure one per line using 'Label:value'.",
      fieldOptionsApiUrlLabel: "REST API URL",
      fieldOptionsApiUrlPlaceholder: "e.g. /api/countries",
      fieldOptionsApiUrlHint: "Simulated endpoints available: /api/countries or /api/departments",
      fieldHasVisibilityLabel: "Has Visibility Rule?",
      fieldCondIfField: "If field:",
      fieldCondNoOtherFields: "-- No other fields available --",
      fieldCondIsOperator: "Is:",
      fieldCondEquals: "Equals to",
      fieldCondNotEquals: "Not Equals to",
      fieldCondContains: "Contains",
      fieldCondGreaterThan: "Greater than",
      fieldCondLessThan: "Less than",
      fieldCondValueLabel: "This Value:",
      fieldCondValuePlaceholder: "e.g. true or text",

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
      matrixRowKeyLabel: "Row Key"
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

    // Initial Schema State (Opens empty as requested by the user)
    this.schema = this.normalizeSchema({
      formTitle: "Untitled Form",
      formDescription: "",
      pages: []
    });

    // Initialize Undo/Redo History Stacks
    this.undoStack = [];
    this.redoStack = [];
    this.isApplyingHistoryState = false;
    this.lastSavedStateString = JSON.stringify(this.schema);

    this.editingLocale = 'default';

    this.buildHTMLShell();
    this.init();

    // Bind Keyboard Shortcuts for Undo/Redo
    this.bindKeyboardShortcuts();
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
    return '';
  }

  /**
   * Sets localized translations branch dynamically inside schema properties dictionary
   */
  setTranslationValue(category, targetKey, subCategory, optKeyOrValue, value) {
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
    }
    this.notifyChange();
  }

  /**
   * Removes unused empty keys from properties translations dictionary
   */
  deleteTranslationValue(category, targetKey, subCategory, optKey) {
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
    }
    // Clean up empty objects to optimize JSON output size
    if (dict.fields && Object.keys(dict.fields).length === 0) delete dict.fields;
    if (dict.sections && Object.keys(dict.sections).length === 0) delete dict.sections;
    if (dict.pages && Object.keys(dict.pages).length === 0) delete dict.pages;
    if (Object.keys(dict).length === 0) {
      delete this.schema.translations[this.editingLocale];
    }
    this.notifyChange();
  }

  /**
   * Generates elegant, harmonized language switcher panel
   */
  renderLocaleSwitcherHTML() {
    const locales = [
      { code: 'default', label: 'Default (Base)' },
      { code: 'pt-BR', label: 'Português (pt-BR)' },
      { code: 'en-US', label: 'English (en-US)' },
      { code: 'es-ES', label: 'Español (es-ES)' }
    ];

    if (this.schema.translations) {
      Object.keys(this.schema.translations).forEach(code => {
        if (!locales.some(l => l.code === code)) {
          locales.push({ code, label: `${code} (Custom)` });
        }
      });
    }

    const selectOptionsHTML = locales.map(loc =>
      `<option value="${loc.code}" ${this.editingLocale === loc.code ? 'selected' : ''}>${loc.label}</option>`
    ).join('');

    return `
      <div class="properties-locale-switcher" style="padding: 12px 14px; border: 1px solid var(--color-neutral-4); background: var(--color-neutral-2); margin-bottom: 16px; border-radius: 4px;">
        <label class="prop-label" style="margin-bottom: 6px; display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--color-neutral-7); font-weight: 700;">Editing Language / Idioma</label>
        <div style="display: flex; gap: 8px; align-items: center;">
          <select id="prop-editing-locale" class="prop-input" style="flex: 1; padding: 4px 8px; font-size: 12px; height: 30px; margin-bottom: 0;">
            ${selectOptionsHTML}
          </select>
          <button id="btn-add-locale" class="pg-btn pg-btn-secondary" style="padding: 0 8px; font-size: 11px; height: 30px; display: flex; align-items: center; justify-content: center;" title="Add Custom Language Code">
            <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
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
      addBtn.addEventListener('click', () => {
        const code = prompt("Enter standard language code (e.g., fr-FR, de-DE):\nDigite o código do idioma (ex: fr-FR, de-DE):");
        if (code) {
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
   * Normalizes Schema JSON, ensuring pagination and row sections compatibility
   */
  normalizeSchema(schema) {
    if (!schema) {
      schema = {
        formTitle: "Untitled Form",
        formDescription: "",
        pages: []
      };
    }

    // Convert legacy flat rows structure into multi-page layout
    if (!schema.pages && schema.rows) {
      schema.pages = [
        {
          pageId: "page-default",
          title: `${this.translations.pagePrefix} 1`,
          rows: schema.rows
        }
      ];
      delete schema.rows;
    }

    // If both are missing, initialize with a single empty page
    if (!schema.pages || !Array.isArray(schema.pages) || schema.pages.length === 0) {
      schema.pages = [
        {
          pageId: "page-default",
          title: `${this.translations.pagePrefix} 1`,
          sections: []
        }
      ];
    }

    // Validate that each page has correct identifiers and sections
    schema.pages.forEach((page, index) => {
      if (!page.pageId) page.pageId = `page-${Math.random().toString(36).substr(2, 9)}`;
      if (!page.title) page.title = `${this.translations.pagePrefix} ${index + 1}`;

      // If page.rows exists but no page.sections, wrap it into a default section
      if (page.rows && (!page.sections || page.sections.length === 0)) {
        page.sections = [
          {
            sectionId: `sec-${Math.random().toString(36).substr(2, 9)}`,
            title: "",
            conditionalRules: [],
            rows: page.rows
          }
        ];
        delete page.rows;
      }

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

        // Upgrade legacy visibilityCondition on sections
        if (section.visibilityCondition) {
          section.conditionalRules.push({
            targetProperty: "visibility",
            andGroups: [
              {
                conditions: [
                  {
                    dependentFieldKey: section.visibilityCondition.dependentFieldKey,
                    operator: section.visibilityCondition.operator,
                    equalsValue: section.visibilityCondition.equalsValue
                  }
                ]
              }
            ]
          });
          delete section.visibilityCondition;
        }

        if (!Array.isArray(section.rows)) section.rows = [];

        section.rows.forEach(row => {
          if (!row.columns) row.columns = [];
          row.columns.forEach(col => {
            if (col.field) {
              const normalizeField = (field) => {
                if (!field) return;
                if (!Array.isArray(field.conditionalRules)) field.conditionalRules = [];

                if (field.visibilityCondition) {
                  field.conditionalRules.push({
                    targetProperty: "visibility",
                    andGroups: [
                      {
                        conditions: [
                          {
                            dependentFieldKey: field.visibilityCondition.dependentFieldKey,
                            operator: field.visibilityCondition.operator,
                            equalsValue: field.visibilityCondition.equalsValue
                          }
                        ]
                      }
                    ]
                  });
                  delete field.visibilityCondition;
                }

                if (field.type === 'repeater') {
                  if (field.fields && !field.rows) {
                    field.rows = field.fields.map(subField => {
                      return {
                        rowId: `r-sub-${Math.random().toString(36).substr(2, 9)}`,
                        columns: [
                          {
                            width: 12,
                            field: subField
                          }
                        ]
                      };
                    });
                    delete field.fields;
                  }
                  if (!field.rows) {
                    field.rows = [];
                  }
                  field.rows.forEach(r => {
                    if (!r.columns) r.columns = [];
                    r.columns.forEach(c => {
                      if (c.field) {
                        normalizeField(c.field);
                      }
                    });
                  });
                }
              };
              normalizeField(col.field);
            }
          });
        });
      });
    });

    return schema;
  }

  /**
   * Build the 3-column layout inside the editor container
   */
  buildHTMLShell() {
    this.containerEl.innerHTML = `
      <div class="builder-layout">
        <!-- Palette Sidebar -->
        <aside class="builder-palette">
          <h4 class="section-label">${this.translations.paletteTitle}</h4>
          <div class="palette-grid">
            <!-- Section Title Heading -->
            <div class="palette-item" draggable="true" data-type="header" style="border-left: 3px solid var(--color-primary);">
              <i data-lucide="heading"></i>
              <span>${this.translations.sectionHeaderLabel}</span>
            </div>
            <!-- Text Block / Paragraph -->
            <div class="palette-item" draggable="true" data-type="paragraph">
              <i data-lucide="align-justify"></i>
              <span>${this.translations.paragraphLabel || 'Text Block'}</span>
            </div>
            
            <div class="palette-item" draggable="true" data-type="text">
              <i data-lucide="text-cursor-input"></i>
              <span>${this.translations.textInputLabel}</span>
            </div>
            <div class="palette-item" draggable="true" data-type="textarea">
              <i data-lucide="align-left"></i>
              <span>${this.translations.longTextAreaLabel}</span>
            </div>
            <div class="palette-item" draggable="true" data-type="number">
              <i data-lucide="binary"></i>
              <span>${this.translations.numericInputLabel}</span>
            </div>
            <div class="palette-item" draggable="true" data-type="date">
              <i data-lucide="calendar"></i>
              <span>${this.translations.dateFieldLabel}</span>
            </div>
            <div class="palette-item" draggable="true" data-type="boolean">
              <i data-lucide="toggle-left"></i>
              <span>${this.translations.booleanToggleLabel}</span>
            </div>
            <div class="palette-item" draggable="true" data-type="dropdown">
              <i data-lucide="list-collapse"></i>
              <span>${this.translations.dropdownLabel}</span>
            </div>
            <div class="palette-item" draggable="true" data-type="radio">
              <i data-lucide="circle-dot"></i>
              <span>${this.translations.radioButtonLabel}</span>
            </div>
            <div class="palette-item" draggable="true" data-type="checkbox">
              <i data-lucide="check-square"></i>
              <span>${this.translations.checkboxLabel}</span>
            </div>
            <div class="palette-item" draggable="true" data-type="file">
              <i data-lucide="upload-cloud"></i>
              <span>${this.translations.fileUploadLabel}</span>
            </div>
            <div class="palette-item" draggable="true" data-type="signature">
              <i data-lucide="pen-tool"></i>
              <span>${this.translations.canvasSignatureLabel}</span>
            </div>
            <div class="palette-item" draggable="true" data-type="repeater">
              <i data-lucide="layers"></i>
              <span>${this.translations.repeaterLabel || 'Repeatable List'}</span>
            </div>
            <div class="palette-item" draggable="true" data-type="matrix">
              <i data-lucide="grid"></i>
              <span>${this.translations.matrixLabel || 'Question Matrix'}</span>
            </div>
          </div>
        </aside>
        
        <!-- Center Designer Canvas Workspace -->
        <div class="builder-canvas"></div>
        
        <!-- Right Properties Sidebar -->
        <aside class="builder-properties">
          <div class="properties-empty">
            <i data-lucide="info"></i>
            <p>${this.translations.propertiesHelpText}</p>
          </div>
        </aside>
      </div>
    `;

    // Cache structural queries locally
    this.canvasEl = this.containerEl.querySelector('.builder-canvas');
    this.propertiesEl = this.containerEl.querySelector('.builder-properties');
  }

  init() {
    this.setupDragAndDrop();
    this.render();
  }

  /**
   * Bind event listeners for sidebar palette item dragging
   */
  setupDragAndDrop() {
    const paletteItems = this.containerEl.querySelectorAll('.palette-item');
    paletteItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        this.draggedFieldType = item.getAttribute('data-type');
        this.draggedSourceElement = null;
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
      field.errorMessage = 'Incorrect value pattern.';
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
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" }
      ];
      field.optionsUrl = '';
    }

    if (type === 'file') {
      field.acceptedTypes = '.pdf,.docx,image/*';
      field.useNativeCamera = false;
      field.nativeCameraSource = 'camera';
    }

    if (type === 'paragraph') {
      field.label = 'This is an explanatory text block. You can write instructions here.';
      delete field.required;
      delete field.key;
    }

    if (type === 'repeater') {
      field.minItems = 1;
      field.maxItems = 10;
      field.addButtonLabel = 'Add Item';
      field.rows = [
        {
          rowId: `r-sub-${this.generateUniqueId('s')}`,
          columns: [
            {
              width: 12,
              field: { id: this.generateUniqueId('sub'), key: 'sub_col_1', type: 'text', label: 'Item Name', required: true }
            }
          ]
        }
      ];
    }

    if (type === 'matrix') {
      field.matrixRows = [
        { key: "row_1", label: "Question Row 1" },
        { key: "row_2", label: "Question Row 2" }
      ];
      field.optionsType = 'static';
      field.options = [
        { label: "Option 1", value: "option1" },
        { label: "Option 2", value: "option2" }
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
    const pageId = `page-${Math.random().toString(36).substr(2, 9)}`;
    const pageNum = this.schema.pages.length + 1;

    this.schema.pages.push({
      pageId: pageId,
      title: `${this.translations.pagePrefix} ${pageNum}`,
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
  deletePage(pageId) {
    if (this.schema.pages.length <= 1) return;

    const pageIndex = this.schema.pages.findIndex(p => p.pageId === pageId);
    if (pageIndex !== -1) {
      if (confirm(this.translations.deletePageConfirm)) {
        this.schema.pages.splice(pageIndex, 1);
        this.activePageIndex = Math.min(this.activePageIndex, this.schema.pages.length - 1);
        this.selectedFieldId = null;

        this.notifyChange();
        this.render();
        this.renderProperties();
      }
    }
  }

  /**
   * Overwrite page title string
   */
  renamePage(pageId, newTitle) {
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

  getUniqueDatabaseKey(baseKey) {
    let key = baseKey;
    const allKeys = new Set(this.getAllFields().map(f => f.key).filter(Boolean));

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
    const activePage = this.schema.pages[this.activePageIndex];
    if (!activePage.sections) return;

    const sectionIndex = activePage.sections.findIndex(s => s.sectionId === sectionId);
    if (sectionIndex === -1) return;

    const originalSection = activePage.sections[sectionIndex];
    const clonedSection = JSON.parse(JSON.stringify(originalSection));

    // Update section ID and title
    clonedSection.sectionId = `sec-${this.generateUniqueId('s')}`;
    clonedSection.title = clonedSection.title ? `${clonedSection.title} (Copy)` : "Section Copy";

    const duplicateField = (field) => {
      if (!field) return null;
      const clonedField = JSON.parse(JSON.stringify(field));
      clonedField.id = this.generateUniqueId(clonedField.type.substring(0, 3));

      if (clonedField.key && !['header', 'paragraph'].includes(clonedField.type)) {
        clonedField.key = this.getUniqueDatabaseKey(clonedField.key);
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
    const activePage = this.schema.pages[this.activePageIndex];
    if (!activePage.sections || activePage.sections.length <= 1) {
      alert("You must keep at least one section on the page.");
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

      activePage.sections.splice(index, 1);
      this.notifyChange();
      this.render();
      this.renderProperties();
    }
  }

  /**
   * Appends a new grid row at the bottom of the active page layout
   */
  addNewRow(sectionId = null) {
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
    const res = this.getRow(rowId);
    if (res) {
      const { row, section, repeaterField } = res;
      row.columns.forEach(col => {
        if (col.field && col.field.id === this.selectedFieldId) {
          this.selectedFieldId = null;
        }
      });

      if (section) {
        const rowIndex = section.rows.findIndex(r => r.rowId === rowId);
        if (rowIndex !== -1) {
          section.rows.splice(rowIndex, 1);
          this.notifyChange();
          this.render();
          this.renderProperties();
        }
      } else if (repeaterField) {
        const rowIndex = repeaterField.rows.findIndex(r => r.rowId === rowId);
        if (rowIndex !== -1) {
          repeaterField.rows.splice(rowIndex, 1);
          this.notifyChange();
          this.render();
          this.renderProperties();
        }
      }
    }
  }

  addRepeaterRow(repeaterField) {
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
    const res = this.getRow(rowId);
    if (res) {
      const { row } = res;
      if (row.columns.length > 1) {
        const col = row.columns[colIndex];
        if (col.field && col.field.id === this.selectedFieldId) {
          this.selectedFieldId = null;
        }

        row.columns.splice(colIndex, 1);
        this.balanceRowColumns(row);
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
    const res = this.getRow(rowId);
    if (res) {
      const { row } = res;
      const col = row.columns[colIndex];
      if (col.field) {
        if (col.field.id === this.selectedFieldId) {
          this.selectedFieldId = null;
        }
        col.field = null;
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

  /**
   * Load JSON schema configuration into the visual builder
   */
  loadSchema(newSchema) {
    if (newSchema) {
      this.schema = this.normalizeSchema(JSON.parse(JSON.stringify(newSchema)));
      this.activePageIndex = 0;
      this.selectedFieldId = null;

      // Reset Undo/Redo Stacks on new template load
      this.undoStack = [];
      this.redoStack = [];
      this.lastSavedStateString = JSON.stringify(this.schema);
      this.isApplyingHistoryState = false;

      this.render();
      this.renderProperties();
    }
  }

  /**
   * Bubble schema changes upward to orchestrator
   */
  notifyChange() {
    if (!this.isApplyingHistoryState) {
      const currentStateString = JSON.stringify(this.schema);
      if (currentStateString !== this.lastSavedStateString) {
        if (this.undoStack.length >= 100) {
          this.undoStack.shift();
        }
        this.undoStack.push(this.lastSavedStateString);
        this.lastSavedStateString = currentStateString;

        // Clear redo stack on any new manual action
        this.redoStack = [];
      }
    }

    if (this.onSchemaChange) {
      this.onSchemaChange(this.schema);
    }
  }

  renderSectionInsertionDivider(index) {
    const divider = document.createElement('div');
    divider.className = 'section-insertion-divider';

    const btn = document.createElement('button');
    btn.className = 'insertion-btn';
    btn.title = 'Insert Section Here';
    btn.type = 'button';
    btn.innerHTML = `<i data-lucide="plus"></i>`;
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
    btn.title = 'Insert Row Here';
    btn.type = 'button';
    btn.innerHTML = `<i data-lucide="plus"></i>`;
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
    this.canvasEl.innerHTML = '';

    // Form Title Heading Input Edit Bar
    const canvasHeader = document.createElement('div');
    canvasHeader.className = 'canvas-header-bar';

    const formTitleVal = this.editingLocale === 'default' ? this.schema.formTitle : (this.getTranslationValue('form', 'formTitle') || '');
    const formDescVal = this.editingLocale === 'default' ? (this.schema.formDescription || '') : (this.getTranslationValue('form', 'formDescription') || '');

    canvasHeader.innerHTML = `
      <div class="form-input-wrapper" style="margin-bottom: 0;">
        <input type="text" id="canvas-form-title" class="form-input" 
               style="font-size: 18px; font-weight: 700; border: none; padding: 4px 8px; background: transparent; color: var(--color-neutral-10);"
               value="${formTitleVal}" placeholder="${this.editingLocale === 'default' ? this.translations.formTitlePlaceholder : this.schema.formTitle}" />
        <input type="text" id="canvas-form-desc" class="form-input" 
               style="font-size: 12px; color: var(--color-neutral-7); border: none; padding: 2px 8px; background: transparent;"
               value="${formDescVal}" placeholder="${this.editingLocale === 'default' ? this.translations.formDescPlaceholder : (this.schema.formDescription || '')}" />
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

      // Support deleting layout pages (if more than one page is instantiated)
      if (this.schema.pages.length > 1) {
        const delBtn = document.createElement('button');
        delBtn.className = 'canvas-page-tab-delete';
        delBtn.title = this.translations.deletePageTitle;
        delBtn.innerHTML = `<i data-lucide="x"></i>`;

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
    addPageBtn.innerHTML = `<i data-lucide="plus"></i> ${this.translations.addPageLabel}`;
    addPageBtn.addEventListener('click', () => this.addNewPage());
    pagesBar.appendChild(addPageBtn);

    // Create New Section Button
    const addSectionBtn = document.createElement('button');
    addSectionBtn.className = 'canvas-page-add-btn';
    addSectionBtn.style.borderStyle = 'dashed';
    addSectionBtn.style.borderColor = 'var(--color-primary)';
    addSectionBtn.style.color = 'var(--color-primary)';
    addSectionBtn.innerHTML = `<i data-lucide="folder-plus"></i> Add Section`;
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
        <i data-lucide="plus-square"></i>
        <h3>${this.translations.pagePrefix} "${activePage.title}" ${this.translations.emptyPageTitle}</h3>
        <p>${this.translations.emptyPageDesc}</p>
        <button id="btn-empty-add-section" class="pg-btn" style="margin-top: 8px;">
          <i data-lucide="folder-plus"></i> Add Section
        </button>
      `;
      this.canvasEl.appendChild(emptyState);

      emptyState.querySelector('#btn-empty-add-section').addEventListener('click', () => this.addNewSection());

      if (window.lucide) {
        window.lucide.createIcons();
      }
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
          <i data-lucide="grip-vertical" style="width: 14px; height: 14px; color: var(--color-neutral-6); cursor: grab; margin-right: 4px;"></i>
          <span style="font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--color-primary); display: flex; align-items: center; gap: 4px;">
            <i data-lucide="folder" style="width: 13px; height: 13px;"></i> Section:
          </span>
          <input type="text" class="section-title-input" value="${sectionTitleVal}" placeholder="${this.editingLocale === 'default' ? 'Section Title...' : (section.title || 'Section Title...')}" style="flex: 1; font-weight: 700; background: transparent; border: none; ${sectionTitleVal == "" || sectionTitleVal == "Default Section" ? "color: var(--pg-text-secondary);" : ""} font-size: 13px; outline: none; margin-left: 6px;" />
        </div>
        <div class="section-operations" style="display: flex; gap: 6px; align-items: center;">
          <button class="pg-btn pg-btn-secondary btn-sec-add-row" style="padding: 4px 10px; font-size: 11px;">
            <i data-lucide="plus" style="width: 12px; height: 12px;"></i> Add Row
          </button>
          <button class="pg-btn pg-btn-secondary btn-sec-delete" style="padding: 4px 10px; font-size: 11px; color: var(--color-error); border-color: rgba(219,60,60,0.15);">
            <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
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
        this.draggedSectionId = section.sectionId;
        this.draggedRowId = null;
        this.draggedFieldType = null;
        this.draggedSourceElement = null;
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
          <div style="font-size: 11px; color: var(--color-neutral-6); text-align: center; padding: 20px; border: 1px dashed var(--pg-border); border-radius: 6px;">
            This Section is empty. Click "+ Add Row" in the header to start adding layout rows.
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
          <div class="row-drag-handle" draggable="true" title="${this.translations.gripHorizontalTitle}">
            <i data-lucide="grip-horizontal"></i> ${this.translations.rowLabel} ${rowIndex + 1}
          </div>
          <div class="row-operations">
            <button class="row-op-btn add-col" title="${this.translations.addColTitle}">
              <i data-lucide="columns"></i>
            </button>
            <button class="row-op-btn delete" title="${this.translations.deleteRowTitle}">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        `;
        rowEl.appendChild(rowBar);

        // Setup Row Drag handles
        const handleEl = rowBar.querySelector('.row-drag-handle');
        handleEl.addEventListener('dragstart', (e) => {
          this.draggedRowId = row.rowId;
          this.draggedFieldType = null;
          this.draggedSourceElement = null;
          this.draggedSectionId = null;
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
            <button class="col-btn col-dec" title="${this.translations.colDecreaseTitle}">-</button>
            <span class="col-badge">${col.width}/12</span>
            <button class="col-btn col-inc" title="${this.translations.colIncreaseTitle}">+</button>
            ${row.columns.length > 1 ? `<button class="col-btn col-del" title="${this.translations.colDeleteTitle}" style="color: var(--color-error)">x</button>` : ''}
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
              this.draggedFieldType = null;
              this.draggedRowId = null;
              this.draggedSectionId = null;
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
                <div class="canvas-field-info" style="width: 100%; border-left: 3px solid var(--color-primary); padding-left: 6px;">
                  <i data-lucide="heading" class="canvas-field-icon" style="color: var(--color-primary)"></i>
                  <div style="flex: 1; min-width: 0;">
                    <div class="canvas-field-title" style="font-weight: 700; color: var(--color-neutral-10); font-size: 13px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4; max-height: 2.8em;">${displayLabel}</div>
                    <span style="font-size: 10px; color: var(--color-neutral-7); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displaySub || `(${this.translations.sectionHeaderSubtitle})`}</span>
                  </div>
                </div>
                <div class="canvas-field-actions">
                  <button class="canvas-field-btn delete" title="${this.translations.removeFieldTitle}">
                    <i data-lucide="x"></i>
                  </button>
                </div>
              `;
            } else if (field.type === 'paragraph') {
              // Visual display for explanatory paragraph text blocks
              const displayLabel = this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key || field.id, 'label') || field.label);
              fieldEl.innerHTML = `
                <div class="canvas-field-info" style="width: 100%; border-left: 3px dashed var(--color-neutral-5); padding-left: 6px;">
                  <i data-lucide="align-justify" class="canvas-field-icon" style="color: var(--color-neutral-7)"></i>
                  <div style="flex: 1; min-width: 0;">
                    <div class="canvas-field-title" style="font-weight: 400; color: var(--color-neutral-8); font-size: 13px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.4; max-height: 2.8em;">${displayLabel}</div>
                    <span style="font-size: 9px; color: var(--color-neutral-6); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Text Block</span>
                  </div>
                </div>
                <div class="canvas-field-actions">
                  <button class="canvas-field-btn delete" title="${this.translations.removeFieldTitle}">
                    <i data-lucide="x"></i>
                  </button>
                </div>
              `;
            } else if (field.type === 'repeater') {
              // Repeatable list visual card
              const displayLabel = this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key, 'label') || field.label);
              fieldEl.innerHTML = `
                <div class="canvas-field-info canvas-field-repeater-wrapper" style="width: 100%; flex-direction: column; align-items: flex-start; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                    <i data-lucide="layers" class="canvas-field-icon" style="color: var(--color-primary);"></i>
                    <div style="flex: 1;">
                      <div class="canvas-field-title" style="font-weight: 700; color: var(--color-neutral-10); font-size: 13px;">${displayLabel}</div>
                      <span class="canvas-field-key">${field.key}</span>
                    </div>
                    <div class="repeater-operations">
                      <button class="repeater-op-btn add-row" title="Add Row" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; color: var(--color-primary); font-size: 11px; gap: 4px; padding: 2px 6px;">
                        <i data-lucide="plus" style="width: 12px; height: 12px;"></i> Add Row
                      </button>
                    </div>
                  </div>
                  <div class="canvas-repeater-rows-container" style="width: 100%; display: flex; flex-direction: column; gap: 12px; border-left: 2px solid var(--color-neutral-4); padding-left: 10px; margin-top: 4px;">
                    <!-- Rows will be appended here -->
                  </div>
                </div>
                <div class="canvas-field-actions">
                  <button class="canvas-field-btn delete" title="${this.translations.removeFieldTitle}">
                    <i data-lucide="x"></i>
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
                emptyZone.style.cssText = "font-size: 11px; color: var(--color-neutral-6); text-align: center; padding: 15px; border: 1px dashed var(--pg-border); border-radius: 6px; width: 100%;";
                emptyZone.textContent = "Empty Repeater list. Click 'Add Row' to start designing subfields.";
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
                    <div style="font-size: 10px; color: var(--color-neutral-7); font-weight: 600;">
                      Row ${subRowIndex + 1}
                    </div>
                    <div class="row-operations">
                      <button class="row-op-btn add-col" title="${this.translations.addColTitle}">
                        <i data-lucide="columns"></i>
                      </button>
                      <button class="row-op-btn delete" title="${this.translations.deleteRowTitle}">
                        <i data-lucide="trash-2"></i>
                      </button>
                    </div>
                  `;
                  subRowEl.appendChild(subRowBar);

                  // Setup sub-row reordering (drag row inside repeater)
                  subRowBar.style.cursor = 'grab';
                  subRowBar.setAttribute('draggable', 'true');
                  subRowBar.addEventListener('dragstart', (e) => {
                    e.stopPropagation();
                    this.draggedSubRowId = subRow.rowId;
                    this.draggedRowId = null;
                    this.draggedFieldType = null;
                    this.draggedSourceElement = null;
                    this.draggedSectionId = null;
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
                      <button class="col-btn col-dec" title="${this.translations.colDecreaseTitle}">-</button>
                      <span class="col-badge">${subCol.width}/12</span>
                      <button class="col-btn col-inc" title="${this.translations.colIncreaseTitle}">+</button>
                      ${subRow.columns.length > 1 ? `<button class="col-btn col-del" title="${this.translations.colDeleteTitle}" style="color: var(--color-error)">x</button>` : ''}
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
                        this.draggedFieldType = null;
                        this.draggedRowId = null;
                        this.draggedSectionId = null;
                        this.draggedSubRowId = null;
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
                          <i data-lucide="${this.getFieldIcon(subField.type)}" class="canvas-field-icon"></i>
                          <div style="flex: 1;">
                            <div class="canvas-field-title" style="font-weight: 600; font-size: 12px; color: var(--color-neutral-10);">${displaySubLabel}</div>
                            <span class="canvas-field-key" style="font-size: 9px;">${subField.key}</span>
                          </div>
                        </div>
                        <div class="canvas-field-actions">
                          <button class="canvas-field-btn delete" title="${this.translations.removeFieldTitle}">
                            <i data-lucide="x"></i>
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
                      emptyIndicator.innerHTML = this.translations.dropFieldHere;
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
                      <i data-lucide="align-justify"></i>
                      <span>${displayRowLabel} (${r.key})</span>
                    </div>
                  `;
                }).join('');
              } else {
                rowsHtml = `<div class="canvas-matrix-empty-rows">${this.translations.matrixEmptyRows || 'Empty Matrix rows. Click to configure rows in properties.'}</div>`;
              }

              const displayLabel = this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key, 'label') || field.label);
              fieldEl.innerHTML = `
                <div class="canvas-field-info canvas-field-matrix-wrapper" style="width: 100%; flex-direction: column; align-items: flex-start; gap: 8px;">
                  <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                    <i data-lucide="grid" class="canvas-field-icon" style="color: var(--color-primary);"></i>
                    <div style="flex: 1;">
                      <div class="canvas-field-title" style="font-weight: 700; color: var(--color-neutral-10); font-size: 13px;">${displayLabel}</div>
                      <span class="canvas-field-key">${field.key}</span>
                    </div>
                  </div>
                  <div class="canvas-matrix-rows-container">
                    ${rowsHtml}
                  </div>
                </div>
                <div class="canvas-field-actions">
                  <button class="canvas-field-btn delete" title="${this.translations.removeFieldTitle}">
                    <i data-lucide="x"></i>
                  </button>
                </div>
              `;
            } else {
              // Standard form input layouts
              const displayLabel = this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key, 'label') || field.label);
              fieldEl.innerHTML = `
                <div class="canvas-field-info">
                  <i data-lucide="${this.getFieldIcon(field.type)}" class="canvas-field-icon"></i>
                  <div>
                    <div class="canvas-field-title">
                      ${displayLabel} ${field.required ? '<span style="color: var(--color-error)">*</span>' : ''}
                      ${field.isCalculated ? '<span class="canvas-formula-badge" style="font-size: 9px; padding: 2px 6px; border-radius: 10px; background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-primary); margin-left: 6px; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;"><i data-lucide="calculator" style="width: 10px; height: 10px;"></i> fx</span>' : ''}
                    </div>
                    <span class="canvas-field-key">${field.key}</span>
                  </div>
                </div>
                <div class="canvas-field-actions">
                  <button class="canvas-field-btn delete" title="${this.translations.removeFieldTitle}">
                    <i data-lucide="x"></i>
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
            emptyIndicator.innerHTML = this.translations.dropFieldHere;
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

    if (window.lucide) {
      window.lucide.createIcons();
    }
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

      if (this.draggedFieldType) {
        // Drop new field from sidebar palette
        const res = this.getRow(rowId);
        if (res) {
          const { row, repeaterField } = res;
          // Prevent nesting repeaters/matrices inside repeaters
          if (repeaterField && ['repeater', 'matrix'].includes(this.draggedFieldType)) {
            alert("Nested repeaters or matrices are not supported.");
            return;
          }
          const newField = this.createDefaultField(this.draggedFieldType);
          row.columns[colIndex].field = newField;

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
            alert("Nested repeaters are not supported.");
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
  renderProperties() {
    // 1. If a section is selected, render Section Properties
    if (this.selectedSectionId) {
      const activePage = this.schema.pages[this.activePageIndex];
      const section = activePage.sections.find(s => s.sectionId === this.selectedSectionId);
      if (!section) return;

      this.propertiesEl.innerHTML = `
        <div class="properties-form" style="max-height: 100%; overflow-y: auto; padding-right: 4px;">
          ${this.renderLocaleSwitcherHTML()}
          <div class="prop-header">
            <i data-lucide="folder"></i>
            <span class="prop-title">Properties: Section</span>
          </div>

          <!-- Section Title Input -->
          <div class="prop-group">
            <label class="prop-label">Section Title</label>
            <input type="text" id="prop-section-title" class="prop-input" 
                   value="${this.editingLocale === 'default' ? (section.title || '') : (this.getTranslationValue('sections', section.sectionId) || '')}" 
                   placeholder="${this.editingLocale === 'default' ? '' : (section.title || '')}" />
          </div>

          <div class="prop-group" style="margin-top: 12px;">
            <button type="button" class="pg-btn pg-btn-secondary" id="btn-duplicate-section" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;"
                    ${this.editingLocale !== 'default' ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              <i data-lucide="copy" style="width: 14px; height: 14px;"></i> Duplicate Section
            </button>
          </div>

          <hr style="border: none; border-top: 1px solid var(--color-neutral-4); margin: 16px 0;" />

          <!-- Business Rules Editor for Section -->
          ${this.renderBusinessRulesEditorHTML(section, false)}
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();
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
          this.render(); // sync canvas
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
      return;
    }

    const field = this.getSelectedField();

    // Fallback: If no field is currently selected, display Active Page properties
    if (!field) {
      const activePage = this.schema.pages[this.activePageIndex];
      this.propertiesEl.innerHTML = `
        <div class="properties-form" style="max-height: 100%; overflow-y: auto; padding-right: 4px;">
          ${this.renderLocaleSwitcherHTML()}
          <div class="prop-header">
            <i data-lucide="file-text"></i>
            <span class="prop-title">${this.translations.propertiesPageTitle}</span>
          </div>
          
          <div class="prop-group">
            <label class="prop-label">${this.translations.pageTitleLabel}</label>
            <input type="text" id="prop-page-title" class="prop-input" 
                   value="${this.editingLocale === 'default' ? activePage.title : (this.getTranslationValue('pages', activePage.pageId) || '')}" 
                   placeholder="${this.editingLocale === 'default' ? '' : activePage.title}" />
            <span style="font-size: 10px; color: var(--color-neutral-7); margin-top: 2px;">${this.translations.pageTitleHint}</span>
          </div>
          
          ${this.editingLocale === 'default' ? this.renderCrossFieldRulesEditorHTML() : `
            <hr style="border: none; border-top: 1px solid var(--color-neutral-4); margin: 12px 0;" />
            <span style="font-size: 10px; color: var(--color-neutral-7); margin-top: 2px; display: block; text-align: center;">Switch to Default Language to edit cross-field validation rules.</span>
          `}
          
          <hr style="border: none; border-top: 1px solid var(--color-neutral-4); margin: 16px 0;" />
          <div style="font-size: 11px; color: var(--color-neutral-7); text-align: center; line-height: 1.4;">
            ${this.translations.propertiesHelpText}
          </div>
        </div>
      `;

      if (window.lucide) {
        window.lucide.createIcons();
      }
      this.bindLocaleSwitcherEvents();
      if (this.editingLocale === 'default') {
        this.bindCrossFieldRulesEvents();
      }

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
            this.render(); // sync page tabs preview
          }
        });
      }
      return;
    }

    // Simplify properties controls if Paragraph is selected
    if (field.type === 'paragraph') {
      this.propertiesEl.innerHTML = `
        <div class="properties-form">
          ${this.renderLocaleSwitcherHTML()}
          <div class="prop-header">
            <i data-lucide="align-justify"></i>
            <span class="prop-title">Properties: Text Block</span>
          </div>
          
          <!-- Text Content -->
          <div class="prop-group">
            <label class="prop-label">Paragraph Content</label>
            <textarea id="prop-paragraph-label" class="prop-input" rows="6" style="resize: vertical; font-family: inherit; font-size: 13px; line-height: 1.5; padding: 8px;">${this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key || field.id, 'label') || '')}</textarea>
          </div>
          
          <hr style="border: none; border-top: 1px solid var(--color-neutral-4); margin: 12px 0;" />
          <div style="font-size: 11px; color: var(--color-neutral-7); line-height: 1.4;">
            Use this block to display instructions, descriptions, or general text content in the form.
          </div>
        </div>
      `;

      if (window.lucide) {
        window.lucide.createIcons();
      }
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
          this.render();
        });
      }
      return;
    }

    // Simplify properties controls if Header (Section Title Divider) is selected
    if (field.type === 'header') {
      this.propertiesEl.innerHTML = `
        <div class="properties-form">
          ${this.renderLocaleSwitcherHTML()}
          <div class="prop-header">
            <i data-lucide="heading"></i>
            <span class="prop-title">${this.translations.propertiesHeaderTitle}</span>
          </div>
          
          <!-- Primary Heading Label -->
          <div class="prop-group">
            <label class="prop-label">${this.translations.sectionTitleLabel}</label>
            <input type="text" id="prop-header-label" class="prop-input" 
                   value="${this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key || field.id, 'label') || '')}" 
                   placeholder="${this.editingLocale === 'default' ? '' : field.label}" />
          </div>
          
          <!-- Secondary Subtitle -->
          <div class="prop-group">
            <label class="prop-label">${this.translations.sectionSubtitleLabel}</label>
            <input type="text" id="prop-header-subtitle" class="prop-input" 
                   value="${this.editingLocale === 'default' ? (field.subtitle || '') : (this.getTranslationValue('fields', field.key || field.id, 'subtitle') || '')}" 
                   placeholder="${this.editingLocale === 'default' ? '' : (field.subtitle || '')}" />
          </div>
          
          <hr style="border: none; border-top: 1px solid var(--color-neutral-4); margin: 12px 0;" />
          <div style="font-size: 11px; color: var(--color-neutral-7); line-height: 1.4;">
            ${this.translations.sectionHeadingHint}
          </div>
        </div>
      `;

      if (window.lucide) {
        window.lucide.createIcons();
      }
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
          this.render();
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
          this.render();
        });
      }
      return;
    }

    // Standard properties forms rendering
    this.propertiesEl.innerHTML = `
      <div class="properties-form" style="max-height: 100%; overflow-y: auto; padding-right: 4px;">
        ${this.renderLocaleSwitcherHTML()}
        <div class="prop-header">
          <i data-lucide="${this.getFieldIcon(field.type)}"></i>
          <span class="prop-title">${this.translations.propertiesFieldTitle}: ${this.getFieldTypeLabel(field.type)}</span>
        </div>
        
        <!-- Label Input -->
        <div class="prop-group">
          <label class="prop-label">${this.translations.fieldLabelLabel}</label>
          <input type="text" id="prop-field-label" class="prop-input" 
                 value="${this.editingLocale === 'default' ? field.label : (this.getTranslationValue('fields', field.key, 'label') || '')}" 
                 placeholder="${this.editingLocale === 'default' ? '' : field.label}" />
        </div>
        
        <!-- Alphanumeric Database Key -->
        <div class="prop-group">
          <label class="prop-label">${this.translations.fieldKeyLabel}</label>
          <input type="text" id="prop-field-key" class="prop-input" value="${field.key}" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--color-neutral-3); cursor: not-allowed;"' : ''} />
          ${this.editingLocale !== 'default' ? `<span style="font-size: 10px; color: var(--color-neutral-7); margin-top: 2px; display: block;">Switch to Default Language to edit database keys.</span>` : ''}
        </div>
        
        <!-- Optional Placeholder -->
        ${'placeholder' in field ? `
        <div class="prop-group">
          <label class="prop-label">${this.translations.fieldPlaceholderLabel}</label>
          <input type="text" id="prop-field-placeholder" class="prop-input" 
                 value="${this.editingLocale === 'default' ? field.placeholder : (this.getTranslationValue('fields', field.key, 'placeholder') || '')}" 
                 placeholder="${this.editingLocale === 'default' ? '' : field.placeholder}" />
        </div>` : ''}

        <!-- Required Field Toggle Checkbox -->
        <div class="prop-group">
          <label class="prop-checkbox-label">
            <input type="checkbox" id="prop-field-required" ${field.required ? 'checked' : ''} 
                   ${this.editingLocale !== 'default' ? 'disabled' : ''} />
            <span>${this.translations.fieldRequiredLabel}</span>
          </label>
        </div>

        <!-- Custom Input Masking (Only applies to text and number inputs) -->
        ${['text', 'number'].includes(field.type) ? `
        <div class="prop-group">
          <label class="prop-label">Custom Input Mask</label>
          <input type="text" id="prop-field-mask" class="prop-input" value="${field.mask || ''}" placeholder="e.g., 999.999.999-99" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--color-neutral-3); cursor: not-allowed;"' : ''} />
          <span style="font-size: 10px; color: var(--color-neutral-7); margin-top: 4px; display: block; line-height: 1.4;">
            Use <strong>9</strong> for digits, <strong>a</strong> for letters, and <strong>*</strong> for alphanumeric. All other characters are literals.
          </span>
        </div>
        
        <div class="prop-group" id="prop-field-mask-clean-group" style="${field.mask ? '' : 'display: none;'}">
          <label class="prop-checkbox-label">
            <input type="checkbox" id="prop-field-mask-clean" ${field.maskCleanValue !== false ? 'checked' : ''} 
                   ${this.editingLocale !== 'default' ? 'disabled' : ''} />
            <span>Save Clean Value? (Strip symbols in answers)</span>
          </label>
        </div>
        ` : ''}

        <!-- Calculated Formula Fields (Only applies to number inputs) -->
        ${field.type === 'number' ? `
        <div class="prop-group">
          <label class="prop-checkbox-label">
            <input type="checkbox" id="prop-field-calculated" ${field.isCalculated ? 'checked' : ''} 
                   ${this.editingLocale !== 'default' ? 'disabled' : ''} />
            <span>Is Calculated Field? (Formula)</span>
          </label>
        </div>
        
        <div class="prop-group" id="prop-field-formula-group" style="${field.isCalculated ? '' : 'display: none;'}">
          <label class="prop-label">Formula Expression</label>
          <input type="text" id="prop-field-formula-expression" class="prop-input" value="${field.formulaExpression || ''}" placeholder="e.g., {preco} * {quantidade}" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--color-neutral-3); cursor: not-allowed;"' : ''} />
          <span style="font-size: 10px; color: var(--color-neutral-7); margin-top: 4px; display: block; line-height: 1.4;">
            Wrap other numeric database keys in curly braces (e.g. <code>{preco}</code>). You can use constants and operations: <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, <code>%</code>, <code>( )</code>, or functions like <code>Math.round(...)</code>.
          </span>
        </div>
        ` : ''}

        <!-- Custom Validation Regex (Only applies to text inputs) -->
        ${field.type === 'text' ? `
        <div class="prop-group">
          <label class="prop-label">${this.translations.fieldRegexLabel}</label>
          <input type="text" id="prop-field-regex" class="prop-input" value="${field.validationRegex || ''}" placeholder="${this.translations.fieldRegexPlaceholder}" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--color-neutral-3); cursor: not-allowed;"' : ''} />
        </div>
        <div class="prop-group">
          <label class="prop-label">${this.translations.fieldRegexErrorLabel}</label>
          <input type="text" id="prop-field-err-msg" class="prop-input" 
                 value="${this.editingLocale === 'default' ? (field.errorMessage || '') : (this.getTranslationValue('fields', field.key, 'errorMessage') || '')}" 
                 placeholder="${this.editingLocale === 'default' ? '' : (field.errorMessage || '')}" />
        </div>` : ''}

        <!-- Custom Accepted Types (Only applies to file uploaders) -->
        ${field.type === 'file' ? `
        <div class="prop-group">
          <label class="prop-label">Accepted Attachment Types</label>
          <input type="text" id="prop-field-accepted-types" class="prop-input" value="${field.acceptedTypes || '.pdf,.docx,image/*'}" placeholder="e.g. .pdf,.docx,image/*" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--color-neutral-3); cursor: not-allowed;"' : ''} />
          <span style="font-size: 10px; color: var(--color-neutral-7); margin-top: 2px;">Comma-separated extensions or mime types (e.g. .pdf,image/*,.docx)</span>
        </div>
        <div class="prop-group">
          <label class="prop-label">File Requirements Text</label>
          <input type="text" id="prop-field-requirements-text" class="prop-input" 
                 value="${this.editingLocale === 'default' ? (field.fileRequirementsText || '') : (this.getTranslationValue('fields', field.key || field.id, 'fileRequirementsText') || '')}" 
                 placeholder="${this.editingLocale === 'default' ? 'e.g. Maximum size 10MB' : (field.fileRequirementsText || 'e.g. Maximum size 10MB')}" />
          <span style="font-size: 10px; color: var(--color-neutral-7); margin-top: 2px;">Help text indicating format/size limits.</span>
        </div>
        <div class="prop-group">
          <label class="prop-label">Maximum File Size (MB)</label>
          <input type="number" id="prop-field-max-size" class="prop-input" 
                 value="${field.maxFileSizeMB !== undefined ? field.maxFileSizeMB : 5}" 
                 placeholder="5" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--color-neutral-3); cursor: not-allowed;"' : ''} />
          <span style="font-size: 10px; color: var(--color-neutral-7); margin-top: 2px;">File size limit in Megabytes.</span>
        <div class="prop-group">
          <label class="prop-checkbox-label">
            <input type="checkbox" id="prop-field-use-native-camera" ${field.useNativeCamera ? 'checked' : ''} 
                   ${this.editingLocale !== 'default' ? 'disabled' : ''} />
            <span>Use Native Camera (Cordova/Capacitor)?</span>
          </label>
        </div>
        <div class="prop-group" id="prop-field-native-camera-source-group" style="${field.useNativeCamera ? '' : 'display: none;'}">
          <label class="prop-label">Native Camera Source</label>
          <select id="prop-field-native-camera-source" class="prop-input" style="padding: 6px 10px;"
                  ${this.editingLocale !== 'default' ? 'disabled style="background: var(--color-neutral-3); cursor: not-allowed;"' : ''}>
            <option value="camera" ${field.nativeCameraSource === 'camera' ? 'selected' : ''}>Camera Only</option>
            <option value="photos" ${field.nativeCameraSource === 'photos' ? 'selected' : ''}>Photo Library Only</option>
            <option value="prompt" ${field.nativeCameraSource === 'prompt' ? 'selected' : ''}>Prompt (Camera or Library)</option>
          </select>
        </div>` : ''}

        <!-- Options Feed Source configurations (dropdown, radios, multi-select checkboxes) -->
        ${['dropdown', 'radio', 'checkbox', 'matrix'].includes(field.type) ? `
        <div class="prop-group">
          <label class="prop-label">${this.translations.fieldOptionsSourceLabel}</label>
          <select id="prop-field-options-type" class="prop-input" style="padding: 6px 10px;" 
                  ${this.editingLocale !== 'default' ? 'disabled style="background: var(--color-neutral-3); cursor: not-allowed;"' : ''}>
            <option value="static" ${field.optionsType === 'static' ? 'selected' : ''}>${this.translations.fieldOptionsStaticLabel}</option>
            <option value="api" ${field.optionsType === 'api' ? 'selected' : ''}>${this.translations.fieldOptionsApiLabel}</option>
          </select>
        </div>
        
        <div id="prop-box-static-options" class="nested-prop-box" style="display: ${field.optionsType === 'static' ? 'flex' : 'none'}; flex-direction: column;">
          ${this.editingLocale === 'default' ? `
            <label class="prop-label">${this.translations.fieldOptionsStaticLabel} (Label, value)</label>
            <textarea id="prop-field-static-options" class="prop-input" style="font-family: monospace; font-size: 11px; height: 80px;" placeholder="${this.translations.fieldOptionsStaticPlaceholder}">${this.serializeStaticOptions(field.options)}</textarea>
            <span style="font-size: 10px; color: var(--color-neutral-7);">${this.translations.fieldOptionsStaticHint}</span>
          ` : `
            <label class="prop-label" style="margin-bottom: 6px;">Translate Option Labels</label>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${(field.options || []).map(opt => `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 11px; flex: 1; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-neutral-7);" title="${opt.label}">${opt.label}:</span>
                  <input type="text" class="prop-input option-translation-input" style="flex: 2; font-size: 11px; padding: 4px 8px; margin-bottom: 0;"
                         data-option-value="${opt.value}" 
                         value="${this.getTranslationValue('fields', field.key, 'options', opt.value) || ''}"
                         placeholder="Translation..." />
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <div id="prop-box-api-options" class="nested-prop-box" style="display: ${field.optionsType === 'api' ? 'flex' : 'none'};">
          <label class="prop-label">${this.translations.fieldOptionsApiUrlLabel}</label>
          <input type="text" id="prop-field-api-url" class="prop-input" value="${field.optionsUrl || ''}" placeholder="${this.translations.fieldOptionsApiUrlPlaceholder}" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--color-neutral-3); cursor: not-allowed;"' : ''} />
          <span style="font-size: 10px; color: var(--color-neutral-7);">${this.translations.fieldOptionsApiUrlHint}</span>
        </div>` : ''}
        <!-- Custom Repeater Configuration (Only applies to repeaters) -->
        ${field.type === 'repeater' ? `
        <div class="prop-group">
          <label class="prop-label">Minimum Items</label>
          <input type="number" id="prop-field-min-items" class="prop-input" value="${field.minItems || 1}" min="0" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--color-neutral-3); cursor: not-allowed;"' : ''} />
        </div>
        <div class="prop-group">
          <label class="prop-label">Maximum Items</label>
          <input type="number" id="prop-field-max-items" class="prop-input" value="${field.maxItems || 10}" min="1" 
                 ${this.editingLocale !== 'default' ? 'disabled style="background: var(--color-neutral-3); cursor: not-allowed;"' : ''} />
        </div>
        <div class="prop-group">
          <label class="prop-label">Add Button Label</label>
          <input type="text" id="prop-field-add-btn-label" class="prop-input" 
                 value="${this.editingLocale === 'default' ? (field.addButtonLabel || 'Add Item') : (this.getTranslationValue('fields', field.key, 'addButtonLabel') || '')}" 
                 placeholder="${this.editingLocale === 'default' ? '' : (field.addButtonLabel || 'Add Item')}" />
        </div>
        
        ` : ''}

        <!-- Custom Matrix Configuration (Only applies to matrix) -->
        ${field.type === 'matrix' ? `
        <hr style="border: none; border-top: 1px solid var(--color-neutral-4); margin: 12px 0;" />
        
        <div class="prop-group">
          <label class="prop-label" style="display: flex; justify-content: space-between; align-items: center;">
            <span>${this.translations.matrixRowsManagerLabel || 'Matrix Rows Manager'}</span>
            <button type="button" class="pg-btn pg-btn-secondary" id="btn-matrix-add-row" style="padding: 2px 6px; font-size: 10px; height: auto;" 
                    ${this.editingLocale !== 'default' ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              <i data-lucide="plus" style="width: 10px; height: 10px;"></i> ${this.translations.matrixAddRowLabel || 'Add Row'}
            </button>
          </label>
          <div class="matrix-rows-list" style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
            ${this.renderMatrixRowsHTML(field)}
          </div>
        </div>
        ` : ''}

        <!-- Advanced Business Rules Panel -->
        ${this.isFieldInsideRepeater(field.id) ? '' : `
        <hr style="border: none; border-top: 1px solid var(--color-neutral-4); margin: 16px 0;" />
        ${this.renderBusinessRulesEditorHTML(field, true)}
        `}

      </div>
    `;

    if (window.lucide) {
      window.lucide.createIcons();
    }

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
        const parts = line.split(':');
        return {
          label: parts[0].trim(),
          value: parts[1].trim()
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
        <div class="matrix-row-card" data-row-index="${index}" style="border: 1px solid var(--color-neutral-4); border-radius: 6px; padding: 10px; background: var(--color-neutral-2); display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: 700; color: var(--color-neutral-8);">Row #${index + 1}</span>
            <button type="button" class="pg-btn pg-btn-secondary matrix-row-delete-btn" style="padding: 2px; color: var(--color-error); border-color: transparent; background: transparent; height: auto;" title="Remove Row">
              <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
            </button>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div class="prop-group" style="margin-bottom: 0;">
              <label class="prop-label" style="font-size: 10px; margin-bottom: 4px;">Label</label>
              <input type="text" class="prop-input matrix-row-label-input" style="font-size: 11px; padding: 4px; margin-bottom: 0;" value="${row.label || ''}" />
            </div>
            <div class="prop-group" style="margin-bottom: 0;">
              <label class="prop-label" style="font-size: 10px; margin-bottom: 4px;">Row Key</label>
              <input type="text" class="prop-input matrix-row-key-input" style="font-size: 11px; padding: 4px; margin-bottom: 0;" value="${row.key || ''}" />
            </div>
          </div>
        </div>
      `).join('');
    } else {
      return `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${field.matrixRows.map((row, index) => `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 11px; flex: 1; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-neutral-7);" title="${row.label}">${row.label}:</span>
              <input type="text" class="prop-input matrix-row-translation-input" style="flex: 2; font-size: 11px; padding: 4px 8px; margin-bottom: 0;"
                     data-row-key="${row.key}" 
                     value="${this.getTranslationValue('fields', field.key, 'matrixRows', row.key) || ''}"
                     placeholder="Translation..." />
            </div>
          `).join('')}
        </div>
      `;
    }
  }



  /**
   * Gathers valid conditional dependency field references (excludes headers and self)
   */
  getConditionalFieldsOptions(currentFieldId, selectedKey) {
    const fields = this.getAllFields().filter(f => f.id !== currentFieldId && f.type !== 'header');
    if (fields.length === 0) {
      return `<option value="">${this.translations.fieldCondNoOtherFields}</option>`;
    }

    return fields.map(f => {
      const isSelected = f.key === selectedKey ? 'selected' : '';
      return `<option value="${f.key}" ${isSelected}>${f.label} (${f.key})</option>`;
    }).join('');
  }

  /**
   * Binds direct property change listeners to update layout schema reactively
   */
  bindPropertiesEvents(field) {
    const updateFieldProperty = (propName, value) => {
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
      this.render();
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
        e.target.value = sanitized;
        updateFieldProperty('key', sanitized);
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
      requiredCheckbox.addEventListener('change', (e) => updateFieldProperty('required', e.target.checked));
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
        this.render();
      });
    }

    // Input Mask clean value checkbox
    const maskCleanCheckbox = this.propertiesEl.querySelector('#prop-field-mask-clean');
    if (maskCleanCheckbox && this.editingLocale === 'default') {
      maskCleanCheckbox.addEventListener('change', (e) => {
        updateFieldProperty('maskCleanValue', e.target.checked);
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
        updateFieldProperty('nativeCameraSource', e.target.value);
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

    // Static Option records text
    const staticOptionsText = this.propertiesEl.querySelector('#prop-field-static-options');
    if (staticOptionsText && this.editingLocale === 'default') {
      staticOptionsText.addEventListener('input', (e) => {
        field.options = this.parseStaticOptions(e.target.value);
        this.notifyChange();
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
        this.render(); // sync canvas
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
            this.render(); // update canvas preview
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
            this.render(); // sync canvas
          });
        });
      }
    }

    // Minimum Items for Repeatable List
    const minItemsInput = this.propertiesEl.querySelector('#prop-field-min-items');
    if (minItemsInput && this.editingLocale === 'default') {
      minItemsInput.addEventListener('change', (e) => {
        updateFieldProperty('minItems', Math.max(0, parseInt(e.target.value) || 0));
      });
    }

    // Maximum Items for Repeatable List
    const maxItemsInput = this.propertiesEl.querySelector('#prop-field-max-items');
    if (maxItemsInput && this.editingLocale === 'default') {
      maxItemsInput.addEventListener('change', (e) => {
        updateFieldProperty('maxItems', Math.max(1, parseInt(e.target.value) || 1));
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
  renderBusinessRulesEditorHTML(entity, isField) {
    if (!entity.conditionalRules) {
      entity.conditionalRules = [];
    }

    let rulesHtml = '';

    entity.conditionalRules.forEach((rule, ruleIndex) => {
      let andGroupsHtml = '';

      rule.andGroups = rule.andGroups || [];
      rule.andGroups.forEach((group, groupIndex) => {
        let conditionsHtml = '';

        group.conditions = group.conditions || [];
        group.conditions.forEach((cond, condIndex) => {
          conditionsHtml += `
            <div class="rules-row" data-rule="${ruleIndex}" data-group="${groupIndex}" data-cond="${condIndex}">
              <select class="prop-input rule-cond-field">
                ${this.getConditionalFieldsOptions(entity.id || '', cond.dependentFieldKey)}
              </select>
              <select class="prop-input rule-cond-operator">
                <option value="equals" ${cond.operator === 'equals' ? 'selected' : ''}>==</option>
                <option value="notEquals" ${cond.operator === 'notEquals' ? 'selected' : ''}>!=</option>
                <option value="contains" ${cond.operator === 'contains' ? 'selected' : ''}>contains</option>
                <option value="notContains" ${cond.operator === 'notContains' ? 'selected' : ''}>not contain</option>
                <option value="greaterThan" ${cond.operator === 'greaterThan' ? 'selected' : ''}>&gt;</option>
                <option value="greaterThanOrEquals" ${cond.operator === 'greaterThanOrEquals' || cond.operator === 'gte' ? 'selected' : ''}>&gt;=</option>
                <option value="lessThan" ${cond.operator === 'lessThan' ? 'selected' : ''}>&lt;</option>
                <option value="lessThanOrEquals" ${cond.operator === 'lessThanOrEquals' || cond.operator === 'lte' ? 'selected' : ''}>&lt;=</option>
              </select>
              <input type="text" class="prop-input rule-cond-value" value="${cond.equalsValue !== undefined ? cond.equalsValue : ''}" placeholder="value" />
              <button type="button" class="pg-btn pg-btn-secondary rule-delete-cond" title="Delete Condition">
                <i data-lucide="x"></i>
              </button>
            </div>
          `;
        });

        if (conditionsHtml === '') {
          conditionsHtml = `<div class="rules-empty-state">No OR conditions. Add one below.</div>`;
        }

        andGroupsHtml += `
          <div class="prop-box-condition and-group-card" data-rule="${ruleIndex}" data-group="${groupIndex}">
            <div class="and-group-header">
              <span class="and-group-title">OR GROUP (ANY MET)</span>
              <button type="button" class="pg-btn pg-btn-secondary rule-delete-group" title="Delete group">
                <i data-lucide="trash-2"></i> Delete Group
              </button>
            </div>
            <div class="conditions-list-container">
              ${conditionsHtml}
            </div>
            <button type="button" class="pg-btn pg-btn-secondary rule-add-cond">
              <i data-lucide="plus"></i> Add OR Condition
            </button>
          </div>
        `;
      });

      if (andGroupsHtml === '') {
        andGroupsHtml = `<div class="rules-empty-state">No AND conditions. Add a group below.</div>`;
      }

      // Render the rule card
      rulesHtml += `
        <div class="rule-card" data-rule="${ruleIndex}">
          <div class="rule-card-header">
            ${isField ? `
              <select class="prop-input rule-target-prop">
                <option value="visibility" ${rule.targetProperty === 'visibility' ? 'selected' : ''}>Show field if...</option>
                <option value="required" ${rule.targetProperty === 'required' ? 'selected' : ''}>Make required if...</option>
                <option value="disabled" ${rule.targetProperty === 'disabled' ? 'selected' : ''}>Disable field if...</option>
              </select>
            ` : `
              <span class="rule-section-title">Show Section if...</span>
            `}
            <button type="button" class="pg-btn pg-btn-secondary rule-delete-rule" title="Delete Rule">
              <i data-lucide="trash-2"></i> Remove Rule
            </button>
          </div>
          <div class="and-groups-list-container">
            ${andGroupsHtml}
          </div>
          <button type="button" class="pg-btn pg-btn-secondary rule-add-group">
            <i data-lucide="plus"></i> Add AND Group
          </button>
        </div>
      `;
    });

    if (rulesHtml === '') {
      rulesHtml = `
        <div class="rules-empty-state rules-empty-panel">
          No conditional business rules defined.
        </div>
      `;
    }

    return `
      <div class="business-rules-panel">
        <h4 class="business-rules-title">
          <i data-lucide="shield"></i> Conditional Business Rules
        </h4>
        <div class="rules-list-container">
          ${rulesHtml}
        </div>
        <button type="button" id="btn-add-business-rule" class="pg-btn pg-btn-secondary btn-add-rule">
          <i data-lucide="plus-circle"></i> Add Business Rule
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
                  dependentFieldKey: this.getAllFields().filter(f => f.id !== entity.id && f.type !== 'header')[0]?.key || '',
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
              dependentFieldKey: this.getAllFields().filter(f => f.id !== entity.id && f.type !== 'header')[0]?.key || '',
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
          dependentFieldKey: this.getAllFields().filter(f => f.id !== entity.id && f.type !== 'header')[0]?.key || '',
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
    if (this.undoStack.length === 0) return;

    // Save current state to redo stack
    this.redoStack.push(JSON.stringify(this.schema));

    // Retrieve previous state
    const previousStateString = this.undoStack.pop();
    this.lastSavedStateString = previousStateString;

    // Apply state
    this.isApplyingHistoryState = true;
    this.schema = JSON.parse(previousStateString);

    // Re-verify index range is valid
    if (this.activePageIndex >= this.schema.pages.length) {
      this.activePageIndex = Math.max(0, this.schema.pages.length - 1);
    }

    this.render();
    this.renderProperties();
    this.notifyChange();
    this.isApplyingHistoryState = false;
  }

  /**
   * Re-applies the next historically recorded template builder state
   */
  redo() {
    if (this.redoStack.length === 0) return;

    // Save current state to undo stack
    this.undoStack.push(JSON.stringify(this.schema));

    // Retrieve next state
    const nextStateString = this.redoStack.pop();
    this.lastSavedStateString = nextStateString;

    // Apply state
    this.isApplyingHistoryState = true;
    this.schema = JSON.parse(nextStateString);

    // Re-verify index range
    if (this.activePageIndex >= this.schema.pages.length) {
      this.activePageIndex = Math.max(0, this.schema.pages.length - 1);
    }

    this.render();
    this.renderProperties();
    this.notifyChange();
    this.isApplyingHistoryState = false;
  }

  /**
   * Binds global keyboard shortcut events for Ctrl/Cmd + Z (Undo) and Ctrl/Cmd + Y / Ctrl/Cmd + Shift + Z (Redo)
   */
  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
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

      if (isCmdOrCtrl) {
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

  /**
   * Renders the cross field validations list for the form
   */
  renderCrossFieldRulesEditorHTML() {
    this.schema.crossFieldRules = this.schema.crossFieldRules || [];

    return `
      <hr style="border: none; border-top: 1px solid var(--color-neutral-4); margin: 16px 0;" />
      <div class="cross-field-rules-section" style="margin-top: 8px;">
        <div style="font-weight: 700; font-size: 12px; color: var(--color-neutral-9); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <i data-lucide="shield-alert" style="width: 14px; height: 14px; color: var(--color-primary);"></i>
          Cross-Field Validations
        </div>
        <div style="font-size: 10px; color: var(--color-neutral-7); margin-bottom: 12px; line-height: 1.3;">
          Define rules combining multiple fields. A failed rule marks target fields as invalid and blocks submission.
        </div>
        
        <div id="cross-rules-list" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
          ${this.schema.crossFieldRules.map((rule, idx) => `
            <div class="rule-card" style="padding: 10px; background: var(--color-neutral-2); border: 1px solid var(--color-neutral-4); border-radius: var(--border-radius-soft); position: relative;">
              <button class="btn-delete-rule" data-index="${idx}" title="Delete rule" style="position: absolute; top: 8px; right: 8px; border: none; background: transparent; color: var(--color-neutral-6); cursor: pointer; display: flex; align-items: center;">
                <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
              </button>
              
              <div class="prop-group" style="margin-bottom: 6px; padding-right: 20px;">
                <label class="prop-label" style="font-size: 9px; text-transform: uppercase;">Expression (e.g. {end} >= {start})</label>
                <input type="text" class="prop-input rule-expression" data-index="${idx}" value="${rule.expression || ''}" placeholder="({endDate} >= {startDate})" style="font-size: 11px; padding: 4px 8px;" />
              </div>
              
              <div class="prop-group" style="margin-bottom: 6px;">
                <label class="prop-label" style="font-size: 9px; text-transform: uppercase;">Error Message</label>
                <input type="text" class="prop-input rule-message" data-index="${idx}" value="${rule.errorMessage || ''}" placeholder="Custom error message..." style="font-size: 11px; padding: 4px 8px;" />
              </div>
              
              <div class="prop-group" style="margin-bottom: 0;">
                <label class="prop-label" style="font-size: 9px; text-transform: uppercase;">Target Fields (Keys, comma separated)</label>
                <input type="text" class="prop-input rule-targets" data-index="${idx}" value="${(rule.targetFields || []).join(', ')}" placeholder="startDate, endDate" style="font-size: 11px; padding: 4px 8px;" />
              </div>
            </div>
          `).join('')}
        </div>
        
        <button id="btn-add-cross-rule" class="pg-btn pg-btn-secondary" style="width: 100%; font-size: 11px; padding: 6px 12px; display: flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer;">
          <i data-lucide="plus" style="width: 12px; height: 12px;"></i> Add Validation Rule
        </button>
      </div>
    `;
  }

  /**
   * Binds change and delete event listeners to the cross field validations list
   */
  bindCrossFieldRulesEvents() {
    // Add validation rule
    const btnAdd = this.propertiesEl.querySelector('#btn-add-cross-rule');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        this.schema.crossFieldRules = this.schema.crossFieldRules || [];
        this.schema.crossFieldRules.push({
          ruleId: `rule-${Math.random().toString(36).substr(2, 9)}`,
          targetFields: [],
          expression: '',
          errorMessage: ''
        });
        this.notifyChange();
        this.renderProperties();
      });
    }

    // Bind expression change
    const expressions = this.propertiesEl.querySelectorAll('.rule-expression');
    expressions.forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        this.schema.crossFieldRules[idx].expression = e.target.value;
        this.notifyChange();
      });
    });

    // Bind message change
    const messages = this.propertiesEl.querySelectorAll('.rule-message');
    messages.forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        this.schema.crossFieldRules[idx].errorMessage = e.target.value;
        this.notifyChange();
      });
    });

    // Bind target fields change
    const targets = this.propertiesEl.querySelectorAll('.rule-targets');
    targets.forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        const cleanTargets = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        this.schema.crossFieldRules[idx].targetFields = cleanTargets;
        this.notifyChange();
      });
    });

    // Bind delete rule
    const deletes = this.propertiesEl.querySelectorAll('.btn-delete-rule');
    deletes.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.btn-delete-rule');
        const idx = parseInt(targetBtn.getAttribute('data-index'));
        this.schema.crossFieldRules.splice(idx, 1);
        this.notifyChange();
        this.renderProperties();
      });
    });
  }
}

// Bind to global namespace
window.OpenFormBuilder = OpenFormBuilder;
