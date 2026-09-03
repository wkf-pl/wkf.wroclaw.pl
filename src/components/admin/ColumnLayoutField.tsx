'use client'

import {
  Button,
  Collapsible,
  ConfirmationModal,
  DraggableSortable,
  DraggableSortableItem,
  FieldError,
  RenderFields,
  useDocumentInfo,
  useField,
  useForm,
  useFormFields,
  useModal,
} from '@payloadcms/ui'
import type {
  ArrayFieldClientProps,
  ClientField,
  FormState,
  SanitizedFieldPermissions,
  Validate,
} from 'payload'
import { useMemo, useState } from 'react'

const totalColumnWidth = 12
const minimumColumnCount = 2
const maximumColumnCount = 4

type ColumnFormValue = {
  blocks?: unknown
  width?: unknown
}

function getNamedField(fields: ClientField[], name: string): ClientField {
  const field = fields.find((candidate) => 'name' in candidate && candidate.name === name)
  if (!field) {
    throw new Error(`Missing ${name} field in column layout configuration.`)
  }
  return field
}

function getRenderedPermissions(
  permissions: ArrayFieldClientProps['permissions'],
): SanitizedFieldPermissions | Record<string, SanitizedFieldPermissions> {
  return permissions === true ? permissions : (permissions?.fields ?? true)
}

export function ColumnLayoutField(properties: ArrayFieldClientProps) {
  const {
    field,
    forceRender,
    path: pathFromProperties,
    permissions,
    readOnly,
    schemaPath,
  } = properties
  const resolvedSchemaPath = schemaPath ?? field.name
  const validation = properties.validate as Validate | undefined
  const { addFieldRow, dispatchFields, getDataByPath, moveFieldRow, removeFieldRow } = useForm()
  const { setDocFieldPreferences } = useDocumentInfo()
  const { openModal } = useModal()
  const [columnPendingRemoval, setColumnPendingRemoval] = useState<number | null>(null)
  const {
    disabled,
    path,
    rows = [],
    showError,
  } = useField({
    hasRows: true,
    potentiallyStalePath: pathFromProperties,
    validate: validation,
  })
  const widths = useFormFields(([fields]) =>
    rows.map((_, index) => {
      const value = fields[`${path}.${index}.width`]?.value
      return typeof value === 'number' ? value : 0
    }),
  )
  const widthSum = widths.reduce((sum, width) => sum + width, 0)
  const widthField = useMemo(() => getNamedField(field.fields, 'width'), [field.fields])
  const blocksField = useMemo(() => getNamedField(field.fields, 'blocks'), [field.fields])
  const renderedPermissions = getRenderedPermissions(permissions)
  const effectiveReadOnly = Boolean(readOnly || disabled)
  const modalSlug = `${path.replace(/[^a-zA-Z0-9_-]/g, '-')}-remove-column`

  function addColumn(): void {
    const subFieldState: FormState = {
      width: {
        initialValue: 2,
        passesCondition: true,
        valid: true,
        value: 2,
      },
    }

    addFieldRow({ path, rowIndex: rows.length, schemaPath: resolvedSchemaPath, subFieldState })
  }

  function removeColumn(columnIndex: number): void {
    const column = getDataByPath<ColumnFormValue>(`${path}.${columnIndex}`)
    const hasBlocks = Array.isArray(column?.blocks)
      ? column.blocks.length > 0
      : typeof column?.blocks === 'number' && column.blocks > 0

    if (!hasBlocks) {
      removeFieldRow({ path, rowIndex: columnIndex })
      return
    }

    setColumnPendingRemoval(columnIndex)
    openModal(modalSlug)
  }

  function confirmColumnRemoval(): void {
    if (columnPendingRemoval !== null) {
      removeFieldRow({ path, rowIndex: columnPendingRemoval })
      setColumnPendingRemoval(null)
    }
  }

  function moveColumn(moveFromIndex: number, moveToIndex: number): void {
    if (moveFromIndex === moveToIndex || moveFromIndex < 0 || moveToIndex < 0) {
      return
    }

    moveFieldRow({ moveFromIndex, moveToIndex, path })
  }

  function setColumnCollapsed(rowID: string, collapsed: boolean): void {
    const updatedRows = rows.map((row) => (row.id === rowID ? { ...row, collapsed } : row))
    const collapsedIDs = updatedRows.filter((row) => row.collapsed).map((row) => row.id)

    dispatchFields({ path, type: 'SET_ROW_COLLAPSED', updatedRows })
    void setDocFieldPreferences(path, { collapsed: collapsedIDs })
  }

  function setAllColumnsCollapsed(collapsed: boolean): void {
    const updatedRows = rows.map((row) => ({ ...row, collapsed }))
    const collapsedIDs = collapsed ? rows.map((row) => row.id) : []

    dispatchFields({ path, type: 'SET_ALL_ROWS_COLLAPSED', updatedRows })
    void setDocFieldPreferences(path, { collapsed: collapsedIDs })
  }

  return (
    <div className="wkf-column-layout-field" id={`field-${path.replace(/\./g, '__')}`}>
      <FieldError path={path} showError={showError} />

      <section
        aria-label="Konfiguracja szerokości kolumn"
        className="wkf-column-layout-configurator"
      >
        <div className="wkf-column-layout-configurator__header">
          <div>
            <h3>Układ kolumn</h3>
            <p
              className={
                widthSum === totalColumnWidth
                  ? 'wkf-column-layout-width-sum'
                  : 'wkf-column-layout-width-sum wkf-column-layout-width-sum--invalid'
              }
            >
              Suma szerokości: {widthSum}/{totalColumnWidth}
            </p>
          </div>
          {!effectiveReadOnly && rows.length < maximumColumnCount ? (
            <Button
              buttonStyle="secondary"
              className="wkf-action-add"
              margin={false}
              onClick={addColumn}
              size="small"
              type="button"
            >
              Dodaj kolumnę
            </Button>
          ) : null}
        </div>

        {widthSum !== totalColumnWidth ? (
          <p className="wkf-column-layout-validation-message" role="alert">
            Szerokości kolumn muszą sumować się do 12.
          </p>
        ) : null}

        <div className="wkf-column-layout-widths">
          {rows.map((row, columnIndex) => (
            <div className="wkf-column-layout-width" key={row.id}>
              <h4>Kolumna {columnIndex + 1}</h4>
              <RenderFields
                fields={[widthField]}
                forceRender={forceRender}
                margins={false}
                parentIndexPath=""
                parentPath={`${path}.${columnIndex}`}
                parentSchemaPath={resolvedSchemaPath}
                permissions={renderedPermissions}
                readOnly={effectiveReadOnly}
              />
              {!effectiveReadOnly ? (
                <div className="wkf-column-layout-width__actions">
                  <Button
                    aria-label={`Przesuń kolumnę ${columnIndex + 1} w lewo`}
                    buttonStyle="secondary"
                    disabled={columnIndex === 0}
                    margin={false}
                    onClick={() => moveColumn(columnIndex, columnIndex - 1)}
                    size="small"
                    type="button"
                  >
                    <span aria-hidden="true" className="wkf-column-layout-move-arrow">
                      ←
                    </span>
                  </Button>
                  <Button
                    aria-label={`Przesuń kolumnę ${columnIndex + 1} w prawo`}
                    buttonStyle="secondary"
                    disabled={columnIndex === rows.length - 1}
                    margin={false}
                    onClick={() => moveColumn(columnIndex, columnIndex + 1)}
                    size="small"
                    type="button"
                  >
                    <span aria-hidden="true" className="wkf-column-layout-move-arrow">
                      →
                    </span>
                  </Button>
                  {rows.length > minimumColumnCount ? (
                    <Button
                      aria-label={`Usuń kolumnę ${columnIndex + 1}`}
                      buttonStyle="secondary"
                      className="wkf-action-delete"
                      margin={false}
                      onClick={() => removeColumn(columnIndex)}
                      size="small"
                      type="button"
                    >
                      Usuń
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <ul
        aria-label="Widoczność zawartości kolumn"
        className="array-field__header-actions wkf-column-layout-collapse-actions"
      >
        <li>
          <button
            className="array-field__header-action"
            onClick={() => setAllColumnsCollapsed(true)}
            type="button"
          >
            Zwiń wszystkie
          </button>
        </li>
        <li>
          <button
            className="array-field__header-action"
            onClick={() => setAllColumnsCollapsed(false)}
            type="button"
          >
            Rozwiń wszystkie
          </button>
        </li>
      </ul>

      <DraggableSortable
        className="wkf-column-layout-contents"
        ids={rows.map((row) => row.id)}
        onDragEnd={({ moveFromIndex, moveToIndex }) => moveColumn(moveFromIndex, moveToIndex)}
      >
        {rows.map((row, columnIndex) => (
          <DraggableSortableItem disabled={effectiveReadOnly} id={row.id} key={row.id}>
            {({ attributes, isDragging, listeners, setNodeRef, transform, transition }) => (
              <div
                className="wkf-column-layout-content-row"
                ref={setNodeRef}
                style={{ transform, transition, zIndex: isDragging ? 1 : undefined }}
              >
                <Collapsible
                  className="wkf-column-layout-content"
                  dragHandleProps={
                    effectiveReadOnly ? undefined : { attributes, id: row.id, listeners }
                  }
                  header={
                    <h3 className="wkf-column-layout-content__title">
                      Kolumna {columnIndex + 1} - {widths[columnIndex] ?? 0}/12
                    </h3>
                  }
                  isCollapsed={row.collapsed}
                  onToggle={(collapsed) => setColumnCollapsed(row.id, collapsed)}
                >
                  <RenderFields
                    fields={[blocksField]}
                    forceRender={forceRender}
                    margins={false}
                    parentIndexPath=""
                    parentPath={`${path}.${columnIndex}`}
                    parentSchemaPath={resolvedSchemaPath}
                    permissions={renderedPermissions}
                    readOnly={effectiveReadOnly}
                  />
                </Collapsible>
              </div>
            )}
          </DraggableSortableItem>
        ))}
      </DraggableSortable>

      <ConfirmationModal
        body="Ta kolumna zawiera bloki. Usunięcie kolumny trwale usunie również całą jej zawartość z bieżącego dokumentu."
        cancelLabel="Anuluj"
        confirmLabel="Usuń kolumnę"
        heading={`Usunąć kolumnę ${(columnPendingRemoval ?? 0) + 1}?`}
        modalSlug={modalSlug}
        onCancel={() => setColumnPendingRemoval(null)}
        onConfirm={confirmColumnRemoval}
      />
    </div>
  )
}
