targetScope = 'resourceGroup'

param checkpointName string
param containerAppEnvironmentId string
param expectedSourceSha string
param imageReference string
param importConfirmation string
param jobName string = 'wkf-prod-import'
param location string = 'polandcentral'

@secure()
param migratorDatabaseUrl string

param operationsIdentityClientId string
param operationsIdentityId string
param productionMediaContainerUrl string
param registryIdentityId string
param registryServer string
param stagingCheckpointContainerUrl string
param tags object = {
  application: 'wkf-online'
  environment: 'prod'
  lifecycle: 'ephemeral-operation'
}

resource importJob 'Microsoft.App/jobs@2024-03-01' = {
  name: jobName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${operationsIdentityId}': {}
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
      replicaTimeout: 7200
      secrets: [
        {
          name: 'migrator-database-url'
          value: migratorDatabaseUrl
        }
      ]
      triggerType: 'Manual'
    }
    template: {
      containers: [
        {
          name: 'import'
          image: imageReference
          args: [
            '/opt/wkf/import-production-checkpoint.sh'
          ]
          env: [
            {
              name: 'AZURE_STORAGE_IDENTITY_CLIENT_ID'
              value: operationsIdentityClientId
            }
            {
              name: 'CHECKPOINT_NAME'
              value: checkpointName
            }
            {
              name: 'EXPECTED_SOURCE_SHA'
              value: expectedSourceSha
            }
            {
              name: 'IMPORT_CONFIRMATION'
              value: importConfirmation
            }
            {
              name: 'POSTGRES_MIGRATOR_URL'
              secretRef: 'migrator-database-url'
            }
            {
              name: 'PRODUCTION_MEDIA_CONTAINER_URL'
              value: productionMediaContainerUrl
            }
            {
              name: 'STAGING_CHECKPOINT_CONTAINER_URL'
              value: stagingCheckpointContainerUrl
            }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
    }
  }
}

output name string = importJob.name
