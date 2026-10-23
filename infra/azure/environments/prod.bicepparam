using '../main.bicep'

param environmentName = 'prod'
param customDomainName = 'wkf.wroclaw.pl'
param redirectDomainName = 'www.wkf.wroclaw.pl'
param publicLaunchEnabled = true
param imageReference = readEnvironmentVariable('IMAGE_REFERENCE')
param payloadSecret = readEnvironmentVariable('PAYLOAD_SECRET')
param postgresAdministratorPassword = readEnvironmentVariable('POSTGRES_ADMIN_PASSWORD')
param postgresMigratorPassword = readEnvironmentVariable('POSTGRES_MIGRATOR_PASSWORD')
param postgresRuntimePassword = readEnvironmentVariable('POSTGRES_RUNTIME_PASSWORD')
param postgresSkuName = 'Standard_B1ms'
param postgresSkuTier = 'Burstable'
param postgresBackupRetentionDays = 35
param postgresMaxLocksPerTransaction = 256
param minimumReplicas = 1
param maximumReplicas = 1
param monthlyBudgetAmount = 50
param budgetStartDate = '2026-10-01'

param smtpHost = readEnvironmentVariable('SMTP_HOST')
param smtpUser = readEnvironmentVariable('SMTP_USER')
param smtpPassword = readEnvironmentVariable('SMTP_PASSWORD')

param enableEntraAuthentication = true
param requireEntraSignIn = false
param entraTenantId = readEnvironmentVariable('ENTRA_TENANT_ID')
param entraClientId = readEnvironmentVariable('ENTRA_CLIENT_ID')
param entraClientSecret = readEnvironmentVariable('ENTRA_CLIENT_SECRET')
param entraAllowedGroupId = readEnvironmentVariable('ENTRA_ALLOWED_GROUP_ID')
