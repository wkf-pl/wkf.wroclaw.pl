param budgetStartDate string
param cpuAlertThresholdNanocores int
param customDomainCertificateId string
param customDomainName string
param deployApplication bool
param enableEntraAuthentication bool
param entraAllowedGroupId string
param entraClientId string

@secure()
param entraClientSecret string

param entraTenantId string
param environmentName string
param imageReference string
param location string

@minValue(1)
@maxValue(1)
param maximumReplicas int

param monthlyBudgetAmount int

@minValue(0)
@maxValue(1)
param minimumReplicas int

@secure()
param payloadSecret string

param postgresAdministratorLogin string

@secure()
param postgresAdministratorPassword string

param postgresBackupRetentionDays int
param postgresDatabaseName string

@secure()
param postgresMigratorPassword string

@secure()
param postgresRuntimePassword string

param postgresSkuName string
param postgresSkuTier string
param postgresStorageSizeGB int
param registryName string
param registryResourceGroupName string
param resourcePrefix string
param smtpFromAddress string
param smtpFromName string
param smtpHost string

@secure()
param smtpPassword string

param smtpPort int
param smtpSecure bool
param smtpSkipVerify bool
param smtpUser string
param sourceSha string
param tags object

var applicationName = '${resourcePrefix}-${environmentName}'
var containerAppEnvironmentName = '${resourcePrefix}-${environmentName}'
var isProduction = environmentName == 'prod'
var migrationJobName = '${resourcePrefix}-${environmentName}-migrate'
var postgresServerName = '${resourcePrefix}-${environmentName}-${uniqueString(resourceGroup().id)}'
var storageAccountName = '${resourcePrefix}${environmentName}${uniqueString(resourceGroup().id)}'
var storageAuthenticationMode = isProduction ? 'managed-identity' : 'connection-string'

module monitoring './monitoring.bicep' = {
  name: 'monitoring'
  params: {
    location: location
    name: '${resourcePrefix}-${environmentName}-logs'
    tags: tags
  }
}

module network './network.bicep' = if (isProduction) {
  name: 'network'
  params: {
    location: location
    name: '${resourcePrefix}-${environmentName}'
    tags: tags
  }
}

module containerAppEnvironment './container-app-environment.bicep' = {
  name: 'container-app-environment'
  params: {
    environmentName: containerAppEnvironmentName
    infrastructureSubnetId: isProduction ? network!.outputs.containerAppsSubnetId : ''
    location: location
    logAnalyticsCustomerId: monitoring.outputs.customerId
    logAnalyticsSharedKey: monitoring.outputs.sharedKey
    tags: tags
  }
}

module storage './storage.bicep' = {
  name: 'storage'
  params: {
    accountName: storageAccountName
    allowSharedKeyAccess: !isProduction
    allowedSubnetId: isProduction ? network!.outputs.containerAppsSubnetId : ''
    enableProductionProtection: isProduction
    enableStagingCheckpoints: environmentName == 'staging'
    location: location
    skuName: isProduction ? 'Standard_ZRS' : 'Standard_LRS'
    tags: tags
  }
}

module postgres './postgres.bicep' = {
  name: 'postgres'
  params: {
    administratorLogin: postgresAdministratorLogin
    administratorPassword: postgresAdministratorPassword
    backupRetentionDays: postgresBackupRetentionDays
    databaseName: postgresDatabaseName
    delegatedSubnetId: isProduction ? network!.outputs.postgresSubnetId : ''
    enableAudit: isProduction
    location: location
    logAnalyticsWorkspaceId: monitoring.outputs.id
    privateDnsZoneId: isProduction ? network!.outputs.postgresPrivateDnsZoneId : ''
    serverName: postgresServerName
    skuName: postgresSkuName
    skuTier: postgresSkuTier
    storageSizeGB: postgresStorageSizeGB
    tags: tags
  }
}

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' existing = {
  name: registryName
  scope: resourceGroup(registryResourceGroupName)
}

resource registryIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${resourcePrefix}-${environmentName}-registry'
  location: location
  tags: tags
}

resource storageIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = if (isProduction) {
  name: '${resourcePrefix}-${environmentName}-storage'
  location: location
  tags: tags
}

resource operationsIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = if (isProduction) {
  name: '${resourcePrefix}-${environmentName}-operations'
  location: location
  tags: tags
}

var runtimeDatabaseLogin = isProduction ? 'wkf_runtime' : postgresAdministratorLogin
var runtimeDatabasePassword = isProduction ? postgresRuntimePassword : postgresAdministratorPassword
var migratorDatabaseLogin = isProduction ? 'wkf_migrator' : postgresAdministratorLogin
var migratorDatabasePassword = isProduction ? postgresMigratorPassword : postgresAdministratorPassword
var runtimeDatabaseUrl = 'postgresql://${runtimeDatabaseLogin}:${uriComponent(runtimeDatabasePassword)}@${postgres.outputs.fullyQualifiedDomainName}:5432/${postgres.outputs.databaseName}?sslmode=require'
var migratorDatabaseUrl = 'postgresql://${migratorDatabaseLogin}:${uriComponent(migratorDatabasePassword)}@${postgres.outputs.fullyQualifiedDomainName}:5432/${postgres.outputs.databaseName}?sslmode=require'
var technicalApplicationUrl = 'https://${applicationName}.${containerAppEnvironment.outputs.defaultDomain}'
var serverUrl = customDomainName == '' ? technicalApplicationUrl : 'https://${customDomainName}'

module application './application.bicep' = if (deployApplication) {
  name: 'application'
  params: {
    accountBaseUrl: storage.outputs.accountBaseUrl
    applicationName: applicationName
    containerAppEnvironmentId: containerAppEnvironment.outputs.id
    containerName: storage.outputs.containerName
    customDomainCertificateId: customDomainCertificateId
    customDomainName: customDomainName
    databaseUrl: runtimeDatabaseUrl
    enableEntraAuthentication: enableEntraAuthentication
    entraAllowedGroupId: entraAllowedGroupId
    entraClientId: entraClientId
    entraClientSecret: entraClientSecret
    entraTenantId: entraTenantId
    imageReference: imageReference
    location: location
    maximumReplicas: maximumReplicas
    minimumReplicas: minimumReplicas
    payloadSecret: payloadSecret
    registryIdentityId: registryIdentity.id
    registryServer: registry.properties.loginServer
    serverUrl: serverUrl
    smtpFromAddress: smtpFromAddress
    smtpFromName: smtpFromName
    smtpHost: smtpHost
    smtpPassword: smtpPassword
    smtpPort: smtpPort
    smtpSecure: smtpSecure
    smtpSkipVerify: smtpSkipVerify
    smtpUser: smtpUser
    sourceSha: sourceSha
    storageAuthenticationMode: storageAuthenticationMode
    storageConnectionString: storage.outputs.connectionString
    storageIdentityClientId: isProduction ? storageIdentity!.properties.clientId : ''
    storageIdentityId: isProduction ? storageIdentity!.id : ''
    tags: tags
  }
}

module costGuardrails './cost-guardrails.bicep' = if (deployApplication) {
  name: 'cost-guardrails'
  params: {
    applicationId: resourceId('Microsoft.App/containerApps', applicationName)
    applicationName: applicationName
    budgetStartDate: budgetStartDate
    cpuAlertThresholdNanocores: cpuAlertThresholdNanocores
    environmentName: environmentName
    location: location
    monthlyBudgetAmount: monthlyBudgetAmount
    postgresServerId: postgres.outputs.id
    postgresServerName: postgres.outputs.name
    resourcePrefix: resourcePrefix
    tags: tags
  }
  dependsOn: [
    application
  ]
}

module migrationJob './migration-job.bicep' = {
  name: 'migration-job'
  params: {
    accountBaseUrl: storage.outputs.accountBaseUrl
    containerAppEnvironmentId: containerAppEnvironment.outputs.id
    containerName: storage.outputs.containerName
    databaseUrl: migratorDatabaseUrl
    imageReference: imageReference
    jobName: migrationJobName
    location: location
    payloadSecret: payloadSecret
    registryIdentityId: registryIdentity.id
    registryServer: registry.properties.loginServer
    serverUrl: serverUrl
    smtpFromAddress: smtpFromAddress
    smtpFromName: smtpFromName
    smtpHost: smtpHost
    smtpPassword: smtpPassword
    smtpPort: smtpPort
    smtpSecure: smtpSecure
    smtpSkipVerify: smtpSkipVerify
    smtpUser: smtpUser
    storageAuthenticationMode: storageAuthenticationMode
    storageConnectionString: storage.outputs.connectionString
    storageIdentityClientId: isProduction ? storageIdentity!.properties.clientId : ''
    storageIdentityId: isProduction ? storageIdentity!.id : ''
    tags: tags
  }
}

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' existing = if (isProduction) {
  name: postgresServerName
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' existing = if (isProduction) {
  name: storageAccountName
}

resource postgresDeleteLock 'Microsoft.Authorization/locks@2020-05-01' = if (isProduction) {
  name: 'protect-postgresql'
  scope: postgresServer
  properties: {
    level: 'CanNotDelete'
    notes: 'Production PostgreSQL must not be deleted without explicitly removing this lock.'
  }
  dependsOn: [
    postgres
  ]
}

resource storageDeleteLock 'Microsoft.Authorization/locks@2020-05-01' = if (isProduction) {
  name: 'protect-storage'
  scope: storageAccount
  properties: {
    level: 'CanNotDelete'
    notes: 'Production Blob Storage must not be deleted without explicitly removing this lock.'
  }
  dependsOn: [
    storage
  ]
}

output applicationName string = applicationName
output applicationUrl string = serverUrl
output containerAppEnvironmentId string = containerAppEnvironment.outputs.id
output migrationJobName string = migrationJob.outputs.name
output operationsIdentityClientId string = isProduction ? operationsIdentity!.properties.clientId : ''
output operationsIdentityId string = isProduction ? operationsIdentity!.id : ''
output operationsIdentityPrincipalId string = isProduction ? operationsIdentity!.properties.principalId : ''
output postgresServerId string = postgres.outputs.id
output postgresServerName string = postgres.outputs.name
output registryIdentityPrincipalId string = registryIdentity.properties.principalId
output storageAccountId string = storage.outputs.accountId
output storageContainerId string = storage.outputs.containerId
output storageIdentityClientId string = isProduction ? storageIdentity!.properties.clientId : ''
output storageIdentityPrincipalId string = isProduction ? storageIdentity!.properties.principalId : ''
