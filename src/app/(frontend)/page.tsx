import Link from 'next/link'

import type { ClubSection, Post } from '@/payload-types'
import {
  findPublishedClubSections,
  findPublishedPosts,
  getPublicNavigation,
} from '@/modules/content/public-content'
import { hasRenderableIcon, resolveLink, resolvePageLink } from '@/modules/navigation/links'

import { CmsImage } from './_components/CmsImage'
import { Icon } from './_components/Icon'
import { MenuIcon } from './_components/MenuIcon'

export const dynamic = 'force-dynamic'

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
})

function SectionHeading({ children, id }: { children: string; id: string }) {
  return (
    <div className="sectionHeading">
      <span aria-hidden="true" className="sectionHeadingLine" />
      <span aria-hidden="true" className="sectionHeadingMark">
        <Icon name="dice" />
      </span>
      <h2 id={id}>{children}</h2>
      <span aria-hidden="true" className="sectionHeadingMark">
        <Icon name="dice" />
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
            <Icon name="calendar" />
            {dateFormatter.format(new Date(post.publishedAt))}
          </time>
        ) : null}
      </span>
    </Link>
  )
}

function NewsSection({ posts }: { posts: Post[] }) {
  const [featuredPost, ...secondaryPosts] = posts

  return (
    <section aria-labelledby="news-heading" className="homeSection homeNews">
      <SectionHeading id="news-heading">Aktualności</SectionHeading>

      {featuredPost ? (
        <article className="featuredNews">
          <Link className="featuredNewsImageLink" href={`/blog/${featuredPost.slug}`}>
            <NewsImage className="featuredNewsImage" post={featuredPost} />
            <strong className="featuredNewsImageTitle">{featuredPost.title}</strong>
          </Link>
          <div className="featuredNewsContent">
            <h3>{featuredPost.title}</h3>
            <p>{featuredPost.excerpt}</p>
            <dl className="featuredNewsDetails">
              <div>
                <dt>
                  <Icon name="time" />
                  Kiedy:
                </dt>
                <dd>wtorek · 18:00</dd>
              </div>
              <div>
                <dt>
                  <Icon name="location" />
                  Gdzie:
                </dt>
                <dd>Wiking Club</dd>
              </div>
            </dl>
            <Link className="textArrowLink" href={`/blog/${featuredPost.slug}`}>
              Więcej… <Icon name="arrow" />
            </Link>
          </div>
        </article>
      ) : (
        <p className="emptyState">Nie ma jeszcze opublikowanych wpisów.</p>
      )}

      <div className="newsGrid">
        {secondaryPosts.slice(0, 2).map((post) => (
          <SmallNewsCard key={post.id} post={post} />
        ))}
        <Link className="allNewsCard" href="/blog">
          <span aria-hidden="true" className="allNewsIcon">
            <Icon name="book" />
          </span>
          <strong>Wszystkie aktualności</strong>
          <span className="allNewsCallToAction">
            Przejdź do bloga <Icon name="arrow" />
          </span>
        </Link>
      </div>
    </section>
  )
}

function SectionCard({ section }: { section: ClubSection }) {
  const titleLink = resolvePageLink(section.destinationPage)
  const menuItems = section.menuItems?.flatMap((item) => {
    const link = resolveLink(item)
    return link && hasRenderableIcon(item) ? [{ item, link }] : []
  })

  return (
    <article className="sectionCard">
      {section.backgroundImage && typeof section.backgroundImage === 'object' ? (
        <CmsImage className="sectionCardImage" media={section.backgroundImage} />
      ) : (
        <span aria-hidden="true" className="sectionCardImage sectionCardImageFallback" />
      )}
      <span aria-hidden="true" className="sectionCardShade" />
      <div className="sectionCardContent">
        <h3>{titleLink ? <Link {...titleLink}>{section.name}</Link> : section.name}</h3>
        {menuItems?.length ? (
          <ul>
            {menuItems.map(({ item, link }) => (
              <li key={item.id}>
                <Link {...link}>
                  <span aria-hidden="true" className="menuIcon">
                    <MenuIcon
                      customIcon={item.customIcon}
                      iconSource={item.iconSource}
                      systemIcon={item.systemIcon}
                    />
                  </span>
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="menuArrow">
                    <Icon name="arrow" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  )
}

function Sections({ sections }: { sections: ClubSection[] }) {
  if (sections.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="sections-heading" className="homeSection clubSections">
      <SectionHeading id="sections-heading">Sekcje</SectionHeading>
      <div className="sectionCards">
        {sections.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </section>
  )
}

export default async function HomePage() {
  const [posts, sections, navigation] = await Promise.all([
    findPublishedPosts(),
    findPublishedClubSections(),
    getPublicNavigation(),
  ])
  const heroItems = navigation.heroItems?.flatMap((item) => {
    const link = resolveLink(item)
    return link ? [{ item, link }] : []
  })

  return (
    <main className="homePage">
      <section className="homeHero">
        <div className="homeShell">
          <div className="heroContent">
            <h1>
              Witaj w klubie
              <br />
              ludzi z <span>wyobraźnią</span>
            </h1>
            {heroItems?.length ? (
              <nav aria-label="Obszary klubu" className="heroTabs">
                {heroItems.map(({ item, link }) => (
                  <Link key={item.id} {...link}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      </section>

      <div className="homeShell">
        <NewsSection posts={posts.slice(0, 3)} />
        <Sections sections={sections} />
      </div>
    </main>
  )
}
