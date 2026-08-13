using '../main.bicep'

param environmentName = 'staging'
param imageReference = readEnvironmentVariable('IMAGE_REFERENCE')
param payloadSecret = readEnvironmentVariable('PAYLOAD_SECRET')
param postgresAdministratorPassword = readEnvironmentVariable('POSTGRES_ADMIN_PASSWORD')
param postgresSkuName = 'Standard_B1ms'
param postgresSkuTier = 'Burstable'
param postgresBackupRetentionDays = 7
param minimumReplicas = 0
param maximumReplicas = 2

param smtpHost = readEnvironmentVariable('SMTP_HOST')
param smtpUser = readEnvironmentVariable('SMTP_USER')
param smtpPassword = readEnvironmentVariable('SMTP_PASSWORD')

param enableEntraAuthentication = true
param entraTenantId = readEnvironmentVariable('STAGING_ENTRA_TENANT_ID')
param entraClientId = readEnvironmentVariable('STAGING_ENTRA_CLIENT_ID')
param entraClientSecret = readEnvironmentVariable('STAGING_ENTRA_CLIENT_SECRET')
param entraAllowedGroupId = readEnvironmentVariable('STAGING_ENTRA_ALLOWED_GROUP_ID')
