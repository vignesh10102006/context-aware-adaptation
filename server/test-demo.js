import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchSolutions } from './services/matchingEngine.js';
import { compareContexts } from './services/contextComparison.js';
import { adaptSolution } from './services/adaptationEngine.js';
import { generateActionPlan } from './services/actionPlanGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SOLUTIONS_FILE = path.join(__dirname, 'data', 'solutions.json');

// Mock User Request matching the required demo path
const problemInfo = {
  title: "Low student participation in entrepreneurship activities",
  description: "Students are not showing interest in our entrepreneurial seminars and workshops, resulting in low attendance and low engagement in department business activities.",
  domain: "Education",
  desiredOutcome: "Increase student interest and active enrollment in entrepreneurship programs."
};

const contextInfo = {
  orgName: "KAIRO Academy",
  orgType: "College",
  population: "5000",
  budget: "50000",
  people: "10",
  duration: "2 months",
  infrastructure: "Existing classrooms",
  constraints: ["low budget", "limited volunteers", "limited mentors"],
  goal: "increase student participation"
};

function runTest() {
  console.log("=========================================");
  console.log("   RUNNING LOCAL DEMO HEURISTICS TEST     ");
  console.log("=========================================");

  // 1. Load solutions
  const solutions = JSON.parse(fs.readFileSync(SOLUTIONS_FILE, 'utf8'));
  console.log(`Loaded ${solutions.length} cases from solutions database.`);

  // 2. Test matching engine
  const matches = matchSolutions(problemInfo, contextInfo, solutions);
  const bestMatch = matches[0];
  console.log("\n[TEST] 1. Matching Result:");
  console.log(`- Matched Case: ${bestMatch.solution.title} (ID: ${bestMatch.solution.id})`);
  console.log(`- Score: ${bestMatch.matchScore}% (Expected: 86%)`);
  console.log(`- Reasons:`, bestMatch.matchReasons);

  if (bestMatch.solution.id !== 'student-ambassador' || bestMatch.matchScore !== 86) {
    console.error("FAIL: Match score should be 86% and matched case should be student-ambassador.");
    process.exit(1);
  }

  // 3. Test comparison engine
  const comparison = compareContexts(bestMatch.solution.context, contextInfo);
  console.log("\n[TEST] 2. Comparison Result:");
  console.table(comparison.map(c => ({
    Dimension: c.dimension,
    Original: c.original,
    Target: c.target,
    Difference: c.difference,
    Severity: c.severity
  })));

  // Validate gap values
  const budgetGap = comparison.find(c => c.dimension === 'Budget');
  if (budgetGap.difference !== '75% lower' || budgetGap.severity !== 'high') {
    console.error("FAIL: Budget difference must be 75% lower with HIGH severity.");
    process.exit(1);
  }

  // 4. Test adaptation engine
  const adaptation = adaptSolution(bestMatch.solution, comparison, contextInfo);
  console.log("\n[TEST] 3. Adaptation Decisions:");
  console.log("- RETAIN:");
  adaptation.retain.forEach(r => console.log(`  * ${r.item} -> ${r.reason}`));
  console.log("- MODIFY:");
  adaptation.modify.forEach(m => console.log(`  * ${m.original} => ${m.adapted} (${m.reason})`));
  console.log("- AVOID:");
  adaptation.avoid.forEach(a => console.log(`  * ${a.item} -> ${a.reason}`));
  console.log("- ADD:");
  adaptation.add.forEach(ad => console.log(`  * ${ad.item} -> ${ad.reason}`));

  // Check adaptation assertions
  const modVolunteers = adaptation.modify.find(m => m.original.includes("20"));
  if (!modVolunteers || !modVolunteers.adapted.includes("1 ambassador per department")) {
    console.error("FAIL: Adaptation must modify '20 ambassadors' to '1 ambassador per department'.");
    process.exit(1);
  }

  // 5. Test action plan generator
  const actionPlan = generateActionPlan(bestMatch.solution, adaptation, contextInfo);
  console.log("\n[TEST] 4. Roadmap Action Plan:");
  console.log(`Adapted Strategy: ${actionPlan.strategyName}`);
  actionPlan.phases.forEach(p => {
    console.log(`\n  ${p.title} (${p.duration})`);
    p.tasks.forEach(t => console.log(`    - ${t}`));
  });

  console.log("\nResources Required:", actionPlan.resourcesRequired);
  console.log("Risks Identified:", actionPlan.risks);
  console.log("Expected Outcomes:", actionPlan.expectedOutcomes);

  console.log("\n=========================================");
  console.log("      ALL HEURISTIC TESTS PASSED SUCCESS  ");
  console.log("=========================================");
}

runTest();
