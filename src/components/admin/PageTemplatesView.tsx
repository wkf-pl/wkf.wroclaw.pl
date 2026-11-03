import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { userCanPerformResourceOperation } from '@/modules/membership/role-access'

import { AdminViewTemplate } from './AdminViewTemplate'
import { PageTemplatesRegistry } from './PageTemplatesRegistry'

export async function PageTemplatesView({
  initPageResult,
  params,
  searchParams,
  viewActions,
}: AdminViewServerProps) {
  const { req } = initPageResult
  const { payload } = req

  const canReadPageTemplates = await userCanPerformResourceOperation({
    data: {},
    operation: 'read',
    req,
    resource: 'page-templates',
  })

  if (!canReadPageTemplates) {
    redirect(payload.config.routes.admin)
  }

  return (
    <AdminViewTemplate
      className="page-templates-view"
      initPageResult={initPageResult}
      params={params}
      searchParams={searchParams}
      viewActions={viewActions}
      viewType="page-templates"
    >
      <PageTemplatesRegistry />
    </AdminViewTemplate>
  )
}
