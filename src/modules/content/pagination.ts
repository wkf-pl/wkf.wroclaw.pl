import { createBlockParameterSuffix } from './block-parameter-name'

type SearchParameters = Record<string, string | string[] | undefined>

export function createPaginatedURL(
  pathname: string,
  searchParams: SearchParameters,
  parameterName: string,
  page: number,
): string {
  const parameters = new URLSearchParams()

  for (const [name, value] of Object.entries(searchParams)) {
    if (name === parameterName || value === undefined) {
      continue
    }

    for (const item of Array.isArray(value) ? value : [value]) {
      parameters.append(name, item)
    }
  }

  if (page > 1) {
    parameters.set(parameterName, String(page))
  }

  const query = parameters.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function getRequestedPage(value: string | string[] | undefined): number {
  const candidate = Array.isArray(value) ? value[0] : value
  if (!candidate || !/^\d+$/.test(candidate)) {
    return 1
  }

  const page = Number(candidate)
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

export function resolveBlockPagination({
  blockId,
  blockPath,
  enabled,
  parameterPrefix,
  searchParams,
}: {
  blockId?: null | string
  blockPath: string
  enabled: boolean
  parameterPrefix: string
  searchParams: SearchParameters
}): { parameterName: string; requestedPage: number } {
  const parameterSuffix = createBlockParameterSuffix(blockId, blockPath)
  const parameterName = `${parameterPrefix}_${parameterSuffix}`

  return {
    parameterName,
    requestedPage: enabled ? getRequestedPage(searchParams[parameterName]) : 1,
  }
}
