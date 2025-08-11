// Central configuration for all tutorials in the application
export const TUTORIAL_CONFIGS = {
  dashboard: {
    title: "Welcome to CrisPRO Oncology Platform",
    description: "Let's take a quick tour of your dashboard and key features",
    steps: [
      {
        id: "welcome",
        title: "Welcome to CrisPRO",
        content: "Welcome to your personalized oncology platform. This dashboard provides a comprehensive overview of your patients, AI insights, and clinical tools.",
        target: ".dashboard-container",
        position: "center",
        showNext: true,
        showPrev: false
      },
      {
        id: "at-glance",
        title: "At a Glance",
        content: "This section shows your current workload - patients awaiting review and active cases. Numbers update automatically as you complete tasks.",
        target: ".at-glance-card",
        position: "right",
        showNext: true,
        showPrev: true
      },
      {
        id: "recent-patients",
        title: "Recent Patients",
        content: "Quick access to patients you've recently reviewed. Click on any patient to dive into their complete medical record and AI insights.",
        target: ".recent-patients-card",
        position: "right",
        showNext: true,
        showPrev: true
      },
      {
        id: "workload-highlights",
        title: "Workload Highlights",
        content: "Your most important tasks and follow-ups are highlighted here. Tasks are automatically prioritized by AI based on urgency and patient needs.",
        target: ".workload-card",
        position: "left",
        showNext: true,
        showPrev: true
      },
      {
        id: "ai-agents",
        title: "AI Agents",
        content: "Monitor your AI assistants that are continuously analyzing patient data, finding clinical trials, and generating insights.",
        target: ".ai-agents-card",
        position: "left",
        showNext: true,
        showPrev: true
      },
      {
        id: "mutation-highlights",
        title: "Pathogenic Mutations",
        content: "Critical genomic findings are highlighted here with AI-powered analysis and clinical significance scoring.",
        target: ".mutation-highlight-card",
        position: "left",
        showNext: true,
        showPrev: true
      },
      {
        id: "tools",
        title: "More Tools",
        content: "Access specialized tools like the Global Mutation Explorer and comprehensive patient record search.",
        target: ".tools-card",
        position: "left",
        showNext: true,
        showPrev: true
      },
      {
        id: "navigation",
        title: "Navigation",
        content: "Use the sidebar to access Research Portal, Agent Studio, and other advanced features. You can always return to this dashboard from anywhere in the app.",
        target: ".sidebar",
        position: "right",
        showNext: false,
        showPrev: true
      }
    ]
  },

  patientRecord: {
    title: "Patient Analysis Workflow",
    description: "Learn how to effectively analyze patient data and leverage AI insights",
    steps: [
      {
        id: "ai-insights",
        title: "AI Insights Overview",
        content: "Start here to see AI-generated insights, clinical trial matches, and treatment recommendations specific to this patient.",
        target: ".agent-insight-widget",
        position: "bottom",
        showNext: true,
        showPrev: false
      },
      {
        id: "patient-info",
        title: "Patient Demographics",
        content: "Review key patient information including demographics, diagnosis, and current treatments. This data informs all AI analysis.",
        target: ".patient-info-section",
        position: "right",
        showNext: true,
        showPrev: true
      },
      {
        id: "action-buttons",
        title: "Analysis Tools",
        content: "Use these tools for deep analysis: Research Portal for clinical trials, Mutation Explorer for genomic analysis, and Follow-up Tasks for care coordination.",
        target: ".action-buttons",
        position: "bottom",
        showNext: true,
        showPrev: true
      },
      {
        id: "research-portal",
        title: "Research Portal",
        content: "Find relevant clinical trials based on patient's specific condition, mutations, and eligibility criteria.",
        target: ".research-portal-btn",
        position: "top",
        showNext: true,
        showPrev: true
      },
      {
        id: "mutation-explorer",
        title: "Mutation Explorer",
        content: "Analyze genomic data with AI-powered variant interpretation and therapeutic recommendations.",
        target: ".mutation-explorer-btn",
        position: "top",
        showNext: true,
        showPrev: true
      },
      {
        id: "follow-up-tasks",
        title: "Follow-up Management",
        content: "Create and manage follow-up tasks to ensure comprehensive patient care and treatment monitoring.",
        target: ".followup-tasks-btn",
        position: "top",
        showNext: false,
        showPrev: true
      }
    ]
  },

  researchPortal: {
    title: "Research Portal Guide",
    description: "Learn how to find and evaluate clinical trials for your patients",
    steps: [
      {
        id: "search-filters",
        title: "Search Filters",
        content: "Use these filters to narrow down clinical trials based on condition, phase, location, and other criteria.",
        target: ".search-filters",
        position: "right",
        showNext: true,
        showPrev: false
      },
      {
        id: "trial-results",
        title: "Trial Results",
        content: "Each trial shows eligibility criteria, primary endpoints, and enrollment status. AI scoring helps prioritize the most relevant trials.",
        target: ".trial-results",
        position: "left",
        showNext: true,
        showPrev: true
      },
      {
        id: "ai-matching",
        title: "AI Matching",
        content: "Our AI analyzes patient data against trial criteria to provide matching scores and recommendations.",
        target: ".ai-matching-score",
        position: "bottom",
        showNext: false,
        showPrev: true
      }
    ]
  },

  mutationExplorer: {
    title: "Mutation Explorer Guide",
    description: "Understand how to interpret genomic variants and AI predictions",
    steps: [
      {
        id: "variant-list",
        title: "Variant Overview",
        content: "All detected variants are listed with classification, frequency, and clinical significance.",
        target: ".variant-list",
        position: "right",
        showNext: true,
        showPrev: false
      },
      {
        id: "ai-predictions",
        title: "AI Predictions",
        content: "Our Evo2 model provides pathogenicity predictions with confidence scores and detailed reasoning.",
        target: ".ai-predictions",
        position: "left",
        showNext: true,
        showPrev: true
      },
      {
        id: "therapeutic-recs",
        title: "Therapeutic Recommendations",
        content: "Based on genomic analysis, see personalized treatment recommendations and drug sensitivities.",
        target: ".therapeutic-recommendations",
        position: "bottom",
        showNext: false,
        showPrev: true
      }
    ]
  },

  agentStudio: {
    title: "Agent Studio Guide",
    description: "Learn how to configure and monitor your AI agents",
    steps: [
      {
        id: "agent-types",
        title: "Agent Types",
        content: "Different AI agents specialize in various tasks: Clinical Trial Matching, Literature Review, Drug Interaction Analysis, and more.",
        target: ".agent-types",
        position: "bottom",
        showNext: true,
        showPrev: false
      },
      {
        id: "agent-config",
        title: "Agent Configuration",
        content: "Customize agent parameters, set priorities, and define trigger conditions for automated analysis.",
        target: ".agent-config",
        position: "right",
        showNext: true,
        showPrev: true
      },
      {
        id: "monitoring",
        title: "Activity Monitoring",
        content: "Track agent performance, review generated insights, and adjust settings based on outcomes.",
        target: ".agent-monitoring",
        position: "left",
        showNext: false,
        showPrev: true
      }
    ]
  }
};

// Helper function to get tutorial by type
export const getTutorialConfig = (tutorialType) => {
  return TUTORIAL_CONFIGS[tutorialType] || null;
};

// Helper function to track tutorial progress
export const TutorialProgress = {
  isCompleted: (tutorialType) => {
    return localStorage.getItem(`tutorial_${tutorialType}_completed`) === 'true';
  },
  
  markCompleted: (tutorialType) => {
    localStorage.setItem(`tutorial_${tutorialType}_completed`, 'true');
    localStorage.setItem(`tutorial_${tutorialType}_completed_at`, new Date().toISOString());
  },
  
  reset: (tutorialType) => {
    localStorage.removeItem(`tutorial_${tutorialType}_completed`);
    localStorage.removeItem(`tutorial_${tutorialType}_completed_at`);
  },
  
  resetAll: () => {
    Object.keys(TUTORIAL_CONFIGS).forEach(tutorialType => {
      TutorialProgress.reset(tutorialType);
    });
  },
  
  getCompletedTutorials: () => {
    return Object.keys(TUTORIAL_CONFIGS).filter(tutorialType => 
      TutorialProgress.isCompleted(tutorialType)
    );
  },
  
  getCompletionStats: () => {
    const total = Object.keys(TUTORIAL_CONFIGS).length;
    const completed = TutorialProgress.getCompletedTutorials().length;
    return {
      total,
      completed,
      percentage: Math.round((completed / total) * 100)
    };
  }
};

// Tutorial tips and best practices
export const TUTORIAL_TIPS = {
  dashboard: [
    "💡 Tip: Use the Quick Guide toggle anytime you need a refresher",
    "⚡ Pro tip: Hover over any card for contextual information",
    "🎯 Focus: Start your day by checking the 'At a Glance' section"
  ],
  
  patientRecord: [
    "🔍 Tip: Always start with AI Insights for the most important findings",
    "📊 Pro tip: Use multiple analysis tools together for comprehensive assessment",
    "⏰ Focus: Create follow-up tasks to ensure continuity of care"
  ],
  
  researchPortal: [
    "🎯 Tip: Use specific filters to find the most relevant trials",
    "📈 Pro tip: Pay attention to AI matching scores for prioritization",
    "📋 Focus: Check eligibility criteria carefully before recommendations"
  ],
  
  mutationExplorer: [
    "🧬 Tip: Start with high-confidence pathogenic variants",
    "🎯 Pro tip: Review AI reasoning for better understanding",
    "💊 Focus: Connect genomic findings to therapeutic options"
  ]
};

export default { TUTORIAL_CONFIGS, getTutorialConfig, TutorialProgress, TUTORIAL_TIPS }; 