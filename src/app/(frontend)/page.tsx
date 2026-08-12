import Link from 'next/link'

import type { Post } from '@/payload-types'
import { findPublishedPosts } from '@/modules/content/public-content'

import { CmsImage } from './_components/CmsImage'
import { Icon, type IconName } from './_components/Icon'
import { SiteHeader } from './_components/SiteHeader'

export const dynamic = 'force-dynamic'

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
})

const clubSections: {
  className: string
  items: { icon: IconName; label: string }[]
  title: string
}[] = [
  {
    className: 'sectionCardRpg',
    items: [
      { icon: 'dice', label: 'Sesje' },
      { icon: 'star', label: 'Systemy' },
      { icon: 'users', label: 'Dołącz do gry' },
    ],
    title: 'RPG',
  },
  {
    className: 'sectionCardLiterature',
    items: [
      { icon: 'book', label: 'Biblioteka' },
      { icon: 'users', label: 'Spotkania' },
      { icon: 'review', label: 'Recenzje' },
    ],
    title: 'Literatura',
  },
  {
    className: 'sectionCardBoardGames',
    items: [
      { icon: 'pawn', label: 'Klubowe granie' },
      { icon: 'collection', label: 'Kolekcja' },
      { icon: 'calendar', label: 'Terminy' },
    ],
    title: 'Planszówki',
  },
]

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

function Sections() {
  return (
    <section aria-labelledby="sections-heading" className="homeSection clubSections">
      <SectionHeading id="sections-heading">Sekcje</SectionHeading>
      <div className="sectionCards">
        {clubSections.map((section) => (
          <article className={`sectionCard ${section.className}`} key={section.title}>
            <span aria-hidden="true" className="sectionCardShade" />
            <div className="sectionCardContent">
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a href="#">
                      <span aria-hidden="true" className="menuIcon">
                        <Icon name={item.icon} />
                      </span>
                      <span>{item.label}</span>
                      <span aria-hidden="true" className="menuArrow">
                        <Icon name="arrow" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="footerBrand">
        {/* eslint-disable-next-line @next/next/no-img-element -- Static brand asset needs no image optimization. */}
        <img alt="" height="90" src="/assets/logo-color.webp" width="90" />
        <strong>
          Wrocławski
          <br />
          Klub Fantastyki
        </strong>
      </div>
      <nav aria-label="Media społecznościowe" className="socialLinks">
        <a aria-label="Discord" href="#">
          <Icon name="discord" />
        </a>
        <a aria-label="Facebook" href="#">
          <Icon name="facebook" />
        </a>
        <a aria-label="Instagram" href="#">
          <Icon name="instagram" />
        </a>
        <a aria-label="E-mail" href="#">
          <Icon name="mail" />
        </a>
      </nav>
      <div className="footerMenus">
        <nav aria-label="Nawigacja w stopce">
          <strong>Nawigacja</strong>
          <a href="#">Aktualności</a>
          <a href="#">Wydarzenia</a>
          <a href="#">Sesje RPG</a>
        </nav>
        <nav aria-label="Klub w stopce">
          <strong>Klub</strong>
          <a href="#">O klubie</a>
          <a href="#">Dołącz</a>
          <a href="#">Kontakt</a>
        </nav>
      </div>
    </footer>
  )
}

export default async function HomePage() {
  const posts = (await findPublishedPosts()).slice(0, 3)

  return (
    <main className="homePage">
      <section className="homeHero">
        <div className="homeShell">
          <SiteHeader />
          <div className="heroContent">
            <h1>
              Witaj w klubie
              <br />
              ludzi z <span>wyobraźnią</span>
            </h1>
            <nav aria-label="Obszary klubu" className="heroTabs">
              <a className="active" href="#">
                Gry RPG
              </a>
              <a href="#">Literatura</a>
              <a href="#">Planszówki</a>
              <a href="#">Spotkania</a>
            </nav>
          </div>
        </div>
      </section>

      <div className="homeShell">
        <NewsSection posts={posts} />
        <Sections />
        <SiteFooter />
      </div>
    </main>
  )
}
