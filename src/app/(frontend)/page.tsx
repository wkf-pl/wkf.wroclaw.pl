import { getPublicHomepageHero, getPublicHomepageSections } from '@/modules/content/public-content'

import { ContentLayoutRenderer } from './_components/ContentLayoutRenderer'
import { HomepageHero } from './_components/HomepageHero'

type HomePageProperties = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: HomePageProperties) {
  const resolvedSearchParams = await searchParams
  const [hero, homepageSections] = await Promise.all([
    getPublicHomepageHero(),
    getPublicHomepageSections(),
  ])

  return (
    <main className="homePage">
      <HomepageHero hero={hero} />

      <div className="homeShell">
        <ContentLayoutRenderer
          document={homepageSections}
          pathname="/"
          searchParams={resolvedSearchParams}
        />
      </div>
    </main>
  )
}
