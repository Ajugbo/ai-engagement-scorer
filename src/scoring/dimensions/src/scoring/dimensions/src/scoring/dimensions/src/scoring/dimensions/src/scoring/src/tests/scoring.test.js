/**
 * Test Suite for AI Engagement Scorer
 * Tests all scoring dimensions and edge cases
 */

const ScoringEngine = require('../src/scoring/scoringEngine');

describe('AI Engagement Scorer', () => {
  let scoringEngine;

  beforeEach(() => {
    scoringEngine = new ScoringEngine();
  });

  describe('Basic Functionality', () => {
    test('should initialize scoring engine with all dimensions', () => {
      expect(scoringEngine.dimensions).toHaveProperty('promptEngineering');
      expect(scoringEngine.dimensions).toHaveProperty('iterativeRefinement');
      expect(scoringEngine.dimensions).toHaveProperty('problemSolving');
      expect(scoringEngine.dimensions).toHaveProperty('criticalThinking');
    });

    test('should return dimension descriptions', () => {
      const dimensions = scoringEngine.getDimensionDescriptions();
      expect(dimensions).toHaveProperty('promptEngineering');
      expect(dimensions.promptEngineering).toHaveProperty('description');
      expect(dimensions.promptEngineering).toHaveProperty('criteria');
    });
  });

  describe('Novice Conversation Analysis', () => {
    test('should score novice conversation correctly', () => {
      const noviceConversation = [
        { role: 'user', content: 'help me with marketing' },
        { role: 'assistant', content: 'Sure, I can help with marketing. What specifically do you need?' },
        { role: 'user', content: 'make it better' }
      ];

      const result = scoringEngine.analyzeConversation(noviceConversation);
      
      expect(result.overallScore).toBeLessThan(40);
      expect(result.proficiencyLevel).toBe('Novice');
      expect(result.dimensionScores.promptEngineering).toBeLessThan(10);
      expect(result.feedback).toBeInstanceOf(Array);
      expect(result.conversationStats.totalMessages).toBe(3);
    });

    test('should handle empty user messages', () => {
      const conversation = [
        { role: 'assistant', content: 'Hello! How can I help you?' }
      ];

      const result = scoringEngine.analyzeConversation(conversation);
      
      expect(result.overallScore).toBe(0);
      expect(result.proficiencyLevel).toBe('Novice');
    });
  });

  describe('Expert Conversation Analysis', () => {
    test('should score expert conversation correctly', () => {
      const expertConversation = [
        {
          role: 'user',
          content: `Act as a senior software architect with 15 years experience in cloud infrastructure.

          I need to design a scalable microservices architecture for an e-commerce platform expecting 1 million daily users.
          
          Requirements:
          - Handle 10,000 concurrent users during peak sales
          - 99.9% uptime requirement
          - Multi-region deployment for latency optimization
          - Budget: $50,000/month infrastructure cost
          
          Please provide:
          1. High-level architecture diagram description
          2. Technology stack recommendations with justification
          3. Cost breakdown estimation
          4. Scaling strategy for each component`
        },
        {
          role: 'assistant',
          content: 'Based on your requirements, I recommend a cloud-native microservices architecture...'
        },
        {
          role: 'user',
          content: `Thanks for the initial design. For the database layer, I need more specifics on the read/write splitting strategy. Also, please provide concrete evidence for why you chose Kubernetes over AWS ECS, including performance benchmarks if available.`
        }
      ];

      const result = scoringEngine.analyzeConversation(expertConversation);
      
      expect(result.overallScore).toBeGreaterThan(70);
      expect(result.proficiencyLevel).toBe('Advanced');
      expect(result.dimensionScores.promptEngineering).toBeGreaterThan(15);
      expect(result.dimensionScores.criticalThinking).toBeGreaterThan(15);
      expect(result.detailedBreakdown).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid conversation format', () => {
      expect(() => {
        scoringEngine.analyzeConversation('not an array');
      }).toThrow('Conversation must be an array of messages');
    });

    test('should throw error for missing message role', () => {
      const invalidConversation = [
        { content: 'This message has no role' }
      ];

      expect(() => {
        scoringEngine.analyzeConversation(invalidConversation);
      }).toThrow('Message at index 0 must have role and content properties');
    });

    test('should throw error for invalid message role', () => {
      const invalidConversation = [
        { role: 'invalid', content: 'Hello' }
      ];

      expect(() => {
        scoringEngine.analyzeConversation(invalidConversation);
      }).toThrow();
    });

    test('should handle non-string content gracefully', () => {
      const invalidConversation = [
        { role: 'user', content: 12345 }
      ];

      expect(() => {
        scoringEngine.analyzeConversation(invalidConversation);
      }).toThrow('Message content at index 0 must be a string');
    });
  });

  describe('Proficiency Level Classification', () => {
    test('should classify Novice correctly', () => {
      expect(scoringEngine.getProficiencyLevel(25)).toBe('Novice');
      expect(scoringEngine.getProficiencyLevel(40)).toBe('Novice');
    });

    test('should classify Intermediate correctly', () => {
      expect(scoringEngine.getProficiencyLevel(41)).toBe('Intermediate');
      expect(scoringEngine.getProficiencyLevel(55)).toBe('Intermediate');
    });

    test('should classify Proficient correctly', () => {
      expect(scoringEngine.getProficiencyLevel(61)).toBe('Proficient');
      expect(scoringEngine.getProficiencyLevel(75)).toBe('Proficient');
    });

    test('should classify Advanced correctly', () => {
      expect(scoringEngine.getProficiencyLevel(76)).toBe('Advanced');
      expect(scoringEngine.getProficiencyLevel(85)).toBe('Advanced');
    });

    test('should classify Expert correctly', () => {
      expect(scoringEngine.getProficiencyLevel(86)).toBe('Expert');
      expect(scoringEngine.getProficiencyLevel(95)).toBe('Expert');
    });
  });

  describe('Conversation Statistics', () => {
    test('should calculate correct conversation stats', () => {
      const conversation = [
        { role: 'user', content: 'Hello there' }, // 2 words
        { role: 'assistant', content: 'Hi! How can I help you today?' }, // 6 words
        { role: 'user', content: 'I need help with programming' } // 5 words
      ];

      const result = scoringEngine.analyzeConversation(conversation);
      
      expect(result.conversationStats.totalMessages).toBe(3);
      expect(result.conversationStats.userMessages).toBe(2);
      expect(result.conversationStats.assistantMessages).toBe(1);
      expect(result.conversationStats.averageUserWords).toBe(3.5); // (2 + 5) / 2
      expect(result.conversationStats.conversationDuration).toBeDefined();
    });
  });
});
