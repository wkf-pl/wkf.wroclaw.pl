targetScope = 'resourceGroup'

@secure()
param administratorDatabaseUrl string

param containerAppEnvironmentId string
param imageReference string
param jobName string = 'wkf-prod-bootstrap'
param location string = 'polandcentral'

@secure()
param migratorPassword string

param registryIdentityId string
param registryServer string

@secure()
param runtimePassword string

param tags object = {
  application: 'wkf-online'
  environment: 'prod'
  lifecycle: 'bootstrap-only'
}

resource bootstrapJob 'Microsoft.App/jobs@2024-03-01' = {
  name: jobName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${registryIdentityId}': {}
    }
  }
  properties: {
    environmentId: containerAppEnvironmentId
    configuration: {
      manualTriggerConfig: {
        parallelism: 1
        replicaCompletionCount: 1
      }
      registries: [
        {
          identity: registryIdentityId
          server: registryServer
        }
      ]
      replicaRetryLimit: 0
      replicaTimeout: 900
      secrets: [
        {
          name: 'administrator-database-url'
          value: administratorDatabaseUrl
        }
        {
          name: 'migrator-password'
          value: migratorPassword
        }
        {
          name: 'runtime-password'
          value: runtimePassword
        }
      ]
      triggerType: 'Manual'
    }
    template: {
      containers: [
        {
          name: 'bootstrap'
          image: imageReference
          args: [
            '/opt/wkf/bootstrap-postgres-roles.sh'
          ]
          env: [
            {
              name: 'POSTGRES_ADMIN_URL'
              secretRef: 'administrator-database-url'
            }
            {
              name: 'POSTGRES_MIGRATOR_PASSWORD'
              secretRef: 'migrator-password'
            }
            {
              name: 'POSTGRES_RUNTIME_PASSWORD'
              secretRef: 'runtime-password'
            }
          ]
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
    }
  }
}

output name string = bootstrapJob.name
