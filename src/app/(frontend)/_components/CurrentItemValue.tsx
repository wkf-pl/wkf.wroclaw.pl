import type { ComponentProps } from 'react'
import Link from 'next/link'

import { CmsRichText } from '@/components/CmsRichText'
import { findPublicCategoryByID } from '@/modules/content/public-content'
import { findPublicContent, type ContentListingSource } from '@/modules/content/content-listing'
import { WARSAW_TIME_ZONE } from '@/modules/events/constants'
import { getMemberProfileImageURL } from '@/modules/members/member-profile-image'
import { resolvePresentedLinks } from '@/modules/navigation/links'
import type { CurrentItemFieldSource } from '@/modules/page-templates/current-item-fields'
import type { Category, Event, EventCycle, MemberProfile, Tag } from '@/payload-types'

import { ActionLinksList } from './ActionLinksList'
import { getContentHeroImage } from './ContentHero'
import { ContentLayoutRenderer } from './ContentLayoutRenderer'
import {
  CurrentItemList,
  CurrentItemText,
  getCurrentItemTextClassName,
} from './CurrentItemPresentation'
import { TaxonomyLinks } from './TaxonomyLinks'

type CurrentItemValueProperties = Pick<
  ComponentProps<typeof ContentLayoutRenderer>,
  'currentTarget' | 'document' | 'pathname' | 'searchParams'
> & {
  fieldKey: string
  source: CurrentItemFieldSource
  variant: string
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: WARSAW_TIME_ZONE,
})

export function CurrentItemValue({
  currentTarget,
  document,
  fieldKey,
  pathname,
  searchParams,
  source,
  variant,
}: CurrentItemValueProperties) {
  const value = fieldKey.split('.').reduce<unknown>((parent, segment) => {
    return parent && typeof parent === 'object' && Object.hasOwn(parent, segment)
      ? (parent as Record<string, unknown>)[segment]
      : undefined
  }, document)

  switch (source.kind) {
    case 'join': {
      if (currentTarget?.relationTo !== 'categories' && currentTarget?.relationTo !== 'tags')
        return null
      return (
        <RelatedContent collection={source.collection} target={currentTarget} variant={variant} />
      )
    }
    case 'image':
    case 'photo': {
      const image =
        source.kind === 'image'
          ? getContentHeroImage(value as Event['heroImage'])
          : value && typeof value === 'object'
            ? {
                alt: `Zdjęcie profilowe: ${(document as MemberProfile).publicName}`,
                src: getMemberProfileImageURL(document as MemberProfile, 'profile'),
                width: 512,
                height: 512,
              }
            : undefined
      return image ? (
        // eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host.
        <img alt={image.alt} height={image.height} src={image.src} width={image.width} />
      ) : null
    }
    case 'layout':
      return Array.isArray(value) && value.length ? (
        <ContentLayoutRenderer
          currentTarget={currentTarget}
          document={document}
          layout={value as Event['layout']}
          layoutPath={fieldKey}
          pathname={pathname}
          searchParams={searchParams}
        />
      ) : null
    case 'richText':
      return value ? (
        <CmsRichText
          className={getCurrentItemTextClassName(variant)}
          data={value as Event['excerpt']}
        />
      ) : null
    case 'date': {
      const date = typeof value === 'string' ? new Date(value) : null
      if (!date || !Number.isFinite(date.valueOf())) return null
      return (
        <p className={getCurrentItemTextClassName(variant)}>
          <time dateTime={date.toISOString()}>{dateFormatter.format(date)}</time>
        </p>
      )
    }
    case 'author':
    case 'name': {
      const related = value as { displayName?: string; name?: string } | null
      return (
        <CurrentItemText
          text={source.kind === 'author' ? related?.displayName : related?.name}
          variant={variant}
        />
      )
    }
    case 'cycle': {
      const cycle = typeof value === 'object' ? (value as EventCycle | null) : null
      return cycle?._status === 'published' && !cycle.deletedAt ? (
        <Link
          className={getCurrentItemTextClassName(variant)}
          href={`/events/series/${cycle.slug}`}
        >
          {cycle.title}
        </Link>
      ) : null
    }
    case 'category':
      return <CategoryLink category={value as Category | number | null | undefined} />
    case 'tags':
      return <TaxonomyLinks tags={value as Tag[] | undefined} />
    case 'breadcrumbs': {
      const breadcrumbs = (value as Category['breadcrumbs'])?.filter(({ label }) => label)
      return breadcrumbs?.length ? (
        <CurrentItemList variant={variant}>
          {breadcrumbs.map(({ label }, index) => (
            <li key={index}>{label}</li>
          ))}
        </CurrentItemList>
      ) : null
    }
    case 'games': {
      const games = value as MemberProfile['games']
      return games?.length ? (
        <CurrentItemList variant={variant}>
          {games.map(({ id, plays, runs, title }, index) => (
            <li key={id ?? index}>
              {title}
              {plays && runs ? ' (gram i prowadzę)' : plays ? ' (gram)' : runs ? ' (prowadzę)' : ''}
            </li>
          ))}
        </CurrentItemList>
      ) : null
    }
    case 'organizers': {
      const organizers = value as Event['organizers']
      return organizers?.length ? (
        <CurrentItemList variant={variant}>
          {organizers.map(({ profile, id, role, responsibilities, contactFor }, index) => (
            <li key={id ?? index}>
              {typeof profile === 'object' ? (
                <Link href={`/members/${profile.slug}`}>{profile.publicName}</Link>
              ) : (
                'Organizator'
              )}
              {role ? ` — ${role}` : ''}
              {responsibilities ? <div>{responsibilities}</div> : null}
              {contactFor ? <div>Kontakt w sprawie: {contactFor}</div> : null}
            </li>
          ))}
        </CurrentItemList>
      ) : null
    }
    case 'links':
      return (
        <ActionLinksList
          items={resolvePresentedLinks(value as Event['externalLinks'])}
          layout={variant === 'inline' ? 'inline' : 'stacked'}
        />
      )
    case 'text':
      return (
        <CurrentItemText
          text={
            typeof value === 'string'
              ? (source.options?.find((option) => option.value === value)?.label ?? value)
              : typeof value === 'number'
                ? value.toLocaleString('pl-PL')
                : undefined
          }
          variant={variant}
        />
      )
  }
}

async function CategoryLink({ category }: { category?: Category | number | null }) {
  const populatedCategory =
    typeof category === 'number' ? await findPublicCategoryByID(category) : category
  return <TaxonomyLinks category={populatedCategory} />
}

async function RelatedContent({
  collection,
  target,
  variant,
}: {
  collection: ContentListingSource
  target: { relationTo: 'categories' | 'tags'; value: number | string }
  variant: string
}) {
  const { items } = await findPublicContent({
    conditions: [
      target.relationTo === 'categories'
        ? { field: 'category', operator: 'equals', relationshipValue: target }
        : { field: 'tag', operator: 'contains', relationshipValue: target },
    ],
    page: 1,
    pageSize: 20,
    pagination: true,
    sort: 'titleAscending',
    sources: [collection],
  })

  return items.length ? (
    <CurrentItemList variant={variant}>
      {items.map(({ document, url }) => (
        <li key={document.id}>
          <Link href={url}>
            {'title' in document
              ? document.title
              : 'name' in document
                ? document.name
                : document.publicName}
          </Link>
        </li>
      ))}
    </CurrentItemList>
  ) : null
}
