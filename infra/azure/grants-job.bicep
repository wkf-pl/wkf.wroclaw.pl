targetScope = 'resourceGroup'

param containerAppEnvironmentId string
param imageReference string
param analyzeAfterRestore bool = false
param jobName string = 'wkf-prod-reconcile-grants'
param location string = 'polandcentral'

@secure()
param migratorDatabaseUrl string

param registryIdentityId string
param registryServer string
param tags object = {
  application: 'wkf-online'
  environment: 'prod'
  lifecycle: 'ephemeral-operation'
}

var reconcileAndAnalyze = '''
  bash /opt/wkf/reconcile-postgres-grants.sh
  started_at=$SECONDS
  echo 'Collecting PostgreSQL planner statistics after restore.'
  psql "$POSTGRES_MIGRATOR_URL" --no-psqlrc --set ON_ERROR_STOP=1 \
    --command 'ANALYZE' \
    --command "SELECT count(*) AS analyzed_application_tables FROM pg_stat_user_tables WHERE schemaname = 'public' AND last_analyze IS NOT NULL"
  echo "PostgreSQL ANALYZE completed in $((SECONDS - started_at)) seconds."
'''

resource grantsJob 'Microsoft.App/jobs@2024-03-01' = {
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
          name: 'migrator-database-url'
          value: migratorDatabaseUrl
        }
      ]
      triggerType: 'Manual'
    }
    template: {
      containers: [
        {
          name: 'reconcile-grants'
          image: imageReference
          args: analyzeAfterRestore ? [
            '-ec'
            reconcileAndAnalyze
          ] : [
            '/opt/wkf/reconcile-postgres-grants.sh'
          ]
          env: [
            {
              name: 'POSTGRES_MIGRATOR_URL'
              secretRef: 'migrator-database-url'
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

output name string = grantsJob.name
