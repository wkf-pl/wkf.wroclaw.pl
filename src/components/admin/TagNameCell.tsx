'use client'

import { DefaultCell } from '@payloadcms/ui'
import type { DefaultCellComponentProps, TextFieldClient } from 'payload'

import { TagLabel } from '@/components/TagLabel'

export function TagNameCell(properties: DefaultCellComponentProps<TextFieldClient>) {
  const { cellData, rowData } = properties
  return (
    <DefaultCell
      {...properties}
      cellData={
        typeof cellData === 'string' ? (
          <TagLabel name={cellData} groupIcon={rowData?.groupIcon} />
        ) : (
          cellData
        )
      }
    />
  )
}
