/**
 * Prompt Engineering Scorer
 * Analyzes the quality of user prompts across four dimensions:
 * - Specificity: How detailed and precise are the prompts
 * - Structure: How well organized and formatted are the prompts
 * - Context: How much background information is provided
 * - Role Definition: How clearly AI roles are specified
 */

class PromptEngineeringScorer {
  analyze(conversation) {
    const userPrompts = conversation.filter(msg => msg.role === 'user');
    
    // If no user prompts, return minimum scores
    if (userPrompts.length === 0) {
      return {
        score: 0,
        breakdown: {
          specificity: 0,
          structure: 0,
          context: 0,
          roleDefinition: 0
        },
        feedback: ["No user prompts found in conversation"]
      };
    }
    
    const scores = {
      specificity: this.assessSpecificity(userPrompts),
      structure: this.assessStructure(userPrompts),
      context: this.assessContext(userPrompts),
      roleDefinition: this.assessRoleDefinition(userPrompts)
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    return {
      score: totalScore,
      breakdown: scores,
      feedback: this.generateFeedback(scores)
    };
  }

  assessSpecificity(prompts) {
    let maxScore = 0;
    
    prompts.forEach(prompt => {
      let score = 0;
      const text = prompt.content.toLowerCase();
      const wordCount = prompt.content.split(/\s+/).length;
      
      // Word count indicates detail level
      if (wordCount > 50) score += 2;
      if (wordCount > 100) score += 1;
      
      // Specific language markers
      const specificMarkers = ['specific', 'exactly', 'precisely', 'detailed', 'particular'];
      const vagueMarkers = ['something', 'stuff', 'things', 'help me with', 'general'];
      
      if (specificMarkers.some(marker => text.includes(marker))) score += 2;
      if (!vagueMarkers.some(marker => text.includes(marker))) score += 1;
      
      maxScore = Math.max(maxScore, score);
    });

    return Math.min(6, maxScore);
  }

  assessStructure(prompts) {
    let maxScore = 0;
    
    prompts.forEach(prompt => {
      let score = 0;
      const content = prompt.content;
      
      // Check for organizational elements
      const hasBulletPoints = content.includes('-') || content.includes('•');
      const hasNumbering = /\d+\./.test(content);
      const hasSections = content.includes('\n\n');
      const lineBreaks = (content.match(/\n/g) || []).length;
      
      if (hasBulletPoints || hasNumbering) score += 3;
      if (hasSections && lineBreaks > 2) score += 2;
      if (lineBreaks > 4) score += 1;
      
      maxScore = Math.max(maxScore, score);
    });

    return Math.min(6, maxScore);
  }

  assessContext(prompts) {
    let maxScore = 0;
    
    prompts.forEach(prompt => {
      let score = 0;
      const text = prompt.content.toLowerCase();
      
      const contextMarkers = ['context:', 'background:', 'assume', 'given that', 'scenario:'];
      const hasExamples = text.includes('example') || text.includes('e.g.') || text.includes('for instance');
      const constraintMarkers = ['constraint', 'limit', 'must', 'should not', 'requirement'];
      
      if (contextMarkers.some(marker => text.includes(marker))) score += 3;
      if (hasExamples) score += 2;
      if (constraintMarkers.some(marker => text.includes(marker))) score += 1;
      
      maxScore = Math.max(maxScore, score);
    });

    return Math.min(6, maxScore);
  }

  assessRoleDefinition(prompts) {
    let maxScore = 0;
    
    prompts.forEach(prompt => {
      let score = 0;
      const text = prompt.content;
      
      const rolePatterns = [
        /act as (a|an) (.+?)(?:\.|,|\n|$)/i,
        /you are (a|an) (.+?)(?:\.|,|\n|$)/i,
        /as (a|an) (.+?)(?:\.|,|\n|$)/i
      ];
      
      rolePatterns.forEach(pattern => {
        const match = text.match(pattern);
        if (match) {
          const role = match[2];
          if (role && role.length > 5) {
            score += 3; // Basic role definition
            if (role.length > 15) score += 2; // Detailed role
            if (role.includes('with') || role.includes('experienced') || role.includes('expert')) score += 2; // Experience level
          }
        }
      });
      
      maxScore = Math.max(maxScore, score);
    });

    return Math.min(7, maxScore);
  }

  generateFeedback(scores) {
    const feedback = [];
    
    if (scores.specificity < 3) {
      feedback.push("Try to be more specific in your prompts - include details about what you need");
    }
    if (scores.structure < 3) {
      feedback.push("Consider using bullet points, numbering, or sections to organize your prompts");
    }
    if (scores.context < 3) {
      feedback.push("Provide more context and examples to help the AI understand your needs better");
    }
    if (scores.roleDefinition < 3) {
      feedback.push("Define clear roles for the AI (e.g., 'Act as a marketing expert') to improve response quality");
    }
    
    return feedback.length > 0 ? feedback : ["Your prompt engineering skills are strong! Keep up the good work."];
  }
}

module.exports = new PromptEngineeringScorer();
