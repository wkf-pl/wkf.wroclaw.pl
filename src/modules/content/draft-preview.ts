export const draftPreviewCollections = ['pages', 'posts'] as const

export type DraftPreviewCollection = (typeof draftPreviewCollections)[number]

export type DraftPreviewTarget = {
    collection: DraftPreviewCollection
    path: string
    slug: string
}

type PreviewDocument = {
    id?: unknown
    slug?: unknown
}

const validSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function createDraftPreviewURL(
    collection: DraftPreviewCollection,
    document: PreviewDocument,
): null | string {
    if (!isDocumentID(document.id) || !isValidSlug(document.slug)) {
        return null
    }

    const parameters = new URLSearchParams({collection, slug: document.slug})
    return `/preview?${parameters.toString()}`
}

export function parseDraftPreviewTarget(parameters: URLSearchParams): DraftPreviewTarget | null {
    const collection = parameters.get('collection')
    const slug = parameters.get('slug')

    if (!isDraftPreviewCollection(collection) || !isValidSlug(slug)) {
        return null
    }

    return {
        collection,
        path: collection === 'posts' ? `/blog/${slug}` : `/${slug}`,
        slug,
    }
}

export function getSafePreviewExitPath(value: null | string): string {
    return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/'
}

function isDocumentID(value: unknown): value is number | string {
    return (
        (typeof value === 'number' && Number.isFinite(value)) ||
        (typeof value === 'string' && value.length > 0)
    )
}

function isDraftPreviewCollection(value: null | string): value is DraftPreviewCollection {
    return draftPreviewCollections.some((collection) => collection === value)
}

function isValidSlug(value: unknown): value is string {
    return typeof value === 'string' && validSlugPattern.test(value)
}
