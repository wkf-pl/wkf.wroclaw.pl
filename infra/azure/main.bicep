targetScope = 'resourceGroup'

@allowed([
  'staging'
  'prod'
])
@description('Deployment environment.')
param environmentName string

@description('Azure region used by environment resources.')
param location string = 'polandcentral'

@description('Short prefix used in Azure resource names.')
param resourcePrefix string = 'wkf'

@description('Immutable application image reference, preferably using an ACR digest.')
param imageReference string

@description('Git commit represented by the application revision.')
param sourceSha string = ''

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

@minValue(0)
param minimumReplicas int = 0

@minValue(1)
@maxValue(1)
@description('Hard cost guardrail. This application currently supports at most one replica.')
param maximumReplicas int = 1

@minValue(1)
@description('Monthly resource-group budget in the subscription billing currency.')
param monthlyBudgetAmount int

@description('First day of the initial monthly budget period.')
param budgetStartDate string = utcNow('yyyy-MM-01')

@minValue(1)
@description('Sustained CPU threshold in nanocores. The default is 80% of the 0.5 vCPU application limit.')
param cpuAlertThresholdNanocores int = 400000000

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

var sharedResourceGroupName = 'rg-${resourcePrefix}-shared'
var registryName = '${resourcePrefix}${uniqueString(subscription().id)}'

module environment './modules/environment.bicep' = {
  name: 'environment-${environmentName}'
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
    monthlyBudgetAmount: monthlyBudgetAmount
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
    sourceSha: sourceSha
    budgetStartDate: budgetStartDate
    cpuAlertThresholdNanocores: cpuAlertThresholdNanocores
    tags: {
      application: 'wkf-online'
      environment: environmentName
    }
  }
}

output applicationName string = environment.outputs.applicationName
output applicationUrl string = environment.outputs.applicationUrl
output migrationJobName string = environment.outputs.migrationJobName
output resourceGroupName string = resourceGroup().name
