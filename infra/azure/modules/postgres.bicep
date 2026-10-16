param administratorLogin string

@secure()
param administratorPassword string

param backupRetentionDays int
param databaseName string
param delegatedSubnetId string = ''
param enableAudit bool = false
param location string
param logAnalyticsWorkspaceId string = ''
param privateDnsZoneId string = ''
param serverName string
param skuName string
param skuTier string
param storageSizeGB int
param tags object

var privateNetworkingEnabled = delegatedSubnetId != '' && privateDnsZoneId != ''

resource server 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: serverName
  location: location
  tags: tags
  sku: {
    name: skuName
    tier: skuTier
  }
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorPassword
    authConfig: {
      activeDirectoryAuth: 'Disabled'
      passwordAuth: 'Enabled'
    }
    backup: {
      backupRetentionDays: backupRetentionDays
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    network: privateNetworkingEnabled ? {
      delegatedSubnetResourceId: delegatedSubnetId
      privateDnsZoneArmResourceId: privateDnsZoneId
      publicNetworkAccess: 'Disabled'
    } : {
      publicNetworkAccess: 'Enabled'
    }
    storage: {
      autoGrow: 'Enabled'
      storageSizeGB: storageSizeGB
    }
    version: '17'
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: server
  name: databaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

resource allowAzureServices 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = if (!privateNetworkingEnabled) {
  parent: server
  name: 'AllowAzureServices'
  properties: {
    endIpAddress: '0.0.0.0'
    startIpAddress: '0.0.0.0'
  }
}

resource logConnections 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2024-08-01' = if (enableAudit) {
  parent: server
  name: 'log_connections'
  properties: {
    source: 'user-override'
    value: 'on'
  }
}

resource logDisconnections 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2024-08-01' = if (enableAudit) {
  parent: server
  name: 'log_disconnections'
  properties: {
    source: 'user-override'
    value: 'on'
  }
}

resource extensions 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2024-08-01' = if (enableAudit) {
  parent: server
  name: 'azure.extensions'
  properties: {
    source: 'user-override'
    value: 'pg_stat_statements,pgaudit'
  }
}

resource sharedPreloadLibraries 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2024-08-01' = if (enableAudit) {
  parent: server
  name: 'shared_preload_libraries'
  properties: {
    source: 'user-override'
    value: 'pgaudit'
  }
  dependsOn: [
    extensions
  ]
}

resource pgAuditLog 'Microsoft.DBforPostgreSQL/flexibleServers/configurations@2024-08-01' = if (enableAudit) {
  parent: server
  name: 'pgaudit.log'
  properties: {
    source: 'user-override'
    value: 'ROLE,DDL'
  }
  dependsOn: [
    sharedPreloadLibraries
  ]
}

resource diagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = if (enableAudit && logAnalyticsWorkspaceId != '') {
  name: '${serverName}-diagnostics'
  scope: server
  properties: {
    logs: [
      {
        category: 'PostgreSQLLogs'
        enabled: true
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
      }
    ]
    workspaceId: logAnalyticsWorkspaceId
  }
}

output databaseName string = database.name
output fullyQualifiedDomainName string = server.properties.fullyQualifiedDomainName
output id string = server.id
output name string = server.name
