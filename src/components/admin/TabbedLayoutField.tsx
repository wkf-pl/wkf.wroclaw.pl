'use client'

import {
  Button,
  ConfirmationModal,
  DragHandleIcon,
  DraggableSortable,
  DraggableSortableItem,
  FieldError,
  RenderFields,
  WatchChildErrors,
  XIcon,
  useField,
  useFieldPath,
  useForm,
  useFormFields,
  useModal,
} from '@payloadcms/ui'
import { getFieldPaths } from 'payload/shared'
import type {
  ClientField,
  FormState,
  GroupFieldClientProps,
  SanitizedFieldPermissions,
  Validate,
} from 'payload'
import { useId, useRef, useState, type KeyboardEvent } from 'react'

const presentationTabID = 'presentation'
const totalColumnWidth = 12

type ArrayClientField = Extract<ClientField, { type: 'array' }>
type LayoutKind = 'columns' | 'sections'
type LayoutRow = { id: string }
type RenderedFieldPermissions = true | Record<string, SanitizedFieldPermissions>
type RowFormValue = { blocks?: unknown }

type LayoutDefinition = {
  addLabel: string
  arrayName: 'columns' | 'sections'
  itemAccusative: 'kolumnę' | 'sekcję'
  itemLabel: 'Kolumna' | 'Sekcja'
  kind: LayoutKind
  maximumRows: number
  minimumRows: number
  tabListLabel: string
}

const layoutDefinitions: Record<LayoutKind, LayoutDefinition> = {
  columns: {
    addLabel: 'Dodaj kolumnę',
    arrayName: 'columns',
    itemAccusative: 'kolumnę',
    itemLabel: 'Kolumna',
    kind: 'columns',
    maximumRows: 4,
    minimumRows: 2,
    tabListLabel: 'Ustawienia układu kolumnowego',
  },
  sections: {
    addLabel: 'Dodaj sekcję',
    arrayName: 'sections',
    itemAccusative: 'sekcję',
    itemLabel: 'Sekcja',
    kind: 'sections',
    maximumRows: 8,
    minimumRows: 1,
    tabListLabel: 'Ustawienia grupy sekcji',
  },
}

function isArrayField(field: ClientField): field is ArrayClientField {
  return field.type === 'array'
}

function getRenderedPermissions(
  permissions: GroupFieldClientProps['permissions'],
): RenderedFieldPermissions {
  return permissions === true ? permissions : (permissions?.fields ?? true)
}

function getRowPermissions(
  permissions: RenderedFieldPermissions,
  arrayName: string,
): RenderedFieldPermissions {
  if (permissions === true) return true

  const arrayPermissions = permissions[arrayName]
  return arrayPermissions === true ? true : (arrayPermissions?.fields ?? true)
}

function getDataPath(path: string): (number | string)[] {
  return path
    .split('.')
    .filter((segment) => segment && !segment.startsWith('_index-'))
    .map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment))
}

function getClientValidation(definition: LayoutDefinition): Validate {
  if (definition.kind === 'sections') {
    return (value) =>
      Array.isArray(value) &&
      value.length >= definition.minimumRows &&
      value.length <= definition.maximumRows
        ? true
        : 'Grupa sekcji musi zawierać od 1 do 8 sekcji.'
  }

  return (value) => {
    if (
      !Array.isArray(value) ||
      value.length < definition.minimumRows ||
      value.length > definition.maximumRows
    ) {
      return 'Układ kolumnowy musi zawierać od 2 do 4 kolumn.'
    }

    const widths = value.map((column) =>
      column && typeof column === 'object' && 'width' in column ? column.width : undefined,
    )
    if (
      widths.some((width) => !Number.isInteger(width) || Number(width) < 2 || Number(width) > 10)
    ) {
      return 'Szerokość każdej kolumny musi być liczbą całkowitą od 2 do 10.'
    }

    return widths.reduce((sum, width) => sum + Number(width), 0) === totalColumnWidth
      ? true
      : 'Szerokości kolumn muszą sumować się do 12.'
  }
}

function TabErrorCount({ fields, path }: { fields: ClientField[]; path: string }) {
  const [errorCount, setErrorCount] = useState(0)

  return (
    <>
      <WatchChildErrors fields={fields} path={getDataPath(path)} setErrorCount={setErrorCount} />
      {errorCount > 0 ? (
        <span
          aria-label={`${errorCount} ${errorCount === 1 ? 'błąd' : 'błędy'}`}
          className="wkf-layout-tabs__error-count"
        >
          {errorCount}
        </span>
      ) : null}
    </>
  )
}

function TabbedLayoutField({
  definition,
  properties,
}: {
  definition: LayoutDefinition
  properties: GroupFieldClientProps
}) {
  const {
    field,
    forceRender,
    indexPath = '',
    path,
    permissions,
    readOnly,
    schemaPath = '',
  } = properties
  const currentPath = useFieldPath() || path
  const arrayFieldIndex = field.fields.findIndex(
    (candidate) =>
      isArrayField(candidate) && 'name' in candidate && candidate.name === definition.arrayName,
  )
  const arrayField = field.fields[arrayFieldIndex]
  if (!arrayField || !isArrayField(arrayField)) {
    throw new Error(`Missing ${definition.arrayName} array field.`)
  }

  const arrayPaths = getFieldPaths({
    field: arrayField,
    index: arrayFieldIndex,
    parentIndexPath: indexPath,
    parentPath: currentPath,
    parentSchemaPath: schemaPath,
  })
  const rootFields = field.fields.filter((_, fieldIndex) => fieldIndex !== arrayFieldIndex)
  const renderedPermissions = getRenderedPermissions(permissions)
  const rowPermissions = getRowPermissions(renderedPermissions, definition.arrayName)
  const validation = getClientValidation(definition)
  const {
    disabled,
    rows = [],
    showError,
  } = useField({
    hasRows: true,
    path: arrayPaths.path,
    validate: validation,
  })
  const { addFieldRow, getDataByPath, moveFieldRow, removeFieldRow } = useForm()
  const { openModal } = useModal()
  const [activeTabID, setActiveTabID] = useState(presentationTabID)
  const [activateRowAtIndex, setActivateRowAtIndex] = useState<number | null>(null)
  const [rowPendingRemoval, setRowPendingRemoval] = useState<number | null>(null)
  const tabButtons = useRef<Record<string, HTMLButtonElement | null>>({})
  const componentID = useId().replaceAll(':', '')
  const effectiveReadOnly = Boolean(readOnly || disabled)
  const typedRows = rows as LayoutRow[]
  const rowIDs = typedRows.map((row) => row.id)
  const columnWidths = useFormFields(([fields]) =>
    definition.kind === 'columns'
      ? typedRows.map((_, rowIndex) => {
          const value = fields[`${arrayPaths.path}.${rowIndex}.width`]?.value
          return typeof value === 'number' ? value : 0
        })
      : [],
  )
  const tabIDs = [presentationTabID, ...rowIDs]
  const pendingActiveRow = activateRowAtIndex === null ? undefined : typedRows[activateRowAtIndex]
  const resolvedActiveTabID = pendingActiveRow?.id ?? activeTabID
  const effectiveActiveTabID =
    resolvedActiveTabID === presentationTabID || rowIDs.includes(resolvedActiveTabID)
      ? resolvedActiveTabID
      : presentationTabID
  const activeRowIndex = typedRows.findIndex((row) => row.id === effectiveActiveTabID)
  const widthSum =
    definition.kind === 'columns' ? columnWidths.reduce((sum, width) => sum + width, 0) : null
  const visibleValidationError =
    definition.kind === 'columns' &&
    columnWidths.some((width) => !Number.isInteger(width) || width < 2 || width > 10)
      ? 'Szerokość każdej kolumny musi być liczbą całkowitą od 2 do 10.'
      : definition.kind === 'columns' && widthSum !== totalColumnWidth
        ? 'Szerokości kolumn muszą sumować się do 12.'
        : undefined
  const modalSlug = `${arrayPaths.path.replace(/[^a-zA-Z0-9_-]/g, '-')}-remove-row`

  function selectTab(tabID: string, focus = false): void {
    setActivateRowAtIndex(null)
    setActiveTabID(tabID)
    if (focus) {
      requestAnimationFrame(() => tabButtons.current[tabID]?.focus())
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentTabID: string): void {
    const currentIndex = tabIDs.indexOf(currentTabID)
    let nextIndex: number | undefined

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabIDs.length
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabIDs.length) % tabIDs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabIDs.length - 1
    if (nextIndex === undefined) return

    event.preventDefault()
    selectTab(tabIDs[nextIndex]!, true)
  }

  function addRow(): void {
    const rowIndex = typedRows.length
    const subFieldState: FormState = {
      frame: { initialValue: 'none', passesCondition: true, valid: true, value: 'none' },
      surface: {
        initialValue: 'transparent',
        passesCondition: true,
        valid: true,
        value: 'transparent',
      },
      ...(definition.kind === 'columns'
        ? {
            width: { initialValue: 2, passesCondition: true, valid: true, value: 2 },
          }
        : {}),
    }

    addFieldRow({
      path: arrayPaths.path,
      rowIndex,
      schemaPath: arrayPaths.schemaPath,
      subFieldState,
    })
    setActivateRowAtIndex(rowIndex)
  }

  function moveRow(moveFromIndex: number, moveToIndex: number): void {
    if (
      moveFromIndex === moveToIndex ||
      moveFromIndex < 0 ||
      moveToIndex < 0 ||
      moveToIndex >= typedRows.length
    ) {
      return
    }

    moveFieldRow({ moveFromIndex, moveToIndex, path: arrayPaths.path })
  }

  function removeRowAndRestoreFocus(rowIndex: number): void {
    const removedRowID = typedRows[rowIndex]?.id
    const nextActiveTabID =
      effectiveActiveTabID === removedRowID ? presentationTabID : effectiveActiveTabID

    setActivateRowAtIndex(null)
    setActiveTabID(nextActiveTabID)
    removeFieldRow({ path: arrayPaths.path, rowIndex })
    requestAnimationFrame(() => tabButtons.current[nextActiveTabID]?.focus())
  }

  function requestRowRemoval(rowIndex: number): void {
    const row = getDataByPath<RowFormValue>(`${arrayPaths.path}.${rowIndex}`)
    const hasBlocks = Array.isArray(row?.blocks)
      ? row.blocks.length > 0
      : typeof row?.blocks === 'number' && row.blocks > 0

    if (!hasBlocks) {
      removeRowAndRestoreFocus(rowIndex)
      return
    }

    setRowPendingRemoval(rowIndex)
    openModal(modalSlug)
  }

  function confirmRowRemoval(): void {
    if (rowPendingRemoval === null) return

    removeRowAndRestoreFocus(rowPendingRemoval)
    setRowPendingRemoval(null)
  }

  const activeTabPanelID = `${componentID}-${effectiveActiveTabID}-panel`
  const activeTabButtonID = `${componentID}-${effectiveActiveTabID}-tab`

  return (
    <div className="wkf-layout-tabs" data-layout-kind={definition.kind}>
      <FieldError path={arrayPaths.path} showError={showError} />

      <div className="wkf-layout-tabs__toolbar">
        <p
          className={
            widthSum !== null && widthSum !== totalColumnWidth
              ? 'wkf-layout-tabs__summary wkf-layout-tabs__summary--invalid'
              : 'wkf-layout-tabs__summary'
          }
        >
          {definition.kind === 'columns'
            ? `Kolumny: ${typedRows.length} · suma szerokości: ${widthSum}c`
            : `Sekcje: ${typedRows.length}`}
        </p>
        {!effectiveReadOnly && typedRows.length < definition.maximumRows ? (
          <Button
            buttonStyle="secondary"
            className="wkf-action-add"
            margin={false}
            onClick={addRow}
            size="small"
            type="button"
          >
            {definition.addLabel}
          </Button>
        ) : null}
      </div>

      {visibleValidationError ? (
        <p className="wkf-layout-tabs__validation" role="alert">
          {visibleValidationError}
        </p>
      ) : null}

      <div aria-label={definition.tabListLabel} className="wkf-layout-tabs__tablist" role="tablist">
        <button
          aria-controls={`${componentID}-${presentationTabID}-panel`}
          aria-selected={effectiveActiveTabID === presentationTabID}
          className="wkf-layout-tabs__tab"
          id={`${componentID}-${presentationTabID}-tab`}
          onClick={() => selectTab(presentationTabID)}
          onKeyDown={(event) => handleTabKeyDown(event, presentationTabID)}
          ref={(element) => {
            tabButtons.current[presentationTabID] = element
          }}
          role="tab"
          tabIndex={effectiveActiveTabID === presentationTabID ? 0 : -1}
          type="button"
        >
          <span>Prezentacja</span>
          <TabErrorCount fields={rootFields} path={currentPath} />
        </button>

        <DraggableSortable
          className="wkf-layout-tabs__sortable-tabs"
          ids={rowIDs}
          onDragEnd={({ moveFromIndex, moveToIndex }) => moveRow(moveFromIndex, moveToIndex)}
        >
          {typedRows.map((row, rowIndex) => {
            const rowTabID = row.id
            const itemLabel =
              definition.kind === 'columns'
                ? `${definition.itemLabel} ${rowIndex + 1} - ${columnWidths[rowIndex]}c`
                : `${definition.itemLabel} ${rowIndex + 1}`
            const canRemoveRow = typedRows.length > definition.minimumRows
            return (
              <DraggableSortableItem disabled={effectiveReadOnly} id={row.id} key={row.id}>
                {({ attributes, isDragging, listeners, setNodeRef, transform, transition }) => (
                  <div
                    className="wkf-layout-tabs__sortable-tab"
                    data-active={effectiveActiveTabID === rowTabID}
                    ref={setNodeRef}
                    style={{ transform, transition, zIndex: isDragging ? 1 : undefined }}
                  >
                    {!effectiveReadOnly ? (
                      <button
                        {...attributes}
                        {...listeners}
                        aria-label={`Przeciągnij: ${itemLabel}`}
                        className="wkf-layout-tabs__drag-handle"
                        type="button"
                      >
                        <DragHandleIcon />
                      </button>
                    ) : null}
                    <button
                      aria-controls={`${componentID}-${rowTabID}-panel`}
                      aria-selected={effectiveActiveTabID === rowTabID}
                      className="wkf-layout-tabs__tab"
                      id={`${componentID}-${rowTabID}-tab`}
                      onClick={() => selectTab(rowTabID)}
                      onKeyDown={(event) => handleTabKeyDown(event, rowTabID)}
                      ref={(element) => {
                        tabButtons.current[rowTabID] = element
                      }}
                      role="tab"
                      tabIndex={effectiveActiveTabID === rowTabID ? 0 : -1}
                      type="button"
                    >
                      <span>{itemLabel}</span>
                      <TabErrorCount
                        fields={arrayField.fields}
                        path={`${arrayPaths.path}.${rowIndex}`}
                      />
                    </button>
                    {!effectiveReadOnly ? (
                      <button
                        aria-label={`Usuń: ${itemLabel}`}
                        className="wkf-layout-tabs__remove-tab"
                        disabled={!canRemoveRow}
                        onClick={() => requestRowRemoval(rowIndex)}
                        title={
                          canRemoveRow
                            ? `Usuń: ${itemLabel}`
                            : `Nie można usunąć. Wymagane minimum: ${definition.minimumRows}.`
                        }
                        type="button"
                      >
                        <XIcon />
                      </button>
                    ) : null}
                  </div>
                )}
              </DraggableSortableItem>
            )
          })}
        </DraggableSortable>
      </div>

      <div
        aria-labelledby={activeTabButtonID}
        className="wkf-layout-tabs__panel"
        id={activeTabPanelID}
        role="tabpanel"
        tabIndex={0}
      >
        {effectiveActiveTabID === presentationTabID ? (
          <RenderFields
            fields={rootFields}
            forceRender={forceRender}
            margins={false}
            parentIndexPath={indexPath}
            parentPath={currentPath}
            parentSchemaPath={schemaPath}
            permissions={renderedPermissions}
            readOnly={effectiveReadOnly}
          />
        ) : activeRowIndex >= 0 ? (
          <RenderFields
            fields={arrayField.fields}
            forceRender={forceRender}
            margins={false}
            parentIndexPath=""
            parentPath={`${arrayPaths.path}.${activeRowIndex}`}
            parentSchemaPath={arrayPaths.schemaPath}
            permissions={rowPermissions}
            readOnly={effectiveReadOnly}
          />
        ) : null}
      </div>

      <ConfirmationModal
        body={`Ta ${definition.itemLabel.toLowerCase()} zawiera bloki. Usunięcie trwale usunie również całą jej zawartość z bieżącego dokumentu.`}
        cancelLabel="Anuluj"
        confirmLabel="Usuń"
        heading={`Usunąć ${definition.itemAccusative} ${(rowPendingRemoval ?? 0) + 1}?`}
        modalSlug={modalSlug}
        onCancel={() => setRowPendingRemoval(null)}
        onConfirm={confirmRowRemoval}
      />
    </div>
  )
}

export function ColumnLayoutTabsField(properties: GroupFieldClientProps) {
  return <TabbedLayoutField definition={layoutDefinitions.columns} properties={properties} />
}

export function SectionGroupTabsField(properties: GroupFieldClientProps) {
  return <TabbedLayoutField definition={layoutDefinitions.sections} properties={properties} />
}
