import {
  DefaultEditView,
  DocumentInfoProvider,
  EditDepthProvider,
  HydrateAuthProvider,
  LivePreviewProvider,
} from '@payloadcms/ui'
import { buildFormState } from '@payloadcms/ui/utilities/buildFormState'
import { DocumentHeader } from '@payloadcms/next/rsc'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { notFound, redirect } from 'next/navigation'
import type { AdminViewServerProps, SanitizedCollectionPermission } from 'payload'
import { formatAdminURL } from 'payload/shared'

import type { MemberProfile } from '@/payload-types'
import { getUserIdentity } from '@/modules/membership/role-permissions'

import { MemberProfilePublicationStatusSync } from './MemberProfilePublicationStatusSync'

async function findOwnedProfile({
  ownerID,
  payload,
  req,
}: {
  ownerID: number
  payload: AdminViewServerProps['payload']
  req: AdminViewServerProps['initPageResult']['req']
}) {
  const result = await payload.find({
    collection: 'member-profiles',
    depth: 1,
    draft: true,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: { owner: { equals: ownerID } },
  })

  return result.docs[0] ?? null
}

async function ensureOwnedProfile(properties: {
  ownerID: number
  payload: AdminViewServerProps['payload']
  req: AdminViewServerProps['initPageResult']['req']
  userName: string
}) {
  const existingProfile = await findOwnedProfile(properties)
  if (existingProfile) {
    return existingProfile
  }

  try {
    return await properties.payload.create({
      collection: 'member-profiles',
      data: {
        owner: properties.ownerID,
        publicName: properties.userName,
        slug: 'generated-by-hook',
      },
      depth: 1,
      draft: true,
      overrideAccess: true,
      req: properties.req,
    })
  } catch (error: unknown) {
    const concurrentlyCreatedProfile = await findOwnedProfile(properties)
    if (concurrentlyCreatedProfile) {
      return concurrentlyCreatedProfile
    }

    throw error
  }
}

export async function MemberProfileView({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  const { permissions, req } = initPageResult
  const { payload, user } = req
  const ownerID = getUserIdentity(user)
  const isMember = Boolean(
    user?.roles?.some((role) => typeof role === 'object' && role !== null && role.key === 'member'),
  )

  if (!user || typeof ownerID !== 'number' || !isMember) {
    redirect('/admin/account')
  }

  const collectionConfig = payload.collections['member-profiles']?.config
  if (!collectionConfig) {
    notFound()
  }

  const userName = user.displayName?.trim() || user.email
  const profile = (await ensureOwnedProfile({ ownerID, payload, req, userName })) as MemberProfile
  const docPermissions: SanitizedCollectionPermission = permissions.collections?.[
    'member-profiles'
  ] ?? {
    create: true,
    fields: true,
    read: true,
    readVersions: true,
    update: true,
  }
  const [{ state: formState }, versions] = await Promise.all([
    buildFormState({
      id: profile.id,
      collectionSlug: 'member-profiles',
      data: profile,
      docPermissions,
      docPreferences: { fields: {} },
      fallbackLocale: false,
      locale: initPageResult.locale?.code,
      operation: 'update',
      readOnly: false,
      renderAllFields: true,
      req,
      schemaPath: 'member-profiles',
      skipValidation: true,
    }),
    payload.findVersions({
      collection: 'member-profiles',
      limit: 100,
      overrideAccess: true,
      pagination: false,
      req,
      where: { parent: { equals: profile.id } },
    }),
  ])
  const hasPublishedDoc = profile._status === 'published'
  const unpublishedVersionCount = versions.docs.filter(
    (version) => version.version._status === 'draft',
  ).length
  const apiURL = formatAdminURL({
    apiRoute: payload.config.routes.api,
    path: `/member-profiles/${profile.id}?draft=true`,
  })

  const document = (
    <DocumentInfoProvider
      apiURL={apiURL}
      collectionSlug="member-profiles"
      currentEditor={user}
      docPermissions={docPermissions}
      hasDeletePermission={false}
      hasPublishedDoc={hasPublishedDoc}
      hasPublishPermission
      hasSavePermission
      hasTrashPermission={false}
      id={profile.id}
      initialData={profile}
      initialState={formState}
      isEditing
      isLocked={false}
      lastUpdateTime={new Date(profile.updatedAt).getTime()}
      mostRecentVersionIsAutosaved={false}
      redirectAfterCreate={false}
      redirectAfterDelete={false}
      redirectAfterDuplicate={false}
      redirectAfterRestore={false}
      unpublishedVersionCount={unpublishedVersionCount}
      versionCount={versions.totalDocs}
    >
      <MemberProfilePublicationStatusSync />
      <LivePreviewProvider
        isLivePreviewEnabled={false}
        isLivePreviewing={false}
        isPreviewEnabled={false}
        url=""
      >
        <DocumentHeader
          collectionConfig={collectionConfig}
          hideTabs
          permissions={permissions}
          req={req}
        />
        <HydrateAuthProvider permissions={permissions} />
        <EditDepthProvider>
          <DefaultEditView
            documentSubViewType="default"
            formState={formState}
            viewType="document"
          />
        </EditDepthProvider>
      </LivePreviewProvider>
    </DocumentInfoProvider>
  )

  return (
    <DefaultTemplate
      className="member-profile-account"
      collectionSlug="member-profiles"
      docID={profile.id}
      documentSubViewType="default"
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={user}
      viewActions={[]}
      viewType="document"
      visibleEntities={initPageResult.visibleEntities}
    >
      {document}
    </DefaultTemplate>
  )
}
