targetScope = 'resourceGroup'

param deploymentPrincipalId string
param deploymentPullRoleAssignmentName string = ''
param deploymentReaderRoleAssignmentName string = ''
param operationsIdentityPrincipalId string
param registryIdentityPrincipalId string
param registryPullRoleAssignmentName string = ''
param registryName string

var acrPullRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d')
var readerRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'acdd72a7-3385-48ef-bd42-f606fba81ae7')

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: registryName
}

var resolvedDeploymentPullRoleAssignmentName = empty(deploymentPullRoleAssignmentName) ? guid(registry.id, deploymentPrincipalId, acrPullRoleDefinitionId) : deploymentPullRoleAssignmentName
var resolvedDeploymentReaderRoleAssignmentName = empty(deploymentReaderRoleAssignmentName) ? guid(registry.id, deploymentPrincipalId, readerRoleDefinitionId) : deploymentReaderRoleAssignmentName
var resolvedRegistryPullRoleAssignmentName = empty(registryPullRoleAssignmentName) ? guid(registry.id, registryIdentityPrincipalId, acrPullRoleDefinitionId) : registryPullRoleAssignmentName

resource deploymentRegistryReader 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: resolvedDeploymentReaderRoleAssignmentName
  scope: registry
  properties: {
    principalId: deploymentPrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: readerRoleDefinitionId
  }
}

resource deploymentRegistryPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: resolvedDeploymentPullRoleAssignmentName
  scope: registry
  properties: {
    principalId: deploymentPrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: acrPullRoleDefinitionId
  }
}

resource registryPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: resolvedRegistryPullRoleAssignmentName
  scope: registry
  properties: {
    principalId: registryIdentityPrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: acrPullRoleDefinitionId
  }
}

resource operationsRegistryPull 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, operationsIdentityPrincipalId, acrPullRoleDefinitionId)
  scope: registry
  properties: {
    principalId: operationsIdentityPrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: acrPullRoleDefinitionId
  }
}
