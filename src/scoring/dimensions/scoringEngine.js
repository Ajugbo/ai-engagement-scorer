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

  analyzeConversation(conversation) {
    const scores = {};
    const breakdown = {};

    for (const [dimension, scorer] of Object.entries(this.dimensions)) {
      const result = scorer.analyze(conversation);
      scores[dimension] = result.score;
      breakdown[dimension] = result.breakdown;
    }

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    return {
      overallScore: totalScore,
      proficiencyLevel: this.getProficiencyLevel(totalScore),
      dimensionScores: scores,
      detailedBreakdown: breakdown,
      analysisTimestamp: new Date().toISOString()
    };
  }

  getProficiencyLevel(score) {
    if (score >= 86) return 'Expert';
    if (score >= 76) return 'Advanced';
    if (score >= 61) return 'Proficient';
    if (score >= 41) return 'Intermediate';
    return 'Novice';
  }

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
