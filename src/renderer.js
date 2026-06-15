/**
 * OpenFormRenderer - The Live Form Player / Renderer
 * Consumes FormSchemaJSON and mounts a reactive, responsive, and validated form
 * strictly matching modern responsive guidelines.
 * Supports Subsections (Section Headers), Pagination (Multi-page), and custom translations input.
 * 
 * Developed by Henrique Silva (contact@hfps.dev)
 * Website: https://hfps.dev
 * License: Apache-2.0
 */
class OpenFormRenderer {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.containerEl Container element of the widget
   * @param {Function} options.onSubmit Callback fired upon successful form submission
   * @param {Function} [options.onFieldChange] Optional callback triggered on real-time field edits
   * @param {Object} [options.translations] Custom translation overrides
   */
  constructor({ containerEl, onSubmit, onFieldChange, translations, locale }) {
    this.containerEl = containerEl;
    this.onSubmit = onSubmit;
    this.onFieldChange = onFieldChange;
    this.locale = locale || 'default';
    this.customTranslationsOverride = translations || {};

    const systemLocales = {
      'pt-BR': {
        formEmptyStructure: "Nenhuma estrutura de formulário definida.",
        formSubmitButton: "Enviar Respostas",
        formPrevPageButton: "Anterior",
        formNextPageButton: "Próximo",
        stepIndicatorPrefix: "Passo",
        stepIndicatorOf: "de",
        stepIndicatorDivider: ":",
        requiredFieldBubble: "Este campo é obrigatório.",
        patternValidationBubble: "Valor incorreto para o padrão exigido.",
        validationToastError: "Por favor, preencha corretamente todos os campos obrigatórios neste passo.",
        validationToastSuccess: "Formulário validado e enviado com sucesso!",
        selectOptionPlaceholder: "Selecione uma opção...",
        dropdownLoading: "Carregando opções da API...",
        radioNoOptions: "Nenhuma opção disponível",
        radioLoading: "Carregando opções...",
        checkboxNoOptions: "Nenhuma opção disponível",
        checkboxLoading: "Carregando opções...",
        signatureInstruction: "Assine no quadro acima",
        signatureClearButton: "Limpar",
        signatureInputVal: "Assinado",
        fileClickToUpload: "Clique para carregar ou arraste arquivos aqui",
        fileTypeRequirements: "PDF, Word, Excel ou Imagens (Máx 5MB)",
        fileTooLargeError: "O arquivo é muito grande. Tamanho máximo permitido: 5MB.",
        fileDeleteTitle: "Excluir arquivo",
        normalizeFormUntitled: "Formulário sem Título",
        normalizePageDefault: "Página"
      },
      'es-ES': {
        formEmptyStructure: "No se ha definido ninguna estructura de formulario.",
        formSubmitButton: "Enviar Respuestas",
        formPrevPageButton: "Anterior",
        formNextPageButton: "Siguiente",
        stepIndicatorPrefix: "Paso",
        stepIndicatorOf: "de",
        stepIndicatorDivider: ":",
        requiredFieldBubble: "Este campo es obligatorio.",
        patternValidationBubble: "Valor incorrecto para el patrón requerido.",
        validationToastError: "Por favor, complete correctamente todos los campos obligatorios en este paso.",
        validationToastSuccess: "¡Formulario validado y enviado con éxito!",
        selectOptionPlaceholder: "Seleccione una opción...",
        dropdownLoading: "Cargando opciones de la API...",
        radioNoOptions: "No hay opciones disponibles",
        radioLoading: "Cargando opciones...",
        checkboxNoOptions: "No hay opciones disponibles",
        checkboxLoading: "Cargando opciones...",
        signatureInstruction: "Firme en el cuadro de arriba",
        signatureClearButton: "Limpiar",
        signatureInputVal: "Firmado",
        fileClickToUpload: "Haga clic para cargar o arrastre archivos aquí",
        fileTypeRequirements: "PDF, Word, Excel o Imágenes (Máx 5MB)",
        fileTooLargeError: "El archivo es demasiado grande. Tamaño máximo permitido: 5MB.",
        fileDeleteTitle: "Eliminar archivo",
        normalizeFormUntitled: "Formulario sin Título",
        normalizePageDefault: "Página"
      }
    };

    const activeSystemTranslations = systemLocales[this.locale] || {};

    // Standard English Translation Dictionary
    this.translations = Object.assign({
      // Error notifications / Toast / Warnings
      formEmptyStructure: "No form structure defined.",
      formSubmitButton: "Submit Answers",
      formPrevPageButton: "Previous",
      formNextPageButton: "Next",
      stepIndicatorPrefix: "Step",
      stepIndicatorOf: "of",
      stepIndicatorDivider: ":",
      requiredFieldBubble: "This field is required.",
      patternValidationBubble: "Incorrect value for the required pattern.",
      validationToastError: "Please correctly fill in all required fields in this step.",
      validationToastSuccess: "Form successfully validated and submitted!",

      // Field widget values
      selectOptionPlaceholder: "Select an option...",
      dropdownLoading: "Loading options from API...",
      radioNoOptions: "No options available",
      radioLoading: "Loading options...",
      checkboxNoOptions: "No options available",
      checkboxLoading: "Loading options...",

      // Signature Pad
      signatureInstruction: "Sign in the box above",
      signatureClearButton: "Clear",
      signatureInputVal: "Signed",

      // File Uploader
      fileClickToUpload: "Click to upload or drag files here",
      fileTypeRequirements: "PDF, Word, Excel or Images (Max 5MB)",
      fileTooLargeError: "The file is too large. Maximum allowed size: 5MB.",
      fileUploaderActiveIcon: "file-check",
      fileDeleteTitle: "Delete file",

      // Normalize schema defaults
      normalizeFormUntitled: "Untitled Form",
      normalizePageDefault: "Page"
    }, activeSystemTranslations, translations || {});

    this.schema = null;
    this.activePageIndex = 0;

    // Live runtime responses
    this.answers = {};

    // Uploaded files and signature tracks
    this.signaturePads = {};
    this.uploadedFiles = {};

    this.buildHTMLShell();
  }

  /**
   * Technical dynamic translations schema value retrieval
   */
  getTranslatedValue(category, targetKey, subCategory, optKey, fallbackVal) {
    const locale = this.locale || 'default';
    if (locale === 'default' || !this.schema || !this.schema.translations || !this.schema.translations[locale]) {
      return fallbackVal;
    }
    const dict = this.schema.translations[locale];
    if (category === 'form') {
      return dict[targetKey] !== undefined ? dict[targetKey] : fallbackVal;
    }
    if (category === 'pages') {
      return (dict.pages && dict.pages[targetKey] && dict.pages[targetKey].title) !== undefined
        ? dict.pages[targetKey].title
        : fallbackVal;
    }
    if (category === 'sections') {
      return (dict.sections && dict.sections[targetKey] && dict.sections[targetKey].title) !== undefined
        ? dict.sections[targetKey].title
        : fallbackVal;
    }
    if (category === 'fields') {
      if (!dict.fields || !dict.fields[targetKey]) return fallbackVal;
      if (subCategory === 'options') {
        return (dict.fields[targetKey].options && dict.fields[targetKey].options[optKey]) !== undefined
          ? dict.fields[targetKey].options[optKey]
          : fallbackVal;
      }
      if (subCategory === 'matrixRows') {
        return (dict.fields[targetKey].matrixRows && dict.fields[targetKey].matrixRows[optKey]) !== undefined
          ? dict.fields[targetKey].matrixRows[optKey]
          : fallbackVal;
      }
      return dict.fields[targetKey][subCategory] !== undefined
        ? dict.fields[targetKey][subCategory]
        : fallbackVal;
    }
    return fallbackVal;
  }

  /**
   * Sets localized translations locale dynamically and redraws player UI reactively
   */
  setLocale(newLocale) {
    this.locale = newLocale || 'default';

    const systemLocales = {
      'pt-BR': {
        formEmptyStructure: "Nenhuma estrutura de formulário definida.",
        formSubmitButton: "Enviar Respostas",
        formPrevPageButton: "Anterior",
        formNextPageButton: "Próximo",
        stepIndicatorPrefix: "Passo",
        stepIndicatorOf: "de",
        stepIndicatorDivider: ":",
        requiredFieldBubble: "Este campo é obrigatório.",
        patternValidationBubble: "Valor incorreto para o padrão exigido.",
        validationToastError: "Por favor, preencha corretamente todos os campos obrigatórios neste passo.",
        validationToastSuccess: "Formulário validado e enviado com sucesso!",
        selectOptionPlaceholder: "Selecione uma opção...",
        dropdownLoading: "Carregando opções da API...",
        radioNoOptions: "Nenhuma opção disponível",
        radioLoading: "Carregando opções...",
        checkboxNoOptions: "Nenhuma opção disponível",
        checkboxLoading: "Carregando opções...",
        signatureInstruction: "Assine no quadro acima",
        signatureClearButton: "Limpar",
        signatureInputVal: "Assinado",
        fileClickToUpload: "Clique para carregar ou arraste arquivos aqui",
        fileTypeRequirements: "PDF, Word, Excel ou Imagens (Máx 5MB)",
        fileTooLargeError: "O arquivo é muito grande. Tamanho máximo permitido: 5MB.",
        fileDeleteTitle: "Excluir arquivo",
        normalizeFormUntitled: "Formulário sem Título",
        normalizePageDefault: "Página"
      },
      'es-ES': {
        formEmptyStructure: "No se ha definido ninguna estructura de formulario.",
        formSubmitButton: "Enviar Respuestas",
        formPrevPageButton: "Anterior",
        formNextPageButton: "Siguiente",
        stepIndicatorPrefix: "Paso",
        stepIndicatorOf: "de",
        stepIndicatorDivider: ":",
        requiredFieldBubble: "Este campo es obligatorio.",
        patternValidationBubble: "Valor incorrecto para el patrón requerido.",
        validationToastError: "Por favor, complete correctamente todos los campos obligatorios en este paso.",
        validationToastSuccess: "¡Formulario validado y enviado con éxito!",
        selectOptionPlaceholder: "Seleccione una opción...",
        dropdownLoading: "Cargando opciones de la API...",
        radioNoOptions: "No hay opciones disponibles",
        radioLoading: "Cargando opciones...",
        checkboxNoOptions: "No hay opciones disponibles",
        checkboxLoading: "Cargando opciones...",
        signatureInstruction: "Firme en el cuadro de arriba",
        signatureClearButton: "Limpiar",
        signatureInputVal: "Firmado",
        fileClickToUpload: "Haga clic para cargar o arrastre archivos aquí",
        fileTypeRequirements: "PDF, Word, Excel o Imágenes (Máx 5MB)",
        fileTooLargeError: "El archivo es demasiado grande. Tamaño máximo permitido: 5MB.",
        fileDeleteTitle: "Eliminar archivo",
        normalizeFormUntitled: "Formulario sin Título",
        normalizePageDefault: "Página"
      }
    };

    const activeSystemTranslations = systemLocales[this.locale] || {};
    const defaultEnglish = {
      formEmptyStructure: "No form structure defined.",
      formSubmitButton: "Submit Answers",
      formPrevPageButton: "Previous",
      formNextPageButton: "Next",
      stepIndicatorPrefix: "Step",
      stepIndicatorOf: "of",
      stepIndicatorDivider: ":",
      requiredFieldBubble: "This field is required.",
      patternValidationBubble: "Incorrect value for the required pattern.",
      validationToastError: "Please correctly fill in all required fields in this step.",
      validationToastSuccess: "Form successfully validated and submitted!",
      selectOptionPlaceholder: "Select an option...",
      dropdownLoading: "Loading options from API...",
      radioNoOptions: "No options available",
      radioLoading: "Loading options...",
      checkboxNoOptions: "No options available",
      checkboxLoading: "Loading options...",
      signatureInstruction: "Sign in the box above",
      signatureClearButton: "Clear",
      signatureInputVal: "Signed",
      fileClickToUpload: "Click to upload or drag files here",
      fileTypeRequirements: "PDF, Word, Excel or Images (Max 5MB)",
      fileTooLargeError: "The file is too large. Maximum allowed size: 5MB.",
      fileUploaderActiveIcon: "file-check",
      fileDeleteTitle: "Delete file",
      normalizeFormUntitled: "Untitled Form",
      normalizePageDefault: "Page"
    };

    this.translations = Object.assign({}, defaultEnglish, activeSystemTranslations, this.customTranslationsOverride || {});
    this.drawActivePage();
  }


  /**
   * Normalizes schema parameters for pagination safety
   */
  normalizeSchema(schema) {
    if (!schema) {
      schema = {
        formTitle: this.translations.normalizeFormUntitled,
        formDescription: "",
        pages: []
      };
    }

    if (!schema.pages && schema.rows) {
      schema.pages = [
        {
          pageId: "page-default",
          title: `${this.translations.normalizePageDefault} 1`,
          rows: schema.rows
        }
      ];
      delete schema.rows;
    }

    if (!schema.pages || !Array.isArray(schema.pages) || schema.pages.length === 0) {
      schema.pages = [
        {
          pageId: "page-default",
          title: `${this.translations.normalizePageDefault} 1`,
          sections: []
        }
      ];
    }

    schema.pages.forEach((page, index) => {
      if (!page.pageId) page.pageId = `page-${Math.random().toString(36).substr(2, 9)}`;
      if (!page.title) page.title = `${this.translations.normalizePageDefault} ${index + 1}`;

      // If page has rows but no sections, wrap them in a default section
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
   * Creates initial wrapper markup
   */
  buildHTMLShell() {
    this.containerEl.innerHTML = `
      <div class="renderer-sandbox">
        <form class="renderer-form-card" novalidate aria-labelledby="renderer-form-title"></form>
      </div>
    `;
    this.formEl = this.containerEl.querySelector('.renderer-form-card');

    // Bind form submit listener exactly once to prevent accumulation
    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!this.readOnly) {
        this.validateAndSubmit();
      }
    });

    // Dynamically inject image lightbox overlay if it doesn't already exist in body
    if (!document.getElementById('lightbox-modal')) {
      const lightboxHtml = `
        <div id="lightbox-modal" class="lightbox-overlay" style="display: none;">
          <div class="lightbox-container">
            <button id="lightbox-close" class="lightbox-close-btn" aria-label="Close Preview">&times;</button>
            <img id="lightbox-image" class="lightbox-img" src="" alt="Attachment Preview" />
            <div class="lightbox-caption" id="lightbox-caption"></div>
          </div>
        </div>
      `;
      const wrapperDiv = document.createElement('div');
      wrapperDiv.innerHTML = lightboxHtml;
      document.body.appendChild(wrapperDiv.firstElementChild);

      // Bind close events
      const lightbox = document.getElementById('lightbox-modal');
      const closeBtn = document.getElementById('lightbox-close');

      if (lightbox && closeBtn) {
        closeBtn.addEventListener('click', () => {
          lightbox.style.display = 'none';
        });
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox) {
            lightbox.style.display = 'none';
          }
        });
      }
    }
  }

  /**
   * Triggers re-rendering of the dynamic form player
   */
  render(schemaJSON, answers = null, readOnly = false) {
    this.readOnly = readOnly;

    // Preserve previously compiled options and uploads across reactive reloads
    const prevAnswers = answers || this.answers || {};
    const prevFiles = this.uploadedFiles || {};
    const prevSignatures = this.signaturePads || {};

    this.schema = this.normalizeSchema(schemaJSON);

    if (typeof this.activePageIndex === 'undefined' || this.activePageIndex >= this.schema.pages.length) {
      this.activePageIndex = 0;
    }

    this.answers = prevAnswers;
    this.uploadedFiles = prevFiles;

    this.recalculateFormulas();
    this.drawActivePage();
  }

  /**
   * Draw selected page contents
   */
  drawActivePage() {
    this.formEl.innerHTML = '';

    if (!this.schema || this.schema.pages.length === 0) {
      this.formEl.innerHTML = `
        <div style="text-align: center; color: var(--color-neutral-7); padding: 32px 0;">
          <i data-lucide="info" style="width: 32px; height: 32px; color: var(--color-neutral-5); margin-bottom: 8px;"></i>
          <p style="font-size: 14px;">${this.translations.formEmptyStructure}</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // 1. Title bar headers
    const headerEl = document.createElement('div');
    headerEl.className = 'renderer-form-header';

    const displayFormTitle = this.getTranslatedValue('form', 'formTitle', null, null, this.schema.formTitle || this.translations.normalizeFormUntitled);
    const displayFormDesc = this.getTranslatedValue('form', 'formDescription', null, null, this.schema.formDescription || '');

    headerEl.innerHTML = `
      <h2 class="renderer-form-title" id="renderer-form-title">${displayFormTitle}</h2>
      ${displayFormDesc ? `<p class="renderer-form-desc">${displayFormDesc}</p>` : ''}
    `;
    this.formEl.appendChild(headerEl);

    // 2. Render multi-page steps bar
    this.renderStepsBar();

    // 3. Render active page rows
    const activePage = this.schema.pages[this.activePageIndex];
    const bodyEl = document.createElement('div');
    bodyEl.className = 'renderer-form-body';
    bodyEl.setAttribute('role', 'tabpanel');
    bodyEl.setAttribute('id', `page-panel-${activePage.pageId}`);
    bodyEl.setAttribute('aria-labelledby', `step-tab-${activePage.pageId}`);
    this.formEl.appendChild(bodyEl);

    (activePage.sections || []).forEach(section => {
      const sectionEl = document.createElement('div');
      sectionEl.className = 'renderer-section';
      sectionEl.setAttribute('data-renderer-section-id', section.sectionId);

      // Render high-fidelity section card header if a valid title is defined (exclude Default Section title)
      const displaySecTitle = this.getTranslatedValue('sections', section.sectionId, null, null, section.title);
      if (displaySecTitle && displaySecTitle !== "Default Section") {
        const secHeader = document.createElement('div');
        secHeader.className = 'renderer-section-header';
        secHeader.innerHTML = `<h3>${displaySecTitle}</h3>`;
        sectionEl.appendChild(secHeader);
      }

      const secBody = document.createElement('div');
      secBody.className = 'renderer-section-body';

      (section.rows || []).forEach(row => {
        if (!row.columns || row.columns.length === 0) return;

        const rowEl = document.createElement('div');
        rowEl.className = 'renderer-row';
        rowEl.setAttribute('data-renderer-row-id', row.rowId);

        row.columns.forEach(col => {
          if (!col.field) return;

          const field = col.field;
          const colEl = document.createElement('div');
          colEl.className = `form-column col-${col.width}`;
          colEl.setAttribute('data-field-id', field.id);
          colEl.setAttribute('data-field-key', field.key || '');

          // Bind default values if uninitialized BEFORE creating the widget wrapper
          if (field.type !== 'header') {
            if (!(field.key in this.answers) || (field.type === 'repeater' && !Array.isArray(this.answers[field.key]))) {
              if (field.type === 'boolean') {
                this.answers[field.key] = field.defaultValue !== undefined ? field.defaultValue : false;
              } else if (field.type === 'repeater') {
                this.answers[field.key] = [];
                const min = field.minItems !== undefined ? field.minItems : 1;
                for (let i = 0; i < min; i++) {
                  this.answers[field.key].push({});
                }
              } else if (field.type === 'matrix') {
                this.answers[field.key] = {};
                (field.matrixRows || []).forEach(row => {
                  this.answers[field.key][row.key] = '';
                });
              } else {
                this.answers[field.key] = '';
              }
            }
          }

          const widgetWrapper = this.createWidgetWrapper(field);
          colEl.appendChild(widgetWrapper);
          rowEl.appendChild(colEl);
        });

        secBody.appendChild(rowEl);
      });

      sectionEl.appendChild(secBody);
      bodyEl.appendChild(sectionEl);
    });

    // 4. Render footer navigation controls
    const navigationEl = document.createElement('div');
    navigationEl.className = 'renderer-navigation-bar';

    const totalPages = this.schema.pages.length;
    if (totalPages <= 1) {
      // Single page submit buttons
      navigationEl.innerHTML = `
        <div></div>
        ${this.readOnly ? '' : `
        <button type="submit" class="pg-btn" style="padding: 10px 24px; font-size: 14px;">
          <i data-lucide="check"></i> ${this.translations.formSubmitButton}
        </button>
        `}
      `;
    } else {
      // Pagination buttons
      const isFirst = this.activePageIndex === 0;
      const isLast = this.activePageIndex === totalPages - 1;

      navigationEl.innerHTML = `
        <button type="button" id="btn-prev-page" class="pg-btn pg-btn-secondary" style="padding: 10px 20px; font-size: 14px; visibility: ${isFirst ? 'hidden' : 'visible'}">
          <i data-lucide="arrow-left"></i> ${this.translations.formPrevPageButton}
        </button>
        
        ${isLast ? (this.readOnly ? '<div></div>' : `
        <button type="submit" class="pg-btn" style="padding: 10px 24px; font-size: 14px;">
          <i data-lucide="check"></i> ${this.translations.formSubmitButton}
        </button>
        `) : `
        <button type="button" id="btn-next-page" class="pg-btn" style="padding: 10px 20px; font-size: 14px;">
          ${this.translations.formNextPageButton} <i data-lucide="arrow-right"></i>
        </button>
        `}
      `;
    }
    this.formEl.appendChild(navigationEl);

    // Bind widgets triggers and visibility rules
    this.bindWidgetsEvents();
    this.evalBusinessRules();

    // Bind page navigator clicks
    if (totalPages > 1) {
      const prevBtn = navigationEl.querySelector('#btn-prev-page');
      const nextBtn = navigationEl.querySelector('#btn-next-page');

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (this.activePageIndex > 0) {
            this.activePageIndex--;
            this.drawActivePage();
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (this.validatePage(this.activePageIndex)) {
            if (this.activePageIndex < totalPages - 1) {
              this.activePageIndex++;
              this.drawActivePage();
            }
          }
        });
      }
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /**
   * Render horizontal progress bar steps (Pagination)
   */
  renderStepsBar() {
    const totalPages = this.schema.pages.length;
    if (totalPages <= 1) return;

    const stepsContainer = document.createElement('div');
    stepsContainer.className = 'renderer-steps-container';

    const stepsBar = document.createElement('div');
    stepsBar.className = 'renderer-steps-bar';
    stepsBar.setAttribute('role', 'tablist');

    // Background span line
    const bgLine = document.createElement('div');
    bgLine.className = 'renderer-steps-line-bg';
    stepsBar.appendChild(bgLine);

    // Dynamic active progress indicator line
    const progressLine = document.createElement('div');
    progressLine.className = 'renderer-steps-line-progress';
    const percent = (this.activePageIndex / (totalPages - 1)) * 100;
    progressLine.style.width = `${percent}%`;
    stepsBar.appendChild(progressLine);

    this.schema.pages.forEach((page, index) => {
      const stepEl = document.createElement('div');
      stepEl.className = 'renderer-step';

      const isActive = index === this.activePageIndex;
      const isCompleted = index < this.activePageIndex;

      if (isActive) stepEl.classList.add('active');
      if (isCompleted) stepEl.classList.add('completed');

      stepEl.setAttribute('role', 'tab');
      stepEl.setAttribute('aria-selected', isActive ? 'true' : 'false');
      stepEl.setAttribute('aria-controls', `page-panel-${page.pageId}`);
      stepEl.setAttribute('tabindex', isActive ? '0' : '-1');
      stepEl.id = `step-tab-${page.pageId}`;

      const bubble = document.createElement('div');
      bubble.className = 'renderer-step-bubble';
      bubble.textContent = index + 1;
      stepEl.appendChild(bubble);

      const label = document.createElement('div');
      label.className = 'renderer-step-label';
      label.textContent = this.getTranslatedValue('pages', page.pageId, null, null, page.title);
      stepEl.appendChild(label);

      // Support clicking past or validated page steps for quick navigation jump
      stepEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (index === this.activePageIndex) return;

        if (index < this.activePageIndex) {
          // Retrograde jumping is always allowed
          this.activePageIndex = index;
          this.drawActivePage();
        } else {
          // Forward jumping demands intermediate steps are valid
          let valid = true;
          for (let i = this.activePageIndex; i < index; i++) {
            if (!this.validatePage(i)) {
              valid = false;
              break;
            }
          }
          if (valid) {
            this.activePageIndex = index;
            this.drawActivePage();
          }
        }
      });

      // Keyboard arrow keys navigation for accessibility compliant WAI-ARIA tabs
      stepEl.addEventListener('keydown', (e) => {
        let targetIdx = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          targetIdx = (index + 1) % totalPages;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          targetIdx = (index - 1 + totalPages) % totalPages;
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          stepEl.click();
          return;
        }

        if (targetIdx !== -1) {
          e.preventDefault();
          const allTabs = stepsBar.querySelectorAll('[role="tab"]');
          const nextTab = allTabs[targetIdx];
          if (nextTab) {
            nextTab.focus();
          }
        }
      });

      stepsBar.appendChild(stepEl);
    });

    stepsContainer.appendChild(stepsBar);

    // Responsive Mobile header (Only renders on mobile breakpoints)
    const mobileHeader = document.createElement('div');
    mobileHeader.className = 'renderer-mobile-step-header';
    const displayPageTitle = this.getTranslatedValue('pages', this.schema.pages[this.activePageIndex].pageId, null, null, this.schema.pages[this.activePageIndex].title);
    mobileHeader.textContent = `${this.translations.stepIndicatorPrefix} ${this.activePageIndex + 1} ${this.translations.stepIndicatorOf} ${totalPages}${this.translations.stepIndicatorDivider} ${displayPageTitle}`;
    stepsContainer.appendChild(mobileHeader);

    this.formEl.appendChild(stepsContainer);
  }

  /**
   * Generates input wrapper with modern responsive classes
   */
  createWidgetWrapper(field) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-input-wrapper';
    wrapper.id = `wrapper-${field.id}`;

    // Field labels (skip for structural dividers)
    if (!['header', 'paragraph'].includes(field.type)) {
      const label = document.createElement('label');
      label.className = `form-label ${field.required ? 'required' : ''}`;
      label.setAttribute('for', `input-${field.id}`);
      label.textContent = this.getTranslatedValue('fields', field.key, 'label', null, field.label);
      wrapper.appendChild(label);
    }

    const container = document.createElement('div');
    container.className = 'form-input-container';
    wrapper.appendChild(container);

    // Widget layouts based on type
    switch (field.type) {
      case 'header':
        wrapper.classList.add('is-header');
        const headerLabel = this.getTranslatedValue('fields', field.key || field.id, 'label', null, field.label);
        const headerSub = this.getTranslatedValue('fields', field.key || field.id, 'subtitle', null, field.subtitle || '');
        container.innerHTML = `
          <div class="form-section-header">
            <h3 class="form-section-title">${headerLabel}</h3>
            ${headerSub ? `<p class="form-section-subtitle">${headerSub}</p>` : ''}
          </div>
        `;
        break;

      case 'paragraph':
        wrapper.classList.add('is-paragraph');
        const displayPara = this.getTranslatedValue('fields', field.key || field.id, 'label', null, field.label);
        container.innerHTML = `
          <div class="form-paragraph-text">
            ${displayPara}
          </div>
        `;
        break;

      case 'text':
        const txtPlaceholder = this.getTranslatedValue('fields', field.key, 'placeholder', null, field.placeholder || '');
        container.innerHTML = `
          <i data-lucide="text-cursor-input" class="form-input-icon"></i>
          <input type="text" id="input-${field.id}" class="form-input" 
                 placeholder="${txtPlaceholder}" ${field.required ? 'required aria-required="true"' : ''}
                 aria-describedby="error-${field.id}" />
        `;
        break;

      case 'textarea':
        const taPlaceholder = this.getTranslatedValue('fields', field.key, 'placeholder', null, field.placeholder || '');
        container.innerHTML = `
          <textarea id="input-${field.id}" class="form-input" rows="4"
                    placeholder="${taPlaceholder}" ${field.required ? 'required aria-required="true"' : ''}
                    aria-describedby="error-${field.id}"></textarea>
        `;
        break;

      case 'number':
        const numPlaceholder = this.getTranslatedValue('fields', field.key, 'placeholder', null, field.placeholder || '0');
        const iconName = field.isCalculated ? 'calculator' : 'binary';
        const readonlyAttr = (field.isCalculated || this.readOnly) ? 'readonly style="background: var(--color-neutral-2); cursor: not-allowed;"' : '';
        container.innerHTML = `
          <i data-lucide="${iconName}" class="form-input-icon"></i>
          <input type="number" id="input-${field.id}" class="form-input" 
                 placeholder="${numPlaceholder}" ${field.required ? 'required aria-required="true"' : ''} ${readonlyAttr}
                 aria-describedby="error-${field.id}" />
        `;
        break;

      case 'date':
        container.innerHTML = `
          <i data-lucide="calendar" class="form-input-icon"></i>
          <input type="date" id="input-${field.id}" class="form-input" ${field.required ? 'required aria-required="true"' : ''}
                 aria-describedby="error-${field.id}" />
        `;
        break;

      case 'boolean':
        container.innerHTML = `
          <label class="form-switch-container">
            <span class="form-switch">
              <input type="checkbox" id="input-${field.id}" ${this.answers[field.key] ? 'checked' : ''}
                     aria-describedby="error-${field.id}" />
              <span class="form-slider"></span>
            </span>
            <span class="form-switch-label" style="font-size: 13px; color: var(--color-neutral-8);">Yes / No</span>
          </label>
        `;
        break;

      case 'dropdown':
        container.innerHTML = `
          <i data-lucide="list-collapse" class="form-input-icon"></i>
          <select id="input-${field.id}" class="form-input" ${field.required ? 'required aria-required="true"' : ''}
                  aria-describedby="error-${field.id}">
            <option value="">${this.translations.selectOptionPlaceholder}</option>
          </select>
        `;
        this.loadDropdownOptions(field, container.querySelector('select'));
        break;

      case 'radio':
        container.innerHTML = `
          <div id="group-${field.id}" class="form-radio-group"></div>
        `;
        this.loadRadioOptions(field, container.querySelector(`#group-${field.id}`));
        break;

      case 'checkbox':
        container.innerHTML = `
          <div id="group-${field.id}" class="form-checkbox-group"></div>
        `;
        this.loadCheckboxOptions(field, container.querySelector(`#group-${field.id}`));
        break;

      case 'signature':
        container.classList.add('is-signature-container');
        container.innerHTML = `
          <div class="form-signature-box ${this.readOnly ? 'is-readonly' : ''}">
            <canvas id="canvas-${field.id}" class="form-signature-canvas" width="500" height="150" role="img" aria-label="Assinatura Digital" style="display: block;"></canvas>
            
            ${this.readOnly ? '' : `
            <div id="type-container-${field.id}" style="display: none; padding: 12px; border-top: 1px solid var(--pg-border); background: var(--color-neutral-2);">
              <label for="type-input-${field.id}" style="font-size: 11px; font-weight: 600; color: var(--color-neutral-7); display: block; margin-bottom: 6px;">Digite seu nome completo:</label>
              <input type="text" id="type-input-${field.id}" class="form-input" placeholder="Seu nome" aria-describedby="error-${field.id}" style="font-family: 'Caveat', cursive; font-size: 20px; font-weight: 500;" />
            </div>
            
            <div class="form-signature-bar">
              <span class="form-signature-indicator" id="indicator-${field.id}">
                <i data-lucide="pen-tool"></i> ${this.translations.signatureInstruction}
              </span>
              <button type="button" id="clear-${field.id}" class="form-signature-clear">
                <i data-lucide="rotate-ccw" style="width: 12px; height: 12px;"></i> ${this.translations.signatureClearButton}
              </button>
            </div>
            `}
          </div>
          ${this.readOnly ? '' : `
          <div class="signature-mode-bar" style="display: flex; gap: 8px; margin-top: 8px;">
            <button type="button" id="mode-draw-${field.id}" class="signature-mode-tab active" style="font-size: 11px; padding: 4px 12px; border-radius: 4px; border: 1px solid var(--pg-border); background: var(--color-neutral-2); color: var(--color-neutral-8); cursor: pointer;">
              <i data-lucide="edit-3" style="width: 12px; height: 12px; vertical-align: middle;"></i> Desenhar
            </button>
            <button type="button" id="mode-type-${field.id}" class="signature-mode-tab" style="font-size: 11px; padding: 4px 12px; border-radius: 4px; border: 1px solid var(--pg-border); background: transparent; color: var(--color-neutral-8); cursor: pointer;">
              <i data-lucide="keyboard" style="width: 12px; height: 12px; vertical-align: middle;"></i> Digitar
            </button>
          </div>
          `}
          <input type="hidden" id="input-${field.id}" ${field.required ? 'required aria-required="true"' : ''} aria-describedby="error-${field.id}" />
        `;
        break;

      case 'file':
        container.innerHTML = `
          <div id="uploader-${field.id}" class="form-file-uploader" style="display: flex;">
            <i data-lucide="upload-cloud"></i>
            <div style="font-size: 13px; font-weight: 600; color: var(--color-neutral-10); margin-bottom: 2px;">
              ${this.translations.fileClickToUpload}
            </div>
            <div style="font-size: 11px; color: var(--color-neutral-7);">${(() => {
            let reqText = this.getTranslatedValue('fields', field.key || field.id, 'fileRequirementsText', null, field.fileRequirementsText || this.translations.fileTypeRequirements);
            if (!field.fileRequirementsText) {
              const maxLimit = field.maxFileSizeMB !== undefined ? field.maxFileSizeMB : 5;
              reqText = reqText.replace('5MB', `${maxLimit}MB`).replace('5 MB', `${maxLimit} MB`);
            }
            return reqText;
          })()}</div>
            <input type="file" id="filepicker-${field.id}" style="display: none;" accept="${field.acceptedTypes || '.pdf,.docx,image/*'}" />
          </div>
          <div id="filedetails-${field.id}" style="display: none;"></div>
          <input type="hidden" id="input-${field.id}" ${field.required ? 'required' : ''} />
        `;
        break;

      case 'repeater':
        container.classList.add('is-repeater-container');
        this.renderRepeaterWidget(field, container);
        break;

      case 'matrix':
        container.innerHTML = `
          <div class="form-matrix-wrapper">
            <table class="form-matrix-table" id="matrix-${field.id}"></table>
          </div>
        `;
        this.loadMatrixWidget(field, container.querySelector(`#matrix-${field.id}`));
        break;
    }

    // Required warning messages
    if (!['header', 'paragraph'].includes(field.type)) {
      const errorEl = document.createElement('span');
      errorEl.className = 'form-error-message';
      errorEl.id = `error-${field.id}`;
      errorEl.setAttribute('role', 'alert');
      errorEl.innerHTML = `<i data-lucide="alert-circle"></i> ${this.translations.requiredFieldBubble}`;
      wrapper.appendChild(errorEl);
    }

    return wrapper;
  }

  /**
   * Load options feed inside dropdown elements
   */
  loadDropdownOptions(field, selectEl) {
    const selectedVal = this.answers[field.key] || "";

    if (field.optionsType === 'static') {
      if (Array.isArray(field.options)) {
        field.options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = this.getTranslatedValue('fields', field.key, 'options', opt.value, opt.label);
          if (opt.value === selectedVal) o.selected = true;
          selectEl.appendChild(o);
        });
      }
    } else if (field.optionsType === 'api') {
      const url = (field.optionsUrl || '').trim().toLowerCase();

      const optionLoading = document.createElement('option');
      optionLoading.value = "";
      optionLoading.textContent = this.translations.dropdownLoading;
      selectEl.appendChild(optionLoading);
      selectEl.setAttribute('aria-busy', 'true');

      setTimeout(() => {
        optionLoading.remove();
        let apiOptions = [];

        if (url.includes('countries') || url.includes('paises')) {
          apiOptions = [
            { label: "Portugal", value: "PT" },
            { label: "Brazil", value: "BR" },
            { label: "United States", value: "US" },
            { label: "Spain", value: "ES" }
          ];
        } else if (url.includes('departments') || url.includes('departamentos') || url.includes('setores')) {
          apiOptions = [
            { label: "General Maintenance", value: "maintenance" },
            { label: "Work Safety", value: "safety" },
            { label: "IT / Engineering", value: "it" },
            { label: "Operations", value: "operations" }
          ];
        } else {
          apiOptions = [
            { label: "Mock Option 1 (API)", value: "mock1" },
            { label: "Mock Option 2 (API)", value: "mock2" }
          ];
        }

        apiOptions.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = opt.label;
          if (opt.value === selectedVal) o.selected = true;
          selectEl.appendChild(o);
        });
        selectEl.removeAttribute('aria-busy');
      }, 500);
    }
  }

  /**
   * Load options for Radio Buttons
   */
  loadRadioOptions(field, groupEl) {
    const selectedVal = this.answers[field.key] || "";

    const renderRadioItems = (options) => {
      groupEl.innerHTML = '';
      if (!Array.isArray(options) || options.length === 0) {
        groupEl.innerHTML = `<span class="form-options-empty">${this.translations.radioNoOptions}</span>`;
        return;
      }

      options.forEach((opt, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'form-radio-item';

        const radioId = `radio-${field.id}-${idx}`;
        const isChecked = opt.value === selectedVal;

        const displayOptLabel = field.optionsType === 'static'
          ? this.getTranslatedValue('fields', field.key, 'options', opt.value, opt.label)
          : opt.label;

        itemEl.innerHTML = `
          <input type="radio" id="${radioId}" name="radio-${field.id}" value="${opt.value}" class="form-radio-input" ${isChecked ? 'checked' : ''} ${this.readOnly ? 'disabled' : ''} aria-describedby="error-${field.id}" />
          <label for="${radioId}" class="form-radio-label">${displayOptLabel}</label>
        `;

        const radioInput = itemEl.querySelector('input');
        if (!this.readOnly) {
          radioInput.addEventListener('change', () => {
            this.answers[field.key] = opt.value;
            this.handleFieldChanged(field.key);

            const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
            if (wrapper) {
              wrapper.classList.remove('is-invalid');
            }
          });
        }

        groupEl.appendChild(itemEl);
      });
    };

    if (field.optionsType === 'static') {
      renderRadioItems(field.options || []);
    } else if (field.optionsType === 'api') {
      const url = (field.optionsUrl || '').trim().toLowerCase();
      groupEl.innerHTML = `<span class="form-options-loading">${this.translations.radioLoading}</span>`;
      groupEl.setAttribute('aria-busy', 'true');

      setTimeout(() => {
        let apiOptions = [];
        if (url.includes('countries') || url.includes('paises')) {
          apiOptions = [
            { label: "Portugal", value: "PT" },
            { label: "Brazil", value: "BR" },
            { label: "United States", value: "US" },
            { label: "Spain", value: "ES" }
          ];
        } else if (url.includes('departments') || url.includes('departamentos') || url.includes('setores')) {
          apiOptions = [
            { label: "General Maintenance", value: "maintenance" },
            { label: "Work Safety", value: "safety" },
            { label: "IT / Engineering", value: "it" },
            { label: "Operations", value: "operations" }
          ];
        } else {
          apiOptions = [
            { label: "Mock Option 1 (API)", value: "mock1" },
            { label: "Mock Option 2 (API)", value: "mock2" }
          ];
        }
        renderRadioItems(apiOptions);
        groupEl.removeAttribute('aria-busy');
      }, 500);
    }
  }

  /**
   * Load options for Checkboxes (Multi-Select groups)
   */
  loadCheckboxOptions(field, groupEl) {
    const selectedVals = Array.isArray(this.answers[field.key]) ? this.answers[field.key] : [];

    const renderCheckboxItems = (options) => {
      groupEl.innerHTML = '';
      if (!Array.isArray(options) || options.length === 0) {
        groupEl.innerHTML = `<span class="form-options-empty">${this.translations.checkboxNoOptions}</span>`;
        return;
      }

      options.forEach((opt, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'form-checkbox-item';

        const checkboxId = `checkbox-${field.id}-${idx}`;
        const isChecked = selectedVals.includes(opt.value);

        const displayOptLabel = field.optionsType === 'static'
          ? this.getTranslatedValue('fields', field.key, 'options', opt.value, opt.label)
          : opt.label;

        itemEl.innerHTML = `
          <input type="checkbox" id="${checkboxId}" name="checkbox-${field.id}" value="${opt.value}" class="form-checkbox-input" ${isChecked ? 'checked' : ''} ${this.readOnly ? 'disabled' : ''} aria-describedby="error-${field.id}" />
          <label for="${checkboxId}" class="form-checkbox-label">${displayOptLabel}</label>
        `;

        const checkboxInput = itemEl.querySelector('input');
        if (!this.readOnly) {
          checkboxInput.addEventListener('change', () => {
            let currentVals = Array.isArray(this.answers[field.key]) ? [...this.answers[field.key]] : [];
            if (checkboxInput.checked) {
              if (!currentVals.includes(opt.value)) {
                currentVals.push(opt.value);
              }
            } else {
              currentVals = currentVals.filter(v => v !== opt.value);
            }
            this.answers[field.key] = currentVals;
            this.handleFieldChanged(field.key);

            const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
            if (wrapper && currentVals.length > 0) {
              wrapper.classList.remove('is-invalid');
            }
          });
        }

        groupEl.appendChild(itemEl);
      });
    };

    if (field.optionsType === 'static') {
      renderCheckboxItems(field.options || []);
    } else if (field.optionsType === 'api') {
      const url = (field.optionsUrl || '').trim().toLowerCase();
      groupEl.innerHTML = `<span class="form-options-loading">${this.translations.checkboxLoading}</span>`;
      groupEl.setAttribute('aria-busy', 'true');

      setTimeout(() => {
        let apiOptions = [];
        if (url.includes('countries') || url.includes('paises')) {
          apiOptions = [
            { label: "Portugal", value: "PT" },
            { label: "Brazil", value: "BR" },
            { label: "United States", value: "US" },
            { label: "Spain", value: "ES" }
          ];
        } else if (url.includes('departments') || url.includes('departamentos') || url.includes('setores')) {
          apiOptions = [
            { label: "General Maintenance", value: "maintenance" },
            { label: "Work Safety", value: "safety" },
            { label: "IT / Engineering", value: "it" },
            { label: "Operations", value: "operations" }
          ];
        } else {
          apiOptions = [
            { label: "Mock Option 1 (API)", value: "mock1" },
            { label: "Mock Option 2 (API)", value: "mock2" }
          ];
        }
        renderCheckboxItems(apiOptions);
        groupEl.removeAttribute('aria-busy');
      }, 500);
    }
  }

  /**
   * Load options and structure for Question Matrix
   */
  loadMatrixWidget(field, tableEl) {
    const selectedVals = this.answers[field.key] || {};

    const renderMatrixTable = (options) => {
      tableEl.innerHTML = '';

      if (!Array.isArray(options) || options.length === 0) {
        tableEl.innerHTML = `<tr><td class="form-options-empty">${this.translations.radioNoOptions}</td></tr>`;
        return;
      }

      // Generate localized headers
      const displayHeaders = options.map(opt => {
        return field.optionsType === 'static'
          ? this.getTranslatedValue('fields', field.key, 'options', opt.value, opt.label)
          : opt.label;
      });

      // 1. thead
      const thead = document.createElement('thead');
      const headerTr = document.createElement('tr');

      const emptyTh = document.createElement('th');
      emptyTh.className = 'form-matrix-th-label';
      emptyTh.innerHTML = '&nbsp;';
      headerTr.appendChild(emptyTh);

      displayHeaders.forEach(lbl => {
        const th = document.createElement('th');
        th.className = 'form-matrix-th-option';
        th.textContent = lbl;
        headerTr.appendChild(th);
      });
      thead.appendChild(headerTr);
      tableEl.appendChild(thead);

      // 2. tbody
      const tbody = document.createElement('tbody');
      const rows = field.matrixRows || [];

      rows.forEach((row, rowIdx) => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-row-key', row.key);

        const labelTd = document.createElement('td');
        labelTd.className = 'form-matrix-row-label';

        // Translate row label
        const displayRowLabel = this.getTranslatedValue('fields', field.key, 'matrixRows', row.key, row.label);
        labelTd.textContent = displayRowLabel;
        tr.appendChild(labelTd);

        options.forEach((opt, optIdx) => {
          const td = document.createElement('td');
          td.className = 'form-matrix-cell';

          const radioId = `matrix-radio-${field.id}-${row.key}-${optIdx}`;
          const isChecked = selectedVals[row.key] === opt.value;
          const displayOptLabel = field.optionsType === 'static'
            ? this.getTranslatedValue('fields', field.key, 'options', opt.value, opt.label)
            : opt.label;

          td.innerHTML = `
            <label class="form-matrix-radio-label" for="${radioId}">
              <input type="radio" id="${radioId}" name="matrix-${field.id}-${row.key}" value="${opt.value}" class="form-radio-input" ${isChecked ? 'checked' : ''} ${this.readOnly ? 'disabled' : ''} />
              <span class="matrix-cell-mobile-text">${displayOptLabel}</span>
            </label>
          `;

          const radioInput = td.querySelector('input');
          if (!this.readOnly) {
            radioInput.addEventListener('change', () => {
              if (!this.answers[field.key]) {
                this.answers[field.key] = {};
              }
              this.answers[field.key][row.key] = opt.value;
              this.handleFieldChanged(field.key);

              // Remove invalid warning classes if fully answered
              const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
              if (wrapper) {
                const allRowsAnswered = (field.matrixRows || []).every(r => {
                  const val = this.answers[field.key] && this.answers[field.key][r.key];
                  return val !== undefined && val !== null && String(val).trim() !== '';
                });
                if (allRowsAnswered) {
                  wrapper.classList.remove('is-invalid');
                }
              }
            });
          }

          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      tableEl.appendChild(tbody);
    };

    if (field.optionsType === 'static') {
      renderMatrixTable(field.options || []);
    } else if (field.optionsType === 'api') {
      const url = (field.optionsUrl || '').trim().toLowerCase();
      tableEl.innerHTML = `<tr><td class="form-options-loading">${this.translations.radioLoading}</td></tr>`;
      tableEl.setAttribute('aria-busy', 'true');

      setTimeout(() => {
        let apiOptions = [];
        if (url.includes('countries') || url.includes('paises')) {
          apiOptions = [
            { label: "Portugal", value: "PT" },
            { label: "Brazil", value: "BR" },
            { label: "United States", value: "US" },
            { label: "Spain", value: "ES" }
          ];
        } else if (url.includes('departments') || url.includes('departamentos') || url.includes('setores')) {
          apiOptions = [
            { label: "General Maintenance", value: "maintenance" },
            { label: "Work Safety", value: "safety" },
            { label: "IT / Engineering", value: "it" },
            { label: "Operations", value: "operations" }
          ];
        } else {
          apiOptions = [
            { label: "Mock Option 1 (API)", value: "mock1" },
            { label: "Mock Option 2 (API)", value: "mock2" }
          ];
        }
        renderMatrixTable(apiOptions);
        tableEl.removeAttribute('aria-busy');
      }, 500);
    }
  }

  /**
   * Bind event triggers and input monitors to player inputs
   */
  bindWidgetsEvents() {
    const activePage = this.schema.pages[this.activePageIndex];
    (activePage.sections || []).forEach(section => {
      (section.rows || []).forEach(row => {
        row.columns.forEach(col => {
          if (!col.field) return;
          const field = col.field;

          if (field.type === 'header') return;

          const inputEl = this.formEl.querySelector(`#input-${field.id}`);

          if (inputEl) {
            // Pre-populate answers
            if (field.type !== 'boolean' && field.type !== 'signature' && field.type !== 'file') {
              let val = this.answers[field.key] || '';
              if (field.mask && val) {
                val = this.applyMask(String(val), field.mask);
              }
              inputEl.value = val;
            }

            if (this.readOnly) {
              inputEl.disabled = true;
            }

            if (field.type === 'boolean') {
              if (!this.readOnly) {
                inputEl.addEventListener('change', (e) => {
                  this.answers[field.key] = e.target.checked;
                  this.handleFieldChanged(field.key);
                });
              }
            } else {
              if (!this.readOnly) {
                const eventName = ['text', 'textarea', 'number'].includes(field.type) ? 'input' : 'change';
                inputEl.addEventListener(eventName, (e) => {
                  let rawVal = e.target.value;

                  if (field.mask && ['text', 'number'].includes(field.type)) {
                    const formatted = this.applyMask(rawVal, field.mask);

                    const start = e.target.selectionStart;
                    const oldLen = rawVal.length;
                    e.target.value = formatted;

                    const newLen = formatted.length;
                    e.target.selectionStart = e.target.selectionEnd = start + (newLen - oldLen);

                    if (field.maskCleanValue !== false) {
                      this.answers[field.key] = this.getCleanValue(formatted, field.mask);
                    } else {
                      this.answers[field.key] = formatted;
                    }
                  } else {
                    this.answers[field.key] = rawVal;
                  }

                  this.handleFieldChanged(field.key);

                  const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
                  if (wrapper && e.target.value.trim() !== '') {
                    wrapper.classList.remove('is-invalid');
                  }
                });
              }
            }
          }

          // Initialize Signature
          if (field.type === 'signature') {
            this.initSignatureCanvas(field);
          }

          // Initialize File Uploaders
          if (field.type === 'file') {
            this.initFileUploader(field);
          }
        });
      });
    });
  }

  handleFieldChanged(changedFieldKey) {
    this.recalculateFormulas();
    this.evalBusinessRules();
    if (this.onFieldChange) {
      this.onFieldChange(this.answers);
    }
  }

  /**
   * Evaluates individual conditional rules operator logic
   */
  isConditionSatisfied(cond) {
    if (!cond || !cond.dependentFieldKey) return false;

    const dependentVal = this.answers[cond.dependentFieldKey];
    const targetVal = cond.equalsValue;

    switch (cond.operator) {
      case 'equals':
        return (dependentVal === targetVal || String(dependentVal) === String(targetVal));
      case 'notEquals':
        return (dependentVal !== targetVal && String(dependentVal) !== String(targetVal));
      case 'contains':
        return String(dependentVal || '').toLowerCase().includes(String(targetVal || '').toLowerCase());
      case 'notContains':
        return !String(dependentVal || '').toLowerCase().includes(String(targetVal || '').toLowerCase());
      case 'greaterThan':
        return Number(dependentVal) > Number(targetVal);
      case 'greaterThanOrEquals':
      case 'gte':
        return Number(dependentVal) >= Number(targetVal);
      case 'lessThan':
        return Number(dependentVal) < Number(targetVal);
      case 'lessThanOrEquals':
      case 'lte':
        return Number(dependentVal) <= Number(targetVal);
      default:
        return (dependentVal === targetVal || String(dependentVal) === String(targetVal));
    }
  }

  /**
   * Evaluates the CNF format: all outer AND groups must be met.
   * For each AND group, at least one inner condition must be met (OR).
   */
  isRuleSatisfied(rule) {
    if (!rule || !rule.andGroups || rule.andGroups.length === 0) return false;

    for (const group of rule.andGroups) {
      if (!group.conditions || group.conditions.length === 0) {
        return false;
      }

      let groupSatisfied = false;
      for (const cond of group.conditions) {
        if (this.isConditionSatisfied(cond)) {
          groupSatisfied = true;
          break;
        }
      }

      if (!groupSatisfied) {
        return false;
      }
    }

    return true;
  }

  /**
   * Helper that checks if a field has a non-default/non-empty value in answers
   */
  hasNonDefaultValue(field) {
    const val = this.answers[field.key];
    if (val === undefined || val === null) return false;

    if (field.type === 'boolean') {
      const def = field.defaultValue !== undefined ? field.defaultValue : false;
      return val !== def;
    } else if (field.type === 'repeater') {
      const min = field.minItems !== undefined ? field.minItems : 1;
      if (!Array.isArray(val)) return true;
      if (val.length !== min) return true;
      return val.some(item => Object.keys(item).length > 0);
    } else if (field.type === 'matrix') {
      if (typeof val !== 'object') return true;
      return Object.values(val).some(v => v !== undefined && v !== null && v !== '');
    } else if (field.type === 'checkbox') {
      return Array.isArray(val) ? val.length > 0 : val !== '';
    } else {
      return val !== '';
    }
  }

  /**
   * Resets the value of a hidden field in answers and synchronized its DOM inputs
   */
  clearFieldState(field) {
    // 1. Reset value in answers
    if (field.type === 'boolean') {
      this.answers[field.key] = field.defaultValue !== undefined ? field.defaultValue : false;
    } else if (field.type === 'repeater') {
      this.answers[field.key] = [];
      const min = field.minItems !== undefined ? field.minItems : 1;
      for (let i = 0; i < min; i++) {
        this.answers[field.key].push({});
      }
      // Delete any scoped getter/setter properties defined on this.answers
      Object.keys(this.answers).forEach(k => {
        if (k.startsWith(`sub-${field.id}-`)) {
          delete this.answers[k];
        }
      });
    } else if (field.type === 'matrix') {
      this.answers[field.key] = {};
      (field.matrixRows || []).forEach(row => {
        this.answers[field.key][row.key] = '';
      });
    } else {
      this.answers[field.key] = '';
    }

    // 2. Synchronize DOM element states if rendered in the document
    const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
    if (!wrapper) return;

    if (field.type === 'boolean') {
      const checkbox = wrapper.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = this.answers[field.key];
      }
    } else if (field.type === 'repeater') {
      const container = wrapper.querySelector('.form-repeater-container');
      if (container) {
        container.innerHTML = '';
        this.renderRepeaterWidget(field, container);
      }
    } else if (field.type === 'matrix') {
      const radios = wrapper.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        radio.checked = false;
      });
    } else if (field.type === 'signature') {
      const padState = this.signaturePads[field.id];
      if (padState) {
        padState.ctx.clearRect(0, 0, padState.canvas.width, padState.canvas.height);
        padState.hasDrawn = false;
      }
      const hiddenInput = wrapper.querySelector(`#input-${field.id}`);
      if (hiddenInput) hiddenInput.value = '';
      const typeInput = wrapper.querySelector(`#type-input-${field.id}`);
      if (typeInput) typeInput.value = '';
    } else if (field.type === 'file') {
      delete this.uploadedFiles[field.id];
      const details = wrapper.querySelector(`#filedetails-${field.id}`);
      const uploader = wrapper.querySelector(`#uploader-${field.id}`);
      const hiddenInput = wrapper.querySelector(`#input-${field.id}`);
      const picker = wrapper.querySelector(`#filepicker-${field.id}`);
      if (details) details.style.display = 'none';
      if (uploader) uploader.style.display = 'flex';
      if (hiddenInput) hiddenInput.value = '';
      if (picker) picker.value = '';
    } else if (field.type === 'dropdown') {
      const select = wrapper.querySelector('select');
      if (select) {
        select.value = '';
      }
    } else if (field.type === 'radio') {
      const radios = wrapper.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        radio.checked = false;
      });
    } else if (field.type === 'checkbox') {
      const checkboxes = wrapper.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => {
        cb.checked = false;
      });
    } else {
      const input = wrapper.querySelector('input, textarea');
      if (input) {
        input.value = '';
      }
    }
  }

  /**
   * Main reactive pipeline that evaluates business rules for sections and fields
   */
  evalBusinessRules() {
    const activePage = this.schema.pages[this.activePageIndex];
    if (!activePage) return;

    let changed = true;
    let iterations = 0;
    const maxIterations = 10;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      this.fieldVisibilityStates = {};
      this.fieldRequiredStates = {};
      this.fieldDisabledStates = {};
      this.sectionVisibilityStates = {};

      // 1. Evaluate Section Visibilities
      (activePage.sections || []).forEach(section => {
        const rules = section.conditionalRules || [];
        const hasVisibilityRules = rules.some(r => r.targetProperty === 'visibility');

        let isVisible = true;
        if (hasVisibilityRules) {
          isVisible = rules.filter(r => r.targetProperty === 'visibility').some(r => this.isRuleSatisfied(r));
        }

        this.sectionVisibilityStates[section.sectionId] = isVisible;

        const sectionEl = this.formEl.querySelector(`.renderer-section[data-renderer-section-id="${section.sectionId}"]`);
        if (sectionEl) {
          sectionEl.style.display = isVisible ? 'block' : 'none';
        }
      });

      // 2. Evaluate Field mutabilities
      (activePage.sections || []).forEach(section => {
        const isSecVisible = this.sectionVisibilityStates[section.sectionId];

        (section.rows || []).forEach(row => {
          (row.columns || []).forEach(col => {
            if (!col.field) return;
            const field = col.field;
            const rules = field.conditionalRules || [];

            // 2a. Visibility
            const hasVisRules = rules.some(r => r.targetProperty === 'visibility');
            let isFieldVisible = true;
            if (hasVisRules) {
              isFieldVisible = rules.filter(r => r.targetProperty === 'visibility').some(r => this.isRuleSatisfied(r));
            }
            const overallVisible = isSecVisible && isFieldVisible;
            this.fieldVisibilityStates[field.id] = overallVisible;

            const colEl = this.formEl.querySelector(`.form-column[data-field-id="${field.id}"]`);
            if (colEl) {
              colEl.style.display = overallVisible ? 'block' : 'none';
            }

            // Clear value if field became invisible
            if (!overallVisible && field.type !== 'header') {
              if (this.hasNonDefaultValue(field)) {
                this.clearFieldState(field);
                changed = true;
              }
            }

            // 2b. Required
            const hasReqRules = rules.some(r => r.targetProperty === 'required');
            let isRequired = field.required || false;
            if (hasReqRules) {
              isRequired = rules.filter(r => r.targetProperty === 'required').some(r => this.isRuleSatisfied(r));
            }
            this.fieldRequiredStates[field.id] = isRequired;

            const fieldWrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
            if (fieldWrapper) {
              const labelEl = fieldWrapper.querySelector('.prop-label');
              if (labelEl) {
                const asterisk = labelEl.querySelector('.required-asterisk');
                if (isRequired) {
                  if (!asterisk) {
                    const astSpan = document.createElement('span');
                    astSpan.className = 'required-asterisk';
                    astSpan.style.color = 'var(--color-error)';
                    astSpan.style.marginLeft = '2px';
                    astSpan.textContent = '*';
                    labelEl.appendChild(astSpan);
                  }
                } else {
                  if (asterisk) {
                    asterisk.remove();
                  }
                }
              }

              const inputs = fieldWrapper.querySelectorAll('input, select, textarea');
              inputs.forEach(input => {
                if (isRequired) {
                  input.setAttribute('required', 'required');
                } else {
                  input.removeAttribute('required');
                }
              });
            }

            // 2c. Disabled
            const hasDisRules = rules.some(r => r.targetProperty === 'disabled');
            let isDisabled = field.disabled || false;
            if (hasDisRules) {
              isDisabled = rules.filter(r => r.targetProperty === 'disabled').some(r => this.isRuleSatisfied(r));
            }
            this.fieldDisabledStates[field.id] = isDisabled;

            if (fieldWrapper) {
              if (isDisabled) {
                fieldWrapper.classList.add('is-disabled');
              } else {
                fieldWrapper.classList.remove('is-disabled');
              }
              const inputs = fieldWrapper.querySelectorAll('input, select, textarea, button');
              inputs.forEach(input => {
                if (isDisabled) {
                  input.setAttribute('disabled', 'disabled');
                } else {
                  if (!this.readOnly) {
                    input.removeAttribute('disabled');
                  }
                }
              });
            }
          });
        });
      });

      // 3. Evaluate Row Visibilities (Hide row if all fields inside it are hidden)
      (activePage.sections || []).forEach(section => {
        (section.rows || []).forEach(row => {
          const rowEl = this.formEl.querySelector(`.renderer-row[data-renderer-row-id="${row.rowId}"]`);
          if (rowEl) {
            let isRowVisible = false;
            (row.columns || []).forEach(col => {
              if (col.field) {
                if (this.fieldVisibilityStates[col.field.id] === true) {
                  isRowVisible = true;
                }
              }
            });
            rowEl.style.display = isRowVisible ? 'grid' : 'none';
          }
        });
      });
    }
  }

  /**
   * Helper that evaluates if a field is active, visible, and enabled in the final schema
   */
  isFieldActiveInSchema(field, section) {
    if (section) {
      const secRules = section.conditionalRules || [];
      const hasSecVisRules = secRules.some(r => r.targetProperty === 'visibility');
      if (hasSecVisRules) {
        const secVisible = secRules.filter(r => r.targetProperty === 'visibility').some(r => this.isRuleSatisfied(r));
        if (!secVisible) return false;
      }
    }

    const rules = field.conditionalRules || [];
    const hasVisRules = rules.some(r => r.targetProperty === 'visibility');
    if (hasVisRules) {
      const fieldVisible = rules.filter(r => r.targetProperty === 'visibility').some(r => this.isRuleSatisfied(r));
      if (!fieldVisible) return false;
    }

    const hasDisRules = rules.some(r => r.targetProperty === 'disabled');
    if (hasDisRules) {
      const fieldDisabled = rules.filter(r => r.targetProperty === 'disabled').some(r => this.isRuleSatisfied(r));
      if (fieldDisabled) return false;
    }
    if (field.disabled) return false;

    return true;
  }

  /**
   * Initializes high-fidelity touch canvas for Signature widgets
   */
  initSignatureCanvas(field) {
    // Dynamic loading of Caveat handwriting font for accessibility fallback typed signatures
    if (!document.getElementById('form-handwriting-font')) {
      const link = document.createElement('link');
      link.id = 'form-handwriting-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap';
      document.head.appendChild(link);
    }

    const canvas = this.formEl.querySelector(`#canvas-${field.id}`);
    const clearBtn = this.formEl.querySelector(`#clear-${field.id}`);
    const hiddenInput = this.formEl.querySelector(`#input-${field.id}`);

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const padState = {
      canvas,
      ctx,
      isDrawing: false,
      hasDrawn: false,
      mode: 'draw'
    };

    this.signaturePads[field.id] = padState;

    const existingSignature = this.answers[field.key];
    if (existingSignature && existingSignature.startsWith('data:image')) {
      hiddenInput.value = this.translations.signatureInputVal;
      padState.hasDrawn = true;
    }

    // ResizeObserver tracks dynamic canvas scaling rules
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            const currentSignature = this.answers[field.key];

            canvas.width = width;
            canvas.height = height;

            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (currentSignature && currentSignature.startsWith('data:image')) {
              const img = new Image();
              img.onload = () => {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              };
              img.src = currentSignature;
            }
          }
        }
      });
      resizeObserver.observe(canvas);
      padState.resizeObserver = resizeObserver;
    } else {
      // Fallback
      canvas.width = canvas.offsetWidth || 500;
      canvas.height = canvas.offsetHeight || 150;
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (existingSignature && existingSignature.startsWith('data:image')) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = existingSignature;
      }
    }

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (e.touches && e.touches.length > 0) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const startDraw = (e) => {
      if (this.fieldDisabledStates && this.fieldDisabledStates[field.id]) return;
      e.preventDefault();
      padState.isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!padState.isDrawing) return;
      if (this.fieldDisabledStates && this.fieldDisabledStates[field.id]) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      padState.hasDrawn = true;

      const dataUrl = canvas.toDataURL();
      this.answers[field.key] = dataUrl;
      hiddenInput.value = this.translations.signatureInputVal;

      const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
      if (wrapper) wrapper.classList.remove('is-invalid');
    };

    const stopDraw = () => {
      padState.isDrawing = false;
    };

    if (!this.readOnly) {
      canvas.addEventListener('mousedown', startDraw);
      canvas.addEventListener('mousemove', draw);
      window.addEventListener('mouseup', stopDraw);

      canvas.addEventListener('touchstart', startDraw, { passive: false });
      canvas.addEventListener('touchmove', draw, { passive: false });
      window.addEventListener('touchend', stopDraw);

      clearBtn.addEventListener('click', () => {
        if (this.fieldDisabledStates && this.fieldDisabledStates[field.id]) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        padState.hasDrawn = false;
        this.answers[field.key] = '';
        hiddenInput.value = '';
        const typeInput = this.formEl.querySelector(`#type-input-${field.id}`);
        if (typeInput) typeInput.value = '';
      });

      // Bind accessible draw vs type mode switchers
      const modeDrawBtn = this.formEl.querySelector(`#mode-draw-${field.id}`);
      const modeTypeBtn = this.formEl.querySelector(`#mode-type-${field.id}`);
      const typeContainer = this.formEl.querySelector(`#type-container-${field.id}`);
      const typeInput = this.formEl.querySelector(`#type-input-${field.id}`);
      const indicator = this.formEl.querySelector(`#indicator-${field.id}`);

      if (modeDrawBtn && modeTypeBtn && typeContainer && typeInput) {
        modeDrawBtn.addEventListener('click', () => {
          padState.mode = 'draw';
          modeDrawBtn.classList.add('active');
          modeDrawBtn.style.background = 'var(--color-neutral-2)';
          modeTypeBtn.classList.remove('active');
          modeTypeBtn.style.background = 'transparent';
          typeContainer.style.display = 'none';
          if (indicator) indicator.style.display = 'inline-flex';

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          padState.hasDrawn = false;
          this.answers[field.key] = '';
          hiddenInput.value = '';
        });

        modeTypeBtn.addEventListener('click', () => {
          padState.mode = 'type';
          modeTypeBtn.classList.add('active');
          modeTypeBtn.style.background = 'var(--color-neutral-2)';
          modeDrawBtn.classList.remove('active');
          modeDrawBtn.style.background = 'transparent';
          typeContainer.style.display = 'block';
          if (indicator) indicator.style.display = 'none';

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          padState.hasDrawn = false;
          this.answers[field.key] = '';
          hiddenInput.value = '';
          typeInput.value = '';
        });

        typeInput.addEventListener('input', (e) => {
          if (padState.mode !== 'type') return;
          const val = e.target.value.trim();

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (val) {
            padState.hasDrawn = true;
            ctx.font = "italic 40px 'Caveat', cursive, sans-serif";
            ctx.fillStyle = "#1a1a1a";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(val, canvas.width / 2, canvas.height / 2);

            const dataUrl = canvas.toDataURL();
            this.answers[field.key] = dataUrl;
            hiddenInput.value = this.translations.signatureInputVal;

            const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
            if (wrapper) {
              wrapper.classList.remove('is-invalid');
              const inputEl = wrapper.querySelector('input, textarea, select');
              if (inputEl) inputEl.removeAttribute('aria-invalid');
            }
          } else {
            padState.hasDrawn = false;
            this.answers[field.key] = '';
            hiddenInput.value = '';
          }
        });
      }
    }
  }

  /**
   * Initializes drag & drop interfaces for File Upload widgets
   */
  initFileUploader(field) {
    const uploader = this.formEl.querySelector(`#uploader-${field.id}`);
    const picker = this.formEl.querySelector(`#filepicker-${field.id}`);
    const details = this.formEl.querySelector(`#filedetails-${field.id}`);
    const hiddenInput = this.formEl.querySelector(`#input-${field.id}`);

    if (!uploader || !picker) return;

    // Restore uploaded file states in multi-page jumps/pre-population
    const existingFile = this.answers[field.key];
    if (existingFile && existingFile.name && !this.uploadedFiles[field.id]) {
      this.uploadedFiles[field.id] = existingFile;
    }

    if (this.readOnly) {
      const file = this.uploadedFiles[field.id];
      if (file) {
        uploader.style.display = 'none';
        details.style.display = 'flex';
        details.className = 'form-file-details is-readonly';
        details.innerHTML = this.renderFileDetailsHTML(file, true);
        hiddenInput.value = file.name;
        this.bindFileEvents(details, file, field, hiddenInput, uploader, true);
      } else {
        uploader.style.display = 'flex';
        uploader.className = 'form-file-uploader is-readonly';
        uploader.innerHTML = `
          <i data-lucide="file" style="margin-bottom: 8px;"></i>
          <div style="font-size: 13px; color: var(--color-neutral-6);">No file uploaded</div>
        `;
      }
      return;
    }

    // Restore uploaded file states in multi-page jumps
    if (this.uploadedFiles[field.id]) {
      const file = this.uploadedFiles[field.id];
      uploader.style.display = 'none';
      details.style.display = 'flex';
      details.className = 'form-file-details';
      details.innerHTML = this.renderFileDetailsHTML(file, false);
      hiddenInput.value = file.name;
      this.bindFileEvents(details, file, field, hiddenInput, uploader, false);
    }

    uploader.addEventListener('click', () => {
      const isCapacitorCamera = !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Camera);
      const isCordovaCamera = !!(navigator.camera && navigator.camera.getPicture);
      const isMobilePluginAvailable = isCapacitorCamera || isCordovaCamera;

      if (field.useNativeCamera && isMobilePluginAvailable) {
        const accepted = (field.acceptedTypes || '').toLowerCase();
        const hasImage = accepted.includes('image') || accepted.includes('.jpg') || accepted.includes('.png') || accepted.includes('.jpeg') || !accepted;
        const hasOthers = accepted.includes('.pdf') || accepted.includes('.doc') || accepted.includes('.xls') || accepted.includes('.txt') || accepted.includes('*/*');

        if (hasImage && hasOthers) {
          this.showUploadActionSheet(
            field,
            () => this.triggerNativeCamera(field),
            () => picker.click()
          );
        } else if (hasImage) {
          this.triggerNativeCamera(field);
        } else {
          picker.click();
        }
      } else {
        picker.click();
      }
    });

    uploader.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploader.classList.add('drag-over');
    });

    uploader.addEventListener('dragleave', () => {
      uploader.classList.remove('drag-over');
    });

    uploader.addEventListener('drop', (e) => {
      e.preventDefault();
      uploader.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFileUpload(field, e.dataTransfer.files[0]);
      }
    });

    picker.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFileUpload(field, e.target.files[0]);
      }
    });
  }

  handleFileUpload(field, file) {
    const uploader = this.formEl.querySelector(`#uploader-${field.id}`);
    const details = this.formEl.querySelector(`#filedetails-${field.id}`);
    const hiddenInput = this.formEl.querySelector(`#input-${field.id}`);
    const picker = this.formEl.querySelector(`#filepicker-${field.id}`);

    const maxLimit = field.maxFileSizeMB !== undefined ? field.maxFileSizeMB : 5;
    if (file.size > maxLimit * 1024 * 1024) {
      let errorMsg = this.translations.fileTooLargeError;
      errorMsg = errorMsg.replace('5MB', `${maxLimit}MB`).replace('5 MB', `${maxLimit} MB`);
      alert(errorMsg);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Content = e.target.result;

      const fileObj = {
        name: file.name,
        size: file.size,
        type: file.type,
        content: base64Content
      };

      this.uploadedFiles[field.id] = fileObj;
      this.answers[field.key] = fileObj;
      hiddenInput.value = file.name;

      uploader.style.display = 'none';
      details.style.display = 'flex';
      details.className = 'form-file-details';
      details.innerHTML = this.renderFileDetailsHTML(fileObj, false);

      const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
      if (wrapper) wrapper.classList.remove('is-invalid');

      this.evalBusinessRules();
      this.recalculateFormulas();

      this.bindFileEvents(details, fileObj, field, hiddenInput, uploader, false);
    };

    reader.readAsDataURL(file);
  }

  /**
   * Triggers beautiful fullscreen image lightboxes for images, and native direct downloads for documents
   */
  handleAttachmentClick(file) {
    const isImg = file.type?.startsWith('image/') || (typeof file.content === 'string' && file.content.startsWith('data:image'));
    if (isImg) {
      const lightbox = document.getElementById('lightbox-modal');
      const img = document.getElementById('lightbox-image');
      const caption = document.getElementById('lightbox-caption');

      if (lightbox && img && caption) {
        img.src = file.content;
        caption.textContent = file.name;
        lightbox.style.display = 'flex';
      }
    } else {
      this.downloadFile(file);
    }
  }

  /**
   * Triggers native OS share sheet if plugins are available, otherwise falls back to browser download
   */
  downloadFile(file) {
    const isCordovaShare = !!(window.plugins && window.plugins.socialsharing);
    const isCapacitorShare = !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share);

    if (isCordovaShare) {
      window.plugins.socialsharing.share(
        null,
        file.name,
        file.content,
        null,
        () => {},
        (err) => console.warn("Cordova sharing error:", err)
      );
    } else if (isCapacitorShare) {
      const hasFilesystem = !!(window.Capacitor.Plugins.Filesystem);
      if (hasFilesystem) {
        const fs = window.Capacitor.Plugins.Filesystem;
        const base64Parts = file.content.split(',');
        const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];

        fs.writeFile({
          path: file.name,
          data: base64Data,
          directory: 'CACHE'
        }).then((res) => {
          return window.Capacitor.Plugins.Share.share({
            title: file.name,
            files: [res.uri]
          });
        }).catch((err) => {
          console.warn("Capacitor sharing/filesystem error:", err);
          this.triggerWebDownload(file);
        });
      } else {
        this.triggerWebDownload(file);
      }
    } else {
      this.triggerWebDownload(file);
    }
  }

  triggerWebDownload(file) {
    const tempLink = document.createElement('a');
    tempLink.href = file.content;
    tempLink.download = file.name;
    document.body.appendChild(tempLink);
    tempLink.click();
    tempLink.remove();
  }

  /**
   * Helper to bind events (preview click, download share/fallback, and delete action) to file details element
   */
  bindFileEvents(details, file, field, hiddenInput, uploader, isReadOnly) {
    if (window.lucide) window.lucide.createIcons();

    // Bind preview/lightbox click
    const leftEl = details.querySelector('.form-file-details-left');
    if (leftEl) {
      leftEl.style.cursor = 'pointer';
      leftEl.addEventListener('click', () => {
        this.handleAttachmentClick(file);
      });
    }

    // Bind download button (intercept and handle share/download)
    const downloadBtn = details.querySelector('.form-file-download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.downloadFile(file);
      });
    }

    // Bind delete button if not read-only
    if (!isReadOnly) {
      const deleteBtn = details.querySelector('.form-file-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          delete this.uploadedFiles[field.id];
          this.answers[field.key] = '';
          if (hiddenInput) hiddenInput.value = '';
          const picker = this.formEl.querySelector(`#file-${field.id}`);
          if (picker) picker.value = '';
          details.style.display = 'none';
          if (uploader) uploader.style.display = 'flex';
          this.evalBusinessRules();
          this.recalculateFormulas();
        });
      }
    }
  }

  /**
   * Helper to render premium file attachment details with image thumbnails and download triggers
   */
  renderFileDetailsHTML(file, isReadOnly) {
    const isImg = file.type?.startsWith('image/') || (typeof file.content === 'string' && file.content.startsWith('data:image'));
    const previewHtml = isImg ? `
      <div class="form-file-preview-thumbnail" style="margin-right: 12px; width: 44px; height: 44px; border-radius: 4px; overflow: hidden; border: 1px solid var(--color-neutral-4); flex-shrink: 0; background: var(--color-neutral-2);">
        <img src="${file.content}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    ` : '';

    return `
      <div class="form-file-details-left" style="display: flex; align-items: center; flex: 1; overflow: hidden;">
        ${previewHtml}
        <div style="display: flex; flex-direction: column; overflow: hidden; text-align: left;">
          <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; color: var(--color-neutral-10);" title="${file.name}">${file.name}</div>
          <div style="font-size: 11px; color: var(--color-neutral-7);">${(file.size / 1024).toFixed(1)} KB</div>
        </div>
      </div>
      <div class="form-file-details-actions" style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
        <!-- Download Button -->
        <a href="${file.content}" download="${file.name}" class="pg-btn pg-btn-secondary form-file-download-btn" title="Download attachment" style="padding: 6px 8px; display: flex; align-items: center; justify-content: center; height: auto;">
          <i data-lucide="download" style="width: 14px; height: 14px;"></i>
        </a>
        ${isReadOnly ? '' : `
        <button type="button" class="form-file-delete-btn" title="${this.translations.fileDeleteTitle}" style="padding: 6px 8px; display: flex; align-items: center; justify-content: center; height: auto; color: var(--color-error); border-color: rgba(219,60,60,0.15);">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
        `}
      </div>
    `;
  }

  /**
   * Strictly validates fields on selected page tab indexes
   */
  validatePage(pageIndex) {
    let hasErrors = false;
    const page = this.schema.pages[pageIndex];

    (page.sections || []).forEach(section => {
      (section.rows || []).forEach(row => {
        row.columns.forEach(col => {
          if (!col.field) return;
          const field = col.field;

          if (['header', 'paragraph'].includes(field.type)) return;

          if (field.type === 'repeater') {
            const isVisible = this.fieldVisibilityStates ? this.fieldVisibilityStates[field.id] : true;
            const isDisabled = this.fieldDisabledStates ? this.fieldDisabledStates[field.id] : false;

            if (isVisible && !isDisabled) {
              const items = this.answers[field.key] || [];

              items.forEach((item, itemIndex) => {
                if (field.rows) {
                  field.rows.forEach(row => {
                    row.columns.forEach(col => {
                      if (!col.field) return;
                      const subField = col.field;
                      const scopedId = `${field.id}-${itemIndex}-${subField.id}`;
                      const scopedKey = `sub-${field.id}-${itemIndex}-${subField.key}`;

                      const wrapper = this.formEl.querySelector(`#wrapper-${scopedId}`);
                      const errorEl = this.formEl.querySelector(`#error-${scopedId}`);

                      if (wrapper && errorEl) {
                        const val = this.answers[scopedKey];
                        let isFieldInvalid = false;
                        const isRequired = subField.required;

                        if (isRequired) {
                          if (subField.type === 'file') {
                            if (!this.uploadedFiles[scopedId]) {
                              isFieldInvalid = true;
                            }
                          } else if (subField.type === 'signature') {
                            if (!this.signaturePads[scopedId] || !this.signaturePads[scopedId].hasDrawn) {
                              isFieldInvalid = true;
                            }
                          } else if (subField.type === 'checkbox') {
                            if (!Array.isArray(val) || val.length === 0) {
                              isFieldInvalid = true;
                            }
                          } else if (subField.type === 'matrix') {
                            const matrixAnswers = val || {};
                            const allRowsAnswered = (subField.matrixRows || []).every(r => {
                              const rowVal = matrixAnswers[r.key];
                              return rowVal !== undefined && rowVal !== null && String(rowVal).trim() !== '';
                            });
                            if (!allRowsAnswered) {
                              isFieldInvalid = true;
                            }
                          } else {
                            if (val === undefined || val === null || String(val).trim() === '') {
                              isFieldInvalid = true;
                            }
                          }
                          errorEl.innerHTML = `<i data-lucide="alert-circle"></i> Field is required`;
                        }

                        // Regex validation inside repeater fields
                        if (!isFieldInvalid && subField.type === 'text' && subField.validationRegex && val) {
                          try {
                            let pattern = subField.validationRegex;
                            if (!pattern.startsWith('^') || !pattern.endsWith('$')) {
                              pattern = `^(?:${pattern})$`;
                            }
                            const regex = new RegExp(pattern);
                            if (!regex.test(val)) {
                              isFieldInvalid = true;
                              errorEl.innerHTML = `<i data-lucide="alert-circle"></i> ${subField.errorMessage || this.translations.patternValidationBubble}`;
                            }
                          } catch (e) {
                            console.error("Invalid configuration regex:", subField.validationRegex);
                          }
                        }

                        const inputEl = wrapper.querySelector('input, textarea, select');
                        if (isFieldInvalid) {
                          wrapper.classList.add('is-invalid');
                          if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
                          hasErrors = true;
                        } else {
                          wrapper.classList.remove('is-invalid');
                          if (inputEl) inputEl.removeAttribute('aria-invalid');
                        }
                      }
                    });
                  });
                }
              });
            }
            return;
          }

          const colEl = this.formEl.querySelector(`.form-column[data-field-id="${field.id}"]`);
          const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
          const errorEl = this.formEl.querySelector(`#error-${field.id}`);

          if (colEl && wrapper && errorEl) {
            // Only validate logically visible and enabled inputs
            const isVisible = this.fieldVisibilityStates ? this.fieldVisibilityStates[field.id] : true;
            const isDisabled = this.fieldDisabledStates ? this.fieldDisabledStates[field.id] : false;

            if (isVisible && !isDisabled) {
              const val = this.answers[field.key];
              let isFieldInvalid = false;

              // 1. Validate required toggles
              const isRequired = this.fieldRequiredStates ? this.fieldRequiredStates[field.id] : field.required;
              if (isRequired) {
                if (field.type === 'file') {
                  if (!this.uploadedFiles[field.id]) {
                    isFieldInvalid = true;
                  }
                } else if (field.type === 'signature') {
                  if (!this.signaturePads[field.id] || !this.signaturePads[field.id].hasDrawn) {
                    isFieldInvalid = true;
                  }
                } else if (field.type === 'checkbox') {
                  if (!Array.isArray(val) || val.length === 0) {
                    isFieldInvalid = true;
                  }
                } else if (field.type === 'matrix') {
                  const matrixAnswers = val || {};
                  const allRowsAnswered = (field.matrixRows || []).every(row => {
                    const rowVal = matrixAnswers[row.key];
                    return rowVal !== undefined && rowVal !== null && String(rowVal).trim() !== '';
                  });
                  if (!allRowsAnswered) {
                    isFieldInvalid = true;
                  }
                } else {
                  if (val === undefined || val === null || String(val).trim() === '') {
                    isFieldInvalid = true;
                  }
                }
                errorEl.innerHTML = `<i data-lucide="alert-circle"></i> ${this.translations.requiredFieldBubble}`;
              }

              // 2. Validate Regex rules
              if (!isFieldInvalid && field.type === 'text' && field.validationRegex && val) {
                try {
                  let pattern = field.validationRegex;
                  // Ensure standard full-match anchoring similar to HTML5 validation pattern behavior
                  if (!pattern.startsWith('^') || !pattern.endsWith('$')) {
                    pattern = `^(?:${pattern})$`;
                  }
                  const regex = new RegExp(pattern);
                  if (!regex.test(val)) {
                    isFieldInvalid = true;
                    errorEl.innerHTML = `<i data-lucide="alert-circle"></i> ${field.errorMessage || this.translations.patternValidationBubble}`;
                  }
                } catch (e) {
                  console.error("Invalid configuration regex:", field.validationRegex);
                }
              }

              const inputEl = wrapper.querySelector('input, textarea, select');
              if (isFieldInvalid) {
                wrapper.classList.add('is-invalid');
                if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
                hasErrors = true;
              } else {
                wrapper.classList.remove('is-invalid');
                if (inputEl) inputEl.removeAttribute('aria-invalid');
              }
            } else {
              wrapper.classList.remove('is-invalid');
              const inputEl = wrapper.querySelector('input, textarea, select');
              if (inputEl) inputEl.removeAttribute('aria-invalid');
            }
          }
        });
      });
    });

    // 3. Evaluate Cross-Field Validation Rules
    if (this.schema.crossFieldRules && Array.isArray(this.schema.crossFieldRules)) {
      const currentPageFieldKeys = new Set();
      const pageFieldsMap = new Map();

      (page.sections || []).forEach(section => {
        (section.rows || []).forEach(row => {
          row.columns.forEach(col => {
            if (col.field && col.field.key) {
              currentPageFieldKeys.add(col.field.key);
              pageFieldsMap.set(col.field.key, col.field);
            }
          });
        });
      });

      this.schema.crossFieldRules.forEach(rule => {
        const hasTargetOnPage = (rule.targetFields || []).some(key => currentPageFieldKeys.has(key));
        if (!hasTargetOnPage) return;

        const isValid = this.evaluateValidationRule(rule.expression);
        if (!isValid) {
          hasErrors = true;

          (rule.targetFields || []).forEach(targetFieldKey => {
            const targetField = pageFieldsMap.get(targetFieldKey);
            if (targetField) {
              const wrapper = this.formEl.querySelector(`#wrapper-${targetField.id}`);
              const errorEl = this.formEl.querySelector(`#error-${targetField.id}`);
              if (wrapper && errorEl) {
                wrapper.classList.add('is-invalid');
                const inputEl = wrapper.querySelector('input, textarea, select');
                if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
                errorEl.innerHTML = `<i data-lucide="alert-circle"></i> ${rule.errorMessage || 'Invalid field combination.'}`;
              }
            }
          });
        }
      });
    }

    if (window.lucide) window.lucide.createIcons();

    if (hasErrors) {
      this.showToast(this.translations.validationToastError, true);
    }
    return !hasErrors;
  }

  /**
   * Runs validation checks across all pages and formats submissions answers
   */
  validateAndSubmit() {
    let allValid = true;
    const totalPages = this.schema.pages.length;

    for (let idx = 0; idx < totalPages; idx++) {
      if (!this.validatePage(idx)) {
        allValid = false;
        // Focus first invalid page to aid corrections, only redrawing if switching pages
        if (this.activePageIndex !== idx) {
          this.activePageIndex = idx;
          this.drawActivePage();
          this.validatePage(idx); // Apply error markings to the newly drawn page
        }
        break;
      }
    }

    if (!allValid) return;

    // Filter responses of fields that are logically visible and enabled
    const submittedAnswers = {};

    this.schema.pages.forEach(page => {
      (page.sections || []).forEach(section => {
        (section.rows || []).forEach(row => {
          row.columns.forEach(col => {
            if (!col.field) return;
            const field = col.field;

            if (field.type === 'header') return;

            if (this.isFieldActiveInSchema(field, section)) {
              submittedAnswers[field.key] = this.answers[field.key];
            }
          });
        });
      });
    });

    this.showToast(this.translations.validationToastSuccess, false);

    if (this.onSubmit) {
      this.onSubmit(submittedAnswers);
    }
  }

  /**
   * Helper that triggers high-fidelity modern styled Toasts
   */
  showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Configure the live region dynamically for screen reader announcement parity
    container.setAttribute('aria-live', isError ? 'assertive' : 'polite');
    container.setAttribute('role', isError ? 'alert' : 'status');

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.innerHTML = `
      <i data-lucide="${isError ? 'x-circle' : 'check-circle'}"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  /**
   * Renders the dynamic repeatable list container, dynamic cards, and handles actions
   */
  renderRepeaterWidget(field, container) {
    const listEl = document.createElement('div');
    listEl.className = 'form-repeater-items-list';
    container.appendChild(listEl);

    const updateUI = () => {
      listEl.innerHTML = '';
      const items = this.answers[field.key] || [];

      items.forEach((item, itemIndex) => {
        const card = document.createElement('div');
        card.className = 'form-repeater-card';
        card.setAttribute('data-item-index', itemIndex);

        // Card Header
        const header = document.createElement('div');
        header.className = 'form-repeater-card-header';

        const title = document.createElement('span');
        title.className = 'form-repeater-card-title';
        title.textContent = `Item #${itemIndex + 1}`;
        header.appendChild(title);

        // Delete button if not read-only and above minItems
        if (!this.readOnly && items.length > (field.minItems || 0)) {
          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'form-repeater-card-delete';
          delBtn.innerHTML = `<i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>`;
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            items.splice(itemIndex, 1);
            this.notifyFieldChange();
            updateUI();
          });
          header.appendChild(delBtn);
        }
        card.appendChild(header);

        // Card Fields Grid
        const grid = document.createElement('div');
        grid.className = 'form-repeater-grid';
        grid.style.cssText = "display: flex; flex-direction: column; gap: 12px;";

        if (field.rows) {
          field.rows.forEach(row => {
            if (!row.columns || row.columns.length === 0) return;

            const rowEl = document.createElement('div');
            rowEl.className = 'renderer-row';
            rowEl.style.cssText = "display: grid; grid-template-columns: repeat(12, 1fr); gap: 12px; margin-bottom: 8px;";

            row.columns.forEach(col => {
              if (!col.field) return;

              const subField = col.field;
              const colEl = document.createElement('div');
              colEl.className = `form-column col-${col.width}`;
              colEl.setAttribute('data-field-id', `${field.id}-${itemIndex}-${subField.id}`);

              // 1. Initialize nested answer property if undefined
              if (!(subField.key in item)) {
                if (subField.type === 'boolean') {
                  item[subField.key] = subField.defaultValue !== undefined ? subField.defaultValue : false;
                } else if (subField.type === 'checkbox') {
                  item[subField.key] = [];
                } else {
                  item[subField.key] = '';
                }
              }

              // 2. Define getter/setter on this.answers
              const scopedKey = `sub-${field.id}-${itemIndex}-${subField.key}`;
              Object.defineProperty(this.answers, scopedKey, {
                get: () => {
                  return item[subField.key];
                },
                set: (val) => {
                  item[subField.key] = val;
                },
                configurable: true,
                enumerable: true
              });

              // 3. Create scoped field clone
              const scopedField = JSON.parse(JSON.stringify(subField));
              scopedField.id = `${field.id}-${itemIndex}-${subField.id}`;
              scopedField.key = scopedKey;

              // 4. Create widget wrapper using standard renderer engine
              const widgetWrapper = this.createWidgetWrapper(scopedField);
              colEl.appendChild(widgetWrapper);
              rowEl.appendChild(colEl);

              // 5. Post-initialization event listeners
              const inputEl = widgetWrapper.querySelector('.form-input, input[type="checkbox"], input[type="radio"], select, textarea');
              if (inputEl) {
                const eventName = (subField.type === 'dropdown' || subField.type === 'boolean' || subField.type === 'checkbox' || subField.type === 'radio') ? 'change' : 'input';
                inputEl.addEventListener(eventName, (e) => {
                  let val;
                  if (subField.type === 'boolean') {
                    val = e.target.checked;
                  } else if (subField.type === 'checkbox') {
                    const checkedCheckboxes = Array.from(widgetWrapper.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
                    val = checkedCheckboxes;
                  } else if (subField.type === 'radio') {
                    val = e.target.value;
                  } else {
                    val = e.target.value;
                  }

                  if (subField.type === 'number' && val !== '') {
                    val = Number(val);
                  }

                  this.answers[scopedKey] = val;
                  this.handleFieldChanged(scopedKey);

                  const wrapper = widgetWrapper.querySelector('.form-widget-wrapper') || widgetWrapper;
                  if (wrapper && String(val).trim() !== '') {
                    wrapper.classList.remove('is-invalid');
                  }
                });
              }

              // Initialize nested Signature widget
              if (subField.type === 'signature') {
                this.initSignatureCanvas(scopedField);
              }

              // Initialize nested File Uploaders
              if (subField.type === 'file') {
                this.initFileUploader(scopedField);
              }
            });

            grid.appendChild(rowEl);
          });
        }

        card.appendChild(grid);
        listEl.appendChild(card);
      });

      if (window.lucide) window.lucide.createIcons();
    };

    // Initialize list UI
    updateUI();

    // Render "Add Item" button below list if not read-only
    if (!this.readOnly) {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'pg-btn pg-btn-secondary form-repeater-add-btn';
      const displayAddBtnLabel = this.getTranslatedValue('fields', field.key, 'addButtonLabel', null, field.addButtonLabel || 'Add Item');
      addBtn.innerHTML = `<i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i> ${displayAddBtnLabel}`;

      const checkAddButtonState = () => {
        const currentCount = (this.answers[field.key] || []).length;
        if (currentCount >= (field.maxItems || 10)) {
          addBtn.style.display = 'none';
        } else {
          addBtn.style.display = 'flex';
        }
      };

      addBtn.addEventListener('click', () => {
        const items = this.answers[field.key] || [];
        if (items.length < (field.maxItems || 10)) {
          items.push({});
          this.notifyFieldChange();
          updateUI();
          checkAddButtonState();
        }
      });

      container.appendChild(addBtn);
      checkAddButtonState();
    }
  }

  notifyFieldChange() {
    if (this.onFieldChange) {
      this.onFieldChange(this.answers);
    }
  }

  /**
   * Applies a custom formatting mask pattern to user input strings.
   * Wildcards: '9' (digit), 'a' (letter), '*' (alphanumeric).
   * Literals: Any other character.
   */
  applyMask(value, maskPattern) {
    if (!value) return '';
    if (!maskPattern) return value;

    let formatted = "";
    let maskIndex = 0;
    let valIndex = 0;

    const isDigit = (c) => /\d/.test(c);
    const isLetter = (c) => /[a-zA-Z]/.test(c);
    const isAlphanumeric = (c) => /[a-zA-Z0-9]/.test(c);

    while (maskIndex < maskPattern.length && valIndex < value.length) {
      const maskChar = maskPattern[maskIndex];
      const valChar = value[valIndex];

      if (maskChar === '9') {
        if (isDigit(valChar)) {
          formatted += valChar;
          maskIndex++;
          valIndex++;
        } else {
          valIndex++;
        }
      } else if (maskChar === 'a') {
        if (isLetter(valChar)) {
          formatted += valChar;
          maskIndex++;
          valIndex++;
        } else {
          valIndex++;
        }
      } else if (maskChar === '*') {
        if (isAlphanumeric(valChar)) {
          formatted += valChar;
          maskIndex++;
          valIndex++;
        } else {
          valIndex++;
        }
      } else {
        // It's a literal character (like '.', '-', '(', etc.)
        formatted += maskChar;
        maskIndex++;

        if (valChar === maskChar) {
          valIndex++;
        }
      }
    }

    return formatted;
  }

  /**
   * Extracts only the characters that matched mask wildcards (stripping literals)
   */
  getCleanValue(value, maskPattern) {
    if (!value) return '';
    if (!maskPattern) return value;

    let clean = "";
    let maskIndex = 0;
    let valIndex = 0;

    const isDigit = (c) => /\d/.test(c);
    const isLetter = (c) => /[a-zA-Z]/.test(c);
    const isAlphanumeric = (c) => /[a-zA-Z0-9]/.test(c);

    while (maskIndex < maskPattern.length && valIndex < value.length) {
      const maskChar = maskPattern[maskIndex];
      const valChar = value[valIndex];

      if (maskChar === '9') {
        if (isDigit(valChar)) {
          clean += valChar;
          maskIndex++;
          valIndex++;
        } else {
          valIndex++;
        }
      } else if (maskChar === 'a') {
        if (isLetter(valChar)) {
          clean += valChar;
          maskIndex++;
          valIndex++;
        } else {
          valIndex++;
        }
      } else if (maskChar === '*') {
        if (isAlphanumeric(valChar)) {
          clean += valChar;
          maskIndex++;
          valIndex++;
        } else {
          valIndex++;
        }
      } else {
        maskIndex++;
        if (valChar === maskChar) {
          valIndex++;
        }
      }
    }

    return clean;
  }

  /**
   * Evaluates mathematical formulas securely
   */
  evaluateFormula(expression) {
    if (!expression) return 0;

    let sanitized = expression;

    // Find all placeholders like {price} or {quantity}
    const placeholderRegex = /\{([^}]+)\}/g;
    let match;

    // Replace placeholders with current values from answers
    while ((match = placeholderRegex.exec(expression)) !== null) {
      const key = match[1];
      const val = this.answers[key];
      const numVal = (val !== undefined && val !== null && val !== '') ? Number(val) : 0;
      sanitized = sanitized.replaceAll(`{${key}}`, isNaN(numVal) ? '0' : String(numVal));
    }

    // Whitelist sanitization: only allow numbers, math symbols, and approved safe Math functions
    let checkUnsafe = sanitized;
    checkUnsafe = checkUnsafe.replace(/Math\.(min|max|round|abs|floor|ceil)/g, '');
    checkUnsafe = checkUnsafe.replace(/[0-9.+\-*/%()?:\s><=!]/g, '');

    // If any alphabet/identifiers remain, block execution for safety
    if (/[a-zA-Z_$]/.test(checkUnsafe)) {
      console.warn("Unsafe characters detected in formula expression evaluation:", expression);
      return 0;
    }

    try {
      const result = new Function(`return (${sanitized});`)();
      const numResult = Number(result);
      if (isNaN(numResult) || !isFinite(numResult)) {
        return 0;
      }
      return Number(numResult.toFixed(2));
    } catch (e) {
      console.error("Error evaluating formula:", expression, sanitized, e);
      return 0;
    }
  }

  /**
   * Evaluates logic-based dynamic validation expressions securely
   */
  evaluateValidationRule(expression) {
    if (!expression) return true;

    let sanitized = expression;

    // Find all placeholders like {startDate} or {qty}
    const placeholderRegex = /\{([^}]+)\}/g;
    let match;

    while ((match = placeholderRegex.exec(expression)) !== null) {
      const key = match[1];
      const val = this.answers[key];
      let repVal = 0;

      if (val !== undefined && val !== null && val !== '') {
        if (typeof val === 'number') {
          repVal = val;
        } else if (typeof val === 'boolean') {
          repVal = val ? 1 : 0;
        } else if (typeof val === 'string') {
          // Check for date string pattern YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const parsedDate = Date.parse(val);
            repVal = isNaN(parsedDate) ? 0 : parsedDate;
          } else if (!isNaN(Number(val))) {
            repVal = Number(val);
          } else {
            // Unsafe text defaults to 0 for numerical comparisons
            repVal = 0;
          }
        }
      }
      sanitized = sanitized.replaceAll(`{${key}}`, String(repVal));
    }

    // Whitelist check: only numbers, logic operators, parenthesis, and approved functions
    let checkUnsafe = sanitized;
    checkUnsafe = checkUnsafe.replace(/Math\.(min|max|round|abs|floor|ceil)/g, '');
    checkUnsafe = checkUnsafe.replace(/[0-9.+\-*/%()?:\s><=!&|]/g, '');

    if (/[a-zA-Z_$]/.test(checkUnsafe)) {
      console.warn("Unsafe characters detected in validation rule expression:", expression);
      return false;
    }

    try {
      // Evaluate in a secure isolated Function context
      const result = new Function(`return (${sanitized});`)();
      return !!result;
    } catch (e) {
      console.error("Error evaluating validation rule:", expression, sanitized, e);
      return false;
    }
  }

  /**
   * Recalculates all formulas dynamically using a fixed-point relaxation loop
   */
  recalculateFormulas() {
    if (!this.schema || !this.schema.pages) return;

    let changed = true;
    let iterations = 0;

    while (changed && iterations < 5) {
      changed = false;
      iterations++;

      this.schema.pages.forEach(page => {
        (page.sections || []).forEach(section => {
          (section.rows || []).forEach(row => {
            row.columns.forEach(col => {
              const field = col.field;
              if (field && field.type === 'number' && field.isCalculated && field.formulaExpression) {
                const oldVal = this.answers[field.key];
                const newVal = this.evaluateFormula(field.formulaExpression);

                if (oldVal !== newVal) {
                  this.answers[field.key] = newVal;
                  changed = true;

                  // Update input value in active DOM
                  const inputEl = this.formEl.querySelector(`#input-${field.id}`);
                  if (inputEl) {
                    inputEl.value = newVal;
                  }
                }
              }
            });
          });
        });
      });
    }
  }

  /**
   * Triggers Cordova or Capacitor native camera workflows
   */
  triggerNativeCamera(field) {
    const isCapacitorCamera = !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Camera);
    const isCordovaCamera = !!(navigator.camera && navigator.camera.getPicture);

    if (isCapacitorCamera) {
      const source = (field.nativeCameraSource || 'camera').toUpperCase(); // CAMERA, PHOTOS, PROMPT
      window.Capacitor.Plugins.Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'dataUrl',
        source: source,
        saveToGallery: true
      }).then((image) => {
        if (image && image.dataUrl) {
          this.handleNativeCameraSuccess(field, image.dataUrl);
        }
      }).catch((err) => {
        console.warn("Capacitor camera error:", err);
      });
    } else if (isCordovaCamera) {
      const runCordovaCamera = (sourceType) => {
        navigator.camera.getPicture(
          (imageData) => {
            const dataUrl = imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`;
            this.handleNativeCameraSuccess(field, dataUrl);
          },
          (err) => {
            console.warn("Cordova camera error:", err);
          },
          {
            quality: 90,
            destinationType: 0, // DATA_URL
            sourceType: sourceType,
            encodingType: 0, // JPEG
            saveToPhotoAlbum: true
          }
        );
      };

      if (field.nativeCameraSource === 'photos') {
        runCordovaCamera(0); // PHOTOLIBRARY
      } else if (field.nativeCameraSource === 'camera') {
        runCordovaCamera(1); // CAMERA
      } else {
        this.showUploadActionSheet(
          field,
          () => runCordovaCamera(1), // Camera
          () => runCordovaCamera(0)  // Photos
        );
      }
    }
  }

  /**
   * Processes successfully captured native camera image data
   */
  handleNativeCameraSuccess(field, dataUrl) {
    const uploader = this.formEl.querySelector(`#uploader-${field.id}`);
    const details = this.formEl.querySelector(`#filedetails-${field.id}`);
    const hiddenInput = this.formEl.querySelector(`#input-${field.id}`);

    // Estimate file size from base64
    const head = dataUrl.indexOf(",") + 1;
    const base64Data = dataUrl.substring(head);
    const sizeInBytes = Math.round(base64Data.length * 0.75);

    const fileObj = {
      name: `camera_photo_${Date.now()}.jpg`,
      size: sizeInBytes,
      type: "image/jpeg",
      content: dataUrl
    };

    this.uploadedFiles[field.id] = fileObj;
    this.answers[field.key] = fileObj;
    if (hiddenInput) hiddenInput.value = fileObj.name;

    if (uploader) uploader.style.display = 'none';
    if (details) {
      details.style.display = 'flex';
      details.className = 'form-file-details';
      details.innerHTML = this.renderFileDetailsHTML(fileObj, false);

      this.bindFileEvents(details, fileObj, field, hiddenInput, uploader, false);
    }

    const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
    if (wrapper) wrapper.classList.remove('is-invalid');

    this.evalBusinessRules();
    this.recalculateFormulas();
  }

  /**
   * Shows a premium bottom sheet dialog for choosing file upload source on mobile devices
   */
  showUploadActionSheet(field, onCamera, onFilePicker) {
    const backdrop = document.createElement('div');
    backdrop.className = 'openforms-action-sheet-backdrop';
    Object.assign(backdrop.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      opacity: 0,
      transition: 'opacity 0.25s ease'
    });

    const sheet = document.createElement('div');
    sheet.className = 'openforms-action-sheet';
    Object.assign(sheet.style, {
      width: '100%',
      maxWidth: '480px',
      backgroundColor: 'var(--color-neutral-2, #ffffff)',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      padding: '16px 16px 24px 16px',
      boxSizing: 'border-box',
      transform: 'translateY(100%)',
      transition: 'transform 0.25s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)'
    });

    const title = document.createElement('div');
    title.textContent = 'Select Attachment Source';
    Object.assign(title.style, {
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--color-neutral-8, #333333)',
      textAlign: 'center',
      marginBottom: '8px'
    });
    sheet.appendChild(title);

    const cameraBtn = document.createElement('button');
    cameraBtn.type = 'button';
    cameraBtn.className = 'pg-btn';
    cameraBtn.innerHTML = `<i data-lucide="camera" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"></i> Take Photo`;
    Object.assign(cameraBtn.style, {
      padding: '12px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      borderRadius: '8px',
      cursor: 'pointer'
    });
    cameraBtn.addEventListener('click', () => {
      closeSheet();
      onCamera();
    });
    sheet.appendChild(cameraBtn);

    const fileBtn = document.createElement('button');
    fileBtn.type = 'button';
    fileBtn.className = 'pg-btn pg-btn-secondary';
    fileBtn.innerHTML = `<i data-lucide="file-text" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"></i> Choose Document/File`;
    Object.assign(fileBtn.style, {
      padding: '12px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      borderRadius: '8px',
      cursor: 'pointer'
    });
    fileBtn.addEventListener('click', () => {
      closeSheet();
      onFilePicker();
    });
    sheet.appendChild(fileBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'pg-btn pg-btn-secondary';
    cancelBtn.textContent = 'Cancel';
    Object.assign(cancelBtn.style, {
      padding: '12px',
      fontSize: '14px',
      width: '100%',
      borderRadius: '8px',
      border: 'none',
      background: 'transparent',
      color: 'var(--color-neutral-7, #666666)',
      cursor: 'pointer'
    });
    cancelBtn.addEventListener('click', closeSheet);
    sheet.appendChild(cancelBtn);

    backdrop.appendChild(sheet);
    document.body.appendChild(backdrop);

    if (window.lucide) window.lucide.createIcons({ container: sheet });

    // Trigger animations
    requestAnimationFrame(() => {
      backdrop.style.opacity = 1;
      sheet.style.transform = 'translateY(0)';
    });

    function closeSheet() {
      backdrop.style.opacity = 0;
      sheet.style.transform = 'translateY(100%)';
      setTimeout(() => {
        backdrop.remove();
      }, 250);
    }
  }
}

// Bind to global namespace
window.OpenFormRenderer = OpenFormRenderer;
