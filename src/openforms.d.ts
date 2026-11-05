/**
 * Type declarations for OpenForms (OpenFormBuilder / OpenFormRenderer).
 *
 * Load with a plain <script> tag (the classes become globals) or `require()` / `import` them
 * from a bundler. Reference this file from TypeScript with, for example:
 *
 *   /// <reference types="./openforms" />          (local copy next to your sources)
 *   /// <reference path="https://cdn.jsdelivr.net/gh/henriquefps/open-forms@1.5.2/src/openforms.d.ts" />
 *
 * Hand-written to match src/builder.js and src/renderer.js; SCHEMA_REFERENCE.md is the
 * prose reference for the schema.
 */

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export type FieldType =
  | 'header' | 'paragraph' | 'text' | 'textarea' | 'number' | 'date' | 'boolean'
  | 'dropdown' | 'radio' | 'checkbox' | 'signature' | 'file' | 'repeater' | 'matrix';

export type ConditionOperator =
  | 'equals' | 'notEquals' | 'contains' | 'notContains'
  | 'greaterThan' | 'greaterThanOrEquals' | 'gte'
  | 'lessThan' | 'lessThanOrEquals' | 'lte';

export interface Condition {
  /** The field whose current answer is checked. */
  dependentFieldKey: string;
  operator: ConditionOperator;
  /** `"value"` (default) compares against `equalsValue`; `"field"` against `compareToFieldKey`. */
  compareMode?: 'value' | 'field';
  equalsValue?: unknown;
  compareToFieldKey?: string;
}

/** Satisfied when ANY of its conditions is satisfied (OR). */
export interface AndGroup {
  conditions: Condition[];
}

/** Satisfied when EVERY group is satisfied (AND between groups). */
export interface ConditionalRule {
  /** Sections only use `"visibility"`. */
  targetProperty: 'visibility' | 'required' | 'disabled';
  andGroups: AndGroup[];
}

export interface CrossFieldRule {
  ruleId: string;
  /** Keys of the fields marked invalid when the rule fires. */
  targetFields: string[];
  /** The rule blocks submission when every group is satisfied. An empty array is inert. */
  andGroups?: AndGroup[];
  /** Legacy free-text rule such as `"{endDate} >= {startDate}"`. */
  expression?: string;
  errorMessage?: string;
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface MatrixRow {
  key: string;
  label: string;
}

export interface Field {
  id?: string;
  /** Answer key. Absent on `header` / `paragraph`. */
  key?: string;
  type: FieldType;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  conditionalRules?: ConditionalRule[];
  placeholder?: string;
  /** header: optional subtitle. */
  subtitle?: string;
  /** text/number: `9` = digit, `a` = letter, `*` = alphanumeric. */
  mask?: string;
  maskCleanValue?: boolean;
  validationRegex?: string;
  errorMessage?: string;
  /** boolean */
  defaultValue?: boolean;
  /** number */
  isCalculated?: boolean;
  formulaExpression?: string;
  isVisibleOnForm?: boolean;
  /** dropdown / radio / checkbox / matrix */
  optionsType?: 'static' | 'api';
  options?: FieldOption[];
  /** Identifier handed to `optionsProvider` when `optionsType` is `"api"`. */
  optionsUrl?: string;
  /** matrix */
  matrixRows?: MatrixRow[];
  /** repeater */
  minItems?: number;
  maxItems?: number;
  addButtonLabel?: string;
  rows?: Row[];
  /** file */
  acceptedTypes?: string;
  useNativeCamera?: boolean;
  nativeCameraSource?: 'camera' | 'photos' | 'prompt';
  maxFileSizeMB?: number;
  fileRequirementsText?: string;
}

export interface Column {
  /** Grid span out of 12 (integer 1-12). */
  width: number;
  field?: Field;
}

export interface Row {
  rowId?: string;
  columns: Column[];
}

export interface Section {
  sectionId?: string;
  title?: string;
  conditionalRules?: ConditionalRule[];
  rows: Row[];
}

export interface Page {
  pageId?: string;
  title?: string;
  /**
   * Page branching: only `targetProperty: 'visibility'` rules apply to a page. A hidden page is
   * skipped by Next/Previous, has no step tab, is not validated and adds nothing to `getAnswers()`.
   * Rules should depend on fields of earlier pages.
   */
  conditionalRules?: ConditionalRule[];
  sections: Section[];
}

/** Per-locale display text. Structural properties (keys, types, operators) are not translatable. */
export interface LocaleTranslations {
  form?: { formTitle?: string; formDescription?: string };
  pages?: Record<string, { title?: string }>;
  sections?: Record<string, { title?: string }>;
  fields?: Record<string, {
    label?: string;
    placeholder?: string;
    subtitle?: string;
    errorMessage?: string;
    options?: Record<string, string>;
    [property: string]: unknown;
  }>;
  crossFieldRules?: Record<string, { errorMessage?: string }>;
}

export interface FormSchema {
  /** Format version (currently 2). Written by the builder; absent means version 1. */
  schemaVersion?: number;
  /** Optional stable identifier of the form, set by the host. Used only for the default draft storage key and stored in drafts. */
  formId?: string;
  formTitle?: string;
  formDescription?: string;
  pages?: Page[];
  crossFieldRules?: CrossFieldRule[];
  translations?: Record<string, LocaleTranslations>;
}

/** Submitted values, keyed by field `key`. */
export type FormAnswers = Record<string, any>;

export interface FileAnswer {
  name: string;
  size: number;
  type: string;
  /** base64 data URL */
  content: string;
}

/**
 * What a file field holds when the renderer has an `uploadProvider`: the reference the host
 * returned, never the file's content. Extra host-defined keys are kept as they are.
 */
export interface FileReference {
  name: string;
  size: number;
  type: string;
  /** Where the file can be previewed/downloaded. Only `https:`, `http:`, `blob:` and `data:` URLs are used. */
  url?: string;
  /** Host-side identifier (record id, storage key, local queue id, ...). */
  id?: string | number;
  [extra: string]: unknown;
}

// ---------------------------------------------------------------------------
// Validation results
// ---------------------------------------------------------------------------

export interface SchemaIssue {
  path: string;
  code: string;
  message: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: SchemaIssue[];
  warnings: SchemaIssue[];
}

export interface ValidationError {
  key: string;
  message: string;
  pageIndex: number;
  /** `"required"`, `"pattern"`, `"crossField"` or `"uploadPending"` (a file is still uploading). */
  type: string;
  /** Set for errors inside a repeater item. */
  itemIndex?: number;
  subKey?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface SubmitResult {
  submitted: boolean;
  answers?: FormAnswers;
  errors: ValidationError[];
  /** Set when `onSubmit` threw or its promise rejected. */
  error?: unknown;
}

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------

export interface OptionsProviderContext {
  locale: string;
  readOnly: boolean;
}

export type OptionsProvider = (
  field: Field,
  context: OptionsProviderContext
) => Promise<FieldOption[]> | FieldOption[];

/**
 * Why a reference left the form: `removed` (the user deleted it), `replaced` (a new upload took its
 * place), `hidden` (a rule hid the field and its answer was reset), `itemRemoved` (its repeater item
 * was deleted) or `discarded` (an upload resolved after it was aborted; it was never an answer).
 */
export type FileRemovedReason = 'removed' | 'replaced' | 'hidden' | 'itemRemoved' | 'discarded';

export interface FileRemovedContext {
  /** The schema field (for a repeater sub-field: its own key, plus `repeater: { key, itemIndex }`). */
  field: Field & { repeater?: { key: string; itemIndex: number } };
  reason: FileRemovedReason;
}

export interface UploadProviderContext {
  /** The schema field (for a repeater sub-field: its own key, plus `repeater: { key, itemIndex }`). */
  field: Field & { repeater?: { key: string; itemIndex: number } };
  locale: string;
  /** Aborted when the user cancels, the form is re-rendered or `destroy()` runs. */
  signal: AbortSignal;
  /** Optional: report progress as a fraction between 0 and 1. */
  onProgress: (fraction: number) => void;
}

/** Uploads one file outside the form's memory; resolves to the reference to store as the answer. */
export type UploadProvider = (file: File | Blob, context: UploadProviderContext) => Promise<FileReference>;

export interface OpenFormRendererOptions {
  containerEl: HTMLElement;
  /** Fired on a successful validated submit. May return a promise. */
  onSubmit?: (answers: FormAnswers) => void | Promise<unknown>;
  /** Fired on every answer change. `changedKey` is the public field key. */
  onFieldChange?: (answers: FormAnswers, changedKey: string) => void;
  /** Fired after the visible page changes. `index` is the absolute page index (position in `pages`). */
  onPageChange?: (index: number, page: Page) => void;
  /** Fired when validation blocks an action. */
  onValidationError?: (errors: ValidationError[]) => void;
  /** Overrides the built-in UI string dictionary (not form content). */
  translations?: Record<string, string>;
  /** Initial locale, default `"default"`. */
  locale?: string;
  optionsProvider?: OptionsProvider;
  /**
   * Uploads `file` fields' files through the host instead of reading them into Base64 in memory.
   * The answer then holds only the resolved `FileReference`.
   */
  uploadProvider?: UploadProvider;
  /**
   * Fired when an uploaded file leaves the form, so the host can delete it server-side. Errors are logged.
   * Never fired for Base64 (no `uploadProvider`) answers.
   */
  onFileRemoved?: (reference: FileReference, context: FileRemovedContext) => void | Promise<unknown>;
  /** Prefix for every generated DOM id (default: unique `ofr<N>-`). */
  idPrefix?: string;
  /** Stylesheet URL for the handwriting font used by typed signatures (e.g. Caveat). */
  handwritingFontUrl?: string;
  /** Fired (debounced by `draftDebounceMs`) after a real change: answer edit, page change, upload completed/removed. Never by `render()` / `restoreDraft()`. */
  onDraftChange?: (draft: FormDraft) => void;
  /** Debounce for `onDraftChange` and `draftStorage` saves, in ms. Default `800`. */
  draftDebounceMs?: number;
  /** Built-in persistence of the draft: `'local'`, `'session'` or your own adapter. */
  draftStorage?: 'local' | 'session' | DraftStorageAdapter;
  /** Storage key. Default derived from the schema's `formId` (or `formTitle`) and `schemaVersion`. */
  draftKey?: string;
  /** What `render()` does with a stored draft: ask (default), restore silently, or ignore it. */
  resumeDraft?: 'ask' | 'auto' | 'never';
}

/** A form in progress, as returned by `getDraft()` and accepted by `restoreDraft()`. */
export interface FormDraft {
  version: 1;
  schemaVersion: number;
  formId?: string;
  /** Every field's answer, including fields currently hidden or disabled. */
  answers: FormAnswers;
  pageIndex: number;
  /** ISO 8601 timestamp. */
  savedAt: string;
  complete: false;
}

/** Storage for drafts. Each method may return a promise. `value` is the draft as a JSON string; `get` may return that string or the draft object. */
export interface DraftStorageAdapter {
  get(key: string): string | FormDraft | null | undefined | Promise<string | FormDraft | null | undefined>;
  set(key: string, value: string): unknown;
  remove(key: string): unknown;
}

export interface PrintOptions {
  /** Document title while the print dialog is open. Defaults to the form title. */
  title?: string;
}

export class OpenFormRenderer {
  static readonly VERSION: string;
  static readonly SCHEMA_VERSION: number;
  static readonly FIELD_TYPES: FieldType[];
  static readonly CONDITION_OPERATORS: ConditionOperator[];
  static readonly HANDWRITING_FONT_STACK: string;

  constructor(options: OpenFormRendererOptions);

  /** Live internal answers object (prefer `getAnswers()`). */
  answers: FormAnswers;
  locale: string;

  static escapeHtml(value: unknown): string;
  static validateSchema(schema: unknown): SchemaValidationResult;

  /** Renders (or re-renders in place). Schema and answers are copied, never modified. */
  render(schema: FormSchema | null, answers?: FormAnswers | null, readOnly?: boolean): void;
  validate(options?: { showErrors?: boolean }): ValidationResult;
  submit(): Promise<SubmitResult>;
  getAnswers(): FormAnswers;
  /** Returns false when no answerable field has that key. */
  setValue(key: string, value: unknown): boolean;
  /** Returns true if the page was shown. False for an out-of-range index, a page hidden by its rules, or when forward validation blocks the move. */
  goToPage(index: number): boolean;
  /** Absolute indices of the pages not hidden by a page rule, in order. Empty before `render()` / after `destroy()`. */
  getVisiblePages(): number[];
  /** The in-progress record (null before `render()` / after `destroy()`). Never includes uploads in flight. */
  getDraft(): FormDraft | null;
  /** Restores answers and the saved page (no validation, no callbacks). Returns false for an unusable draft. */
  restoreDraft(draft: FormDraft | string): boolean;
  /** Deletes the stored draft (when `draftStorage` is set) and cancels a pending save. */
  clearDraft(): Promise<void>;
  setLocale(locale: string): void;
  print(options?: PrintOptions): void;
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export interface OpenFormBuilderOptions {
  containerEl: HTMLElement;
  /** Fired on every schema mutation with a copy of the schema. */
  onSchemaChange?: (schema: FormSchema) => void;
  /**
   * Overrides the built-in UI string dictionary (every key is listed in docs/builder-translations.json).
   * `{name}` placeholders are filled by the builder; `*One` / `*Other` keys are the singular/plural pair.
   */
  translations?: Record<string, string>;
  /** Schema to start from (cloned). Same as `loadSchema()` right after construction, without undo history. */
  schema?: FormSchema;
  /** Allow-list of field types offered in the palette. Default: all of `OpenFormBuilder.FIELD_TYPES`. Unknown types are ignored. */
  fieldTypes?: FieldType[];
  /** View-only: no palette, no drag, no editing, read-only Properties panel, no undo/redo shortcuts. Default `false`. */
  readOnly?: boolean;
  /** Languages offered in the "Editing Language" switcher (the base language is always first). Replaces the built-in list (pt-BR, en-US, es-ES). */
  locales?: BuilderLocale[];
  /** Replaces the built-in confirm dialog. Resolve `true` to proceed; anything else (or a throw) counts as "no". */
  confirm?: (message: string) => boolean | Promise<boolean>;
  /** Replaces the built-in prompt dialog. Resolve the typed text, or `null` to cancel. */
  prompt?: (message: string, defaultValue: string) => string | null | Promise<string | null>;
}

export interface BuilderLocale {
  /** BCP 47-style code stored as the key under `schema.translations`. */
  code: string;
  /** Text shown in the switcher (defaults to `code`). */
  label?: string;
}

export class OpenFormBuilder {
  static readonly VERSION: string;
  static readonly SCHEMA_VERSION: number;
  static readonly FIELD_TYPES: FieldType[];
  static readonly CONDITION_OPERATORS: ConditionOperator[];

  constructor(options: OpenFormBuilderOptions);

  /** Current schema (read anytime; prefer `getSchema()` for a safe copy). */
  schema: FormSchema;
  /** Whether this builder was created with `readOnly: true`. */
  readOnly: boolean;
  /** The `fieldTypes` allow-list, or `null` when every type is allowed. */
  allowedFieldTypes: FieldType[] | null;
  /** The locales offered in the switcher (without the base language). */
  locales: BuilderLocale[];

  static escapeHtml(value: unknown): string;
  static validateSchema(schema: unknown): SchemaValidationResult;

  /** Pass `null` / `{}` for a blank canvas. */
  loadSchema(schema: FormSchema | null): void;
  /** Deep copy of the current schema. */
  getSchema(): FormSchema;
  /** True when the schema differs from the last `loadSchema()` / `markSaved()`. */
  isDirty(): boolean;
  markSaved(): void;
  undo(): void;
  redo(): void;
  /** Asks for confirmation through the `confirm` hook or the built-in dialog. */
  confirm(message: string): Promise<boolean>;
  /** Asks for text through the `prompt` hook or the built-in dialog; `null` when cancelled. */
  prompt(message: string, defaultValue?: string): Promise<string | null>;
  /** True when the palette offers `type` (always false in read-only mode). */
  isFieldTypeAllowed(type: FieldType): boolean;
  destroy(): void;
}

declare global {
  interface Window {
    OpenFormRenderer?: typeof OpenFormRenderer;
    OpenFormBuilder?: typeof OpenFormBuilder;
  }
}
