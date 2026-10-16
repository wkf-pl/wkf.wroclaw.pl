targetScope = 'subscription'

param deploymentPrincipalId string
param operationsIdentityPrincipalId string
param productionResourceGroupName string = 'rg-wkf-prod'
param registryName string
param registryResourceGroupName string = 'rg-wkf-shared'
param registryIdentityPrincipalId string
param storageAccountName string
param storageContainerName string = 'media'
param storageIdentityPrincipalId string

module productionDeploymentRole './modules/production-deployment-role.bicep' = {
  name: 'production-deployment-role'
  scope: resourceGroup(productionResourceGroupName)
  params: {
    deploymentPrincipalId: deploymentPrincipalId
  }
}

module registryRoles './modules/registry-roles.bicep' = {
  name: 'production-registry-roles'
  scope: resourceGroup(registryResourceGroupName)
  params: {
    deploymentPrincipalId: deploymentPrincipalId
    operationsIdentityPrincipalId: operationsIdentityPrincipalId
    registryIdentityPrincipalId: registryIdentityPrincipalId
    registryName: registryName
  }
}

module storageRole './modules/storage-role.bicep' = {
  name: 'production-storage-role'
  scope: resourceGroup(productionResourceGroupName)
  params: {
    storageAccountName: storageAccountName
    storageContainerName: storageContainerName
    storageIdentityPrincipalId: storageIdentityPrincipalId
    operationsIdentityPrincipalId: operationsIdentityPrincipalId
  }
}

module stagingCheckpointRole './modules/staging-checkpoint-role.bicep' = {
  name: 'production-operations-staging-checkpoint-role'
  scope: resourceGroup('rg-wkf-staging')
  params: {
    operationsIdentityPrincipalId: operationsIdentityPrincipalId
  }
}
