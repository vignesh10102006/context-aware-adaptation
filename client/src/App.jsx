import React, { useState, useEffect } from 'react';
import { 
  Home, 
  PlusCircle, 
  Database, 
  Info, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Plus, 
  Printer, 
  Download, 
  Activity, 
  Layers, 
  GitCompare, 
  Users, 
  DollarSign, 
  Clock, 
  MapPin, 
  TrendingUp, 
  UserCheck, 
  Award, 
  Loader2, 
  Send 
} from 'lucide-react';
import api from './services/api';
import './App.css';

function App() {
  // Navigation State: 'home', 'new-analysis', 'results', 'cases', 'about'
  const [currentPage, setCurrentPage] = useState('home');
  
  // Results Tab: 'match', 'compare', 'adapt', 'plan', 'dashboard'
  const [activeResultTab, setActiveResultTab] = useState('match');

  // Solutions state (all database cases)
  const [allSolutions, setAllSolutions] = useState([]);
  const [selectedDbSolution, setSelectedDbSolution] = useState(null);
  const [loadingSolutions, setLoadingSolutions] = useState(false);

  // Analysis State (Inputs)
  const [problemForm, setProblemForm] = useState({
    title: '',
    description: '',
    domain: 'Education',
    desiredOutcome: ''
  });

  const [contextForm, setContextForm] = useState({
    orgName: '',
    orgType: 'College',
    population: '',
    budget: '',
    people: '',
    duration: '',
    infrastructure: '',
    constraintsInput: '',
    goal: ''
  });

  // Current analysis wizard step: 1 (Problem), 2 (Context), 3 (Profile Review)
  const [wizardStep, setWizardStep] = useState(1);

  // API Call Statuses
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisStage, setAnalysisStage] = useState('');

  // Feedback State
  const [feedbackForm, setFeedbackForm] = useState({
    status: 'In Progress',
    outcome: '',
    worked: '',
    failed: '',
    lessons: ''
  });
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Fetch all solutions on load for the database page
  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    setLoadingSolutions(true);
    try {
      const res = await api.getSolutions();
      setAllSolutions(res.data);
    } catch (err) {
      console.error("Error fetching database solutions:", err);
    } finally {
      setLoadingSolutions(false);
    }
  };

  // Load the required Demo Scenario parameters automatically
  const handleLoadDemo = () => {
    setProblemForm({
      title: "Low student participation in entrepreneurship activities",
      description: "Students are not showing interest in our entrepreneurial seminars and workshops, resulting in low attendance and low engagement in department business activities.",
      domain: "Education",
      desiredOutcome: "Increase student interest and active enrollment in entrepreneurship programs."
    });

    setContextForm({
      orgName: "KAIRO Academy",
      orgType: "College/Institution",
      population: "5000",
      budget: "50000",
      people: "10",
      duration: "2 months",
      infrastructure: "Existing classrooms",
      constraintsInput: "low budget, limited volunteers, limited mentors",
      goal: "increase student participation"
    });

    setWizardStep(3); // jump directly to review profile for speed and clarity
  };

  // Submits the problem and context to Express backend
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError('');
    setFeedbackSuccess(false);
    
    // Simulate premium backend orchestration stages
    const stages = [
      "Analyzing problem statements & domain mappings...",
      "Extracting and indexing local context variables...",
      "Querying proven cases repository...",
      "Calculating prototype match scores...",
      "Generating context gap comparison matrices...",
      "Formulating adaptation rules (Retain / Modify / Avoid / Add)...",
      "Drafting implementation plan roadmap phases..."
    ];

    let stageIdx = 0;
    setAnalysisStage(stages[0]);
    const timer = setInterval(() => {
      stageIdx++;
      if (stageIdx < stages.length) {
        setAnalysisStage(stages[stageIdx]);
      }
    }, 700);

    try {
      // Parse constraints from natural language csv string
      const constraintsArr = contextForm.constraintsInput
        ? contextForm.constraintsInput.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        problem: problemForm,
        context: {
          ...contextForm,
          constraints: constraintsArr
        }
      };

      const response = await api.submitAnalysis(payload.problem, payload.context);
      
      clearInterval(timer);
      setAnalysisStage("Completing adaptation packaging...");
      
      // Delay slightly for smooth transition
      setTimeout(() => {
        setAnalysisData(response.data);
        setIsAnalyzing(false);
        setCurrentPage('results');
        setActiveResultTab('match');
      }, 500);

    } catch (err) {
      clearInterval(timer);
      setIsAnalyzing(false);
      setAnalysisError(err.response?.data?.error || 'Failed to complete analysis pipeline. Verify backend connection.');
    }
  };

  // Trigger feedback submission
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!analysisData) return;

    setSubmittingFeedback(true);
    setFeedbackSuccess(false);

    try {
      const payload = {
        solutionId: analysisData.selectedSolution.id,
        status: feedbackForm.status,
        outcome: feedbackForm.outcome,
        worked: feedbackForm.worked,
        failed: feedbackForm.failed,
        lessons: feedbackForm.lessons
      };

      await api.submitFeedback(payload);
      setFeedbackSuccess(true);
      // Reset feedback inputs
      setFeedbackForm({
        status: 'Completed',
        outcome: '',
        worked: '',
        failed: '',
        lessons: ''
      });
    } catch (err) {
      alert('Failed to submit feedback: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Browser print wrapper
  const handlePrint = () => {
    window.print();
  };

  // Exports adapted strategy as raw markdown document
  const handleExportMarkdown = () => {
    if (!analysisData) return;

    const { selectedSolution, matchScore, matchReasons, contextComparison, adaptation, actionPlan, isAIUsed } = analysisData;

    let mdContent = `# Context-Aware Adaptation Strategy Report\n\n`;
    mdContent += `**Adapted Strategy:** ${actionPlan.strategyName}\n`;
    mdContent += `**Proven Template Case:** ${selectedSolution.title}\n`;
    mdContent += `**Prototype Match Score:** ${matchScore}%\n`;
    mdContent += `**Reasoning Method:** ${isAIUsed ? 'Gemini Generative AI' : 'Deterministic Rules Engine'}\n\n`;
    
    mdContent += `## 1. Problem Profile\n`;
    mdContent += `- **Title:** ${problemForm.title}\n`;
    mdContent += `- **Description:** ${problemForm.description}\n`;
    mdContent += `- **Domain:** ${problemForm.domain}\n`;
    mdContent += `- **Goal:** ${problemForm.desiredOutcome}\n\n`;

    mdContent += `## 2. Match Rationale\n`;
    matchReasons.forEach(r => {
      mdContent += `- ${r}\n`;
    });
    mdContent += `\n`;

    mdContent += `## 3. Context Comparison Matrix\n`;
    mdContent += `| Dimension | Proven Case Value | Your Target Context | Gap Difference | Severity |\n`;
    mdContent += `| --- | --- | --- | --- | --- |\n`;
    contextComparison.forEach(c => {
      mdContent += `| ${c.dimension} | ${c.original} | ${c.target} | ${c.difference} | ${c.severity.toUpperCase()} |\n`;
    });
    mdContent += `\n`;

    mdContent += `## 4. Adaptation Decisions\n\n`;
    
    mdContent += `### RETAIN (Core Success Factors)\n`;
    adaptation.retain.forEach(r => {
      mdContent += `- **${r.item}**: ${r.reason}\n`;
    });
    mdContent += `\n`;

    mdContent += `### MODIFY (Operational Adjustments)\n`;
    adaptation.modify.forEach(m => {
      mdContent += `- **${m.original}** &rarr; **${m.adapted}**: ${m.reason}\n`;
    });
    mdContent += `\n`;

    mdContent += `### AVOID (Unfeasible Elements)\n`;
    adaptation.avoid.forEach(a => {
      mdContent += `- **${a.item}**: ${a.reason}\n`;
    });
    mdContent += `\n`;

    mdContent += `### ADD (Local Infrastructure Innovations)\n`;
    adaptation.add.forEach(a => {
      mdContent += `- **${a.item}**: ${a.reason}\n`;
    });
    mdContent += `\n`;

    mdContent += `## 5. Implementation Action Plan Roadmap\n\n`;
    actionPlan.phases.forEach(p => {
      mdContent += `### ${p.title} (${p.duration})\n`;
      p.tasks.forEach(t => {
        mdContent += `- ${t}\n`;
      });
      mdContent += `\n`;
    });

    mdContent += `## 6. Project Risk & Resources Summary\n\n`;
    mdContent += `### Resources Required:\n`;
    actionPlan.resourcesRequired.forEach(r => {
      mdContent += `- ${r}\n`;
    });
    mdContent += `\n### Risks Identified:\n`;
    actionPlan.risks.forEach(r => {
      mdContent += `- ${r}\n`;
    });
    mdContent += `\n### Expected Outcomes:\n`;
    actionPlan.expectedOutcomes.forEach(r => {
      mdContent += `- ${r}\n`;
    });
    mdContent += `\n\n---\n*Developed by Team KAIRO — Context-Aware Adaptation Platform*`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${actionPlan.strategyName.toLowerCase().replace(/\s+/g, '_')}_adaptation_plan.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to render severity badge styles
  const getSeverityBadge = (sev) => {
    switch (sev.toLowerCase()) {
      case 'high':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-brand-avoid">High Gap</span>;
      case 'medium':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-brand-modify">Medium Gap</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-brand-retain">Low Gap</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      {/* 15. NAVIGATION NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="p-2 bg-brand-primary text-white rounded-lg shadow-md">
                <Activity className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xl font-bold text-brand-navy">Context-Aware Adaptation</span>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide">DEVELOPED BY TEAM KAIRO</p>
              </div>
            </div>

            <nav className="flex space-x-1 sm:space-x-4">
              <button 
                onClick={() => setCurrentPage('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${currentPage === 'home' ? 'bg-slate-100 text-brand-primary font-semibold' : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'}`}
              >
                <span className="flex items-center space-x-1"><Home className="h-4 w-4" /> <span className="hidden sm:inline">Home</span></span>
              </button>
              
              <button 
                onClick={() => {
                  setWizardStep(1);
                  setCurrentPage('new-analysis');
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${currentPage === 'new-analysis' || (currentPage === 'results' && activeResultTab !== 'dashboard') ? 'bg-slate-100 text-brand-primary font-semibold' : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'}`}
              >
                <span className="flex items-center space-x-1"><PlusCircle className="h-4 w-4" /> <span>New Analysis</span></span>
              </button>

              <button 
                onClick={() => {
                  fetchSolutions();
                  setCurrentPage('cases');
                  setSelectedDbSolution(null);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${currentPage === 'cases' ? 'bg-slate-100 text-brand-primary font-semibold' : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'}`}
              >
                <span className="flex items-center space-x-1"><Database className="h-4 w-4" /> <span className="hidden sm:inline">Cases</span></span>
              </button>

              <button 
                onClick={() => setCurrentPage('about')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${currentPage === 'about' ? 'bg-slate-100 text-brand-primary font-semibold' : 'text-slate-600 hover:text-brand-navy hover:bg-slate-50'}`}
              >
                <span className="flex items-center space-x-1"><Info className="h-4 w-4" /> <span className="hidden sm:inline">About</span></span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* CORE CONTAINER */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center text-white">
            <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-md w-full mx-4 text-center">
              <Loader2 className="h-12 w-12 text-brand-primary animate-spin mb-4" />
              <h3 className="text-xl font-bold text-brand-navy">Orchestrating Analysis</h3>
              <p className="text-slate-500 text-sm mt-1">Executing Structured Pipeline...</p>
              
              <div className="mt-6 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary animate-pulse w-full"></div>
              </div>
              
              <span className="mt-4 text-xs font-semibold text-brand-accent bg-cyan-50 px-3 py-1 rounded-full uppercase tracking-wider">
                {analysisStage}
              </span>
            </div>
          </div>
        )}

        {/* ==================================================
            1. LANDING PAGE VIEW
            ================================================== */}
        {currentPage === 'home' && (
          <div className="space-y-12 max-w-4xl mx-auto py-4">
            
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <span className="inline-block px-3 py-1 text-xs font-bold bg-blue-50 text-brand-primary rounded-full uppercase tracking-widest border border-blue-200">
                PROVEN THERE &rarr; ADAPTED FOR HERE
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-brand-navy leading-tight">
                Adapt Proven Solutions to Your Context
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover what worked elsewhere, understand why it worked, and transform it into an implementation plan designed for your resources, constraints, and goals.
              </p>
              <div className="pt-4 flex justify-center space-x-4">
                <button 
                  onClick={() => {
                    setWizardStep(1);
                    setCurrentPage('new-analysis');
                  }}
                  className="bg-brand-primary hover:bg-brand-primarylight text-white font-bold px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Start an Analysis</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleLoadDemo}
                  className="bg-white border border-slate-300 hover:border-slate-400 text-brand-navymed font-medium px-5 py-3 rounded-lg transition-all"
                >
                  Load Demo Scenario
                </button>
              </div>
            </div>

            {/* Structured pipeline visual concept diagram */}
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center space-y-6">
              <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">SYSTEM CONCEPT MATRIX</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-brand-primary block uppercase">PROVEN SOLUTION</span>
                  <p className="text-xs text-slate-500 mt-1">Found in DB</p>
                </div>
                
                <div className="text-xl font-bold text-slate-400 font-mono">+</div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-brand-accent block uppercase">YOUR CONTEXT</span>
                  <p className="text-xs text-slate-500 mt-1">Resource profile</p>
                </div>
                
                <div className="text-xl font-bold text-slate-400 font-mono">&darr;</div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 md:col-span-1">
                  <span className="text-xs font-bold text-brand-primary block uppercase">CONTEXT ANALYSIS</span>
                  <p className="text-xs text-slate-600 mt-1">Gap mapping</p>
                </div>

                <div className="text-xl font-bold text-slate-400 font-mono">&darr;</div>
                
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 md:col-span-1">
                  <span className="text-xs font-bold text-brand-retain block uppercase">ADAPTED SOLUTION</span>
                  <p className="text-xs text-slate-600 mt-1">Action roadmap</p>
                </div>

              </div>
            </div>

            {/* Core Project Purpose Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-brand-primary mb-2">
                  <Layers className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-brand-navy">Structured Matching</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We look past high-level domain keywords to score resources, volunteer ratios, time commitments, and budget compatibility.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-brand-accent mb-2">
                  <GitCompare className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-brand-navy">Gap severity mapping</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Automatically flags when target budgets are lower, scale size is larger, or available weeks are shorter than the initial proven model.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-brand-retain mb-2">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-brand-navy">Preserves core values</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Separates core success principles (like peer influence) from operational elements to safely modify workloads.
                </p>
              </div>
            </div>

            {/* Developed by attribution */}
            <div className="text-center pt-8 text-xs text-slate-400">
              Developed by Team KAIRO &bull; Academic Mini-Project Demonstration
            </div>
          </div>
        )}


        {/* ==================================================
            2. NEW ANALYSIS PAGE
            ================================================== */}
        {currentPage === 'new-analysis' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Wizard Header Progress Indicator */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${wizardStep >= 1 ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'}`}>1</div>
                  <span className={`text-xs font-semibold ${wizardStep === 1 ? 'text-brand-navy' : 'text-slate-400'}`}>Define Problem</span>
                </div>
                <div className="flex-grow border-t border-slate-200 mx-4"></div>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${wizardStep >= 2 ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'}`}>2</div>
                  <span className={`text-xs font-semibold ${wizardStep === 2 ? 'text-brand-navy' : 'text-slate-400'}`}>Specify Context</span>
                </div>
                <div className="flex-grow border-t border-slate-200 mx-4"></div>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${wizardStep >= 3 ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-500'}`}>3</div>
                  <span className={`text-xs font-semibold ${wizardStep === 3 ? 'text-brand-navy' : 'text-slate-400'}`}>Review Profile</span>
                </div>
              </div>
            </div>

            {/* Error notifications */}
            {analysisError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-2 text-brand-avoid text-sm">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* STEP 1: PROBLEM FORM */}
            {wizardStep === 1 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-navy">Step 1 &mdash; Define the Challenge</h2>
                    <p className="text-xs text-slate-500">Provide high-level details regarding the challenge you want to address.</p>
                  </div>
                  <button 
                    onClick={handleLoadDemo}
                    className="bg-blue-50 text-brand-primary text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all"
                  >
                    Use Demo Scenario
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Problem Title *</label>
                    <input 
                      type="text"
                      placeholder="e.g. Low student participation in entrepreneurship activities"
                      value={problemForm.title}
                      onChange={(e) => setProblemForm({...problemForm, title: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Domain *</label>
                      <select
                        value={problemForm.domain}
                        onChange={(e) => setProblemForm({...problemForm, domain: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                      >
                        <option>Education</option>
                        <option>Business</option>
                        <option>Community Development</option>
                        <option>NGO</option>
                        <option>Government</option>
                        <option>Operations</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Desired Outcome *</label>
                      <input 
                        type="text"
                        placeholder="e.g. increase student enrollment/attendance by 50%"
                        value={problemForm.desiredOutcome}
                        onChange={(e) => setProblemForm({...problemForm, desiredOutcome: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Detailed Description *</label>
                    <textarea 
                      rows="4"
                      placeholder="Explain the issues, current gaps, and why standard approaches fail..."
                      value={problemForm.description}
                      onChange={(e) => setProblemForm({...problemForm, description: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button 
                    disabled={!problemForm.title || !problemForm.description || !problemForm.desiredOutcome}
                    onClick={() => setWizardStep(2)}
                    className="bg-brand-primary hover:bg-brand-primarylight disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg flex items-center space-x-1.5 text-sm transition-all"
                  >
                    <span>Next: Specify Context</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CONTEXT FORM */}
            {wizardStep === 2 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-brand-navy">Step 2 &mdash; Define Local Context</h2>
                  <p className="text-xs text-slate-500">Provide the specific resource limits, scale constraints, and physical environment profiles.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Organization Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. KAIRO Academy (Optional)"
                        value={contextForm.orgName}
                        onChange={(e) => setContextForm({...contextForm, orgName: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Organization Type *</label>
                      <input 
                        type="text"
                        placeholder="e.g. School, NGO, Local Council"
                        value={contextForm.orgType}
                        onChange={(e) => setContextForm({...contextForm, orgType: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Population Scale *</label>
                      <input 
                        type="number"
                        placeholder="e.g. 5000"
                        value={contextForm.population}
                        onChange={(e) => setContextForm({...contextForm, population: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Budget (₹) *</label>
                      <input 
                        type="number"
                        placeholder="e.g. 50000"
                        value={contextForm.budget}
                        onChange={(e) => setContextForm({...contextForm, budget: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Team Size (People) *</label>
                      <input 
                        type="number"
                        placeholder="e.g. 10"
                        value={contextForm.people}
                        onChange={(e) => setContextForm({...contextForm, people: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Time Available *</label>
                      <input 
                        type="text"
                        placeholder="e.g. 2 months"
                        value={contextForm.duration}
                        onChange={(e) => setContextForm({...contextForm, duration: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Infrastructure Availability *</label>
                      <input 
                        type="text"
                        placeholder="e.g. Existing classrooms, open fields, shared TV"
                        value={contextForm.infrastructure}
                        onChange={(e) => setContextForm({...contextForm, infrastructure: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Goals / Core Intentions</label>
                      <input 
                        type="text"
                        placeholder="e.g. improve student activity, test new models"
                        value={contextForm.goal}
                        onChange={(e) => setContextForm({...contextForm, goal: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Major Constraints (comma separated) *</label>
                    <input 
                      type="text"
                      placeholder="e.g. low budget, limited volunteers, limited mentors, lack of internet"
                      value={contextForm.constraintsInput}
                      onChange={(e) => setContextForm({...contextForm, constraintsInput: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setWizardStep(1)}
                    className="border border-slate-300 text-slate-600 font-medium px-4 py-2.5 rounded-lg flex items-center space-x-1.5 text-sm transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button 
                    disabled={!contextForm.population || !contextForm.budget || !contextForm.people || !contextForm.duration || !contextForm.infrastructure || !contextForm.constraintsInput}
                    onClick={() => setWizardStep(3)}
                    className="bg-brand-primary hover:bg-brand-primarylight disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg flex items-center space-x-1.5 text-sm transition-all"
                  >
                    <span>Next: Review Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONTEXT PROFILE DISPLAY REVIEW */}
            {wizardStep === 3 && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-brand-navy">Step 3 &mdash; Review Target Context Profile</h2>
                  <p className="text-xs text-slate-500">Confirm the converted structured vector template before running the matching engines.</p>
                </div>

                {/* Problem Summary Card */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">PROJECTED DEMAND TARGET</span>
                  <h3 className="font-bold text-lg text-brand-navy">{problemForm.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{problemForm.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                    <div><span className="font-semibold text-slate-500">Domain:</span> {problemForm.domain}</div>
                    <div><span className="font-semibold text-slate-500">Outcome Goal:</span> {problemForm.desiredOutcome}</div>
                  </div>
                </div>

                {/* 6 Grid Visual Context Profile Cards */}
                <div>
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">CONVERTED CONTEXT PROFILE VECTOR</span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    
                    {/* Scale Card */}
                    <div className="p-4 rounded-xl border border-slate-200 shadow-sm bg-white space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">SCALE CAPACITY</span>
                      <span className="text-lg font-extrabold text-brand-navy">{parseFloat(contextForm.population).toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 block">Target Users/Students</span>
                    </div>

                    {/* Budget Card */}
                    <div className="p-4 rounded-xl border border-slate-200 shadow-sm bg-white space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">OPERATING BUDGET</span>
                      <span className="text-lg font-extrabold text-brand-primary">₹{parseFloat(contextForm.budget).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-500 block">Funds Available</span>
                    </div>

                    {/* People Card */}
                    <div className="p-4 rounded-xl border border-slate-200 shadow-sm bg-white space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">TEAM CAPACITY</span>
                      <span className="text-lg font-extrabold text-brand-navy">{contextForm.people} Team</span>
                      <span className="text-[10px] text-slate-500 block">Active Volunteers</span>
                    </div>

                    {/* Time Card */}
                    <div className="p-4 rounded-xl border border-slate-200 shadow-sm bg-white space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">TIME WINDOW</span>
                      <span className="text-lg font-extrabold text-brand-navy">{contextForm.duration}</span>
                      <span className="text-[10px] text-slate-500 block">Project Deadline</span>
                    </div>

                    {/* Infrastructure Card */}
                    <div className="p-4 rounded-xl border border-slate-200 shadow-sm bg-white space-y-1 col-span-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">INFRASTRUCTURE</span>
                      <span className="text-sm font-bold text-brand-navy truncate block">{contextForm.infrastructure}</span>
                      <span className="text-[10px] text-slate-500 block">Available Venues</span>
                    </div>

                    {/* Constraints Card */}
                    <div className="p-4 rounded-xl border border-slate-200 shadow-sm bg-white space-y-1 col-span-1">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">CONSTRAINTS DETECTED</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {contextForm.constraintsInput.split(',').map((c, i) => (
                          <span key={i} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wide truncate max-w-[80px]">
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setWizardStep(2)}
                    className="border border-slate-300 text-slate-600 font-medium px-4 py-2.5 rounded-lg flex items-center space-x-1.5 text-sm transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button 
                    onClick={handleRunAnalysis}
                    className="bg-brand-retain hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-lg flex items-center space-x-2 text-sm shadow-md transition-all"
                  >
                    <span>Run Analysis Pipeline</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}


        {/* ==================================================
            3. ANALYSIS RESULTS & PIPELINE TABS
            ================================================== */}
        {currentPage === 'results' && analysisData && (
          <div className="space-y-6">
            
            {/* Pipeline Header with Tab Selectors */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 no-print">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Method tag */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Analysis Pipeline:</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${analysisData.isAIUsed ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-brand-primary border border-blue-200'}`}>
                    {analysisData.isAIUsed ? 'Gemini AI Mode' : 'Local Rules Fallback'}
                  </span>
                </div>

                {/* Progress Tabs */}
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => setActiveResultTab('match')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeResultTab === 'match' ? 'bg-brand-primary text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                  >
                    1. Matched Solution
                  </button>
                  <span className="text-slate-300 font-mono hidden sm:inline">&rarr;</span>
                  <button 
                    onClick={() => setActiveResultTab('compare')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeResultTab === 'compare' ? 'bg-brand-primary text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                  >
                    2. Context Gap
                  </button>
                  <span className="text-slate-300 font-mono hidden sm:inline">&rarr;</span>
                  <button 
                    onClick={() => setActiveResultTab('adapt')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeResultTab === 'adapt' ? 'bg-brand-primary text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                  >
                    3. Adaptation
                  </button>
                  <span className="text-slate-300 font-mono hidden sm:inline">&rarr;</span>
                  <button 
                    onClick={() => setActiveResultTab('plan')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeResultTab === 'plan' ? 'bg-brand-primary text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}
                  >
                    4. Implementation Roadmap
                  </button>
                  <span className="text-slate-300 font-mono hidden sm:inline">&bull;&bull;&bull;</span>
                  <button 
                    onClick={() => setActiveResultTab('dashboard')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${activeResultTab === 'dashboard' ? 'bg-brand-navy text-white' : 'bg-slate-100 hover:bg-slate-200 text-brand-navy'}`}
                  >
                    Unified Dashboard
                  </button>
                </div>

              </div>
            </div>

            {/* A. TAB 1: MATCHED CASE PAGE */}
            {activeResultTab === 'match' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left score panel */}
                <div className="lg:col-span-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
                  <div className="text-center space-y-2">
                    <span className="text-xs font-bold text-slate-400 block uppercase">MATCH ENGINE FIDELITY</span>
                    <div className="relative inline-flex items-center justify-center">
                      {/* circular score display */}
                      <svg className="w-36 h-36">
                        <circle className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="58" cx="72" cy="72"/>
                        <circle className="text-brand-primary" strokeWidth="10" strokeDasharray={2 * Math.PI * 58} strokeDashoffset={(1 - analysisData.matchScore / 100) * 2 * Math.PI * 58} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="72" cy="72"/>
                      </svg>
                      <span className="absolute text-4xl font-extrabold text-brand-navy">{analysisData.matchScore}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">PROTOTYPE MATCH SCORE</span>
                  </div>

                  <div className="space-y-4">
                    <span className="block text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-2">Why Selected:</span>
                    <ul className="space-y-2">
                      {analysisData.matchReasons.map((reason, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-brand-primary flex-shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => setActiveResultTab('compare')}
                    className="w-full bg-brand-primary hover:bg-brand-primarylight text-white font-bold py-2.5 rounded-lg flex items-center justify-center space-x-1 text-sm shadow transition-all"
                  >
                    <span>Compare With My Context</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Right original case profile panel */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BEST MATCHED TEMPLATE SOLUTION</span>
                    <h2 className="text-2xl font-bold text-brand-navy">{analysisData.selectedSolution.title}</h2>
                    <p className="text-xs text-brand-accent font-semibold">{analysisData.selectedSolution.domain} &bull; {analysisData.selectedSolution.evidenceLevel}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Problem template</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">{analysisData.selectedSolution.problem}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Solution template details</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">{analysisData.selectedSolution.description}</p>
                    </div>

                    {/* Original Context values */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">ORIGINAL SCALE</span>
                        <span className="text-xs font-bold text-brand-navy">{analysisData.selectedSolution.context.population.toLocaleString()} users</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">ORIGINAL BUDGET</span>
                        <span className="text-xs font-bold text-brand-navy">₹{analysisData.selectedSolution.context.budget.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">TEAM SIZE</span>
                        <span className="text-xs font-bold text-brand-navy">{analysisData.selectedSolution.context.people} operators</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">DURATION</span>
                        <span className="text-xs font-bold text-brand-navy">{analysisData.selectedSolution.context.duration}</span>
                      </div>
                    </div>

                    {/* Original implementation bullet lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">Proven Implementation Steps</h4>
                        <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                          {analysisData.selectedSolution.implementation.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1">Success Factors &amp; Risks</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] font-bold text-brand-retain uppercase tracking-widest block">Core Factors</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {analysisData.selectedSolution.successFactors.map((f, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-green-50 text-brand-retain border border-green-200 rounded font-medium">{f}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-brand-avoid uppercase tracking-widest block">Original Risks</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {analysisData.selectedSolution.risks.map((r, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-red-50 text-brand-avoid border border-red-200 rounded font-medium">{r}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* B. TAB 2: CONTEXT COMPARISON PAGE */}
            {activeResultTab === 'compare' && (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PIPELINE PHASE 2</span>
                  <h2 className="text-2xl font-bold text-brand-navy">Context Comparison Matrix</h2>
                  <p className="text-xs text-slate-500">Evaluating your local context boundaries against the matching case requirements to map operational gaps.</p>
                </div>

                {/* Table representation */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="px-6 py-4">Dimension</th>
                        <th className="px-6 py-4">Proven Value</th>
                        <th className="px-6 py-4">Your Context</th>
                        <th className="px-6 py-4">Gap Difference</th>
                        <th className="px-6 py-4">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 text-slate-700 bg-white">
                      {analysisData.contextComparison.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-brand-navy">{comp.dimension}</td>
                          <td className="px-6 py-4 font-mono">{comp.original}</td>
                          <td className="px-6 py-4 font-mono">{comp.target}</td>
                          <td className="px-6 py-4 font-semibold text-slate-600">{comp.difference}</td>
                          <td className="px-6 py-4">{getSeverityBadge(comp.severity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Core Principles Separation Section */}
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-brand-navy font-bold">
                    <Award className="h-5 w-5 text-brand-primary" />
                    <span>8. Core Success Factor Separation</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    By separating implementation mechanics from the underlying success principles, we can safely adapt procedures to fit constraint profiles while retaining the structural foundation of the model.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-white p-4 rounded-lg border border-blue-150">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">IMPLEMENTATION MECHANIC</span>
                      <span className="text-xs font-semibold text-slate-800">{analysisData.selectedSolution.context.people} physical ambassadors conducting weekly sessions.</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-150">
                      <span className="text-[10px] font-bold text-brand-primary block uppercase">UNDERLYING SUCCESS PRINCIPLE</span>
                      <span className="text-xs font-bold text-brand-navy">Peer-to-peer marketing influence and consistent departmental scheduling.</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setActiveResultTab('match')}
                    className="border border-slate-300 text-slate-600 font-medium px-4 py-2.5 rounded-lg flex items-center space-x-1.5 text-sm transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button 
                    onClick={() => setActiveResultTab('adapt')}
                    className="bg-brand-primary hover:bg-brand-primarylight text-white font-bold px-5 py-2.5 rounded-lg flex items-center space-x-1.5 text-sm shadow transition-all"
                  >
                    <span>Formulate Adaptation Decisions</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            )}

            {/* C. TAB 3: ADAPTATION DECISION PAGE */}
            {activeResultTab === 'adapt' && (
              <div className="space-y-6">
                
                {/* Intro */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PIPELINE PHASE 3</span>
                  <h2 className="text-2xl font-bold text-brand-navy">Structured Adaptation Formulation</h2>
                  <p className="text-xs text-slate-500">Review recommendations split into Retain, Modify, Avoid, and Add quadrants based on context differences.</p>
                </div>

                {/* 4 Quadrants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* RETAIN Quadrant */}
                  <div className="bg-white p-6 rounded-2xl border-t-4 border-brand-retain shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 text-brand-retain font-bold text-base">
                      <CheckCircle className="h-5 w-5" />
                      <span>RETAIN (Core Principles)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Core parameters that must remain untouched to protect success margins.</p>
                    
                    <div className="space-y-3">
                      {analysisData.adaptation.retain.map((item, idx) => (
                        <div key={idx} className="bg-green-50/55 p-3 rounded-lg border border-green-100 text-xs">
                          <span className="font-bold text-brand-retain block">{item.item}</span>
                          <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed"><span className="font-semibold text-slate-600">Reason:</span> {item.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MODIFY Quadrant */}
                  <div className="bg-white p-6 rounded-2xl border-t-4 border-brand-modify shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 text-brand-modify font-bold text-base">
                      <AlertTriangle className="h-5 w-5" />
                      <span>MODIFY (Operational Tweaks)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Modified quantities, frequencies, or values adjusted for resource gaps.</p>
                    
                    <div className="space-y-3">
                      {analysisData.adaptation.modify.map((item, idx) => (
                        <div key={idx} className="bg-amber-50/55 p-3 rounded-lg border border-amber-100 text-xs">
                          <div className="flex flex-wrap items-center gap-1 font-bold">
                            <span className="text-slate-400 line-through">{item.original}</span>
                            <span className="text-slate-500 font-normal font-mono">&rarr;</span>
                            <span className="text-brand-modify">{item.adapted}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed"><span className="font-semibold text-slate-600">Reason:</span> {item.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AVOID Quadrant */}
                  <div className="bg-white p-6 rounded-2xl border-t-4 border-brand-avoid shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 text-brand-avoid font-bold text-base">
                      <XCircle className="h-5 w-5" />
                      <span>AVOID (Unviable Elements)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">High-cost, high-overhead actions excluded to fit budget or infrastructure limits.</p>
                    
                    <div className="space-y-3">
                      {analysisData.adaptation.avoid.map((item, idx) => (
                        <div key={idx} className="bg-red-50/55 p-3 rounded-lg border border-red-100 text-xs">
                          <span className="font-bold text-brand-avoid block">{item.item}</span>
                          <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed"><span className="font-semibold text-slate-600">Reason:</span> {item.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADD Quadrant */}
                  <div className="bg-white p-6 rounded-2xl border-t-4 border-brand-accent shadow-sm space-y-4">
                    <div className="flex items-center space-x-2 text-brand-accent font-bold text-base">
                      <Plus className="h-5 w-5 bg-cyan-100 rounded-full text-brand-accent" />
                      <span>ADD (Infrastructure Innovations)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Alternative mechanisms introduced to handle scale increases or bypass constraints.</p>
                    
                    <div className="space-y-3">
                      {analysisData.adaptation.add.map((item, idx) => (
                        <div key={idx} className="bg-cyan-50/55 p-3 rounded-lg border border-cyan-100 text-xs">
                          <span className="font-bold text-brand-accent block">{item.item}</span>
                          <span className="text-[11px] text-slate-500 mt-1 block leading-relaxed"><span className="font-semibold text-slate-600">Reason:</span> {item.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="flex justify-between pt-4 border-t border-slate-200 bg-white p-4 rounded-xl border">
                  <button 
                    onClick={() => setActiveResultTab('compare')}
                    className="border border-slate-300 text-slate-600 font-medium px-4 py-2.5 rounded-lg flex items-center space-x-1.5 text-sm transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button 
                    onClick={() => setActiveResultTab('plan')}
                    className="bg-brand-primary hover:bg-brand-primarylight text-white font-bold px-5 py-2.5 rounded-lg flex items-center space-x-1.5 text-sm shadow transition-all"
                  >
                    <span>Generate Implementation Plan</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            )}

            {/* D. TAB 4: ACTION PLAN TIMELINE ROADMAP */}
            {activeResultTab === 'plan' && (
              <div className="space-y-6">
                
                {/* Intro */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PIPELINE PHASE 4</span>
                  <h2 className="text-2xl font-bold text-brand-navy">Implementation Action Plan Roadmap</h2>
                  <p className="text-xs text-slate-500">Weekly milestones mapping setup, execution, and evaluation procedures tailored to your {contextForm.duration} time limit.</p>
                </div>

                {/* Adapted Strategy Card */}
                <div className="bg-brand-navy text-white p-6 rounded-2xl shadow-sm">
                  <span className="text-[9px] font-bold text-brand-primarylight uppercase tracking-widest block">ADAPTED CAMPAIGN STRATEGY</span>
                  <h3 className="text-xl font-bold mt-1">{analysisData.actionPlan.strategyName}</h3>
                  <p className="text-xs text-slate-300 mt-1">Based on the proven matched blueprint: "{analysisData.selectedSolution.title}"</p>
                </div>

                {/* Phase Timeline Cards */}
                <div className="space-y-4">
                  {analysisData.actionPlan.phases.map((phase, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-start md:space-x-6 space-y-3 md:space-y-0 relative overflow-hidden">
                      <div className="flex-shrink-0 md:w-48 space-y-1">
                        <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest block">{phase.title}</span>
                        <span className="text-base font-extrabold text-brand-navy block">{phase.duration}</span>
                      </div>
                      
                      <div className="flex-grow space-y-2 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-3 md:pt-0">
                        <ul className="space-y-2 text-xs text-slate-600">
                          {phase.tasks.map((task, tidx) => (
                            <li key={tidx} className="flex items-start space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 flex-shrink-0"></span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Risk and Resources grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Resources */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Resources Required</span>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      {analysisData.actionPlan.resourcesRequired.map((res, idx) => (
                        <li key={idx} className="flex items-center space-x-1.5">
                          <CheckCircle className="h-4 w-4 text-brand-retain flex-shrink-0" />
                          <span className="truncate">{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Potential Risks</span>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      {analysisData.actionPlan.risks.map((risk, idx) => (
                        <li key={idx} className="flex items-center space-x-1.5">
                          <AlertTriangle className="h-4 w-4 text-brand-modify flex-shrink-0" />
                          <span className="truncate">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expected Outcomes */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Expected Outcomes</span>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      {analysisData.actionPlan.expectedOutcomes.map((out, idx) => (
                        <li key={idx} className="flex items-center space-x-1.5">
                          <TrendingUp className="h-4 w-4 text-brand-accent flex-shrink-0" />
                          <span className="truncate">{out}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                <div className="flex justify-between pt-4 border-t border-slate-250 bg-white p-4 rounded-xl border">
                  <button 
                    onClick={() => setActiveResultTab('adapt')}
                    className="border border-slate-300 text-slate-600 font-medium px-4 py-2.5 rounded-lg flex items-center space-x-1.5 text-sm transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>

                  <button 
                    onClick={() => setActiveResultTab('dashboard')}
                    className="bg-brand-navy hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-lg flex items-center space-x-2 text-sm shadow transition-all"
                  >
                    <span>View Unified Dashboard Report</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

              </div>
            )}

            {/* E. TAB 5: UNIFIED FINAL DASHBOARD & REPORT EXPORT */}
            {activeResultTab === 'dashboard' && (
              <div className="space-y-8" id="unified-dashboard-report">
                
                {/* Dashboard Header Panel */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print-card">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">REPORT STAGE: DECISION READY</span>
                    <h2 className="text-2xl font-bold text-brand-navy">Final Recommendation Dashboard</h2>
                    <p className="text-xs text-slate-500">Adapted Strategy: <span className="font-semibold text-slate-700">{analysisData.actionPlan.strategyName}</span></p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center space-x-2 no-print">
                    <button 
                      onClick={handlePrint}
                      className="bg-white border border-slate-300 hover:border-slate-400 text-brand-navymed text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 transition-all"
                    >
                      <Printer className="h-4 w-4" />
                      <span>Print Report</span>
                    </button>
                    <button 
                      onClick={handleExportMarkdown}
                      className="bg-brand-primary hover:bg-brand-primarylight text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow transition-all"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export MD</span>
                    </button>
                  </div>
                </div>

                {/* Grid summarizing details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Problem & Case Match */}
                  <div className="space-y-6">
                    
                    {/* Problem Description Card */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print-card space-y-3">
                      <h3 className="text-sm font-bold text-brand-navy border-b border-slate-100 pb-1.5 uppercase tracking-wider">Your Problem Context</h3>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-semibold text-slate-500">Title:</span>
                          <p className="text-slate-800 font-medium mt-0.5">{problemForm.title}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500">Description:</span>
                          <p className="text-slate-600 leading-relaxed mt-0.5">{problemForm.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div><span className="font-semibold text-slate-500">Domain:</span> {problemForm.domain}</div>
                          <div><span className="font-semibold text-slate-500">Outcome Goal:</span> {problemForm.desiredOutcome}</div>
                        </div>
                      </div>
                    </div>

                    {/* Matching Template details */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print-card space-y-4">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-1.5">
                        <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">Matched Solution Case</h3>
                        <span className="text-xs font-bold text-brand-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {analysisData.matchScore}% Match
                        </span>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div>
                          <span className="font-bold text-slate-800 block text-sm">{analysisData.selectedSolution.title}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Evidence level: {analysisData.selectedSolution.evidenceLevel}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{analysisData.selectedSolution.description}</p>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Original Context Profile:</span>
                          <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2 border border-slate-150 rounded text-[10px] text-center font-mono">
                            <div>
                              <span className="text-slate-400 block">SCALE</span>
                              <span>{analysisData.selectedSolution.context.population}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">BUDGET</span>
                              <span>₹2L</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">TEAM</span>
                              <span>{analysisData.selectedSolution.context.people}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">TIME</span>
                              <span>6m</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Comparative Context Gaps */}
                  <div className="space-y-6">
                    
                    {/* Gap Matrix */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print-card space-y-4">
                      <h3 className="text-sm font-bold text-brand-navy border-b border-slate-100 pb-1.5 uppercase tracking-wider">Detected Context Gaps</h3>
                      
                      <div className="space-y-2.5">
                        {analysisData.contextComparison.map((comp, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded border border-slate-150">
                            <div>
                              <span className="font-bold text-brand-navy block">{comp.dimension}</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                                {comp.original} &rarr; {comp.target}
                              </span>
                            </div>
                            <div className="text-right space-y-1">
                              <span className="text-[10px] font-bold text-slate-600 block">{comp.difference}</span>
                              {getSeverityBadge(comp.severity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Success principles */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl print-card space-y-2 text-xs">
                      <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest block">CORE SUCCESS PRINCIPLES PRESERVED</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-600">
                        {analysisData.selectedSolution.successFactors.map((f, i) => (
                          <li key={i}><span className="font-semibold text-slate-700">{f}</span>: Managed dynamically inside adaptations.</li>
                        ))}
                      </ul>
                    </div>

                  </div>

                </div>

                {/* Adaptation Quadrants Consolidated Summary */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm print-card space-y-6">
                  <h3 className="text-sm font-bold text-brand-navy border-b border-slate-100 pb-2 uppercase tracking-wider">Summary of Adaptation Decisions</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Retain */}
                    <div className="bg-green-50/40 p-4 rounded-xl border border-green-100 space-y-2">
                      <span className="text-[10px] font-bold text-brand-retain uppercase block tracking-wider border-b border-green-100 pb-1">RETAIN</span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc pl-3">
                        {analysisData.adaptation.retain.map((item, idx) => (
                          <li key={idx} className="font-semibold">{item.item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Modify */}
                    <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 space-y-2">
                      <span className="text-[10px] font-bold text-brand-modify uppercase block tracking-wider border-b border-amber-100 pb-1">MODIFY</span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc pl-3">
                        {analysisData.adaptation.modify.map((item, idx) => (
                          <li key={idx} className="font-semibold">{item.adapted}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Avoid */}
                    <div className="bg-red-50/40 p-4 rounded-xl border border-red-100 space-y-2">
                      <span className="text-[10px] font-bold text-brand-avoid uppercase block tracking-wider border-b border-red-100 pb-1">AVOID</span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc pl-3">
                        {analysisData.adaptation.avoid.map((item, idx) => (
                          <li key={idx} className="font-semibold">{item.item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Add */}
                    <div className="bg-cyan-50/40 p-4 rounded-xl border border-cyan-100 space-y-2">
                      <span className="text-[10px] font-bold text-brand-accent uppercase block tracking-wider border-b border-cyan-100 pb-1">ADD</span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc pl-3">
                        {analysisData.adaptation.add.map((item, idx) => (
                          <li key={idx} className="font-semibold">{item.item}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Final roadmap timeline */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm print-card space-y-6">
                  <h3 className="text-sm font-bold text-brand-navy border-b border-slate-100 pb-2 uppercase tracking-wider">Implementation Action Roadmap Timeline</h3>
                  
                  <div className="relative border-l-2 border-slate-100 pl-6 space-y-6 ml-2">
                    {analysisData.actionPlan.phases.map((phase, idx) => (
                      <div key={idx} className="relative">
                        {/* timeline dot */}
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-primary border-4 border-white shadow-sm"></div>
                        
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-brand-primary uppercase tracking-widest block">{phase.title}</span>
                          <span className="text-sm font-extrabold text-brand-navy">{phase.duration}</span>
                          <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1 pt-1">
                            {phase.tasks.map((task, tidx) => (
                              <li key={tidx}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 13. FEEDBACK LOOP SECTION */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm no-print space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-brand-navy">13. Future Feedback Loop: Record Project Outcomes</h3>
                    <p className="text-xs text-slate-500">Simulate documenting implementation findings. This stores outcomes locally to update future adaptation decisions.</p>
                  </div>

                  {feedbackSuccess && (
                    <div className="bg-green-50 border-l-4 border-brand-retain p-4 rounded-md text-brand-retain text-xs flex items-center space-x-1.5">
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      <span>Outcome logged successfully. The database has been updated with your operational case findings!</span>
                    </div>
                  )}

                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Implementation Status</label>
                        <select 
                          value={feedbackForm.status}
                          onChange={(e) => setFeedbackForm({...feedbackForm, status: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                        >
                          <option>Completed</option>
                          <option>In Progress</option>
                          <option>Suspended</option>
                          <option>Terminated</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Direct Outcome Metrics</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Student participation increased by 80% with only ₹45,000 spent."
                          value={feedbackForm.outcome}
                          onChange={(e) => setFeedbackForm({...feedbackForm, outcome: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">What Worked</label>
                        <textarea 
                          rows="2"
                          placeholder="What went well in the adapted strategy?"
                          value={feedbackForm.worked}
                          onChange={(e) => setFeedbackForm({...feedbackForm, worked: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-xs"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">What Failed / Unexpected Challenges</label>
                        <textarea 
                          rows="2"
                          placeholder="Where did constraints trigger bottlenecks?"
                          value={feedbackForm.failed}
                          onChange={(e) => setFeedbackForm({...feedbackForm, failed: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-xs"
                        ></textarea>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Lessons Learned / Recommendations for Next Adaptation</label>
                      <textarea 
                        rows="2"
                        placeholder="What feedback would you give to the next group trying this program?"
                        value={feedbackForm.lessons}
                        onChange={(e) => setFeedbackForm({...feedbackForm, lessons: e.target.value})}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-xs"
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button 
                        type="submit"
                        disabled={submittingFeedback}
                        className="bg-brand-navy hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-lg flex items-center space-x-1.5 text-xs shadow transition-all"
                      >
                        {submittingFeedback ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Logging...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Submit Feedback Log</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Print bottom footer notice */}
                <div className="hidden print:block text-center text-xs text-slate-400 pt-8 border-t border-slate-200">
                  Developed by Team KAIRO &bull; Context-Aware Adaptation Report &bull; Page Break
                </div>

                {/* Reset analysis CTA */}
                <div className="flex justify-center space-x-4 pt-6 no-print">
                  <button 
                    onClick={() => {
                      setProblemForm({ title: '', description: '', domain: 'Education', desiredOutcome: '' });
                      setContextForm({ orgName: '', orgType: 'College', population: '', budget: '', people: '', duration: '', infrastructure: '', constraintsInput: '', goal: '' });
                      setWizardStep(1);
                      setCurrentPage('new-analysis');
                    }}
                    className="bg-brand-primary hover:bg-brand-primarylight text-white font-bold px-6 py-2.5 rounded-lg text-sm shadow transition-all"
                  >
                    Start New Analysis
                  </button>
                </div>

              </div>
            )}

          </div>
        )}


        {/* ==================================================
            4. SOLUTIONS DATABASE BROWSER (CASES PAGE)
            ================================================== */}
        {currentPage === 'cases' && (
          <div className="space-y-6">
            
            {/* Page Title */}
            <div>
              <h2 className="text-3xl font-extrabold text-brand-navy">Proven Cases Repository</h2>
              <p className="text-xs text-slate-500 mt-1">Browse the seeded set of 10 verified template case studies used to evaluate target contexts.</p>
            </div>

            {loadingSolutions ? (
              <div className="flex flex-col items-center py-12 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                <span className="text-xs text-slate-500">Querying cases dataset...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allSolutions.map((sol) => (
                  <div key={sol.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-slate-100 text-slate-600 border">
                          {sol.domain}
                        </span>
                        <span className="text-[9px] font-semibold text-brand-accent">
                          {sol.evidenceLevel}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-brand-navy text-base leading-snug">{sol.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">{sol.problem}</p>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-mono">
                        <div>
                          <span className="text-slate-400 block uppercase">BUDGET</span>
                          <span className="text-slate-700 font-semibold">₹{sol.context.budget.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase">SCALE</span>
                          <span className="text-slate-700 font-semibold">{sol.context.population.toLocaleString()} users</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={() => setSelectedDbSolution(sol)}
                        className="text-brand-primary hover:text-brand-primarylight text-xs font-bold flex items-center space-x-1"
                      >
                        <span>View Full Specifications</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Case Details modal */}
            {selectedDbSolution && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl space-y-6 relative">
                  
                  {/* Close button */}
                  <button 
                    onClick={() => setSelectedDbSolution(null)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-brand-navy text-xl font-bold font-mono"
                  >
                    &times;
                  </button>

                  <div className="border-b border-slate-100 pb-3">
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-50 text-brand-primary border border-blue-200">
                      {selectedDbSolution.domain}
                    </span>
                    <h3 className="text-xl font-bold text-brand-navy mt-2">{selectedDbSolution.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Template Classification: {selectedDbSolution.evidenceLevel}</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-800 uppercase block tracking-wider">Problem template:</span>
                      <p className="text-slate-600 mt-1 leading-relaxed">{selectedDbSolution.problem}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-800 uppercase block tracking-wider">Solution template details:</span>
                      <p className="text-slate-600 mt-1 leading-relaxed">{selectedDbSolution.description}</p>
                    </div>

                    {/* Original Context numbers */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-center">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">BUDGET</span>
                        <span className="text-xs font-bold text-brand-navy">₹{selectedDbSolution.context.budget.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">SCALE</span>
                        <span className="text-xs font-bold text-brand-navy">{selectedDbSolution.context.population.toLocaleString()} users</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">TEAM</span>
                        <span className="text-xs font-bold text-brand-navy">{selectedDbSolution.context.people} people</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[8px] font-bold text-slate-400 block uppercase">TIME</span>
                        <span className="text-xs font-bold text-brand-navy">{selectedDbSolution.context.duration}</span>
                      </div>
                    </div>

                    {/* steps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-bold text-slate-800 uppercase block tracking-wider mb-1.5 border-b border-slate-100 pb-1">Proven Steps</span>
                        <ul className="list-disc pl-4 text-slate-600 space-y-1">
                          {selectedDbSolution.implementation.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 uppercase block tracking-wider mb-1.5 border-b border-slate-100 pb-1">Success Drivers</span>
                        <ul className="list-decimal pl-4 text-slate-600 space-y-1">
                          {selectedDbSolution.successFactors.map((fact, idx) => (
                            <li key={idx}>{fact}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => {
                        // autofill step forms and select this case explicitly!
                        setProblemForm({
                          title: selectedDbSolution.problem,
                          description: selectedDbSolution.description,
                          domain: selectedDbSolution.domain,
                          desiredOutcome: selectedDbSolution.outcome || "Increase efficiency and community outcome."
                        });
                        setContextForm({
                          orgName: "",
                          orgType: "Local Cohort",
                          population: Math.round(selectedDbSolution.context.population * 0.8).toString(),
                          budget: Math.round(selectedDbSolution.context.budget * 0.5).toString(),
                          people: Math.round(selectedDbSolution.context.people * 0.6).toString(),
                          duration: selectedDbSolution.context.duration,
                          infrastructure: selectedDbSolution.context.infrastructure.join(', '),
                          constraintsInput: "limited budget, team limits",
                          goal: "adapt template values to our setup"
                        });
                        setSelectedDbSolution(null);
                        setWizardStep(3); // jump to profile review
                        setCurrentPage('new-analysis');
                      }}
                      className="bg-brand-primary hover:bg-brand-primarylight text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow"
                    >
                      Adapt This Solution
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}


        {/* ==================================================
            5. ABOUT & SYSTEM METHODOLOGY PAGE
            ================================================== */}
        {currentPage === 'about' && (
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Intro */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest block">ACADEMIC METHODOLOGY SPECIFICATIONS</span>
              <h2 className="text-3xl font-extrabold text-brand-navy leading-snug">Context-Aware Adaptation of Proven Solutions</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                A structured decision-support platform designed to analyze operational gaps between successful template case studies and resource-constrained target implementations.
              </p>
            </div>

            {/* Structured pipeline flow */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider">Platform Implementation Pipeline</h3>
              
              <div className="relative border-l-2 border-slate-200 pl-6 ml-2 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-brand-primary"></div>
                  <span className="text-xs font-bold text-brand-navy block">1. Problem Formulation</span>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    User inputs the domain, description, and target desired outcomes to search matching solutions.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-brand-primary"></div>
                  <span className="text-xs font-bold text-brand-navy block">2. Context Profiling Vector</span>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Converts budget, volunteers size, weeks timeline, infrastructure facilities, and list constraints into a structured profile vector.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-brand-primary"></div>
                  <span className="text-xs font-bold text-brand-navy block">3. Scored Solution Retrieval</span>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Compares search query with solutions using custom heuristic ratios: Domain (20%), Problem (40%), Goal (20%), and Context compatibility (20%).
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-brand-primary"></div>
                  <span className="text-xs font-bold text-brand-navy block">4. Severity Gap Analysis</span>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Calculates percentages and numeric offsets (e.g. 75% budget cuts) to assign Low, Medium, and High gap severity tags.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-brand-primary"></div>
                  <span className="text-xs font-bold text-brand-navy block">5. Rule-Based / AI Adaptation Formulation</span>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Categorizes implementation details into Retain (keep core principles), Modify (adjust sizes), Avoid (cut expenses), and Add (implement online integrations).
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[30px] top-1 w-3 h-3 rounded-full bg-brand-primary"></div>
                  <span className="text-xs font-bold text-brand-navy block">6. Active Timeline roadmap &amp; Feedback outcome loops</span>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Schedules tasks into Setup, operational engagement, and evaluation phases, logging outcomes to enrich the case database.
                  </p>
                </div>
              </div>
            </div>

            {/* Team details */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center space-y-2">
              <h4 className="text-sm font-bold text-brand-navy">Project Execution Details</h4>
              <p className="text-xs text-slate-600">Developed for College Mini-Project Demonstration requirements.</p>
              <div className="pt-2 flex justify-center space-x-6 text-xs text-slate-500">
                <div><span className="font-semibold text-brand-navy">Team Name:</span> Team KAIRO</div>
                <div><span className="font-semibold text-brand-navy">Frameworks:</span> Express.js + React (Vite) + Tailwind</div>
                <div><span className="font-semibold text-brand-navy">AI:</span> Gemini (optional API setup)</div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 no-print text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-brand-navy">Context-Aware Adaptation of Proven Solutions</p>
          <p className="text-[10px] text-slate-400 mt-1">Developed by Team KAIRO &bull; &copy; {new Date().getFullYear()} &bull; Academic Prototype Case Study</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
