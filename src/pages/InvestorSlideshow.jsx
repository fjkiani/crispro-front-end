import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Users as UsersIcon, TrendingUp, Target, Zap, Shield, Globe, // Original icons for other slides
  DatabaseZap, Briefcase, Link as LinkIcon, Workflow as WorkflowIconLucide, AlertTriangle, // For ProblemSlide
  ClipboardList, Cpu, FlaskConical, CheckCircle2, // For SolutionSlide
  PackageOpen, AlertOctagon, Settings, Lightbulb, Target as TargetIconLucide, BookOpen, // For new CRISPR slides
  Microscope, Edit3, Settings2, Dna as DnaIcon, BrainCircuit, TestTube2, UsersRound, FileText, // More for CRISPR slides
  GitMerge, Info, MessageSquare, GraduationCap, Atom, Layers, Shuffle, Brain, // For new Use Case & Power Trio slides & new ProblemSlide card
  Rocket, DollarSign, // For BenefitsSlide
  GitFork, Puzzle, Search, // For GenomicComplexitySlide
  HelpCircle, Combine, // Added for GenotypePhenotypeSlide
  BookText, ShieldCheck, // Added for PKU Platform In Action slide (Cpu, TestTube2 already imported)
  Baby, SearchCheck,
  FileSearch,
  Activity, ShieldAlert, // Added for Dual Role Cancer Slide
  ListChecks, Magnet, // Added for Genetic Mechanisms Slide (Shuffle already imported)
  Filter, FileCode, // Added for Key Platform Components slide (BrainCircuit, Target already imported)
  SearchX, GitCompareArrows, Code, // Added for Benefits of Complex Scenarios slide
  DollarSign as DollarSignIcon, 
  TrendingDown, 
  Clock as ClockIcon, 
  AlertTriangle as AlertTriangleIcon, 
  Settings as SettingsIcon,
  BrainCircuit as BrainCircuitIcon,
  TestTube2 as TestTube2Icon,
  Users as UsersIconLucide, // Renamed to avoid conflict with UsersIcon from line 3
  DatabaseZap as DatabaseZapIcon,
  UploadCloud as UploadCloudIcon,
  Share2 as Share2Icon,
  Target as TargetIcon,
  Copy as CopyIcon,
  Layers as LayersIcon,
  ShieldCheck as ShieldCheckIcon,
  Microscope as MicroscopeIcon,
  Zap as ZapIcon,
  TrendingUp as TrendingUpIcon,
  UsersRound as UsersRoundIcon,
  Settings2 as Settings2Icon,
  PieChart as PieChartIcon,
  CheckCircle2 as CheckCircle2Icon,
  // Existing icons that might be reused:
  PackageOpen as PackageOpenIcon, FileText as FileTextIcon, Target as TargetIconLucideImport, Lightbulb as LightbulbIcon, BookOpen as BookOpenIcon, Edit3 as Edit3Icon, Dna as DnaIconImport,
  GitMerge as GitMergeIcon, Info as InfoIcon, MessageSquare as MessageSquareIcon, GraduationCap as GraduationCapIcon, Atom as AtomIcon, Shuffle as ShuffleIcon, // UsersIcon is already imported
  BookText as BookTextIconImport, ShieldCheck as ShieldCheckIconImport, Cpu as CpuIcon, TestTube2 as TestTube2IconImport, // For PKU
  Baby as BabyIcon, SearchCheck as SearchCheckIcon, FileSearch as FileSearchIcon, Activity as ActivityIcon, ShieldAlert as ShieldAlertIcon, ListChecks as ListChecksIcon, Magnet as MagnetIcon, Filter as FilterIcon, FileCode as FileCodeIcon, SearchX as SearchXIcon, GitCompareArrows as GitCompareArrowsIcon, Code as CodeIcon,
  Briefcase as BriefcaseIcon, Link as LinkIconImport, Workflow as WorkflowIconLucideImport, // For ProblemSlide
  ClipboardList as ClipboardListIcon, FlaskConical as FlaskConicalIcon, // For SolutionSlide
  Rocket as RocketIcon
} from 'lucide-react';

import { Slide } from '../components/common/SlideComponents'; // StatCard is not directly used here anymore if slides manage their own stats
import TitleSlide from '../components/investorSlides/TitleSlide';
import ProblemSlide from '../components/investorSlides/ProblemSlide';
import MarketSlide from '../components/investorSlides/MarketSlide';
import SolutionSlide from '../components/investorSlides/SolutionSlide';
import PlatformSlide from '../components/investorSlides/PlatformSlide';
import FeaturesSlide from '../components/investorSlides/FeaturesSlide';
import AdvantageSlide from '../components/investorSlides/AdvantageSlide';
import BusinessModelSlide from '../components/investorSlides/BusinessModelSlide';
import FinancialsSlide from '../components/investorSlides/FinancialsSlide';
import TeamAndVisionSlide from '../components/investorSlides/TeamAndVisionSlide';

// Import new slide components
import ChallengeJourneySlide from '../components/investorSlides/ChallengeJourneySlide';
import SolutionPlatformSlide from '../components/investorSlides/SolutionPlatformSlide';
import PlatformFeaturesSlide from '../components/investorSlides/PlatformFeaturesSlide';
import SomaticMosaicismSlide from '../components/investorSlides/SomaticMosaicismSlide';
import DTCTestingLandscapeSlide from '../components/investorSlides/DTCTestingLandscapeSlide';
import PowerTrioSlide from '../components/investorSlides/PowerTrioSlide';
import BenefitsSlide from '../components/investorSlides/BenefitsSlide'; // Import new BenefitsSlide
import ScientificFoundationSlide from '../components/investorSlides/ScientificFoundationSlide'; // Import new slide
import GenomicComplexitySlide from '../components/investorSlides/GenomicComplexitySlide'; // Import new slide
import GenotypePhenotypeSlide from '../components/investorSlides/GenotypePhenotypeSlide'; // Import new slide
import DualRoleCancerSlide from '../components/investorSlides/DualRoleCancerSlide';
import GeneticMechanismsSlide from '../components/investorSlides/GeneticMechanismsSlide'; // <-- ADD CORRECT IMPORT HERE

// Import new skeleton components
import IntelligentEngineSlide from '../components/investorSlides/IntelligentEngineSlide';
import DifferentiatorsSlide from '../components/investorSlides/DifferentiatorsSlide';
import UseCaseSpotlightSlide from '../components/investorSlides/UseCaseSpotlightSlide';

const SlideNavigation = ({ currentSlide, totalSlides, onSlideChange }) => (
  <div className="flex items-center gap-4">
    <button
      onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
      disabled={currentSlide === 0}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
    >
      <ChevronLeft size={16} />
      Previous
    </button>
    
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSlides }, (_, i) => (
        <button
          key={i}
          onClick={() => onSlideChange(i)}
          className={`w-3 h-3 rounded-full transition-colors ${
            i === currentSlide ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
          }`}
        />
      ))}
    </div>
    
    <div className="text-sm text-gray-600">
      {currentSlide + 1} / {totalSlides}
    </div>
    
    <button
      onClick={() => onSlideChange(Math.min(totalSlides - 1, currentSlide + 1))}
      disabled={currentSlide === totalSlides - 1}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
    >
      Next
      <ChevronRight size={16} />
    </button>
  </div>
);

const InvestorSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const generalProblemDataProblems = [
    {
      icon: DatabaseZap,
      title: "Information Explosion",
      description: "Clinicians drowning in genomic data, research papers, and patient records.",
      gap: "Synthesizing this into actionable insights.",
      iconColor: "text-red-600"
    },
    {
      icon: Briefcase,
      title: "Slow Translation",
      description: "Promising research takes too long to impact clinical practice.",
      gap: "Bridging research and real-world application.",
      iconColor: "text-orange-500"
    },
    {
      icon: UsersIcon,
      title: "Fragmented Patient Journey",
      description: "Patients often feel lost, struggling with their condition and resources.",
      gap: "Holistic patient support.",
      iconColor: "text-yellow-500"
    },
    {
      icon: WorkflowIconLucide,
      title: "Operational Inefficiencies",
      description: "Manual tasks and siloed information contribute to burnout.",
      gap: "Streamlining workflows.",
      iconColor: "text-purple-500"
    },
    {
      icon: LinkIcon,
      title: "One-Size-Fits-Most Persists",
      description: "True personalization in treatment is still an aspiration.",
      gap: "Enabling true personalization at scale.",
      iconColor: "text-teal-500"
    },
    {
      icon: Brain,
      title: "Clinical Decision Fatigue",
      description: "Navigating complex treatment pathways and rapidly evolving evidence strains clinicians, risking burnout and suboptimal choices.",
      gap: "Tools for clear, prioritized decision support.",
      iconColor: "text-sky-600"
    }
  ];

  const slidesData = [
    // CRISPR Focused Slides (New)
    {
      id: 'crisprTitle',
      component: TitleSlide, 
      data: {
        mainTitle: "Bridging the Gap: Genetic Discoveries to CRISPR Therapeutic Design",
        subTitle: "Leveraging AI, Simulated Evo2 & AlphaFold with the CRISPR Therapeutic Design Assistant",
      }
    },
    {
      id: 'crisprChallenge',
      component: ChallengeJourneySlide,
      data: {
        headline: "The Challenge: Journey from Genetic Test to Therapy",
        geneticDeluge: {
          title: "The Genetic Data Deluge",
          icon: PackageOpen,
          iconColor: 'text-blue-600',
          points: [
            "Rise of Whole Genome Sequencing (WGS), clinical panels, Direct-to-Consumer (DTC) tests.",
            "Massive amounts of data, but translation to therapy is slow."
          ]
        },
        bottlenecks: {
          title: "Key Bottlenecks",
          items: [
            {
              icon: FileText, 
              title: "Variant Interpretation",
              description: "Rapidly resolving Variants of Uncertain Significance (VUS) & assessing true clinical impact.",
              iconColor: 'text-red-600'
            },
            {
              icon: TargetIconLucide,
              title: "Target Prioritization",
              description: "Identifying which of many variants are the best therapeutic targets.",
              gap: "Focusing therapeutic efforts effectively.",
              iconColor: 'text-orange-500'
            },
            {
              icon: BrainCircuit, 
              title: "Complex Design Process",
              description: "Designing effective/safe CRISPR interventions is resource-intensive & specialized.",
              gap: "Streamlining design workflows.",
              iconColor: 'text-yellow-500'
            }
          ]
        },
        biologicalComplexities: {
          title: "Biological Complexities",
          icon: Settings,
          iconColor: 'text-purple-600',
          points: [
            "Overcoming tumor heterogeneity: Precisely targeting somatic mutations & genetic mosaicism in cancer.",
            "Developing targeted therapies for complex, heterogeneous diseases beyond oncology."
          ]
        }
      }
    },
    {
      id: 'crisprSolution',
      component: SolutionPlatformSlide,
      data: {
        headline: "CrisPRO Therapeutic Design Assistant",
        introduction: "An intelligent, AI-powered assistant to navigate complexities from genetic findings to therapeutic concepts.",
        vision: {
          icon: TargetIconLucide,
          text: "To rapidly design, validate, and de-risk transformative CRISPR medicines, achieving unprecedented precision and speed to bring breakthroughs to patients.",
          iconColor: "text-green-600"
        },
        corePrinciple: {
          title: "Core Principle: Seamless Integration of:",
          items: [
            {
              icon: TestTube2, 
              title: "Advanced Biological Simulations",
              details: "(Mimicking Evo2 for variant impact & AlphaFold for structural biology)",
              iconColor: 'text-blue-600'
            },
            {
              icon: Lightbulb,
              title: "Intelligent AI Agents",
              details: "Workflow guidance and optimization for design & analysis.",
              iconColor: 'text-yellow-500'
            },
            {
              icon: BookOpen,
              title: "Comprehensive Knowledge Base",
              details: "Evolving database of genetic variants, CRISPR components, and design rules.",
              iconColor: 'text-purple-600'
            }
          ]
        },
        technicalNote: "Core simulation logic primarily resides in ai_research_assistant.py and related agent modules."
      }
    },
    {
      id: 'crisprFeatures',
      component: ProblemSlide,
      data: {
        headline: "CrisPRO: Unlocking Therapeutic Breakthroughs - Core Capabilities",
        problems: [
          {
            icon: Microscope, 
            title: "AI-Driven Target Validation",
            description: "Rapidly pinpoints high-value targets using proprietary AI and structural biology, de-risking R&D by focusing on candidates with the highest success probability.",
            iconColor: 'text-sky-600'
          },
          {
            icon: Edit3, 
            title: "Optimal Therapeutic Strategy",
            description: "Intelligently matches best-fit CRISPR mechanisms (knockout, HDR, etc.) to diverse targets, expanding market reach and boosting success rates.",
            iconColor: 'text-green-600'
          },
          {
            icon: DnaIcon, 
            title: "Precision Design & In Silico Validation", 
            description: "Automated, high-precision gRNA/HDR design maximizes efficacy and minimizes risk. Rigorous in silico validation slashes R&D costs & timelines.",
            iconColor: 'text-purple-600'
          },
          {
            icon: Settings2, 
            title: "Predictive 'Digital Twin' Simulations", 
            description: "Improves clinical trial outcomes by simulating therapies in 'Digital Twins,' solving complex targets (VUS, mosaicism) and optimizing delivery.",
            iconColor: 'text-amber-600'
          }
        ],
      }
    },
    {
      id: 'crisprBenefits',
      component: BenefitsSlide,
      data: {
        headline: "Benefits of the CRISPR Therapeutic Design Assistant",
        benefits: [
          { icon: Rocket, title: "Accelerated Discovery", description: "Rapidly translate genetic findings into concrete therapeutic concepts.", iconColor: 'text-blue-600' },
          { icon: DollarSign, title: "Reduced R&D Costs & Time", description: "Early in silico validation de-risks projects, minimizing costly wet-lab failures.", iconColor: 'text-green-600' },
          { icon: Zap, title: "Enhanced Design Precision", description: "Create potentially more effective and safer CRISPR systems via multi-parameter optimization.", iconColor: 'text-purple-600' },
          { icon: UsersIcon, title: "Democratized Access", description: "Make advanced in silico therapeutic design capabilities more accessible to researchers.", iconColor: 'text-teal-600' },
          { icon: Lightbulb, title: "Powerful Hypothesis Generation", description: "Particularly for VUS, complex disorders, and novel therapeutic approaches.", iconColor: 'text-orange-500' },
          { icon: TargetIconLucide, title: "Improved Target Selection", description: "Data-driven prioritization of genetic targets for therapeutic intervention.", iconColor: 'text-red-500' }
        ]
      }
    },
    {
      id: 'hgpLegacy',
      component: ScientificFoundationSlide,
      data: {
        headline: " Scientific Foundation: The Genomic Revolution",
        hgpSection: {
          title: "The Human Genome Project: A Paradigm Shift",
          icon: BookOpen,
          iconColor: 'text-blue-600',
          points: [
            "Delivered the complete human genome reference sequence.",
            "Revolutionized gene discovery and understanding.",
            "Catalyzed breakthroughs in sequencing and analysis technologies."
          ]
        },
        platformSection: {
          title: "CrisPRO: Built on Proven Science",
          icon: Layers,
          iconColor: 'text-green-600',
          points: [
            "Leverages the reference genome for high-precision therapeutic design.",
            "Integrates decades of research on gene function and disease associations.",
            "Continuously updated with insights from the latest scientific literature."
          ]
        }
      }
    },
    {
      id: 'genomicComplexity',
      component: GenomicComplexitySlide,
      data: {
        headline: "Mastering Genomic Complexity for Therapeutic Breakthroughs",
        complexities: [
          {
            title: "Precision Targeting in a Compact Genome",
            icon: Target,
            description: "CrisPRO's AI excels at identifying high-value targets in a surprisingly compact human genome, maximizing therapeutic impact where others might miss.",
            iconColor: 'text-teal-600'
          },
          {
            title: "Isoform-Specific Design for Enhanced Efficacy",
            icon: GitFork,
            description: "CrisPRO differentiates between gene isoforms, ensuring therapies target the precise disease-causing protein variants, boosting efficacy and reducing off-target risks.",
            iconColor: 'text-purple-600'
          },
          {
            title: "Unlocking the Non-Coding Genome: New Therapeutic Frontiers",
            icon: Puzzle,
            description: "CrisPRO explores the 98% non-coding genome, identifying novel pathogenic variants in regulatory regions to unlock a vast, untapped landscape for first-in-class therapies.",
            iconColor: 'text-orange-600'
          },
          {
            title: "Adaptive Intelligence for Evolving Genomic Knowledge",
            icon: Search,
            description: "As \"genomic dark matter\" is illuminated, CrisPRO's adaptive learning capabilities integrate new knowledge, ensuring our platform remains at the cutting edge of therapeutic design.",
            iconColor: 'text-cyan-600'
          }
        ]
      }
    },
    {
      id: 'genotypePhenotypeGap',
      component: GenotypePhenotypeSlide,
      data: {
        headline: "Unlocking Predictable Cures: From Genetic Code to Clinical Outcome (PKU Case)",
        challengeSection: {
          title: "The Genotype-Phenotype Chasm: A Barrier to Precision Medicine",
          icon: HelpCircle,
          text: "For monogenic diseases like PKU, a patient's genetic code (genotype) doesn't always directly predict disease severity or treatment response (phenotype). This gap hinders the development of truly personalized and predictably effective therapies, leading to costly trial-and-error.",
          iconColor: 'text-red-600'
        },
        solutionSection: {
          title: "CrisPRO's Predictive Engine: Linking Genetics to Therapeutic Effect",
          icon: Combine,
          points: [
            "Integrates multi-modal patient data: Combines genotypic (e.g., PAH mutations) with critical phenotypic biomarkers (e.g., phenylalanine levels) to build comprehensive 'Digital Twin' models.",
            "Predicts therapeutic impact on key clinical endpoints: CrisPRO simulates how designed gene therapies will directly affect measurable outcomes, like phenylalanine reduction in PKU.",
            "Drives rational drug design & de-risking: Enables iterative optimization of therapies based on predicted clinical efficacy, significantly improving the odds of successful patient outcomes and reducing late-stage failures."
          ],
          iconColor: 'text-green-600'
        }
      }
    },
    {
      id: 'pkuPlatformInAction',
      component: PlatformFeaturesSlide, 
      data: {
        headline: "Accelerating Monogenic Disease Cures: CrisPRO's PKU Therapeutic Design Workflow",
        features: [
          { id: "literaturePku", icon: BookText, title: "1. Rapid Landscape Analysis & Target Validation", points: ["Instantly synthesizes PKU gene therapy research (AAVs, Cas enzymes, etc.), accelerating target validation and de-risking initial design choices by leveraging existing global knowledge."], iconColor: 'text-blue-600' },
          { id: "simulationPku", icon: TestTube2, title: "2. AI-Driven Design & In Silico Optimization", points: ["Optimizes gRNAs & HDR templates for precise PAH gene correction.", "Validates structural viability of therapeutic components (AlphaFold-inspired) & predicts optimal delivery systems (AAVs/LNPs for liver), creating superior candidates faster."], iconColor: 'text-green-600' },
          { id: "aiAgentsPku", icon: Cpu, title: "3. End-to-End Workflow Automation & Decision Support", points: ["AI Agents streamline the PKU therapeutic design lifecycle, from initial concept to a 'Digital Twin' model, maximizing R&D efficiency and reducing human resource costs."], iconColor: 'text-purple-600' },
          { id: "regulatoryPku", icon: ShieldCheck, title: "4. Expediting Path to Clinic: Regulatory & Preclinical Guidance", points: ["Proactively identifies key regulatory considerations & preclinical data requirements (biodistribution, immunogenicity) for PKU therapies, shortening timelines to IND."], iconColor: 'text-orange-600' }
        ]
      }
    },
    {
      id: 'pkuBenefits',
      component: BenefitsSlide, 
      data: {
        headline: "CrisPRO for Monogenic Diseases: Compelling ROI & Market Impact (PKU Example)",
        benefits: [
          { icon: Rocket, title: "Dramatically Accelerated Pre-Clinical Timelines", description: "Streamlined in silico design for PKU projects a [X]% reduction in early-stage R&D duration.", iconColor: 'text-blue-600' },
          { icon: TargetIconLucide, title: "Superior Therapeutic Candidates, Lower Risk", description: "Optimized PAH gene therapies designed for enhanced safety & efficacy, improving probability of clinical success.", iconColor: 'text-green-600' },
          { icon: DollarSign, title: "Significant R&D Cost Reduction", description: "Early computational validation for PKU de-risks development, potentially saving millions in avoided wet-lab failures.", iconColor: 'text-purple-600' },
          { icon: UsersIcon, title: "Scalable Platform for Broad Monogenic Disease Portfolio", description: "PKU success demonstrates a replicable model for rapidly developing therapies across numerous rare genetic disorders, unlocking vast market potential.", iconColor: 'text-teal-600' },
          { icon: TrendingUp, title: "Enhanced Clinical Translation & Asset Value", description: "Data-driven PKU designs create more valuable therapeutic assets with a clearer path to market approval and patient impact.", iconColor: 'text-orange-500' }
        ]
      }
    },
    // Investor-Focused Refinement for "Decoding Genetic Complexity" Section
    {
      id: 'geneticComplexityTitle',
      component: TitleSlide,
      data: {
        mainTitle: "Unlocking New Markets: Decoding Genetic Complexity for Novel Therapies",
        subTitle: "Our AI-Powered Platform: From Germline Insights to High-Value Somatic Solutions & Cancer Therapeutics"
      }
    },
    {
      id: 'deNovoGermlineChallenge',
      component: GenotypePhenotypeSlide, 
      data: {
        headline: "Tackling De Novo Disorders: A New Frontier in Genetic Medicine",
        challengeSection: {
          title: "The Growing De Novo Mutation Challenge",
          icon: Baby,
          text: "Rising parental age correlates with increased de novo mutations, a significant and often unaddressed cause of genetic disorders. This represents a critical unmet need.",
          iconColor: 'text-blue-600' 
        },
        solutionSection: {
          title: "CrisPRO: Rapid De Novo Insight & Therapeutic Design",
          icon: SearchCheck,
          points: [
            "Market Access: Addresses urgent diagnostic and therapeutic exploration needs for de novo conditions.",
            "Speed & Efficiency: Rapidly identifies causative de novo mutations from trio sequencing via AI agents.",
            "Actionable Insights: Simulated Evo2 & AlphaFold predict functional impact, guiding therapy development.",
            "Therapeutic Pipeline Accelerator: Fast-tracks exploration of gene editing solutions (HDR, base/prime editing) with in silico validation.",
            "Clear ROI: Reduces diagnostic odyssey, accelerates R&D for rare diseases, offering significant patient and market value."
          ],
          iconColor: 'text-green-600'
        }
      }
    },
    {
      id: 'advancedSequencingInsights',
      component: GenotypePhenotypeSlide, 
      data: {
        headline: "Unlocking the Full Potential of Genomic Data (WGS/WES)",
        challengeSection: {
          title: "The Data-to-Value Gap in Advanced Sequencing",
          icon: FileSearch, 
          text: "Genomic data (WGS/WES) is exploding, but extracting actionable therapeutic insights, especially from non-coding regions and low-frequency variants, remains a major bottleneck. This limits ROI on sequencing investments.",
          iconColor: 'text-indigo-600'
        },
        solutionSection: {
          title: "Our Platform: Maximizing ROI from Sequencing Data",
          icon: Settings2, 
          points: [
            "Versatile Ingestion: Seamlessly processes WES/WGS, maximizing data asset utilization.",
            "Future-Proof Non-Coding Analysis: Positions platform for next-gen insights by leveraging Simulated Evo2 for non-coding regulatory variants—a largely untapped therapeutic area.",
            "Enhanced Precision with Read Depth: Conceptual \'Variant Call Confidence\' improves design accuracy and de-risks downstream development.",
            "Mosaicism & Low-Frequency Variant Targeting: Unlocks complex disease targets (e.g., cancer, developmental mosaicism), expanding market reach."
          ],
          iconColor: 'text-teal-600'
        }
      }
    },
    {
      id: 'cancerGeneticsDualRole',
      component: DualRoleCancerSlide,
      data: {
        headline: "Dominating the Cancer Market: From Germline Risk ID to Precision Somatic Therapies",
        spectrumIntro: {
          title: "The Multi-Trillion Dollar Cancer Challenge",
          icon: Activity, 
          points: [
            "Addresses both inherited risk (BRCA1/2, etc.) – a growing preventative & early detection market.",
            "Tackles somatic mutations – the core of active cancer treatment, a vast therapeutic market.",
            "Future-Ready for Polygenic Risk & Liquid Biopsies: Positioned for next-gen diagnostics and monitoring."
          ],
          iconColor: 'text-gray-700'
        },
        roleA: {
          title: "A. Germline Risk: Prophylactic & Research Markets",
          icon: UsersIcon, 
          scenario: "Individual with high-risk germline mutation (e.g., BRCA1).",
          platformUse: {
            title: "Platform Value Proposition:",
            points: [
              "Accelerates research into prophylactic gene editing concepts (high future value).",
              "Enables creation of advanced disease models (e.g., organoids) for drug discovery & validation."
            ]
          },
          iconColor: 'text-purple-600'
        },
        roleB: {
          title: "B. Somatic Cancers: Powering Precision Oncology Today",
          icon: Target, 
          scenario: "Patient with tumor-identified somatic drivers (e.g., KRAS, EGFR).",
          platformStrength: {
            title: "Unlocking Next-Gen Cancer Therapies:",
            points: [
              "Validates & Prioritizes Somatic Targets: Simulated Evo2 pinpoints high-impact drivers.",
              "Designs Diverse Therapeutic Modalities: CRISPR knockout, correction, suicide genes, advanced CAR-T cell engineering – diversifying shots on goal."
            ]
          },
          highDepthNote: "Critical for Low-Frequency Drivers: Maximizes success in heterogeneous tumors, a key challenge.",
          liquidBiopsyNote: "Future-Ready: Seamless integration with liquid biopsies for minimally invasive treatment guidance & monitoring.",
          iconColor: 'text-red-600'
        }
      }
    },
    {
      id: 'geneticMechanismsIntegration',
      component: GeneticMechanismsSlide,
      data: {
        headline: "Our Scientific Edge: Deeper Genetic Understanding Drives Superior Design",
        mechanismA: {
          title: "Understanding Mutation Origins (e.g., Spermatogonial Selection)",
          icon: ListChecks, 
          concept: "CrisPRO incorporates advanced genetic knowledge, like how certain de novo mutations gain prevalence.",
          platformImplication: "Competitive Edge: This informs our Knowledge Graph and AI, potentially identifying patterns or predispositions others miss, leading to more robust therapeutic hypotheses and IP generation.",
          iconColor: 'text-cyan-600'
        },
        mechanismB: {
          title: "Targeting Gene Defects Arising from Complex Events (e.g., Meiosis)",
          icon: Shuffle, 
          concept: "While we don\'t correct whole chromosome issues (aneuploidy), our precision allows targeting specific gene defects that may co-occur.",
          platformImplication: "Expanded Scope: Enables addressing a wider range of genetic disorders by focusing on the actionable gene-level problem, broadening market applicability where single-gene edits are feasible.",
          iconColor: 'text-lime-600'
        }
      }
    },
    {
      id: 'complexGeneticsPlatformComponents',
      component: PlatformFeaturesSlide, 
      data: {
        headline: "Our Technology Backbone: Powering Solutions for Complex Genetics",
        features: [
          {
            id: "variantAnalysisComplex",
            icon: Filter, 
            title: "1. Intelligent Variant Prioritization Engine",
            points: [
              "Scalable processing of WGS/WES for de novo & somatic mutations.",
              "AI-driven flagging using functional prediction (Simulated Evo2), read depth, inheritance – increasing accuracy & speed to insight."
            ],
            iconColor: 'text-blue-600'
          },
          {
            id: "simulationEngineComplex",
            icon: BrainCircuit, 
            title: "2. Predictive In Silico Simulation Core",
            points: [
              "Rapidly models impact of novel/somatic variants, de-risking R&D.",
              "Designs optimized CRISPR systems (knockout, correction), accelerating therapeutic candidate generation."
            ],
            iconColor: 'text-green-600'
          },
          {
            id: "advSeqInterpretationComplex",
            icon: FileCode, 
            title: "3. Next-Gen Sequencing Analytics & Interpretation",
            points: [
              "Maximizes value from VCFs: AI agents consider read depth for call confidence.",
              "Future-Proof: Ready for non-coding variant annotation, unlocking new target classes."
            ],
            iconColor: 'text-purple-600'
          },
          {
            id: "cancerLogicComplex",
            icon: Target, 
            title: "4. Specialized Oncology Design Module",
            points: [
              "Dedicated logic for prioritizing high-value somatic targets.",
              "Focus on ultra-high specificity design to minimize off-target effects.",
              "Models efficacy considering tumor heterogeneity – key for real-world cancer treatment."
            ],
            iconColor: 'text-red-600'
          }
        ]
      }
    },
    {
      id: 'complexGeneticsBenefits',
      component: BenefitsSlide, 
      data: {
        headline: "Investment Thesis: Why CrisPRO Wins in Complex Genetics",
        benefits: [
          {
            icon: SearchX, 
            title: "Accelerated De Novo Solutions: Faster Path to Market",
            description: "Rapidly clarifies de novo mutations, accelerating R&D for rare diseases and orphan drug opportunities.",
            iconColor: 'text-sky-600'
          },
          {
            icon: DatabaseZap, 
            title: "Enhanced Data Monetization: Maximize Genomic ROI",
            description: "Unlocks full value of WES/WGS data, improving diagnostic yield and therapeutic target identification.",
            iconColor: 'text-teal-600'
          },
          {
            icon: GitCompareArrows, 
            title: "Dual Market Penetration: Germline & Somatic Oncology",
            description: "Unique platform addressing both inherited risk (emerging markets) and active cancer therapies (established, large markets).",
            iconColor: 'text-indigo-600'
          },
          {
            icon: Code, 
            title: "Pioneering Non-Coding Therapeutics: Untapped Potential",
            description: "Future-ready for the non-coding genome, opening vast new therapeutic target space and IP opportunities.",
            iconColor: 'text-purple-600'
          },
          {
            icon: HelpCircle, 
            title: "Solving Hard Cases: Differentiated Clinical Value",
            description: "In silico insights for challenging scenarios (mosaicism, VUS), offering clear clinical differentiation and utility.",
            iconColor: 'text-amber-600'
          }
        ]
      }
    },
    // Original General Investor Slides (can be reordered or interspersed)
    {
      id: 'somaticMosaicism',
      component: SomaticMosaicismSlide,
      data: {
        headline: "CrisPRO: Mastering Cancer's Complexity - Somatic Mutations & Mosaicism", // More active headline
        challenge: {
          icon: AlertTriangle,
          text: "Somatic mutations and tumor mosaicism drive cancer's heterogeneity, treatment resistance, and represent a multi-billion dollar challenge in oncology.", // More focused on the scientific challenge
          reference: "Context: Over 85% of cancers are driven by somatic mutations.", // Simplified reference
          iconColor: 'text-red-700' 
        },
        platformApproach: {
          title: "CrisPRO's Precision Engineering for Heterogeneous Cancers", // Added "Engineering"
          items: [
            {
              icon: DnaIcon, // Good icon
              title: "AI-Driven Design for Tumor-Specific Somatic Targets", // More specific to CrisPRO's capability
              description: "CrisPRO's AI precisely designs CRISPR systems to target cancer-cell-specific somatic mutations, maximizing therapeutic windows and minimizing off-tumor effects.", // Highlights AI and benefit
              iconColor: 'text-blue-600'
            },
            {
              icon: GitMerge, // Good icon
              title: "Predictive Modeling of Mosaicism & Therapeutic Efficacy", // Highlights predictive capability
              description: "CrisPRO's 'Digital Twin' simulations incorporate Variant Allele Frequency (VAF) data to model tumor mosaicism, predict necessary editing efficiencies, and preemptively address resistance mechanisms.", // Connects to Digital Twin and VAF
              iconColor: 'text-green-600'
            },
            {
              icon: Zap, // Good icon (consider Route or TargetArrow if delivery-focused)
              title: "In Silico Optimization for Tumor Microenvironment Delivery", // More specific capability
              description: "CrisPRO simulates and optimizes delivery system parameters (e.g., vector choice, targeting moieties) to effectively reach heterogeneous tumor cell populations within complex microenvironments.", // Details the "how"
              iconColor: 'text-purple-600'
            }
          ]
        }
      }
    },
    {
      id: 'dtcLandscape',
      component: DTCTestingLandscapeSlide,
      data: {
        headline: "Bridging the Data Gap: From Consumer Insights to Clinical Grade Therapeutics",
        context: {
          icon: Info, // Or a more dynamic icon like GitCompareArrows or LinkIcon
          title: "The Fragmented Genomic Data Landscape: A Critical Bottleneck", // New title for context
          text: "Millions engage with DTC genetic tests, creating a flood of consumer-generated data often disconnected from clinical-grade diagnostics. This fragmentation leads to patient confusion, missed opportunities for early intervention, and inefficient pathways to potentially life-altering therapies.",
          reference: "Market Impact: Significant untapped potential in guiding consumers towards appropriate clinical validation and therapeutic exploration.",
          iconColor: 'text-sky-700' 
        },
        platformRole: {
          title: "CrisPRO: Intelligent Navigation & Clinical Integration",
          educationalAgent: { // Renaming to section1 or similar might be better if component is generic
            icon: GraduationCap, // Consider SearchCheck or Filter for AI analysis
            title: "AI-Powered Preliminary Insight Engine",
            points: [
              "Analyzes consumer-originated genetic data (conceptually) to identify variants of potential clinical significance, flagging them for further, clinically validated investigation.",
              "Provides context on the limitations of DTC data while highlighting pathways for users and their clinicians to pursue rigorous clinical validation for potential therapeutic design with CrisPRO."
            ],
            iconColor: 'text-green-600'
          },
          clinicalDialogue: { // Renaming to section2 or similar might be better
            icon: MessageSquare, // Consider UsersRound or Briefcase for clinician tools
            title: "Seamless Clinician Collaboration & Data Integration",
            points: [
              "Equips clinicians with tools to integrate and interpret diverse genomic datasets (DTC + clinical), providing a comprehensive view for informed decision-making.",
              "Streamlines the transition from preliminary findings to CrisPRO's advanced therapeutic design modules, ensuring that only clinically validated targets proceed to in-depth in silico analysis."
            ],
            iconColor: 'text-indigo-600'
          }
        }
      }
    },
    {
      id: 'powerTrio',
      component: PowerTrioSlide,
      data: {
        headline: "The Power Trio: Predictive Science, Precision Engineering, Intelligent Orchestration",
        pillars: [
          {
            icon: Atom,
            title: "Predictive Engine: Functional Genomics (Evo2-Inspired)",
            description: "Unlocks novel therapeutic targets and engineers superior effectors by rapidly predicting how genetic variations impact function and guiding the design of optimized biological components.",
            details: [
              "Interpreting variant effects on function.",
              "Generating novel therapeutic components (e.g., optimized Cas variants).",
              "Proposing therapeutic strategies based on genetic defects."
            ],
            iconColor: 'text-blue-700',
            bgColor: 'bg-blue-100',      
            borderColor: 'border-blue-300' 
          },
          {
            icon: Layers,
            title: "Precision Engineering: Structural Biology (AlphaFold-Inspired)",
            description: "Ensures therapeutic safety and efficacy at the molecular level by validating the structural integrity of all designed components and predicting critical interactions within the cellular environment.",
            details: [
              "Assessing structural impact of genetic variants on proteins.",
              "Validating 3D structural integrity of ALL designed CRISPR components and complexes.",
              "Predicting how engineered therapeutic molecules will interact."
            ],
            iconColor: 'text-green-700',
            bgColor: 'bg-green-100',
            borderColor: 'border-green-300'
          },
          {
            icon: Cpu, 
            title: "Intelligent Orchestration: AI-Powered Therapeutic Design",
            description: "Automates and accelerates the end-to-end therapeutic design process, from target discovery to pre-clinical candidate.",
            details: [
              "Data Interpretation: Understanding complex genetic findings (powered by tools/llm_api.py).",
              "Workflow Guidance: Steering users from variant to in silico validated design.",
              "Component Optimization: Iteratively refining designs.",
              "Risk/Feasibility Assessment: Synthesizing data into actionable insights."
            ],
            iconColor: 'text-purple-700',
            bgColor: 'bg-purple-100',
            borderColor: 'border-purple-300'
          }
        ],
        synergy: {
          icon: Shuffle,
          text: "CrisPRO's unique Power Trio synergistically creates an engine that rapidly designs, de-risks, and optimizes novel CRISPR therapeutics, offering a significant competitive advantage and accelerating the path to clinicals.",
          iconColor: 'text-indigo-700' 
        }
      }
    },
    {
      id: 'generalTitle',
      component: TitleSlide,
      data: { 
        iconVisual: <div className="text-6xl mb-6">🧬</div>,
        mainTitle: "CrisPRO Oncology Co-Pilot", 
        subTitle: "Revolutionizing Cancer Care Through AI-Powered Precision Medicine"
      }
    },
    {
      id: 'generalProblem',
      component: ProblemSlide,
      data: {
        headline: "The Crisis in Modern Oncology",
        subHeadline: "Data Overload, Decision Fatigue, and Disconnected Care define today's landscape.",
        problems: generalProblemDataProblems,
        gapSummary: {
          icon: AlertTriangle,
          title: "The Overwhelming Gap:",
          description: "Suboptimal treatment decisions and missed therapeutic opportunities.",
          iconColor: "text-red-500"
        }
      }
    },
    {
      id: 'market',
      component: MarketSlide,
      data: { /* MarketSlide data to be structured and passed here */ }
    },
    {
      id: 'generalSolution',
      component: SolutionSlide,
      data: {
        headline: "CrisPRO Intelligent Oncology Co-Pilot",
        subHeadline: "AI-Powered Precision & Compassion: Unifying Cancer Care.",
        hub: {
          iconJsx: <DnaIcon size={64} className="text-white" />,
          title: "CrisPRO Oncology Co-Pilot",
          description: " Revolutionizing Cancer Care Through AI-Powered Precision Medicine"
        },
        spokes: [
          { id: 'emr', icon: ClipboardList, title: 'EMR Integration', description: 'Real-time EMR data for comprehensive patient profiles.', iconColor: 'text-sky-600' },
          { id: 'agents', icon: Cpu, title: 'AI Agent Suite', description: 'Genomic Analysis, Data Synthesis & Therapy Simulation.', iconColor: 'text-green-600' },
          { id: 'patient', icon: UsersRound, title: 'Patient Empowerment', description: 'Personalized insights & collaborative care tools.', iconColor: 'text-purple-600' },
          { id: 'research', icon: FlaskConical, title: 'Research & Trials', description: 'AI-driven clinical trial matching & novel therapy insights.', iconColor: 'text-amber-600' },
          // { id: 'workflow', icon: WorkflowIconLucide, title: 'Streamlined Workflows', description: 'Automated interpretation & decision support for oncology.', iconColor: 'text-rose-600' }
        ],
        coreValues: [
          { text: "Actionable Intelligence: AI-synthesized insights from complex genomic & clinical data.", icon: CheckCircle2, color: "text-blue-600" },
          { text: "Precision Oncology: AI-driven tools for targeted therapeutic design & strategy.", icon: CheckCircle2, color: "text-green-600" },
          { text: "Collaborative Care: Empowering patients & clinicians with shared, understandable data.", icon: CheckCircle2, color: "text-purple-600" }
        ]
      }
    },
    { id: 'platform', component: PlatformSlide, data: {} },
    { id: 'features', component: FeaturesSlide, data: {} },
    { id: 'advantage', component: AdvantageSlide, data: {} },
    { id: 'business-model', component: BusinessModelSlide, data: {} },
    { id: 'financials', component: FinancialsSlide, data: {} },
    { id: 'team', component: TeamAndVisionSlide, data: {} },
    // New Investor Pitch Sequence (Slides 2-8 from user prompt)
    {
      id: 'therapeuticDevelopmentProblem',
      component: ProblemSlide, // Reusing ProblemSlide
      data: {
        headline: "The Path to New Medicines is Broken.",
        subHeadline: "Current therapeutic development is too slow, too costly, and too prone to failure, delaying life-saving innovations.",
        problems: [
          { icon: DollarSignIcon, title: "Massive Costs", description: "Avg. $2.6 Billion & 10+ years per drug.", iconColor: "text-red-500" },
          { icon: TrendingDown, title: "High Failure Rates", description: "Over 90% of drugs entering clinical trials fail, often in late stages.", iconColor: "text-orange-500" },
          { icon: ClockIcon, title: "Slow Pace to Patients", description: "Critical delays mean patients wait too long for potentially life-saving treatments.", iconColor: "text-yellow-500" },
          { icon: BrainCircuitIcon, title: "Data Complexity Overload", description: "Genomic, proteomic, and clinical data deluge overwhelms traditional R&D approaches.", iconColor: "text-purple-500" },
          { icon: SettingsIcon, title: "CRISPR's Bottlenecked Promise", description: "Revolutionary potential hindered by design complexity, off-target risks, delivery challenges, & predicting efficacy.", iconColor: "text-teal-500" }
        ],
        gapSummary: { 
          icon: AlertTriangleIcon,
          title: "The Imperative:",
          description: "A smarter, faster, more predictive paradigm for therapeutic development is urgently needed.",
          iconColor: "text-gray-700"
        }
      }
    },
    {
      id: 'crisproPlatformSolutionNew', 
      component: SolutionPlatformSlide, 
      data: {
        // Suggestion: More active and benefit-oriented headline
        headline: (
          <div className="flex items-center justify-center"> {/* Adjust alignment if needed */}
            CrisPRO: Engineering Predictable CRISPR Cures
            <DnaIcon size={28} className="ml-2 text-blue-600" /> {/* Added DnaIcon */}
          </div>
        ), 
        // headline: "CrisPRO: AI-Powered Precision in CRISPR Therapeutics", // Alternative headline
    
        introduction: "AI-driven intelligence platform that transforms CRISPR therapeutic design ", // This is strong
        vision: {
          icon: TargetIcon, 
          text: "To rapidly design, validate, and de-risk transformative CRISPR medicines, achieving unprecedented precision and speed to bring breakthroughs to patients.",
          iconColor: "text-green-600"
        },
        corePrinciple: {
          // title: "CrisPRO's Core Capabilities:", // Suggestion: More direct title
          items: [
            { 
              icon: BrainCircuitIcon, 
              // Suggestion: More specific title
              title: "Intelligent CRISPR Design Engine", 
              // Suggestion: More specific and benefit-oriented details
              details: "predict optimal gRNAs, minimize off-targets, and forecast editing outcomes with high accuracy.", 
              iconColor: 'text-blue-600' 
            },
            { 
              icon: TestTube2Icon, 
              // Suggestion: Title reflecting the advanced nature
              title: "Predictive Molecular Modeling", 
              // Suggestion: Clarify the "conceptual" aspect if it's a key differentiator or how it's applied
              details: " Evo2-inspired simulations for enzyme engineering and AlphaFold-inspired molecular level structural analysis ", 
              iconColor: 'text-yellow-500' 
            },
            { 
              icon: UsersIconLucide, 
              // Suggestion: Emphasize the dynamic and predictive nature
              title: "Dynamic Patient & Disease Emulation", 
              details: "Dynamic 'Digital Twins' to conduct in silico trials, predicting patient-specific responses before clinical stages.", 
              iconColor: 'text-purple-600' 
            },
            { 
              icon: DatabaseZapIcon, 
              // Suggestion: Focus on the output/benefit
              title: "Integrated Biological Intelligence", 
              details: "Curated knowledge graphs to uncover novel targets and refine therapeutic strategies within biological context.", 
              iconColor: 'text-teal-600' 
            },
            { 
              icon: ShieldCheckIcon, 
              // Suggestion: More active and outcome-focused title
              title: "Proactive In Silico De-risking", 
              // Suggestion: Stronger benefit statement
              details: "Agentically identifying and mitigating potential therapeutic failures in silico, dramatically reducing R&D costs and accelerating timelines to clinic.", 
              iconColor: 'text-red-500' 
            },
            { 
              icon: UsersIcon, // Or a more workflow-specific icon if available (e.g., GitMergeIcon, NetworkIcon)
              // Suggestion: Focus on the platform's integration capability
              title: "Unified & Intelligent Workflow", 
              details: "Orchestrating a seamless, AI-assisted journey from target identification to pre-clinical candidate within a single, collaborative platform.", 
              iconColor: 'text-cyan-500' 
            }
          ]
        }
      }
    },
    {
      id: 'intelligentEngineHowItWorks',
      component: IntelligentEngineSlide, 
      data: {
        headline: "Intelligent Design, Simulation, and Prediction",
        subHeadline: "Our synergistic engine iteratively refines therapeutic candidates.",
        input: {
          title: "Input Data",
          icon: UploadCloudIcon,
          items: ["Raw Genetic Sequences (WGS/WES, VCFs)", "Patient Phenotypic Information", "Specific Therapeutic Goals", "Experimental Design Parameters"]
        },
        coreEngine: {
          title: "CrisPRO Core Engine",
          icon: Share2Icon,
          components: [
            { name: "AI Agents", description: "CrisPRO Genomic Analyst, Design Synthesizer, Safety Modeler & more for collaborative problem-solving." },
            { name: "Simulation Hub", description: "In silico validation of guide efficacy, structural interactions, editing outcomes, & off-target effects." },
            { name: "Digital Twin Modeler", description: "Creating & interrogating virtual patient/disease models to predict therapeutic responses." },
            { name: "Knowledge Graph", description: "Integrating vast biological, clinical, and pharmacological datasets for deep insights." }
          ]
        },
        output: {
          title: "Actionable Outputs",
          icon: TargetIcon,
          items: ["Optimized & De-risked Therapeutic Candidates", "Accelerated IND Timelines", "Enhanced Likelihood of Approval (LoA)", "Predictive Efficacy & Safety Profiles"]
        }
      }
    },
    {
      id: 'crisproDifferentiators',
      component: DifferentiatorsSlide, 
      data: {
        headline: "Why We Win: Our Unique Technology Stack & Unfair Advantages",
        differentiators: [
          { 
            icon: UsersIconLucide, 
            title: "Multi-Agent Collaborative Intelligence", 
            description: "Beyond siloed tools: Our AI agents (e.g., Guide Optimizer, Off-Target Predictor, Structural Modeler) communicate and collaborate, proactively identifying and resolving complex design challenges.", 
            impact: "Superior, safer designs, reduced late-stage failures.",
            investorValue: "Higher probability of success, protected IP in novel design space.",
            iconColor: "text-blue-600"
          },
          { 
            icon: CopyIcon, 
            title: "Dynamic Digital Twins for Predictive \"What-Ifs\"", 
            description: "Not just static models: Simulate therapeutic interventions on virtual patients/diseases, predict responses to different designs, doses, and delivery methods before costly experiments.", 
            impact: "Massively reduced animal testing, optimized human trial design.",
            investorValue: "Lower R&D costs, faster to market, stronger data for regulators.",
            iconColor: "text-green-600" 
          },
          { 
            icon: LayersIcon, 
            title: "Integrated In Silico Validation & Structural Biology", 
            description: "Conceptual Evo2-like directed evolution and AlphaFold-like structural prediction to assess protein function, guide-target interaction, and impact of edits at a molecular level.", 
            impact: "Novel biological insights, superior target/effector selection.",
            investorValue: "First-mover advantage in complex targets, de-risked candidate pipeline.",
            iconColor: "text-purple-600"
          },
          { 
            icon: ShieldCheckIcon, 
            title: "End-to-End Therapeutic De-risking", 
            description: "From initial target ID and VUS interpretation through to pre-clinical validation insights and regulatory readiness estimation.", 
            impact: "Streamlined path from discovery to IND-enabling studies.",
            investorValue: "Increased capital efficiency, clearer milestones for subsequent funding rounds.",
            iconColor: "text-red-600"
          }
        ]
      }
    },
    {
      id: 'useCaseComplexDisease',
      component: UseCaseSpotlightSlide, 
      data: {
        headline: "Use Case: Solving \"Undruggable\" Targets & Complex Genetic Diseases",
        scenario: "Tackling 'Syndrome X': A Fictional Complex Multi-Exon Deletion Disorder",
        problem: {
          title: "The Challenge",
          icon: MicroscopeIcon,
          description: "High VUS burden in surrounding genes, unclear optimal editing strategy (e.g., exon skipping vs. precise correction), significant risk of off-target effects with standard design approaches.",
          iconColor: "text-red-700"
        },
        platformInAction: {
          title: "CrisPRO Platform in Action",
          icon: ZapIcon,
          steps: [
            "CrisPRO AI agents analyze patient WGS, prioritize functional context, and design a multi-guide RNA strategy for precise large-fragment deletion and insertion.",
            "Digital Twin of 'Syndrome X' simulates HDR vs. NHEJ outcomes for desired gene correction efficacy and models potential mosaicism.",
            "Simulated Evo2/AlphaFold modules refine Cas effector protein for enhanced specificity to challenging genomic loci and predict structural integrity of the RNP complex.",
            "Comprehensive off-target analysis (in silico) and delivery system parameter optimization guide lead candidate selection."
          ],
          iconColor: "text-blue-700"
        },
        outcome: {
          title: "The Outcome",
          icon: TrendingUpIcon,
          description: "Identification of a high-potential, de-risked therapeutic candidate for 'Syndrome X' with a projected 70% reduction in pre-clinical experimentation time and cost.",
          iconColor: "text-green-700"
        }
      }
    },
    {
      id: 'useCaseClinicalTrials',
      component: UseCaseSpotlightSlide, 
      data: {
        headline: "Use Case: Revolutionizing Clinical Trial Design & Success",
        scenario: "Improving Success Rates for 'GeneTherapy Y' for a common oncological indication.",
        problem: {
          title: "The Challenge",
          icon: UsersRoundIcon,
          description: "Historically high Phase II/III failure rates due to poor patient stratification, unexpected adverse events in specific subpopulations, and suboptimal dosing regimens.",
          iconColor: "text-orange-700"
        },
        platformInAction: {
          title: "CrisPRO Platform in Action",
          icon: Settings2Icon,
          steps: [
            "CrisPRO Digital Twins of diverse patient cohorts identify genomic/phenotypic biomarkers to stratify patients, projecting an >80% responder rate for the selected sub-population.",
            "AI models analyze pre-clinical data to optimize dosing schedules, predicting a 40% reduction in specific adverse events.",
            "Simulation of editing kinetics and long-term expression durability informs primary and secondary efficacy endpoints for the trial protocol.",
            "AI-driven analysis of emerging real-world data (conceptual) allows for adaptive trial parameter refinement."
          ],
          iconColor: "text-indigo-700"
        },
        outcome: {
          title: "The Outcome",
          icon: TrendingUpIcon,
          description: "'GeneTherapy Y' Phase II trial designed for maximum success: Projected 50% trial cost reduction and a 9-month acceleration to key clinical inflection point.",
          iconColor: "text-green-700"
        }
      }
    },
    {
      id: 'crisproMarketOpportunity',
      component: MarketSlide, 
      data: {
        headline: "Powering the Multi-Trillion Dollar Gene Therapy & Precision Medicine Revolution",
        marketStats: [
          { title: "Global Gene Therapy Market", value: "$15.5B by 2027", source: "Example Source A", cagr: "25.2% CAGR" , icon: DollarSignIcon, iconColor: "text-green-600"},
          { title: "CRISPR Therapeutics Market", value: "$10.8B by 2028", source: "Example Source B", cagr: "20.5% CAGR", icon: DnaIconImport, iconColor: "text-blue-600" }, // Changed DnaIcon to DnaIconImport based on alias
          { title: "Precision Medicine Market", value: "$175B by 2030", source: "Example Source C", cagr: "12.8% CAGR", icon: TargetIcon, iconColor: "text-purple-600" }
        ],
        whyNow: {
          title: "Why Now? A Convergence of Transformative Forces",
          icon: ZapIcon, 
          points: [
            "Explosion of Affordable Genomic Data (WGS/WES).",
            "Rapid Advancements in AI & Computational Biology.",
            "Maturation of CRISPR Gene Editing Technologies.",
            "Increasing Regulatory Acceptance for Novel Therapeutics."
          ],
          iconColor: "text-orange-500"
        },
        ourNiche: {
          title: "CrisPRO's Unique Position",
          icon: PieChartIcon,
          text: "Positioned as the essential AI & Simulation Engine driving therapeutic innovation, de-risking development, and accelerating success across the gene therapy landscape.",
          addressableMarketNote: "Targeting a significant share of the rapidly expanding therapeutic design and *in silico* validation market.",
          iconColor: "text-indigo-600"
        }
      }
    },
    {
      id: 'clinicalTrialMatching',
      component: ProblemSlide,
      data: {
        headline: "CrisPRO: AI-Powered Precision Matching & Coordinated Care",
        subHeadline: "Transforming trial recruitment, automating care pathways, and expanding patient support for superior outcomes.",
        problems: [
          {
            icon: AlertTriangle,
            title: "Clinical Trial Bottleneck",
            description: "80% of trials face costly delays from recruitment challenges, hindering patient access to vital treatments and slowing innovation.",
            iconColor: 'text-red-700'
          },
          {
            icon: SearchCheck,
            title: "AI-Powered Trial Matching",
            description: "CrisPRO's AI deciphers complex patient data and trial protocols, ensuring precise, context-aware matching beyond simple keywords.",
            iconColor: 'text-blue-700'
          },
          {
            icon: WorkflowIconLucide,
            title: "AI-Driven Follow-Up Tasks",
            description: "Post-match, AI agents create and schedule precise follow-up tasks for clinicians, ensuring proactive patient management and adherence.",
            iconColor: 'text-purple-600'
          },
          {
            icon: UsersIcon,
            title: "Expanded Support Matching",
            description: "Our intelligent matching extends to connect patients with vital ancillary services like therapists and specialists, fostering holistic well-being.",
            iconColor: 'text-teal-600'
          },
          {
            icon: CheckCircle2,
            title: "Improved Adherence & Results",
            description: "Automated, AI-guided follow-ups and comprehensive support networks lead to better patient adherence and improved clinical outcomes.",
            iconColor: 'text-green-700'
          },
          {
            icon: DollarSign,
            title: "Increased Ecosystem Value & ROI",
            description: "Streamlined processes, expanded service integration, and better outcomes maximize ROI for partners and establish CrisPRO as a key healthcare innovator.",
            iconColor: 'text-orange-600'
          }
        ]
      }
    }
  ];

  const totalSlides = slidesData.length;

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => Math.min(totalSlides - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [totalSlides]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            { /* Conditionally show a different icon/title for CRISPR deck? For now, general. */}
            <DnaIcon size={32} className="text-blue-600" /> 
            <div>
              <h1 className="text-xl font-bold text-gray-900">CrisPRO Oncology Co-Pilot</h1>
              <p className="text-sm text-gray-600">Investor Presentation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Print/Export
            </button>
            <div className="text-sm text-gray-500">
              Use ← → arrow keys to navigate
            </div>
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div className="relative h-[calc(100vh-120px)] overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slidesData.map((slide) => {
            const SlideComponent = slide.component;
            return (
              <div key={slide.id} className="w-full h-full flex-shrink-0">
                <SlideComponent {...slide.data} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-center">
          <SlideNavigation 
            currentSlide={currentSlide}
            totalSlides={totalSlides}
            onSlideChange={setCurrentSlide}
          />
        </div>
      </div>
    </div>
  );
};

export default InvestorSlideshow; 