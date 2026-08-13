param environmentName string
param location string
param logAnalyticsCustomerId string

@secure()
param logAnalyticsSharedKey string

param tags object

resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsCustomerId
        sharedKey: logAnalyticsSharedKey
      }
    }
    zoneRedundant: false
  }
}

output defaultDomain string = containerAppEnvironment.properties.defaultDomain
output id string = containerAppEnvironment.id
