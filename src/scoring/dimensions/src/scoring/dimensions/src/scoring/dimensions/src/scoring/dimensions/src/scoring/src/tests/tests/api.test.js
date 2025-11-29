/**
 * API Endpoint Tests
 * Tests REST API functionality and error handling
 */

const request = require('supertest');
const app = require('../src/index');

describe('API Endpoints', () => {
  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('AI Engagement Scorer');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /dimensions', () => {
    test('should return scoring dimension descriptions', async () => {
      const response = await request(app).get('/dimensions');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.dimensions).toHaveProperty('promptEngineering');
      expect(response.body.dimensions.promptEngineering.criteria).toHaveProperty('specificity');
    });
  });

  describe('POST /analyze', () => {
    test('should analyze valid conversation', async () => {
      const conversation = [
        { role: 'user', content: 'Help me write a business plan for a startup' },
        { role: 'assistant', content: 'Sure! What type of startup are you planning?' },
        { role: 'user', content: 'A tech startup focused on AI education' }
      ];

      const response = await request(app)
        .post('/analyze')
        .send({
          conversation,
          userId: 'test-user-123',
          metadata: { platform: 'test' }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe('test-user-123');
      expect(response.body.analysis.overallScore).toBeDefined();
      expect(response.body.analysis.proficiencyLevel).toBeDefined();
      expect(response.body.analysisTime).toBeDefined();
    });

    test('should reject empty conversation', async () => {
      const response = await request(app)
        .post('/analyze')
        .send({
          conversation: []
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('cannot be empty');
    });

    test('should reject invalid conversation format', async () => {
      const response = await request(app)
        .post('/analyze')
        .send({
          conversation: 'not an array'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('must be an array');
    });

    test('should reject conversation with missing roles', async () => {
      const response = await request(app)
        .post('/analyze')
        .send({
          conversation: [
            { content: 'Message without role' }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid conversation structure');
    });

    test('should handle very long conversations', async () => {
      const longConversation = Array.from({ length: 50 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i + 1} with some content`
      }));

      const response = await request(app)
        .post('/analyze')
        .send({
          conversation: longConversation,
          userId: 'stress-test-user'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.analysis.conversationStats.totalMessages).toBe(50);
    });
  });

  describe('404 Handling', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app).get('/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.availableEndpoints).toBeDefined();
    });
  });
});
