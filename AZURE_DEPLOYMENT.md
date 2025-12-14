# Azure App Service Deployment Guide

This guide provides step-by-step instructions for deploying the Thesis Demo application to Azure App Service with Managed Identity.

## Prerequisites

1. Azure CLI installed and authenticated
2. Active Azure subscription
3. Resource group created (or create a new one)

## Step 1: Create App Service Plan

```bash
# Create a resource group (if you don't have one)
az group create \
  --name thesis-demo-rg \
  --location eastus

# Create an App Service Plan (Linux, Node.js 24)
az appservice plan create \
  --name thesis-demo-plan \
  --resource-group thesis-demo-rg \
  --sku B1 \
  --is-linux
```

## Step 2: Create Web App

```bash
# Create a Web App with Node.js 24 LTS runtime
az webapp create \
  --resource-group thesis-demo-rg \
  --plan thesis-demo-plan \
  --name thesis-demo-app \
  --runtime "NODE:24-lts"
```

**Note:** Replace `thesis-demo-app` with a unique name (must be globally unique).

## Step 3: Enable System-Assigned Managed Identity

```bash
# Enable managed identity
az webapp identity assign \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app
```

This command will output the `principalId` and `tenantId`. Save the `principalId` for later use.

## Step 4: Get Managed Identity Client ID

```bash
# Get the client ID of the managed identity
az webapp identity show \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app \
  --query principalId -o tsv
```

## Step 5: Configure Application Settings

```bash
# Set environment variables
az webapp config appsettings set \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app \
  --settings \
    NODE_ENV=production \
    WEBSITE_NODE_DEFAULT_VERSION=~24
```

If you want to explicitly set the Managed Identity Client ID:
```bash
# Get the client ID
CLIENT_ID=$(az webapp identity show \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app \
  --query principalId -o tsv)

# Set it as an app setting
az webapp config appsettings set \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app \
  --settings AZURE_CLIENT_ID=$CLIENT_ID
```

## Step 6: Deploy Application

### Option A: Deploy from Local Git

```bash
# Configure deployment from local git
az webapp deployment source config-local-git \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app

# Get the deployment URL
DEPLOY_URL=$(az webapp deployment source show \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app \
  --query url -o tsv)

# Add Azure remote and push
git remote add azure $DEPLOY_URL
git push azure main
```

### Option B: Deploy from GitHub

```bash
# Configure GitHub deployment
az webapp deployment source config \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app \
  --repo-url https://github.com/YOUR_USERNAME/thesis-demo \
  --branch main \
  --manual-integration
```

### Option C: Deploy using ZIP

```bash
# Create a ZIP file (excluding node_modules and .git)
zip -r deploy.zip . -x "node_modules/*" ".git/*" "*.md" ".env*"

# Deploy the ZIP file
az webapp deployment source config-zip \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app \
  --src deploy.zip
```

## Step 7: Verify Deployment

```bash
# Get the app URL
APP_URL=$(az webapp show \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app \
  --query defaultHostName -o tsv)

echo "Your app is running at: https://$APP_URL"

# Test the health endpoint
curl https://$APP_URL/health
```

## Step 8: View Logs

```bash
# Enable application logging
az webapp log config \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app \
  --application-logging filesystem \
  --level information

# Stream logs
az webapp log tail \
  --resource-group thesis-demo-rg \
  --name thesis-demo-app
```

## Using Managed Identity with Azure Services

Once your app is deployed with Managed Identity, you can use it to access Azure services:

### Example: Access Azure Key Vault

```bash
# Create a Key Vault
az keyvault create \
  --name thesis-demo-kv \
  --resource-group thesis-demo-rg \
  --location eastus

# Grant the managed identity access to Key Vault
az keyvault set-policy \
  --name thesis-demo-kv \
  --object-id <PRINCIPAL_ID_FROM_STEP_3> \
  --secret-permissions get list
```

Then in your application code:
```javascript
const { SecretClient } = require("@azure/keyvault-secrets");
const { ManagedIdentityCredential } = require("@azure/identity");

const credential = new ManagedIdentityCredential(process.env.AZURE_CLIENT_ID);
const client = new SecretClient(
  `https://thesis-demo-kv.vault.azure.net`,
  credential
);

const secret = await client.getSecret("mySecretName");
```

## Cleanup

To delete all resources:

```bash
az group delete \
  --name thesis-demo-rg \
  --yes
```

## Troubleshooting

### Check application logs
```bash
az webapp log tail --resource-group thesis-demo-rg --name thesis-demo-app
```

### Restart the app
```bash
az webapp restart --resource-group thesis-demo-rg --name thesis-demo-app
```

### Check configuration
```bash
az webapp config appsettings list --resource-group thesis-demo-rg --name thesis-demo-app
```

### Verify Managed Identity
```bash
az webapp identity show --resource-group thesis-demo-rg --name thesis-demo-app
```

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Managed Identity Documentation](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/)
- [Azure SDK for JavaScript](https://docs.microsoft.com/javascript/azure/)
