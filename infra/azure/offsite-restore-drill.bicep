targetScope = 'resourceGroup'

@secure()
param ageIdentity string

@secure()
param allowedSigners string
param applicationImageReference string
param backupName string
param containerAppEnvironmentId string
param containerAppsSubnetId string
param drillName string
param location string = 'polandcentral'
@secure()
param manifestSigningPublicKey string
param operationsIdentityClientId string
param operationsIdentityId string
param operationsIdentityPrincipalId string
param operationsImageReference string

@secure()
param payloadSecret string

@secure()
param postgresAdministratorPassword string

param postgresDelegatedSubnetId string
param postgresPrivateDnsZoneId string
param registryIdentityId string
param registryServer string
param restoredApplicationEnabled bool = false
param sourceSha string
param storageAllowPublicUpload bool = true
param uploaderPrincipalId string

var applicationName = '${drillName}-app'
var blobDataContributorRoleId = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
)
var databaseName = 'wkf_restore_drill'
var jobName = '${drillName}-restore'
var postgresAdministratorLogin = 'wkfrestoreadmin'
var postgresServerName = replace('${drillName}-pg', '_', '-')
var restoredMediaContainerName = 'restored-media'
var sourceContainerName = 'restore-source'
var storageAccountName = toLower(replace('${drillName}storage', '-', ''))
var tags = {
  application: 'wkf-online'
  environment: 'restore-drill'
  lifecycle: 'ephemeral-operation'
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: storageAccountName
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: {
    name: 'Standard_LRS'
  }
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: false
    minimumTlsVersion: 'TLS1_2'
    networkAcls: storageAllowPublicUpload
      ? {
          bypass: 'None'
          defaultAction: 'Allow'
        }
      : {
          bypass: 'None'
          defaultAction: 'Deny'
          virtualNetworkRules: [
            {
              action: 'Allow'
              id: containerAppsSubnetId
              state: 'Succeeded'
            }
          ]
        }
    publicNetworkAccess: 'Enabled'
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    deleteRetentionPolicy: {
      enabled: false
    }
    isVersioningEnabled: false
  }
}

resource sourceContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: sourceContainerName
  properties: {
    publicAccess: 'None'
  }
}

resource restoredMediaContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: restoredMediaContainerName
  properties: {
    publicAccess: 'None'
  }
}

resource operationsStorageRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, operationsIdentityPrincipalId, blobDataContributorRoleId)
  scope: storageAccount
  properties: {
    principalId: operationsIdentityPrincipalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: blobDataContributorRoleId
  }
}

resource uploaderStorageRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storageAccount.id, uploaderPrincipalId, blobDataContributorRoleId)
  scope: storageAccount
  properties: {
    principalId: uploaderPrincipalId
    roleDefinitionId: blobDataContributorRoleId
  }
}

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: postgresServerName
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: postgresAdministratorLogin
    administratorLoginPassword: postgresAdministratorPassword
    authConfig: {
      activeDirectoryAuth: 'Disabled'
      passwordAuth: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    network: {
      delegatedSubnetResourceId: postgresDelegatedSubnetId
      privateDnsZoneArmResourceId: postgresPrivateDnsZoneId
      publicNetworkAccess: 'Disabled'
    }
    storage: {
      autoGrow: 'Disabled'
      storageSizeGB: 32
    }
    version: '17'
  }
}

resource restoredDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: postgresServer
  name: databaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

resource postgresExtensions 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2024-08-01' = {
  parent: postgresServer
  name: 'azure.extensions'
  properties: {
    source: 'user-override'
    value: 'pg_stat_statements,pgaudit'
  }
}

resource postgresSharedPreloadLibraries 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2024-08-01' = {
  parent: postgresServer
  name: 'shared_preload_libraries'
  properties: {
    source: 'user-override'
    value: 'pgaudit'
  }
  dependsOn: [
    postgresExtensions
  ]
}

resource restoreJob 'Microsoft.App/jobs@2024-03-01' = {
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
          name: 'age-identity'
          value: ageIdentity
        }
        {
          name: 'allowed-signers'
          value: allowedSigners
        }
        {
          name: 'database-url'
          value: 'postgresql://${postgresAdministratorLogin}:${postgresAdministratorPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/${databaseName}?sslmode=require'
        }
        {
          name: 'manifest-signing-public-key'
          value: manifestSigningPublicKey
        }
      ]
      triggerType: 'Manual'
    }
    template: {
      containers: [
        {
          name: 'restore'
          image: operationsImageReference
          args: [
            '-c'
            '''
              set -Eeuo pipefail
              umask 077
              temporary_directory="$(mktemp --directory)"
              trap 'rm --recursive --force -- "$temporary_directory"' EXIT INT TERM
              mkdir --parents -- "$temporary_directory/backup" "$temporary_directory/trust"
              printf '%s\n' "$RESTORE_AGE_IDENTITY" >"$temporary_directory/trust/age-identity.txt"
              printf '%s\n' "$RESTORE_ALLOWED_SIGNERS" >"$temporary_directory/trust/allowed-signers"
              printf '%s\n' "$RESTORE_MANIFEST_SIGNING_PUBLIC_KEY" >"$temporary_directory/trust/manifest-signing.pub"
              export AGE_IDENTITY_FILE="$temporary_directory/trust/age-identity.txt"
              export BACKUP_ALLOWED_SIGNERS_FILE="$temporary_directory/trust/allowed-signers"
              export BACKUP_SIGNING_PUBLIC_KEY_FILE="$temporary_directory/trust/manifest-signing.pub"
              export AZCOPY_AUTO_LOGIN_TYPE=MSI
              export AZCOPY_MSI_CLIENT_ID="$AZURE_STORAGE_IDENTITY_CLIENT_ID"
              azcopy copy "$RESTORE_SOURCE_CONTAINER_URL/$BACKUP_NAME/*" "$temporary_directory/backup" --recursive=true --output-type=text
              age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$temporary_directory/manifest.json" "$temporary_directory/backup/manifest.json.age"
              expected_blob_count="$(jq --raw-output '.blobCount' "$temporary_directory/manifest.json")"
              bash /opt/wkf/restore-offsite-backup.sh "$temporary_directory/backup" RESTORE
              restored_blob_count="$(azcopy list "$PRODUCTION_MEDIA_CONTAINER_URL" --machine-readable --output-type=json | jq --slurp '[.[] | select(.MessageType == "ListObject")] | length')"
              migration_count="$(psql "$POSTGRES_MIGRATOR_URL" --no-align --tuples-only --set ON_ERROR_STOP=1 --command 'SELECT count(*) FROM payload_migrations;')"
              session_count="$(psql "$POSTGRES_MIGRATOR_URL" --no-align --tuples-only --set ON_ERROR_STOP=1 --command 'SELECT count(*) FROM users_sessions;')"
              table_count="$(psql "$POSTGRES_MIGRATOR_URL" --no-align --tuples-only --set ON_ERROR_STOP=1 --command "SELECT count(*) FROM pg_tables WHERE schemaname = 'public';")"
              if [[ "$restored_blob_count" != "$expected_blob_count" || "$session_count" != '0' ]]; then
                echo 'Restore drill verification failed.' >&2
                exit 1
              fi
              echo "RESTORE_DRILL_RESULT backup=$BACKUP_NAME blobs=$restored_blob_count migrations=$migration_count public_tables=$table_count sessions=$session_count"
            '''
          ]
          env: [
            {
              name: 'AZURE_STORAGE_IDENTITY_CLIENT_ID'
              value: operationsIdentityClientId
            }
            {
              name: 'BACKUP_NAME'
              value: backupName
            }
            {
              name: 'POSTGRES_MIGRATOR_URL'
              secretRef: 'database-url'
            }
            {
              name: 'PRODUCTION_MEDIA_CONTAINER_URL'
              value: '${storageAccount.properties.primaryEndpoints.blob}${restoredMediaContainerName}'
            }
            {
              name: 'RESTORE_AGE_IDENTITY'
              secretRef: 'age-identity'
            }
            {
              name: 'RESTORE_ALLOWED_SIGNERS'
              secretRef: 'allowed-signers'
            }
            {
              name: 'RESTORE_MANIFEST_SIGNING_PUBLIC_KEY'
              secretRef: 'manifest-signing-public-key'
            }
            {
              name: 'RESTORE_SOURCE_CONTAINER_URL'
              value: '${storageAccount.properties.primaryEndpoints.blob}${sourceContainerName}'
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
  dependsOn: [
    operationsStorageRole
    postgresSharedPreloadLibraries
    restoredDatabase
    sourceContainer
    restoredMediaContainer
  ]
}

resource restoredApplication 'Microsoft.App/containerApps@2024-03-01' = if (restoredApplicationEnabled) {
  name: applicationName
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
      activeRevisionsMode: 'Single'
      ingress: {
        allowInsecure: false
        external: false
        targetPort: 3000
        transport: 'auto'
      }
      registries: [
        {
          identity: registryIdentityId
          server: registryServer
        }
      ]
      secrets: [
        {
          name: 'database-url'
          value: 'postgresql://${postgresAdministratorLogin}:${postgresAdministratorPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/${databaseName}?sslmode=require'
        }
        {
          name: 'payload-secret'
          value: payloadSecret
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'application'
          image: applicationImageReference
          env: [
            {
              name: 'AZURE_STORAGE_ACCOUNT_BASE_URL'
              value: storageAccount.properties.primaryEndpoints.blob
            }
            {
              name: 'AZURE_STORAGE_ALLOW_CONTAINER_CREATE'
              value: 'false'
            }
            {
              name: 'AZURE_STORAGE_AUTH_MODE'
              value: 'managed-identity'
            }
            {
              name: 'AZURE_STORAGE_CONTAINER_NAME'
              value: restoredMediaContainerName
            }
            {
              name: 'AZURE_STORAGE_IDENTITY_CLIENT_ID'
              value: operationsIdentityClientId
            }
            {
              name: 'DATABASE_URL'
              secretRef: 'database-url'
            }
            {
              name: 'DEPLOYED_SOURCE_SHA'
              value: sourceSha
            }
            {
              name: 'PAYLOAD_SECRET'
              secretRef: 'payload-secret'
            }
            {
              name: 'PUBLIC_LAUNCH_ENABLED'
              value: 'false'
            }
            {
              name: 'SERVER_URL'
              value: 'https://${applicationName}.internal.invalid'
            }
          ]
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/api/health/live'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 30
              periodSeconds: 30
              timeoutSeconds: 5
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/api/health'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 10
              timeoutSeconds: 5
              failureThreshold: 6
            }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 1
      }
    }
  }
  dependsOn: [
    operationsStorageRole
    restoredDatabase
  ]
}

output applicationName string = restoredApplicationEnabled ? restoredApplication.name : ''
output backupName string = backupName
output jobName string = restoreJob.name
output postgresFullyQualifiedDomainName string = postgresServer.properties.fullyQualifiedDomainName
output postgresServerName string = postgresServer.name
output restoredMediaContainerUrl string = '${storageAccount.properties.primaryEndpoints.blob}${restoredMediaContainerName}'
output sourceContainerName string = sourceContainer.name
output storageAccountName string = storageAccount.name
