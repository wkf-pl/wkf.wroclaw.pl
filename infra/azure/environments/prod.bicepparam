using '../main.bicep'

param environmentName = 'prod'
param imageReference = readEnvironmentVariable('IMAGE_REFERENCE')
param payloadSecret = readEnvironmentVariable('PAYLOAD_SECRET')
param postgresAdministratorPassword = readEnvironmentVariable('POSTGRES_ADMIN_PASSWORD')
param postgresSkuName = 'Standard_B2s'
param postgresSkuTier = 'Burstable'
param postgresBackupRetentionDays = 14
param minimumReplicas = 0
param maximumReplicas = 1
param customDomainName = 'wkf.wroclaw.pl'

param smtpHost = readEnvironmentVariable('SMTP_HOST')
param smtpUser = readEnvironmentVariable('SMTP_USER')
param smtpPassword = readEnvironmentVariable('SMTP_PASSWORD')
