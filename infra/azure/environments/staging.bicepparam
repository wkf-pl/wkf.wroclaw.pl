using '../main.bicep'

param environmentName = 'staging'
param imageReference = readEnvironmentVariable('IMAGE_REFERENCE')
param payloadSecret = readEnvironmentVariable('PAYLOAD_SECRET')
param postgresAdministratorPassword = readEnvironmentVariable('POSTGRES_ADMIN_PASSWORD')
param postgresSkuName = 'Standard_B1ms'
param postgresSkuTier = 'Burstable'
param postgresBackupRetentionDays = 7
param minimumReplicas = 0
param maximumReplicas = 1
param monthlyBudgetAmount = 50
param budgetStartDate = '2026-09-01'

param smtpHost = '127.0.0.1'
param smtpUser = ''
param smtpPassword = ''

param enableEntraAuthentication = false
