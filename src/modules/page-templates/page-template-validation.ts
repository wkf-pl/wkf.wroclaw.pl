import { APIError } from 'payload'

import { getAllowedPageTemplateBlockSlugs } from './page-template-blocks'
import {
  getPageTemplateDefinition,
  getPageTemplateContextAction,
  getPageTemplateContextListingRelation,
  getPageTemplateDynamicField,
  isPageTemplateID,
  type PageTemplateDefinition,
  type PageTemplateID,
  type PageTemplateRegion,
} from './page-template-registry'

type PageTemplateData = Record<string, unknown> & {
  _status?: unknown
  content?: unknown
  hero?: unknown
  heroImage?: unknown
  informationPanel?: unknown
  previewTarget?: unknown
  renderingMode?: unknown
  templateKey?: unknown
}

export function preservePageTemplateKey(
  data: PageTemplateData,
  operation: 'create' | 'update',
  originalDocument?: PageTemplateData,
): PageTemplateData {
  if (operation === 'update' && originalDocument?.templateKey !== undefined) {
    data.templateKey = originalDocument.templateKey
  }
  return data
}

export function validatePageTemplateData(data: PageTemplateData): void {
  if (!isPageTemplateID(data.templateKey)) {
    throw new APIError('Nieznany typ szablonu strony.', 400)
  }

  const definition = getPageTemplateDefinition(data.templateKey)
  if (!definition) throw new APIError('Nie znaleziono definicji szablonu strony.', 400)

  validateHeroImage(data, definition)
  validatePreviewTarget(data.previewTarget, definition)

  const currentItemContentCount = (['hero', 'informationPanel', 'content'] as const).reduce(
    (count, region) =>
      count + validateRegion(data[region], data.templateKey as PageTemplateID, region, definition),
    0,
  )

  if (!definition.requiresCurrentItemContent && currentItemContentCount > 0) {
    throw new APIError('Ten szablon nie obsługuje bloku „Treści bieżącego elementu”.', 400)
  }
  if (currentItemContentCount > 1) {
    throw new APIError('Blok „Treści bieżącego elementu” może wystąpić tylko raz.', 400)
  }

  const isPublishedTemplate = data._status === 'published' && data.renderingMode === 'template'
  if (!isPublishedTemplate) return

  if (!definition.rendererAvailable) {
    throw new APIError('Nowy renderer tej trasy nie został jeszcze wdrożony.', 400)
  }
  if (definition.requiresCurrentItemContent && currentItemContentCount !== 1) {
    throw new APIError(
      'Opublikowany szablon wymaga dokładnie jednego bloku „Treści bieżącego elementu”.',
      400,
    )
  }
  if (data.templateKey === 'event-detail' && !hasEventHeroTitle(data.hero)) {
    throw new APIError(
      'Opublikowany szablon wydarzenia wymaga w Hero pola „Tytuł” w wyglądzie „Nagłówek główny”.',
      400,
    )
  }
}

function hasEventHeroTitle(value: unknown): boolean {
  let found = false
  walkValue(value, (candidate) => {
    if (
      candidate.blockType === 'currentItemField' &&
      candidate.field === 'title' &&
      candidate.variant === 'primaryHeading'
    ) {
      found = true
    }
  })
  return found
}

function validateHeroImage(data: PageTemplateData, definition: PageTemplateDefinition): void {
  if (definition.heroImageRule !== 'configurable' && hasValue(data.heroImage)) {
    throw new APIError('Obraz Hero nie jest konfigurowalny dla tego szablonu.', 400)
  }
}

function validatePreviewTarget(value: unknown, definition: PageTemplateDefinition): void {
  if (!hasValue(value)) return
  if (!definition.previewCollection) {
    throw new APIError('Ten szablon nie wymaga elementu używanego w podglądzie.', 400)
  }
  if (!isRecord(value) || value.relationTo !== definition.previewCollection) {
    throw new APIError('Element podglądu nie pasuje do typu trasy szablonu.', 400)
  }
}

function validateRegion(
  value: unknown,
  templateID: PageTemplateID,
  region: PageTemplateRegion,
  definition: PageTemplateDefinition,
): number {
  if (value === undefined || value === null) return 0
  if (!Array.isArray(value)) throw new APIError(`Region ${region} ma nieprawidłowy format.`, 400)

  const allowedTopLevelBlocks = new Set(getAllowedPageTemplateBlockSlugs(templateID, region))
  for (const block of value) {
    if (!isRecord(block) || typeof block.blockType !== 'string') {
      throw new APIError(`Region ${region} zawiera nieprawidłowy blok.`, 400)
    }
    if (!allowedTopLevelBlocks.has(block.blockType)) {
      throw new APIError(`Blok ${block.blockType} nie jest dozwolony w regionie ${region}.`, 400)
    }
  }

  let currentItemContentCount = 0
  walkValue(value, (candidate) => {
    if (candidate.blockType === 'currentItemContent') currentItemContentCount += 1
    if (candidate.blockType === 'currentItemField') {
      validateCurrentItemField(candidate, templateID, region)
    }
    if (candidate.blockType === 'currentItemFieldRow') {
      validateCurrentItemFieldRow(candidate, templateID, region)
    }
    if (candidate.blockType === 'actionLinks') {
      validateContextActions(candidate, templateID)
    }
    if (candidate.blockType === 'listing' && candidate.selectionMode === 'contextRelation') {
      validateContextListingRelation(candidate, templateID)
    }
    if (
      candidate.blockType === 'listing' &&
      definition.routeKind !== 'collectionItem' &&
      listingUsesCurrentItem(candidate)
    ) {
      throw new APIError(
        'Listing na trasie bez bieżącego elementu nie może używać wartości „Bieżący element”.',
        400,
      )
    }
  })

  return currentItemContentCount
}

function validateCurrentItemFieldRow(
  block: Record<string, unknown>,
  templateID: PageTemplateID,
  region: PageTemplateRegion,
): void {
  if (!Array.isArray(block.items) || block.items.length === 0) {
    throw new APIError('Wiersz pól wymaga co najmniej jednego elementu.', 400)
  }

  for (const item of block.items) {
    if (
      !isRecord(item) ||
      !['currentItemField', 'fieldRowText', 'pageTemplateIcon', 'actionLinks'].includes(
        String(item.blockType),
      )
    ) {
      throw new APIError('Wiersz pól zawiera nieobsługiwany element.', 400)
    }
    if (item.blockType !== 'currentItemField' || typeof item.field !== 'string') continue

    const dynamicField = getPageTemplateDynamicField(templateID, item.field, region)
    if (!dynamicField?.inline) {
      throw new APIError(`Pole ${item.field} nie może być użyte w bloku „Wiersz pól”.`, 400)
    }
  }
}

function validateContextActions(block: Record<string, unknown>, templateID: PageTemplateID): void {
  if (!Array.isArray(block.items)) return

  for (const item of block.items) {
    if (!isRecord(item) || item.actionSource !== 'contextAction') continue
    if (
      typeof item.contextAction !== 'string' ||
      !getPageTemplateContextAction(templateID, item.contextAction)
    ) {
      throw new APIError(
        `Akcja ${String(item.contextAction)} nie jest dostępna dla tego szablonu.`,
        400,
      )
    }
  }
}

function validateContextListingRelation(
  block: Record<string, unknown>,
  templateID: PageTemplateID,
): void {
  if (
    typeof block.contextRelation !== 'string' ||
    !getPageTemplateContextListingRelation(templateID, block.contextRelation)
  ) {
    throw new APIError(
      `Relacja ${String(block.contextRelation)} nie jest dostępna dla tego szablonu.`,
      400,
    )
  }
}

function validateCurrentItemField(
  block: Record<string, unknown>,
  templateID: PageTemplateID,
  region: PageTemplateRegion,
): void {
  if (typeof block.field !== 'string') {
    throw new APIError('Wybierz pole bieżącego elementu.', 400)
  }
  const dynamicField = getPageTemplateDynamicField(templateID, block.field, region)
  if (!dynamicField) {
    throw new APIError(`Pole ${block.field} nie jest dostępne w regionie ${region}.`, 400)
  }
  if (
    typeof block.variant !== 'string' ||
    !dynamicField.variants.some(({ value }) => value === block.variant)
  ) {
    throw new APIError(`Wybrany wygląd pola ${dynamicField.label} nie jest obsługiwany.`, 400)
  }
}

function listingUsesCurrentItem(block: Record<string, unknown>): boolean {
  return (
    block.selectionMode === 'contextRelation' ||
    (Array.isArray(block.conditions) &&
      block.conditions.some(
        (condition) =>
          isRecord(condition) &&
          condition.field === 'relatedTo' &&
          condition.relatedTargetMode === 'current',
      ))
  )
}

function walkValue(value: unknown, visit: (value: Record<string, unknown>) => void): void {
  if (Array.isArray(value)) {
    value.forEach((item) => walkValue(item, visit))
    return
  }
  if (!isRecord(value)) return

  if (typeof value.blockType === 'string') visit(value)
  Object.values(value).forEach((item) => walkValue(item, visit))
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
