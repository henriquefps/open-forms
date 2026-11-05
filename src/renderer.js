(function () {
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
/**
 * Built-in UI strings, one dictionary per locale. `default` is English; any other locale
 * falls back to it key by key. Hosts override single keys with the `translations` option.
 * This is the only place these strings live (constructor and setLocale() both read it).
 */
const BUILT_IN_TRANSLATIONS = {
  'default': {
    formEmptyStructure: "No form structure defined.",
    formSubmitButton: "Submit Answers",
    formPrevPageButton: "Previous",
    formNextPageButton: "Next",
    stepIndicatorPrefix: "Step",
    stepIndicatorOf: "of",
    stepIndicatorDivider: ":",
    requiredFieldBubble: "This field is required.",
    unsupportedFieldType: "Unsupported field type",
    patternValidationBubble: "Incorrect value for the required pattern.",
    crossFieldDefaultError: "Invalid field combination.",
    validationToastError: "Please correctly fill in all required fields in this step.",
    validationToastSuccess: "Form successfully validated and submitted!",
    submitErrorToast: "Could not submit the form. Please try again.",
    selectOptionPlaceholder: "Select an option...",
    dropdownLoading: "Loading options from API...",
    radioNoOptions: "No options available",
    radioLoading: "Loading options...",
    checkboxNoOptions: "No options available",
    checkboxLoading: "Loading options...",
    optionsLoadError: "Could not load options.",
    optionsSourceUnavailable: "Options source not configured.",
    switchLabel: "Yes / No",
    printYes: "Yes",
    printNo: "No",
    printGeneratedOn: "Generated on {date}",
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
    fileTypeNotAllowedError: "This file type is not allowed.",
    fileUploaderActiveIcon: "file-check",
    fileDeleteTitle: "Delete file",
    fileDownloadTitle: "Download attachment",
    fileNoneUploaded: "No file uploaded",
    uploadProgressLabel: "Uploading {name}",
    uploadCancelLabel: "Cancel",
    uploadRetryLabel: "Retry",
    uploadFailedDefault: "Upload failed. Try again.",
    draftResumePrompt: "Resume your draft?",
    draftResumeButton: "Resume",
    draftDiscardButton: "Start over",
    draftSavedAt: "Saved {date}",
    uploadInProgressError: "Wait for the upload to finish.",
    fileSizeUnits: "Bytes|KB|MB|GB|TB",
    lightboxCloseLabel: "Close Preview",
    lightboxImageAlt: "Attachment Preview",
    actionSheetTitle: "Select Attachment Source",
    actionSheetTakePhoto: "Take Photo",
    actionSheetChooseFile: "Choose Document/File",
    actionSheetCancel: "Cancel",
    repeaterDeleteItemTitle: "Delete item",
    repeaterItemTitle: "Item #{n}",
    repeaterAddButtonLabel: "Add Item",
    normalizeFormUntitled: "Untitled Form",
    normalizePageDefault: "Page"
  },
  'pt-BR': {
    formEmptyStructure: "Nenhuma estrutura de formulário definida.",
    formSubmitButton: "Enviar Respostas",
    formPrevPageButton: "Anterior",
    formNextPageButton: "Próximo",
    stepIndicatorPrefix: "Passo",
    stepIndicatorOf: "de",
    stepIndicatorDivider: ":",
    requiredFieldBubble: "Este campo é obrigatório.",
    unsupportedFieldType: "Tipo de campo não suportado",
    patternValidationBubble: "Valor incorreto para o padrão exigido.",
    crossFieldDefaultError: "Combinação de campos inválida.",
    validationToastError: "Por favor, preencha corretamente todos os campos obrigatórios neste passo.",
    validationToastSuccess: "Formulário validado e enviado com sucesso!",
    submitErrorToast: "Não foi possível enviar o formulário. Tente novamente.",
    selectOptionPlaceholder: "Selecione uma opção...",
    dropdownLoading: "Carregando opções da API...",
    radioNoOptions: "Nenhuma opção disponível",
    radioLoading: "Carregando opções...",
    checkboxNoOptions: "Nenhuma opção disponível",
    checkboxLoading: "Carregando opções...",
    optionsLoadError: "Não foi possível carregar as opções.",
    optionsSourceUnavailable: "Fonte de opções não configurada.",
    switchLabel: "Sim / Não",
    printYes: "Sim",
    printNo: "Não",
    printGeneratedOn: "Gerado em {date}",
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
    fileTypeNotAllowedError: "Este tipo de arquivo não é permitido.",
    fileDeleteTitle: "Excluir arquivo",
    fileDownloadTitle: "Baixar anexo",
    fileNoneUploaded: "Nenhum arquivo enviado",
    uploadProgressLabel: "Enviando {name}",
    uploadCancelLabel: "Cancelar",
    uploadRetryLabel: "Tentar novamente",
    uploadFailedDefault: "Falha no envio. Tente novamente.",
    draftResumePrompt: "Retomar o seu rascunho?",
    draftResumeButton: "Retomar",
    draftDiscardButton: "Começar de novo",
    draftSavedAt: "Guardado em {date}",
    uploadInProgressError: "Aguarde o envio terminar.",
    lightboxCloseLabel: "Fechar visualização",
    lightboxImageAlt: "Visualização do anexo",
    actionSheetTitle: "Selecione a origem do anexo",
    actionSheetTakePhoto: "Tirar foto",
    actionSheetChooseFile: "Escolher documento/arquivo",
    actionSheetCancel: "Cancelar",
    repeaterDeleteItemTitle: "Excluir item",
    repeaterItemTitle: "Item nº {n}",
    repeaterAddButtonLabel: "Adicionar item",
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
    unsupportedFieldType: "Tipo de campo no compatible",
    patternValidationBubble: "Valor incorrecto para el patrón requerido.",
    crossFieldDefaultError: "Combinación de campos no válida.",
    validationToastError: "Por favor, complete correctamente todos los campos obligatorios en este paso.",
    validationToastSuccess: "¡Formulario validado y enviado con éxito!",
    submitErrorToast: "No se pudo enviar el formulario. Inténtelo de nuevo.",
    selectOptionPlaceholder: "Seleccione una opción...",
    dropdownLoading: "Cargando opciones de la API...",
    radioNoOptions: "No hay opciones disponibles",
    radioLoading: "Cargando opciones...",
    checkboxNoOptions: "No hay opciones disponibles",
    checkboxLoading: "Cargando opciones...",
    optionsLoadError: "No se pudieron cargar las opciones.",
    optionsSourceUnavailable: "Fuente de opciones no configurada.",
    switchLabel: "Sí / No",
    printYes: "Sí",
    printNo: "No",
    printGeneratedOn: "Generado el {date}",
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
    fileTypeNotAllowedError: "Este tipo de archivo no está permitido.",
    fileDeleteTitle: "Eliminar archivo",
    fileDownloadTitle: "Descargar archivo adjunto",
    fileNoneUploaded: "Ningún archivo subido",
    uploadProgressLabel: "Subiendo {name}",
    uploadCancelLabel: "Cancelar",
    uploadRetryLabel: "Reintentar",
    uploadFailedDefault: "Error al subir. Inténtalo de nuevo.",
    draftResumePrompt: "¿Retomar su borrador?",
    draftResumeButton: "Retomar",
    draftDiscardButton: "Empezar de nuevo",
    draftSavedAt: "Guardado el {date}",
    uploadInProgressError: "Espera a que termine la subida.",
    lightboxCloseLabel: "Cerrar vista previa",
    lightboxImageAlt: "Vista previa del adjunto",
    actionSheetTitle: "Seleccione el origen del adjunto",
    actionSheetTakePhoto: "Tomar foto",
    actionSheetChooseFile: "Elegir documento/archivo",
    actionSheetCancel: "Cancelar",
    repeaterDeleteItemTitle: "Eliminar elemento",
    repeaterItemTitle: "Elemento n.º {n}",
    repeaterAddButtonLabel: "Añadir elemento",
    normalizeFormUntitled: "Formulario sin Título",
    normalizePageDefault: "Página"
  }
};

class OpenFormRenderer {
  static VERSION = '1.5.3';

  /** Current schema format version written by the builder (schemas without it are version 1). */
  static SCHEMA_VERSION = 2;
  /** Field types this build knows how to render. */
  static FIELD_TYPES = ['header', 'paragraph', 'text', 'textarea', 'number', 'date', 'boolean', 'dropdown', 'radio', 'checkbox', 'signature', 'file', 'repeater', 'matrix'];
  /** `accept` list used by file fields without `acceptedTypes`. */
  static DEFAULT_ACCEPTED_TYPES = '.pdf,.docx,image/*';
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
    'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'binary': '<rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/>',
    'calculator': '<rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/>',
    'calendar': '<path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>',
    'camera': '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'check-circle': '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    'download': '<path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/>',
    'edit-3': '<path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
    'file': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/>',
    'file-text': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'keyboard': '<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>',
    'list-collapse': '<path d="M10 5h11"/><path d="M10 12h11"/><path d="M10 19h11"/><path d="m3 10 3-3-3-3"/><path d="m3 20 3-3-3-3"/>',
    'pen-tool': '<path d="m18 13-.654-4.736a4 4 0 00-2.756-3.266l-9.163-2.9a2 2 0 00-2.017.493l-.82.819a2 2 0 00-.492 2.017l2.9 9.163a4 4 0 003.266 2.756L13 18"/><path d="M18.648 12.352a1.205 1.205 0 011.704 0l1.296 1.296a1.205 1.205 0 010 1.704l-6.296 6.296a1.205 1.205 0 01-1.704 0l-1.296-1.296a1.205 1.205 0 010-1.704z"/><path d="m3 3 6.586 6.586"/><circle cx="11" cy="11" r="2"/>',
    'plus-circle': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
    'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'text-cursor-input': '<path d="M12 20h-1a2 2 0 0 1-2-2 2 2 0 0 1-2 2H6"/><path d="M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7"/><path d="M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1"/><path d="M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1"/><path d="M9 6v12"/>',
    'trash-2': '<path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    'upload-cloud': '<path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 17 4-4 4 4"/>',
    'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'
  };

  /** Font stack for typed signatures; 'Caveat' is used when the host page already loaded it. */
  static HANDWRITING_FONT_STACK = "'Caveat', 'Segoe Script', 'Bradley Hand', cursive";

  /**
   * Returns the markup of an inline SVG icon (decorative: aria-hidden, not focusable).
   * @param {string} name Key of OpenFormRenderer.ICONS (unknown names fall back to a help icon)
   * @param {string} [cls] Extra class names
   * @param {string} [style] Inline style (trusted literal)
   */
  static icon(name, cls = '', style = '') {
    const body = OpenFormRenderer.ICONS[name] || OpenFormRenderer.ICONS['help-circle'] || '';
    return `<svg class="of-icon${cls ? ' ' + cls : ''}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${style ? ` style="${style}"` : ''}>${body}</svg>`;
  }

  /**
   * @param {Object} options
   * @param {HTMLElement} options.containerEl Container element of the widget
   * @param {Function} options.onSubmit Callback fired upon successful form submission with a
   *   clean copy of the answers (same as getAnswers()). May return a promise: the success toast
   *   waits for it, a rejection shows an error toast and keeps the form editable, and the submit
   *   button is disabled while it is pending.
   * @param {Function} [options.onFieldChange] `(answers, changedKey)` fired on every answer
   *   change (typing, choices, signatures, uploads, repeater items, setValue). `answers` is a
   *   deep copy of every answer; `changedKey` is the top-level field key that changed (the
   *   repeater's key for edits inside a repeater item).
   * @param {Function} [options.onPageChange] `(index, page)` fired after the active page changes
   *   (Next/Previous, step tabs, goToPage, or a failed submit jumping to the invalid page).
   *   `page` is a copy of the page's schema object. Not fired by render().
   * @param {Function} [options.onValidationError] `(errors)` fired when a user action or
   *   submit()/goToPage() is blocked by validation. Same error objects as validate().
   * @param {string} [options.idPrefix] Prefix for every DOM id this instance generates. Defaults
   *   to a unique `ofr<N>-` per instance, so several renderers can share a page.
   * @param {Object} [options.translations] Custom translation overrides
   * @param {string} [options.locale] Active locale ('default', 'pt-BR', 'es-ES', ...)
   * @param {Function} [options.optionsProvider] Host-supplied source for fields with
   *   `optionsType: 'api'`: `(field, context) => Promise<Array<{label, value}>>`, where
   *   context is `{ locale, readOnly }`. The renderer never fetches `optionsUrl` itself —
   *   the host owns transport, auth and caching. Without a provider, such fields show a
   *   "not configured" message and offer no options.
   * @param {Function} [options.uploadProvider] Host-supplied upload for `file` fields (also camera
   *   captures and file fields inside repeaters): `(file, { field, locale, signal, onProgress }) =>
   *   Promise<FileReference>`. `file` is a File/Blob, `signal` an AbortSignal (aborted on Cancel,
   *   re-render and destroy()), `onProgress(fraction 0..1)` is optional to call. The answer then holds
   *   only the resolved reference `{ name, size, type, url?, id?, ...extra }` — never the file's
   *   content. Without a provider, files are read into Base64 data URLs and kept in the answers.
   * @param {Function} [options.onFileRemoved] `(reference, { field })` fired when the user deletes a
   *   file that was uploaded through `uploadProvider` (or a stored reference), so the host can delete
   *   it server-side. Errors thrown here are logged, never shown.
   * @param {Function} [options.onDraftChange] `(draft)` fired (debounced by `draftDebounceMs`) after a
   *   real change — an answer edit, a page change, an upload completed/removed — never by render()
   *   or restoreDraft(). `draft` is what getDraft() returns.
   * @param {number} [options.draftDebounceMs=800] Debounce for onDraftChange and `draftStorage` saves.
   * @param {string|Object} [options.draftStorage] Built-in persistence: `'local'`, `'session'` or an
   *   adapter `{ get(key), set(key, value), remove(key) }` (any method may return a promise; `value`
   *   is the draft as a JSON string, `get` may return that string or the draft object).
   * @param {string} [options.draftKey] Storage key (default derived from the schema's `formId` or
   *   `formTitle` plus its schemaVersion).
   * @param {string} [options.resumeDraft='ask'] What render() does with a stored draft: `'ask'`
   *   (small prompt: Resume / Start over), `'auto'` (restore silently) or `'never'`.
   * @param {string} [options.handwritingFontUrl] Opt-in stylesheet URL (e.g. a Google Fonts
   *   Caveat URL) injected as a <link> the first time a signature field is shown. Without it
   *   the renderer makes no external request; typed signatures use the font stack
   *   'Caveat', 'Segoe Script', 'Bradley Hand', cursive.
   */
  constructor({ containerEl, onSubmit, onFieldChange, onPageChange, onValidationError, translations, locale, optionsProvider, uploadProvider, onFileRemoved, idPrefix, handwritingFontUrl, onDraftChange, draftDebounceMs, draftStorage, draftKey, resumeDraft }) {
    this.containerEl = containerEl;
    this.onSubmit = onSubmit;
    this.onFieldChange = onFieldChange;
    this.onPageChange = typeof onPageChange === 'function' ? onPageChange : null;
    this.onValidationError = typeof onValidationError === 'function' ? onValidationError : null;
    // Every generated DOM id starts with this prefix (see _domId), so two renderers on the
    // same page — or a live form and its print() snapshot — never share an id.
    OpenFormRenderer._instanceSeq = (OpenFormRenderer._instanceSeq || 0) + 1;
    this._idPrefix = typeof idPrefix === 'string' && idPrefix.trim() !== ''
      ? idPrefix.trim()
      : `ofr${OpenFormRenderer._instanceSeq}-`;
    this.handwritingFontUrl = typeof handwritingFontUrl === 'string' && handwritingFontUrl.trim() !== '' ? handwritingFontUrl.trim() : null;
    this.optionsProvider = typeof optionsProvider === 'function' ? optionsProvider : null;
    this.uploadProvider = typeof uploadProvider === 'function' ? uploadProvider : null;
    this.onFileRemoved = typeof onFileRemoved === 'function' ? onFileRemoved : null;
    this.onDraftChange = typeof onDraftChange === 'function' ? onDraftChange : null;
    this.draftDebounceMs = Number.isFinite(draftDebounceMs) && draftDebounceMs >= 0 ? draftDebounceMs : 800;
    this.draftKey = typeof draftKey === 'string' && draftKey.trim() !== '' ? draftKey.trim() : null;
    this.resumeDraft = ['auto', 'ask', 'never'].includes(resumeDraft) ? resumeDraft : 'ask';
    this._draftAdapter = OpenFormRenderer._resolveDraftStorage(draftStorage);
    this._draftTimer = null;
    this._draftWrites = Promise.resolve();
    this._draftWarned = false;
    this._draftBannerEl = null;
    this._renderSeq = 0;
    this._onPageHide = () => this._flushDraft();
    if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('pagehide', this._onPageHide);
    this.locale = locale || 'default';
    this.customTranslationsOverride = translations || {};

    this.translations = this._resolveTranslations();

    this.schema = null;
    this.activePageIndex = 0;

    // Live runtime responses
    this.answers = {};

    // Uploaded files and signature tracks
    this.signaturePads = {};
    this.uploadedFiles = {};
    // uploadProvider bookkeeping, keyed by field id: uploads in flight or failed (never part of
    // the answers) and the object URLs used to preview completed images during the session.
    this._uploads = {};
    this._objectUrls = {};
    this._borrowedPreviewUrls = null;

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
    // Repeater sub-field answers are exposed on this.answers under internal, non-enumerable
    // `sub-<repeaterId>-<index>-<key>` accessors; this maps each one to its repeater's key.
    this._scopedKeyOwners = new Map();
    this._submitPromise = null;

    this.buildHTMLShell();
  }

  /** DOM id for one of this instance's elements: `<prefix><kind>-<id>` (or `<prefix><kind>`). */
  _domId(kind, id) {
    return id === undefined || id === null ? `${this._idPrefix}${kind}` : `${this._idPrefix}${kind}-${id}`;
  }

  /** Finds one of this instance's elements by kind + field id (ids may hold any character). */
  _byId(kind, id, root = this.formEl) {
    if (!root) return null;
    const value = this._domId(kind, id).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return root.querySelector(`[id="${value}"]`);
  }

  /**
   * Deep copy for schema/answer data: arrays and plain objects are copied (own enumerable
   * keys only, so the internal repeater accessors never travel), primitives are shared.
   */
  static _deepClone(value) {
    if (Array.isArray(value)) return value.map(item => OpenFormRenderer._deepClone(item));
    if (value instanceof Date) return new Date(value.getTime());
    if (value && typeof value === 'object') {
      const copy = {};
      Object.keys(value).forEach(key => {
        copy[key] = OpenFormRenderer._deepClone(value[key]);
      });
      return copy;
    }
    return value;
  }

  /**
   * Answers of `number` fields are stored as JS numbers; an empty input is `null`. A value
   * that isn't numeric (e.g. a mask that keeps literal characters) is kept as typed.
   */
  static _toNumberAnswer(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === 'number') return isFinite(value) ? value : null;
    const str = String(value).trim();
    if (str === '') return null;
    const num = Number(str);
    return isFinite(num) ? num : value;
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

  /**
   * Link/preview targets for a stored file reference (`url`): `https:`, `http:`, `blob:` or
   * `data:` only — never `javascript:` or anything else the host or a stored answer could smuggle in.
   */
  static isSafeFileUrl(value) {
    return typeof value === 'string' && /^(?:https?|blob|data):/i.test(value.trim());
  }

  /**
   * The safe URL a stored file can be previewed/downloaded from: Base64 `content` (data: only)
   * or a reference's `url`. Empty string when there is none (the file is then shown by name).
   */
  static fileSourceUrl(file) {
    if (!file || typeof file !== 'object') return '';
    if (OpenFormRenderer.isSafeDataUrl(file.content)) return file.content.trim();
    if (OpenFormRenderer.isSafeFileUrl(file.url)) return file.url.trim();
    return '';
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

  /** Merges built-in English, the active locale's built-ins and the host's `translations` option. */
  _resolveTranslations() {
    return Object.assign({}, BUILT_IN_TRANSLATIONS['default'], BUILT_IN_TRANSLATIONS[this.locale] || {}, this.customTranslationsOverride || {});
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
    if (category === 'crossFieldRules') {
      return (dict.crossFieldRules && dict.crossFieldRules[targetKey] && dict.crossFieldRules[targetKey].errorMessage) !== undefined
        ? dict.crossFieldRules[targetKey].errorMessage
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

    this.translations = this._resolveTranslations();
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
    // Pages hidden by their rules are not part of the printout
    flatSchema.pages = this._navigablePages().map(i => flatSchema.pages[i]);
    // Wizard page titles survive the flattening as headings before each page's first section
    const pageHeadings = flatSchema.pages.length < 2 ? [] : flatSchema.pages
      .map(page => ({
        sectionIds: (page.sections || []).map(section => String(section.sectionId)),
        title: this.getTranslatedValue('pages', page.pageId, null, null, page.title)
      }))
      .filter(heading => heading.sectionIds.length > 0 && heading.title);
    const flattenedSections = flatSchema.pages.reduce((acc, page) => acc.concat(page.sections || []), []);
    flatSchema.pages = [{ ...flatSchema.pages[0], conditionalRules: [], sections: flattenedSections }];

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
    // Images uploaded in this session are previewed from the live form's object URLs (the
    // snapshot never owns or revokes them)
    printRenderer._borrowedPreviewUrls = this._objectUrls;
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
    const t = this.translations;
    return { printYes: t.printYes, printNo: t.printNo, printGeneratedOn: t.printGeneratedOn };
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
      const canvasIdPrefix = this._domId('canvas', '');
      const value = signatures.get(canvas.id.startsWith(canvasIdPrefix) ? canvas.id.slice(canvasIdPrefix.length) : canvas.id);
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

  /** A number in the active locale's format (up to 2 decimals, like formula results). */
  _formatNumber(value) {
    if (value === null || value === undefined || value === '' || !isFinite(Number(value))) return '';
    const locale = this.locale && this.locale !== 'default' ? this.locale : undefined;
    try {
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(value));
    } catch (e) {
      return String(value);
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
        warn(path, 'page-rule-forward-reference', `The rule of page ${pageIndex + 1} depends on "${key}", which is on a later page: the first time through it has no answer yet, so the rule is evaluated on an empty value.`);
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
        formTitle: this.translations.normalizeFormUntitled,
        formDescription: "",
        pages: []
      };
    }

    const current = this.constructor.SCHEMA_VERSION;
    const declared = schema.schemaVersion;
    const version = Number.isInteger(declared) && declared >= 1 ? declared : 1;

    if (version > current) {
      if (!this._warnedSchemaVersion) {
        this._warnedSchemaVersion = true;
        console.warn(`OpenFormRenderer: schemaVersion ${version} is newer than the supported version ${current}; rendering on a best-effort basis. Update the renderer.`);
      }
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
          title: `${this.translations.normalizePageDefault} 1`,
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
      if (!page.title) page.title = `${this.translations.normalizePageDefault} ${index + 1}`;
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
   * Creates initial wrapper markup
   */
  buildHTMLShell() {
    this.containerEl.innerHTML = `
      <div class="renderer-sandbox">
        <form class="renderer-form-card" novalidate aria-labelledby="${OpenFormRenderer.escapeHtml(this._domId('renderer-form-title'))}"></form>
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
            <button id="lightbox-close" class="lightbox-close-btn" aria-label="${OpenFormRenderer.escapeHtml(this.translations.lightboxCloseLabel)}">&times;</button>
            <img id="lightbox-image" class="lightbox-img" src="" alt="${OpenFormRenderer.escapeHtml(this.translations.lightboxImageAlt)}" />
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
   * #toast-container this script created, and the opt-in handwriting <link id="form-handwriting-font">)
   * are removed only when no other renderer is still mounted in the document; a
   * #toast-container supplied by the host page is never removed.
   *
   * Idempotent; every public method becomes a no-op afterwards.
   */
  destroy() {
    if (this._destroyed) return;
    // A change still waiting out the debounce is saved, not lost
    this._flushDraft();
    this._destroyed = true;
    if (typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('pagehide', this._onPageHide);
    this._draftBannerEl = null;

    this._cleanupPrint();
    this.teardownSignaturePads();
    this._abortUploads();
    this._revokePreviewUrls();

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

    // The caller's schema and answers are never mutated: the renderer works on deep copies
    // (normalizeSchema fills in defaults, and every edit writes into this.answers).
    const isNewRecord = answers !== null && answers !== undefined;
    this.answers = isNewRecord ? OpenFormRenderer._deepClone(answers) : (this.answers || {});

    this.schema = this.normalizeSchema(OpenFormRenderer._deepClone(schemaJSON));
    this.normalizeAnswerTypes();
    this._ensureAllAnswerDefaults();

    // A record passed in explicitly always opens on its first page. A bare render(schema)
    // (live preview refresh of the same in-progress record) keeps the current page if it
    // still exists.
    if (isNewRecord || typeof this.activePageIndex !== 'number' || this.activePageIndex >= this.schema.pages.length) {
      this.activePageIndex = 0;
    }

    this.recalculateFormulas();
    this.drawActivePage();

    // A new record starts clean: nothing pending from the previous one, no stale prompt
    this._renderSeq++;
    if (isNewRecord) this._cancelDraftTimer();
    // The stored draft is offered once per record: a bare render(schema) refresh (live preview)
    // of the same in-progress record must not ask again.
    if (isNewRecord || !this._draftOffered) {
      this._draftOffered = true;
      this._removeDraftBanner();
      this._offerStoredDraft();
    }
  }

  /**
   * Every page's fields get their default answer up front, so answers/getAnswers() hold
   * every field even for pages the user hasn't opened yet.
   */
  _ensureAllAnswerDefaults() {
    this.schema.pages.forEach(page => (page.sections || []).forEach(section => (section.rows || []).forEach(row => {
      (row.columns || []).forEach(col => {
        if (col && col.field) this.ensureAnswerDefault(col.field);
      });
    })));
  }

  /**
   * Gives a field its default answer when it has none yet (boolean: defaultValue/false,
   * repeater: minItems empty items, matrix: one '' per row, number: null, others: '').
   */
  ensureAnswerDefault(field) {
    if (!field || field.type === 'header' || field.type === 'paragraph' || !field.key) return;
    if (!OpenFormRenderer.FIELD_TYPES.includes(field.type)) return;
    if (field.key in this.answers && !(field.type === 'repeater' && !Array.isArray(this.answers[field.key]))) return;
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
    } else if (field.type === 'number') {
      this.answers[field.key] = null;
    } else {
      this.answers[field.key] = '';
    }
  }

  /**
   * Coerces stored answers of `number` fields (top level and inside repeater items) to the
   * renderer's representation: a JS number, or null when empty. Pre-filled answers often
   * come back from storage as strings.
   */
  normalizeAnswerTypes() {
    if (!this.schema || !this.answers) return;
    const eachField = (rows, fn) => (rows || []).forEach(row => (row.columns || []).forEach(col => {
      if (col && col.field) fn(col.field);
    }));
    this.schema.pages.forEach(page => (page.sections || []).forEach(section => eachField(section.rows, field => {
      if (field.type === 'number' && field.key in this.answers) {
        this.answers[field.key] = OpenFormRenderer._toNumberAnswer(this.answers[field.key]);
      } else if (field.type === 'repeater' && Array.isArray(this.answers[field.key])) {
        this.answers[field.key].forEach(item => eachField(field.rows, subField => {
          if (subField.type === 'number' && item && typeof item === 'object' && subField.key in item) {
            item[subField.key] = OpenFormRenderer._toNumberAnswer(item[subField.key]);
          }
        }));
      }
    })));
  }

  /**
   * Drops every piece of state derived from the previous schema/answers: uploaded file
   * cache, signature pads (with their window listeners and ResizeObservers), rule-state
   * caches and the API options cache. In-flight provider results become stale.
   */
  resetRecordState() {
    this.teardownSignaturePads();
    this._abortUploads();
    this._revokePreviewUrls();
    this.uploadedFiles = {};
    this._optionsCache = new Map();
    this._pendingOptionLoads = new Set();
    this.fieldVisibilityStates = {};
    this.fieldRequiredStates = {};
    this.fieldDisabledStates = {};
    this.sectionVisibilityStates = {};
    this._scopedKeyOwners = new Map();
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
      window.removeEventListener('pointerup', padState.stopDraw);
      window.removeEventListener('pointercancel', padState.stopDraw);
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
    // Pages hidden by their rules lose their answers, and a hidden active page (render(),
    // restoreDraft()) falls back to the nearest visible one before anything is drawn.
    const visibility = this._syncPageVisibility();
    if (visibility.target !== null) this.activePageIndex = visibility.target;
    if (visibility.cleared) this.recalculateFormulas();
    // The previous page's DOM is about to be discarded: drop its signature pads (window
    // listeners + ResizeObservers) and invalidate pending option loads that target it.
    this.teardownSignaturePads();
    this._drawGeneration++;
    this.formEl.innerHTML = '';
    const esc = OpenFormRenderer.escapeHtml;

    if (!this.schema || this.schema.pages.length === 0) {
      this.formEl.innerHTML = `
        <div style="text-align: center; color: var(--of-color-neutral-7); padding: var(--of-space-xl) 0;">
          ${OpenFormRenderer.icon('info', '', 'width: 32px; height: 32px; color: var(--of-color-neutral-5); margin-bottom: var(--of-space-s);')}
          <p style="font-size: var(--of-font-size-base);">${esc(this.translations.formEmptyStructure)}</p>
        </div>
      `;
      return;
    }

    // 1. Title bar headers
    const headerEl = document.createElement('div');
    headerEl.className = 'renderer-form-header';

    const displayFormTitle = this.getTranslatedValue('form', 'formTitle', null, null, this.schema.formTitle || this.translations.normalizeFormUntitled);
    const displayFormDesc = this.getTranslatedValue('form', 'formDescription', null, null, this.schema.formDescription || '');

    headerEl.innerHTML = `
      <h2 class="renderer-form-title" id="${esc(this._domId('renderer-form-title'))}">${esc(displayFormTitle)}</h2>
      ${displayFormDesc ? `<p class="renderer-form-desc">${esc(displayFormDesc)}</p>` : ''}
    `;
    this.formEl.appendChild(headerEl);

    // 2. Render multi-page steps bar (visible pages only)
    const stepsContainer = this.renderStepsBar();
    if (stepsContainer) this.formEl.appendChild(stepsContainer);

    // 3. Render active page rows
    const activePage = this.schema.pages[this.activePageIndex];
    const bodyEl = document.createElement('div');
    bodyEl.className = 'renderer-form-body';
    bodyEl.setAttribute('role', 'tabpanel');
    bodyEl.setAttribute('id', this._domId('page-panel', activePage.pageId));
    bodyEl.setAttribute('aria-labelledby', this._domId('step-tab', activePage.pageId));
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
          this.ensureAnswerDefault(field);

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
    const navigationEl = this._buildNavigationBar();
    this.formEl.appendChild(navigationEl);

    // Bind widgets triggers and visibility rules
    this.bindWidgetsEvents();
    this.evalBusinessRules();

    // A redraw (setLocale, page change) while onSubmit is still pending keeps submit disabled
    if (this._submitPromise) this.applySubmittingState(true);

  }

  // ---------------------------------------------------------------------------
  // Page branching (page-level conditionalRules)
  // ---------------------------------------------------------------------------

  /** Whether page `index` is shown: its `visibility` rules (any satisfied) decide, no rules = visible. */
  isPageVisible(index) {
    const page = this.schema && this.schema.pages[index];
    if (!page) return false;
    const rules = (page.conditionalRules || []).filter(r => r.targetProperty === 'visibility');
    return rules.length === 0 || rules.some(r => this.isRuleSatisfied(r));
  }

  /**
   * Absolute indices of the pages currently shown (not hidden by a page rule), in order.
   * Next/Previous, the step tabs and goToPage() only deal with these.
   *
   * @returns {number[]}
   */
  getVisiblePages() {
    if (this._destroyed || !this.schema) return [];
    const visible = [];
    this.schema.pages.forEach((page, index) => { if (this.isPageVisible(index)) visible.push(index); });
    return visible;
  }

  /** The visible pages, or just the active one when every page is hidden (the form is never empty). */
  _navigablePages() {
    const visible = this.getVisiblePages();
    return visible.length > 0 ? visible : [this.activePageIndex];
  }

  /**
   * Applies page rules: resets the answers of every hidden page (like a hidden field or
   * section, onFileRemoved 'hidden' included; repeated until stable because clearing can flip
   * another page's rule) and, when the active page is hidden, picks where to go: the nearest
   * previous visible page, else the nearest next one.
   *
   * @returns {{ cleared: boolean, target: number|null }} target is null when the active page stays.
   */
  _syncPageVisibility() {
    let cleared = false;
    if (!this.schema || !this.schema.pages.some(p => (p.conditionalRules || []).length > 0)) {
      return { cleared, target: null };
    }
    let changed = true;
    for (let iterations = 0; changed && iterations < 10; iterations++) {
      changed = false;
      this.schema.pages.forEach((page, index) => {
        if (this.isPageVisible(index)) return;
        (page.sections || []).forEach(section => (section.rows || []).forEach(row => (row.columns || []).forEach(col => {
          const field = col && col.field;
          if (!field || field.type === 'header' || field.type === 'paragraph' || !OpenFormRenderer.FIELD_TYPES.includes(field.type)) return;
          if (this.hasNonDefaultValue(field)) {
            this.clearFieldState(field);
            changed = true;
            cleared = true;
          }
        })));
      });
    }
    const visible = this.getVisiblePages();
    if (visible.length === 0 || visible.includes(this.activePageIndex)) return { cleared, target: null };
    const before = visible.filter(i => i < this.activePageIndex);
    return { cleared, target: before.length > 0 ? before[before.length - 1] : visible[0] };
  }

  /** After an answer changed: re-applies page rules, moving off a page that became hidden and refreshing the tabs. */
  _reactToPageRules() {
    const visibility = this._syncPageVisibility();
    if (visibility.cleared) {
      this.recalculateFormulas();
      this.evalBusinessRules();
    }
    if (visibility.target !== null) {
      this.showPage(visibility.target);
    } else if (this._navSignature !== this._navigablePages().join(',')) {
      this._refreshPagination();
    }
  }

  /** Rebuilds the step tabs and the footer buttons in place (the page body and the focus stay untouched). */
  _refreshPagination() {
    if (this._destroyed || !this.formEl || !this.formEl.querySelector('.renderer-form-body')) return;
    const oldSteps = this.formEl.querySelector('.renderer-steps-container');
    const oldNav = this.formEl.querySelector('.renderer-navigation-bar');
    const body = this.formEl.querySelector('.renderer-form-body');
    const steps = this.renderStepsBar();
    if (oldSteps) oldSteps.remove();
    if (steps) body.before(steps);
    const nav = this._buildNavigationBar();
    if (oldNav) oldNav.replaceWith(nav); else this.formEl.appendChild(nav);
    if (this._submitPromise) this.applySubmittingState(true);
  }

  /** Footer: Previous / Next (or Submit on the last visible page), bound to the visible pages. */
  _buildNavigationBar() {
    const esc = OpenFormRenderer.escapeHtml;
    const navigationEl = document.createElement('div');
    navigationEl.className = 'renderer-navigation-bar';
    const navigable = this._navigablePages();
    this._navSignature = navigable.join(',');
    const position = Math.max(0, navigable.indexOf(this.activePageIndex));

    if (navigable.length <= 1) {
      // Single page submit buttons
      navigationEl.innerHTML = `
        <div></div>
        ${this.readOnly ? '' : `
        <button type="submit" class="pg-btn" style="padding: 10px var(--of-space-l); font-size: var(--of-font-size-base);">
          ${OpenFormRenderer.icon('check')} ${esc(this.translations.formSubmitButton)}
        </button>
        `}
      `;
      return navigationEl;
    }

    // Pagination buttons
    const isFirst = position === 0;
    const isLast = position === navigable.length - 1;
    navigationEl.innerHTML = `
      <button type="button" id="${esc(this._domId('btn-prev-page'))}" class="pg-btn pg-btn-secondary renderer-btn-prev" style="padding: 10px 20px; font-size: var(--of-font-size-base); visibility: ${isFirst ? 'hidden' : 'visible'}">
        ${OpenFormRenderer.icon('arrow-left')} ${esc(this.translations.formPrevPageButton)}
      </button>

      ${isLast ? (this.readOnly ? '<div></div>' : `
      <button type="submit" class="pg-btn" style="padding: 10px var(--of-space-l); font-size: var(--of-font-size-base);">
        ${OpenFormRenderer.icon('check')} ${esc(this.translations.formSubmitButton)}
      </button>
      `) : `
      <button type="button" id="${esc(this._domId('btn-next-page'))}" class="pg-btn renderer-btn-next" style="padding: 10px 20px; font-size: var(--of-font-size-base);">
        ${esc(this.translations.formNextPageButton)} ${OpenFormRenderer.icon('arrow-right')}
      </button>
      `}
    `;
    const prevBtn = navigationEl.querySelector('.renderer-btn-prev');
    const nextBtn = navigationEl.querySelector('.renderer-btn-next');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isFirst) this.navigateToPage(navigable[position - 1]);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLast) this.navigateToPage(navigable[position + 1]);
      });
    }
    return navigationEl;
  }

  /**
   * Render horizontal progress bar steps (Pagination)
   */
  renderStepsBar() {
    // Only the pages not hidden by a page rule get a tab, renumbered 1..n
    const navigable = this._navigablePages();
    const totalPages = navigable.length;
    if (totalPages <= 1) return null;
    const activePosition = Math.max(0, navigable.indexOf(this.activePageIndex));

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
    const percent = (activePosition / (totalPages - 1)) * 100;
    progressLine.style.width = `${percent}%`;
    stepsBar.appendChild(progressLine);

    navigable.forEach((pageIndex, position) => {
      const page = this.schema.pages[pageIndex];
      const index = pageIndex;
      const stepEl = document.createElement('div');
      stepEl.className = 'renderer-step';

      const isActive = index === this.activePageIndex;
      const isCompleted = position < activePosition;

      if (isActive) stepEl.classList.add('active');
      if (isCompleted) stepEl.classList.add('completed');

      stepEl.setAttribute('role', 'tab');
      stepEl.setAttribute('aria-selected', isActive ? 'true' : 'false');
      // Only the active page's panel exists in the DOM, so only its tab can point at it
      if (isActive) stepEl.setAttribute('aria-controls', this._domId('page-panel', page.pageId));
      stepEl.setAttribute('tabindex', isActive ? '0' : '-1');
      stepEl.id = this._domId('step-tab', page.pageId);

      const bubble = document.createElement('div');
      bubble.className = 'renderer-step-bubble';
      bubble.textContent = position + 1;
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
        // Retrograde jumping is always allowed; forward jumping demands intermediate steps are valid
        this.navigateToPage(index);
      });

      // Keyboard arrow keys navigation for accessibility compliant WAI-ARIA tabs
      stepEl.addEventListener('keydown', (e) => {
        let targetIdx = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          targetIdx = (position + 1) % totalPages;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          targetIdx = (position - 1 + totalPages) % totalPages;
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
    mobileHeader.textContent = `${this.translations.stepIndicatorPrefix} ${activePosition + 1} ${this.translations.stepIndicatorOf} ${totalPages}${this.translations.stepIndicatorDivider} ${displayPageTitle}`;
    stepsContainer.appendChild(mobileHeader);
    return stepsContainer;
  }

  /**
   * Generates input wrapper with modern responsive classes
   */
  createWidgetWrapper(field) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-input-wrapper';
    wrapper.id = this._domId('wrapper', field.id);

    // Field labels (skip for structural dividers and unsupported types)
    const supportedType = OpenFormRenderer.FIELD_TYPES.includes(field.type);
    if (supportedType && !['header', 'paragraph'].includes(field.type)) {
      const label = document.createElement('label');
      label.className = `form-label ${field.required ? 'required' : ''}`;
      label.id = this._domId('label', field.id);
      // Group widgets have no single control to point at: they reference the label with
      // aria-labelledby instead (a `for` here would dangle).
      if (!['radio', 'checkbox', 'matrix', 'repeater'].includes(field.type)) {
        label.setAttribute('for', this._domId('input', field.id));
      }
      label.textContent = this.getTranslatedValue('fields', field.key, 'label', null, field.label);
      wrapper.appendChild(label);
    }

    const container = document.createElement('div');
    container.className = 'form-input-container';
    wrapper.appendChild(container);

    // Everything interpolated into the templates below is escaped: labels, placeholders,
    // translations and even field ids come from the schema / host and are untrusted.
    const esc = OpenFormRenderer.escapeHtml;
    const did = (kind) => esc(this._domId(kind, field.id));

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
          ${OpenFormRenderer.icon('text-cursor-input', 'form-input-icon')}
          <input type="text" id="${did('input')}" class="form-input" 
                 placeholder="${esc(txtPlaceholder)}" ${field.required ? 'required aria-required="true"' : ''}
                 aria-describedby="${did('error')}" />
        `;
        break;

      case 'textarea':
        const taPlaceholder = this.getTranslatedValue('fields', field.key, 'placeholder', null, field.placeholder || '');
        container.innerHTML = `
          <textarea id="${did('input')}" class="form-input" rows="4"
                    placeholder="${esc(taPlaceholder)}" ${field.required ? 'required aria-required="true"' : ''}
                    aria-describedby="${did('error')}"></textarea>
        `;
        break;

      case 'number':
        const numPlaceholder = this.getTranslatedValue('fields', field.key, 'placeholder', null, field.placeholder || '0');
        const iconName = field.isCalculated ? 'calculator' : 'binary';
        const readonlyAttr = (field.isCalculated || this.readOnly) ? 'readonly style="background: var(--of-color-neutral-2); cursor: not-allowed;"' : '';
        // A calculated value is shown in the reader's number format (an <input type="number">
        // only takes a plain "1234.5"); the stored answer stays a plain JS number.
        const numInputType = field.isCalculated ? 'text" inputmode="decimal' : 'number';
        container.innerHTML = `
          ${OpenFormRenderer.icon(iconName, 'form-input-icon')}
          <input type="${numInputType}" id="${did('input')}" class="form-input" 
                 placeholder="${esc(numPlaceholder)}" ${field.required ? 'required aria-required="true"' : ''} ${readonlyAttr}
                 aria-describedby="${did('error')}" />
        `;
        break;

      case 'date':
        container.innerHTML = `
          ${OpenFormRenderer.icon('calendar', 'form-input-icon')}
          <input type="date" id="${did('input')}" class="form-input" ${field.required ? 'required aria-required="true"' : ''}
                 aria-describedby="${did('error')}" />
        `;
        break;

      case 'boolean':
        container.innerHTML = `
          <label class="form-switch-container">
            <span class="form-switch">
              <input type="checkbox" id="${did('input')}" ${this.answers[field.key] ? 'checked' : ''}
                     aria-describedby="${did('error')}" />
              <span class="form-slider"></span>
            </span>
            <span class="form-switch-label" aria-hidden="true" style="font-size: var(--of-font-size-s); color: var(--of-color-neutral-8);">${esc(this.translations.switchLabel)}</span>
          </label>
        `;
        break;

      case 'dropdown':
        container.innerHTML = `
          ${OpenFormRenderer.icon('list-collapse', 'form-input-icon')}
          <select id="${did('input')}" class="form-input" ${field.required ? 'required aria-required="true"' : ''}
                  aria-describedby="${did('error')}">
            <option value="">${esc(this.translations.selectOptionPlaceholder)}</option>
          </select>
        `;
        this.loadDropdownOptions(field, container.querySelector('select'));
        break;

      case 'radio':
        container.innerHTML = `
          <div id="${did('group')}" class="form-radio-group" role="radiogroup" aria-labelledby="${did('label')}"></div>
        `;
        this.loadRadioOptions(field, container.querySelector('.form-radio-group'));
        break;

      case 'checkbox':
        container.innerHTML = `
          <div id="${did('group')}" class="form-checkbox-group" role="group" aria-labelledby="${did('label')}"></div>
        `;
        this.loadCheckboxOptions(field, container.querySelector('.form-checkbox-group'));
        break;

      case 'signature':
        container.classList.add('is-signature-container');
        container.setAttribute('role', 'group');
        container.setAttribute('aria-labelledby', this._domId('label', field.id));
        const signatureFieldLabel = this.getTranslatedValue('fields', field.key, 'label', null, field.label);
        container.innerHTML = `
          <div class="form-signature-box ${this.readOnly ? 'is-readonly' : ''}">
            <canvas id="${did('canvas')}" class="form-signature-canvas" width="500" height="150" role="img" aria-label="${esc(signatureFieldLabel)}: ${esc(this.translations.signatureAriaLabel)}" style="display: block; width: 100%; height: 150px; touch-action: none;"></canvas>

            ${this.readOnly ? '' : `
            <div id="${did('type-container')}" style="display: none; padding: var(--of-space-m); border-top: 1px solid var(--of-border); background: var(--of-color-neutral-2);">
              <label for="${did('type-input')}" style="font-size: var(--of-font-size-xs); font-weight: var(--of-font-weight-semibold); color: var(--of-color-neutral-7); display: block; margin-bottom: 6px;">${esc(this.translations.signatureTypeLabel)}</label>
              <input type="text" id="${did('type-input')}" class="form-input" placeholder="${esc(this.translations.signatureTypePlaceholder)}" aria-describedby="${did('error')}" style="font-family: 'Caveat', cursive; font-size: 20px; font-weight: var(--of-font-weight-medium);" />
            </div>

            <div class="form-signature-bar">
              <span class="form-signature-indicator" id="${did('indicator')}">
                ${OpenFormRenderer.icon('pen-tool')} ${esc(this.translations.signatureInstruction)}
              </span>
              <button type="button" id="${did('clear')}" class="form-signature-clear">
                ${OpenFormRenderer.icon('rotate-ccw', '', 'width: 12px; height: 12px;')} ${esc(this.translations.signatureClearButton)}
              </button>
            </div>
            `}
          </div>
          ${this.readOnly ? '' : `
          <div class="signature-mode-bar" style="display: flex; gap: var(--of-space-s); margin-top: var(--of-space-s);">
            <button type="button" id="${did('mode-draw')}" class="signature-mode-tab active" aria-pressed="true" style="font-size: var(--of-font-size-xs); padding: var(--of-space-xs) var(--of-space-m); border-radius: var(--of-border-radius-xs); border: 1px solid var(--of-border); background: var(--of-color-neutral-2); color: var(--of-color-neutral-8); cursor: pointer;">
              ${OpenFormRenderer.icon('edit-3', '', 'width: 12px; height: 12px; vertical-align: middle;')} ${esc(this.translations.signatureModeDrawLabel)}
            </button>
            <button type="button" id="${did('mode-type')}" class="signature-mode-tab" aria-pressed="false" style="font-size: var(--of-font-size-xs); padding: var(--of-space-xs) var(--of-space-m); border-radius: var(--of-border-radius-xs); border: 1px solid var(--of-border); background: transparent; color: var(--of-color-neutral-8); cursor: pointer;">
              ${OpenFormRenderer.icon('keyboard', '', 'width: 12px; height: 12px; vertical-align: middle;')} ${esc(this.translations.signatureModeTypeLabel)}
            </button>
          </div>
          `}
          <input type="hidden" id="${did('input')}" ${field.required ? 'required aria-required="true"' : ''} aria-describedby="${did('error')}" />
        `;
        break;

      case 'file':
        container.innerHTML = `
          <div id="${did('uploader')}" class="form-file-uploader" style="display: flex;" role="button" tabindex="0" aria-labelledby="${did('label')}">
            ${OpenFormRenderer.icon('upload-cloud')}
            <div style="font-size: var(--of-font-size-s); font-weight: var(--of-font-weight-semibold); color: var(--of-color-neutral-10); margin-bottom: 2px;">
              ${esc(this.translations.fileClickToUpload)}
            </div>
            <div style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7);">${(() => {
            let reqText = this.getTranslatedValue('fields', field.key || field.id, 'fileRequirementsText', null, field.fileRequirementsText || this.translations.fileTypeRequirements);
            if (!field.fileRequirementsText) {
              const maxLimit = field.maxFileSizeMB !== undefined ? field.maxFileSizeMB : 5;
              reqText = reqText.replace('5MB', `${maxLimit}MB`).replace('5 MB', `${maxLimit} MB`);
            }
            return esc(reqText);
          })()}</div>
            <input type="file" id="${did('filepicker')}" style="display: none;" accept="${esc(field.acceptedTypes || OpenFormRenderer.DEFAULT_ACCEPTED_TYPES)}" />
          </div>
          <div id="${did('filedetails')}" style="display: none;"></div>
          <input type="hidden" id="${did('input')}" ${field.required ? 'required' : ''} />
        `;
        break;

      case 'repeater':
        container.classList.add('is-repeater-container');
        container.setAttribute('role', 'group');
        container.setAttribute('aria-labelledby', this._domId('label', field.id));
        this.renderRepeaterWidget(field, container);
        break;

      case 'matrix':
        container.innerHTML = `
          <div class="form-matrix-wrapper">
            <table class="form-matrix-table" id="${did('matrix')}"></table>
          </div>
        `;
        this.loadMatrixWidget(field, container.querySelector('.form-matrix-table'));
        break;

      default: {
        // Unknown type (typo, or a newer schema): show a visible placeholder, not an empty box.
        wrapper.classList.add('is-unsupported');
        const note = document.createElement('div');
        note.className = 'form-unsupported-field';
        note.setAttribute('role', 'note');
        note.style.cssText = 'padding: 8px 12px; border: 1px dashed currentColor; border-radius: 6px; opacity: 0.75; font-size: 0.9em;';
        note.textContent = `${this.translations.unsupportedFieldType}: ${String(field.type)}`;
        container.appendChild(note);
      }
    }

    // Required warning messages
    if (supportedType && !['header', 'paragraph'].includes(field.type)) {
      const errorEl = document.createElement('span');
      errorEl.className = 'form-error-message';
      errorEl.id = this._domId('error', field.id);
      errorEl.setAttribute('role', 'alert');
      errorEl.innerHTML = `${OpenFormRenderer.icon('alert-circle')} ${esc(this.translations.requiredFieldBubble)}`;
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
    msg.id = this._domId('options-error', field.id);
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

        const radioId = this._domId('radio', `${field.id}-${idx}`);
        const isChecked = selectedVal !== undefined && selectedVal !== null && selectedVal !== ''
          && (opt.value === selectedVal || String(opt.value) === String(selectedVal));

        const displayOptLabel = field.optionsType === 'static'
          ? this.getTranslatedValue('fields', field.key, 'options', opt.value, opt.label)
          : opt.label;

        itemEl.innerHTML = `
          <input type="radio" id="${esc(radioId)}" name="${esc(this._domId('radio', field.id))}" value="${esc(opt.value)}" class="form-radio-input" ${isChecked ? 'checked' : ''} ${this.readOnly ? 'disabled' : ''} aria-describedby="${esc(this._domId('error', field.id))}" />
          <label for="${esc(radioId)}" class="form-radio-label">${esc(displayOptLabel)}</label>
        `;

        const radioInput = itemEl.querySelector('input');
        if (!this.readOnly) {
          radioInput.addEventListener('change', () => {
            this.answers[field.key] = opt.value;
            this.handleFieldChanged(field.key);

            const wrapper = this._byId('wrapper', field.id);
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

        const checkboxId = this._domId('checkbox', `${field.id}-${idx}`);
        const isChecked = selectedVals.includes(opt.value);

        const displayOptLabel = field.optionsType === 'static'
          ? this.getTranslatedValue('fields', field.key, 'options', opt.value, opt.label)
          : opt.label;

        itemEl.innerHTML = `
          <input type="checkbox" id="${esc(checkboxId)}" name="${esc(this._domId('checkbox', field.id))}" value="${esc(opt.value)}" class="form-checkbox-input" ${isChecked ? 'checked' : ''} ${this.readOnly ? 'disabled' : ''} aria-describedby="${esc(this._domId('error', field.id))}" />
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

            const wrapper = this._byId('wrapper', field.id);
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

          const radioId = this._domId('matrix-radio', `${field.id}-${row.key}-${optIdx}`);
          const rowVal = selectedVals[row.key];
          const isChecked = rowVal !== undefined && rowVal !== null && rowVal !== ''
            && (rowVal === opt.value || String(rowVal) === String(opt.value));
          const displayOptLabel = field.optionsType === 'static'
            ? this.getTranslatedValue('fields', field.key, 'options', opt.value, opt.label)
            : opt.label;

          td.innerHTML = `
            <label class="form-matrix-radio-label" for="${esc(radioId)}">
              <input type="radio" id="${esc(radioId)}" name="${esc(this._domId('matrix', `${field.id}-${row.key}`))}" value="${esc(opt.value)}" class="form-radio-input" aria-label="${esc(displayRowLabel)}: ${esc(displayOptLabel)}" ${isChecked ? 'checked' : ''} ${this.readOnly ? 'disabled' : ''} />
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
              const wrapper = this._byId('wrapper', field.id);
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
          this.bindFieldEvents(col.field);
        });
      });
    });
  }

  /**
   * Value to store for a text/number input: when the field has a `mask`, re-formats what the
   * user typed in place (keeping the caret) and returns the clean or formatted text per
   * `maskCleanValue`; otherwise the raw input value. Shared by top-level and repeater fields.
   */
  _readMaskedInput(field, inputEl) {
    const rawVal = inputEl.value;
    if (!field.mask || !['text', 'number'].includes(field.type)) return rawVal;

    const formatted = this.applyMask(rawVal, field.mask);
    const start = inputEl.selectionStart;
    const oldLen = rawVal.length;
    inputEl.value = formatted;
    try {
      inputEl.selectionStart = inputEl.selectionEnd = start + (formatted.length - oldLen);
    } catch (e) { /* input types without a selection (e.g. number) */ }
    return field.maskCleanValue !== false ? this.getCleanValue(formatted, field.mask) : formatted;
  }

  /** Pre-fills one rendered top-level field from this.answers and wires its listeners. */
  bindFieldEvents(field) {
    if (field.type === 'header') return;

    const inputEl = this._byId('input', field.id);

    if (inputEl) {
      // Pre-populate answers
      if (field.type !== 'boolean' && field.type !== 'signature' && field.type !== 'file') {
        const stored = this.answers[field.key];
        let val = stored === undefined || stored === null ? '' : stored;
        if (field.mask && val) {
          val = this.applyMask(String(val), field.mask);
        } else if (field.type === 'number' && field.isCalculated) {
          val = this._formatNumber(stored);
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
            this.answers[field.key] = this._readMaskedInput(field, e.target);
            if (field.type === 'number') {
              this.answers[field.key] = OpenFormRenderer._toNumberAnswer(this.answers[field.key]);
            }

            this.handleFieldChanged(field.key);

            const wrapper = this._byId('wrapper', field.id);
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
  }

  /**
   * Reacts to an answer change: recalculates formulas, re-evaluates rules and notifies the
   * host. `changedFieldKey` may be an internal repeater sub-field key; the host always gets
   * the top-level key (the repeater's).
   */
  handleFieldChanged(changedFieldKey) {
    if (this._destroyed || !this.schema) return;
    this.recalculateFormulas();
    this.evalBusinessRules();
    this._reactToPageRules();
    this.notifyFieldChange(changedFieldKey);
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
    // Same for null: an empty `number` answer is stored as null, and Number(null) === 0
    // would otherwise make it "less than" any positive number.
    if (a === undefined || b === undefined || a === null || b === null) return NaN;

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
   * Answer used by rule conditions. While a repeater item is being validated (see
   * _withItemScope) a key that names one of the item's sub-fields reads that item's value,
   * so a sub-field's rules can depend on its siblings; any other key reads the form answers.
   */
  _answerFor(key) {
    const scope = this._itemScope;
    if (scope && scope.keys.has(key)) return scope.item[key];
    return this.answers[key];
  }

  /** Runs `fn` with rule conditions resolved against one repeater item (see _answerFor). */
  _withItemScope(repeaterField, item, fn) {
    const keys = new Set();
    (repeaterField.rows || []).forEach(row => (row.columns || []).forEach(col => {
      if (col && col.field && col.field.key) keys.add(col.field.key);
    }));
    const previous = this._itemScope;
    this._itemScope = { keys, item: item || {} };
    try {
      return fn();
    } finally {
      this._itemScope = previous;
    }
  }

  /**
   * Evaluates individual conditional rules operator logic.
   * Supports compareMode: 'field' to resolve the comparison target from this.answers instead of a static value.
   */
  isConditionSatisfied(cond) {
    if (!cond || !cond.dependentFieldKey) return false;

    // An empty `number` answer is stored as null: for (in)equality and contains it reads as
    // an empty string, as it did when numbers were stored as text; ordering operators get
    // null and never match (see compareOrdinal).
    const rawDependentVal = this._answerFor(cond.dependentFieldKey);

    // Support field-to-field comparison (Cross-Field Validations)
    const compareMode = cond.compareMode || 'value';
    const rawTargetVal = compareMode === 'field' && cond.compareToFieldKey
      ? this._answerFor(cond.compareToFieldKey)
      : cond.equalsValue;
    const isOrdering = ['greaterThan', 'greaterThanOrEquals', 'gte', 'lessThan', 'lessThanOrEquals', 'lte'].includes(cond.operator);
    const dependentVal = rawDependentVal === null && !isOrdering ? '' : rawDependentVal;
    const targetVal = rawTargetVal === null && !isOrdering ? '' : rawTargetVal;

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
        // Unknown operators are never satisfied (reported by validateSchema).
        return false;
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
    // An upload still running (or failed) counts: hiding the field must abort it
    if (field.type === 'file' && this._uploads[field.id]) return true;
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
    // The scoped accessors are non-enumerable, so Object.keys() wouldn't see them
    Object.getOwnPropertyNames(this.answers).forEach(k => {
      if (k.startsWith(answerPrefix)) {
        delete this.answers[k];
        this._scopedKeyOwners.delete(k);
      }
    });

    const scopedIdPrefix = `${field.id}-`;
    this._abortUploads(scopedIdPrefix);
    this._revokePreviewUrls(scopedIdPrefix);
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
    // Uploaded references are dropped with the answer: tell the host so it can delete them
    if (field.type === 'file') {
      this._notifyFileRemoved(this.answers[field.key], field, 'hidden');
    } else if (field.type === 'repeater' && Array.isArray(this.answers[field.key])) {
      this.answers[field.key].forEach((item, itemIndex) => this._notifyRepeaterFiles(field, item, itemIndex, 'hidden'));
    }
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
    } else if (field.type === 'number') {
      this.answers[field.key] = null;
    } else {
      this.answers[field.key] = '';
    }

    // 2. Synchronize DOM element states if rendered in the document
    const wrapper = this._byId('wrapper', field.id);
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
      const hiddenInput = this._byId('input', field.id, wrapper);
      if (hiddenInput) hiddenInput.value = '';
      const typeInput = this._byId('type-input', field.id, wrapper);
      if (typeInput) typeInput.value = '';
    } else if (field.type === 'file') {
      this._abortUploads(field.id, true);
      this._revokePreviewUrls(field.id, true);
      delete this.uploadedFiles[field.id];
      const details = this._byId('filedetails', field.id, wrapper);
      const uploader = this._byId('uploader', field.id, wrapper);
      const hiddenInput = this._byId('input', field.id, wrapper);
      const picker = this._byId('filepicker', field.id, wrapper);
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

    // Repeater sub-field rules are per item, so they run after the top-level state is applied
    (activePage.sections || []).forEach(section => (section.rows || []).forEach(row => (row.columns || []).forEach(col => {
      if (col.field && col.field.type === 'repeater') this._applyRepeaterItemRules(col.field);
    })));
  }

  /** The per-item copy of a repeater sub-field that the item's widgets are rendered from. */
  _scopedSubField(repeaterField, itemIndex, subField) {
    return Object.assign({}, subField, {
      id: `${repeaterField.id}-${itemIndex}-${subField.id}`,
      key: `sub-${repeaterField.id}-${itemIndex}-${subField.key}`,
      _repeater: { key: repeaterField.key, itemIndex, subKey: subField.key, subId: subField.id }
    });
  }

  /**
   * Applies the sub-fields' conditionalRules (visibility / required / disabled) to every item of
   * a repeater: each item is evaluated against its own values (see _withItemScope), a sub-field
   * that becomes hidden is reset like a hidden top-level field, and the rendered column, required
   * asterisk, aria-required and disabled state follow the result. Runs after every change.
   */
  _applyRepeaterItemRules(field) {
    const items = this.answers[field.key];
    if (!Array.isArray(items) || !this.formEl) return;
    const parentDisabled = !!this.fieldDisabledStates[field.id];
    const subFields = [];
    (field.rows || []).forEach(row => (row.columns || []).forEach(col => {
      if (col && col.field && (col.field.conditionalRules || []).length > 0) subFields.push(col.field);
    }));
    // Sub-fields without rules still need their static required/disabled DOM, which is rendered as is
    if (subFields.length === 0) return;

    // Clearing a hidden sub-field can flip a sibling rule, so settle first (bounded, like top level)
    for (let pass = 0; pass < 5; pass++) {
      let changed = false;
      items.forEach((item, itemIndex) => subFields.forEach(subField => {
        const state = this._withItemScope(field, item, () => this.evaluateFieldState(subField, null));
        const scoped = this._scopedSubField(field, itemIndex, subField);
        if (!state.visible && scoped.key in this.answers && this.hasNonDefaultValue(scoped)) {
          this.clearFieldState(scoped);
          changed = true;
        }
      }));
      if (!changed) break;
    }

    items.forEach((item, itemIndex) => {
      subFields.forEach(subField => {
        const state = this._withItemScope(field, item, () => this.evaluateFieldState(subField, null));
        const scoped = this._scopedSubField(field, itemIndex, subField);
        const colEl = this.formEl.querySelector(`.form-column[data-field-id="${scoped.id.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"]`);
        if (colEl) {
          colEl.style.display = state.visible ? 'block' : 'none';
          const rowEl = colEl.parentElement;
          if (rowEl && rowEl.classList.contains('renderer-row')) {
            const anyVisible = Array.from(rowEl.children).some(c => c.style.display !== 'none');
            rowEl.style.display = anyVisible ? 'grid' : 'none';
          }
        }
        this._applyStateToWrapper(scoped, state.required, state.disabled || parentDisabled, parentDisabled);
      });
    });
  }

  /**
   * Applies a field's required / disabled state to its wrapper: required asterisk, aria-required,
   * `required` attributes and the disabled look/attributes. `field.id` addresses the wrapper
   * (repeater sub-fields pass their per-item scoped copy).
   */
  _applyStateToWrapper(field, isRequired, isDisabled, parentDisabled = false) {
    const fieldWrapper = this._byId('wrapper', field.id);
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
      const primaryInput = Array.from(fieldWrapper.querySelectorAll('input, select, textarea')).find(el => el.id === this._domId('input', field.id));
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

          this._applyStateToWrapper(field, isRequired, isDisabled);
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
    // Opt-in handwriting webfont for typed signatures (handwritingFontUrl). Without it the
    // renderer makes no external request and uses HANDWRITING_FONT_STACK as is.
    if (this.handwritingFontUrl && !document.getElementById('form-handwriting-font')) {
      const link = document.createElement('link');
      link.id = 'form-handwriting-font';
      link.rel = 'stylesheet';
      link.href = this.handwritingFontUrl;
      document.head.appendChild(link);
    }

    const searchRoot = parentEl || this.formEl;
    if (!searchRoot) return;
    const canvas = this._byId('canvas', field.id, searchRoot);
    const clearBtn = this._byId('clear', field.id, searchRoot);
    const hiddenInput = this._byId('input', field.id, searchRoot);

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
      mode: 'draw',
      // Size in CSS pixels; the backing bitmap is cssWidth*dpr x cssHeight*dpr so strokes stay
      // crisp on high-density screens while pointer coordinates stay in CSS pixels.
      cssWidth: canvas.width,
      cssHeight: canvas.height,
      source: null
    };

    this.signaturePads[field.id] = padState;

    const isDataImage = (v) => typeof v === 'string' && v.startsWith('data:image');

    const existingSignature = this.answers[field.key];
    if (isDataImage(existingSignature)) {
      hiddenInput.value = this.translations.signatureInputVal;
      padState.hasDrawn = true;
    }

    const applyStrokeStyle = () => {
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    // (Re)sizes the bitmap for the current CSS size and device pixel ratio, then repaints the
    // stored signature scaled to fit.
    const resizeCanvas = (width, height) => {
      const dpr = (window.devicePixelRatio > 0 ? window.devicePixelRatio : 1);
      padState.cssWidth = width;
      padState.cssHeight = height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (typeof ctx.setTransform === 'function') ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      applyStrokeStyle();

      const currentSignature = this.answers[field.key];
      if (isDataImage(currentSignature)) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, padState.cssWidth, padState.cssHeight);
        };
        img.src = currentSignature;
      }
    };
    const clearPad = () => ctx.clearRect(0, 0, padState.cssWidth, padState.cssHeight);

    // ResizeObserver tracks dynamic canvas scaling rules. It stays alive for the life of the
    // pad (also after Clear); teardownSignaturePad disconnects it.
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) resizeCanvas(width, height);
        }
      });
      resizeObserver.observe(canvas);
      padState.resizeObserver = resizeObserver;
    } else {
      // Fallback
      resizeCanvas(canvas.offsetWidth || 500, canvas.offsetHeight || 150);
    }

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const point = e.touches && e.touches.length > 0 ? e.touches[0] : e;
      return {
        x: point.clientX - rect.left,
        y: point.clientY - rect.top
      };
    };

    // One gesture is reported by up to three event families (pointer, then compatibility
    // mouse/touch events). The family that starts the stroke owns it; the others are ignored.
    const startDraw = (source) => (e) => {
      if (this.fieldDisabledStates && this.fieldDisabledStates[field.id]) return;
      if (padState.isDrawing) return;
      e.preventDefault();
      padState.isDrawing = true;
      padState.source = source;
      padState.strokeChanged = false;
      if (source === 'pointer' && typeof canvas.setPointerCapture === 'function' && e.pointerId !== undefined) {
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* synthetic event */ }
      }
      const pos = getPos(e);
      applyStrokeStyle();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (source) => (e) => {
      if (!padState.isDrawing || padState.source !== source) return;
      if (this.fieldDisabledStates && this.fieldDisabledStates[field.id]) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      padState.hasDrawn = true;
      padState.strokeChanged = true;
      // The (expensive) toDataURL() encoding happens once, when the stroke ends.
      hiddenInput.value = this.translations.signatureInputVal;

      const wrapper = this._byId('wrapper', field.id);
      if (wrapper) wrapper.classList.remove('is-invalid');
    };

    // A stroke ends on the window-level mouseup/touchend: that's when the drawn signature is
    // reported (rules, formulas, onFieldChange) — not on every mousemove.
    const stopDraw = () => {
      const strokeEnded = padState.isDrawing && padState.strokeChanged;
      padState.isDrawing = false;
      padState.source = null;
      padState.strokeChanged = false;
      if (strokeEnded && !this._destroyed) {
        this.answers[field.key] = canvas.toDataURL();
        this.handleFieldChanged(field.key);
      }
    };
    padState.stopDraw = stopDraw;

    if (!this.readOnly) {
      canvas.addEventListener('pointerdown', startDraw('pointer'));
      canvas.addEventListener('pointermove', draw('pointer'));
      window.addEventListener('pointerup', stopDraw);
      window.addEventListener('pointercancel', stopDraw);

      // Fallback for browsers without Pointer Events
      canvas.addEventListener('mousedown', startDraw('mouse'));
      canvas.addEventListener('mousemove', draw('mouse'));
      window.addEventListener('mouseup', stopDraw);

      canvas.addEventListener('touchstart', startDraw('touch'), { passive: false });
      canvas.addEventListener('touchmove', draw('touch'), { passive: false });
      window.addEventListener('touchend', stopDraw);

      clearBtn.addEventListener('click', () => {
        if (this.fieldDisabledStates && this.fieldDisabledStates[field.id]) return;
        clearPad();
        padState.hasDrawn = false;
        const hadValue = this.hasSignatureAnswer(this.answers[field.key]);
        this.answers[field.key] = '';
        hiddenInput.value = '';
        const typeInput = this._byId('type-input', field.id);
        if (typeInput) typeInput.value = '';
        if (hadValue) this.handleFieldChanged(field.key);
      });

      // Bind accessible draw vs type mode switchers
      const modeDrawBtn = this._byId('mode-draw', field.id, searchRoot);
      const modeTypeBtn = this._byId('mode-type', field.id, searchRoot);
      const typeContainer = this._byId('type-container', field.id, searchRoot);
      const typeInput = this._byId('type-input', field.id, searchRoot);
      const indicator = this._byId('indicator', field.id, searchRoot);

      if (modeDrawBtn && modeTypeBtn && typeContainer && typeInput) {
        modeDrawBtn.addEventListener('click', () => {
          padState.mode = 'draw';
          modeDrawBtn.classList.add('active');
          modeDrawBtn.setAttribute('aria-pressed', 'true');
          modeDrawBtn.style.background = 'var(--of-color-neutral-2)';
          modeTypeBtn.classList.remove('active');
          modeTypeBtn.setAttribute('aria-pressed', 'false');
          modeTypeBtn.style.background = 'transparent';
          typeContainer.style.display = 'none';
          if (indicator) indicator.style.display = 'inline-flex';

          clearPad();
          padState.hasDrawn = false;
          const hadValue = this.hasSignatureAnswer(this.answers[field.key]);
          this.answers[field.key] = '';
          hiddenInput.value = '';
          if (hadValue) this.handleFieldChanged(field.key);
        });

        modeTypeBtn.addEventListener('click', () => {
          padState.mode = 'type';
          modeTypeBtn.classList.add('active');
          modeTypeBtn.setAttribute('aria-pressed', 'true');
          modeTypeBtn.style.background = 'var(--of-color-neutral-2)';
          modeDrawBtn.classList.remove('active');
          modeDrawBtn.setAttribute('aria-pressed', 'false');
          modeDrawBtn.style.background = 'transparent';
          typeContainer.style.display = 'block';
          if (indicator) indicator.style.display = 'none';

          clearPad();
          padState.hasDrawn = false;
          const hadValue = this.hasSignatureAnswer(this.answers[field.key]);
          this.answers[field.key] = '';
          hiddenInput.value = '';
          typeInput.value = '';
          if (hadValue) this.handleFieldChanged(field.key);
        });

        const paintTypedSignature = (e) => {
          if (padState.mode !== 'type') return;
          const val = e.target.value.trim();

          clearPad();

          if (val) {
            padState.hasDrawn = true;
            ctx.font = `italic 40px ${OpenFormRenderer.HANDWRITING_FONT_STACK}`;
            ctx.fillStyle = "#1a1a1a";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(val, padState.cssWidth / 2, padState.cssHeight / 2);

            const dataUrl = canvas.toDataURL();
            this.answers[field.key] = dataUrl;
            hiddenInput.value = this.translations.signatureInputVal;

            const wrapper = this._byId('wrapper', field.id);
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
          this.handleFieldChanged(field.key);
        };

        typeInput.addEventListener('input', (e) => {
          // With a configured handwriting font, wait for it before drawing: a canvas painted
          // before the webfont is ready would bake a fallback face into the signature image.
          if (this.handwritingFontUrl && e.target.value.trim() && document.fonts && typeof document.fonts.load === 'function') {
            const val = e.target.value.trim();
            const ready = Promise.resolve(document.fonts.load(`italic 500 40px ${OpenFormRenderer.HANDWRITING_FONT_STACK}`, val)).catch(() => {});
            ready.then(() => {
              if (this._destroyed || padState.mode !== 'type' || typeInput.value.trim() !== val) return;
              paintTypedSignature({ target: typeInput });
            });
            return;
          }
          paintTypedSignature(e);
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
    const uploader = this._byId('uploader', field.id, searchRoot);
    const picker = this._byId('filepicker', field.id, searchRoot);
    const details = this._byId('filedetails', field.id, searchRoot);
    const hiddenInput = this._byId('input', field.id, searchRoot);

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
        details.innerHTML = this.renderFileDetailsHTML(file, true, field.id);
        hiddenInput.value = file.name;
        this.bindFileEvents(details, file, field, hiddenInput, uploader, true);
      } else {
        uploader.style.display = 'flex';
        uploader.className = 'form-file-uploader is-readonly';
        uploader.innerHTML = `
          ${OpenFormRenderer.icon('file', '', 'margin-bottom: var(--of-space-s);')}
          <div style="font-size: var(--of-font-size-s); color: var(--of-color-neutral-6);">${OpenFormRenderer.escapeHtml(this.translations.fileNoneUploaded)}</div>
        `;
      }
      return;
    }

    // Restore uploaded file states in multi-page jumps (an upload still in flight, or one that
    // failed, is shown again from its state: it survives page changes and repeater redraws)
    if (this._uploads[field.id]) {
      this._paintUploadState(field, searchRoot);
    } else if (this.uploadedFiles[field.id]) {
      const file = this.uploadedFiles[field.id];
      uploader.style.display = 'none';
      details.style.display = 'flex';
      details.className = 'form-file-details';
      details.innerHTML = this.renderFileDetailsHTML(file, false, field.id);
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
        const dropped = e.dataTransfer.files[0];
        // The picker filters through its `accept` attribute; a drop bypasses that, so apply the same rule
        if (!OpenFormRenderer._matchesAccept(dropped, field.acceptedTypes || OpenFormRenderer.DEFAULT_ACCEPTED_TYPES)) {
          this.showToast(this.translations.fileTypeNotAllowedError, true);
          return;
        }
        this.handleFileUpload(field, dropped);
      }
    });

    picker.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleFileUpload(field, e.target.files[0]);
      }
    });
  }

  handleFileUpload(field, file) {
    const uploader = this._byId('uploader', field.id);
    const details = this._byId('filedetails', field.id);
    const hiddenInput = this._byId('input', field.id);
    const picker = this._byId('filepicker', field.id);

    const maxLimit = field.maxFileSizeMB !== undefined ? field.maxFileSizeMB : 5;
    if (file.size > maxLimit * 1024 * 1024) {
      let errorMsg = this.translations.fileTooLargeError;
      errorMsg = errorMsg.replace('5MB', `${maxLimit}MB`).replace('5 MB', `${maxLimit} MB`);
      this.showToast(errorMsg, true);
      return;
    }

    // With an uploadProvider the file goes to the host and only the returned reference is kept
    if (this.uploadProvider) {
      // Lets the same file be picked again after Cancel or a dismissed failure
      if (picker) picker.value = '';
      this._startUpload(field, file);
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
      details.innerHTML = this.renderFileDetailsHTML(fileObj, false, field.id);

      const wrapper = this._byId('wrapper', field.id);
      if (wrapper) wrapper.classList.remove('is-invalid');

      this.bindFileEvents(details, fileObj, field, hiddenInput, uploader, false);
      this.handleFieldChanged(field.key);
    };

    reader.readAsDataURL(file);
  }

  // ---- uploadProvider ------------------------------------------------------------------

  /** The schema field as the host should see it (a repeater sub-field gets its own key, not the scoped one). */
  _publicField(field) {
    const copy = JSON.parse(JSON.stringify(field));
    if (copy._repeater) {
      const info = copy._repeater;
      copy.key = info.subKey;
      copy.id = info.subId;
      copy.repeater = { key: info.key, itemIndex: info.itemIndex };
      delete copy._repeater;
    }
    return copy;
  }

  /** True while an upload for this field id is in flight (a failed one no longer blocks). */
  _isUploadPending(fieldId) {
    const state = this._uploads[fieldId];
    return !!state && state.status === 'uploading';
  }

  /**
   * Aborts in-flight uploads (their `signal`) and forgets uploads that failed. `target` is a
   * field id (with `exact`) or an id prefix (repeater items); no target means all of them.
   */
  _abortUploads(target, exact = false) {
    Object.keys(this._uploads).forEach(id => {
      if (target !== undefined && !(exact ? id === target : id.startsWith(target))) return;
      const state = this._uploads[id];
      delete this._uploads[id];
      if (state && state.controller && !state.controller.signal.aborted) {
        try { state.controller.abort(); } catch (e) { /* nothing to do */ }
      }
    });
  }

  /** Revokes session preview object URLs (same targeting as _abortUploads). */
  _revokePreviewUrls(target, exact = false) {
    Object.keys(this._objectUrls).forEach(id => {
      if (target !== undefined && !(exact ? id === target : id.startsWith(target))) return;
      const url = this._objectUrls[id];
      delete this._objectUrls[id];
      try {
        if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
      } catch (e) { /* nothing to do */ }
    });
  }

  /** Object URL used to preview an image uploaded in this session (own or borrowed by print()). */
  _previewUrlFor(fieldId) {
    if (fieldId === undefined || fieldId === null) return '';
    return this._objectUrls[fieldId] || (this._borrowedPreviewUrls && this._borrowedPreviewUrls[fieldId]) || '';
  }

  /** Converts a data URL (camera plugins hand these over) to a Blob, so it can go to the uploadProvider. */
  static _dataUrlToBlob(dataUrl) {
    const comma = dataUrl.indexOf(',');
    const meta = dataUrl.slice(5, comma < 0 ? undefined : comma);
    const type = meta.split(';')[0] || 'application/octet-stream';
    const body = comma < 0 ? '' : dataUrl.slice(comma + 1);
    const binary = /;base64$/i.test(meta) ? atob(body) : decodeURIComponent(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type });
  }

  /** Starts (or restarts, on Retry) the upload of `file` for a file field. Nothing here touches the answers until it succeeds. */
  _startUpload(field, file) {
    if (this._destroyed || !this.uploadProvider) return;
    this._abortUploads(field.id, true);

    const controller = typeof AbortController === 'function' ? new AbortController() : { signal: { aborted: false }, abort() { this.signal.aborted = true; } };
    const state = { file, controller, status: 'uploading', progress: 0, error: '' };
    this._uploads[field.id] = state;

    const context = {
      field: this._publicField(field),
      locale: this.locale,
      signal: controller.signal,
      onProgress: (fraction) => {
        if (this._uploads[field.id] !== state || state.status !== 'uploading') return;
        const value = Number(fraction);
        if (!isFinite(value)) return;
        state.progress = Math.min(1, Math.max(0, value));
        this._updateUploadProgress(field, state);
      }
    };

    this._paintUploadState(field);

    let request;
    try {
      request = Promise.resolve(this.uploadProvider(file, context));
    } catch (err) {
      request = Promise.reject(err);
    }
    // A cancelled, replaced or destroyed upload is ignored, however the provider settles
    const isCurrent = () => !this._destroyed && this._uploads[field.id] === state && !controller.signal.aborted;
    const fail = (err) => {
      if (!isCurrent()) return;
      console.warn(`OpenFormRenderer: uploadProvider failed for "${file && file.name}":`, err);
      state.status = 'error';
      state.error = (err && typeof err.message === 'string' && err.message.trim()) || (typeof err === 'string' && err.trim()) || this.translations.uploadFailedDefault;
      this._paintUploadState(field);
    };
    request.then(
      (reference) => {
        if (!isCurrent()) {
          // Cancelled, replaced, re-rendered, hidden or destroyed meanwhile: the host may have stored it
          this._notifyFileRemoved(reference, field, 'discarded');
          return;
        }
        if (!reference || typeof reference !== 'object' || Array.isArray(reference)) {
          fail(new Error(this.translations.uploadFailedDefault));
          return;
        }
        this._completeUpload(field, state, reference);
      },
      fail
    );
  }

  /** The provider resolved: keep only its reference in the answers, preview the image from an object URL. */
  _completeUpload(field, state, reference) {
    delete this._uploads[field.id];
    const file = state.file;
    const stored = Object.assign({ name: file.name, size: file.size, type: file.type }, reference);

    const previous = this.uploadedFiles[field.id];
    if (previous && previous !== stored) this._notifyFileRemoved(previous, field, 'replaced');

    this._revokePreviewUrls(field.id, true);
    if (String(file.type || '').startsWith('image/') && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      try { this._objectUrls[field.id] = URL.createObjectURL(file); } catch (e) { /* the preview is optional */ }
    }

    this.uploadedFiles[field.id] = stored;
    this.answers[field.key] = stored;
    this._showStoredFile(field, stored);

    const wrapper = this._byId('wrapper', field.id);
    if (wrapper) wrapper.classList.remove('is-invalid');
    this.handleFieldChanged(field.key);
  }

  /** Shows a completed file (name, size, preview, delete) if its field is on screen. */
  _showStoredFile(field, fileObj, root = this.formEl) {
    const uploader = this._byId('uploader', field.id, root);
    const details = this._byId('filedetails', field.id, root);
    const hiddenInput = this._byId('input', field.id, root);
    if (!details) return;
    if (hiddenInput) hiddenInput.value = fileObj.name;
    if (uploader) uploader.style.display = 'none';
    details.style.display = 'flex';
    details.className = 'form-file-details';
    details.innerHTML = this.renderFileDetailsHTML(fileObj, false, field.id);
    this.bindFileEvents(details, fileObj, field, hiddenInput, uploader, false);
  }

  /** Puts a field back to its empty drop zone. */
  _showEmptyUploader(field) {
    const uploader = this._byId('uploader', field.id);
    const details = this._byId('filedetails', field.id);
    const hiddenInput = this._byId('input', field.id);
    const picker = this._byId('filepicker', field.id);
    if (details) { details.style.display = 'none'; details.innerHTML = ''; }
    if (uploader) uploader.style.display = 'flex';
    if (hiddenInput) hiddenInput.value = '';
    if (picker) picker.value = '';
  }

  /** Paints the in-flight / failed state of a field's upload, with its Cancel / Retry controls. */
  _paintUploadState(field, root = this.formEl) {
    const state = this._uploads[field.id];
    const uploader = this._byId('uploader', field.id, root);
    const details = this._byId('filedetails', field.id, root);
    if (!state || !details) return;
    const esc = OpenFormRenderer.escapeHtml;
    const t = this.translations;
    const isError = state.status === 'error';
    const name = state.file && state.file.name ? state.file.name : '';
    const percent = Math.round(state.progress * 100);
    const label = t.uploadProgressLabel.replace('{name}', name);

    if (uploader) uploader.style.display = 'none';
    details.style.display = 'flex';
    details.className = `form-file-details ${isError ? 'is-upload-error' : 'is-uploading'}`;
    details.innerHTML = `
      <div class="form-file-details-left form-file-upload-info">
        <div class="form-file-upload-text">
          <div class="form-file-upload-name" title="${esc(name)}">${esc(name)}</div>
          ${isError ? `
          <div class="form-file-upload-error" role="alert">${esc(state.error)}</div>
          ` : `
          <div class="form-file-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-label="${esc(label)}">
            <div class="form-file-progress-bar" style="width: ${percent}%;"></div>
          </div>
          <div class="form-file-upload-meta"><span class="form-file-upload-size">${esc(this.formatFileSize(state.file && state.file.size))}</span> <span class="form-file-upload-percent">${percent}%</span></div>
          `}
        </div>
      </div>
      <div class="form-file-details-actions">
        ${isError ? `
        <button type="button" class="pg-btn pg-btn-secondary form-file-retry-btn">${esc(t.uploadRetryLabel)}</button>
        <button type="button" class="form-file-delete-btn form-file-dismiss-btn" title="${esc(t.fileDeleteTitle)}" aria-label="${esc(t.fileDeleteTitle)}">
          ${OpenFormRenderer.icon('trash-2', '', 'width: 14px; height: 14px;')}
        </button>
        ` : `
        <button type="button" class="pg-btn pg-btn-secondary form-file-cancel-btn">${esc(t.uploadCancelLabel)}</button>
        `}
      </div>
    `;

    const cancelBtn = details.querySelector('.form-file-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this._abortUploads(field.id, true);
        this._showEmptyUploader(field);
      });
    }
    const retryBtn = details.querySelector('.form-file-retry-btn');
    if (retryBtn) retryBtn.addEventListener('click', () => this._startUpload(field, state.file));
    const dismissBtn = details.querySelector('.form-file-dismiss-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        this._abortUploads(field.id, true);
        this._showEmptyUploader(field);
      });
    }
  }

  /** Progress ticks only touch the bar: no re-render and no onFieldChange. */
  _updateUploadProgress(field, state) {
    const details = this._byId('filedetails', field.id);
    if (!details) return;
    const percent = Math.round(state.progress * 100);
    const bar = details.querySelector('.form-file-progress');
    if (bar) bar.setAttribute('aria-valuenow', String(percent));
    const fill = details.querySelector('.form-file-progress-bar');
    if (fill) fill.style.width = `${percent}%`;
    const text = details.querySelector('.form-file-upload-percent');
    if (text) text.textContent = `${percent}%`;
  }

  /**
   * Triggers beautiful fullscreen image lightboxes for images, and native direct downloads for documents
   */
  handleAttachmentClick(file, previewUrl = '') {
    const src = previewUrl || OpenFormRenderer.fileSourceUrl(file);
    const isImg = file.type?.startsWith('image/') || /^data:image/i.test(src);
    if (isImg) {
      if (!src) return;
      this.ensureLightbox();
      const lightbox = document.getElementById('lightbox-modal');
      const img = document.getElementById('lightbox-image');
      const caption = document.getElementById('lightbox-caption');

      if (lightbox && img && caption) {
        img.src = src;
        img.alt = this.translations.lightboxImageAlt;
        const closeBtn = document.getElementById('lightbox-close');
        if (closeBtn) closeBtn.setAttribute('aria-label', this.translations.lightboxCloseLabel);
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
    const src = OpenFormRenderer.fileSourceUrl(file);
    if (!src) return;
    const isCordovaShare = !!(window.plugins && window.plugins.socialsharing);
    const isCapacitorShare = !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share);

    if (isCordovaShare) {
      window.plugins.socialsharing.share(
        null,
        file.name,
        src,
        null,
        () => { },
        (err) => console.warn("Cordova sharing error:", err)
      );
    } else if (isCapacitorShare) {
      // Writing to the cache needs the Base64 payload; a remote reference opens as a normal download
      const hasFilesystem = !!(window.Capacitor.Plugins.Filesystem) && OpenFormRenderer.isSafeDataUrl(src);
      if (hasFilesystem) {
        const fs = window.Capacitor.Plugins.Filesystem;
        const base64Parts = src.split(',');
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
    tempLink.href = OpenFormRenderer.fileSourceUrl(file);
    tempLink.download = file.name;
    document.body.appendChild(tempLink);
    tempLink.click();
    tempLink.remove();
  }

  /**
   * Helper to bind events (preview click, download share/fallback, and delete action) to file details element
   */
  bindFileEvents(details, file, field, hiddenInput, uploader, isReadOnly) {

    // Bind preview/lightbox click
    const leftEl = details.querySelector('.form-file-details-left');
    if (leftEl) {
      leftEl.style.cursor = 'pointer';
      leftEl.addEventListener('click', () => {
        this.handleAttachmentClick(file, this._previewUrlFor(field && field.id));
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
          this._revokePreviewUrls(field.id, true);
          this._notifyFileRemoved(file, field, 'removed');
          if (hiddenInput) hiddenInput.value = '';
          const picker = this._byId('filepicker', field.id);
          if (picker) picker.value = '';
          details.style.display = 'none';
          if (uploader) uploader.style.display = 'flex';
          this.handleFieldChanged(field.key);
        });
      }
    }
  }

  /**
   * Tells the host an uploaded file left the form, so it can delete it server-side.
   * `reason`: 'removed' (user deleted it), 'replaced' (a new upload took its place),
   * 'hidden' (a rule hid the field and its answer was reset), 'itemRemoved' (its repeater item
   * was deleted) or 'discarded' (an upload resolved after it had been aborted; never an answer).
   * Only references are reported: Base64 content lives in the answers and goes with them.
   */
  _notifyFileRemoved(file, field, reason) {
    if (!this.onFileRemoved || !file || typeof file !== 'object' || typeof file.content === 'string') return;
    try {
      const outcome = this.onFileRemoved(OpenFormRenderer._deepClone(file), { field: this._publicField(field), reason });
      if (outcome && typeof outcome.then === 'function') {
        outcome.then(undefined, (err) => console.warn('OpenFormRenderer: onFileRemoved failed:', err));
      }
    } catch (err) {
      console.warn('OpenFormRenderer: onFileRemoved failed:', err);
    }
  }

  /** onFileRemoved for every file sub-field of one repeater item that holds a reference. */
  _notifyRepeaterFiles(field, item, itemIndex, reason) {
    if (!this.onFileRemoved || !item || typeof item !== 'object') return;
    (field.rows || []).forEach(row => (row.columns || []).forEach(col => {
      const subField = col && col.field;
      if (subField && subField.type === 'file') {
        this._notifyFileRemoved(item[subField.key], this._scopedSubField(field, itemIndex, subField), reason);
      }
    }));
  }

  /**
   * Same matching as an <input type="file" accept="..."> list: `.ext`, `type/*` or `type/subtype`
   * entries separated by commas.
   */
  static _matchesAccept(file, accept) {
    const tokens = String(accept || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    if (tokens.length === 0) return true;
    const name = String(file && file.name || '').toLowerCase();
    const type = String(file && file.type || '').toLowerCase();
    return tokens.some(token => {
      if (token.startsWith('.')) return name.endsWith(token);
      if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
      return type === token;
    });
  }

  formatFileSize(bytes) {
    if (bytes === undefined || bytes === null || isNaN(bytes)) return '';
    const units = String(this.translations.fileSizeUnits).split('|');
    const k = 1024;
    const i = bytes === 0 ? 0 : Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
    return this._formatNumberFraction(bytes / Math.pow(k, i), 1) + ' ' + units[i];
  }

  _formatNumberFraction(value, digits) {
    const locale = this.locale && this.locale !== 'default' ? this.locale : undefined;
    try {
      return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
    } catch (e) {
      return String(parseFloat(value.toFixed(digits)));
    }
  }

  /**
   * Helper to render premium file attachment details with image thumbnails and download triggers
   */
  renderFileDetailsHTML(file, isReadOnly, fieldId) {
    const esc = OpenFormRenderer.escapeHtml;
    // File name/content come from the end-user (or stored answers) and a reference's `url` from
    // the host: escape the name everywhere and only link/preview data:, http(s): and blob: URLs
    // — anything else gets no href/src, just the name and size.
    const sourceUrl = OpenFormRenderer.fileSourceUrl(file);
    const hasSafeContent = !!sourceUrl;
    const previewUrl = this._previewUrlFor(fieldId) || sourceUrl;
    const isImg = !!previewUrl && (String(file.type || '').startsWith('image/') || /^data:image\//i.test(previewUrl));
    const previewHtml = isImg ? `
      <div class="form-file-preview-thumbnail" style="margin-right: var(--of-space-m); width: 44px; height: 44px; border-radius: var(--of-border-radius-xs); overflow: hidden; border: 1px solid var(--of-color-neutral-4); flex-shrink: 0; background: var(--of-color-neutral-2);">
        <img src="${esc(previewUrl)}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    ` : '';

    return `
      <div class="form-file-details-left" style="display: flex; align-items: center; flex: 1; min-width: 0; overflow: hidden;">
        ${previewHtml}
        <div style="display: flex; flex-direction: column; flex: 1; min-width: 0; overflow: hidden; text-align: left;">
          <div style="font-weight: var(--of-font-weight-semibold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; color: var(--of-color-neutral-10);" title="${esc(file.name)}">${esc(file.name)}</div>
          <div style="font-size: var(--of-font-size-xs); color: var(--of-color-neutral-7);">${esc(this.formatFileSize(file.size))}</div>
        </div>
      </div>
      <div class="form-file-details-actions" style="display: flex; align-items: center; gap: var(--of-space-s); flex-shrink: 0; margin-left: var(--of-space-m);">
        ${hasSafeContent ? `
        <!-- Download Button -->
        <a href="${esc(sourceUrl)}" download="${esc(file.name)}" class="pg-btn pg-btn-secondary form-file-download-btn" title="${esc(this.translations.fileDownloadTitle)}" style="padding: 6px var(--of-space-s); display: flex; align-items: center; justify-content: center; height: auto;">
          ${OpenFormRenderer.icon('download', '', 'width: 14px; height: 14px;')}
        </a>
        ` : ''}
        ${isReadOnly ? '' : `
        <button type="button" class="form-file-delete-btn" title="${esc(this.translations.fileDeleteTitle)}" style="padding: 6px var(--of-space-s); display: flex; align-items: center; justify-content: center; height: auto; color: var(--of-color-error); border-color: rgba(219,60,60,0.15);">
          ${OpenFormRenderer.icon('trash-2', '', 'width: 14px; height: 14px;')}
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
   * Validates one page from the schema and this.answers (any page, rendered or not).
   * Returns true when it has no errors.
   *
   * @param {number} pageIndex
   * @param {Object} [options]
   * @param {boolean} [options.paint=true] Mark/unmark the rendered fields (is-invalid, aria-invalid,
   *   error text). Only fields currently in the DOM can be painted.
   * @param {boolean} [options.toast=true] Show the validation error toast when invalid.
   * @param {Array} [options.errors] Receives one `{ key, message, pageIndex, type }` per error
   *   (`type`: 'required' | 'pattern' | 'crossField'; repeater sub-fields add `itemIndex` and
   *   `subKey`, with `key` being the repeater's key).
   */
  validatePage(pageIndex, options = {}) {
    if (this._destroyed || !this.schema) return false;
    const paint = options.paint !== false;
    const toast = options.toast !== false;
    const errors = Array.isArray(options.errors) ? options.errors : [];
    let hasErrors = false;
    const page = this.schema.pages[pageIndex];
    if (!page) return false;
    // A page hidden by its rules is not part of the form: nothing on it is validated
    if (!this.isPageVisible(pageIndex)) return true;

    (page.sections || []).forEach(section => {
      (section.rows || []).forEach(row => {
        row.columns.forEach(col => {
          if (!col.field) return;
          const field = col.field;

          if (['header', 'paragraph'].includes(field.type) || !OpenFormRenderer.FIELD_TYPES.includes(field.type)) return;

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
                      let errorType = 'required';
                      // The sub-field's own conditional rules (resolved against this item):
                      // a hidden or disabled sub-field is never required or pattern-checked
                      const subState = this._withItemScope(field, item, () => this.evaluateFieldState(subField, null));
                      if (!subState.visible || subState.disabled) return;
                      const isRequired = subState.required;

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

                      if (subField.type === 'file' && this._isUploadPending(scopedId)) {
                        isFieldInvalid = true;
                        errorType = 'uploadPending';
                        errorMessage = this.translations.uploadInProgressError;
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
                            errorType = 'pattern';
                            errorMessage = this.getTranslatedValue('fields', subField.key, 'errorMessage', null, subField.errorMessage) || this.translations.patternValidationBubble;
                          }
                        } catch (e) {
                          console.error("Invalid configuration regex:", subField.validationRegex);
                        }
                      }

                      if (isFieldInvalid) {
                        hasErrors = true;
                        errors.push({ key: field.key, itemIndex, subKey: subField.key, message: errorMessage, pageIndex, type: errorType });
                      }

                      // Best-effort: only paint markings if this item happens to be rendered
                      const wrapper = paint ? this._byId('wrapper', scopedId) : null;
                      const errorEl = paint ? this._byId('error', scopedId) : null;
                      if (wrapper && errorEl) {
                        const inputEl = wrapper.querySelector('input, textarea, select');
                        if (isFieldInvalid) {
                          wrapper.classList.add('is-invalid');
                          if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
                          errorEl.innerHTML = `${OpenFormRenderer.icon('alert-circle')} ${OpenFormRenderer.escapeHtml(errorMessage)}`;
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
            let errorType = 'required';

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

            // An upload still in flight blocks validation/submit, whether or not the field is required
            if (field.type === 'file' && this._isUploadPending(field.id)) {
              isFieldInvalid = true;
              errorType = 'uploadPending';
              errorMessage = this.translations.uploadInProgressError;
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
                  errorType = 'pattern';
                  errorMessage = this.getTranslatedValue('fields', field.key, 'errorMessage', null, field.errorMessage) || this.translations.patternValidationBubble;
                }
              } catch (e) {
                console.error("Invalid configuration regex:", field.validationRegex);
              }
            }

            if (isFieldInvalid) {
              hasErrors = true;
              errors.push({ key: field.key, message: errorMessage, pageIndex, type: errorType });
            }

            // Best-effort: only paint markings if this field happens to be rendered
            // (validity above is already correctly computed either way)
            const wrapper = paint ? this._byId('wrapper', field.id) : null;
            const errorEl = paint ? this._byId('error', field.id) : null;
            if (wrapper && errorEl) {
              const inputEl = wrapper.querySelector('input, textarea, select');
              if (isFieldInvalid) {
                wrapper.classList.add('is-invalid');
                if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
                errorEl.innerHTML = `${OpenFormRenderer.icon('alert-circle')} ${OpenFormRenderer.escapeHtml(errorMessage)}`;
              } else {
                wrapper.classList.remove('is-invalid');
                if (inputEl) inputEl.removeAttribute('aria-invalid');
              }
            }
          } else {
            const wrapper = paint ? this._byId('wrapper', field.id) : null;
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
          const ruleMessage = this.getTranslatedValue('crossFieldRules', rule.ruleId, null, null, rule.errorMessage) || this.translations.crossFieldDefaultError;

          (rule.targetFields || []).forEach(targetFieldKey => {
            const targetField = pageFieldsMap.get(targetFieldKey);
            if (targetField) {
              errors.push({ key: targetFieldKey, message: ruleMessage, pageIndex, type: 'crossField' });
              const wrapper = paint ? this._byId('wrapper', targetField.id) : null;
              const errorEl = paint ? this._byId('error', targetField.id) : null;
              if (wrapper && errorEl) {
                wrapper.classList.add('is-invalid');
                const inputEl = wrapper.querySelector('input, textarea, select');
                if (inputEl) inputEl.setAttribute('aria-invalid', 'true');
                errorEl.innerHTML = `${OpenFormRenderer.icon('alert-circle')} ${OpenFormRenderer.escapeHtml(ruleMessage)}`;
              }
            }
          });
        }
      });
    }

    if (hasErrors && toast) {
      this.showToast(this.translations.validationToastError, true);
    }
    return !hasErrors;
  }

  /** Validates every page without touching the DOM; errors are ordered by page. */
  collectValidationErrors(paint = false) {
    const errors = [];
    if (this._destroyed || !this.schema) return errors;
    this.schema.pages.forEach((page, index) => {
      this.validatePage(index, { paint, toast: false, errors });
    });
    return errors;
  }

  /**
   * Validates the whole form (every page) without toasts or callbacks.
   *
   * @param {Object} [options]
   * @param {boolean} [options.showErrors=false] Also mark the invalid fields that are currently
   *   rendered (the active page). The page is not changed: use goToPage(errors[0].pageIndex)
   *   to show another page's errors.
   * @returns {{ valid: boolean, errors: Array<{ key: string, message: string, pageIndex: number, type: string }> }}
   */
  validate(options = {}) {
    if (this._destroyed || !this.schema) return { valid: false, errors: [] };
    const errors = this.collectValidationErrors(!!(options && options.showErrors));
    return { valid: errors.length === 0, errors };
  }

  /**
   * The answers that a submit would send right now: a deep copy holding only the fields that
   * are visible and enabled according to the rules (headers/paragraphs excluded), keyed by
   * field key. Never contains internal keys.
   */
  getAnswers() {
    const submittedAnswers = {};
    if (this._destroyed || !this.schema) return submittedAnswers;

    this.schema.pages.forEach((page, pageIndex) => {
      if (!this.isPageVisible(pageIndex)) return;
      (page.sections || []).forEach(section => {
        (section.rows || []).forEach(row => {
          (row.columns || []).forEach(col => {
            if (!col.field) return;
            const field = col.field;

            if (['header', 'paragraph'].includes(field.type) || !OpenFormRenderer.FIELD_TYPES.includes(field.type)) return;

            if (this.isFieldActiveInSchema(field, section)) {
              let value = OpenFormRenderer._deepClone(this.answers[field.key]);
              if (field.type === 'repeater' && Array.isArray(value)) value = this._activeRepeaterItems(field, value);
              submittedAnswers[field.key] = value;
            }
          });
        });
      });
    });
    return submittedAnswers;
  }

  /** Repeater items without the sub-fields their own rules hide or disable (same as top-level fields). */
  _activeRepeaterItems(field, items) {
    const ruled = [];
    (field.rows || []).forEach(row => (row.columns || []).forEach(col => {
      if (col && col.field && (col.field.conditionalRules || []).length > 0) ruled.push(col.field);
    }));
    if (ruled.length === 0) return items;
    return items.map(item => {
      const out = Object.assign({}, item);
      ruled.forEach(subField => {
        const state = this._withItemScope(field, item, () => this.evaluateFieldState(subField, null));
        if (!state.visible || state.disabled) delete out[subField.key];
      });
      return out;
    });
  }

  /** Finds a top-level field by key: `{ field, section, pageIndex }` or null. */
  findFieldByKey(key) {
    if (!this.schema) return null;
    for (let pageIndex = 0; pageIndex < this.schema.pages.length; pageIndex++) {
      for (const section of this.schema.pages[pageIndex].sections || []) {
        for (const row of section.rows || []) {
          for (const col of row.columns || []) {
            if (col && col.field && col.field.key === key) return { field: col.field, section, pageIndex };
          }
        }
      }
    }
    return null;
  }

  /**
   * Sets a top-level field's answer from code, as if the user had entered it: updates the
   * answers, the field's DOM (when its page is shown), formulas and rules, then fires
   * onFieldChange(answers, key). `number` values are stored as numbers (empty -> null); a
   * repeater takes an array of item objects; a file takes `{ name, size, type, content }` (or, with an uploadProvider, a FileReference).
   * A field hidden by a rule is cleared again by that rule, as a user edit would be.
   *
   * @returns {boolean} false when no field has that key (or it holds no answer).
   */
  setValue(key, value) {
    if (this._destroyed || !this.schema) return false;
    const located = this.findFieldByKey(key);
    if (!located || ['header', 'paragraph'].includes(located.field.type)) {
      console.warn(`OpenFormRenderer.setValue: no answerable field with key "${key}"`);
      return false;
    }
    const field = located.field;
    let next = OpenFormRenderer._deepClone(value);

    if (field.type === 'number') {
      next = OpenFormRenderer._toNumberAnswer(next);
    } else if (field.type === 'repeater') {
      next = (Array.isArray(next) ? next : []).map(item => (item && typeof item === 'object' && !Array.isArray(item) ? item : {}));
      this.clearRepeaterScopedKeys(field);
    } else if (field.type === 'file') {
      this._abortUploads(field.id, true);
      this._revokePreviewUrls(field.id, true);
      delete this.uploadedFiles[field.id];
    }
    this.answers[field.key] = next;
    if (field.type === 'repeater') this.normalizeAnswerTypes();

    if (located.pageIndex === this.activePageIndex) this.redrawField(field);
    this.handleFieldChanged(field.key);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Drafts and resume
  // ---------------------------------------------------------------------------

  /**
   * The in-progress record, ready to store and later pass to restoreDraft():
   * `{ version: 1, schemaVersion, formId?, answers, pageIndex, savedAt, complete: false }`.
   * `answers` holds every field (also those a rule currently hides or disables, like
   * onFieldChange) as a deep copy; uploads still in flight are never part of it. Base64 files
   * are included (large — prefer an `uploadProvider`, whose references are tiny).
   *
   * @returns {Object|null} null before render() or after destroy().
   */
  getDraft() {
    if (this._destroyed || !this.schema) return null;
    const draft = { version: 1, schemaVersion: this.schema.schemaVersion };
    if (typeof this.schema.formId === 'string' && this.schema.formId !== '') draft.formId = this.schema.formId;
    draft.answers = OpenFormRenderer._deepClone(this.answers);
    draft.pageIndex = this.activePageIndex;
    draft.savedAt = new Date().toISOString();
    draft.complete = false;
    return draft;
  }

  /**
   * Puts a draft (from getDraft(), or its JSON string) back into the form: restores the answers
   * and opens the saved page directly (clamped to the existing pages, without the forward
   * validation of goToPage()), then re-evaluates formulas and rules. It fires no onSubmit, no
   * onFieldChange / onPageChange and no onDraftChange. Keys the current schema no longer has
   * are dropped (one console warning); render() must have been called first.
   *
   * @returns {boolean} false when there is no schema or the draft is not usable.
   */
  restoreDraft(draft) {
    if (this._destroyed || !this.schema) return false;
    if (typeof draft === 'string') {
      try { draft = JSON.parse(draft); } catch (e) { draft = null; }
    }
    if (!draft || typeof draft !== 'object' || !draft.answers || typeof draft.answers !== 'object' || Array.isArray(draft.answers)) {
      console.warn('OpenFormRenderer.restoreDraft: not a draft object, ignored.');
      return false;
    }

    const dropped = [];
    const incoming = {};
    Object.keys(draft.answers).forEach(key => {
      const located = this.findFieldByKey(key);
      if (!located || ['header', 'paragraph'].includes(located.field.type) || !OpenFormRenderer.FIELD_TYPES.includes(located.field.type)) {
        dropped.push(key);
        return;
      }
      const value = draft.answers[key];
      const type = located.field.type;
      const fits = (type === 'repeater' && Array.isArray(value))
        || (type === 'matrix' && value && typeof value === 'object' && !Array.isArray(value))
        || (type === 'boolean' && typeof value === 'boolean')
        || !['repeater', 'matrix', 'boolean'].includes(type);
      if (fits && value !== undefined) incoming[key] = OpenFormRenderer._deepClone(value);
      else dropped.push(key);
    });
    if (dropped.length > 0 && !this._draftWarned) {
      this._draftWarned = true;
      console.warn(`OpenFormRenderer.restoreDraft: ignored ${dropped.length} answer(s) that do not match the current schema: ${dropped.join(', ')}`);
    }

    this.resetRecordState();
    this.answers = incoming;
    this.normalizeAnswerTypes();
    this._ensureAllAnswerDefaults();
    const last = this.schema.pages.length - 1;
    const wanted = Number.isInteger(draft.pageIndex) ? draft.pageIndex : 0;
    this.activePageIndex = Math.max(0, Math.min(wanted, last));
    this._cancelDraftTimer();
    this.recalculateFormulas();
    this.drawActivePage();
    return true;
  }

  /** Stops watching for changes and deletes the stored draft (no-op without `draftStorage`). Resolves when done. */
  clearDraft() {
    this._cancelDraftTimer();
    this._removeDraftBanner();
    return this._storageOp('remove');
  }

  static _resolveDraftStorage(option) {
    if (!option) return null;
    if (option === 'local' || option === 'session') {
      const name = option === 'local' ? 'localStorage' : 'sessionStorage';
      let store = null;
      try { store = window[name]; } catch (e) { store = null; }
      if (!store) {
        console.warn(`OpenFormRenderer: ${name} is not available, drafts will not be stored.`);
        return null;
      }
      return {
        get: (key) => store.getItem(key),
        set: (key, value) => store.setItem(key, value),
        remove: (key) => store.removeItem(key)
      };
    }
    if (typeof option === 'object' && ['get', 'set', 'remove'].every(m => typeof option[m] === 'function')) return option;
    console.warn("OpenFormRenderer: draftStorage must be 'local', 'session' or { get, set, remove }; drafts will not be stored.");
    return null;
  }

  /** Storage key of this form's draft. */
  _draftStorageKey() {
    if (this.draftKey) return this.draftKey;
    const id = (this.schema && (this.schema.formId || this.schema.formTitle)) || 'form';
    return `openforms-draft:${id}:v${this.schema ? this.schema.schemaVersion : 1}`;
  }

  /** Runs one adapter call; sync results and promises both end as a swallowed-and-logged outcome. */
  _storageCall(method, ...args) {
    const adapter = this._draftAdapter;
    if (!adapter) return null;
    try {
      return adapter[method](this._draftStorageKey(), ...args);
    } catch (err) {
      console.warn(`OpenFormRenderer: draftStorage.${method} failed:`, err);
      return null;
    }
  }

  /** Serialised write/remove so a slow async adapter never reorders them. */
  _storageOp(method, value) {
    if (!this._draftAdapter) return Promise.resolve();
    const run = () => Promise.resolve(method === 'set' ? this._storageCall('set', value) : this._storageCall('remove'))
      .catch(err => console.warn(`OpenFormRenderer: draftStorage.${method} failed:`, err));
    this._draftWrites = this._draftWrites.then(run);
    return this._draftWrites;
  }

  _cancelDraftTimer() {
    if (this._draftTimer === null) return;
    clearTimeout(this._draftTimer);
    this._timers.delete(this._draftTimer);
    this._draftTimer = null;
  }

  /** (Re)starts the debounce after a real change; nothing to do without a consumer. */
  _scheduleDraft() {
    if (this._destroyed || !this.schema || (!this.onDraftChange && !this._draftAdapter)) return;
    this._cancelDraftTimer();
    this._draftTimer = this._setTimeout(() => {
      this._draftTimer = null;
      this._emitDraft();
    }, this.draftDebounceMs);
  }

  /** Emits the pending draft now: onDraftChange(draft) and the storage write. */
  _flushDraft() {
    if (this._draftTimer === null) return;
    this._cancelDraftTimer();
    this._emitDraft();
  }

  _emitDraft() {
    const draft = this.getDraft();
    if (!draft) return;
    if (this._draftAdapter) {
      let json = null;
      try { json = JSON.stringify(draft); } catch (e) { /* unserialisable answers: skip storing */ }
      if (json !== null) this._storageOp('set', json);
    }
    if (this.onDraftChange) {
      try {
        this.onDraftChange(draft);
      } catch (err) {
        console.error('OpenFormRenderer: onDraftChange threw:', err);
      }
    }
  }

  /** A submit succeeded: nothing left to resume. */
  _draftSubmitted() {
    this._cancelDraftTimer();
    this._removeDraftBanner();
    this._storageOp('remove');
  }

  /** After render(): looks for a stored draft and restores it or asks, per `resumeDraft`. */
  _offerStoredDraft() {
    if (!this._draftAdapter || this.resumeDraft === 'never' || this.readOnly || !this.schema || this.schema.pages.length === 0) return;
    const seq = this._renderSeq;
    const key = this._draftStorageKey();
    const handle = (raw) => {
      if (this._destroyed || seq !== this._renderSeq || this._draftTimer !== null || key !== this._draftStorageKey()) return;
      let draft = raw;
      if (typeof raw === 'string') {
        try { draft = JSON.parse(raw); } catch (e) { draft = null; }
      }
      if (!draft || typeof draft !== 'object' || !draft.answers || typeof draft.answers !== 'object') return;
      if (this.resumeDraft === 'auto') this.restoreDraft(draft);
      else this._showDraftBanner(draft);
    };
    const result = this._storageCall('get');
    if (result && typeof result.then === 'function') {
      result.then(handle, err => console.warn('OpenFormRenderer: draftStorage.get failed:', err));
    } else {
      handle(result);
    }
  }

  /** Small accessible prompt above the form: "Resume your draft?" [Resume] [Start over]. */
  _showDraftBanner(draft) {
    this._removeDraftBanner();
    const sandbox = this.containerEl && this.containerEl.querySelector('.renderer-sandbox');
    if (!sandbox) return;
    const esc = OpenFormRenderer.escapeHtml;
    const promptId = this._domId('draft-prompt');
    let when = '';
    const date = new Date(draft.savedAt);
    if (draft.savedAt && !isNaN(date.getTime())) {
      try {
        when = this.translations.draftSavedAt.replace('{date}', date.toLocaleString(this.locale === 'default' ? undefined : this.locale, { dateStyle: 'short', timeStyle: 'short' }));
      } catch (e) { when = ''; }
    }
    const banner = document.createElement('div');
    banner.className = 'renderer-draft-banner';
    banner.setAttribute('role', 'group');
    banner.setAttribute('aria-labelledby', promptId);
    banner.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:var(--of-space-s);margin-bottom:var(--of-space-m);padding:var(--of-space-s) var(--of-space-m);border:1px solid var(--of-color-neutral-5);border-radius:var(--of-border-radius-m);';
    banner.innerHTML = `
      <span id="${esc(promptId)}" role="status" aria-live="polite" style="flex:1 1 auto"></span>
      <button type="button" class="pg-btn renderer-draft-resume">${esc(this.translations.draftResumeButton)}</button>
      <button type="button" class="pg-btn pg-btn-secondary renderer-draft-discard">${esc(this.translations.draftDiscardButton)}</button>
    `;
    banner.querySelector('.renderer-draft-resume').addEventListener('click', () => {
      this._removeDraftBanner();
      this.restoreDraft(draft);
    });
    banner.querySelector('.renderer-draft-discard').addEventListener('click', () => {
      this.clearDraft();
    });
    // Focus never moves (the form is often embedded in a bigger page): the live region is in
    // the DOM first and filled a moment later, which is what makes screen readers announce it;
    // the buttons stay at the top of the form in normal tab order.
    sandbox.insertBefore(banner, sandbox.firstChild);
    this._draftBannerEl = banner;
    const promptHtml = `<strong>${esc(this.translations.draftResumePrompt)}</strong>${when ? ` <small>${esc(when)}</small>` : ''}`;
    this._setTimeout(() => {
      const live = banner.querySelector('[role="status"]');
      if (live && banner.isConnected) live.innerHTML = promptHtml;
    }, 50);
  }

  _removeDraftBanner() {
    if (this._draftBannerEl) this._draftBannerEl.remove();
    this._draftBannerEl = null;
  }

  /** Re-creates one rendered top-level field's widget from this.answers (see setValue). */
  redrawField(field) {
    const oldWrapper = this._byId('wrapper', field.id);
    if (!oldWrapper) return;
    if (field.type === 'signature') this.teardownSignaturePad(field.id);
    const newWrapper = this.createWidgetWrapper(field);
    oldWrapper.replaceWith(newWrapper);
    this.bindFieldEvents(field);
  }

  /**
   * Shows page `index`. Going back is always allowed; going forward requires every page from
   * the current one up to the one before `index` to be valid — the same rule as the step tabs
   * and the Next button. When blocked, the current page stays, its invalid fields are marked,
   * the error toast is shown and onValidationError fires.
   *
   * @returns {boolean} true when the page is (now) shown.
   */
  goToPage(index) {
    if (this._destroyed || !this.schema) return false;
    if (!Number.isInteger(index) || index < 0 || index >= this.schema.pages.length) return false;
    // A page hidden by its rules is not part of the form right now
    if (!this.isPageVisible(index)) return false;
    return this.navigateToPage(index);
  }

  navigateToPage(index) {
    if (index === this.activePageIndex) return true;
    if (index > this.activePageIndex) {
      for (let i = this.activePageIndex; i < index; i++) {
        const errors = [];
        if (!this.validatePage(i, { errors })) {
          this.notifyValidationError(errors);
          return false;
        }
      }
    }
    this.showPage(index);
    return true;
  }

  /** Switches the active page without validation and fires onPageChange. */
  showPage(index) {
    this.activePageIndex = index;
    this.drawActivePage();
    this._scheduleDraft();
    if (this.onPageChange && !this._destroyed) {
      try {
        this.onPageChange(index, OpenFormRenderer._deepClone(this.schema.pages[index]));
      } catch (err) {
        console.error('OpenFormRenderer: onPageChange threw:', err);
      }
    }
  }

  notifyValidationError(errors) {
    if (this.onValidationError && !this._destroyed && errors.length > 0) {
      try {
        this.onValidationError(errors.map(err => Object.assign({}, err)));
      } catch (err) {
        console.error('OpenFormRenderer: onValidationError threw:', err);
      }
    }
  }

  /**
   * Submits the form exactly like the submit button: validates every page (on failure, shows
   * the first invalid page with its errors marked, the error toast, and fires
   * onValidationError), then calls onSubmit(getAnswers()). If onSubmit returns a promise the
   * submit button is disabled until it settles; the success toast is shown only once it
   * resolves, and a rejection shows the `submitErrorToast` error and leaves the form editable.
   * Calls made while a submit is pending return that same pending promise.
   *
   * @returns {Promise<{ submitted: boolean, answers?: Object, errors: Array, error?: any }>}
   */
  submit() {
    if (this._destroyed || !this.schema || this.readOnly) {
      return Promise.resolve({ submitted: false, errors: [] });
    }
    if (this._submitPromise) return this._submitPromise;

    const errors = this.collectValidationErrors(false);
    if (errors.length > 0) {
      // Focus the first invalid page to aid corrections, only redrawing if switching pages
      const firstInvalidPage = errors[0].pageIndex;
      if (this.activePageIndex !== firstInvalidPage) this.showPage(firstInvalidPage);
      this.validatePage(firstInvalidPage); // mark the errors + toast
      this.notifyValidationError(errors);
      return Promise.resolve({ submitted: false, errors });
    }

    const answers = this.getAnswers();
    let result;
    let threw = false;
    try {
      result = typeof this.onSubmit === 'function' ? this.onSubmit(answers) : undefined;
    } catch (err) {
      threw = true;
      result = err;
    }

    if (!threw && !(result && typeof result.then === 'function')) {
      this._draftSubmitted();
      this.showToast(this.translations.validationToastSuccess, false);
      return Promise.resolve({ submitted: true, answers, errors: [] });
    }

    this.setSubmitting(true);
    const pending = (threw ? Promise.reject(result) : Promise.resolve(result)).then(
      () => {
        this.setSubmitting(false);
        this._draftSubmitted();
        this.showToast(this.translations.validationToastSuccess, false);
        return { submitted: true, answers, errors: [] };
      },
      (err) => {
        this.setSubmitting(false);
        console.warn('OpenFormRenderer: onSubmit failed:', err);
        this.showToast(this.translations.submitErrorToast, true);
        return { submitted: false, errors: [], error: err };
      }
    );
    this._submitPromise = pending;
    return pending;
  }

  /** Kept for compatibility: same as submit(). */
  validateAndSubmit() {
    return this.submit();
  }

  /** Disables the submit button (and marks the form busy) while onSubmit is pending. */
  setSubmitting(isSubmitting) {
    if (!isSubmitting) this._submitPromise = null;
    if (this._destroyed || !this.formEl) return;
    this.applySubmittingState(isSubmitting);
  }

  applySubmittingState(isSubmitting) {
    this.formEl.querySelectorAll('button[type="submit"]').forEach(btn => {
      btn.disabled = !!isSubmitting;
      if (isSubmitting) btn.setAttribute('aria-disabled', 'true');
      else btn.removeAttribute('aria-disabled');
    });
    if (isSubmitting) this.formEl.setAttribute('aria-busy', 'true');
    else this.formEl.removeAttribute('aria-busy');
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
      toast.insertAdjacentHTML('afterbegin', OpenFormRenderer.icon(isError ? 'x-circle' : 'check-circle'));
      const text = document.createElement('span');
      text.textContent = message === null || message === undefined ? '' : String(message);
      toast.appendChild(text);
      container.appendChild(toast);
      this._toasts.add(toast);


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
        title.textContent = this.translations.repeaterItemTitle.replace('{n}', String(itemIndex + 1));
        header.appendChild(title);

        // Delete button if not read-only and above minItems
        if (!this.readOnly && items.length > (field.minItems || 0)) {
          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'form-repeater-card-delete';
          delBtn.title = `${this.translations.repeaterDeleteItemTitle} ${itemIndex + 1}`;
          delBtn.innerHTML = `${OpenFormRenderer.icon('trash-2', '', 'width: 12px; height: 12px;')}`;
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._notifyRepeaterFiles(field, item, itemIndex, 'itemRemoved');
            items.splice(itemIndex, 1);
            this.clearRepeaterScopedKeys(field);
            this.notifyFieldChange(field.key);
            updateUI();
            checkAddButtonState();
          });
          header.appendChild(delBtn);
        }
        card.appendChild(header);

        // Card Fields Grid
        const grid = document.createElement('div');
        grid.className = 'form-repeater-grid';
        grid.style.cssText = "display: flex; flex-direction: column; gap: var(--of-space-m);";

        if (field.rows) {
          field.rows.forEach(row => {
            if (!row.columns || row.columns.length === 0) return;

            const rowEl = document.createElement('div');
            rowEl.className = 'renderer-row';
            rowEl.style.cssText = "display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--of-space-m); margin-bottom: var(--of-space-s);";

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
                } else if (subField.type === 'number') {
                  item[subField.key] = null;
                } else {
                  item[subField.key] = '';
                }
              }

              // 2. Define an internal getter/setter on this.answers so the shared widget,
              // validation and rule code can address the sub-field by a flat key. It's
              // non-enumerable: it never shows up in getAnswers(), callbacks or JSON.
              const scopedKey = `sub-${field.id}-${itemIndex}-${subField.key}`;
              Object.defineProperty(this.answers, scopedKey, {
                get: () => {
                  return item[subField.key];
                },
                set: (val) => {
                  item[subField.key] = val;
                },
                configurable: true,
                enumerable: false
              });
              this._scopedKeyOwners.set(scopedKey, field.key);

              // 3. Create scoped field clone
              const scopedField = JSON.parse(JSON.stringify(subField));
              scopedField.id = `${field.id}-${itemIndex}-${subField.id}`;
              scopedField.key = scopedKey;
              scopedField._repeater = { key: field.key, itemIndex, subKey: subField.key, subId: subField.id };

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
                    val = this._readMaskedInput(subField, e.target);
                  }

                  if (subField.type === 'number') {
                    val = OpenFormRenderer._toNumberAnswer(val);
                  }

                  this.answers[scopedKey] = val;
                  this.handleFieldChanged(scopedKey);

                  const wrapper = widgetWrapper.querySelector('.form-widget-wrapper') || widgetWrapper;
                  if (wrapper && val !== null && String(val).trim() !== '') {
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

            // Like top level: a row with nothing rendered in it leaves no gap behind
            if (rowEl.children.length > 0) grid.appendChild(rowEl);
          });
        }

        card.appendChild(grid);
        listEl.appendChild(card);
      });

      // Newly drawn items get their sub-field rules applied (the first render is covered by
      // evalBusinessRules once the page is in the DOM)
      if (this.formEl && this.formEl.contains(listEl)) this._applyRepeaterItemRules(field);
    };

    // Render "Add Item" button first if not read-only, so DOM order matches the visual
    // order (CSS displays it above the item list) — keeps keyboard tab order consistent
    // with what's on screen.
    if (!this.readOnly) {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'pg-btn pg-btn-secondary form-repeater-add-btn';
      const displayAddBtnLabel = this.getTranslatedValue('fields', field.key, 'addButtonLabel', null, field.addButtonLabel || this.translations.repeaterAddButtonLabel);
      addBtn.innerHTML = `${OpenFormRenderer.icon('plus-circle', '', 'width: 14px; height: 14px;')} ${OpenFormRenderer.escapeHtml(displayAddBtnLabel)}`;

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
          this.notifyFieldChange(field.key);
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

  /** Calls onFieldChange(answers, changedKey) with a deep copy of the answers. */
  notifyFieldChange(changedKey) {
    this._scheduleDraft();
    if (this._destroyed || typeof this.onFieldChange !== 'function') return;
    const publicKey = this._scopedKeyOwners.get(changedKey) || changedKey;
    // A host callback that throws must not break the form (rules, formulas and drafts run after this).
    try {
      this.onFieldChange(OpenFormRenderer._deepClone(this.answers), publicKey);
    } catch (err) {
      console.error('OpenFormRenderer: onFieldChange threw:', err);
    }
  }

  /**
   * Applies a custom formatting mask pattern to user input strings.
   * Wildcards: '9' (digit), 'a' (letter, any Unicode letter), '*' (letter or digit).
   * Literals: Any other character.
   */
  applyMask(value, maskPattern) {
    if (!value) return '';
    if (!maskPattern) return value;
    return OpenFormRenderer._walkMask(value, maskPattern, true);
  }

  /**
   * Extracts only the characters that matched mask wildcards (stripping literals)
   */
  getCleanValue(value, maskPattern) {
    if (!value) return '';
    if (!maskPattern) return value;
    return OpenFormRenderer._walkMask(value, maskPattern, false);
  }

  /** Shared walker for applyMask (keepLiterals) and getCleanValue (wildcard matches only). */
  static _walkMask(value, maskPattern, keepLiterals) {
    // Code points (not UTF-16 units) and NFC, so "é" typed as e + combining accent is one letter
    const chars = Array.from(String(value).normalize('NFC'));
    const mask = Array.from(maskPattern);
    const matchers = {
      '9': (c) => /\d/.test(c),
      'a': (c) => /\p{L}/u.test(c),
      '*': (c) => /[\p{L}\d]/u.test(c)
    };

    let out = '';
    let maskIndex = 0;
    let valIndex = 0;
    while (maskIndex < mask.length && valIndex < chars.length) {
      const maskChar = mask[maskIndex];
      const valChar = chars[valIndex];
      if (matchers[maskChar]) {
        if (matchers[maskChar](valChar)) {
          out += valChar;
          maskIndex++;
        }
        valIndex++;
      } else {
        // Literal character (like '.', '-', '(', etc.)
        if (keepLiterals) out += maskChar;
        maskIndex++;
        if (valChar === maskChar) valIndex++;
      }
    }
    return out;
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
      const result = this._evaluateExpression(sanitized);
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
      // CSP-safe: parsed and evaluated by _evaluateExpression, never eval/new Function.
      const result = this._evaluateExpression(sanitized);
      return !!result;
    } catch (e) {
      console.error("Error evaluating validation rule:", expression, sanitized, e);
      return false;
    }
  }

  /**
   * CSP-safe evaluator for `formulaExpression` and legacy `crossFieldRules[].expression`.
   *
   * Replaces the former `new Function('return (' + expr + ');')`, which throws under a
   * Content-Security-Policy without 'unsafe-eval' (calculated fields silently became 0 and
   * expression rules blocked submit forever). It is a hand-written tokenizer + recursive-descent
   * parser for exactly the JavaScript expression subset that can be spelled with the
   * allow-listed characters checked by the callers (digits, `. , + - * / % ( ) ? : < > = ! & |`,
   * whitespace) plus `Math.min|max|round|abs|floor|ceil`. Operators are applied with the native
   * JS operators to the same values, so results match the old evaluator for every expression it
   * accepted, with these deliberate exceptions (all of which are now syntax errors): arrow
   * functions (`()=>1`), regex literals (`/1/`), spread (`...`), HTML-like comments
   * (`<!--`, `-->`) and assignments (`Math.max = 5` used to overwrite the global). No eval,
   * Function, `with`, or property access other than the whitelisted `Math.*` functions is
   * ever performed.
   *
   * @param {string} source Expression with `{field}` placeholders already substituted.
   * @returns {*} The raw JS value (number, boolean, or — for odd inputs — a Math function or
   *   a string produced by native coercion); the callers normalise it.
   * @throws {SyntaxError|TypeError} On invalid syntax or a call to a non-function.
   */
  _evaluateExpression(source) {
    const MATH_FNS = {
      min: Math.min, max: Math.max, round: Math.round,
      abs: Math.abs, floor: Math.floor, ceil: Math.ceil
    };
    const fail = (msg) => { throw new SyntaxError(`Invalid expression: ${msg}`); };

    // ---- Tokenizer -------------------------------------------------------------------
    // Wrapped in parentheses exactly like the old `return (${expr});`, so an input such as
    // "1) || (2" keeps the meaning it had before.
    const src = `(${source})`;
    // Longest first (maximal munch). Assignment/update/arrow/spread tokens are recognised only
    // so the parser can reject them, mirroring the SyntaxError JS would raise.
    const PUNCT = [
      '>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=',
      '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '**', '<<', '>>', '++', '--',
      '+=', '-=', '*=', '/=', '%=', '&=', '|=',
      '+', '-', '*', '/', '%', '(', ')', ',', '?', ':', '<', '>', '=', '!', '&', '|', '.'
    ];
    const isDigit = (c) => c >= '0' && c <= '9';
    const isIdStart = (c) => /[A-Za-z_$\\]/.test(c);
    const isIdPart = (c) => /[A-Za-z0-9_$]/.test(c);
    const tokens = [];
    let i = 0;

    while (i < src.length) {
      const c = src[i];
      const next = src[i + 1] || '';
      if (/\s/.test(c)) { i++; continue; }
      if (c === '/' && next === '*') {
        const end = src.indexOf('*/', i + 2);
        if (end < 0) fail('unterminated comment');
        i = end + 2;
        continue;
      }
      if (c === '/' && next === '/') {
        while (i < src.length && !/[\n\r\u2028\u2029]/.test(src[i])) i++;
        continue;
      }
      if (isDigit(c) || (c === '.' && isDigit(next))) {
        const start = i;
        let value;
        if (c === '0' && isDigit(next)) {
          // Legacy (sloppy-mode) leading-zero literal: octal if all digits are 0-7 (no
          // fraction allowed), otherwise decimal ("019.5" === 19.5).
          while (isDigit(src[i] || '')) i++;
          const digits = src.slice(start, i);
          if (/^[0-7]+$/.test(digits)) {
            value = parseInt(digits, 8);
          } else {
            if (src[i] === '.') { i++; while (isDigit(src[i] || '')) i++; }
            value = Number(src.slice(start, i));
          }
        } else {
          while (isDigit(src[i] || '')) i++;
          if (src[i] === '.') { i++; while (isDigit(src[i] || '')) i++; }
          value = Number(src.slice(start, i));
        }
        if (i < src.length && (isDigit(src[i]) || isIdStart(src[i]))) fail('identifier directly after number');
        tokens.push({ t: 'num', v: value });
        continue;
      }
      if (isIdStart(c)) {
        if (c === '\\') fail('escape sequence');
        const start = i;
        while (i < src.length && isIdPart(src[i])) i++;
        if (src[i] === '\\') fail('escape sequence');
        tokens.push({ t: 'id', v: src.slice(start, i) });
        continue;
      }
      // `?.` is optional chaining only when not followed by a digit (`a?.5:b` is a ternary).
      if (c === '?' && next === '.' && !isDigit(src[i + 2] || '')) {
        tokens.push({ t: 'op', v: '?.' });
        i += 2;
        continue;
      }
      const op = PUNCT.find(candidate => src.startsWith(candidate, i));
      if (!op) fail(`unexpected character "${c}"`);
      tokens.push({ t: 'op', v: op });
      i += op.length;
    }

    // ---- Parser (JS precedence, lowest first) ---------------------------------------
    let p = 0;
    const isOp = (v, k = 0) => { const tk = tokens[p + k]; return !!tk && tk.t === 'op' && tk.v === v; };
    const take = (v) => { if (!isOp(v)) fail(`expected "${v}"`); p++; };
    const isUnary = () => isOp('-') || isOp('+') || isOp('!');
    const BINARY_LEVELS = [
      ['||'], ['&&'], ['|'], ['&'],
      ['==', '!=', '===', '!=='],
      ['<', '>', '<=', '>='],
      ['<<', '>>', '>>>'],
      ['+', '-'],
      ['*', '/', '%']
    ];
    const BITWISE_OR_LEVEL = 2;

    const parseExpression = () => {
      let node = parseConditional();
      while (isOp(',')) { p++; node = { k: 'seq', a: node, b: parseConditional() }; }
      return node;
    };
    const parseConditional = () => {
      const test = parseShortCircuit();
      if (!isOp('?')) return test;
      p++;
      const yes = parseConditional();
      take(':');
      return { k: 'cond', test, yes, no: parseConditional() };
    };
    const parseShortCircuit = () => {
      let node = parseBinary(0);
      if (isOp('??')) {
        // JS forbids mixing ?? with unparenthesised && / ||.
        if (node.k === 'logic' && !node.paren) fail('cannot mix ?? with && or ||');
        while (isOp('??')) { p++; node = { k: 'coalesce', a: node, b: parseBinary(BITWISE_OR_LEVEL) }; }
      }
      return node;
    };
    const parseBinary = (level) => {
      if (level === BINARY_LEVELS.length) return parseExponent();
      let node = parseBinary(level + 1);
      for (;;) {
        const tk = tokens[p];
        if (!tk || tk.t !== 'op' || !BINARY_LEVELS[level].includes(tk.v)) return node;
        p++;
        const kind = (tk.v === '&&' || tk.v === '||') ? 'logic' : 'bin';
        node = { k: kind, op: tk.v, a: node, b: parseBinary(level + 1) };
      }
    };
    const parseExponent = () => {
      if (isUnary()) {
        const node = parseUnary();
        if (isOp('**')) fail('unary operator before **');
        return node;
      }
      const base = parsePostfix();
      if (!isOp('**')) return base;
      p++;
      return { k: 'bin', op: '**', a: base, b: parseExponent() };
    };
    const parseUnary = () => {
      const op = tokens[p++].v;
      return { k: 'unary', op, a: isUnary() ? parseUnary() : parsePostfix() };
    };
    const parsePostfix = () => {
      let node = parsePrimary();
      let optionalChain = false;
      for (;;) {
        let optional = false;
        if (isOp('?.')) { p++; optional = optionalChain = true; }
        else if (isOp('.')) {
          p++;
          if (!tokens[p] || tokens[p].t !== 'id') fail('expected a name after "."');
        }
        const tk = tokens[p];
        if (tk && tk.t === 'id') {
          // `.name` / `?.name` on a computed value. Reachable through the allow-list only as
          // e.g. `(1).Math.max(2)` or `Math.roundMath.round4`; never reads a real property.
          p++;
          node = { k: 'member', obj: node, optional };
          continue;
        }
        if (isOp('(')) { p++; }
        else if (optional) fail('unexpected token after "?."');
        // An optional link on a nullish value short-circuits the rest of the chain.
        else return optionalChain ? { k: 'chain', a: node } : node;
        const args = [];
        while (!isOp(')')) {
          if (isOp('...')) fail('spread is not supported');
          args.push(parseConditional());
          if (!isOp(',')) break;
          p++;
        }
        take(')');
        node = { k: 'call', callee: node, args, optional };
      }
    };
    const parsePrimary = () => {
      const tk = tokens[p];
      if (!tk) fail('unexpected end of expression');
      if (tk.t === 'num') { p++; return { k: 'val', v: tk.v }; }
      if (tk.t === 'op' && tk.v === '(') {
        p++;
        if (isOp(')')) fail('empty parentheses');
        const inner = parseExpression();
        take(')');
        return { ...inner, paren: true };
      }
      const member = tokens[p + 2];
      if (tk.t === 'id' && tk.v === 'Math' && isOp('.', 1) && member && member.t === 'id') {
        p += 3;
        // Only the whitelisted functions are ever looked up; any other name (reachable through
        // the allow-list only as e.g. `Math.max2`, which is not a real Math property) is
        // `undefined`, as it was under the old evaluator. No real property access happens.
        const fn = Object.prototype.hasOwnProperty.call(MATH_FNS, member.v) ? MATH_FNS[member.v] : undefined;
        return { k: 'val', v: fn };
      }
      fail(`unexpected token "${tk.v}"`);
    };

    const ast = parseExpression();
    if (p !== tokens.length) fail(`unexpected token "${tokens[p].v}"`);

    // ---- Evaluator (native JS operators, lazy where JS short-circuits) ----------------
    const allowedFns = Object.values(MATH_FNS);
    const SHORT_CIRCUIT = {};
    const BINARY = {
      '|': (a, b) => a | b, '&': (a, b) => a & b,
      '==': (a, b) => a == b, '!=': (a, b) => a != b, // eslint-disable-line eqeqeq
      '===': (a, b) => a === b, '!==': (a, b) => a !== b,
      '<': (a, b) => a < b, '>': (a, b) => a > b, '<=': (a, b) => a <= b, '>=': (a, b) => a >= b,
      '<<': (a, b) => a << b, '>>': (a, b) => a >> b, '>>>': (a, b) => a >>> b,
      '+': (a, b) => a + b, '-': (a, b) => a - b,
      '*': (a, b) => a * b, '/': (a, b) => a / b, '%': (a, b) => a % b, '**': (a, b) => a ** b
    };
    const evaluate = (n) => {
      switch (n.k) {
        case 'val': return n.v;
        case 'seq': evaluate(n.a); return evaluate(n.b);
        case 'cond': return evaluate(n.test) ? evaluate(n.yes) : evaluate(n.no);
        case 'logic': {
          const a = evaluate(n.a);
          if (n.op === '&&') return a ? evaluate(n.b) : a;
          return a ? a : evaluate(n.b);
        }
        case 'coalesce': {
          const a = evaluate(n.a);
          return (a !== null && a !== undefined) ? a : evaluate(n.b);
        }
        case 'unary': {
          const a = evaluate(n.a);
          if (n.op === '-') return -a;
          if (n.op === '+') return +a;
          return !a;
        }
        case 'chain': {
          const v = evaluate(n.a);
          return v === SHORT_CIRCUIT ? undefined : v;
        }
        case 'member': {
          const obj = evaluate(n.obj);
          if (obj === SHORT_CIRCUIT) return SHORT_CIRCUIT;
          if (obj === null || obj === undefined) {
            if (n.optional) return SHORT_CIRCUIT;
            throw new TypeError('Invalid expression: cannot read a property of undefined');
          }
          // The only names the allow-list lets through (`Math`, `maxMath`, ...) do not exist
          // on numbers, booleans, strings or the Math functions, so the result is undefined.
          return undefined;
        }
        case 'call': {
          const fn = evaluate(n.callee);
          if (fn === SHORT_CIRCUIT) return SHORT_CIRCUIT;
          if (n.optional && (fn === null || fn === undefined)) return SHORT_CIRCUIT;
          if (!allowedFns.includes(fn)) throw new TypeError('Invalid expression: value is not a function');
          return fn.apply(Math, n.args.map(evaluate));
        }
        default: return BINARY[n.op](evaluate(n.a), evaluate(n.b));
      }
    };
    return evaluate(ast);
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
                  const inputEl = this._byId('input', field.id);
                  if (inputEl) {
                    inputEl.value = this._formatNumber(newVal);
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
    const uploader = this._byId('uploader', field.id);
    const details = this._byId('filedetails', field.id);
    const hiddenInput = this._byId('input', field.id);

    if (this.uploadProvider) {
      // Hand the capture to the host as a Blob/File; only the returned reference is kept
      let blob;
      try {
        blob = OpenFormRenderer._dataUrlToBlob(dataUrl);
      } catch (err) {
        console.warn('OpenFormRenderer: could not read the captured photo:', err);
        return;
      }
      const name = `camera_photo_${Date.now()}.jpg`;
      const type = blob.type || 'image/jpeg';
      let file = blob;
      if (typeof File === 'function') {
        file = new File([blob], name, { type });
      } else {
        try { Object.defineProperty(blob, 'name', { value: name }); } catch (e) { /* name stays unset */ }
      }
      this._startUpload(field, file);
      return;
    }

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
      details.innerHTML = this.renderFileDetailsHTML(fileObj, false, field.id);

      this.bindFileEvents(details, fileObj, field, hiddenInput, uploader, false);
    }

    const wrapper = this._byId('wrapper', field.id);
    if (wrapper) wrapper.classList.remove('is-invalid');

    this.handleFieldChanged(field.key);
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
      backgroundColor: 'var(--of-color-neutral-2, #ffffff)',
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
      padding: 'var(--of-space-base) var(--of-space-base) var(--of-space-l) var(--of-space-base)',
      boxSizing: 'border-box',
      transform: 'translateY(100%)',
      transition: 'transform 0.25s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--of-space-m)',
      boxShadow: '0 -4px var(--of-space-m) rgba(0, 0, 0, 0.15)'
    });

    const title = document.createElement('div');
    title.textContent = this.translations.actionSheetTitle;
    Object.assign(title.style, {
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--of-color-neutral-8, #333333)',
      textAlign: 'center',
      marginBottom: '8px'
    });
    sheet.appendChild(title);

    const cameraBtn = document.createElement('button');
    cameraBtn.type = 'button';
    cameraBtn.className = 'pg-btn';
    cameraBtn.innerHTML = `${OpenFormRenderer.icon('camera', '', 'width: 16px; height: 16px; margin-right: var(--of-space-s); vertical-align: middle;')} ${OpenFormRenderer.escapeHtml(this.translations.actionSheetTakePhoto)}`;
    Object.assign(cameraBtn.style, {
      padding: 'var(--of-space-m)',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      borderRadius: 'var(--of-space-s)',
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
    fileBtn.innerHTML = `${OpenFormRenderer.icon('file-text', '', 'width: 16px; height: 16px; margin-right: var(--of-space-s); vertical-align: middle;')} ${OpenFormRenderer.escapeHtml(this.translations.actionSheetChooseFile)}`;
    Object.assign(fileBtn.style, {
      padding: 'var(--of-space-m)',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      borderRadius: 'var(--of-space-s)',
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
    cancelBtn.textContent = this.translations.actionSheetCancel;
    Object.assign(cancelBtn.style, {
      padding: 'var(--of-space-m)',
      fontSize: '14px',
      width: '100%',
      borderRadius: 'var(--of-space-s)',
      border: 'none',
      background: 'transparent',
      color: 'var(--of-color-neutral-7, #666666)',
      cursor: 'pointer'
    });
    cancelBtn.addEventListener('click', closeSheet);
    sheet.appendChild(cancelBtn);

    backdrop.appendChild(sheet);
    document.body.appendChild(backdrop);
    this._actionSheetEl = backdrop;


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

// UMD footer: CommonJS/bundlers get `module.exports`; a plain <script> attaches to the global.
// Nothing here touches `window`/`document` unguarded, so importing in Node/SSR is safe.
if (typeof module === 'object' && module && module.exports) {
  module.exports = OpenFormRenderer;
} else {
  const root = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
  const existing = root.OpenFormRenderer;
  if (existing && existing !== OpenFormRenderer) {
    // Double-load guard (e.g. an OutSystems block and a screen both requiring this script):
    // keep the first definition so live instances and `instanceof` checks stay valid.
    if (existing.VERSION !== OpenFormRenderer.VERSION && typeof console !== 'undefined') {
      console.warn('OpenFormRenderer: v' + OpenFormRenderer.VERSION + ' was loaded after v' + existing.VERSION + '; keeping the first (v' + existing.VERSION + ').');
    }
  } else {
    root.OpenFormRenderer = OpenFormRenderer;
  }
}

}).call(this);
