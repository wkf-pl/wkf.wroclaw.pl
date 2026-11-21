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
  useFormFields,
} from '@payloadcms/ui'
import { getFieldPaths } from 'payload/shared'
import type { ClientField, GroupFieldClientProps, SanitizedFieldPermissions } from 'payload'
import { useId, useState } from 'react'

import {
  getClientValidation,
  getColumnWidthError,
  layoutDefinitions,
  totalColumnWidth,
  type LayoutDefinition,
} from './tabbed-layout-definition'
import { presentationTabID, useTabbedLayoutRows, type LayoutRow } from './useTabbedLayoutRows'

type ArrayClientField = Extract<ClientField, { type: 'array' }>
type RenderedFieldPermissions = true | Record<string, SanitizedFieldPermissions>

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
  const typedRows = rows as LayoutRow[]
  const {
    activeRowIndex,
    addRow,
    cancelRowRemoval,
    confirmRowRemoval,
    effectiveActiveTabID,
    handleTabKeyDown,
    modalSlug,
    moveRow,
    registerTabButton,
    requestRowRemoval,
    rowIDs,
    rowPendingRemoval,
    selectTab,
  } = useTabbedLayoutRows(typedRows, arrayPaths, definition.kind)
  const componentID = useId().replaceAll(':', '')
  const effectiveReadOnly = Boolean(readOnly || disabled)
  const columnWidths = useFormFields(([fields]) =>
    definition.kind === 'columns'
      ? typedRows.map((_, rowIndex) => {
          const value = fields[`${arrayPaths.path}.${rowIndex}.width`]?.value
          return typeof value === 'number' ? value : 0
        })
      : [],
  )
  const tabLabels = useFormFields(([fields]) =>
    definition.kind === 'tabs'
      ? typedRows.map((_, rowIndex) => {
          const value = fields[`${arrayPaths.path}.${rowIndex}.label`]?.value
          return typeof value === 'string' ? value.trim() : ''
        })
      : [],
  )
  const widthSum =
    definition.kind === 'columns' ? columnWidths.reduce((sum, width) => sum + width, 0) : null
  const visibleValidationError =
    definition.kind === 'columns' ? getColumnWidthError(columnWidths) : undefined
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
            : definition.kind === 'sections'
              ? `Sekcje: ${typedRows.length}`
              : `Zakładki: ${typedRows.length}`}
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
          ref={(element) => registerTabButton(presentationTabID, element)}
          role="tab"
          tabIndex={effectiveActiveTabID === presentationTabID ? 0 : -1}
          type="button"
        >
          <span>{definition.rootTabLabel}</span>
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
                : definition.kind === 'tabs' && tabLabels[rowIndex]
                  ? tabLabels[rowIndex]
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
                      ref={(element) => registerTabButton(rowTabID, element)}
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
        onCancel={cancelRowRemoval}
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

export function TabbedContentTabsField(properties: GroupFieldClientProps) {
  return <TabbedLayoutField definition={layoutDefinitions.tabs} properties={properties} />
}
