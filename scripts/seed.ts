// Seeds idempotent demonstration content, media, navigation, and global site settings.

import { randomUUID } from 'node:crypto'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../src/payload.config'
import type {
  HomepageSection,
  Media,
  Navigation,
  Page,
  RichTextBlock,
  User,
} from '../src/payload-types'

const payload = await getPayload({ config })

type SeedPost = {
  imageAlt: string
  imagePath: string
  excerpt: string
  publishedAt: string
  slug: string
  title: string
  paragraphs: string[]
}

const seedPosts: SeedPost[] = [
  {
    imageAlt: 'Kamienny portal w zielonym lesie',
    imagePath: 'public/assets/home/erpegowe-wtorki.webp',
    excerpt: 'Wracamy do korzeni — pierwsza sesja nowego cyklu Erpegowego Wtorka już za nami.',
    paragraphs: [
      'Erpegowe wtorki to regularne spotkania dla osób, które chcą zagrać, poprowadzić albo po prostu poznać gry fabularne.',
      'Pierwsze spotkanie odbyło się we wtorek o 18:00 w Wiking Clubie. Dziękujemy wszystkim uczestnikom i już szykujemy kolejne przygody.',
    ],
    publishedAt: '2026-05-14T16:00:00.000Z',
    slug: 'erpegowe-wtorki-1',
    title: 'Erpegowe wtorki 1',
  },
  {
    imageAlt: 'Klubowicze podczas wspólnej sesji gry fabularnej',
    imagePath: 'public/assets/home/wiesci-z-klubu.webp',
    excerpt: 'Krótki przegląd tego, czym żył klub w ostatnich tygodniach.',
    paragraphs: [
      'Za nami kilka intensywnych tygodni pełnych sesji, rozmów o książkach i wspólnego grania.',
      'W najbliższym czasie opublikujemy kolejne terminy spotkań i zaprosimy Was do nowych klubowych inicjatyw.',
    ],
    publishedAt: '2026-05-12T10:00:00.000Z',
    slug: 'wiesci-z-klubu',
    title: 'Wieści z klubu',
  },
  {
    imageAlt: 'Stare książki oświetlone mosiężną lampą w klubowej bibliotece',
    imagePath: 'public/assets/home/nowosci-w-bibliotece.webp',
    excerpt: 'Na klubowe półki trafiły nowe fantastyczne lektury.',
    paragraphs: [
      'Biblioteka WKF wzbogaciła się o nowe powieści, podręczniki do gier fabularnych i albumy.',
      'Listę wszystkich dostępnych tytułów udostępnimy wkrótce. Na razie zapraszamy do przeglądania nowości podczas spotkań klubowych.',
    ],
    publishedAt: '2026-05-10T10:00:00.000Z',
    slug: 'nowosci-w-bibliotece',
    title: 'Nowości w bibliotece',
  },
]

function createLexicalDocument(paragraphs: string[]): RichTextBlock['content'] {
  return {
    root: {
      children: paragraphs.map((text) => ({
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        type: 'paragraph',
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

function createRichTextBlock(
  paragraphs: string[],
  textStyle: NonNullable<RichTextBlock['textStyle']> = 'default',
): RichTextBlock {
  return {
    blockType: 'richText',
    content: createLexicalDocument(paragraphs),
    textStyle,
  }
}

async function findOrCreateAuthor(): Promise<User> {
  const existingUsers = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
  })

  if (existingUsers.docs[0]) {
    return existingUsers.docs[0]
  }

  const roles = await payload.find({
    collection: 'roles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { key: { equals: 'editor' } },
  })
  const editorRole = roles.docs[0]

  if (!editorRole) {
    throw new Error('The editor role must exist before seeding CMS content.')
  }

  return payload.create({
    collection: 'users',
    data: {
      displayName: 'Redakcja WKF',
      email: 'redakcja-seed@wkf.local',
      password: randomUUID(),
      roles: [editorRole.id],
    },
    overrideAccess: true,
  })
}

async function findOrCreateMedia(seedPost: SeedPost, author: User): Promise<Media> {
  const filename = path.basename(seedPost.imagePath)
  const existingMedia = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { filename: { equals: filename } },
  })

  if (existingMedia.docs[0]) {
    if (process.env.SEED_REFRESH_MEDIA !== 'true') {
      return existingMedia.docs[0]
    }

    return payload.update({
      collection: 'media',
      id: existingMedia.docs[0].id,
      data: {
        alt: seedPost.imageAlt,
        uploadedBy: author.id,
      },
      filePath: path.resolve(seedPost.imagePath),
      overrideAccess: true,
    })
  }

  return payload.create({
    collection: 'media',
    data: {
      alt: seedPost.imageAlt,
      uploadedBy: author.id,
    },
    filePath: path.resolve(seedPost.imagePath),
    overrideAccess: true,
  })
}

async function findOrCreateSiteLogo(author: User): Promise<Media> {
  const existingMedia = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { filename: { equals: 'logo-color.webp' } },
  })

  if (existingMedia.docs[0]) {
    return existingMedia.docs[0]
  }

  return payload.create({
    collection: 'media',
    data: {
      alt: 'Logo Wrocławskiego Klubu Fantastyki',
      uploadedBy: author.id,
    },
    filePath: path.resolve('public/assets/logo-color.webp'),
    overrideAccess: true,
  })
}

async function ensurePost(seedPost: SeedPost, author: User, media: Media): Promise<void> {
  const existingPosts = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: seedPost.slug } },
  })

  if (existingPosts.docs[0]) {
    return
  }

  await payload.create({
    collection: 'posts',
    data: {
      _status: 'published',
      author: author.id,
      layout: [createRichTextBlock(seedPost.paragraphs)],
      excerpt: seedPost.excerpt,
      heroImage: media.id,
      publishedAt: seedPost.publishedAt,
      slug: seedPost.slug,
      title: seedPost.title,
    },
    overrideAccess: true,
  })
}

async function ensureAboutPage(author: User): Promise<Page> {
  const existingPages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: 'o-nas' } },
  })

  if (existingPages.docs[0]) {
    return existingPages.docs[0]
  }

  return payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      author: author.id,
      layout: [
        createRichTextBlock([
          'Wrocławski Klub Fantastyki to społeczność osób, które łączy wyobraźnia oraz zamiłowanie do gier fabularnych, literatury i planszówek.',
          'Spotykamy się, żeby grać, rozmawiać o fantastyce, dzielić się wiedzą i wspólnie tworzyć nowe przygody.',
        ]),
      ],
      publishedAt: '2026-05-01T10:00:00.000Z',
      slug: 'o-nas',
      title: 'O nas',
    },
    overrideAccess: true,
  })
}

async function ensureJoinPage(author: User): Promise<Page> {
  const existingPages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: 'dolacz-do-nas' } },
  })

  if (existingPages.docs[0]) {
    return existingPages.docs[0]
  }

  return payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      author: author.id,
      layout: [
        {
          blockType: 'sectionGroup',
          frame: 'outline',
          sections: [
            {
              blocks: [
                {
                  blockType: 'columnLayout',
                  columnSeparators: 'none',
                  columns: [
                    {
                      blocks: [
                        {
                          blockType: 'heading',
                          heading: 'Dołącz i współtwórz WKF',
                          headingLevel: 'h2',
                        },
                        createRichTextBlock(
                          [
                            'Czujesz się częścią fandomu i chcesz mieć wpływ na to, co dzieje się w Klubie? Napisz do nas i poznaj zasady członkostwa.',
                          ],
                          'lead',
                        ),
                      ],
                      surface: 'transparent',
                      width: 7,
                    },
                    {
                      blocks: [
                        {
                          blockType: 'heading',
                          heading: 'Szczególnie zapraszamy osoby, które chcą działać',
                          headingIconName: 'users',
                          headingLevel: 'h2',
                        },
                        createRichTextBlock([
                          'Szczególnie zależy nam na osobach chętnych do organizowania wydarzeń i innych działań — dla członków Klubu i nie tylko. Nie jest to jednak formalny warunek członkostwa.',
                        ]),
                      ],
                      surface: 'subtle',
                      width: 5,
                    },
                  ],
                  verticalAlignment: 'center',
                },
              ],
              surface: 'transparent',
            },
            {
              blocks: [
                {
                  blockType: 'columnLayout',
                  columnSeparators: 'between',
                  columns: [
                    {
                      blocks: [
                        {
                          blockType: 'heading',
                          heading: 'Kto może dołączyć?',
                          headingLevel: 'h2',
                        },
                        createRichTextBlock([
                          'Do Klubu zapraszamy każdą osobę, która czuje się częścią fandomu, chce należeć do klubu fantastyki i mieć wpływ na jego działalność.',
                        ]),
                      ],
                      surface: 'transparent',
                      width: 7,
                    },
                    {
                      blocks: [
                        createRichTextBlock(
                          [
                            'Osoby poniżej 16. roku życia potrzebują pisemnej zgody rodzica lub opiekuna prawnego.',
                          ],
                          'note',
                        ),
                      ],
                      surface: 'transparent',
                      width: 5,
                    },
                  ],
                  verticalAlignment: 'center',
                },
              ],
              surface: 'inverse',
            },
            {
              blocks: [
                {
                  blockType: 'heading',
                  heading: 'Jak wygląda dołączenie?',
                  headingLevel: 'h2',
                },
                {
                  blockType: 'columnLayout',
                  columnSeparators: 'none',
                  columns: [
                    {
                      blocks: [
                        {
                          blockType: 'heading',
                          heading: 'Napisz do nas',
                          headingIconName: 'mail',
                          headingLevel: 'h3',
                        },
                        createRichTextBlock([
                          'Opowiedz krótko, czym się interesujesz oraz jakie wydarzenia lub działania chcesz współtworzyć.',
                        ]),
                      ],
                      surface: 'transparent',
                      width: 4,
                    },
                    {
                      blocks: [
                        {
                          blockType: 'heading',
                          heading: 'Poznaj szczegóły',
                          headingIconName: 'time',
                          headingLevel: 'h3',
                        },
                        createRichTextBlock([
                          'Odpowiemy w ciągu kilku dni. Przekażemy bieżące informacje o deklaracji członkowskiej i składce oraz odpowiemy na pytania.',
                        ]),
                      ],
                      surface: 'transparent',
                      width: 4,
                    },
                    {
                      blocks: [
                        {
                          blockType: 'heading',
                          heading: 'Złóż deklarację',
                          headingIconName: 'document',
                          headingLevel: 'h3',
                        },
                        createRichTextBlock([
                          'Członkostwo nadaje Zarząd uchwałą po złożeniu pisemnej deklaracji. Wysokość składki ustala Walne Zgromadzenie.',
                        ]),
                      ],
                      surface: 'transparent',
                      width: 4,
                    },
                  ],
                  verticalAlignment: 'start',
                },
              ],
              surface: 'transparent',
            },
            {
              blocks: [
                {
                  blockType: 'columnLayout',
                  columnSeparators: 'none',
                  columns: [
                    {
                      blocks: [
                        {
                          blockType: 'heading',
                          heading: 'Gotowa lub gotowy, żeby zacząć?',
                          headingLevel: 'h2',
                        },
                        createRichTextBlock([
                          'Napisz do nas. Przygotowaliśmy treść wiadomości, którą możesz swobodnie zmienić przed wysłaniem.',
                        ]),
                      ],
                      surface: 'transparent',
                      width: 7,
                    },
                    {
                      blocks: [
                        {
                          alignment: 'start',
                          blockType: 'actionLinks',
                          items: [
                            {
                              appearance: 'primaryButton',
                              emailBody:
                                'Dzień dobry,\n\nchcę dowiedzieć się więcej o dołączeniu do WKF.\n\nInteresuję się:\n[uzupełnij]\n\nChcę włączyć się w:\n[uzupełnij]\n\nMam pytanie:\n[opcjonalnie]\n\nPozdrawiam',
                              emailSubject: 'Chcę dołączyć do WKF',
                              iconName: 'mail',
                              label: 'Napisz, że chcesz dołączyć',
                              targetType: 'siteContactEmail',
                            },
                            {
                              appearance: 'secondaryButton',
                              customAddress: 'dokumenty/statut-wroclawskiego-klubu-fantastyki',
                              customScheme: 'path',
                              iconName: 'document',
                              label: 'Sprawdź zasady w Statucie',
                              targetType: 'custom',
                            },
                          ],
                          layout: 'stacked',
                        },
                      ],
                      surface: 'transparent',
                      width: 5,
                    },
                  ],
                  verticalAlignment: 'center',
                },
              ],
              surface: 'subtle',
            },
          ],
          surface: 'default',
        },
      ],
      listingExcerpt:
        'Dowiedz się, kto może dołączyć do WKF, jak wygląda przyjęcie do Klubu i jak zacząć działać.',
      publishedAt: '2026-10-01T10:00:00.000Z',
      slug: 'dolacz-do-nas',
      title: 'Dołącz do nas',
    },
    overrideAccess: true,
  })
}

async function ensureBlogPage(author: User): Promise<Page> {
  const existingPages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      or: [{ systemKey: { equals: 'blog' } }, { slug: { equals: 'blog' } }],
    },
  })
  const existingPage = existingPages.docs[0]

  if (existingPage) {
    if (existingPage.systemKey === 'blog') {
      return existingPage
    }

    return payload.update({
      collection: 'pages',
      context: { allowSystemPageMutation: true },
      id: existingPage.id,
      data: { systemKey: 'blog' },
      overrideAccess: true,
    })
  }

  return payload.create({
    collection: 'pages',
    context: { allowSystemPageMutation: true },
    data: {
      _status: 'published',
      author: author.id,
      layout: [
        createRichTextBlock([
          'Artykuły, aktualności i relacje z życia Wrocławskiego Klubu Fantastyki.',
        ]),
        {
          blockType: 'listing',
          pageSize: 12,
          pagination: true,
          parentFilter: 'none',
          sort: 'newest',
          sources: ['posts'],
          view: 'cards',
        },
      ],
      publishedAt: new Date().toISOString(),
      slug: 'blog',
      systemKey: 'blog',
      title: 'Blog',
    },
    overrideAccess: true,
  })
}

async function ensureNavigation(
  aboutPage: Page,
  blogPage: Page,
  joinPage: Page,
  logo: Media,
  author: User,
): Promise<void> {
  const navigation = await payload.findGlobal({
    slug: 'navigation',
    depth: 0,
    overrideAccess: true,
  })

  const headerItems: NonNullable<Navigation['headerItems']> = [
    {
      appearance: 'link',
      label: 'Aktualności',
      page: blogPage.id,
      targetType: 'page',
    },
    {
      appearance: 'link',
      label: 'O nas',
      page: aboutPage.id,
      targetType: 'page',
    },
    {
      appearance: 'secondaryButton',
      label: 'Dołącz',
      page: joinPage.id,
      targetType: 'page',
    },
  ]

  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      headerItems: navigation.headerItems?.length ? navigation.headerItems : headerItems,
      logo: navigation.logo || logo.id,
    },
    overrideAccess: true,
    user: author,
  })
}

async function ensureHomepageGroups(author: User, backgroundImage?: Media): Promise<void> {
  const homepageSections = await payload.findGlobal({
    slug: 'homepage-sections',
    depth: 0,
    overrideAccess: true,
  })

  if (homepageSections.groups?.length) {
    return
  }

  await payload.updateGlobal({
    slug: 'homepage-sections',
    data: {
      groups: [
        {
          backgroundImage: backgroundImage?.id,
          name: 'RPG',
        },
      ],
    } satisfies Partial<HomepageSection>,
    overrideAccess: true,
    user: author,
  })
}

try {
  const author = await findOrCreateAuthor()
  let rpgBackgroundImage: Media | undefined

  for (const seedPost of seedPosts) {
    const media = await findOrCreateMedia(seedPost, author)
    await ensurePost(seedPost, author, media)

    if (seedPost.slug === 'wiesci-z-klubu') {
      rpgBackgroundImage = media
    }
  }

  const aboutPage = await ensureAboutPage(author)
  const blogPage = await ensureBlogPage(author)
  const joinPage = await ensureJoinPage(author)
  const siteLogo = await findOrCreateSiteLogo(author)
  await ensureNavigation(aboutPage, blogPage, joinPage, siteLogo, author)
  await ensureHomepageGroups(author, rpgBackgroundImage)

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      contactEmail: 'kontakt@wkf.wroclaw.pl',
      siteDescription: 'Klub ludzi z wyobraźnią',
      siteName: 'Wrocławski Klub Fantastyki',
    },
    user: author,
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      copyright: createLexicalDocument(['© 2026 Wrocławski Klub Fantastyki']),
    },
    overrideAccess: true,
    user: author,
  })

  payload.logger.info(
    'Seed completed: homepage settings, navigation, pages, onboarding composition, posts and groups',
  )
} finally {
  await payload.destroy()
}

process.exit(0)
