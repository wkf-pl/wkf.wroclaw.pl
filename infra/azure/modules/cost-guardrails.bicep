param applicationId string
param applicationName string
param budgetStartDate string

@minValue(1)
param cpuAlertThresholdNanocores int
param environmentName string
param location string

@minValue(1)
param monthlyBudgetAmount int
param resourcePrefix string
param tags object

var ownerRoleDefinitionId = '8e3af657-a8ff-443c-a75c-2fe8c4bcb635'

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
