import { DefaultTemplate, type DefaultTemplateProps } from '@payloadcms/next/templates'
import type { AdminViewServerProps } from 'payload'

type AdminViewTemplateProperties = Pick<
  DefaultTemplateProps,
  | 'children'
  | 'className'
  | 'collectionSlug'
  | 'docID'
  | 'documentSubViewType'
  | 'user'
  | 'viewType'
> &
  Pick<AdminViewServerProps, 'initPageResult' | 'params' | 'searchParams' | 'viewActions'>

export function AdminViewTemplate({
  children,
  className,
  collectionSlug,
  docID,
  documentSubViewType,
  initPageResult,
  params,
  searchParams,
  user,
  viewActions,
  viewType,
}: AdminViewTemplateProperties) {
  const { permissions, req, visibleEntities } = initPageResult
  const { payload } = req

  return (
    <DefaultTemplate
      className={className}
      collectionSlug={collectionSlug}
      docID={docID}
      documentSubViewType={documentSubViewType}
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={payload}
      permissions={permissions}
      req={req}
      searchParams={searchParams}
      user={user ?? req.user ?? undefined}
      viewActions={viewActions}
      viewType={viewType}
      visibleEntities={{
        collections: visibleEntities.collections,
        globals: visibleEntities.globals,
      }}
    >
      {children}
    </DefaultTemplate>
  )
}
