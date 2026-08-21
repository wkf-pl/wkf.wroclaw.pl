import { randomUUID } from 'node:crypto'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../src/payload.config'
import type {
  ClubSection,
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
      layout: [{ blockType: 'richText', content: createLexicalDocument(seedPost.paragraphs) }],
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
        {
          blockType: 'richText',
          content: createLexicalDocument([
            'Wrocławski Klub Fantastyki to społeczność osób, które łączy wyobraźnia oraz zamiłowanie do gier fabularnych, literatury i planszówek.',
            'Spotykamy się, żeby grać, rozmawiać o fantastyce, dzielić się wiedzą i wspólnie tworzyć nowe przygody.',
          ]),
        },
      ],
      publishedAt: '2026-05-01T10:00:00.000Z',
      slug: 'o-nas',
      title: 'O nas',
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
        {
          blockType: 'richText',
          content: createLexicalDocument([
            'Artykuły, aktualności i relacje z życia Wrocławskiego Klubu Fantastyki.',
          ]),
        },
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

async function ensureClubSection({
  backgroundImage,
  displayOrder,
  name,
  status,
}: {
  backgroundImage?: Media
  displayOrder: number
  name: string
  status: NonNullable<ClubSection['_status']>
}): Promise<void> {
  const slug = name.toLocaleLowerCase('pl')
  const existingSections = await payload.find({
    collection: 'club-sections',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  if (existingSections.docs[0]) {
    return
  }

  await payload.create({
    collection: 'club-sections',
    data: {
      _status: status,
      backgroundImage: backgroundImage?.id,
      displayOrder,
      name,
      slug,
    },
    draft: status === 'draft',
    overrideAccess: true,
  })
}

async function ensureNavigation(aboutPage: Page, blogPage: Page): Promise<void> {
  const navigation = await payload.findGlobal({
    slug: 'navigation',
    depth: 0,
    overrideAccess: true,
  })

  if (navigation.headerItems?.length) {
    return
  }

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
  ]

  await payload.updateGlobal({
    slug: 'navigation',
    data: { headerItems },
    overrideAccess: true,
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
  await ensureNavigation(aboutPage, blogPage)
  await ensureClubSection({
    backgroundImage: rpgBackgroundImage,
    displayOrder: 10,
    name: 'RPG',
    status: 'published',
  })
  await ensureClubSection({
    displayOrder: 20,
    name: 'LARP',
    status: 'draft',
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteDescription: 'Klub ludzi z wyobraźnią',
      siteName: 'Wrocławski Klub Fantastyki',
    },
  })

  payload.logger.info('Seed completed: site settings, navigation, pages, posts and club sections')
} finally {
  await payload.destroy()
}

process.exit(0)
