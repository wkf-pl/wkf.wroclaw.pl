import {
  findHomepageHeroForRequest,
  findHomepageSectionsForRequest,
} from '@/modules/content/preview-content'

import { ContentLayoutRenderer } from './_components/ContentLayoutRenderer'
import { DraftPreviewBanner } from './_components/DraftPreviewBanner'
import { HomepageHero } from './_components/HomepageHero'

type HomePageProperties = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: HomePageProperties) {
  const resolvedSearchParams = await searchParams
  const [heroResult, homepageSectionsResult] = await Promise.all([
    findHomepageHeroForRequest(),
    findHomepageSectionsForRequest(),
  ])
  const isDraftPreview = heroResult.isDraftPreview || homepageSectionsResult.isDraftPreview

  return (
    <main className="homePage">
      {isDraftPreview ? <DraftPreviewBanner pathname="/" /> : null}
      <HomepageHero hero={heroResult.document} />

      <div className="homeShell">
        <ContentLayoutRenderer
          document={homepageSectionsResult.document}
          pathname="/"
          searchParams={resolvedSearchParams}
        />
      </div>
    </main>
  )
}
