targetScope = 'resourceGroup'

@description('Azure region used by shared resources.')
param location string = 'polandcentral'

@description('Short prefix used in Azure resource names.')
param resourcePrefix string = 'wkf'

var registryName = '${resourcePrefix}${uniqueString(subscription().id)}'

module registry './modules/registry.bicep' = {
  name: 'registry'
  params: {
    location: location
    registryName: registryName
    tags: {
      application: 'wkf-online'
      environment: 'shared'
    }
  }
}

output registryLoginServer string = registry.outputs.loginServer
output registryName string = registryName
output resourceGroupName string = resourceGroup().name
