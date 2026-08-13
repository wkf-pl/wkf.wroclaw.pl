param accountBaseUrl string
param containerAppEnvironmentId string
param containerName string
@secure()
param databaseUrl string
param imageReference string
param jobName string
param location string

@secure()
param payloadSecret string

param registryIdentityId string
param registryServer string
param serverUrl string
param smtpFromAddress string
param smtpFromName string
param smtpHost string

@secure()
param smtpPassword string

param smtpPort int
param smtpSecure bool
param smtpSkipVerify bool
param smtpUser string

@secure()
param storageConnectionString string

param tags object

resource migrationJob 'Microsoft.App/jobs@2024-03-01' = {
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
      replicaRetryLimit: 1
      replicaTimeout: 1800
      secrets: [
        {
          name: 'database-url'
          value: databaseUrl
        }
        {
          name: 'payload-secret'
          value: payloadSecret
        }
        {
          name: 'storage-connection-string'
          value: storageConnectionString
        }
        {
          name: 'smtp-password'
          value: smtpPassword
        }
      ]
      triggerType: 'Manual'
    }
    template: {
      containers: [
        {
          name: 'migration'
          image: imageReference
          command: [
            './node_modules/.bin/payload'
          ]
          args: [
            'migrate'
          ]
          env: [
            {
              name: 'AZURE_STORAGE_ACCOUNT_BASE_URL'
              value: accountBaseUrl
            }
            {
              name: 'AZURE_STORAGE_ALLOW_CONTAINER_CREATE'
              value: 'false'
            }
            {
              name: 'AZURE_STORAGE_CONNECTION_STRING'
              secretRef: 'storage-connection-string'
            }
            {
              name: 'AZURE_STORAGE_CONTAINER_NAME'
              value: containerName
            }
            {
              name: 'DATABASE_URL'
              secretRef: 'database-url'
            }
            {
              name: 'PAYLOAD_SECRET'
              secretRef: 'payload-secret'
            }
            {
              name: 'SERVER_URL'
              value: serverUrl
            }
            {
              name: 'SMTP_FROM_ADDRESS'
              value: smtpFromAddress
            }
            {
              name: 'SMTP_FROM_NAME'
              value: smtpFromName
            }
            {
              name: 'SMTP_HOST'
              value: smtpHost
            }
            {
              name: 'SMTP_PASSWORD'
              secretRef: 'smtp-password'
            }
            {
              name: 'SMTP_PORT'
              value: string(smtpPort)
            }
            {
              name: 'SMTP_SECURE'
              value: string(smtpSecure)
            }
            {
              name: 'SMTP_SKIP_VERIFY'
              value: string(smtpSkipVerify)
            }
            {
              name: 'SMTP_USER'
              value: smtpUser
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

output name string = migrationJob.name
