param accountName string
param allowSharedKeyAccess bool = true
param allowedSubnetId string = ''
param containerName string = 'media'
param enableProductionProtection bool = false
param enableStagingCheckpoints bool
param location string
param skuName string = 'Standard_LRS'
param tags object

var checkpointContainerName = 'staging-checkpoints'
var softDeleteRetentionDays = enableProductionProtection ? 30 : 14

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: accountName
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: skuName
  }
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: allowSharedKeyAccess
    minimumTlsVersion: 'TLS1_2'
    networkAcls: allowedSubnetId != '' ? {
      bypass: 'None'
      defaultAction: 'Deny'
      virtualNetworkRules: [
        {
          action: 'Allow'
          id: allowedSubnetId
          state: 'Succeeded'
        }
      ]
    } : {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    containerDeleteRetentionPolicy: {
      days: softDeleteRetentionDays
      enabled: enableStagingCheckpoints || enableProductionProtection
    }
    deleteRetentionPolicy: {
      allowPermanentDelete: false
      days: softDeleteRetentionDays
      enabled: enableStagingCheckpoints || enableProductionProtection
    }
    isVersioningEnabled: enableStagingCheckpoints || enableProductionProtection
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

resource lifecyclePolicy 'Microsoft.Storage/storageAccounts/managementPolicies@2023-05-01' = if (enableStagingCheckpoints || enableProductionProtection) {
  parent: storageAccount
  name: 'default'
  properties: {
    policy: {
      rules: concat(enableProductionProtection ? [
        {
          definition: {
            actions: {
              version: {
                delete: {
                  daysAfterCreationGreaterThan: 90
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
          name: 'delete-production-blob-versions-after-90-days'
          type: 'Lifecycle'
        }
      ] : [], enableStagingCheckpoints ? [
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
      ] : [])
    }
  }
}

output accountBaseUrl string = 'https://${storageAccount.name}.blob.${environment().suffixes.storage}'
output accountId string = storageAccount.id
output accountName string = storageAccount.name

@secure()
output connectionString string = allowSharedKeyAccess ? 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${storageAccount.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}' : ''

output containerId string = mediaContainer.id
output containerName string = mediaContainer.name
output checkpointContainerName string = enableStagingCheckpoints ? checkpointContainer.name : ''
