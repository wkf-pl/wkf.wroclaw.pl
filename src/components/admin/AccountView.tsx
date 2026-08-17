import { AccountView as DefaultAccountView } from '@payloadcms/next/views'
import { DefaultEditView } from '@payloadcms/ui'
import type { AdminViewServerProps, Data, FormState } from 'payload'

import { AccountProfileButton } from '@/components/admin/AccountProfileButton'

type AccountViewProperties = AdminViewServerProps & {
  doc?: Data
  formState?: FormState
}

export async function AccountView(properties: AccountViewProperties) {
  if (properties.doc) {
    return (
      <DefaultEditView
        BeforeDocumentControls={<AccountProfileButton />}
        documentSubViewType="default"
        formState={properties.formState ?? {}}
        viewType="account"
      />
    )
  }

  return <DefaultAccountView {...properties} />
}
