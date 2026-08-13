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
param maximumReplicas int
param minimumReplicas int

@secure()
param payloadSecret string

param postgresAdministratorLogin string

@secure()
param postgresAdministratorPassword string

param postgresBackupRetentionDays int
param postgresDatabaseName string
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
param tags object

var applicationName = '${resourcePrefix}-${environmentName}'
var containerAppEnvironmentName = '${resourcePrefix}-${environmentName}'
var migrationJobName = '${resourcePrefix}-${environmentName}-migrate'
var postgresServerName = '${resourcePrefix}-${environmentName}-${uniqueString(resourceGroup().id)}'
var storageAccountName = '${resourcePrefix}${environmentName}${uniqueString(resourceGroup().id)}'

module monitoring './monitoring.bicep' = {
  name: 'monitoring'
  params: {
    location: location
    name: '${resourcePrefix}-${environmentName}-logs'
    tags: tags
  }
}

module containerAppEnvironment './container-app-environment.bicep' = {
  name: 'container-app-environment'
  params: {
    environmentName: containerAppEnvironmentName
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
    location: location
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
    location: location
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

module registryPullAssignment './registry-pull-role.bicep' = {
  name: 'registry-pull-role'
  scope: resourceGroup(registryResourceGroupName)
  params: {
    principalId: registryIdentity.properties.principalId
    registryName: registryName
  }
}

var databaseUrl = 'postgresql://${postgresAdministratorLogin}:${uriComponent(postgresAdministratorPassword)}@${postgres.outputs.fullyQualifiedDomainName}:5432/${postgres.outputs.databaseName}?sslmode=require'
var technicalApplicationUrl = 'https://${applicationName}.${containerAppEnvironment.outputs.defaultDomain}'
var serverUrl = customDomainName == '' ? technicalApplicationUrl : 'https://${customDomainName}'

module application './application.bicep' = if (deployApplication) {
  name: 'application'
  dependsOn: [
    registryPullAssignment
  ]
  params: {
    accountBaseUrl: storage.outputs.accountBaseUrl
    applicationName: applicationName
    containerAppEnvironmentId: containerAppEnvironment.outputs.id
    containerName: storage.outputs.containerName
    customDomainCertificateId: customDomainCertificateId
    customDomainName: customDomainName
    databaseUrl: databaseUrl
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
    storageConnectionString: storage.outputs.connectionString
    tags: tags
  }
}

module migrationJob './migration-job.bicep' = {
  name: 'migration-job'
  dependsOn: [
    registryPullAssignment
  ]
  params: {
    accountBaseUrl: storage.outputs.accountBaseUrl
    containerAppEnvironmentId: containerAppEnvironment.outputs.id
    containerName: storage.outputs.containerName
    databaseUrl: databaseUrl
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
    storageConnectionString: storage.outputs.connectionString
    tags: tags
  }
}

output applicationName string = applicationName
output applicationUrl string = serverUrl
output migrationJobName string = migrationJob.outputs.name
