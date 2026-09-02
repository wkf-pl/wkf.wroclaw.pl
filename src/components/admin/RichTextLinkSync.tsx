'use client'

import { useField, useForm } from '@payloadcms/ui'
import type { FormState, UIFieldClientProps } from 'payload'
import { useCallback, useEffect, useRef } from 'react'

import { getRelationshipId } from '@/lib/relationships'
import {
  getRichTextLinkTechnicalValues,
  getRichTextLinkVisibleValues,
  isRichTextLinkFieldVisible,
  richTextLinkConditionalFieldNames,
  type RichTextLinkTechnicalValues,
} from '@/modules/content/rich-text-links'

type LexicalDocumentReference =
  | null
  | undefined
  | {
      relationTo: string
      value: unknown
    }

function getSiblingPath(path: string, fieldName: string): string {
  const pathSuffix = '.richTextLinkSync'
  const basePath = path.endsWith(pathSuffix)
    ? path.slice(0, -pathSuffix.length)
    : path === 'richTextLinkSync'
      ? ''
      : path

  return basePath ? `${basePath}.${fieldName}` : fieldName
}

function referencesMatch(
  currentReference: LexicalDocumentReference,
  nextReference: RichTextLinkTechnicalValues['doc'],
): boolean {
  if (!currentReference || !nextReference) {
    return !currentReference && !nextReference
  }

  return (
    currentReference.relationTo === nextReference.relationTo &&
    getRelationshipId(currentReference.value) === nextReference.value
  )
}

export function RichTextLinkSync(properties: UIFieldClientProps) {
  const siblingPath = useCallback(
    (fieldName: string) => getSiblingPath(properties.path, fieldName),
    [properties.path],
  )
  const { dispatchFields, getFields } = useForm()
  const { value: targetType } = useField<unknown>({
    path: siblingPath('targetType'),
  })
  const { value: customScheme } = useField<unknown>({
    path: siblingPath('customScheme'),
  })
  const { value: customAddress } = useField<unknown>({
    path: siblingPath('customAddress'),
  })
  const { value: newTab } = useField<unknown>({ path: siblingPath('newTab') })
  const { value: page } = useField<unknown>({ path: siblingPath('page') })
  const { value: post } = useField<unknown>({ path: siblingPath('post') })
  const { value: event } = useField<unknown>({ path: siblingPath('event') })
  const { value: eventCycle } = useField<unknown>({
    path: siblingPath('eventCycle'),
  })
  const { value: category } = useField<unknown>({
    path: siblingPath('category'),
  })
  const { value: tag } = useField<unknown>({ path: siblingPath('tag') })
  const { value: document } = useField<unknown>({
    path: siblingPath('document'),
  })
  const { value: linkType } = useField<'custom' | 'internal'>({
    path: siblingPath('linkType'),
  })
  const { value: documentReference } = useField<LexicalDocumentReference>({
    path: siblingPath('doc'),
  })
  const { value: url } = useField<null | string>({
    path: siblingPath('url'),
  })
  const initializedVisibleFields = useRef(false)

  useEffect(() => {
    if (!initializedVisibleFields.current) {
      initializedVisibleFields.current = true
      const visibleValues = getRichTextLinkVisibleValues({
        doc: documentReference,
        linkType,
        url,
      })

      if (visibleValues) {
        const currentFields = getFields()
        const hydratedFields = Object.entries(visibleValues).reduce<FormState>(
          (fields, [fieldName, value]) => {
            const path = siblingPath(fieldName)
            fields[path] = { ...currentFields[path], value }
            return fields
          },
          {},
        )

        dispatchFields({ formState: hydratedFields, type: 'UPDATE_MANY' })
        return
      }
    }

    const currentFields = getFields()
    const nextFieldState = richTextLinkConditionalFieldNames.reduce<FormState>(
      (formState, fieldName) => {
        const fieldPath = siblingPath(fieldName)
        const fieldState = currentFields[fieldPath]
        const passesCondition = isRichTextLinkFieldVisible(fieldName, targetType)

        if (fieldState && fieldState.passesCondition !== passesCondition) {
          formState[fieldPath] = { ...fieldState, passesCondition }
        }

        return formState
      },
      {},
    )

    const technicalValues = getRichTextLinkTechnicalValues({
      category,
      customAddress,
      customScheme,
      document,
      event,
      eventCycle,
      newTab,
      page,
      post,
      tag,
      targetType,
    })

    if (linkType !== technicalValues.linkType) {
      const fieldPath = siblingPath('linkType')
      nextFieldState[fieldPath] = {
        ...currentFields[fieldPath],
        value: technicalValues.linkType,
      }
    }

    if (!referencesMatch(documentReference, technicalValues.doc)) {
      const fieldPath = siblingPath('doc')
      nextFieldState[fieldPath] = {
        ...currentFields[fieldPath],
        value: technicalValues.doc,
      }
    }

    if ((url ?? undefined) !== technicalValues.url) {
      const fieldPath = siblingPath('url')
      nextFieldState[fieldPath] = {
        ...currentFields[fieldPath],
        value: technicalValues.url ?? null,
      }
    }

    if (Object.keys(nextFieldState).length > 0) {
      dispatchFields({ formState: nextFieldState, type: 'UPDATE_MANY' })
    }
  }, [
    category,
    customAddress,
    customScheme,
    document,
    documentReference,
    dispatchFields,
    event,
    eventCycle,
    linkType,
    newTab,
    page,
    post,
    getFields,
    siblingPath,
    tag,
    targetType,
    url,
  ])

  return null
}
