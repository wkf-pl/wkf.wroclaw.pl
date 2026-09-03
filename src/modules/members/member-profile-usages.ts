import type { Payload } from 'payload'

type MemberProfileUsageArguments = {
  id: number | string
  isPublic: boolean
  payload: Payload
  slug?: null | string
}

export type MemberProfileUsage = {
  adminPath?: string
  label: string
  publicPath?: string
  status?: 'draft' | 'published'
  type: 'catalog' | 'page' | 'profile'
}

export type MemberProfileUsageResolver = (
  arguments_: MemberProfileUsageArguments,
) => MemberProfileUsage[] | Promise<MemberProfileUsage[]>

const resolveApplicationRoutes: MemberProfileUsageResolver = ({ isPublic, slug }) => [
  ...(slug
    ? [
        {
          label: 'Profil publiczny',
          publicPath: `/members/${slug}`,
          type: 'profile' as const,
        },
      ]
    : []),
  ...(isPublic
    ? [
        {
          label: 'Katalog klubowiczów',
          publicPath: '/members',
          type: 'catalog' as const,
        },
      ]
    : []),
]

const resolvePageBlocks: MemberProfileUsageResolver = async ({ id, payload }) => {
  const pages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    select: {
      _status: true,
      slug: true,
      title: true,
    },
    sort: 'title',
    where: {
      // Payload stores leaf blocks from top-level layouts and column layouts in the same
      // block table. The internal path differs, but this relationship path covers both.
      'layout.entries.profile': {
        equals: id,
      },
    },
  })

  return pages.docs.map((page) => ({
    adminPath: `/admin/collections/pages/${page.id}`,
    label: page.title || page.slug || String(page.id),
    publicPath: page._status === 'published' && page.slug ? `/${page.slug}` : undefined,
    status: page._status === 'published' ? 'published' : 'draft',
    type: 'page',
  }))
}

export const memberProfileUsageResolvers: readonly MemberProfileUsageResolver[] = [
  resolveApplicationRoutes,
  resolvePageBlocks,
]

export async function findMemberProfileUsages(
  arguments_: MemberProfileUsageArguments,
): Promise<MemberProfileUsage[]> {
  const usages = await Promise.all(
    memberProfileUsageResolvers.map((resolver) => resolver(arguments_)),
  )
  return usages.flat()
}
