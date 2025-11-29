const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const ScoringEngine = require('./scoring/scoringEngine');

const app = express();
const scoringEngine = new ScoringEngine();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'AI Engagement Scorer',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/dimensions', (req, res) => {
  try {
    const dimensions = scoringEngine.getDimensionDescriptions();
    res.json({ success: true, dimensions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve dimensions' });
  }
});

app.post('/analyze', (req, res) => {
  try {
    const { conversation, userId, metadata } = req.body;
    
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ 
        error: 'Conversation data is required and must be an array' 
      });
    }

    const analysis = scoringEngine.analyzeConversation(conversation);
    
    res.json({
      success: true,
      userId: userId || 'anonymous',
      analysis,
      metadata: metadata || {}
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AI Engagement Scorer API running on port ${PORT}`);
});
