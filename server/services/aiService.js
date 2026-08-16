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
export async function analyzeWithGemini(
  problemInfo,
  contextInfo,
  matchedSolution,
  comparisonGrid,
  deterministicAdaptation,
  deterministicActionPlan
) {
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

Context Gaps Analysis Comparison (Calculated Deterministically):
${JSON.stringify(comparisonGrid, null, 2)}

Baseline Deterministic Adaptation Rules:
${JSON.stringify(deterministicAdaptation, null, 2)}

Baseline Deterministic Action Plan:
${JSON.stringify(deterministicActionPlan, null, 2)}

Instructions:
1. Provide a detailed match reasoning explaining why the proven solution is a good fit for the user's problem. Focus on underlying principles.
2. Identify contextual differences, resource limits, and operational gaps that may not be captured by simple numeric rules. These are "contextInsights".
3. Formulate AI-adapted Adaptation Decisions inside the categories (RETAIN, MODIFY, AVOID, ADD) matching the structure of the baseline adaptation rules. Enhance the "reason" field for each item using deep contextual knowledge, and adapt the description details to fit the target constraints (e.g. how to adapt workshops or volunteers).
   - RETAIN: Core success factors / principles that should be preserved.
   - MODIFY: Operational changes to original case steps due to target resource differences (budget cuts, personnel limits, or compressed timeline).
   - AVOID: Expensive, high-resource, or high-overhead items that the target context cannot support or does not need.
   - ADD: Digital tools, tracking methods, local adaptations, or resource-sharing tactics needed to address constraints or higher scales in the target context.
4. Formulate implementation insights for the final action plan.
5. Create Phase Tasks for the 3 logical phases (Phase 1: Setup, Phase 2: Operational Execution, Phase 3: Review & Evaluation) corresponding to the timeline duration. Keep the phase structure, titles, and durations aligned with the baseline action plan, but enrich the specific tasks using AI reasoning.
6. Provide resources required, risks, and expected impact (outcomes) tailored to the target context.

Respond ONLY with a valid JSON object matching this schema:
{
  "matchReasoning": "A paragraph explaining why the proven solution is a good match for the user's problem, focusing on underlying principles.",
  "contextInsights": ["Insight 1 on contextual differences", "Insight 2 on contextual differences"],
  "adaptationReasoning": {
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
  "implementationInsights": ["Implementation advice/insight 1", "Implementation advice/insight 2"],
  "strategyName": "The custom adapted strategy title",
  "phase1Tasks": ["Setup task 1", "Setup task 2"],
  "phase2Tasks": ["Execution task 1", "Execution task 2"],
  "phase3Tasks": ["Evaluation task 1", "Evaluation task 2"],
  "resourcesRequired": ["Resource 1", "Resource 2"],
  "risks": ["Risk 1", "Risk 2"],
  "expectedImpact": ["Impact 1", "Impact 2"]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsedData = JSON.parse(text);

    // Helpers to validate arrays
    const safeArray = (arr, fallback) => (Array.isArray(arr) && arr.length > 0 ? arr : fallback);

    const safeAdaptationArray = (arr, fallback) => {
      if (!Array.isArray(arr) || arr.length === 0) return fallback;
      return arr.map(item => ({
        item: String(item.item || item.original || ''),
        reason: String(item.reason || '')
      }));
    };

    const safeModifyArray = (arr, fallback) => {
      if (!Array.isArray(arr) || arr.length === 0) return fallback;
      return arr.map(item => ({
        original: String(item.original || ''),
        adapted: String(item.adapted || ''),
        reason: String(item.reason || '')
      }));
    };

    const adaptation = {
      retain: safeAdaptationArray(parsedData.adaptationReasoning?.retain, deterministicAdaptation.retain),
      modify: safeModifyArray(parsedData.adaptationReasoning?.modify, deterministicAdaptation.modify),
      avoid: safeAdaptationArray(parsedData.adaptationReasoning?.avoid, deterministicAdaptation.avoid),
      add: safeAdaptationArray(parsedData.adaptationReasoning?.add, deterministicAdaptation.add)
    };

    const actionPlan = {
      strategyName: String(parsedData.strategyName || deterministicActionPlan.strategyName),
      phases: [
        {
          title: deterministicActionPlan.phases[0].title,
          duration: deterministicActionPlan.phases[0].duration,
          tasks: safeArray(parsedData.phase1Tasks, deterministicActionPlan.phases[0].tasks)
        },
        {
          title: deterministicActionPlan.phases[1].title,
          duration: deterministicActionPlan.phases[1].duration,
          tasks: safeArray(parsedData.phase2Tasks, deterministicActionPlan.phases[1].tasks)
        },
        {
          title: deterministicActionPlan.phases[2].title,
          duration: deterministicActionPlan.phases[2].duration,
          tasks: safeArray(parsedData.phase3Tasks, deterministicActionPlan.phases[2].tasks)
        }
      ],
      resourcesRequired: safeArray(parsedData.resourcesRequired, deterministicActionPlan.resourcesRequired),
      risks: safeArray(parsedData.risks, deterministicActionPlan.risks),
      expectedOutcomes: safeArray(parsedData.expectedImpact, deterministicActionPlan.expectedOutcomes)
    };

    // Combine matchReasoning and contextInsights into matchReasons for the client
    const matchReasons = [];
    if (parsedData.matchReasoning) {
      matchReasons.push(String(parsedData.matchReasoning));
    }
    if (Array.isArray(parsedData.contextInsights)) {
      parsedData.contextInsights.forEach(insight => {
        if (insight) matchReasons.push(String(insight));
      });
    }

    const finalMatchReasons = matchReasons.length > 0 ? matchReasons : [
      `Direct domain match in '${matchedSolution.domain}'.`,
      `Addresses similar challenge elements.`
    ];

    return {
      adaptation,
      actionPlan,
      matchReasons: finalMatchReasons
    };

  } catch (error) {
    console.error('[AI Service] Gemini analysis failed. Falling back to rule-based logic:', error);
    return null;
  }
}
