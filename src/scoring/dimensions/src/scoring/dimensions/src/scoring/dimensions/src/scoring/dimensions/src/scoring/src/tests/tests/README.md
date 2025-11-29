# AI Engagement Scorer 🧠

A passive AI proficiency scoring system that analyzes user-AI conversations to measure engagement intelligence. Used by AI providers to understand user proficiency and provide personalized feedback.

## Features

- **4-Dimensional Scoring**: Comprehensive analysis across key engagement metrics
- **Real-time Analysis**: Instant scoring of conversation quality
- **Privacy-First**: Optional user identification with anonymized options
- **RESTful API**: Easy integration for AI platforms
- **Detailed Feedback**: Actionable insights for improvement

## Scoring Dimensions

### 1. Prompt Engineering (0-25 points)
Measures how effectively users formulate prompts:
- **Specificity**: Detail and precision in requests
- **Structure**: Organization and formatting
- **Context**: Background information provided  
- **Role Definition**: Clarity of AI role specification

### 2. Iterative Refinement (0-25 points)
Measures how users improve outputs through follow-ups:
- **Precision**: Specificity of refinement requests
- **Error Correction**: Identification and correction of mistakes
- **Progressive Improvement**: Quality improvement across iterations

### 3. Problem-Solving (0-25 points)
Evaluates strategic approach to complex tasks:
- **Decomposition**: Breaking down problems into steps
- **Sequencing**: Logical order of questions
- **Goal Orientation**: Maintaining focus on objectives

### 4. Critical Thinking (0-25 points)
Measures evaluation and validation of AI outputs:
- **Verification**: Fact-checking and accuracy assessment
- **Bias Detection**: Identification of biases and assumptions
- **Quality Assessment**: Evaluation of output quality

## Proficiency Levels

- **Expert** (86-100): Master-level AI engagement
- **Advanced** (76-85): Strategic, refined approach  
- **Proficient** (61-75): Strong across most dimensions
- **Intermediate** (41-60): Effective for simple tasks
- **Novice** (0-40): Basic prompt understanding

## Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/ai-engagement-scorer.git
cd ai-engagement-scorer

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
