targetScope = 'resourceGroup'

param ageRecipient string
param backupName string
param containerAppEnvironmentId string

@secure()
param databaseUrl string

param deployedSourceSha string
param imageReference string
param jobName string = 'wkf-prod-offsite-backup'
param location string = 'polandcentral'
param operationsIdentityClientId string
param operationsIdentityId string
param productionImageReference string
param productionMediaContainerUrl string
param registryIdentityId string
param registryServer string
param sftpHost string

@secure()
param sftpKnownHosts string

param sftpPort int

@secure()
param sftpPrivateKey string

param sftpRemoteRoot string
param sftpUser string
param tags object = {
  application: 'wkf-online'
  environment: 'prod'
  lifecycle: 'ephemeral-operation'
}

resource backupJob 'Microsoft.App/jobs@2024-03-01' = {
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
          name: 'database-url'
          value: databaseUrl
        }
        {
          name: 'sftp-known-hosts'
          value: sftpKnownHosts
        }
        {
          name: 'sftp-private-key'
          value: sftpPrivateKey
        }
      ]
      triggerType: 'Manual'
    }
    template: {
      containers: [
        {
          name: 'backup'
          image: imageReference
          args: [
            '/opt/wkf/backup-offsite.sh'
          ]
          env: [
            {
              name: 'AGE_RECIPIENT'
              value: ageRecipient
            }
            {
              name: 'AZURE_STORAGE_IDENTITY_CLIENT_ID'
              value: operationsIdentityClientId
            }
            {
              name: 'BACKUP_NAME'
              value: backupName
            }
            {
              name: 'DEPLOYED_SOURCE_SHA'
              value: deployedSourceSha
            }
            {
              name: 'OPERATIONS_IMAGE_REFERENCE'
              value: imageReference
            }
            {
              name: 'POSTGRES_BACKUP_URL'
              secretRef: 'database-url'
            }
            {
              name: 'PRODUCTION_IMAGE_REFERENCE'
              value: productionImageReference
            }
            {
              name: 'PRODUCTION_MEDIA_CONTAINER_URL'
              value: productionMediaContainerUrl
            }
            {
              name: 'SFTP_HOST'
              value: sftpHost
            }
            {
              name: 'SFTP_KNOWN_HOSTS'
              secretRef: 'sftp-known-hosts'
            }
            {
              name: 'SFTP_PORT'
              value: string(sftpPort)
            }
            {
              name: 'SFTP_PRIVATE_KEY'
              secretRef: 'sftp-private-key'
            }
            {
              name: 'SFTP_REMOTE_ROOT'
              value: sftpRemoteRoot
            }
            {
              name: 'SFTP_USER'
              value: sftpUser
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

output name string = backupJob.name
