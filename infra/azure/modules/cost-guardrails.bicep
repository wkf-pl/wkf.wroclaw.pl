param applicationId string
param applicationName string
param budgetStartDate string

@minValue(1)
param cpuAlertThresholdNanocores int
param environmentName string
param location string

@minValue(1)
param monthlyBudgetAmount int
param postgresServerId string
param postgresServerName string
param resourcePrefix string
param tags object

var ownerRoleDefinitionId = '8e3af657-a8ff-443c-a75c-2fe8c4bcb635'
var postgresAlerts = [
  {
    aggregation: 'Average'
    description: 'PostgreSQL CPU has exceeded 70% for 15 minutes.'
    metricName: 'cpu_percent'
    name: 'cpu-over-70-percent'
    operator: 'GreaterThan'
    threshold: 70
    windowSize: 'PT15M'
  }
  {
    aggregation: 'Average'
    description: 'PostgreSQL burstable CPU credits are below 60 minutes.'
    metricName: 'cpu_credits_remaining'
    name: 'cpu-credits-below-60'
    operator: 'LessThan'
    threshold: 60
    windowSize: 'PT15M'
  }
  {
    aggregation: 'Average'
    description: 'PostgreSQL has more than 28 active connections.'
    metricName: 'active_connections'
    name: 'active-connections-over-28'
    operator: 'GreaterThan'
    threshold: 28
    windowSize: 'PT15M'
  }
  {
    aggregation: 'Average'
    description: 'PostgreSQL storage consumption has exceeded 70%.'
    metricName: 'storage_percent'
    name: 'storage-over-70-percent'
    operator: 'GreaterThan'
    threshold: 70
    windowSize: 'PT15M'
  }
  {
    aggregation: 'Total'
    description: 'PostgreSQL has recorded more than 10 failed connections in five minutes.'
    metricName: 'connections_failed'
    name: 'failed-connections-over-10'
    operator: 'GreaterThan'
    threshold: 10
    windowSize: 'PT5M'
  }
  {
    aggregation: 'Minimum'
    description: 'PostgreSQL is not reporting as alive.'
    metricName: 'is_db_alive'
    name: 'database-not-alive'
    operator: 'LessThan'
    threshold: 1
    windowSize: 'PT5M'
  }
]

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: '${resourcePrefix}-${environmentName}-guardrails'
  location: 'global'
  tags: tags
  properties: {
    armRoleReceivers: [
      {
        name: 'Subscription owners'
        roleId: ownerRoleDefinitionId
        useCommonAlertSchema: true
      }
    ]
    enabled: true
    groupShortName: '${resourcePrefix}-${environmentName}'
  }
}

resource sustainedHighCpuAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${applicationName}-sustained-high-cpu'
  location: 'global'
  tags: tags
  properties: {
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
    autoMitigate: true
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          criterionType: 'StaticThresholdCriterion'
          dimensions: []
          metricName: 'UsageNanoCores'
          metricNamespace: 'Microsoft.App/containerApps'
          name: 'SustainedHighCpu'
          operator: 'GreaterThan'
          skipMetricValidation: false
          threshold: cpuAlertThresholdNanocores
          timeAggregation: 'Average'
        }
      ]
    }
    description: 'The Container App has used more than 80% of its CPU limit for 30 minutes.'
    enabled: true
    evaluationFrequency: 'PT5M'
    scopes: [
      applicationId
    ]
    severity: 2
    targetResourceRegion: location
    targetResourceType: 'Microsoft.App/containerApps'
    windowSize: 'PT30M'
  }
}

resource postgresMetricAlerts 'Microsoft.Insights/metricAlerts@2018-03-01' = [for alert in postgresAlerts: if (environmentName == 'prod') {
  name: '${postgresServerName}-${alert.name}'
  location: 'global'
  tags: tags
  properties: {
    actions: [
      {
        actionGroupId: actionGroup.id
      }
    ]
    autoMitigate: true
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          criterionType: 'StaticThresholdCriterion'
          dimensions: []
          metricName: alert.metricName
          metricNamespace: 'Microsoft.DBforPostgreSQL/flexibleServers'
          name: alert.name
          operator: alert.operator
          skipMetricValidation: false
          threshold: alert.threshold
          timeAggregation: alert.aggregation
        }
      ]
    }
    description: alert.description
    enabled: true
    evaluationFrequency: 'PT5M'
    scopes: [
      postgresServerId
    ]
    severity: 2
    targetResourceRegion: location
    targetResourceType: 'Microsoft.DBforPostgreSQL/flexibleServers'
    windowSize: alert.windowSize
  }
}]

resource monthlyBudget 'Microsoft.Consumption/budgets@2023-11-01' = {
  name: '${resourcePrefix}-${environmentName}-monthly'
  properties: {
    amount: monthlyBudgetAmount
    category: 'Cost'
    notifications: {
      Forecasted80Percent: {
        contactEmails: []
        contactGroups: [
          actionGroup.id
        ]
        contactRoles: []
        enabled: true
        locale: 'pl-pl'
        operator: 'GreaterThanOrEqualTo'
        threshold: 80
        thresholdType: 'Forecasted'
      }
      Actual100Percent: {
        contactEmails: []
        contactGroups: [
          actionGroup.id
        ]
        contactRoles: []
        enabled: true
        locale: 'pl-pl'
        operator: 'GreaterThanOrEqualTo'
        threshold: 100
        thresholdType: 'Actual'
      }
    }
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: budgetStartDate
    }
  }
}
