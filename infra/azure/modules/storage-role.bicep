targetScope = 'resourceGroup'

param storageAccountName string
param storageContainerName string
param operationsIdentityPrincipalId string
param storageIdentityPrincipalId string

var storageBlobDataContributorRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'ba92f5b4-2d11-453d-a403-e96b0029c9fe')

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: storageAccountName
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' existing = {
  parent: storageAccount
  name: 'default'
}

resource storageContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' existing = {
  parent: blobService
  name: storageContainerName
}

resource storageBlobContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageContainer.id, storageIdentityPrincipalId, storageBlobDataContributorRoleDefinitionId)
  scope: storageContainer
  properties: {
    principalId: storageIdentityPrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: storageBlobDataContributorRoleDefinitionId
  }
}

resource operationsBlobContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageContainer.id, operationsIdentityPrincipalId, storageBlobDataContributorRoleDefinitionId)
  scope: storageContainer
  properties: {
    principalId: operationsIdentityPrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: storageBlobDataContributorRoleDefinitionId
  }
}
