/**
 * AI Engagement Scorer - Main API Server
 * Provides REST API for AI providers to analyze user conversation quality
 * Endpoints:
 * - POST /analyze: Analyze conversation and return scoring
 * - GET /health: Health check endpoint
 * - GET /dimensions: Get scoring dimension descriptions
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const ScoringEngine = require('./scoring/scoringEngine');

// Initialize Express app and scoring engine
const app = express();
const scoringEngine = new ScoringEngine();

// Security middleware
app.use(helmet());

// CORS middleware (configure for production)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://ai-provider1.com', 'https://ai-provider2.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// JSON parsing middleware with limit
app.use(express.json({ limit: '10mb' }));

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'AI Engagement Scorer',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Get scoring dimension descriptions
 * GET /dimensions
 */
app.get('/dimensions', (req, res) => {
  try {
    const dimensions = scoringEngine.getDimensionDescriptions();
    res.json({
      success: true,
      dimensions
    });
  } catch (error) {
    console.error('Dimensions endpoint error:', error);
    res.status(500).json({
      error: 'Failed to retrieve dimension descriptions',
      message: error.message
    });
  }
});

/**
 * Main analysis endpoint
 * POST /analyze
 * Body: { conversation, userId, metadata }
 */
app.post('/analyze', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { conversation, userId, metadata } = req.body;
    
    // Validate required fields
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ 
        success: false,
        error: 'Conversation data is required and must be an array',
        details: 'Provide conversation as array of {role: "user"|"assistant", content: "string"}'
      });
    }

    // Validate conversation structure
    const validationError = validateConversation(conversation);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversation structure',
        details: validationError
      });
    }

    // Analyze conversation
    const analysis = scoringEngine.analyzeConversation(conversation);
    
    // Prepare response
    const response = {
      success: true,
      userId: userId || 'anonymous',
      analysis,
      metadata: metadata || {},
      analysisTime: `${Date.now() - startTime}ms`
    };

    // Log analysis (without sensitive data)
    console.log(`Analysis completed for user ${userId || 'anonymous'}: ${analysis.overallScore} points (${analysis.proficiencyLevel})`);

    res.json(response);
    
  } catch (error) {
    console.error('Analysis endpoint error:', error);
    
    res.status(500).json({ 
      success: false,
      error: 'Analysis failed', 
      message: error.message,
      analysisTime: `${Date.now() - startTime}ms`
    });
  }
});

/**
 * Validate conversation structure
 * @param {Array} conversation - Conversation array to validate
 * @returns {string|null} Error message or null if valid
 */
function validateConversation(conversation) {
  if (conversation.length === 0) {
    return 'Conversation array cannot be empty';
  }

  for (let i = 0; i < conversation.length; i++) {
    const message = conversation[i];
    
    if (!message.role) {
      return `Message at index ${i} missing 'role' property`;
    }
    
    if (!['user', 'assistant', 'system'].includes(message.role)) {
      return `Message at index ${i} has invalid role: ${message.role}. Must be 'user', 'assistant', or 'system'`;
    }
    
    if (!message.content && message.content !== '') {
      return `Message at index ${i} missing 'content' property`;
    }
    
    if (typeof message.content !== 'string') {
      return `Message at index ${i} content must be a string`;
    }
    
    // Check for reasonable content length
    if (message.content.length > 10000) {
      return `Message at index ${i} content too long (${message.content.length} characters). Maximum is 10,000.`;
    }
  }

  return null;
}

/**
 * 404 handler for undefined routes
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: {
      'GET /health': 'Service health check',
      'GET /dimensions': 'Get scoring dimension descriptions', 
      'POST /analyze': 'Analyze conversation and return scores'
    }
  });
});

/**
 * Global error handler
 */
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 AI Engagement Scorer API running on ${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/health`);
  console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
