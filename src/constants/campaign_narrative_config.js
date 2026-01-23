const campaignNarrative = {
  campaign_briefing: {
    title: "From Hypothesis to IND-Ready Asset: An Accelerated Journey",
    problem: "Traditional drug discovery is a slow, expensive, and failure-prone process. Scientists spend months or years on manual experiments to validate a target, design a therapeutic, and test its efficacy, with a high probability of failure at each stage.",
    solution: "Our platform acts as an in silico lab partner, running millions of virtual experiments in parallel. We compress the entire preclinical discovery process, allowing scientists to validate targets, design therapeutics, and predict experimental outcomes in a fraction of the time, focusing wet-lab resources only on the most promising candidates.",
    value_proposition: "We provide definitive, data-driven answers to the most critical scientific questions, enabling you to move from a novel hypothesis to a validated, IND-enabling study plan with unprecedented speed and confidence.",
    key_metrics: {
      "Experimental Cycles": "Years of manual assays ➔ Hours of simulation",
      "Resource Allocation": "High-risk, broad screening ➔ Focused, high-probability experiments",
      "Data Quality": "Ambiguous, noisy data ➔ Quantitative, deterministic predictions",
      "Deliverable": "A complete, de-risked experimental roadmap"
    }
  },
  threat_dossier: {
    stageTitle: 'Step 1: The Threat Dossier (Target Validation)',
    stageMission: 'To definitively answer the most fundamental question: Is this a viable therapeutic target? We will systematically validate its function, necessity, and accessibility.',
    stageValueProp: "Instead of months of ambiguous benchwork, get a definitive 'Go/No-Go' decision on your target in minutes, backed by a multi-layered computational evidence package.",
    keyDeliverable: "A data-driven verdict on target viability.",
    endpoints: {
      '/predict_variant_impact': {
        title: 'Question 1: Does the Mutation Actually Break the Protein?',
        ourApproach: 'Our Oracle instantly calculates the functional disruption caused by the PIK3CA E542K mutation, yielding a catastrophic damage score.',
        businessImpact: {
          problem: 'Pain Point: 6-18 months of cloning, protein expression, and functional assays (e.g., kinase assays) to determine if a mutation is a true loss-of-function or just a passenger.',
          solution: 'Our Insight: A quantitative score of functional damage in seconds. We tell you if the weapon is broken before you plan the attack.',
          riskEliminated: 'Saves months of wasted effort on targets that aren\'t actually vulnerable. Focus your lab work only on validated points of failure.'
        },
        narrativeOutcome: '✅ VERDICT: The protein is functionally crippled. This is a real vulnerability. NEXT QUESTION: Is this vulnerability something the cancer cell actually depends on to survive?',
      },
      '/predict_gene_essentiality': {
        title: 'Question 2: Is the Cancer Addicted to this Gene?',
        ourApproach: 'The Oracle cross-references this gene against genome-wide CRISPR screens from 1000+ cancer cell lines to determine its necessity for survival.',
        businessImpact: {
          problem: 'Pain Point: Months or years of laborious cell-based viability assays (e.g., using shRNA or CRISPR libraries) across dozens of cell lines to find the right context.',
          solution: 'Our Insight: An instant, comprehensive analysis of gene essentiality across a massive panel of cancer types. We find the addicted patients for you.',
          riskEliminated: 'Avoids developing a potent drug for a target that cancer cells can simply ignore. Ensures your therapeutic will have a lethal effect in the right context.'
        },
        narrativeOutcome: '✅ VERDICT: The cancer is critically dependent on this gene. Attacking it will be lethal. NEXT QUESTION: Can a therapeutic actually get to it?',
      },
      '/predict_chromatin_accessibility': {
        title: 'Question 3: Can We Reach the Target?',
        ourApproach: 'The Oracle analyzes epigenetic data (e.g., ATAC-seq) to determine if the genomic region of the target is "open" and accessible for a CRISPR-based therapeutic.',
        businessImpact: {
          problem: 'Pain Point: Designing effective guide RNAs only to find they have zero efficacy in relevant cell types due to closed chromatin, a discovery often made far too late.',
          solution: 'Our Insight: An upfront "accessibility score" that predicts the likelihood of a CRISPR agent reaching its target DNA.',
          riskEliminated: 'Prevents the design of perfectly good therapeutics that are doomed to fail because they can\'t access their target site. Ensures your weapon can reach the battlefield.'
        },
        narrativeOutcome: '✅ VERDICT: The target is open and accessible. Target validation is complete. We have a vulnerable, essential, and reachable target.',
      }
    },
    callToAction: 'Design Therapeutic Arsenal'
  },
  war_game: {
    stageTitle: 'Step 2: The War Game (Predicting Resistance)',
    stageMission: 'To anticipate how the cancer will evolve to resist our therapy, allowing us to design a more durable, relapse-proof treatment strategy from day one.',
    stageValueProp: "Move beyond single-agent therapies that inevitably fail. We provide the intelligence to design combination strategies that target the cancer of today AND tomorrow.",
    keyDeliverable: "A ranked list of the most probable resistance mutations.",
    endpoints: {
      '/simulate_future_threats': {
        title: 'Question 4: How Will the Cancer Evolve to Resist Our Drug?',
        ourApproach: "Our Evo-AI simulates the tumor's likely evolutionary escape routes, identifying the secondary mutations that would render our primary therapy useless.",
        businessImpact: {
          problem: 'Pain Point: A successful drug is often thwarted by acquired resistance, a phenomenon typically studied only after a therapy fails in the clinic.',
          solution: 'Our Insight: A predictive map of resistance. We identify the enemy\'s next move before it happens, enabling the rational design of combination therapies.',
          riskEliminated: 'Design drugs with long-term durability, preventing the massive value destruction that occurs when a promising drug is defeated by predictable resistance.'
        },
        narrativeOutcome: '🗺️ RESISTANCE MAP: Top 5 escape pathways identified. We can now design a multi-pronged attack to ensure durable efficacy.',
      }
    },
    callToAction: 'Design & Validate Therapeutics'
  },
  the_arsenal: {
    stageTitle: 'Step 3: The Arsenal (Design & In Silico Validation)',
    stageMission: 'To generate a portfolio of novel therapeutics and then subject them to a brutal gauntlet of in silico trials to ensure they are both potent and safe.',
    stageValueProp: "Instead of the slow, trial-and-error process of drug design, we deterministically generate and validate superior therapeutic candidates in hours.",
    keyDeliverable: "A set of lead therapeutic candidates with a full in silico safety and efficacy profile.",
    subPhases: {
      forge: {
        phaseTitle: 'Phase 1: The Forge - Weapon Generation',
        endpoints: {
          '/generate_optimized_guide_rna': {
            title: 'Design: Generate High-Efficacy CRISPR Guides',
            ourApproach: 'Our AI Forge generates dozens of guide RNAs, optimizing for high on-target cutting efficiency and minimal off-target effects.',
            businessImpact: {
              problem: 'Pain Point: Screening hundreds of synthesized guide RNAs in the lab to find one with acceptable performance, a process that can take months.',
              solution: 'Our Insight: A rank-ordered list of elite guide RNA candidates, allowing you to synthesize and test only the top 1-3 performers.',
              riskEliminated: 'Massively reduces the time and cost of guide screening. Moves directly to high-probability candidates.'
            },
            narrativeOutcome: '⚒️ DESIGN COMPLETE: A portfolio of elite guide RNAs is ready for validation.',
          },
        }
      },
      gauntlet: {
        phaseTitle: 'Phase 2: The Gauntlet - In Silico Validation',
        endpoints: {
          '/predict_protein_structure': {
            title: 'Validation 1: Will the Therapeutic Protein Fold Correctly?',
            ourApproach: 'If designing a protein therapeutic, we use AlphaFold to predict its 3D structure, ensuring it will form a stable, functional molecule.',
            businessImpact: {
              problem: 'Pain Point: The "wet noodle" problem. Spending months expressing a protein only to find it aggregates or is non-functional.',
              solution: 'Our Insight: An instant pLDDT score that validates structural integrity before you ever synthesize a gene.',
              riskEliminated: 'Kills structurally unsound protein designs early, saving enormous time and resources in downstream expression and purification.'
            },
            narrativeOutcome: '🛡️ STRUCTURE VALIDATED: The designed protein is predicted to be stable and well-folded.',
          },
          '/predict_crispr_spacer_efficacy': {
            title: 'Validation 2: How Effective Will Our CRISPR Guide Be?',
            ourApproach: 'We simulate the performance of our top guide RNAs in various cellular contexts, predicting their real-world cutting efficiency.',
            businessImpact: {
              problem: 'Pain Point: A guide that works well in one cell line (e.g., HEK293T) fails in the actual target cell type, wasting weeks of effort.',
              solution: 'Our Insight: An efficacy prediction in a panel of virtual cell lines, giving you confidence it will work in the context that matters.',
              riskEliminated: 'De-risks the transition from design to experiment by validating performance in a relevant biological context before starting lab work.'
            },
            narrativeOutcome: '🛡️ EFFICACY VALIDATED: The lead gRNA candidate shows high efficacy across multiple relevant cell lines.',
          }
        }
      }
    },
    callToAction: 'Generate Experimental Protocol'
  },
  battle_plan: {
    stageTitle: 'Step 4: The Battle Plan (Experimental Protocol Design)',
    stageMission: 'To translate our validated in silico discoveries into a concrete, actionable, and efficient wet-lab experimental plan.',
    stageValueProp: "Bridge the gap between computational design and experimental success with an AI-generated protocol that maximizes your chances of replicating the in silico results.",
    keyDeliverable: "An AI-generated, downloadable protocol for cell-based experiments.",
    endpoints: {
      '/generate_experimental_protocol': {
        title: 'Generate an Optimized Experimental Plan',
        ourApproach: "Our AI synthesizes all previous findings to recommend the ideal cell lines, delivery methods, and validation assays to prove the therapeutic's efficacy.",
        businessImpact: {
          problem: 'Pain Point: The challenge of designing the perfect experiment—choosing the right controls, the best cell model, the most informative assays.',
          solution: 'Our Insight: A comprehensive, de-risked experimental plan that removes the guesswork.',
          riskEliminated: 'Poor experimental design that leads to inconclusive results or failure to replicate the computational findings. Ensures your first experiment is your best experiment.'
        },
        narrativeOutcome: '📜 PROTOCOL GENERATED: A complete experimental plan is ready for the lab.',
      }
    },
    callToAction: 'Assemble Final Data Package'
  },
  therapeutic_asset_blueprint: {
    stageTitle: 'Step 5: The Deliverable (Therapeutic Data Package)',
    stageMission: 'To consolidate all findings into a single, comprehensive data package that serves as the complete blueprint for your therapeutic program.',
    stageValueProp: "We deliver not just a single result, but a complete, coherent story of your therapeutic asset, from initial hypothesis to a full data package ready for the next phase of development.",
    keyDeliverable: "A comprehensive data package ready for internal review or investor presentation.",
    components: {
      lead_crispr_asset: {
        title: "Lead CRISPR Therapeutic Candidate: gRNA-7",
        details: "Top-ranked guide RNA with 96.8% predicted cutting efficiency, >99% safety score, and validated efficacy across 5 distinct genetic backgrounds."
      },
      resistance_strategy: {
        title: "Resistance Mitigation Strategy",
        details: "A plan for a combination therapy targeting PIK3CA and the top predicted resistance mutation (ASXL1), ensuring long-term durability."
      },
      supporting_data: {
        title: "Comprehensive Data Room",
        details: "Includes all raw simulation data, analysis reports, evolutionary maps, and the complete experimental protocol."
      },
      next_steps: {
        title: "Recommended Next Steps",
        details: "A clear, AI-generated summary of the immediate next steps for IND-enabling studies based on the generated battle plan."
      }
    },
    callToAction: 'Campaign Complete'
  }
};

export default campaignNarrative;
