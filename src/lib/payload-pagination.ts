export type PayloadPage<Document> = {
  docs: Document[]
  hasNextPage: boolean
  nextPage?: null | number
}

export async function collectPayloadPages<Document>(
  loadPage: (page: number) => Promise<PayloadPage<Document>>,
): Promise<Document[]> {
  const documents: Document[] = []
  let page = 1

  while (true) {
    const result = await loadPage(page)
    documents.push(...result.docs)

    if (!result.hasNextPage) {
      return documents
    }

    page = result.nextPage ?? page + 1
  }
}
