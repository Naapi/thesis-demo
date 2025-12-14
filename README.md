# Thesis Demo - Node.js 24 LTS Web App

A Node.js 24 LTS web application with basic login page, built with Express.js and designed for Azure App Service deployment with Managed Identity support.

## Features

- ✅ Node.js 24 LTS support
- ✅ Express.js web framework
- ✅ Basic login page with responsive UI
- ✅ Azure Managed Identity integration
- ✅ Azure App Service ready
- ✅ EJS templating engine
- ✅ Health check endpoint
- ✅ Environment-based configuration

## Prerequisites

- Node.js 24.x or higher
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd thesis-demo
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. (Optional) Configure Azure Managed Identity by setting `AZURE_CLIENT_ID` in `.env`

## Running Locally

Start the development server:
```bash
npm start
```

Or for development mode:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Application Structure

```
thesis-demo/
├── index.js              # Main application entry point
├── views/                # EJS templates
│   ├── login.ejs        # Login page
│   └── dashboard.ejs    # Dashboard page
├── public/              # Static assets
│   └── css/
│       └── style.css    # Application styles
├── package.json         # Node.js dependencies
├── .nvmrc              # Node version specification
├── .env.example        # Environment variables template
├── web.config          # IIS/Azure App Service configuration
└── README.md           # This file
```

## API Endpoints

- `GET /` - Login page
- `POST /login` - Login form submission
- `GET /dashboard` - Dashboard (after login)
- `GET /health` - Health check endpoint

## Azure App Service Deployment

### Prerequisites

1. Azure CLI installed
2. Azure subscription
3. Resource group created

### Deployment Steps

1. **Create an Azure App Service:**
```bash
az webapp create \
  --resource-group <your-resource-group> \
  --plan <your-app-service-plan> \
  --name <your-app-name> \
  --runtime "NODE:24-lts"
```

2. **Enable Managed Identity:**
```bash
az webapp identity assign \
  --resource-group <your-resource-group> \
  --name <your-app-name>
```

3. **Configure Application Settings:**
```bash
az webapp config appsettings set \
  --resource-group <your-resource-group> \
  --name <your-app-name> \
  --settings AZURE_CLIENT_ID=<managed-identity-client-id>
```

4. **Deploy the application:**
```bash
# Using ZIP deployment
zip -r app.zip . -x "node_modules/*" ".git/*"
az webapp deployment source config-zip \
  --resource-group <your-resource-group> \
  --name <your-app-name> \
  --src app.zip
```

Or use GitHub Actions, Azure DevOps, or other CI/CD tools.

### Managed Identity Usage

The application uses Azure Managed Identity for secure authentication to Azure resources:

- **Local Development**: Uses `DefaultAzureCredential` which attempts multiple authentication methods (Azure CLI, Visual Studio Code, environment variables)
- **Azure App Service**: Uses `ManagedIdentityCredential` when `AZURE_CLIENT_ID` is configured

Example usage in code:
```javascript
const { DefaultAzureCredential, ManagedIdentityCredential } = require('@azure/identity');

let credential;
if (process.env.AZURE_CLIENT_ID) {
  credential = new ManagedIdentityCredential(process.env.AZURE_CLIENT_ID);
} else {
  credential = new DefaultAzureCredential();
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `AZURE_CLIENT_ID` | Managed Identity Client ID for Azure | No |

## Security Notes

⚠️ **Important**: This is a demo application with basic authentication. For production use:

- Implement proper authentication (OAuth, Azure AD, etc.)
- Add session management
- Use HTTPS in production
- Implement CSRF protection
- Add rate limiting
- Validate and sanitize all inputs
- Use secure password hashing (bcrypt, argon2)

## Technologies Used

- **Express.js** - Web framework
- **EJS** - Templating engine
- **@azure/identity** - Azure authentication library
- **dotenv** - Environment configuration

## License

ISC
