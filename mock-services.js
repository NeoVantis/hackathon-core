const express = require('express');
const cors = require('cors');

// Mock Auth Service
function createAuthMockServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-service-mock', timestamp: new Date().toISOString() });
  });

  // Also provide /api/v1/health to match baseURL expectations
  app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-service-mock', path: '/api/v1/health', timestamp: new Date().toISOString() });
  });

  // Mock auth endpoints
  app.post('/api/v1/auth/admin/register', (req, res) => {
    res.json({
      success: true,
      data: {
        id: 'admin-123',
        username: req.body.username,
        name: req.body.name,
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    });
  });

  app.post('/api/v1/auth/admin/login', (req, res) => {
    res.json({
      success: true,
      data: {
        token: 'mock-jwt-token-admin-' + Date.now(),
        admin: {
          id: 'admin-123',
          username: req.body.username,
          name: 'Mock Admin',
          role: 'admin'
        }
      }
    });
  });

  // Endpoints expected by AuthService (baseURL includes /api/v1)
  app.post('/api/v1/admin/login', (req, res) => {
    res.json({
      access_token: 'mock-admin-token-' + Date.now(),
      userRole: 1,
    });
  });

  app.get('/api/v1/admin/me', (req, res) => {
    const auth = req.headers['authorization'] || '';
    res.json({
      admin: {
        id: 'admin-123',
        name: 'Mock Admin',
        username: 'mockadmin',
        role: 1,
        authHeader: auth,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  app.post('/api/v1/auth/user/register', (req, res) => {
    res.json({
      success: true,
      data: {
        id: 'user-' + Date.now(),
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        createdAt: new Date().toISOString()
      }
    });
  });

  app.get('/api/v1/auth/user/me', (req, res) => {
    res.json({
      success: true,
      data: {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        isVerified: true
      }
    });
  });

  // Endpoint expected by AuthService.getUserProfile
  app.get('/api/v1/auth/me', (req, res) => {
    res.json({
      user: {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Test User',
        isVerified: true,
        isActive: true,
        stepOneComplete: true,
        stepTwoComplete: true,
        passwordResetCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  return app;
}

// Mock Notification Service
function createNotificationMockServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notification-service-mock', timestamp: new Date().toISOString() });
  });

  // Also provide /api/v1/health to match baseURL expectations
  app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', service: 'notification-service-mock', path: '/api/v1/health', timestamp: new Date().toISOString() });
  });

  // Mock notification endpoints
  app.post('/api/v1/email/send', (req, res) => {
    console.log('📧 Mock Email Sent:', {
      to: req.body.to,
      subject: req.body.subject,
      template: req.body.template || 'generic'
    });
    
    res.json({
      success: true,
      data: {
        messageId: 'mock-message-' + Date.now(),
        status: 'sent'
      }
    });
  });

  app.post('/api/v1/email/bulk', (req, res) => {
    console.log('📧 Mock Bulk Email Sent:', {
      recipients: req.body.recipients?.length || 0,
      subject: req.body.subject
    });
    
    res.json({
      success: true,
      data: {
        batchId: 'mock-batch-' + Date.now(),
        sent: req.body.recipients?.length || 0,
        failed: 0
      }
    });
  });

  return app;
}

// Start mock servers
if (require.main === module) {
  const authApp = createAuthMockServer();
  const notificationApp = createNotificationMockServer();

  const authPort = process.env.MOCK_AUTH_PORT || 3000;
  const notificationPort = process.env.MOCK_NOTIFICATION_PORT || 4321;

  authApp.listen(authPort, () => {
    console.log(`🔐 Mock Auth Service running on port ${authPort}`);
    console.log(`   Health: http://localhost:${authPort}/health`);
  });

  notificationApp.listen(notificationPort, () => {
    console.log(`📧 Mock Notification Service running on port ${notificationPort}`);
    console.log(`   Health: http://localhost:${notificationPort}/health`);
  });

  console.log('\n🎭 Mock services are ready for testing!');
  console.log('   Press Ctrl+C to stop all services');
}

module.exports = { createAuthMockServer, createNotificationMockServer };