targetScope = 'resourceGroup'

param deploymentPrincipalId string
param roleAssignmentName string = ''

var contributorRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'b24988ac-6180-42a0-ab88-20f7382dd24c')
var resolvedRoleAssignmentName = empty(roleAssignmentName) ? guid(resourceGroup().id, deploymentPrincipalId, contributorRoleDefinitionId) : roleAssignmentName

resource deploymentContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: resolvedRoleAssignmentName
  properties: {
    principalId: deploymentPrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: contributorRoleDefinitionId
  }
}
