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
  static VERSION = '1.1.0';

  /**
   * @param {Object} options
   * @param {HTMLElement} options.containerEl Container element of the widget
   * @param {Function} options.onSubmit Callback fired upon successful form submission
   * @param {Function} [options.onFieldChange] Optional callback triggered on real-time field edits
   * @param {Object} [options.translations] Custom translation overrides
   * @param {string} [options.locale] Active locale ('default', 'pt-BR', 'es-ES', ...)
   * @param {Function} [options.optionsProvider] Host-supplied source for fields with
   *   `optionsType: 'api'`: `(field, context) => Promise<Array<{label, value}>>`, where
   *   context is `{ locale, readOnly }`. The renderer never fetches `optionsUrl` itself —
   *   the host owns transport, auth and caching. Without a provider, such fields show a
   *   "not configured" message and offer no options.
   */
  constructor({ containerEl, onSubmit, onFieldChange, translations, locale, optionsProvider }) {
    this.containerEl = containerEl;
    this.onSubmit = onSubmit;
    this.onFieldChange = onFieldChange;
    this.optionsProvider = typeof optionsProvider === 'function' ? optionsProvider : null;
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
        optionsLoadError: "Não foi possível carregar as opções.",
        optionsSourceUnavailable: "Fonte de opções não configurada.",
        signatureInstruction: "Assine no quadro acima",
        signatureClearButton: "Limpar",
        signatureAriaLabel: "Assinatura Digital",
        signatureTypeLabel: "Digite seu nome completo:",
        signatureTypePlaceholder: "Seu nome",
        signatureModeDrawLabel: "Desenhar",
        signatureModeTypeLabel: "Digitar",
        signatureInputVal: "Assinado",
        fileClickToUpload: "Clique para carregar ou arraste arquivos aqui",
        fileTypeRequirements: "PDF, Word, Excel ou Imagens (Máx 5MB)",
        fileTooLargeError: "O arquivo é muito grande. Tamanho máximo permitido: 5MB.",
        fileDeleteTitle: "Excluir arquivo",
        fileDownloadTitle: "Baixar anexo",
        fileNoneUploaded: "Nenhum arquivo enviado",
        repeaterDeleteItemTitle: "Excluir item",
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
        optionsLoadError: "No se pudieron cargar las opciones.",
        optionsSourceUnavailable: "Fuente de opciones no configurada.",
        signatureInstruction: "Firme en el cuadro de arriba",
        signatureClearButton: "Limpiar",
        signatureAriaLabel: "Firma Digital",
        signatureTypeLabel: "Escriba su nombre completo:",
        signatureTypePlaceholder: "Su nombre",
        signatureModeDrawLabel: "Dibujar",
        signatureModeTypeLabel: "Escribir",
        signatureInputVal: "Firmado",
        fileClickToUpload: "Haga clic para cargar o arrastre archivos aquí",
        fileTypeRequirements: "PDF, Word, Excel o Imágenes (Máx 5MB)",
        fileTooLargeError: "El archivo es demasiado grande. Tamaño máximo permitido: 5MB.",
        fileDeleteTitle: "Eliminar archivo",
        fileDownloadTitle: "Descargar archivo adjunto",
        fileNoneUploaded: "Ningún archivo subido",
        repeaterDeleteItemTitle: "Eliminar elemento",
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
      optionsLoadError: "Could not load options.",
      optionsSourceUnavailable: "Options source not configured.",

      // Signature Pad
      signatureInstruction: "Sign in the box above",
      signatureClearButton: "Clear",
      signatureAriaLabel: "Digital Signature",
      signatureTypeLabel: "Type your full name:",
      signatureTypePlaceholder: "Your name",
      signatureModeDrawLabel: "Draw",
      signatureModeTypeLabel: "Type",
      signatureInputVal: "Signed",

      // File Uploader
      fileClickToUpload: "Click to upload or drag files here",
      fileTypeRequirements: "PDF, Word, Excel or Images (Max 5MB)",
      fileTooLargeError: "The file is too large. Maximum allowed size: 5MB.",
      fileUploaderActiveIcon: "file-check",
      fileDeleteTitle: "Delete file",
      fileDownloadTitle: "Download attachment",
      fileNoneUploaded: "No file uploaded",
      repeaterDeleteItemTitle: "Delete item",

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

    // Lifecycle bookkeeping (see destroy()): pending timers/frames, toasts this instance
    // created, in-flight optionsProvider loads, and a draw counter used to discard
    // provider results that resolve after the DOM they targeted was redrawn.
    this._destroyed = false;
    this._timers = new Set();
    this._frames = new Set();
    this._toasts = new Set();
    this._optionsCache = new Map();
    this._pendingOptionLoads = new Set();
    this._drawGeneration = 0;

    this.buildHTMLShell();
  }

  /**
   * Escapes a value for safe interpolation into HTML text or a quoted attribute.
   * Kept byte-identical to OpenFormBuilder.escapeHtml (the two files ship independently,
   * a parity test compares them).
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

  /**
   * Only `data:` URLs are allowed as file preview/download targets: file content comes
   * from the end-user or stored answers, so anything else (javascript:, remote URLs) is
   * dropped rather than linked.
   */
  static isSafeDataUrl(value) {
    return typeof value === 'string' && /^data:/i.test(value.trim());
  }

  /** setTimeout tracked so destroy() can cancel it. */
  _setTimeout(fn, ms) {
    const id = setTimeout(() => {
      this._timers.delete(id);
      fn();
    }, ms);
    this._timers.add(id);
    return id;
  }

  /** requestAnimationFrame tracked so destroy() can cancel it. */
  _requestFrame(fn) {
    const id = requestAnimationFrame(() => {
      this._frames.delete(id);
      fn();
    });
    this._frames.add(id);
    return id;
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
    if (this._destroyed) return;
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
        optionsLoadError: "Não foi possível carregar as opções.",
        optionsSourceUnavailable: "Fonte de opções não configurada.",
        signatureInstruction: "Assine no quadro acima",
        signatureClearButton: "Limpar",
        signatureAriaLabel: "Assinatura Digital",
        signatureTypeLabel: "Digite seu nome completo:",
        signatureTypePlaceholder: "Seu nome",
        signatureModeDrawLabel: "Desenhar",
        signatureModeTypeLabel: "Digitar",
        signatureInputVal: "Assinado",
        fileClickToUpload: "Clique para carregar ou arraste arquivos aqui",
        fileTypeRequirements: "PDF, Word, Excel ou Imagens (Máx 5MB)",
        fileTooLargeError: "O arquivo é muito grande. Tamanho máximo permitido: 5MB.",
        fileDeleteTitle: "Excluir arquivo",
        fileDownloadTitle: "Baixar anexo",
        fileNoneUploaded: "Nenhum arquivo enviado",
        repeaterDeleteItemTitle: "Excluir item",
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
        optionsLoadError: "No se pudieron cargar las opciones.",
        optionsSourceUnavailable: "Fuente de opciones no configurada.",
        signatureInstruction: "Firme en el cuadro de arriba",
        signatureClearButton: "Limpiar",
        signatureAriaLabel: "Firma Digital",
        signatureTypeLabel: "Escriba su nombre completo:",
        signatureTypePlaceholder: "Su nombre",
        signatureModeDrawLabel: "Dibujar",
        signatureModeTypeLabel: "Escribir",
        signatureInputVal: "Firmado",
        fileClickToUpload: "Haga clic para cargar o arrastre archivos aquí",
        fileTypeRequirements: "PDF, Word, Excel o Imágenes (Máx 5MB)",
        fileTooLargeError: "El archivo es demasiado grande. Tamaño máximo permitido: 5MB.",
        fileDeleteTitle: "Eliminar archivo",
        fileDownloadTitle: "Descargar archivo adjunto",
        fileNoneUploaded: "Ningún archivo subido",
        repeaterDeleteItemTitle: "Eliminar elemento",
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
      optionsLoadError: "Could not load options.",
      optionsSourceUnavailable: "Options source not configured.",
      signatureInstruction: "Sign in the box above",
      signatureClearButton: "Clear",
      signatureAriaLabel: "Digital Signature",
      signatureTypeLabel: "Type your full name:",
      signatureTypePlaceholder: "Your name",
      signatureModeDrawLabel: "Draw",
      signatureModeTypeLabel: "Type",
      signatureInputVal: "Signed",
      fileClickToUpload: "Click to upload or drag files here",
      fileTypeRequirements: "PDF, Word, Excel or Images (Max 5MB)",
      fileTooLargeError: "The file is too large. Maximum allowed size: 5MB.",
      fileUploaderActiveIcon: "file-check",
      fileDeleteTitle: "Delete file",
      fileDownloadTitle: "Download attachment",
      fileNoneUploaded: "No file uploaded",
      repeaterDeleteItemTitle: "Delete item",
      normalizeFormUntitled: "Untitled Form",
      normalizePageDefault: "Page"
    };

    this.translations = Object.assign({}, defaultEnglish, activeSystemTranslations, this.customTranslationsOverride || {});
    this.drawActivePage();
  }

  /**
   * Lets an end-user save/print their filled form as a PDF using only the
   * browser's native Print dialog — no backend, no third-party library.
   * Flattens every page into one continuous read-only view (each wizard page's
   * title is kept as a heading), renders it via a throwaway OpenFormRenderer
   * instance so the live, in-progress form is never disturbed, turns its controls
   * into static text (so long answers aren't clipped by input boxes and nothing
   * depends on "Background graphics" being on), then triggers window.print().
   *
   * @param {Object} [options]
   * @param {string} [options.title] Document title while the dialog is open: browsers use
   *   it as the default "Save as PDF" file name and in their page header. Defaults to the
   *   (translated) form title.
   */
  print(options = {}) {
    if (this._destroyed) return;
    if (!this.schema || !this.schema.pages || this.schema.pages.length === 0) return;

    const flatSchema = JSON.parse(JSON.stringify(this.schema));
    // Wizard page titles survive the flattening as headings before each page's first section
    const pageHeadings = flatSchema.pages.length < 2 ? [] : flatSchema.pages
      .map(page => ({
        sectionIds: (page.sections || []).map(section => String(section.sectionId)),
        title: this.getTranslatedValue('pages', page.pageId, null, null, page.title)
      }))
      .filter(heading => heading.sectionIds.length > 0 && heading.title);
    const flattenedSections = flatSchema.pages.reduce((acc, page) => acc.concat(page.sections || []), []);
    flatSchema.pages = [{ ...flatSchema.pages[0], sections: flattenedSections }];

    // A previous print() that never got its afterprint event: tear it down first
    this._cleanupPrint();
    const existingRoot = document.getElementById('openforms-print-root');
    if (existingRoot) existingRoot.remove();

    const printRoot = document.createElement('div');
    printRoot.id = 'openforms-print-root';
    document.body.appendChild(printRoot);

    const printRenderer = new OpenFormRenderer({
      containerEl: printRoot,
      locale: this.locale,
      translations: this.customTranslationsOverride,
      optionsProvider: this.optionsProvider,
      onSubmit: () => {},
      onFieldChange: () => {}
    });
    // Reuse the live form's already-loaded API options instead of calling the provider again
    printRenderer._optionsCache = this._optionsCache;
    printRenderer.render(flatSchema, this.answers, true);

    // The print CSS only hides the host page while a snapshot is pending, so the host's own
    // window.print() keeps working when no OpenForms print is in progress.
    const htmlEl = document.documentElement;
    htmlEl.classList.add('openforms-printing');
    // Page margins only for this printout (an @page rule in openforms.css would also change
    // the host page's own printing). Paper size stays whatever the user picks (A4/Letter).
    const pageStyle = document.createElement('style');
    pageStyle.id = 'openforms-print-page-style';
    pageStyle.textContent = '@page { margin: 14mm 12mm; }';
    document.head.appendChild(pageStyle);
    const previousTitle = document.title;
    const customTitle = options && typeof options.title === 'string' ? options.title.trim() : '';
    const printTitle = customTitle || this.getTranslatedValue('form', 'formTitle', null, null, this.schema.formTitle || this.translations.normalizeFormUntitled);
    if (printTitle) document.title = printTitle;

    const cleanup = () => {
      if (this._printHandler) {
        window.removeEventListener('afterprint', this._printHandler);
        this._printHandler = null;
      }
      printRenderer.destroy();
      if (printRoot.parentNode) printRoot.remove();
      htmlEl.classList.remove('openforms-printing');
      if (pageStyle.parentNode) pageStyle.remove();
      // Only restore the title if the host didn't change it in the meantime
      if (printTitle && document.title === printTitle) document.title = previousTitle;
      if (this._printCleanup === cleanup) this._printCleanup = null;
    };
    this._printCleanup = cleanup;

    if (typeof window.print === 'function') {
      this._printHandler = cleanup;
      window.addEventListener('afterprint', cleanup, { once: true });
      const openDialog = () => {
        if (this._printCleanup === cleanup) window.print();
      };
      const prepareAndOpen = () => {
        if (this._printCleanup !== cleanup) return;
        printRenderer._staticizeForPrint(pageHeadings);
        // Signature/attachment images are data: URLs: make sure they're decoded before the
        // browser lays out the printout, or they can come out blank.
        const images = Array.from(printRoot.querySelectorAll('img'))
          .filter(img => img.complete === false && typeof img.decode === 'function');
        if (images.length === 0) {
          openDialog();
          return;
        }
        let opened = false;
        const openOnce = () => {
          if (opened) return;
          opened = true;
          openDialog();
        };
        Promise.allSettled(images.map(img => img.decode())).then(openOnce);
        this._setTimeout(openOnce, 2000);
      };
      // API-sourced options may still be loading: wait for them so the printout has them
      const pending = Array.from(printRenderer._pendingOptionLoads);
      if (pending.length === 0) {
        prepareAndOpen();
      } else {
        Promise.allSettled(pending).then(prepareAndOpen);
      }
    } else {
      cleanup();
    }
  }

  /** Tears down a print snapshot left by print() (no-op if none is pending). */
  _cleanupPrint() {
    if (this._printCleanup) this._printCleanup();
  }

  /** Print-only strings; hosts can override them through the `translations` option. */
  _printStrings() {
    const english = { printYes: 'Yes', printNo: 'No', printGeneratedOn: 'Generated on {date}' };
    const builtIn = {
      'pt-BR': { printYes: 'Sim', printNo: 'Não', printGeneratedOn: 'Gerado em {date}' },
      'es-ES': { printYes: 'Sí', printNo: 'No', printGeneratedOn: 'Generado el {date}' }
    };
    const strings = Object.assign({}, english, builtIn[this.locale] || {});
    const overrides = this.customTranslationsOverride || {};
    Object.keys(english).forEach(key => {
      if (typeof overrides[key] === 'string') strings[key] = overrides[key];
    });
    return strings;
  }

  /**
   * Maps each signature canvas id (top-level and inside repeater items) to its stored
   * value, so the print snapshot can show it as an image.
   */
  _collectPrintSignatures() {
    const signatures = new Map();
    const answers = this.answers || {};
    const eachField = (rows, fn) => (rows || []).forEach(row => (row.columns || []).forEach(col => {
      if (col && col.field) fn(col.field);
    }));
    (this.schema.pages || []).forEach(page => (page.sections || []).forEach(section => eachField(section.rows, field => {
      if (field.type === 'signature') {
        signatures.set(String(field.id), answers[field.key]);
      } else if (field.type === 'repeater' && Array.isArray(answers[field.key])) {
        answers[field.key].forEach((item, index) => eachField(field.rows, subField => {
          if (subField.type === 'signature' && item) {
            signatures.set(`${field.id}-${index}-${subField.id}`, item[subField.key]);
          }
        }));
      }
    })));
    return signatures;
  }

  /**
   * Turns this (read-only, print-snapshot) renderer's DOM into a static document:
   * text/number/date/dropdown controls become plain text blocks that grow with their
   * content, switches become Yes/No, signature canvases become images, wizard page
   * titles become headings and a "Generated on" line is added under the form title.
   * Radios, checkboxes and matrix cells stay as they are and are styled by the print CSS.
   */
  _staticizeForPrint(pageHeadings = []) {
    const root = this.formEl;
    if (!root) return;
    const strings = this._printStrings();
    const intlLocale = this.locale && this.locale !== 'default' ? this.locale : undefined;

    const makeValue = (text, extraClass) => {
      const el = document.createElement('div');
      el.className = `openforms-print-value${extraClass ? ` ${extraClass}` : ''}`;
      const str = text === null || text === undefined ? '' : String(text);
      if (str.trim() === '') el.classList.add('is-empty');
      el.textContent = str;
      return el;
    };

    // Signature canvases were never painted (the snapshot is display:none until printed):
    // show the stored image instead, scaled without distortion.
    const signatures = this._collectPrintSignatures();
    root.querySelectorAll('canvas.form-signature-canvas').forEach(canvas => {
      const value = signatures.get(canvas.id.replace(/^canvas-/, ''));
      let replacement;
      if (typeof value === 'string' && /^data:image\//i.test(value.trim())) {
        replacement = document.createElement('img');
        replacement.alt = canvas.getAttribute('aria-label') || '';
        replacement.src = value.trim();
        replacement.className = 'openforms-print-signature';
      } else {
        replacement = document.createElement('div');
        replacement.className = 'openforms-print-signature is-empty';
      }
      canvas.replaceWith(replacement);
    });
    this.teardownSignaturePads();

    root.querySelectorAll('.form-switch-container').forEach(label => {
      const input = label.querySelector('input[type="checkbox"]');
      label.replaceWith(makeValue(input && input.checked ? strings.printYes : strings.printNo, 'is-boolean'));
    });

    root.querySelectorAll('input.form-input, textarea.form-input, select.form-input').forEach(control => {
      if (control.type === 'hidden') return;
      let text;
      if (control.tagName === 'SELECT') {
        const option = control.options[control.selectedIndex];
        text = control.value !== '' && option ? option.textContent.trim() : '';
      } else if (control.type === 'date') {
        text = OpenFormRenderer._formatPrintDate(control.value, intlLocale);
      } else if (control.type === 'number') {
        text = OpenFormRenderer._formatPrintNumber(control.value, intlLocale);
      } else {
        text = control.value;
      }
      control.replaceWith(makeValue(text, control.tagName === 'TEXTAREA' ? 'is-multiline' : ''));
    });
    root.querySelectorAll('.form-input-icon').forEach(icon => icon.remove());

    // Fields are kept whole on one page, except repeaters and matrices, which can be taller
    // than a page: those may break between their items/rows instead.
    root.querySelectorAll('.is-repeater-container, .form-matrix-wrapper').forEach(el => {
      [el.closest('.form-input-wrapper'), el.closest('.form-column')].forEach(ancestor => {
        if (ancestor) ancestor.classList.add('openforms-print-breakable');
      });
    });

    if (pageHeadings.length) {
      const sections = Array.from(root.querySelectorAll('[data-renderer-section-id]'));
      pageHeadings.forEach(({ sectionIds, title }) => {
        const pageSections = sections.filter(el => sectionIds.includes(el.getAttribute('data-renderer-section-id')));
        if (pageSections.length === 0 || pageSections.every(el => el.style.display === 'none')) return;
        const heading = document.createElement('h3');
        heading.className = 'openforms-print-page-title';
        heading.textContent = title;
        pageSections[0].parentNode.insertBefore(heading, pageSections[0]);
      });
    }

    const header = root.querySelector('.renderer-form-header');
    if (header && strings.printGeneratedOn) {
      let stamp;
      try {
        stamp = new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
      } catch (e) {
        stamp = new Date().toLocaleString();
      }
      const meta = document.createElement('p');
      meta.className = 'openforms-print-meta';
      meta.textContent = strings.printGeneratedOn.replace('{date}', stamp);
      header.appendChild(meta);
    }
  }

  /** "2026-11-03" -> a localized, unambiguous date ("Nov 3, 2026" / "3 de nov. de 2026"). */
  static _formatPrintDate(value, locale) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
    if (!match) return value || '';
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
    } catch (e) {
      return value;
    }
  }

  /** Numbers in the reader's decimal format, without thousands grouping (ids, years...). */
  static _formatPrintNumber(value, locale) {
    const str = String(value === null || value === undefined ? '' : value).trim();
    if (str === '' || !isFinite(Number(str))) return str;
    try {
      return new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 20 }).format(Number(str));
    } catch (e) {
      return str;
    }
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

    this.ensureLightbox();
  }

  /**
   * Injects the shared image lightbox overlay into <body> if it isn't there yet. Shared by
   * every renderer on the page; destroy() removes it once no other renderer is mounted,
   * and handleAttachmentClick() re-creates it lazily if needed.
   */
  ensureLightbox() {
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
   * Unmounts this renderer and removes everything it added outside its container:
   * window mouseup/touchend listeners, ResizeObservers, pending timers/animation frames,
   * its toasts, an open upload action sheet and a pending print snapshot. In-flight
   * optionsProvider results are ignored once they resolve. The container is emptied.
   *
   * Nodes shared by every renderer on the page (the #lightbox-modal overlay, a
   * #toast-container this script created, and the Caveat <link id="form-handwriting-font">)
   * are removed only when no other renderer is still mounted in the document; a
   * #toast-container supplied by the host page is never removed.
   *
   * Idempotent; every public method becomes a no-op afterwards.
   */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    this._cleanupPrint();
    this.teardownSignaturePads();

    this._timers.forEach(id => clearTimeout(id));
    this._timers.clear();
    this._frames.forEach(id => cancelAnimationFrame(id));
    this._frames.clear();
    this._optionsCache = new Map();
    this._pendingOptionLoads = new Set();

    this._toasts.forEach(toast => toast.remove());
    this._toasts.clear();
    if (this._actionSheetEl) {
      this._actionSheetEl.remove();
      this._actionSheetEl = null;
    }

    if (this.formEl) this.formEl.innerHTML = '';
    if (this.containerEl) this.containerEl.innerHTML = '';
    this.uploadedFiles = {};

    // Shared page-level nodes: only the last mounted renderer cleans them up
    const otherRendererMounted = !!document.querySelector('.renderer-form-card');
    if (!otherRendererMounted) {
      const lightbox = document.getElementById('lightbox-modal');
      if (lightbox) lightbox.remove();
      const toastContainer = document.getElementById('toast-container');
      if (toastContainer && toastContainer.getAttribute('data-openforms-renderer') === 'true' && toastContainer.children.length === 0) {
        toastContainer.remove();
      }
      const fontLink = document.getElementById('form-handwriting-font');
      if (fontLink) fontLink.remove();
    }
  }

  /**
   * Triggers re-rendering of the dynamic form player
   */
  render(schemaJSON, answers = null, readOnly = false) {
    if (this._destroyed) return;
    this.readOnly = readOnly;

    // Per-record state never carries over from a previous render(): attachments and
    // signature pads are rebuilt from `answers` by initFileUploader/initSignatureCanvas,
    // and API options are re-requested for the new schema.
    this.resetRecordState();

    const isNewRecord = answers !== null && answers !== undefined;
    this.answers = isNewRecord ? answers : (this.answers || {});

    this.schema = this.normalizeSchema(schemaJSON);

    // A record passed in explicitly always opens on its first page. A bare render(schema)
    // (live preview refresh of the same in-progress record) keeps the current page if it
    // still exists.
    if (isNewRecord || typeof this.activePageIndex !== 'number' || this.activePageIndex >= this.schema.pages.length) {
      this.activePageIndex = 0;
    }

    this.recalculateFormulas();
    this.drawActivePage();
  }

  /**
   * Drops every piece of state derived from the previous schema/answers: uploaded file
   * cache, signature pads (with their window listeners and ResizeObservers), rule-state
   * caches and the API options cache. In-flight provider results become stale.
   */
  resetRecordState() {
    this.teardownSignaturePads();
    this.uploadedFiles = {};
    this._optionsCache = new Map();
    this._pendingOptionLoads = new Set();
    this.fieldVisibilityStates = {};
    this.fieldRequiredStates = {};
    this.fieldDisabledStates = {};
    this.sectionVisibilityStates = {};
    this._drawGeneration++;
  }

  /**
   * Removes the window-level mouseup/touchend listeners and ResizeObservers of every
   * signature pad and forgets the pads. Pads are recreated by initSignatureCanvas on draw.
   */
  teardownSignaturePads() {
    Object.keys(this.signaturePads || {}).forEach(id => this.teardownSignaturePad(id));
    this.signaturePads = {};
  }

  teardownSignaturePad(id) {
    const padState = this.signaturePads[id];
    if (!padState) return;
    if (padState.stopDraw) {
      window.removeEventListener('mouseup', padState.stopDraw);
      window.removeEventListener('touchend', padState.stopDraw);
    }
    if (padState.resizeObserver) {
      padState.resizeObserver.disconnect();
      padState.resizeObserver = null;
    }
    delete this.signaturePads[id];
  }

  /**
   * Draw selected page contents
   */
  drawActivePage() {
    if (this._destroyed) return;
    // The previous page's DOM is about to be discarded: drop its signature pads (window
    // listeners + ResizeObservers) and invalidate pending option loads that target it.
    this.teardownSignaturePads();
    this._drawGeneration++;
    this.formEl.innerHTML = '';
    const esc = OpenFormRenderer.escapeHtml;

    if (!this.schema || this.schema.pages.length === 0) {
      this.formEl.innerHTML = `
        <div style="text-align: center; color: var(--color-neutral-7); padding: var(--space-xl) 0;">
          <i data-lucide="info" style="width: 32px; height: 32px; color: var(--color-neutral-5); margin-bottom: var(--space-s);"></i>
          <p style="font-size: var(--font-size-base);">${esc(this.translations.formEmptyStructure)}</p>
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
      <h2 class="renderer-form-title" id="renderer-form-title">${esc(displayFormTitle)}</h2>
      ${displayFormDesc ? `<p class="renderer-form-desc">${esc(displayFormDesc)}</p>` : ''}
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
        const secTitleEl = document.createElement('h3');
        secTitleEl.textContent = displaySecTitle;
        secHeader.appendChild(secTitleEl);
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

          // Calculated fields can opt out of being shown on the form (e.g. when they only
          // exist to feed a Cross-Field Validation) while still being computed and answered.
          if (field.isCalculated && field.isVisibleOnForm === false) return;

          const colEl = document.createElement('div');
          colEl.className = `form-column col-${col.width}`;
          colEl.setAttribute('data-field-id', field.id);
          colEl.setAttribute('data-field-key', field.key || '');

          const widgetWrapper = this.createWidgetWrapper(field);
          colEl.appendChild(widgetWrapper);
          rowEl.appendChild(colEl);
        });

        if (rowEl.children.length > 0) {
          secBody.appendChild(rowEl);
        }
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
        <button type="submit" class="pg-btn" style="padding: 10px var(--space-l); font-size: var(--font-size-base);">
          <i data-lucide="check"></i> ${esc(this.translations.formSubmitButton)}
        </button>
        `}
      `;
    } else {
      // Pagination buttons
      const isFirst = this.activePageIndex === 0;
      const isLast = this.activePageIndex === totalPages - 1;

      navigationEl.innerHTML = `
        <button type="button" id="btn-prev-page" class="pg-btn pg-btn-secondary" style="padding: 10px 20px; font-size: var(--font-size-base); visibility: ${isFirst ? 'hidden' : 'visible'}">
          <i data-lucide="arrow-left"></i> ${esc(this.translations.formPrevPageButton)}
        </button>
        
        ${isLast ? (this.readOnly ? '<div></div>' : `
        <button type="submit" class="pg-btn" style="padding: 10px var(--space-l); font-size: var(--font-size-base);">
          <i data-lucide="check"></i> ${esc(this.translations.formSubmitButton)}
        </button>
        `) : `
        <button type="button" id="btn-next-page" class="pg-btn" style="padding: 10px 20px; font-size: var(--font-size-base);">
          ${esc(this.translations.formNextPageButton)} <i data-lucide="arrow-right"></i>
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
      label.id = `label-${field.id}`;
      label.setAttribute('for', `input-${field.id}`);
      label.textContent = this.getTranslatedValue('fields', field.key, 'label', null, field.label);
      wrapper.appendChild(label);
    }

    const container = document.createElement('div');
    container.className = 'form-input-container';
    wrapper.appendChild(container);

    // Everything interpolated into the templates below is escaped: labels, placeholders,
    // translations and even field ids come from the schema / host and are untrusted.
    const esc = OpenFormRenderer.escapeHtml;
    const fid = esc(field.id);

    // Widget layouts based on type
    switch (field.type) {
      case 'header':
        wrapper.classList.add('is-header');
        const headerLabel = this.getTranslatedValue('fields', field.key || field.id, 'label', null, field.label);
        const headerSub = this.getTranslatedValue('fields', field.key || field.id, 'subtitle', null, field.subtitle || '');
        container.innerHTML = `
          <div class="form-section-header">
            <h3 class="form-section-title">${esc(headerLabel)}</h3>
            ${headerSub ? `<p class="form-section-subtitle">${esc(headerSub)}</p>` : ''}
          </div>
        `;
        break;

      case 'paragraph':
        wrapper.classList.add('is-paragraph');
        const displayPara = this.getTranslatedValue('fields', field.key || field.id, 'label', null, field.label);
        // Plain text only, never HTML: line breaks are kept by `white-space: pre-wrap`
        const paraEl = document.createElement('div');
        paraEl.className = 'form-paragraph-text';
        paraEl.textContent = displayPara === null || displayPara === undefined ? '' : String(displayPara);
        container.appendChild(paraEl);
        break;

      case 'text':
        const txtPlaceholder = this.getTranslatedValue('fields', field.key, 'placeholder', null, field.placeholder || '');
        container.innerHTML = `
          <i data-lucide="text-cursor-input" class="form-input-icon"></i>
          <input type="text" id="input-${fid}" class="form-input" 
                 placeholder="${esc(txtPlaceholder)}" ${field.required ? 'required aria-required="true"' : ''}
                 aria-describedby="error-${fid}" />
        `;
        break;

      case 'textarea':
        const taPlaceholder = this.getTranslatedValue('fields', field.key, 'placeholder', null, field.placeholder || '');
        container.innerHTML = `
          <textarea id="input-${fid}" class="form-input" rows="4"
                    placeholder="${esc(taPlaceholder)}" ${field.required ? 'required aria-required="true"' : ''}
                    aria-describedby="error-${fid}"></textarea>
        `;
        break;

      case 'number':
        const numPlaceholder = this.getTranslatedValue('fields', field.key, 'placeholder', null, field.placeholder || '0');
        const iconName = field.isCalculated ? 'calculator' : 'binary';
        const readonlyAttr = (field.isCalculated || this.readOnly) ? 'readonly style="background: var(--color-neutral-2); cursor: not-allowed;"' : '';
        container.innerHTML = `
          <i data-lucide="${iconName}" class="form-input-icon"></i>
          <input type="number" id="input-${fid}" class="form-input" 
                 placeholder="${esc(numPlaceholder)}" ${field.required ? 'required aria-required="true"' : ''} ${readonlyAttr}
                 aria-describedby="error-${fid}" />
        `;
        break;

      case 'date':
        container.innerHTML = `
          <i data-lucide="calendar" class="form-input-icon"></i>
          <input type="date" id="input-${fid}" class="form-input" ${field.required ? 'required aria-required="true"' : ''}
                 aria-describedby="error-${fid}" />
        `;
        break;

      case 'boolean':
        container.innerHTML = `
          <label class="form-switch-container">
            <span class="form-switch">
              <input type="checkbox" id="input-${fid}" ${this.answers[field.key] ? 'checked' : ''}
                     aria-describedby="error-${fid}" />
              <span class="form-slider"></span>
            </span>
            <span class="form-switch-label" aria-hidden="true" style="font-size: var(--font-size-s); color: var(--color-neutral-8);">Yes / No</span>
          </label>
        `;
        break;

      case 'dropdown':
        container.innerHTML = `
          <i data-lucide="list-collapse" class="form-input-icon"></i>
          <select id="input-${fid}" class="form-input" ${field.required ? 'required aria-required="true"' : ''}
                  aria-describedby="error-${fid}">
            <option value="">${esc(this.translations.selectOptionPlaceholder)}</option>
          </select>
        `;
        this.loadDropdownOptions(field, container.querySelector('select'));
        break;

      case 'radio':
        container.innerHTML = `
          <div id="group-${fid}" class="form-radio-group" role="radiogroup" aria-labelledby="label-${fid}"></div>
        `;
        this.loadRadioOptions(field, container.querySelector('.form-radio-group'));
        break;

      case 'checkbox':
        container.innerHTML = `
          <div id="group-${fid}" class="form-checkbox-group" role="group" aria-labelledby="label-${fid}"></div>
        `;
        this.loadCheckboxOptions(field, container.querySelector('.form-checkbox-group'));
        break;

      case 'signature':
        container.classList.add('is-signature-container');
        container.setAttribute('role', 'group');
        container.setAttribute('aria-labelledby', `label-${field.id}`);
        const signatureFieldLabel = this.getTranslatedValue('fields', field.key, 'label', null, field.label);
        container.innerHTML = `
          <div class="form-signature-box ${this.readOnly ? 'is-readonly' : ''}">
            <canvas id="canvas-${fid}" class="form-signature-canvas" width="500" height="150" role="img" aria-label="${esc(signatureFieldLabel)}: ${esc(this.translations.signatureAriaLabel)}" style="display: block;"></canvas>

            ${this.readOnly ? '' : `
            <div id="type-container-${fid}" style="display: none; padding: var(--space-m); border-top: 1px solid var(--pg-border); background: var(--color-neutral-2);">
              <label for="type-input-${fid}" style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-neutral-7); display: block; margin-bottom: 6px;">${esc(this.translations.signatureTypeLabel)}</label>
              <input type="text" id="type-input-${fid}" class="form-input" placeholder="${esc(this.translations.signatureTypePlaceholder)}" aria-describedby="error-${fid}" style="font-family: 'Caveat', cursive; font-size: 20px; font-weight: var(--font-weight-medium);" />
            </div>

            <div class="form-signature-bar">
              <span class="form-signature-indicator" id="indicator-${fid}">
                <i data-lucide="pen-tool"></i> ${esc(this.translations.signatureInstruction)}
              </span>
              <button type="button" id="clear-${fid}" class="form-signature-clear">
                <i data-lucide="rotate-ccw" style="width: 12px; height: 12px;"></i> ${esc(this.translations.signatureClearButton)}
              </button>
            </div>
            `}
          </div>
          ${this.readOnly ? '' : `
          <div class="signature-mode-bar" style="display: flex; gap: var(--space-s); margin-top: var(--space-s);">
            <button type="button" id="mode-draw-${fid}" class="signature-mode-tab active" aria-pressed="true" style="font-size: var(--font-size-xs); padding: var(--space-xs) var(--space-m); border-radius: var(--border-radius-xs); border: 1px solid var(--pg-border); background: var(--color-neutral-2); color: var(--color-neutral-8); cursor: pointer;">
              <i data-lucide="edit-3" style="width: 12px; height: 12px; vertical-align: middle;"></i> ${esc(this.translations.signatureModeDrawLabel)}
            </button>
            <button type="button" id="mode-type-${fid}" class="signature-mode-tab" aria-pressed="false" style="font-size: var(--font-size-xs); padding: var(--space-xs) var(--space-m); border-radius: var(--border-radius-xs); border: 1px solid var(--pg-border); background: transparent; color: var(--color-neutral-8); cursor: pointer;">
              <i data-lucide="keyboard" style="width: 12px; height: 12px; vertical-align: middle;"></i> ${esc(this.translations.signatureModeTypeLabel)}
            </button>
          </div>
          `}
          <input type="hidden" id="input-${fid}" ${field.required ? 'required aria-required="true"' : ''} aria-describedby="error-${fid}" />
        `;
        break;

      case 'file':
        container.innerHTML = `
          <div id="uploader-${fid}" class="form-file-uploader" style="display: flex;" role="button" tabindex="0" aria-labelledby="label-${fid}">
            <i data-lucide="upload-cloud"></i>
            <div style="font-size: var(--font-size-s); font-weight: var(--font-weight-semibold); color: var(--color-neutral-10); margin-bottom: 2px;">
              ${esc(this.translations.fileClickToUpload)}
            </div>
            <div style="font-size: var(--font-size-xs); color: var(--color-neutral-7);">${(() => {
            let reqText = this.getTranslatedValue('fields', field.key || field.id, 'fileRequirementsText', null, field.fileRequirementsText || this.translations.fileTypeRequirements);
            if (!field.fileRequirementsText) {
              const maxLimit = field.maxFileSizeMB !== undefined ? field.maxFileSizeMB : 5;
              reqText = reqText.replace('5MB', `${maxLimit}MB`).replace('5 MB', `${maxLimit} MB`);
            }
            return esc(reqText);
          })()}</div>
            <input type="file" id="filepicker-${fid}" style="display: none;" accept="${esc(field.acceptedTypes || '.pdf,.docx,image/*')}" />
          </div>
          <div id="filedetails-${fid}" style="display: none;"></div>
          <input type="hidden" id="input-${fid}" ${field.required ? 'required' : ''} />
        `;
        break;

      case 'repeater':
        container.classList.add('is-repeater-container');
        this.renderRepeaterWidget(field, container);
        break;

      case 'matrix':
        container.innerHTML = `
          <div class="form-matrix-wrapper">
            <table class="form-matrix-table" id="matrix-${fid}"></table>
          </div>
        `;
        this.loadMatrixWidget(field, container.querySelector('.form-matrix-table'));
        break;
    }

    // Required warning messages
    if (!['header', 'paragraph'].includes(field.type)) {
      const errorEl = document.createElement('span');
      errorEl.className = 'form-error-message';
      errorEl.id = `error-${field.id}`;
      errorEl.setAttribute('role', 'alert');
      errorEl.innerHTML = `<i data-lucide="alert-circle"></i> ${esc(this.translations.requiredFieldBubble)}`;
      wrapper.appendChild(errorEl);
    }

    return wrapper;
  }

  /**
   * Load options feed inside dropdown elements
   */
  loadDropdownOptions(field, selectEl) {
    const selectedVal = this.answers[field.key];
    const isSelected = (value) => selectedVal !== undefined && selectedVal !== null && selectedVal !== ''
      && (value === selectedVal || String(value) === String(selectedVal));

    const appendOptions = (options, translate) => {
      options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = translate
          ? this.getTranslatedValue('fields', field.key, 'options', opt.value, opt.label)
          : opt.label;
        selectEl.appendChild(o);
        if (isSelected(opt.value)) {
          o.selected = true;
          selectEl.value = o.value;
        }
      });
    };

    if (field.optionsType === 'static') {
      if (Array.isArray(field.options)) appendOptions(field.options, true);
    } else if (field.optionsType === 'api') {
      const optionLoading = document.createElement('option');
      optionLoading.value = "";
      optionLoading.textContent = this.translations.dropdownLoading;
      selectEl.appendChild(optionLoading);
      selectEl.setAttribute('aria-busy', 'true');

      this.loadApiOptions(field, selectEl, {
        onLoaded: (options) => {
          optionLoading.remove();
          selectEl.removeAttribute('aria-busy');
          appendOptions(options, false);
        },
        onFailed: (messageKey) => {
          optionLoading.remove();
          selectEl.removeAttribute('aria-busy');
          this.showOptionsError(field, selectEl.parentNode, messageKey, selectEl);
        }
      });
    }
  }

  /**
   * Requests the options of an `optionsType: 'api'` field from the host's optionsProvider.
   * Never fabricates options: without a provider, or when it rejects / returns something
   * that isn't an array, onFailed(translationKey) is called instead. Results that arrive
   * after the target element was redrawn, re-rendered or destroyed are ignored.
   * Successful loads are cached per field + locale until the next render().
   */
  loadApiOptions(field, targetEl, { onLoaded, onFailed }) {
    if (!this.optionsProvider) {
      onFailed('optionsSourceUnavailable');
      return;
    }

    const generation = this._drawGeneration;
    const cacheKey = `${field.id}|${this.locale}`;
    let request = this._optionsCache.get(cacheKey);

    if (!request) {
      try {
        request = Promise.resolve(this.optionsProvider(field, { locale: this.locale, readOnly: !!this.readOnly }));
      } catch (err) {
        request = Promise.reject(err);
      }
      request = request.then(result => {
        if (!Array.isArray(result)) {
          throw new Error('optionsProvider must resolve to an array of {label, value}');
        }
        return result
          .filter(opt => opt && opt.value !== undefined && opt.value !== null)
          .map(opt => ({
            label: opt.label !== undefined && opt.label !== null ? String(opt.label) : String(opt.value),
            value: opt.value
          }));
      });
      this._optionsCache.set(cacheKey, request);
      // Failed loads aren't cached: the next draw asks the provider again
      const cache = this._optionsCache;
      request.catch(() => {
        if (cache.get(cacheKey) === request) cache.delete(cacheKey);
      });
    }

    const pendingLoads = this._pendingOptionLoads;
    const settled = request.then(
      (options) => {
        if (this.isStaleOptionsTarget(targetEl, generation)) return;
        onLoaded(options);
      },
      (err) => {
        if (this.isStaleOptionsTarget(targetEl, generation)) return;
        console.warn(`OpenFormRenderer: optionsProvider failed for field "${field.key}":`, err);
        onFailed('optionsLoadError');
      }
    );
    pendingLoads.add(settled);
    settled.then(() => pendingLoads.delete(settled));
  }

  /** True when an async options result no longer has a live place to go. */
  isStaleOptionsTarget(targetEl, generation) {
    if (this._destroyed) return true;
    if (generation !== this._drawGeneration) return true;
    return !this.formEl || !this.formEl.contains(targetEl);
  }

  /**
   * Shows a translated, screen-reader-announced message in place of an option list that
   * couldn't be loaded. `describedEl` (e.g. the <select>) gets it added to aria-describedby.
   */
  showOptionsError(field, hostEl, messageKey, describedEl = null) {
    if (!hostEl) return;
    const msg = document.createElement('span');
    msg.className = 'form-options-error';
    msg.id = `options-error-${field.id}`;
    msg.setAttribute('role', 'status');
    msg.textContent = this.translations[messageKey] || this.translations.optionsLoadError;
    if (describedEl) {
      // The <select> sits inside a flex row: put the message right after that row
      const row = hostEl.classList && hostEl.classList.contains('form-input-container') ? hostEl : null;
      if (row && row.parentNode) {
        row.parentNode.insertBefore(msg, row.nextSibling);
      } else {
        hostEl.appendChild(msg);
      }
      const describedBy = (describedEl.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      if (!describedBy.includes(msg.id)) describedBy.push(msg.id);
      describedEl.setAttribute('aria-describedby', describedBy.join(' '));
    } else {
      hostEl.innerHTML = '';
      hostEl.appendChild(msg);
    }
  }

  /**
   * Load options for Radio Buttons
   */
  loadRadioOptions(field, groupEl) {
    const selectedVal = this.answers[field.key];
    const esc = OpenFormRenderer.escapeHtml;

    const renderRadioItems = (options) => {
      groupEl.innerHTML = '';
      if (!Array.isArray(options) || options.length === 0) {
        groupEl.innerHTML = `<span class="form-options-empty">${esc(this.translations.radioNoOptions)}</span>`;
        return;
      }

      options.forEach((opt, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'form-radio-item';

        const radioId = `radio-${field.id}-${idx}`;
        const isChecked = selectedVal !== undefined && selectedVal !== null && selectedVal !== ''
          && (opt.value === selectedVal || String(opt.value) === String(selectedVal));

        const displayOptLabel = field.optionsType === 'static'
          ? this.getTranslatedValue('fields', field.key, 'options', opt.value, opt.label)
          : opt.label;

        itemEl.innerHTML = `
          <input type="radio" id="${esc(radioId)}" name="radio-${esc(field.id)}" value="${esc(opt.value)}" class="form-radio-input" ${isChecked ? 'checked' : ''} ${this.readOnly ? 'disabled' : ''} aria-describedby="error-${esc(field.id)}" />
          <label for="${esc(radioId)}" class="form-radio-label">${esc(displayOptLabel)}</label>
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
      groupEl.innerHTML = `<span class="form-options-loading">${esc(this.translations.radioLoading)}</span>`;
      groupEl.setAttribute('aria-busy', 'true');

      this.loadApiOptions(field, groupEl, {
        onLoaded: (options) => {
          groupEl.removeAttribute('aria-busy');
          renderRadioItems(options);
        },
        onFailed: (messageKey) => {
          groupEl.removeAttribute('aria-busy');
          this.showOptionsError(field, groupEl, messageKey);
        }
      });
    }
  }

  /**
   * Load options for Checkboxes (Multi-Select groups)
   */
  loadCheckboxOptions(field, groupEl) {
    const selectedVals = Array.isArray(this.answers[field.key]) ? this.answers[field.key] : [];
    const esc = OpenFormRenderer.escapeHtml;

    const renderCheckboxItems = (options) => {
      groupEl.innerHTML = '';
      if (!Array.isArray(options) || options.length === 0) {
        groupEl.innerHTML = `<span class="form-options-empty">${esc(this.translations.checkboxNoOptions)}</span>`;
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
          <input type="checkbox" id="${esc(checkboxId)}" name="checkbox-${esc(field.id)}" value="${esc(opt.value)}" class="form-checkbox-input" ${isChecked ? 'checked' : ''} ${this.readOnly ? 'disabled' : ''} aria-describedby="error-${esc(field.id)}" />
          <label for="${esc(checkboxId)}" class="form-checkbox-label">${esc(displayOptLabel)}</label>
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
      groupEl.innerHTML = `<span class="form-options-loading">${esc(this.translations.checkboxLoading)}</span>`;
      groupEl.setAttribute('aria-busy', 'true');

      this.loadApiOptions(field, groupEl, {
        onLoaded: (options) => {
          groupEl.removeAttribute('aria-busy');
          renderCheckboxItems(options);
        },
        onFailed: (messageKey) => {
          groupEl.removeAttribute('aria-busy');
          this.showOptionsError(field, groupEl, messageKey);
        }
      });
    }
  }

  /**
   * Load options and structure for Question Matrix
   */
  loadMatrixWidget(field, tableEl) {
    const selectedVals = this.answers[field.key] || {};
    const esc = OpenFormRenderer.escapeHtml;

    const renderMatrixTable = (options) => {
      tableEl.innerHTML = '';

      if (!Array.isArray(options) || options.length === 0) {
        tableEl.innerHTML = `<tr><td class="form-options-empty">${esc(this.translations.radioNoOptions)}</td></tr>`;
        return;
      }

      // Screen-reader-only caption: the visible field label already sits above the table
      // (createWidgetWrapper's <label>), this is just so table/grid navigation modes
      // announce what the matrix is about, not only "table, N rows, N columns".
      const caption = document.createElement('caption');
      caption.className = 'sr-only';
      caption.textContent = this.getTranslatedValue('fields', field.key, 'label', null, field.label);
      tableEl.appendChild(caption);

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
        th.setAttribute('scope', 'col');
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

        // <th scope="row"> (not <td>) so table/grid screen-reader navigation announces the
        // row's question alongside the column header when landing on a radio in this row.
        const labelTd = document.createElement('th');
        labelTd.setAttribute('scope', 'row');
        labelTd.className = 'form-matrix-row-label';

        // Translate row label
        const displayRowLabel = this.getTranslatedValue('fields', field.key, 'matrixRows', row.key, row.label);
        labelTd.textContent = displayRowLabel;
        tr.appendChild(labelTd);

        options.forEach((opt, optIdx) => {
          const td = document.createElement('td');
          td.className = 'form-matrix-cell';

          const radioId = `matrix-radio-${field.id}-${row.key}-${optIdx}`;
          const rowVal = selectedVals[row.key];
          const isChecked = rowVal !== undefined && rowVal !== null && rowVal !== ''
            && (rowVal === opt.value || String(rowVal) === String(opt.value));
          const displayOptLabel = field.optionsType === 'static'
            ? this.getTranslatedValue('fields', field.key, 'options', opt.value, opt.label)
            : opt.label;

          td.innerHTML = `
            <label class="form-matrix-radio-label" for="${esc(radioId)}">
              <input type="radio" id="${esc(radioId)}" name="matrix-${esc(field.id)}-${esc(row.key)}" value="${esc(opt.value)}" class="form-radio-input" aria-label="${esc(displayRowLabel)}: ${esc(displayOptLabel)}" ${isChecked ? 'checked' : ''} ${this.readOnly ? 'disabled' : ''} />
              <span class="matrix-cell-mobile-text">${esc(displayOptLabel)}</span>
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
      tableEl.innerHTML = `<tr><td class="form-options-loading">${esc(this.translations.radioLoading)}</td></tr>`;
      tableEl.setAttribute('aria-busy', 'true');

      this.loadApiOptions(field, tableEl, {
        onLoaded: (options) => {
          tableEl.removeAttribute('aria-busy');
          renderMatrixTable(options);
        },
        onFailed: (messageKey) => {
          tableEl.removeAttribute('aria-busy');
          tableEl.innerHTML = '';
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          tr.appendChild(td);
          tableEl.appendChild(tr);
          this.showOptionsError(field, td, messageKey);
        }
      });
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
   * Orders two values for greaterThan/lessThan-style comparisons.
   * Plain Number() coercion fails for date strings (e.g. "2026-06-30" -> NaN), so this
   * falls back to Date parsing, then to a lexicographic string compare, before giving up.
   */
  compareOrdinal(a, b) {
    // Guard undefined explicitly: Number(undefined)/Date.parse(undefined) are both NaN, so
    // this used to fall through to the string branch, where String(undefined) === "undefined"
    // sorts after any digit — an unanswered field would spuriously satisfy `greaterThan <number>`.
    // Returning NaN here makes every ordering operator (>, >=, <, <=) evaluate to false, same as
    // the old Number(a) > Number(b) behavior did for missing values.
    if (a === undefined || b === undefined) return NaN;

    const numA = Number(a);
    const numB = Number(b);
    if (a !== '' && b !== '' && !isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    const dateA = Date.parse(a);
    const dateB = Date.parse(b);
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return dateA - dateB;
    }

    return String(a).localeCompare(String(b));
  }

  /**
   * Evaluates individual conditional rules operator logic.
   * Supports compareMode: 'field' to resolve the comparison target from this.answers instead of a static value.
   */
  isConditionSatisfied(cond) {
    if (!cond || !cond.dependentFieldKey) return false;

    const dependentVal = this.answers[cond.dependentFieldKey];

    // Support field-to-field comparison (Cross-Field Validations)
    const compareMode = cond.compareMode || 'value';
    const targetVal = compareMode === 'field' && cond.compareToFieldKey
      ? this.answers[cond.compareToFieldKey]
      : cond.equalsValue;

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
        return this.compareOrdinal(dependentVal, targetVal) > 0;
      case 'greaterThanOrEquals':
      case 'gte':
        return this.compareOrdinal(dependentVal, targetVal) >= 0;
      case 'lessThan':
        return this.compareOrdinal(dependentVal, targetVal) < 0;
      case 'lessThanOrEquals':
      case 'lte':
        return this.compareOrdinal(dependentVal, targetVal) <= 0;
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
   * Removes stale Object.defineProperty answer keys, uploaded files, and signature pad
   * state scoped to a repeater's sub-fields. Needed whenever items are removed/reindexed —
   * otherwise the highest-index entries from before the change linger forever in
   * this.answers / this.uploadedFiles / this.signaturePads.
   */
  clearRepeaterScopedKeys(field) {
    const answerPrefix = `sub-${field.id}-`;
    Object.keys(this.answers).forEach(k => {
      if (k.startsWith(answerPrefix)) delete this.answers[k];
    });

    const scopedIdPrefix = `${field.id}-`;
    Object.keys(this.uploadedFiles).forEach(k => {
      if (k.startsWith(scopedIdPrefix)) delete this.uploadedFiles[k];
    });
    Object.keys(this.signaturePads).forEach(k => {
      if (k.startsWith(scopedIdPrefix)) this.teardownSignaturePad(k);
    });
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
      this.clearRepeaterScopedKeys(field);
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
  /**
   * Computes a field's visibility/required/disabled state purely from the schema and
   * this.answers — independent of whatever page is currently rendered in the DOM, and of
   * the fieldVisibilityStates/fieldRequiredStates/fieldDisabledStates caches (which only
   * ever reflect the currently active page). Single source of truth reused by
   * evalBusinessRules' relaxation loop (active page) and by validatePage / isFieldActiveInSchema
   * (any page, including ones not currently rendered).
   */
  evaluateFieldState(field, section) {
    let sectionVisible = true;
    if (section) {
      const secRules = section.conditionalRules || [];
      const hasSecVisRules = secRules.some(r => r.targetProperty === 'visibility');
      if (hasSecVisRules) {
        sectionVisible = secRules.filter(r => r.targetProperty === 'visibility').some(r => this.isRuleSatisfied(r));
      }
    }

    const rules = field.conditionalRules || [];

    const hasVisRules = rules.some(r => r.targetProperty === 'visibility');
    let fieldVisible = true;
    if (hasVisRules) {
      fieldVisible = rules.filter(r => r.targetProperty === 'visibility').some(r => this.isRuleSatisfied(r));
    }

    const hasReqRules = rules.some(r => r.targetProperty === 'required');
    let required = field.required || false;
    if (hasReqRules) {
      required = rules.filter(r => r.targetProperty === 'required').some(r => this.isRuleSatisfied(r));
    }

    const hasDisRules = rules.some(r => r.targetProperty === 'disabled');
    let disabled = field.disabled || false;
    if (hasDisRules) {
      disabled = rules.filter(r => r.targetProperty === 'disabled').some(r => this.isRuleSatisfied(r));
    }

    return {
      visible: sectionVisible && fieldVisible,
      required,
      disabled
    };
  }

  /**
   * Recomputes visibility/required/disabled state for the active page to a fixed point,
   * purely in memory (no DOM access here — see applyBusinessRulesToDOM), then applies the
   * converged state to the DOM in a single pass. Splitting compute from DOM application
   * avoids redundant DOM reads/writes on every relaxation iteration (up to 10x per keystroke).
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

      (activePage.sections || []).forEach(section => {
        const rules = section.conditionalRules || [];
        const hasVisibilityRules = rules.some(r => r.targetProperty === 'visibility');
        this.sectionVisibilityStates[section.sectionId] = hasVisibilityRules
          ? rules.filter(r => r.targetProperty === 'visibility').some(r => this.isRuleSatisfied(r))
          : true;
      });

      (activePage.sections || []).forEach(section => {
        (section.rows || []).forEach(row => {
          (row.columns || []).forEach(col => {
            if (!col.field) return;
            const field = col.field;
            const state = this.evaluateFieldState(field, section);

            this.fieldVisibilityStates[field.id] = state.visible;
            this.fieldRequiredStates[field.id] = state.required;
            this.fieldDisabledStates[field.id] = state.disabled;

            // Clear value if field became invisible — may cascade into another iteration,
            // since clearing can flip what a dependent rule evaluates to
            if (!state.visible && field.type !== 'header') {
              if (this.hasNonDefaultValue(field)) {
                this.clearFieldState(field);
                changed = true;
              }
            }
          });
        });
      });
    }

    this.applyBusinessRulesToDOM(activePage);
  }

  /**
   * Applies the converged fieldVisibilityStates/fieldRequiredStates/fieldDisabledStates/
   * sectionVisibilityStates maps to the DOM in a single pass.
   */
  applyBusinessRulesToDOM(activePage) {
    (activePage.sections || []).forEach(section => {
      const isSecVisible = this.sectionVisibilityStates[section.sectionId];
      const sectionEl = this.formEl.querySelector(`.renderer-section[data-renderer-section-id="${section.sectionId}"]`);
      if (sectionEl) {
        sectionEl.style.display = isSecVisible ? 'block' : 'none';
      }

      (section.rows || []).forEach(row => {
        (row.columns || []).forEach(col => {
          if (!col.field) return;
          const field = col.field;
          const overallVisible = this.fieldVisibilityStates[field.id];
          const isRequired = this.fieldRequiredStates[field.id];
          const isDisabled = this.fieldDisabledStates[field.id];

          const colEl = this.formEl.querySelector(`.form-column[data-field-id="${field.id}"]`);
          if (colEl) {
            colEl.style.display = overallVisible ? 'block' : 'none';
          }

          const fieldWrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
          if (fieldWrapper) {
            // The renderer's required indicator is the `.required` class on the field's own
            // .form-label (CSS draws the " *"). Only direct children: a repeater wrapper also
            // contains its sub-fields' labels.
            const labelEl = Array.from(fieldWrapper.children).find(el => el.classList.contains('form-label'));
            if (labelEl) {
              labelEl.classList.toggle('required', !!isRequired);
            }

            // Keep aria-required on the element assistive tech treats as the field: the
            // visible input/select/textarea (never the hidden value holder) or the radiogroup.
            const primaryInput = Array.from(fieldWrapper.querySelectorAll('input, select, textarea')).find(el => el.id === `input-${field.id}`);
            const radioGroup = field.type === 'radio' ? fieldWrapper.querySelector('[role="radiogroup"]') : null;
            [primaryInput && primaryInput.type !== 'hidden' ? primaryInput : null, radioGroup].forEach(el => {
              if (!el) return;
              if (isRequired) {
                el.setAttribute('aria-required', 'true');
              } else {
                el.removeAttribute('aria-required');
              }
            });

            const reqInputs = fieldWrapper.querySelectorAll('input, select, textarea');
            reqInputs.forEach(input => {
              if (isRequired) {
                input.setAttribute('required', 'required');
              } else {
                input.removeAttribute('required');
              }
            });

            if (isDisabled) {
              fieldWrapper.classList.add('is-disabled');
            } else {
              fieldWrapper.classList.remove('is-disabled');
            }
            const disInputs = fieldWrapper.querySelectorAll('input, select, textarea, button');
            disInputs.forEach(input => {
              if (isDisabled) {
                input.setAttribute('disabled', 'disabled');
              } else if (!this.readOnly) {
                input.removeAttribute('disabled');
              }
            });
          }
        });

        // Hide row if all fields inside it are hidden
        const rowEl = this.formEl.querySelector(`.renderer-row[data-renderer-row-id="${row.rowId}"]`);
        if (rowEl) {
          const isRowVisible = (row.columns || []).some(col => col.field && this.fieldVisibilityStates[col.field.id] === true);
          rowEl.style.display = isRowVisible ? 'grid' : 'none';
        }
      });
    });
  }

  /**
   * Helper that evaluates if a field is active, visible, and enabled in the final schema.
   * Works for any page, not just the currently active/rendered one — thin wrapper over
   * evaluateFieldState, kept for call-site readability.
   */
  isFieldActiveInSchema(field, section) {
    const state = this.evaluateFieldState(field, section);
    return state.visible && !state.disabled;
  }

  /**
   * Initializes high-fidelity touch canvas for Signature widgets
   */
  initSignatureCanvas(field, parentEl = null) {
    // Dynamic loading of Caveat handwriting font for accessibility fallback typed signatures
    if (!document.getElementById('form-handwriting-font')) {
      const link = document.createElement('link');
      link.id = 'form-handwriting-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap';
      document.head.appendChild(link);
    }

    const searchRoot = parentEl || this.formEl;
    if (!searchRoot) return;
    const canvas = searchRoot.querySelector(`#canvas-${field.id}`);
    const clearBtn = searchRoot.querySelector(`#clear-${field.id}`);
    const hiddenInput = searchRoot.querySelector(`#input-${field.id}`);

    if (!canvas) return;

    // Each call (re-)creates the canvas from scratch, but `window` listeners from a
    // prior init of this same field would otherwise stack up forever across re-renders.
    // Same for its ResizeObserver, which would keep observing the discarded canvas.
    this.teardownSignaturePad(field.id);

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
    if (typeof existingSignature === 'string' && existingSignature.startsWith('data:image')) {
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

            if (typeof currentSignature === 'string' && currentSignature.startsWith('data:image')) {
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

      if (typeof existingSignature === 'string' && existingSignature.startsWith('data:image')) {
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
    padState.stopDraw = stopDraw;

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
        // Disconnect ResizeObserver if active to prevent accumulation
        if (padState.resizeObserver) {
          padState.resizeObserver.disconnect();
          padState.resizeObserver = null;
        }
      });

      // Bind accessible draw vs type mode switchers
      const modeDrawBtn = searchRoot.querySelector(`#mode-draw-${field.id}`);
      const modeTypeBtn = searchRoot.querySelector(`#mode-type-${field.id}`);
      const typeContainer = searchRoot.querySelector(`#type-container-${field.id}`);
      const typeInput = searchRoot.querySelector(`#type-input-${field.id}`);
      const indicator = searchRoot.querySelector(`#indicator-${field.id}`);

      if (modeDrawBtn && modeTypeBtn && typeContainer && typeInput) {
        modeDrawBtn.addEventListener('click', () => {
          padState.mode = 'draw';
          modeDrawBtn.classList.add('active');
          modeDrawBtn.setAttribute('aria-pressed', 'true');
          modeDrawBtn.style.background = 'var(--color-neutral-2)';
          modeTypeBtn.classList.remove('active');
          modeTypeBtn.setAttribute('aria-pressed', 'false');
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
          modeTypeBtn.setAttribute('aria-pressed', 'true');
          modeTypeBtn.style.background = 'var(--color-neutral-2)';
          modeDrawBtn.classList.remove('active');
          modeDrawBtn.setAttribute('aria-pressed', 'false');
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
  initFileUploader(field, parentEl = null) {
    const searchRoot = parentEl || this.formEl;
    if (!searchRoot) return;
    const uploader = searchRoot.querySelector(`#uploader-${field.id}`);
    const picker = searchRoot.querySelector(`#filepicker-${field.id}`);
    const details = searchRoot.querySelector(`#filedetails-${field.id}`);
    const hiddenInput = searchRoot.querySelector(`#input-${field.id}`);

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
          <i data-lucide="file" style="margin-bottom: var(--space-s);"></i>
          <div style="font-size: var(--font-size-s); color: var(--color-neutral-6);">${OpenFormRenderer.escapeHtml(this.translations.fileNoneUploaded)}</div>
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

    // Keyboard operability: uploader is a plain div acting as a button (role="button"
    // tabindex="0" set at render time) since it needs to host drag-and-drop too — native
    // <button>/<label> elements don't reliably support drop zones across browsers. Space/Enter
    // re-dispatch a click rather than duplicating the branching camera-vs-picker logic below.
    uploader.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        uploader.click();
      }
    });

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
      this.showToast(errorMsg, true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // The form may have been redrawn, re-rendered or destroyed while the file was read
      if (this._destroyed || !hiddenInput || !this.formEl.contains(hiddenInput)) return;
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
      if (!OpenFormRenderer.isSafeDataUrl(file.content)) return;
      this.ensureLightbox();
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
    if (!file || !OpenFormRenderer.isSafeDataUrl(file.content)) return;
    const isCordovaShare = !!(window.plugins && window.plugins.socialsharing);
    const isCapacitorShare = !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share);

    if (isCordovaShare) {
      window.plugins.socialsharing.share(
        null,
        file.name,
        file.content,
        null,
        () => { },
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
          const picker = this.formEl.querySelector(`#filepicker-${field.id}`);
          if (picker) picker.value = '';
          details.style.display = 'none';
          if (uploader) uploader.style.display = 'flex';
          this.evalBusinessRules();
          this.recalculateFormulas();
        });
      }
    }
  }

  formatFileSize(bytes) {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Helper to render premium file attachment details with image thumbnails and download triggers
   */
  renderFileDetailsHTML(file, isReadOnly) {
    const esc = OpenFormRenderer.escapeHtml;
    // File name/content come from the end-user (or stored answers): escape the name
    // everywhere and only link/preview `data:` content — anything else gets no href/src.
    const hasSafeContent = OpenFormRenderer.isSafeDataUrl(file.content);
    const isImg = hasSafeContent && (String(file.type || '').startsWith('image/') || /^data:image\//i.test(file.content));
    const previewHtml = isImg ? `
      <div class="form-file-preview-thumbnail" style="margin-right: var(--space-m); width: 44px; height: 44px; border-radius: var(--border-radius-xs); overflow: hidden; border: 1px solid var(--color-neutral-4); flex-shrink: 0; background: var(--color-neutral-2);">
        <img src="${esc(file.content)}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    ` : '';

    return `
      <div class="form-file-details-left" style="display: flex; align-items: center; flex: 1; overflow: hidden;">
        ${previewHtml}
        <div style="display: flex; flex-direction: column; overflow: hidden; text-align: left;">
          <div style="font-weight: var(--font-weight-semibold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px; color: var(--color-neutral-10);" title="${esc(file.name)}">${esc(file.name)}</div>
          <div style="font-size: var(--font-size-xs); color: var(--color-neutral-7);">${esc(this.formatFileSize(file.size))}</div>
        </div>
      </div>
      <div class="form-file-details-actions" style="display: flex; align-items: center; gap: var(--space-s); flex-shrink: 0;">
        ${hasSafeContent ? `
        <!-- Download Button -->
        <a href="${esc(file.content)}" download="${esc(file.name)}" class="pg-btn pg-btn-secondary form-file-download-btn" title="${esc(this.translations.fileDownloadTitle)}" style="padding: 6px var(--space-s); display: flex; align-items: center; justify-content: center; height: auto;">
          <i data-lucide="download" style="width: 14px; height: 14px;"></i>
        </a>
        ` : ''}
        ${isReadOnly ? '' : `
        <button type="button" class="form-file-delete-btn" title="${esc(this.translations.fileDeleteTitle)}" style="padding: 6px var(--space-s); display: flex; align-items: center; justify-content: center; height: auto; color: var(--color-error); border-color: rgba(219,60,60,0.15);">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
        `}
      </div>
    `;
  }

  /** A required file field is satisfied by a stored file object (or a non-empty reference). */
  hasFileAnswer(val) {
    if (val && typeof val === 'object') return !!(val.name || val.content);
    return typeof val === 'string' && val.trim() !== '';
  }

  /** A required signature field is satisfied by a non-empty stored signature (data URL). */
  hasSignatureAnswer(val) {
    return typeof val === 'string' && val.trim() !== '';
  }

  /**
   * Strictly validates fields on selected page tab indexes
   */
  validatePage(pageIndex) {
    if (this._destroyed || !this.schema) return false;
    let hasErrors = false;
    const page = this.schema.pages[pageIndex];

    (page.sections || []).forEach(section => {
      (section.rows || []).forEach(row => {
        row.columns.forEach(col => {
          if (!col.field) return;
          const field = col.field;

          if (['header', 'paragraph'].includes(field.type)) return;

          if (field.type === 'repeater') {
            const repeaterState = this.evaluateFieldState(field, section);

            if (repeaterState.visible && !repeaterState.disabled) {
              const items = this.answers[field.key] || [];

              items.forEach((item, itemIndex) => {
                if (field.rows) {
                  field.rows.forEach(row => {
                    row.columns.forEach(col => {
                      if (!col.field) return;
                      const subField = col.field;
                      const scopedId = `${field.id}-${itemIndex}-${subField.id}`;
                      const scopedKey = `sub-${field.id}-${itemIndex}-${subField.key}`;
                      const val = this.answers[scopedKey];

                      // Compute validity from schema/answers regardless of whether this
                      // item is currently rendered in the DOM
                      let isFieldInvalid = false;
                      let errorMessage = '';
                      const isRequired = subField.required;

                      if (isRequired) {
                        if (subField.type === 'file') {
                          if (!this.hasFileAnswer(val)) isFieldInvalid = true;
                        } else if (subField.type === 'signature') {
                          if (!this.hasSignatureAnswer(val)) isFieldInvalid = true;
                        } else if (subField.type === 'checkbox') {
                          if (!Array.isArray(val) || val.length === 0) isFieldInvalid = true;
                        } else if (subField.type === 'matrix') {
                          const matrixAnswers = val || {};
                          const allRowsAnswered = (subField.matrixRows || []).every(r => {
                            const rowVal = matrixAnswers[r.key];
                            return rowVal !== undefined && rowVal !== null && String(rowVal).trim() !== '';
                          });
                          if (!allRowsAnswered) isFieldInvalid = true;
                        } else {
                          if (val === undefined || val === null || String(val).trim() === '') isFieldInvalid = true;
                        }
                        if (isFieldInvalid) errorMessage = this.translations.requiredFieldBubble;
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
                            errorMessage = subField.errorMessage || this.translations.patternValidationBubble;
                          }
                        } catch (e) {
                          console.error("Invalid configuration regex:", subField.validationRegex);
                        }
                      }

                      if (isFieldInvalid) hasErrors = true;

                      // Best-effort: only paint markings if this item happens to be rendered
                      const wrapper = this.formEl.querySelector(`#wrapper-${scopedId}`);
                      const errorEl = this.formEl.querySelector(`#error-${scopedId}`);
                      if (wrapper && errorEl) {
                        const inputEl = wrapper.querySelector('input, textarea, select');
                        if (isFieldInvalid) {
                          wrapper.classList.add('is-invalid');
                          if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
                          errorEl.innerHTML = `<i data-lucide="alert-circle"></i> ${OpenFormRenderer.escapeHtml(errorMessage)}`;
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

          // Compute validity from schema/answers regardless of whether this field's page
          // is the one currently rendered in the DOM (validateAndSubmit/step navigation
          // both validate pages that aren't necessarily the active one)
          const state = this.evaluateFieldState(field, section);

          if (state.visible && !state.disabled) {
            const val = this.answers[field.key];
            let isFieldInvalid = false;
            let errorMessage = '';

            // 1. Validate required toggles
            if (state.required) {
              // Decided from the data (this.answers), not from DOM-only state, so pages
              // that were never drawn validate the same as the visible one
              if (field.type === 'file') {
                if (!this.hasFileAnswer(val)) {
                  isFieldInvalid = true;
                }
              } else if (field.type === 'signature') {
                if (!this.hasSignatureAnswer(val)) {
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
              if (isFieldInvalid) errorMessage = this.translations.requiredFieldBubble;
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
                  errorMessage = field.errorMessage || this.translations.patternValidationBubble;
                }
              } catch (e) {
                console.error("Invalid configuration regex:", field.validationRegex);
              }
            }

            if (isFieldInvalid) hasErrors = true;

            // Best-effort: only paint markings if this field happens to be rendered
            // (validity above is already correctly computed either way)
            const colEl = this.formEl.querySelector(`.form-column[data-field-id="${field.id}"]`);
            const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
            const errorEl = this.formEl.querySelector(`#error-${field.id}`);
            if (colEl && wrapper && errorEl) {
              const inputEl = wrapper.querySelector('input, textarea, select');
              if (isFieldInvalid) {
                wrapper.classList.add('is-invalid');
                if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
                errorEl.innerHTML = `<i data-lucide="alert-circle"></i> ${OpenFormRenderer.escapeHtml(errorMessage)}`;
              } else {
                wrapper.classList.remove('is-invalid');
                if (inputEl) inputEl.removeAttribute('aria-invalid');
              }
            }
          } else {
            const wrapper = this.formEl.querySelector(`#wrapper-${field.id}`);
            if (wrapper) {
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

        // Evaluate: support new structured andGroups schema or fall back to legacy expression
        let isValid;
        if (rule.andGroups && Array.isArray(rule.andGroups) && rule.andGroups.length > 0) {
          // Structured evaluation: all AND groups must be satisfied for the rule to trigger (be invalid)
          // Each AND group passes if ANY of its OR conditions is satisfied.
          // An empty andGroups (all groups deleted in the builder, rule not yet configured) must
          // NOT trigger — `[].every(...)` is vacuously true, which would otherwise make this rule
          // permanently invalid. Mirrors the same guard isRuleSatisfied() already applies for
          // field/section conditionalRules.
          const allGroupsMet = rule.andGroups.every(group =>
            (group.conditions || []).some(cond => this.isConditionSatisfied(cond))
          );
          // Rule fires (invalid) when all AND groups are met
          isValid = !allGroupsMet;
        } else {
          // Legacy expression fallback
          isValid = this.evaluateValidationRule(rule.expression);
        }
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
                errorEl.innerHTML = `<i data-lucide="alert-circle"></i> ${OpenFormRenderer.escapeHtml(rule.errorMessage || 'Invalid field combination.')}`;
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
    if (this._destroyed || !this.schema) return;
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

            if (['header', 'paragraph'].includes(field.type)) return;

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
    if (this._destroyed) return;
    // Self-sufficient: renderer.js must work as an independent <script> with no host-page
    // markup dependency, but this element used to only exist if the host page happened to
    // define #toast-container (e.g. the portal's index.html) — silently no-op'd otherwise.
    // A container created here is tagged so destroy() knows it may remove it.
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('data-openforms-renderer', 'true');
      document.body.appendChild(container);
    }

    // Configure the live region dynamically for screen reader announcement parity
    container.setAttribute('aria-live', isError ? 'assertive' : 'polite');
    container.setAttribute('role', isError ? 'alert' : 'status');

    // Give screen readers a beat to register the (possibly just-created, or just-updated)
    // live region before its content changes — mutating in the same tick the role/aria-live
    // is (re)assigned is a known way for VoiceOver/NVDA to silently miss the announcement.
    this._requestFrame(() => {
      const toast = document.createElement('div');
      toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', isError ? 'x-circle' : 'check-circle');
      const text = document.createElement('span');
      text.textContent = message === null || message === undefined ? '' : String(message);
      toast.appendChild(icon);
      toast.appendChild(text);
      container.appendChild(toast);
      this._toasts.add(toast);

      if (window.lucide) window.lucide.createIcons();

      this._setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        this._setTimeout(() => {
          toast.remove();
          this._toasts.delete(toast);
        }, 300);
      }, 3500);
    });
  }

  /**
   * Renders the dynamic repeatable list container, dynamic cards, and handles actions
   */
  renderRepeaterWidget(field, container) {
    const listEl = document.createElement('div');
    listEl.className = 'form-repeater-items-list';

    // Declared before updateUI so the delete handler below (defined inside updateUI's
    // closure) can call it too — reappearing the button once count drops under maxItems.
    let checkAddButtonState = () => {};

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
          delBtn.title = `${this.translations.repeaterDeleteItemTitle} ${itemIndex + 1}`;
          delBtn.innerHTML = `<i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>`;
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            items.splice(itemIndex, 1);
            this.clearRepeaterScopedKeys(field);
            this.notifyFieldChange();
            updateUI();
            checkAddButtonState();
          });
          header.appendChild(delBtn);
        }
        card.appendChild(header);

        // Card Fields Grid
        const grid = document.createElement('div');
        grid.className = 'form-repeater-grid';
        grid.style.cssText = "display: flex; flex-direction: column; gap: var(--space-m);";

        if (field.rows) {
          field.rows.forEach(row => {
            if (!row.columns || row.columns.length === 0) return;

            const rowEl = document.createElement('div');
            rowEl.className = 'renderer-row';
            rowEl.style.cssText = "display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--space-m); margin-bottom: var(--space-s);";

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
                // text/textarea/number/date don't self-populate inside createWidgetWrapper
                // (unlike boolean/dropdown/radio/checkbox/matrix, which read this.answers there).
                // Without this, every updateUI() rebuild (add/delete item) redraws these inputs
                // blank even though the underlying data in `item` was never touched.
                if (['text', 'textarea', 'number', 'date'].includes(subField.type)) {
                  let existingVal = item[subField.key] !== undefined && item[subField.key] !== null ? item[subField.key] : '';
                  if (subField.mask && existingVal) {
                    existingVal = this.applyMask(String(existingVal), subField.mask);
                  }
                  inputEl.value = existingVal;
                }

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
                this.initSignatureCanvas(scopedField, widgetWrapper);
              }

              // Initialize nested File Uploaders
              if (subField.type === 'file') {
                this.initFileUploader(scopedField, widgetWrapper);
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

    // Render "Add Item" button first if not read-only, so DOM order matches the visual
    // order (CSS displays it above the item list) — keeps keyboard tab order consistent
    // with what's on screen.
    if (!this.readOnly) {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'pg-btn pg-btn-secondary form-repeater-add-btn';
      const displayAddBtnLabel = this.getTranslatedValue('fields', field.key, 'addButtonLabel', null, field.addButtonLabel || 'Add Item');
      addBtn.innerHTML = `<i data-lucide="plus-circle" style="width: 14px; height: 14px;"></i> ${OpenFormRenderer.escapeHtml(displayAddBtnLabel)}`;

      checkAddButtonState = () => {
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
    }

    container.appendChild(listEl);

    // Initialize list UI
    updateUI();
    checkAddButtonState();
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

    // Allow-list sanitization: only numbers, math symbols, and approved safe Math functions
    // may survive. Reject if ANYTHING else remains (not just letters) — this also catches
    // braces/brackets/quotes that a block-list-style "any letter present" check would miss.
    let checkUnsafe = sanitized;
    checkUnsafe = checkUnsafe.replace(/Math\.(min|max|round|abs|floor|ceil)/g, '');

    if (/[^0-9.,+\-*/%()?:\s><=!]/.test(checkUnsafe)) {
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

    // Allow-list check: only numbers, logic operators, parenthesis, and approved functions
    // may survive. Reject if ANYTHING else remains (not just letters) — this also catches
    // braces/brackets/quotes that a block-list-style "any letter present" check would miss.
    let checkUnsafe = sanitized;
    checkUnsafe = checkUnsafe.replace(/Math\.(min|max|round|abs|floor|ceil)/g, '');

    if (/[^0-9.,+\-*/%()?:\s><=!&|]/.test(checkUnsafe)) {
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
    if (this._destroyed) return;
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
    if (this._destroyed) return;
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
      padding: 'var(--space-base) var(--space-base) var(--space-l) var(--space-base)',
      boxSizing: 'border-box',
      transform: 'translateY(100%)',
      transition: 'transform 0.25s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-m)',
      boxShadow: '0 -4px var(--space-m) rgba(0, 0, 0, 0.15)'
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
    cameraBtn.innerHTML = `<i data-lucide="camera" style="width: 16px; height: 16px; margin-right: var(--space-s); vertical-align: middle;"></i> Take Photo`;
    Object.assign(cameraBtn.style, {
      padding: 'var(--space-m)',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      borderRadius: 'var(--space-s)',
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
    fileBtn.innerHTML = `<i data-lucide="file-text" style="width: 16px; height: 16px; margin-right: var(--space-s); vertical-align: middle;"></i> Choose Document/File`;
    Object.assign(fileBtn.style, {
      padding: 'var(--space-m)',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      borderRadius: 'var(--space-s)',
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
      padding: 'var(--space-m)',
      fontSize: '14px',
      width: '100%',
      borderRadius: 'var(--space-s)',
      border: 'none',
      background: 'transparent',
      color: 'var(--color-neutral-7, #666666)',
      cursor: 'pointer'
    });
    cancelBtn.addEventListener('click', closeSheet);
    sheet.appendChild(cancelBtn);

    backdrop.appendChild(sheet);
    document.body.appendChild(backdrop);
    this._actionSheetEl = backdrop;

    if (window.lucide) window.lucide.createIcons({ container: sheet });

    // Trigger animations
    this._requestFrame(() => {
      backdrop.style.opacity = 1;
      sheet.style.transform = 'translateY(0)';
    });

    const self = this;
    function closeSheet() {
      backdrop.style.opacity = 0;
      sheet.style.transform = 'translateY(100%)';
      self._setTimeout(() => {
        backdrop.remove();
        if (self._actionSheetEl === backdrop) self._actionSheetEl = null;
      }, 250);
    }
  }
}

// Bind to global namespace
window.OpenFormRenderer = OpenFormRenderer;
