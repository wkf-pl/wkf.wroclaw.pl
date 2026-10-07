import Link from 'next/link'

import { CmsRichText } from '@/components/CmsRichText'
import { RasterIcon } from '@/components/RasterIcon'
import type { Post } from '@/payload-types'
import {
  findPublishedPosts,
  getPublicHomepageHero,
  getPublicHomepageSections,
} from '@/modules/content/public-content'
import { findHomepageEvents } from '@/modules/events/public-events'
import { findCalendarMonth } from '@/modules/events/calendar-data'
import { getWarsawCalendarMonth } from '@/modules/events/calendar-presentation'

import { CmsImage } from './_components/CmsImage'
import { ContentLayoutRenderer } from './_components/ContentLayoutRenderer'
import { EventShowcase } from './_components/EventShowcase'
import { HomepageHero } from './_components/HomepageHero'

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
})

function SectionHeading({ children, id }: { children: string; id: string }) {
  return (
    <div className="sectionHeading">
      <span aria-hidden="true" className="sectionHeadingLine" />
      <span aria-hidden="true" className="sectionHeadingMark">
        <RasterIcon name="dice" size="medium" />
      </span>
      <h2 id={id}>{children}</h2>
      <span aria-hidden="true" className="sectionHeadingMark">
        <RasterIcon name="dice" size="medium" />
      </span>
      <span aria-hidden="true" className="sectionHeadingLine" />
    </div>
  )
}

function NewsImage({ className, post }: { className: string; post: Post }) {
  if (post.heroImage && typeof post.heroImage === 'object') {
    return <CmsImage className={className} media={post.heroImage} />
  }

  return <span aria-hidden="true" className={`${className} newsImageFallback`} />
}

function SmallNewsCard({ post }: { post: Post }) {
  return (
    <Link className="smallNewsCard" href={`/blog/${post.slug}`}>
      <NewsImage className="smallNewsImage" post={post} />
      <span className="smallNewsOverlay" />
      <span className="smallNewsContent">
        <strong>{post.title}</strong>
        {post.publishedAt ? (
          <time dateTime={post.publishedAt}>
            <RasterIcon name="calendar" size="small" />
            {dateFormatter.format(new Date(post.publishedAt))}
          </time>
        ) : null}
      </span>
    </Link>
  )
}

function NewsSection({ posts, title }: { posts: Post[]; title: string }) {
  return (
    <section aria-labelledby="news-heading" className="homeSection homeNews">
      <SectionHeading id="news-heading">{title}</SectionHeading>

      <div className="newsGrid">
        {posts.map((post) => (
          <SmallNewsCard key={post.id} post={post} />
        ))}
        <Link className="allNewsCard" href="/blog">
          <span aria-hidden="true" className="allNewsIcon">
            <RasterIcon name="book" size="medium" />
          </span>
          <strong>Wszystkie aktualności</strong>
          <span className="allNewsCallToAction">
            Przejdź do bloga <RasterIcon name="arrow-right" size="medium" />
          </span>
        </Link>
      </div>
    </section>
  )
}

type HomePageProperties = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: HomePageProperties) {
  const resolvedSearchParams = await searchParams
  const initialCalendarMonth = getWarsawCalendarMonth()
  const [hero, homepageSections, calendarData] = await Promise.all([
    getPublicHomepageHero(),
    getPublicHomepageSections(),
    findCalendarMonth(initialCalendarMonth),
  ])
  const eventWindowWeeks = homepageSections.eventWindowWeeks ?? 4
  const eventSlideLimit = homepageSections.eventSlideLimit ?? 6
  const postCount = Number.parseInt(homepageSections.postCount ?? '2', 10)
  const [events, posts] = await Promise.all([
    findHomepageEvents(eventWindowWeeks, eventSlideLimit),
    findPublishedPosts(postCount),
  ])

  return (
    <main className="homePage">
      <HomepageHero hero={hero} />

      <div className="homeShell">
        <section aria-labelledby="events-heading" className="homeSection homeEvents">
          <SectionHeading id="events-heading">{homepageSections.eventsTitle}</SectionHeading>
          {homepageSections.eventsContent ? (
            <CmsRichText className="homeSectionContent" data={homepageSections.eventsContent} />
          ) : null}
          <EventShowcase
            events={events}
            initialCalendarData={calendarData}
            initialCalendarMonth={initialCalendarMonth}
          />
        </section>
        <NewsSection posts={posts} title={homepageSections.newsTitle} />
        <ContentLayoutRenderer
          document={homepageSections}
          pathname="/"
          searchParams={resolvedSearchParams}
        />
      </div>
    </main>
  )
}
