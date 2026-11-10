'use client'

import {
  ConfirmationModal,
  FieldDescription,
  FieldError,
  FieldLabel,
  Link,
  ReactSelect,
  RelationshipField,
  useDocumentInfo,
  useDocumentTitle,
  useField,
  useFormFields,
  useConfig,
  useModal,
  useRowLabel,
  ViewDescription,
} from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'
import type {
  DefaultCellComponentProps,
  RelationshipFieldClientProps,
  SelectFieldClient,
  SelectFieldClientProps,
} from 'payload'
import { formatAdminURL } from 'payload/shared'
import { Fragment, useEffect, useId, useMemo, useState, type ComponentProps } from 'react'

import { extractRichTextText } from '@/modules/content/rich-text'
import {
  getSelectableRasterIconLabel,
  isSelectableRasterIconName,
} from '@/modules/icons/icon-registry'
import type { CurrentItemFieldRowBlock } from '@/payload-types'
import {
  getPageTemplateDefinition,
  getPageTemplateDynamicField,
  getPageTemplateRegionFromPath,
  isPageTemplateID,
  type PageTemplateRenderingMode,
} from '@/modules/page-templates/page-template-registry'

import { BlockLabel } from './ContentBlockLabelClient'

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
  const templateKey = useTemplateKey()
  const definition = templateKey ? getPageTemplateDefinition(templateKey) : undefined
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
      <FieldDescription
        description={
          definition?.rendererAvailable === false
            ? 'Nowy renderer tej trasy nie został jeszcze wdrożony.'
            : properties.field.admin?.description
        }
        path={path}
      />
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
    ({ inline, regions }) =>
      region && regions.includes(region) && (!isFieldRowPath(properties.path) || inline),
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
  const options = dynamicField?.variants.filter(({ legacy }) => !legacy) ?? []
  const isLegacyVariant = dynamicField?.variants.some(
    (variant) => variant.value === value && variant.legacy,
  )
  const selectedOption = options.find(
    (option) => option.value === (isLegacyVariant ? dynamicField?.defaultVariant : value),
  )
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

export function PageTemplateContextActionSelect(properties: SelectFieldClientProps) {
  const templateKey = useTemplateKey()
  const definition = templateKey ? getPageTemplateDefinition(templateKey) : undefined
  const { errorMessage, path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: properties.path,
  })
  const options = definition?.contextActions?.map(({ key, label }) => ({ label, value: key })) ?? []
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
        placeholder={options.length ? 'Wybierz akcję' : 'Brak akcji dla tego szablonu'}
        showError={showError}
        value={selectedOption}
      />
      <FieldError message={errorMessage} path={path} showError={showError} />
      <FieldDescription
        description="Akcje specjalistyczne są dostępne dodatkowo obok standardowych celów odnośników."
        path={path}
      />
    </div>
  )
}

export function PageTemplateContextListingRelationSelect(properties: SelectFieldClientProps) {
  const templateKey = useTemplateKey()
  const definition = templateKey ? getPageTemplateDefinition(templateKey) : undefined
  const { errorMessage, path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: properties.path,
  })
  const options =
    definition?.contextListingRelations?.map(({ key, label }) => ({ label, value: key })) ?? []
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
        placeholder={options.length ? 'Wybierz relację' : 'Brak relacji dla tego szablonu'}
        showError={showError}
        value={selectedOption}
      />
      <FieldError message={errorMessage} path={path} showError={showError} />
      <FieldDescription
        description="Elementy listingu są pobierane z relacji zapisanej w bieżącym elemencie."
        path={path}
      />
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

export function PageTemplateDescription(properties: ComponentProps<typeof ViewDescription>) {
  const { id, data } = useDocumentInfo()
  const { title, setDocumentTitle } = useDocumentTitle()
  const definition = isPageTemplateID(data?.templateKey)
    ? getPageTemplateDefinition(data.templateKey)
    : undefined
  const label = definition?.label

  useEffect(() => {
    if (id == null || !label || title === label || !setDocumentTitle) return

    // Payload schedules the field-derived title in an animation frame after client navigation.
    let titleFrame: number | undefined
    const payloadFrame = requestAnimationFrame(() => {
      titleFrame = requestAnimationFrame(() => setDocumentTitle(label))
    })
    return () => {
      cancelAnimationFrame(payloadFrame)
      if (titleFrame !== undefined) cancelAnimationFrame(titleFrame)
    }
  }, [id, label, setDocumentTitle, title])

  if (id == null) return <ViewDescription {...properties} />

  return definition ? (
    <div className="custom-view-description">
      <code>{definition.route}</code>
    </div>
  ) : null
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

export function CurrentItemFieldRowBlockLabel() {
  const { data, path } = useRowLabel<{
    items?: Partial<CurrentItemFieldRowBlock['items'][number]>[]
  }>()
  const templateKey = useTemplateKey()
  const region = getPageTemplateRegionFromPath(path)
  const labels = (data.items ?? []).flatMap((item, index) => {
    const key = item.id ?? index
    switch (item.blockType) {
      case 'currentItemField': {
        const field =
          templateKey && region && item.field
            ? getPageTemplateDynamicField(templateKey, item.field, region)
            : undefined
        return [{ key, label: field ? <code>{field.label}</code> : 'Pole bieżącego elementu' }]
      }
      case 'fieldRowText': {
        const text = extractRichTextText(item.text)
        return [{ key, label: text ? `"${text}"` : 'Tekst' }]
      }
      case 'pageTemplateIcon':
        return [
          {
            key,
            label: isSelectableRasterIconName(item.iconName) ? (
              <>
                Ikona <code>{item.iconName}</code>
              </>
            ) : (
              'Ikona'
            ),
          },
        ]
      case 'actionLinks':
        return [{ key, label: 'Odnośniki akcji' }]
      default:
        return []
    }
  })

  return (
    <BlockLabel
      prefix="Wiersz pól"
      value={
        labels.length
          ? labels.map(({ key, label }, index) => (
              <Fragment key={key}>
                {index ? ' + ' : null}
                {label}
              </Fragment>
            ))
          : undefined
      }
    />
  )
}

export function PageTemplateIconBlockLabel() {
  const { data, path } = useRowLabel<{ iconName?: unknown }>()
  const liveIconName = useFormFields(([fields]) => fields[`${path}.iconName`]?.value)
  const iconName = liveIconName === undefined ? data.iconName : liveIconName
  return (
    <BlockLabel
      prefix="Ikona"
      value={
        isSelectableRasterIconName(iconName) ? getSelectableRasterIconLabel(iconName) : undefined
      }
    />
  )
}

export function FieldRowTextBlockLabel() {
  const { data, path } = useRowLabel<{ text?: unknown }>()
  const text = useFormFields(([fields]) => fields[`${path}.text`]?.value)
  return <BlockLabel prefix="Tekst" value={extractRichTextText(text ?? data.text)} />
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

function isFieldRowPath(path: string): boolean {
  return path.split('.').includes('items')
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
