targetScope = 'resourceGroup'

param operationsIdentityPrincipalId string

var storageBlobDataReaderRoleDefinitionId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1')

resource stagingStorageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: 'wkfstaging${uniqueString(resourceGroup().id)}'
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' existing = {
  parent: stagingStorageAccount
  name: 'default'
}

resource checkpointContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' existing = {
  parent: blobService
  name: 'staging-checkpoints'
}

resource operationsCheckpointReader 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(checkpointContainer.id, operationsIdentityPrincipalId, storageBlobDataReaderRoleDefinitionId)
  scope: checkpointContainer
  properties: {
    principalId: operationsIdentityPrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: storageBlobDataReaderRoleDefinitionId
  }
}
