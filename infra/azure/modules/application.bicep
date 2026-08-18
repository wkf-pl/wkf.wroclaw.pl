param accountBaseUrl string
param applicationName string
param containerAppEnvironmentId string
param containerName string
param customDomainCertificateId string = ''
param customDomainName string = ''
@secure()
param databaseUrl string
param enableEntraAuthentication bool = false
param entraAllowedGroupId string = ''
param entraClientId string = ''

@secure()
param entraClientSecret string = ''

param entraTenantId string = ''
param imageReference string
param location string
param maximumReplicas int
param minimumReplicas int

@secure()
param payloadSecret string

param registryIdentityId string
param registryServer string
param serverUrl string
param smtpFromAddress string
param smtpFromName string
param smtpHost string

@secure()
param smtpPassword string

param smtpPort int
param smtpSecure bool
param smtpSkipVerify bool
param smtpUser string

@secure()
param storageConnectionString string

param tags object

var applicationSecrets = concat([
  {
    name: 'database-url'
    value: databaseUrl
  }
  {
    name: 'payload-secret'
    value: payloadSecret
  }
  {
    name: 'storage-connection-string'
    value: storageConnectionString
  }
], smtpPassword != '' ? [
  {
    name: 'smtp-password'
    value: smtpPassword
  }
] : [], enableEntraAuthentication ? [
  {
    name: 'entra-client-secret'
    value: entraClientSecret
  }
] : [])

var applicationEnvironmentVariables = concat([
  {
    name: 'AZURE_STORAGE_ACCOUNT_BASE_URL'
    value: accountBaseUrl
  }
  {
    name: 'AZURE_STORAGE_ALLOW_CONTAINER_CREATE'
    value: 'false'
  }
  {
    name: 'AZURE_STORAGE_CONNECTION_STRING'
    secretRef: 'storage-connection-string'
  }
  {
    name: 'AZURE_STORAGE_CONTAINER_NAME'
    value: containerName
  }
  {
    name: 'DATABASE_URL'
    secretRef: 'database-url'
  }
  {
    name: 'PAYLOAD_SECRET'
    secretRef: 'payload-secret'
  }
  {
    name: 'SERVER_URL'
    value: serverUrl
  }
  {
    name: 'SMTP_FROM_ADDRESS'
    value: smtpFromAddress
  }
  {
    name: 'SMTP_FROM_NAME'
    value: smtpFromName
  }
  {
    name: 'SMTP_HOST'
    value: smtpHost
  }
  {
    name: 'SMTP_PORT'
    value: string(smtpPort)
  }
  {
    name: 'SMTP_SECURE'
    value: smtpSecure ? 'true' : 'false'
  }
  {
    name: 'SMTP_SKIP_VERIFY'
    value: smtpSkipVerify ? 'true' : 'false'
  }
  {
    name: 'SMTP_USER'
    value: smtpUser
  }
], smtpPassword != '' ? [
  {
    name: 'SMTP_PASSWORD'
    secretRef: 'smtp-password'
  }
] : [])

resource application 'Microsoft.App/containerApps@2024-03-01' = {
  name: applicationName
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${registryIdentityId}': {}
    }
  }
  properties: {
    environmentId: containerAppEnvironmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        allowInsecure: false
        external: true
        targetPort: 3000
        transport: 'auto'
        customDomains: customDomainName != '' && customDomainCertificateId != '' ? [
          {
            bindingType: 'SniEnabled'
            certificateId: customDomainCertificateId
            name: customDomainName
          }
        ] : []
      }
      registries: [
        {
          identity: registryIdentityId
          server: registryServer
        }
      ]
      secrets: applicationSecrets
    }
    template: {
      containers: [
        {
          name: 'application'
          image: imageReference
          env: applicationEnvironmentVariables
          probes: [
            {
              type: 'Liveness'
              httpGet: {
                path: '/health'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 30
              periodSeconds: 30
              timeoutSeconds: 5
              failureThreshold: 3
            }
            {
              type: 'Readiness'
              httpGet: {
                path: '/health'
                port: 3000
                scheme: 'HTTP'
              }
              initialDelaySeconds: 10
              periodSeconds: 10
              timeoutSeconds: 5
              failureThreshold: 6
            }
          ]
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: minimumReplicas
        maxReplicas: maximumReplicas
      }
    }
  }
}

resource authentication 'Microsoft.App/containerApps/authConfigs@2024-03-01' = if (enableEntraAuthentication) {
  parent: application
  name: 'current'
  properties: {
    globalValidation: {
      excludedPaths: [
        '/health'
      ]
      redirectToProvider: 'azureactivedirectory'
      unauthenticatedClientAction: 'AllowAnonymous'
    }
    httpSettings: {
      requireHttps: true
    }
    identityProviders: {
      azureActiveDirectory: {
        enabled: true
        isAutoProvisioned: false
        registration: {
          clientId: entraClientId
          clientSecretSettingName: 'entra-client-secret'
          openIdIssuer: '${environment().authentication.loginEndpoint}${entraTenantId}/v2.0'
        }
        validation: {
          defaultAuthorizationPolicy: {
            allowedPrincipals: {
              groups: [
                entraAllowedGroupId
              ]
            }
          }
        }
      }
    }
    platform: {
      enabled: true
    }
  }
}

output fqdn string = application.properties.configuration.ingress.fqdn
output name string = application.name
