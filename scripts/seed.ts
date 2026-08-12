import { randomUUID } from 'node:crypto'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '../src/payload.config'
import type { Media, Page, Post, User } from '../src/payload-types'

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

function createLexicalDocument(paragraphs: string[]): Post['content'] {
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
      content: createLexicalDocument(seedPost.paragraphs),
      excerpt: seedPost.excerpt,
      heroImage: media.id,
      publishedAt: seedPost.publishedAt,
      slug: seedPost.slug,
      title: seedPost.title,
    },
    overrideAccess: true,
  })
}

async function ensureAboutPage(author: User): Promise<void> {
  const existingPages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: 'o-nas' } },
  })

  if (existingPages.docs[0]) {
    return
  }

  await payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      author: author.id,
      content: createLexicalDocument([
        'Wrocławski Klub Fantastyki to społeczność osób, które łączy wyobraźnia oraz zamiłowanie do gier fabularnych, literatury i planszówek.',
        'Spotykamy się, żeby grać, rozmawiać o fantastyce, dzielić się wiedzą i wspólnie tworzyć nowe przygody.',
      ]) as Page['content'],
      publishedAt: '2026-05-01T10:00:00.000Z',
      slug: 'o-nas',
      title: 'O nas',
    },
    overrideAccess: true,
  })
}

const author = await findOrCreateAuthor()

for (const seedPost of seedPosts) {
  const media = await findOrCreateMedia(seedPost, author)
  await ensurePost(seedPost, author, media)
}

await ensureAboutPage(author)

await payload.updateGlobal({
  slug: 'site-settings',
  data: {
    siteDescription: 'Klub ludzi z wyobraźnią',
    siteName: 'Wrocławski Klub Fantastyki',
  },
})

payload.logger.info('Seed completed: site settings, about page and three published posts')
