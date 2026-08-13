targetScope = 'subscription'

@allowed([
  'staging'
  'prod'
])
@description('Deployment environment.')
param environmentName string

@description('Azure region used by environment resources.')
param location string = 'westeurope'

@description('Short prefix used in Azure resource names.')
param resourcePrefix string = 'wkf'

@description('Immutable application image reference, preferably using an ACR digest.')
param imageReference string

@description('Creates or reconciles the web application. Disable during the first migration.')
param deployApplication bool = true

@secure()
param payloadSecret string

@secure()
param postgresAdministratorPassword string

param postgresAdministratorLogin string = 'wkfadmin'
param postgresDatabaseName string = 'wkf'
param postgresSkuName string
param postgresSkuTier string
param postgresStorageSizeGB int = 32
param postgresBackupRetentionDays int = 7

param minimumReplicas int = 0
param maximumReplicas int = 2

param customDomainName string = ''
param customDomainCertificateId string = ''

param smtpFromAddress string = 'no-reply@wkf.wroclaw.pl'
param smtpFromName string = 'WKF Online'
param smtpHost string
param smtpPort int = 587
param smtpSecure bool = false
param smtpSkipVerify bool = false
param smtpUser string

@secure()
param smtpPassword string

param enableEntraAuthentication bool = false
param entraTenantId string = ''
param entraClientId string = ''
param entraAllowedGroupId string = ''

@secure()
param entraClientSecret string = ''

var environmentResourceGroupName = '${resourcePrefix}-${environmentName}'
var sharedResourceGroupName = '${resourcePrefix}-shared'
var registryName = '${resourcePrefix}${uniqueString(subscription().id)}'

resource environmentResourceGroup 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: environmentResourceGroupName
  location: location
  tags: {
    application: 'wkf-online'
    environment: environmentName
  }
}

module environment './modules/environment.bicep' = {
  name: 'environment-${environmentName}'
  scope: environmentResourceGroup
  params: {
    customDomainCertificateId: customDomainCertificateId
    customDomainName: customDomainName
    deployApplication: deployApplication
    enableEntraAuthentication: enableEntraAuthentication
    entraAllowedGroupId: entraAllowedGroupId
    entraClientId: entraClientId
    entraClientSecret: entraClientSecret
    entraTenantId: entraTenantId
    environmentName: environmentName
    imageReference: imageReference
    location: location
    maximumReplicas: maximumReplicas
    minimumReplicas: minimumReplicas
    payloadSecret: payloadSecret
    postgresAdministratorLogin: postgresAdministratorLogin
    postgresAdministratorPassword: postgresAdministratorPassword
    postgresBackupRetentionDays: postgresBackupRetentionDays
    postgresDatabaseName: postgresDatabaseName
    postgresSkuName: postgresSkuName
    postgresSkuTier: postgresSkuTier
    postgresStorageSizeGB: postgresStorageSizeGB
    registryName: registryName
    registryResourceGroupName: sharedResourceGroupName
    resourcePrefix: resourcePrefix
    smtpFromAddress: smtpFromAddress
    smtpFromName: smtpFromName
    smtpHost: smtpHost
    smtpPassword: smtpPassword
    smtpPort: smtpPort
    smtpSecure: smtpSecure
    smtpSkipVerify: smtpSkipVerify
    smtpUser: smtpUser
    tags: environmentResourceGroup.tags
  }
}

output applicationName string = environment.outputs.applicationName
output applicationUrl string = environment.outputs.applicationUrl
output migrationJobName string = environment.outputs.migrationJobName
output resourceGroupName string = environmentResourceGroupName
