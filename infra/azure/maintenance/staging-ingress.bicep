targetScope = 'resourceGroup'

param location string = resourceGroup().location
param applicationName string
param environmentId string
param originHost string
param registryServer string
param registryIdentityId string
param imageReference string

@allowed(['0', '1'])
param maintenanceEnabled string = '0'

resource ingress 'Microsoft.App/containerApps@2024-03-01' = {
  name: '${applicationName}-ingress'
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${registryIdentityId}': {}
    }
  }
  properties: {
    environmentId: environmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        allowInsecure: false
        targetPort: 8080
        transport: 'auto'
      }
      registries: [
        {
          server: registryServer
          identity: registryIdentityId
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'ingress'
          image: imageReference
          env: [
            { name: 'ORIGIN_HOST', value: originHost }
            { name: 'MAINTENANCE_ENABLED', value: maintenanceEnabled }
          ]
          resources: { cpu: json('0.25'), memory: '0.5Gi' }
          probes: [
            {
              type: 'Readiness'
              httpGet: { path: '/_ingress/ready', port: 8080 }
            }
          ]
        }
      ]
      scale: { minReplicas: 0, maxReplicas: 2 }
    }
  }
}

output url string = 'https://${ingress.properties.configuration.ingress.fqdn}'
