targetScope = 'subscription'

@description('Azure region used by shared resources.')
param location string = 'westeurope'

@description('Short prefix used in Azure resource names.')
param resourcePrefix string = 'wkf'

var sharedResourceGroupName = '${resourcePrefix}-shared'
var registryName = '${resourcePrefix}${uniqueString(subscription().id)}'

resource sharedResourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: sharedResourceGroupName
  location: location
  tags: {
    application: 'wkf-online'
    environment: 'shared'
  }
}

module registry './modules/registry.bicep' = {
  name: 'registry'
  scope: sharedResourceGroup
  params: {
    location: location
    registryName: registryName
    tags: sharedResourceGroup.tags
  }
}

output registryLoginServer string = registry.outputs.loginServer
output registryName string = registryName
output resourceGroupName string = sharedResourceGroupName
