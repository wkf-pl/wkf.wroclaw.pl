import type { RelationshipFieldServerProps } from 'payload'

import { getContentAuthorReference } from '@/modules/content/content-author'
import { isAdministrator } from '@/modules/membership/role-access'

import { UserRelationshipField } from './UserRelationshipField'

export async function ContentAuthorField({
  clientField,
  operation,
  path,
  readOnly,
  req,
  value,
}: RelationshipFieldServerProps) {
  const groupOwned =
    operation === 'update' && getContentAuthorReference(value)?.relationTo === 'user-groups'
  return (
    <UserRelationshipField
      defaultToCurrentUser={operation === 'create'}
      field={clientField}
      path={path}
      readOnly={readOnly || (groupOwned && !(await isAdministrator(req)))}
    />
  )
}
