'use client'

import { useForm, useModal } from '@payloadcms/ui'
import type { FormState } from 'payload'
import { useRef, useState, type KeyboardEvent } from 'react'

import type { LayoutKind } from './tabbed-layout-definition'

export const presentationTabID = 'presentation'
const activeLayoutRowIDs = new Set<string>()

export type LayoutRow = { id: string }
type RowFormValue = { blocks?: unknown }

export function useTabbedLayoutRows(
  typedRows: LayoutRow[],
  arrayPaths: { path: string; schemaPath: string },
  kind: LayoutKind,
) {
  const rowIDs = typedRows.map((row) => row.id)
  const { addFieldRow, getDataByPath, moveFieldRow, removeFieldRow } = useForm()
  const { openModal } = useModal()
  const [activeTabID, setActiveTabID] = useState(
    () => rowIDs.find((rowID) => activeLayoutRowIDs.has(rowID)) ?? presentationTabID,
  )
  const [activateRowAtIndex, setActivateRowAtIndex] = useState<number | null>(null)
  const [rowPendingRemoval, setRowPendingRemoval] = useState<number | null>(null)
  const tabButtons = useRef<Record<string, HTMLButtonElement | null>>({})
  const tabIDs = [presentationTabID, ...rowIDs]
  const pendingActiveRow = activateRowAtIndex === null ? undefined : typedRows[activateRowAtIndex]
  const resolvedActiveTabID = pendingActiveRow?.id ?? activeTabID
  const effectiveActiveTabID =
    resolvedActiveTabID === presentationTabID || rowIDs.includes(resolvedActiveTabID)
      ? resolvedActiveTabID
      : presentationTabID
  const activeRowIndex = typedRows.findIndex((row) => row.id === effectiveActiveTabID)
  const modalSlug = `${arrayPaths.path.replace(/[^a-zA-Z0-9_-]/g, '-')}-remove-row`

  function selectTab(tabID: string, focus = false): void {
    setActivateRowAtIndex(null)
    setActiveTabID(tabID)
    rowIDs.forEach((rowID) => activeLayoutRowIDs.delete(rowID))
    if (tabID !== presentationTabID) activeLayoutRowIDs.add(tabID)
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
      ...(kind === 'columns'
        ? {
            width: { initialValue: 2, passesCondition: true, valid: true, value: 2 },
          }
        : kind === 'tabs'
          ? {
              label: {
                initialValue: `Zakładka ${rowIndex + 1}`,
                passesCondition: true,
                valid: true,
                value: `Zakładka ${rowIndex + 1}`,
              },
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
    activeLayoutRowIDs.delete(removedRowID ?? '')
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

  function cancelRowRemoval(): void {
    setRowPendingRemoval(null)
  }

  function registerTabButton(tabID: string, element: HTMLButtonElement | null): void {
    tabButtons.current[tabID] = element
  }

  return {
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
  }
}
