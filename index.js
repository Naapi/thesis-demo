require('dotenv').config();
const express = require('express');
const path = require('path');
const { DefaultAzureCredential, ManagedIdentityCredential } = require('@azure/identity');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Azure Managed Identity setup
let credential;
if (process.env.AZURE_CLIENT_ID) {
  // Use Managed Identity when deployed to Azure
  credential = new ManagedIdentityCredential(process.env.AZURE_CLIENT_ID);
  console.log('Using Managed Identity with Client ID:', process.env.AZURE_CLIENT_ID);
} else {
  // Use DefaultAzureCredential for local development
  credential = new DefaultAzureCredential();
  console.log('Using DefaultAzureCredential for local development');
}

// Store credential for use in routes
app.locals.azureCredential = credential;

// Routes
app.get('/', (req, res) => {
  res.render('login', {
    title: 'Login - Thesis Demo',
    message: null
  });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Basic validation
  if (!username || !password) {
    return res.render('login', {
      title: 'Login - Thesis Demo',
      message: 'Please enter both username and password'
    });
  }
  
  // Simple demo authentication (in production, use proper authentication)
  if (username && password) {
    // Successful login - redirect to dashboard
    res.redirect('/dashboard');
  } else {
    res.render('login', {
      title: 'Login - Thesis Demo',
      message: 'Invalid credentials'
    });
  }
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard - Thesis Demo',
    username: 'User',
    azureEnabled: !!process.env.AZURE_CLIENT_ID
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    azureManagedIdentity: !!process.env.AZURE_CLIENT_ID
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
