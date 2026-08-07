import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini if API key is provided
let genAI = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[AI Service] Gemini API initialized successfully.');
  } catch (error) {
    console.error('[AI Service] Failed to initialize Gemini API:', error);
  }
} else {
  console.log('[AI Service] No Gemini API key found. Falling back to deterministic rules.');
}

/**
 * Perform adaptation analysis using Gemini AI.
 * Falls back to null if AI is not configured or fails.
 */
export async function analyzeWithGemini(problemInfo, contextInfo, matchedSolution, comparisonGrid) {
  if (!genAI) {
    return null;
  }

  try {
    // We use gemini-1.5-flash as the standard reliable, fast model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const prompt = `
You are a senior full-stack AI engineer, product designer, and software architect.
Your task is to analyze a proven case study and adapt its implementation to a target context.

Proven Case Study:
${JSON.stringify(matchedSolution, null, 2)}

User's Problem:
- Title: ${problemInfo.title}
- Description: ${problemInfo.description}
- Domain: ${problemInfo.domain}
- Desired Outcome: ${problemInfo.desiredOutcome}

User's Target Context:
- Organization Name: ${contextInfo.orgName || 'N/A'}
- Organization Type: ${contextInfo.orgType}
- Target Population/Scale: ${contextInfo.population} users/students
- Budget: ₹${contextInfo.budget}
- Available People/Volunteers: ${contextInfo.people}
- Time/Duration: ${contextInfo.duration || contextInfo.timeAvailable}
- Available Infrastructure: ${contextInfo.infrastructure}
- Major Constraints: ${contextInfo.constraints ? (Array.isArray(contextInfo.constraints) ? contextInfo.constraints.join(', ') : contextInfo.constraints) : 'None'}
- Goals: ${contextInfo.goal || contextInfo.goals || 'None'}

Context Gaps Analysis Comparison:
${JSON.stringify(comparisonGrid, null, 2)}

Instructions:
1. Evaluate why the case matches the problem. Give 2 to 3 concise, convincing prototype match reasons.
2. Formulate Adaptation Decisions:
   - RETAIN: Core success factors / principles that should be preserved.
   - MODIFY: Operational changes to original case steps due to target resource differences (specifically budget cuts, personnel limits, or compressed timeline).
   - AVOID: Expensive, high-resource, or high-overhead items that the target context cannot support or does not need.
   - ADD: Digital tools, tracking methods, local adaptations, or resource-sharing tactics needed to address constraints or higher scales in the target context.
3. Build an Action Plan (Timeline Roadmap) split into 3 logical phases: Phase 1 (Setup), Phase 2 (Execution/Engagement), and Phase 3 (Evaluation/Review). Use appropriate timing based on the target duration.
4. Formulate expected outcomes, risks, and required resources based on constraints.

Respond ONLY with a valid JSON object matching this schema:
{
  "matchReasons": ["Reason 1", "Reason 2"],
  "adaptation": {
    "retain": [
      { "item": "Core element to retain", "reason": "Explanation why this core success factor works" }
    ],
    "modify": [
      { "original": "Original item in case", "adapted": "Adapted version for target", "reason": "Operational reason for this modification" }
    ],
    "avoid": [
      { "item": "Original item to avoid", "reason": "Reason why it is avoided (e.g. cost, logistics)" }
    ],
    "add": [
      { "item": "New item to add", "reason": "Reason why this new item is necessary under target constraints" }
    ]
  },
  "actionPlan": {
    "strategyName": "The custom adapted strategy title",
    "phases": [
      {
        "title": "PHASE 1 — SETUP",
        "duration": "E.g. Week 1",
        "tasks": ["Task 1", "Task 2"]
      },
      {
        "title": "PHASE 2 — ENGAGEMENT",
        "duration": "E.g. Weeks 2-6",
        "tasks": ["Task 1", "Task 2"]
      },
      {
        "title": "PHASE 3 — EVALUATION",
        "duration": "E.g. Weeks 7-8",
        "tasks": ["Task 1", "Task 2"]
      }
    ],
    "resourcesRequired": ["Resource 1", "Resource 2"],
    "risks": ["Risk 1", "Risk 2"],
    "expectedOutcomes": ["Outcome 1", "Outcome 2"]
  }
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsedData = JSON.parse(text);
    return parsedData;

  } catch (error) {
    console.error('[AI Service] Gemini analysis failed. Falling back to rule-based logic:', error);
    return null;
  }
}
