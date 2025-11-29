/**
 * Critical Thinking Scorer
 * Measures how users evaluate and validate AI responses:
 * - Verification: Checking facts and accuracy
 * - Bias Detection: Identifying potential biases or assumptions
 * - Quality Assessment: Evaluating output quality and relevance
 */

class CriticalThinkingScorer {
  analyze(conversation) {
    const userMessages = conversation.filter(msg => msg.role === 'user');
    
    if (userMessages.length === 0) {
      return {
        score: 0,
        breakdown: {
          verification: 0,
          biasDetection: 0,
          qualityAssessment: 0
        },
        feedback: ["No user messages found in conversation"]
      };
    }
    
    const scores = {
      verification: this.assessVerification(userMessages),
      biasDetection: this.assessBiasDetection(userMessages),
      qualityAssessment: this.assessQualityAssessment(userMessages)
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    return {
      score: totalScore,
      breakdown: scores,
      feedback: this.generateFeedback(scores)
    };
  }

  assessVerification(userMessages) {
    let verificationScore = 0;
    
    userMessages.forEach(msg => {
      let score = 0;
      const text = msg.content.toLowerCase();
      
      // Fact-checking and verification markers
      const verificationMarkers = [
        'verify', 'check', 'is this correct', 'source', 'reference',
        'fact check', 'evidence', 'proof', 'citation', 'confirm',
        'is this accurate', 'double check', 'validate'
      ];
      
      // Expressions of doubt or questioning
      const doubtMarkers = [
        'are you sure', 'i think', 'actually', 'but what about',
        'this seems', 'i doubt', 'is that right', 'correction'
      ];
      
      // Request for sources or evidence
      const sourceRequests = text.includes('source') || text.includes('reference') || text.includes('citation');
      
      if (verificationMarkers.some(marker => text.includes(marker))) score += 3;
      if (doubtMarkers.some(marker => text.includes(marker))) score += 2;
      if (sourceRequests) score += 2;
      
      verificationScore = Math.max(verificationScore, score);
    });

    return Math.min(8, verificationScore);
  }

  assessBiasDetection(userMessages) {
    let biasScore = 0;
    
    userMessages.forEach(msg => {
      let score = 0;
      const text = msg.content.toLowerCase();
      
      // Bias and assumption awareness markers
      const biasMarkers = [
        'bias', 'assumption', 'perspective', 'point of view',
        'limitation', 'constraint', 'what if', 'alternative',
        'balanced', 'neutral', 'objective', 'subjective'
      ];
      
      // Critical questioning patterns
      const challengeMarkers = [
        'why', 'how do you know', 'what makes you think',
        'what evidence', 'prove it', 'justify', 'explain why'
      ];
      
      // Consideration of alternatives
      const alternativeMarkers = [
        'other perspective', 'different angle', 'alternative view',
        'on the other hand', 'counterargument', 'opposing view'
      ];
      
      if (biasMarkers.some(marker => text.includes(marker))) score += 3;
      if (challengeMarkers.some(marker => text.includes(marker))) score += 2;
      if (alternativeMarkers.some(marker => text.includes(marker))) score += 2;
      
      biasScore = Math.max(biasScore, score);
    });

    return Math.min(8, biasScore);
  }

  assessQualityAssessment(userMessages) {
    let qualityScore = 0;
    
    userMessages.forEach(msg => {
      let score = 0;
      const text = msg.content.toLowerCase();
      
      // Quality evaluation markers
      const qualityMarkers = [
        'quality', 'better', 'improve', 'enhance', 'refine',
        'more detailed', 'more specific', 'higher quality',
        'comprehensive', 'thorough', 'depth', 'clarity'
      ];
      
      // Specific improvement criteria
      const improvementCriteria = [
        'make it more concise', 'add more details', 'simplify',
        'more examples', 'better structure', 'clearer',
        'more professional', 'more engaging', 'more practical'
      ];
      
      // Comparative assessment
      const comparativeMarkers = [
        'this is good but', 'could be better', 'needs improvement',
        'not quite right', 'almost there', 'getting closer'
      ];
      
      if (qualityMarkers.some(marker => text.includes(marker))) score += 3;
      if (improvementCriteria.some(marker => text.includes(marker))) score += 3;
      if (comparativeMarkers.some(marker => text.includes(marker))) score += 2;
      
      qualityScore = Math.max(qualityScore, score);
    });

    return Math.min(9, qualityScore);
  }

  generateFeedback(scores) {
    const feedback = [];
    
    if (scores.verification < 3) {
      feedback.push("Practice verifying AI outputs - ask for sources and double-check important facts");
    }
    if (scores.biasDetection < 3) {
      feedback.push("Consider potential biases in AI responses and ask for alternative perspectives");
    }
    if (scores.qualityAssessment < 3) {
      feedback.push("Evaluate output quality more critically - specify what makes a response 'good' or needs improvement");
    }
    
    return feedback.length > 0 ? feedback : ["Your critical thinking skills are excellent! You effectively evaluate and validate AI responses."];
  }
}

module.exports = new CriticalThinkingScorer();
