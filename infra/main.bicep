targetScope = 'resourceGroup'

@description('A short lowercase prefix used for all Azure resource names.')
param appName string

@description('PostgreSQL administrator password. Store this in a secure deployment parameter.')
@secure()
param postgresPassword string

@description('Django SECRET_KEY. Store this in a secure deployment parameter.')
@secure()
param djangoSecretKey string

@description('Server-side Gemini API key. Store this in a secure deployment parameter.')
@secure()
param geminiApiKey string

@description('SSLCOMMERZ store ID.')
param sslcommerzStoreId string = ''

@description('SSLCOMMERZ store password. Store this in a secure deployment parameter.')
@secure()
param sslcommerzStorePassword string = ''

@description('Azure region for all resources.')
param location string = resourceGroup().location

var backendName = '${appName}-api'
var frontendName = '${appName}-web'
var postgresName = '${appName}-pg'
var backendUrl = 'https://${backendName}.azurewebsites.net'
var frontendUrl = 'https://${frontendName}.azurestaticapps.net'

resource appServicePlan 'Microsoft.Web/serverfarms@2024-11-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: postgresName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: 'doctorappointment_user'
    administratorLoginPassword: postgresPassword
    version: '16'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
  }
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: postgres
  name: 'doctorappointment_db'
}

resource postgresAllowAzureServices 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
  parent: postgres
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource backend 'Microsoft.Web/sites@2024-11-01' = {
  name: backendName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'PYTHON|3.10'
      appCommandLine: 'gunicorn --chdir backend --bind=0.0.0.0 --timeout 600 config.wsgi:application'
      alwaysOn: true
      appSettings: [
        { name: 'WEBSITE_HOSTNAME', value: backendName }
        { name: 'SCM_DO_BUILD_DURING_DEPLOYMENT', value: 'True' }
        { name: 'DJANGO_SETTINGS_MODULE', value: 'config.settings' }
        { name: 'SECRET_KEY', value: djangoSecretKey }
        { name: 'DEBUG', value: 'False' }
        { name: 'USE_POSTGRES', value: 'True' }
        { name: 'ALLOWED_HOSTS', value: '${backendName},${backendName}.azurewebsites.net' }
        { name: 'CORS_ALLOWED_ORIGINS', value: frontendUrl }
        { name: 'CSRF_TRUSTED_ORIGINS', value: '${frontendUrl},${backendUrl}' }
        { name: 'SECURE_SSL_REDIRECT', value: 'True' }
        { name: 'POSTGRES_DB', value: 'doctorappointment_db' }
        { name: 'POSTGRES_USER', value: 'doctorappointment_user' }
        { name: 'POSTGRES_PASSWORD', value: postgresPassword }
        { name: 'POSTGRES_HOST', value: postgres.properties.fullyQualifiedDomainName }
        { name: 'POSTGRES_PORT', value: '5432' }
        { name: 'POSTGRES_SSLMODE', value: 'require' }
        { name: 'GEMINI_API_KEY', value: geminiApiKey }
        { name: 'GEMINI_MODEL', value: 'gemini-2.0-flash' }
        { name: 'SSLCOMMERZ_STORE_ID', value: sslcommerzStoreId }
        { name: 'SSLCOMMERZ_STORE_PASSWORD', value: sslcommerzStorePassword }
        { name: 'SSLCOMMERZ_IS_SANDBOX', value: 'True' }
        { name: 'SSLCOMMERZ_BACKEND_URL', value: '${backendUrl}/' }
        { name: 'SSLCOMMERZ_FRONTEND_URL', value: '${frontendUrl}/' }
      ]
    }
  }
  dependsOn: [ postgresDatabase ]
}

resource frontend 'Microsoft.Web/staticSites@2024-04-01' = {
  name: frontendName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
  }
}

output backendUrl string = backendUrl
output frontendUrl string = frontendUrl
output postgresHost string = postgres.properties.fullyQualifiedDomainName
