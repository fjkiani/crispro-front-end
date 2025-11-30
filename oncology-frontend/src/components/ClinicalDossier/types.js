/**
 * Type definitions for Clinical Dossier components
 * Note: Using JSDoc types since this is a JavaScript project
 */

/**
 * @typedef {Object} Mutation
 * @property {string} gene - Gene symbol (e.g., "MBD4", "TP53")
 * @property {string} [hgvs_p] - HGVS protein notation (e.g., "p.Ile413Serfs*2")
 * @property {string} [chrom] - Chromosome (e.g., "3", "17")
 * @property {number} [pos] - Position
 * @property {string} [ref] - Reference allele
 * @property {string} [alt] - Alternate allele
 * @property {string} [build] - Genome build (e.g., "GRCh37")
 */

/**
 * @typedef {Object} TumorContext
 * @property {string} disease - Disease type (e.g., "ovarian_cancer")
 * @property {number} [tmb] - Tumor mutational burden (mutations/Mb)
 * @property {string} [msi_status] - MSI status ("MSS" | "MSI-H")
 * @property {number} [hrd_score] - HRD score
 */

/**
 * @typedef {Object} ExecutiveSummary
 * @property {number} ddr_pathway_burden - DDR pathway burden (0-1)
 * @property {string} top_drug - Top recommended drug name
 * @property {number} top_drug_alignment - Top drug alignment score (0-1)
 * @property {number} tmb - TMB value
 * @property {string} actionability - Actionability level ("HIGH" | "MODERATE" | "LOW")
 */

/**
 * @typedef {Object} VariantData
 * @property {string} gene - Gene symbol
 * @property {string} hgvs_p - HGVS protein notation
 * @property {string} classification - Variant classification ("Pathogenic" | "VUS" | "Benign")
 * @property {string} inheritance - Inheritance type ("Germline" | "Somatic")
 * @property {Object} functional_impact - Functional impact scores
 * @property {string} rationale - Biological rationale
 * @property {number} affects_drug_response - Number of drugs affected
 */

/**
 * @typedef {Object} DrugRecommendation
 * @property {string} name - Drug name
 * @property {string} class - Drug class
 * @property {string} mechanism - Mechanism of action
 * @property {number} alignment_score - Mechanism alignment score (0-1) - NOT efficacy_score
 * @property {number} confidence - Confidence level (0-1)
 * @property {string} evidence_tier - Evidence tier ("CONSIDER" | "SUPPORTED" | "INSUFFICIENT")
 * @property {Array<string>} clinical_badges - Clinical badges (e.g., ["ClinVar-Moderate", "PathwayAligned"])
 * @property {string} rationale - Rationale breakdown
 */

/**
 * @typedef {Object} PathwayData
 * @property {number} ddr - DDR pathway score (0-1)
 * @property {number} tp53 - TP53 pathway score (0-1)
 * @property {number} dna_repair_capacity - DNA repair capacity (0-1)
 */

/**
 * @typedef {Object} DossierData
 * @property {ExecutiveSummary} executive_summary - Executive summary data
 * @property {Array<VariantData>} variants - Variant data
 * @property {PathwayData} pathway_disruption - Pathway disruption data
 * @property {Array<DrugRecommendation>} drugs - Drug recommendations
 * @property {Array<Object>} clinical_trials - Clinical trials
 * @property {Object} resistance_surveillance - Resistance surveillance data
 * @property {Object} immunotherapy_eligibility - IO eligibility data
 * @property {Array<Object>} clinical_action_plan - Action plan items
 * @property {Object} evidence_quality - Evidence quality data
 * @property {string} report_id - Report ID
 * @property {string} analysis_date - Analysis date
 */

/**
 * @typedef {Object} EfficacyResponse
 * @property {Object} efficacy - Efficacy data
 * @property {Array<DrugRecommendation>} efficacy.drugs - Drug recommendations
 * @property {Object} provenance - Provenance data
 * @property {Object} tumor_context - Tumor context data
 */

/**
 * @typedef {Object} ClinicalDossierViewProps
 * @property {Array<Mutation>} mutations - Mutations array
 * @property {string} disease - Disease type
 * @property {TumorContext} [tumorContext] - Optional tumor context
 * @property {DossierData} [dossierData] - Optional pre-computed dossier data
 * @property {Function} [onExport] - Export callback (format: 'pdf' | 'json' | 'markdown')
 */


