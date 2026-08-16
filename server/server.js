import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environmental variables
dotenv.config();

// Imports of core services
import { matchSolutions } from './services/matchingEngine.js';
import { compareContexts } from './services/contextComparison.js';
import { adaptSolution } from './services/adaptationEngine.js';
import { generateActionPlan } from './services/actionPlanGenerator.js';
import { analyzeWithGemini } from './services/aiService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Setup directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOLUTIONS_FILE_PATH = path.join(__dirname, 'data', 'solutions.json');
const FEEDBACK_FILE_PATH = path.join(__dirname, 'data', 'feedback.json');

app.use(cors());
app.use(express.json());

// Helper to load solutions
function loadSolutions() {
  try {
    const data = fs.readFileSync(SOLUTIONS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading solutions dataset:', error);
    return [];
  }
}

// 1. GET /api/solutions
app.get('/api/solutions', (req, res) => {
  const solutions = loadSolutions();
  // Map solutions to exclude details if needed, or return all
  res.json(solutions);
});

// 2. GET /api/solutions/:id
app.get('/api/solutions/:id', (req, res) => {
  const solutions = loadSolutions();
  const solution = solutions.find(s => s.id === req.params.id);
  if (!solution) {
    return res.status(404).json({ error: 'Solution not found' });
  }
  res.json(solution);
});

// 3. POST /api/analyze - Complete Orchestrated Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { problem, context } = req.body;

    // Form validation checks
    if (!problem || !problem.title || !problem.description || !problem.domain) {
      return res.status(400).json({ error: 'Missing required problem fields: title, description, domain' });
    }
    if (!context || !context.population || !context.budget || !context.people || !context.duration) {
      return res.status(400).json({ error: 'Missing required context fields: population, budget, people, duration' });
    }

    const solutions = loadSolutions();
    if (solutions.length === 0) {
      return res.status(500).json({ error: 'No solutions available in the seed database' });
    }

    // A. Match solutions and find the best rank
    const matchResults = matchSolutions(problem, context, solutions);
    const bestMatch = matchResults[0];

    if (!bestMatch) {
      return res.status(404).json({ error: 'Could not find any suitable match' });
    }

    const selectedSolution = bestMatch.solution;
    let matchScore = bestMatch.matchScore;
    let matchReasons = bestMatch.matchReasons;

    // B. Perform context gap comparison (always run locally for data precision)
    const contextComparison = compareContexts(selectedSolution.context, context);

    // Pre-calculate deterministic fallback baselines
    const deterministicAdaptation = adaptSolution(selectedSolution, contextComparison, context);
    const deterministicActionPlan = generateActionPlan(selectedSolution, deterministicAdaptation, context);

    let adaptation = null;
    let actionPlan = null;
    let isAIUsed = false;

    // C. Try Gemini API if key is present
    const geminiResult = await analyzeWithGemini(
      problem,
      context,
      selectedSolution,
      contextComparison,
      deterministicAdaptation,
      deterministicActionPlan
    );

    if (geminiResult) {
      adaptation = geminiResult.adaptation;
      actionPlan = geminiResult.actionPlan;
      if (geminiResult.matchReasons && geminiResult.matchReasons.length > 0) {
        matchReasons = geminiResult.matchReasons;
      }
      isAIUsed = true;
      console.log('[API] Successfully processed analysis using Gemini.');
    } else {
      // D. Fallback to local rule engines
      adaptation = deterministicAdaptation;
      actionPlan = deterministicActionPlan;
      console.log('[API] Handled request using local deterministic rule engines.');
    }

    res.json({
      selectedSolution,
      matchScore,
      matchReasons,
      contextComparison,
      adaptation,
      actionPlan,
      isAIUsed
    });

  } catch (error) {
    console.error('Error during analysis API processing:', error);
    res.status(500).json({ error: 'Internal server analysis error: ' + error.message });
  }
});

// 4. POST /api/feedback - Save outcome loops
app.post('/api/feedback', (req, res) => {
  try {
    const feedbackData = req.body;
    if (!feedbackData.solutionId || !feedbackData.status) {
      return res.status(400).json({ error: 'Missing required feedback fields: solutionId, status' });
    }

    let logs = [];
    if (fs.existsSync(FEEDBACK_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(FEEDBACK_FILE_PATH, 'utf8');
        logs = JSON.parse(fileContent);
      } catch (e) {
        logs = [];
      }
    }

    const newLog = {
      id: `fb_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...feedbackData
    };

    logs.push(newLog);
    fs.writeFileSync(FEEDBACK_FILE_PATH, JSON.stringify(logs, null, 2), 'utf8');
    res.json({ success: true, loggedFeedback: newLog });
  } catch (error) {
    console.error('Error recording project feedback:', error);
    res.status(500).json({ error: 'Failed to record feedback database entry' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  CONTEXT-AWARE ADAPTATION BACKEND SERVER RUNNING  `);
  console.log(`  Port: http://localhost:${PORT}                   `);
  console.log(`  API endpoints ready for local execution          `);
  console.log(`==================================================`);
});
