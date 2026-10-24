param postgresServerId string
param postgresServerName string
param resourcePrefix string
param tags object

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' existing = {
  name: '${resourcePrefix}-staging-postgres-start'
}

resource postgresStartAlert 'Microsoft.Insights/activityLogAlerts@2020-10-01' = {
  name: '${postgresServerName}-started'
  location: 'global'
  tags: tags
  properties: {
    actions: {
      actionGroups: [
        {
          actionGroupId: actionGroup.id
        }
      ]
    }
    condition: {
      allOf: [
        {
          equals: 'Administrative'
          field: 'category'
        }
        {
          equals: 'Microsoft.DBforPostgreSQL/flexibleServers/start/action'
          field: 'operationName'
        }
        {
          equals: 'Succeeded'
          field: 'status'
        }
      ]
    }
    description: 'Notifies operators when the staging PostgreSQL Flexible Server starts, including the automatic start after seven days.'
    enabled: true
    scopes: [
      postgresServerId
    ]
  }
}
