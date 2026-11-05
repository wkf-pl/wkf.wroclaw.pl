'use client'

import {
  ConfirmationModal,
  FieldDescription,
  FieldError,
  FieldLabel,
  Link,
  ReactSelect,
  RelationshipField,
  useField,
  useFormFields,
  useConfig,
  useModal,
  useRowLabel,
} from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'
import type {
  DefaultCellComponentProps,
  RelationshipFieldClientProps,
  SelectFieldClient,
  SelectFieldClientProps,
  UIFieldClientProps,
} from 'payload'
import { formatAdminURL } from 'payload/shared'
import { useId, useMemo, useState } from 'react'

import {
  getPageTemplateDefinition,
  getPageTemplateDynamicField,
  getPageTemplateRegionFromPath,
  isPageTemplateID,
  type PageTemplateRenderingMode,
} from '@/modules/page-templates/page-template-registry'

type SelectOption = { label: string; value: string }

const renderingModeOptions: Array<SelectOption & { value: PageTemplateRenderingMode }> = [
  { label: 'Dotychczasowy układ (legacy)', value: 'legacy' },
  { label: 'Układ z szablonu', value: 'template' },
]

export function PageTemplateRenderingModeField(properties: SelectFieldClientProps) {
  const { errorMessage, path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: properties.path,
  })
  const { openModal } = useModal()
  const modalSlug = `page-template-mode-${useId().replaceAll(':', '')}`
  const [pendingMode, setPendingMode] = useState<PageTemplateRenderingMode | null>(null)
  const currentMode: PageTemplateRenderingMode = value === 'template' ? 'template' : 'legacy'
  const selectedOption = renderingModeOptions.find(({ value }) => value === currentMode)
  const styles = useMemo(() => mergeFieldStyles(properties.field), [properties.field])

  function requestModeChange(option: unknown): void {
    if (!isSelectOption(option) || option.value === currentMode) return
    if (option.value !== 'legacy' && option.value !== 'template') return
    setPendingMode(option.value)
    openModal(modalSlug)
  }

  function confirmModeChange(): void {
    if (!pendingMode) return
    setValue(pendingMode)
    setPendingMode(null)
  }

  return (
    <div className="field-type select" style={styles}>
      <FieldLabel label={properties.field.label} path={path} required />
      <ReactSelect
        disabled={properties.readOnly}
        inputId={path}
        isClearable={false}
        isSearchable={false}
        onChange={requestModeChange}
        options={renderingModeOptions}
        showError={showError}
        value={selectedOption}
      />
      <FieldError message={errorMessage} path={path} showError={showError} />
      <FieldDescription description={properties.field.admin?.description} path={path} />
      <ConfirmationModal
        body={
          pendingMode === 'template'
            ? 'Po opublikowaniu tej wersji dotychczasowy układ strony zostanie zastąpiony konfiguracją regionów. Publiczna strona nie zmieni się do chwili publikacji.'
            : 'Po opublikowaniu tej wersji strona wróci do dotychczasowego układu. Konfiguracja nowego szablonu zostanie zachowana.'
        }
        cancelLabel="Anuluj"
        confirmLabel="Zmień tryb"
        heading={
          pendingMode === 'template'
            ? 'Przełączyć na układ z szablonu?'
            : 'Przywrócić dotychczasowy układ?'
        }
        modalSlug={modalSlug}
        onCancel={() => setPendingMode(null)}
        onConfirm={confirmModeChange}
      />
    </div>
  )
}

export function CurrentItemFieldSelect(properties: SelectFieldClientProps) {
  const templateKey = useTemplateKey()
  const region = getPageTemplateRegionFromPath(properties.path)
  const definition = templateKey ? getPageTemplateDefinition(templateKey) : undefined
  const availableFields = definition?.dynamicFields.filter(
    ({ regions }) => region && regions.includes(region),
  )
  const { errorMessage, path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: properties.path,
  })
  const variant = useField<string>({ path: siblingPath(properties.path, 'variant') })
  const options =
    availableFields?.map(({ key, label }) => ({ label, value: key }) satisfies SelectOption) ?? []
  const selectedOption = options.find((option) => option.value === value)
  const styles = useMemo(() => mergeFieldStyles(properties.field), [properties.field])

  function handleChange(option: unknown): void {
    if (!isSelectOption(option) || !templateKey || !region) return
    const field = getPageTemplateDynamicField(templateKey, option.value, region)
    if (!field) return
    setValue(field.key)
    variant.setValue(field.defaultVariant)
  }

  return (
    <div className="field-type select" style={styles}>
      <FieldLabel label={properties.field.label} path={path} required />
      <ReactSelect
        disabled={properties.readOnly || options.length === 0}
        inputId={path}
        isClearable={false}
        isSearchable={false}
        onChange={handleChange}
        options={options}
        placeholder={options.length ? 'Wybierz pole' : 'Brak pól w tym regionie'}
        showError={showError}
        value={selectedOption}
      />
      <FieldError message={errorMessage} path={path} showError={showError} />
    </div>
  )
}

export function CurrentItemFieldVariantSelect(properties: SelectFieldClientProps) {
  const templateKey = useTemplateKey()
  const region = getPageTemplateRegionFromPath(properties.path)
  const fieldKey = useFormFields(([fields]) => fields[siblingPath(properties.path, 'field')]?.value)
  const dynamicField =
    templateKey && region && typeof fieldKey === 'string'
      ? getPageTemplateDynamicField(templateKey, fieldKey, region)
      : undefined
  const { errorMessage, path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: properties.path,
  })
  const options = dynamicField?.variants.map(({ label, value }) => ({ label, value })) ?? []
  const selectedOption = options.find((option) => option.value === value)
  const styles = useMemo(() => mergeFieldStyles(properties.field), [properties.field])

  return (
    <div className="field-type select" style={styles}>
      <FieldLabel label={properties.field.label} path={path} required />
      <ReactSelect
        disabled={properties.readOnly || options.length === 0}
        inputId={path}
        isClearable={false}
        isSearchable={false}
        onChange={(option) => {
          if (isSelectOption(option)) setValue(option.value)
        }}
        options={options}
        placeholder={dynamicField ? 'Wybierz wygląd' : 'Najpierw wybierz pole'}
        showError={showError}
        value={selectedOption}
      />
      <FieldError message={errorMessage} path={path} showError={showError} />
    </div>
  )
}

export function PageTemplatePreviewTargetField(properties: RelationshipFieldClientProps) {
  const templateKey = useTemplateKey()
  const previewCollection = templateKey
    ? getPageTemplateDefinition(templateKey)?.previewCollection
    : null
  if (!previewCollection) return null

  return (
    <RelationshipField
      {...properties}
      field={{ ...properties.field, relationTo: [previewCollection] }}
      key={previewCollection}
    />
  )
}

export function PageTemplateIdentity(_properties: UIFieldClientProps) {
  const templateKey = useTemplateKey()
  const definition = templateKey ? getPageTemplateDefinition(templateKey) : undefined
  if (!definition) return null

  return (
    <div className="page-template-identity">
      <strong>{definition.label}</strong>
      <code>{definition.route}</code>
      {!definition.rendererAvailable ? (
        <p>Nowy renderer tej trasy nie został jeszcze wdrożony.</p>
      ) : null}
    </div>
  )
}

export function PageTemplateNameCell({
  cellData,
  collectionSlug,
  rowData,
}: DefaultCellComponentProps<SelectFieldClient>) {
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig()
  const definition = isPageTemplateID(cellData) ? getPageTemplateDefinition(cellData) : undefined
  const content = definition ? (
    <>
      <strong>{definition.label}</strong>
      <br />
      <code>{definition.route}</code>
    </>
  ) : (
    <>Nieznany szablon</>
  )

  return rowData.id ? (
    <Link
      href={formatAdminURL({
        adminRoute,
        path: `/collections/${collectionSlug}/${encodeURIComponent(rowData.id)}`,
      })}
      prefetch={false}
    >
      {content}
    </Link>
  ) : (
    <span>{content}</span>
  )
}

export function CurrentItemFieldBlockLabel() {
  const { data, path } = useRowLabel<{ field?: unknown; variant?: unknown }>()
  const templateKey = useTemplateKey()
  const region = getPageTemplateRegionFromPath(path)
  const liveField = useFormFields(([fields]) => fields[`${path}.field`]?.value)
  const liveVariant = useFormFields(([fields]) => fields[`${path}.variant`]?.value)
  const fieldKey = typeof liveField === 'string' ? liveField : data.field
  const variantKey = typeof liveVariant === 'string' ? liveVariant : data.variant
  const field =
    templateKey && region && typeof fieldKey === 'string'
      ? getPageTemplateDynamicField(templateKey, fieldKey, region)
      : undefined
  const variant = field?.variants.find(({ value }) => value === variantKey)

  return (
    <span className="wkf-content-block-label">
      <strong>Pole bieżącego elementu</strong>
      {field ? (
        <span>
          : {field.label}
          {variant ? ` · ${variant.label}` : ''}
        </span>
      ) : null}
    </span>
  )
}

export function CurrentItemContentBlockLabel() {
  return <strong>Treści bieżącego elementu</strong>
}

function useTemplateKey() {
  const value = useFormFields(([fields]) => fields.templateKey?.value)
  return isPageTemplateID(value) ? value : undefined
}

function siblingPath(path: string, fieldName: string): string {
  const segments = path.split('.')
  segments[segments.length - 1] = fieldName
  return segments.join('.')
}

function isSelectOption(value: unknown): value is SelectOption {
  return Boolean(
    value &&
    !Array.isArray(value) &&
    typeof value === 'object' &&
    'value' in value &&
    typeof value.value === 'string',
  )
}
