param environmentName string
param infrastructureSubnetId string = ''
param location string
param logAnalyticsCustomerId string

@secure()
param logAnalyticsSharedKey string

param tags object

var baseProperties = {
  appLogsConfiguration: {
    destination: 'log-analytics'
    logAnalyticsConfiguration: {
      customerId: logAnalyticsCustomerId
      sharedKey: logAnalyticsSharedKey
    }
  }
  zoneRedundant: false
}

resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  tags: tags
  properties: union(baseProperties, infrastructureSubnetId != '' ? {
    vnetConfiguration: {
      infrastructureSubnetId: infrastructureSubnetId
      internal: false
    }
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
  } : {})
}

output defaultDomain string = containerAppEnvironment.properties.defaultDomain
output id string = containerAppEnvironment.id
