/**
 * Main Scoring Engine
 * Orchestrates all four scoring dimensions and calculates overall proficiency
 * Dimensions: Prompt Engineering, Iterative Refinement, Problem-Solving, Critical Thinking
 */

// Import all scoring dimensions
const promptEngineeringScorer = require('./dimensions/promptEngineering');
const iterativeRefinementScorer = require('./dimensions/iterativeRefinement');
const problemSolvingScorer = require('./dimensions/problemSolving');
const criticalThinkingScorer = require('./dimensions/criticalThinking');

class ScoringEngine {
  constructor() {
    this.dimensions = {
      promptEngineering: promptEngineeringScorer,
      iterativeRefinement: iterativeRefinementScorer,
      problemSolving: problemSolvingScorer,
      criticalThinking: criticalThinkingScorer
    };
  }

  /**
   * Analyze a conversation and return comprehensive scoring
   * @param {Array} conversation - Array of message objects with role and content
   * @returns {Object} Comprehensive scoring analysis
   */
  analyzeConversation(conversation) {
    // Validate input
    if (!conversation || !Array.isArray(conversation)) {
      throw new Error('Conversation must be an array of messages');
    }

    // Validate message structure
    conversation.forEach((msg, index) => {
      if (!msg.role || !msg.content) {
        throw new Error(`Message at index ${index} must have role and content properties`);
      }
      if (typeof msg.content !== 'string') {
        throw new Error(`Message content at index ${index} must be a string`);
      }
    });

    const scores = {};
    const breakdown = {};
    const allFeedback = [];

    // Score each dimension
    for (const [dimensionName, scorer] of Object.entries(this.dimensions)) {
      try {
        const result = scorer.analyze(conversation);
        scores[dimensionName] = result.score;
        breakdown[dimensionName] = result.breakdown;
        allFeedback.push(...result.feedback);
      } catch (error) {
        console.error(`Error in ${dimensionName} scoring:`, error);
        scores[dimensionName] = 0;
        breakdown[dimensionName] = {};
        allFeedback.push(`Scoring issue in ${dimensionName}`);
      }
    }

    // Calculate overall score (0-100)
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    // Remove duplicate feedback
    const uniqueFeedback = [...new Set(allFeedback)];

    return {
      overallScore: totalScore,
      proficiencyLevel: this.getProficiencyLevel(totalScore),
      dimensionScores: scores,
      detailedBreakdown: breakdown,
      feedback: uniqueFeedback,
      analysisTimestamp: new Date().toISOString(),
      conversationStats: this.getConversationStats(conversation)
    };
  }

  /**
   * Convert numerical score to proficiency level
   * @param {number} score - Overall score from 0-100
   * @returns {string} Proficiency level
   */
  getProficiencyLevel(score) {
    if (score >= 86) return 'Expert';
    if (score >= 76) return 'Advanced';
    if (score >= 61) return 'Proficient';
    if (score >= 41) return 'Intermediate';
    return 'Novice';
  }

  /**
   * Generate conversation statistics
   * @param {Array} conversation - Conversation array
   * @returns {Object} Conversation statistics
   */
  getConversationStats(conversation) {
    const userMessages = conversation.filter(msg => msg.role === 'user');
    const assistantMessages = conversation.filter(msg => msg.role === 'assistant');
    
    const totalUserWords = userMessages.reduce((sum, msg) => sum + msg.content.split(/\s+/).length, 0);
    const totalAssistantWords = assistantMessages.reduce((sum, msg) => sum + msg.content.split(/\s+/).length, 0);
    
    return {
      totalMessages: conversation.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      averageUserWords: userMessages.length > 0 ? Math.round(totalUserWords / userMessages.length) : 0,
      averageAssistantWords: assistantMessages.length > 0 ? Math.round(totalAssistantWords / assistantMessages.length) : 0,
      conversationDuration: this.estimateConversationDuration(conversation)
    };
  }

  /**
   * Estimate conversation duration based on word count and typical reading/writing speeds
   * @param {Array} conversation - Conversation array
   * @returns {string} Estimated duration in minutes
   */
  estimateConversationDuration(conversation) {
    const totalWords = conversation.reduce((sum, msg) => sum + msg.content.split(/\s+/).length, 0);
    
    // Assume 200 words/minute reading speed and 40 words/minute writing speed
    const readingTime = totalWords / 200;
    const writingTime = totalWords / 40;
    
    const totalMinutes = Math.ceil(readingTime + writingTime);
    
    return totalMinutes <= 1 ? '1 minute' : `${totalMinutes} minutes`;
  }

  /**
   * Get detailed explanation of scoring dimensions
   * @returns {Object} Dimension descriptions and scoring criteria
   */
  getDimensionDescriptions() {
    return {
      promptEngineering: {
        description: "Measures how effectively users formulate prompts",
        criteria: {
          specificity: "Detail and precision in requests (0-6)",
          structure: "Organization and formatting (0-6)", 
          context: "Background information provided (0-6)",
          roleDefinition: "Clarity of AI role specification (0-7)"
        }
      },
      iterativeRefinement: {
        description: "Measures how users improve outputs through follow-ups",
        criteria: {
          precision: "Specificity of refinement requests (0-8)",
          errorCorrection: "Identification and correction of mistakes (0-8)",
          progressiveImprovement: "Quality improvement across iterations (0-9)"
        }
      },
      problemSolving: {
        description: "Evaluates strategic approach to complex tasks",
        criteria: {
          decomposition: "Breaking down problems into steps (0-8)",
          sequencing: "Logical order of questions (0-8)",
          goalOrientation: "Maintaining focus on objectives (0-9)"
        }
      },
      criticalThinking: {
        description: "Measures evaluation and validation of AI outputs",
        criteria: {
          verification: "Fact-checking and accuracy assessment (0-8)",
          biasDetection: "Identification of biases and assumptions (0-8)",
          qualityAssessment: "Evaluation of output quality (0-9)"
        }
      }
    };
  }
}

module.exports = ScoringEngine;
