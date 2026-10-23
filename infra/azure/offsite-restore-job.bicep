targetScope = 'resourceGroup'

@secure()
param ageIdentity string

@secure()
param allowedSigners string

param backupName string
param containerAppEnvironmentId string
param ftpsHost string

@secure()
param ftpsPassword string

param ftpsPort int
param ftpsRemoteRoot string
param ftpsUser string
param imageReference string
param jobName string = 'wkf-prod-offsite-restore'
param location string = 'polandcentral'

@secure()
param manifestSigningPublicKey string

@secure()
param migratorDatabaseUrl string

param operationsIdentityClientId string
param operationsIdentityId string
param productionMediaContainerUrl string
param registryIdentityId string
param registryServer string
param tags object = {
  application: 'wkf-online'
  environment: 'prod'
  lifecycle: 'ephemeral-operation'
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
          name: 'ftps-password'
          value: ftpsPassword
        }
        {
          name: 'manifest-signing-public-key'
          value: manifestSigningPublicKey
        }
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
          name: 'restore'
          image: imageReference
          args: [
            '-c'
            '''
              set -Eeuo pipefail
              umask 077
              temporary_directory="$(mktemp --directory)"
              trap 'rm --recursive --force -- "$temporary_directory"' EXIT INT TERM
              mkdir --parents -- "$temporary_directory/download" "$temporary_directory/trust"
              printf '%s\n' "$RESTORE_AGE_IDENTITY" >"$temporary_directory/trust/age-identity.txt"
              printf '%s\n' "$RESTORE_ALLOWED_SIGNERS" >"$temporary_directory/trust/allowed-signers"
              printf '%s\n' "$RESTORE_MANIFEST_SIGNING_PUBLIC_KEY" >"$temporary_directory/trust/manifest-signing.pub"
              export AGE_IDENTITY_FILE="$temporary_directory/trust/age-identity.txt"
              export BACKUP_ALLOWED_SIGNERS_FILE="$temporary_directory/trust/allowed-signers"
              export BACKUP_SIGNING_PUBLIC_KEY_FILE="$temporary_directory/trust/manifest-signing.pub"
              export AZCOPY_AUTO_LOGIN_TYPE=MSI
              export AZCOPY_MSI_CLIENT_ID="$AZURE_STORAGE_IDENTITY_CLIENT_ID"
              bash /opt/wkf/download-offsite-backup-ftps.sh "$BACKUP_NAME" "$temporary_directory/download"
              backup_directory="$temporary_directory/download/$BACKUP_NAME"
              age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$temporary_directory/manifest.json" "$backup_directory/manifest.json.age"
              expected_blob_count="$(jq --raw-output '.blobCount' "$temporary_directory/manifest.json")"
              bash /opt/wkf/restore-offsite-backup.sh "$backup_directory" RESTORE
              if ! restored_blob_count="$(azcopy list "$PRODUCTION_MEDIA_CONTAINER_URL" --machine-readable --output-type=json | jq --slurp '[.[] | select(.MessageType == "ListObject")] | length')"; then
                echo 'Could not count restored production blobs with Managed Identity.' >&2
                exit 1
              fi
              if ! session_count="$(psql "$POSTGRES_MIGRATOR_URL" --no-align --tuples-only --set ON_ERROR_STOP=1 --command 'SELECT count(*) FROM users_sessions;')"; then
                echo 'Could not verify that restored production sessions were cleared.' >&2
                exit 1
              fi
              if [[ "$restored_blob_count" != "$expected_blob_count" || "$session_count" != '0' ]]; then
                echo "Production restore verification failed: blobs=$restored_blob_count expected_blobs=$expected_blob_count sessions=$session_count expected_sessions=0" >&2
                exit 1
              fi
              echo "PRODUCTION_RESTORE_RESULT backup=$BACKUP_NAME blobs=$restored_blob_count sessions=$session_count"
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
              name: 'BACKUP_SIGNING_IDENTITY'
              value: 'wkf-production-restore'
            }
            {
              name: 'FTPS_HOST'
              value: ftpsHost
            }
            {
              name: 'FTPS_PASSWORD'
              secretRef: 'ftps-password'
            }
            {
              name: 'FTPS_PORT'
              value: string(ftpsPort)
            }
            {
              name: 'FTPS_REMOTE_ROOT'
              value: ftpsRemoteRoot
            }
            {
              name: 'FTPS_USER'
              value: ftpsUser
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

output name string = restoreJob.name
