param accountName string
param containerName string = 'media'
param enableStagingCheckpoints bool
param location string
param tags object

var checkpointContainerName = 'staging-checkpoints'
var softDeleteRetentionDays = 14

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: accountName
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: true
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    containerDeleteRetentionPolicy: {
      days: softDeleteRetentionDays
      enabled: enableStagingCheckpoints
    }
    deleteRetentionPolicy: {
      allowPermanentDelete: false
      days: softDeleteRetentionDays
      enabled: enableStagingCheckpoints
    }
    isVersioningEnabled: enableStagingCheckpoints
  }
}

resource mediaContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: containerName
  properties: {
    publicAccess: 'None'
  }
}

resource checkpointContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = if (enableStagingCheckpoints) {
  parent: blobService
  name: checkpointContainerName
  properties: {
    publicAccess: 'None'
  }
}

resource checkpointLifecyclePolicy 'Microsoft.Storage/storageAccounts/managementPolicies@2023-05-01' = if (enableStagingCheckpoints) {
  parent: storageAccount
  name: 'default'
  properties: {
    policy: {
      rules: [
        {
          definition: {
            actions: {
              version: {
                delete: {
                  daysAfterCreationGreaterThan: 14
                }
              }
            }
            filters: {
              blobTypes: [
                'blockBlob'
              ]
            }
          }
          enabled: true
          name: 'delete-old-staging-blob-versions'
          type: 'Lifecycle'
        }
        {
          definition: {
            actions: {
              baseBlob: {
                delete: {
                  daysAfterModificationGreaterThan: 14
                }
              }
            }
            filters: {
              blobTypes: [
                'blockBlob'
              ]
              prefixMatch: [
                '${checkpointContainerName}/rescue-'
              ]
            }
          }
          enabled: true
          name: 'delete-staging-rescue-checkpoints'
          type: 'Lifecycle'
        }
      ]
    }
  }
}

output accountBaseUrl string = 'https://${storageAccount.name}.blob.${environment().suffixes.storage}'

@secure()
output connectionString string = 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'

output containerName string = mediaContainer.name
output checkpointContainerName string = enableStagingCheckpoints ? checkpointContainer.name : ''
