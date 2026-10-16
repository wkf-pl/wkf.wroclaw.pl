targetScope = 'subscription'

@minValue(1)
param amount int = 120

@description('First day of the initial monthly budget period. Keep this value stable after creation.')
param budgetStartDate string

param resourcePrefix string = 'wkf'

resource monthlyBudget 'Microsoft.Consumption/budgets@2023-11-01' = {
  name: '${resourcePrefix}-subscription-monthly'
  properties: {
    amount: amount
    category: 'Cost'
    notifications: {
      Forecasted80Percent: {
        contactEmails: []
        contactGroups: []
        contactRoles: [
          'Owner'
        ]
        enabled: true
        locale: 'pl-pl'
        operator: 'GreaterThanOrEqualTo'
        threshold: 80
        thresholdType: 'Forecasted'
      }
      Actual100Percent: {
        contactEmails: []
        contactGroups: []
        contactRoles: [
          'Owner'
        ]
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
