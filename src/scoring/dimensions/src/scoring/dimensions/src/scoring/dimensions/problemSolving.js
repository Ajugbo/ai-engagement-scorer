/**
 * Problem-Solving Methodology Scorer
 * Evaluates how users approach complex tasks with AI:
 * - Decomposition: Breaking down problems into manageable steps
 * - Sequencing: Logical order of questions and tasks
 * - Goal Orientation: Maintaining focus on objectives
 */

class ProblemSolvingScorer {
  analyze(conversation) {
    const userMessages = conversation.filter(msg => msg.role === 'user');
    
    if (userMessages.length === 0) {
      return {
        score: 0,
        breakdown: {
          decomposition: 0,
          sequencing: 0,
          goalOrientation: 0
        },
        feedback: ["No user messages found in conversation"]
      };
    }
    
    const scores = {
      decomposition: this.assessDecomposition(userMessages),
      sequencing: this.assessSequencing(conversation),
      goalOrientation: this.assessGoalOrientation(conversation)
    };

    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    return {
      score: totalScore,
      breakdown: scores,
      feedback: this.generateFeedback(scores)
    };
  }

  assessDecomposition(userMessages) {
    let decompositionScore = 0;
    
    userMessages.forEach(msg => {
      let score = 0;
      const text = msg.content.toLowerCase();
      
      // Step-by-step approach markers
      const stepMarkers = ['step by step', 'first', 'then', 'next', 'finally', 'break down', 'step 1', 'step 2'];
      const hasStepLanguage = stepMarkers.some(marker => text.includes(marker));
      
      // Multiple component indicators
      const hasMultipleRequests = (text.match(/and/g) || []).length >= 2;
      const hasTaskList = text.includes('1.') && text.includes('2.'); // Numbered tasks
      
      // Problem breakdown indicators
      const hasSubTasks = text.includes('subtask') || text.includes('component') || text.includes('part');
      
      if (hasStepLanguage) score += 3;
      if (hasMultipleRequests) score += 2;
      if (hasTaskList) score += 2;
      if (hasSubTasks) score += 1;
      
      decompositionScore = Math.max(decompositionScore, score);
    });

    return Math.min(8, decompositionScore);
  }

  assessSequencing(conversation) {
    let sequencingScore = 0;
    const userMessages = conversation.filter(msg => msg.role === 'user');
    
    if (userMessages.length < 2) {
      return Math.min(8, sequencingScore);
    }
    
    // Check for logical flow between messages
    for (let i = 1; i < userMessages.length; i++) {
      const currentText = userMessages[i].content.toLowerCase();
      const previousText = userMessages[i-1].content.toLowerCase();
      
      // Continuity markers
      const continuityMarkers = [
        'building on', 'following from', 'based on previous', 
        'continue from', 'as we discussed', 'following up'
      ];
      
      const hasContinuity = continuityMarkers.some(marker => currentText.includes(marker));
      
      // Progressive complexity - check if topics build logically
      const previousHasBasic = previousText.includes('basic') || previousText.includes('simple');
      const currentHasAdvanced = currentText.includes('advanced') || currentText.includes('complex');
      
      if (hasContinuity) sequencingScore += 2;
      if (previousHasBasic && currentHasAdvanced) sequencingScore += 2;
    }
    
    // Check for topic coherence across conversation
    const mainTopics = this.extractMainTopics(conversation);
    if (mainTopics.length <= 3) { // Few topics suggest good focus
      sequencingScore += 2;
    }
    
    return Math.min(8, sequencingScore);
  }

  assessGoalOrientation(conversation) {
    let goalScore = 0;
    const userMessages = conversation.filter(msg => msg.role === 'user');
    
    if (userMessages.length === 0) return 0;
    
    const firstMessage = userMessages[0].content.toLowerCase();
    const lastMessage = userMessages[userMessages.length - 1].content.toLowerCase();
    
    // Check for clear objectives in first message
    const objectiveMarkers = [
      'objective:', 'goal:', 'i need to', 'i want to achieve', 
      'purpose:', 'aim:', 'target:', 'deliverable:'
    ];
    
    const hasClearObjective = objectiveMarkers.some(marker => firstMessage.includes(marker));
    const hasActionVerbs = firstMessage.includes('create') || firstMessage.includes('build') || 
                          firstMessage.includes('analyze') || firstMessage.includes('develop');
    
    // Check if final message indicates completion or satisfaction
    const completionMarkers = [
      'thanks', 'perfect', 'this solves', 'exactly what i needed',
      'completed', 'finished', 'that works', 'great, that answers'
    ];
    
    const indicatesCompletion = completionMarkers.some(marker => lastMessage.includes(marker));
    
    // Calculate focus ratio (messages that stay on topic)
    const totalMessages = conversation.length;
    const offTopicMarkers = ['unrelated', 'by the way', 'another question', 'completely different'];
    const relevantMessages = conversation.filter(msg => {
      const text = msg.content.toLowerCase();
      return !offTopicMarkers.some(marker => text.includes(marker));
    }).length;
    
    const focusRatio = relevantMessages / totalMessages;
    
    if (hasClearObjective) goalScore += 3;
    if (hasActionVerbs) goalScore += 1;
    if (indicatesCompletion) goalScore += 3;
    if (focusRatio > 0.8) goalScore += 2;
    
    return Math.min(9, goalScore);
  }

  extractMainTopics(conversation) {
    // Simple topic extraction based on common keywords
    const topics = new Set();
    const topicKeywords = [
      'research', 'analysis', 'plan', 'strategy', 'design', 'develop',
      'write', 'create', 'build', 'analyze', 'calculate', 'optimize'
    ];
    
    conversation.forEach(msg => {
      const text = msg.content.toLowerCase();
      topicKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          topics.add(keyword);
        }
      });
    });
    
    return Array.from(topics);
  }

  generateFeedback(scores) {
    const feedback = [];
    
    if (scores.decomposition < 3) {
      feedback.push("Break complex problems into smaller steps - use 'step by step' or numbered tasks");
    }
    if (scores.sequencing < 3) {
      feedback.push("Build questions logically - reference previous answers and maintain topic flow");
    }
    if (scores.goalOrientation < 3) {
      feedback.push("Start with clear objectives and maintain focus throughout the conversation");
    }
    
    return feedback.length > 0 ? feedback : ["Your problem-solving approach is strategic and effective! You break down tasks well and maintain clear goals."];
  }
}

module.exports = new ProblemSolvingScorer();
