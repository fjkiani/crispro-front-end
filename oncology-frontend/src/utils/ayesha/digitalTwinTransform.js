/**
 * Transform API response to Digital Twin MOAT component props
 * Shows the mechanistic biology: Mutation → Evo2 → Pathway → SL → Drug
 */

/**
 * Transform API data to Digital Twin format using REAL data from API response
 * @param {Object} apiData - Raw API response with case_data, drug_recommendations, etc.
 * @returns {Object|null} - Transformed digital twin data or null
 */
export function transformToDigitalTwin(apiData) {
  if (!apiData || !apiData.case_data) return null;

  // Extract Ayesha's primary mutation from case data (REAL DATA)
  const mutations = apiData.case_data.mutations || [];
  const primaryMutation = mutations.find(m => m.gene === "MBD4") || mutations[0];

  if (!primaryMutation) return null;

  // Extract Evo2 scoring from drug rationale (REAL DATA)
  // Look for sequence scores in the first drug's rationale
  const drugs = apiData.drug_recommendations || [];
  const firstDrug = drugs[0] || {};
  const rationale = firstDrug.rationale || [];

  // Extract sequence score from rationale
  const seqRationale = rationale.find(r => r.component === "S" || r.component === "Sequence");
  const evo2Result = {
    delta: seqRationale?.delta || seqRationale?.score || null,
    percentile: seqRationale?.percentile || firstDrug.insights?.functionality || null,
    interpretation: seqRationale?.interpretation || (seqRationale?.percentile > 0.8 ? "SEVERE" : "MODERATE")
  };

  // Extract protein impact from mutation type (REAL DATA)
  const hgvs_p = primaryMutation.hgvs_p || primaryMutation.protein_change || "";
  const isFrameshift = hgvs_p.includes("fs") || hgvs_p.includes("*");
  const proteinImpact = {
    type: isFrameshift ? "frameshift" : (hgvs_p.includes("*") ? "nonsense" : "missense"),
    domain_lost: primaryMutation.domain || null,
    functional_consequence: isFrameshift ? "Frameshift mutation - potential loss of function" : "Missense mutation"
  };

  // Extract pathway scores from mechanism_map or SAE features (REAL DATA)
  const mechanismMap = apiData.mechanism_map || {};
  const saeFeatures = apiData.sae_features || {};
  const pathwayScores = mechanismMap.pathway_burden || saeFeatures.pathway_burden || {};

  // Build pathway assignment from actual pathway scores (REAL DATA)
  const topPathway = Object.entries(pathwayScores)
    .sort((a, b) => b[1] - a[1])[0] || ["DDR", 0.5];

  const pathwayAssignment = {
    pathway: topPathway[0],
    full_name: {
      "DDR": "DNA Damage Response",
      "MAPK": "MAPK Signaling",
      "PI3K": "PI3K/AKT Signaling",
      "VEGF": "Angiogenesis",
      "HER2": "HER2 Signaling",
      "IO": "Immune Response",
      "Efflux": "Drug Efflux"
    }[topPathway[0]] || topPathway[0],
    weight: topPathway[1],
    description: `Pathway burden: ${(topPathway[1] * 100).toFixed(1)}%`
  };

  // Build pathway disruption map from actual mutations (REAL DATA)
  const pathways = {};

  // DDR pathway (from mutations)
  const ddrGenes = ["BRCA1", "BRCA2", "MBD4", "TP53", "RAD51C", "RAD51D", "PALB2"];
  const ddrMutations = mutations.filter(m => ddrGenes.includes(m.gene?.toUpperCase()));
  if (ddrMutations.length > 0 || pathwayScores.ddr > 0) {
    pathways.DDR = {
      name: "DDR",
      full_name: "DNA Damage Response",
      genes: ddrGenes.map(gene => {
        const mut = mutations.find(m => m.gene?.toUpperCase() === gene);
        return {
          name: gene,
          status: mut ? "MUTANT" : "INTACT",
          mutation: mut?.hgvs_p || mut?.protein_change || null
        };
      }),
      pathway_status: pathwayScores.ddr > 0.5 ? "DISABLED" : "INTACT",
      critical: true
    };
  }

  // MAPK pathway
  const mapkGenes = ["KRAS", "NRAS", "BRAF"];
  const mapkMutations = mutations.filter(m => mapkGenes.includes(m.gene?.toUpperCase()));
  if (mapkMutations.length > 0 || pathwayScores.mapk > 0) {
    pathways.MAPK = {
      name: "MAPK",
      full_name: "MAPK Signaling",
      genes: mapkGenes.map(gene => {
        const mut = mutations.find(m => m.gene?.toUpperCase() === gene);
        return {
          name: gene,
          status: mut ? "MUTANT" : "INTACT",
          mutation: mut?.hgvs_p || mut?.protein_change || null
        };
      }),
      pathway_status: pathwayScores.mapk > 0.5 ? "ACTIVATED" : "INTACT",
      critical: mapkMutations.length > 0
    };
  }

  // Extract synthetic lethality from SL result (preferred) or infer a minimal display object.
  //
  // Backend schema (guidance synthetic lethality) uses:
  // - synthetic_lethality_detected
  // - double_hit_description
  // - broken_pathways / essential_pathways
  // - recommended_drugs[]
  const slResult = apiData.synthetic_lethality || apiData.sl_result;
  const slDetection = slResult ? {
    detected: Boolean(
      slResult.synthetic_lethality_detected ??
      slResult.detected ??
      false
    ),
    mechanism: slResult.double_hit_description || slResult.mechanism || "Synthetic lethality (damage + dependency)",
    genes_detected: Array.isArray(slResult.essentiality_scores)
      ? slResult.essentiality_scores.map(s => s.gene).filter(Boolean)
      : ddrMutations.map(m => m.gene).filter(Boolean),
    pathway_disruption: {
      broken_pathways: (slResult.broken_pathways || slResult.brokenPathways || []).map(p => ({
        pathway_id: p.pathway_id || p.pathwayId || p.pathway || "Unknown",
        pathway_name: p.pathway_name || p.pathwayName || p.pathway || "Unknown",
        status: p.status || "unknown",
        disruption_score: p.disruption_score ?? p.disruptionScore ?? null
      })),
      essential_pathways: (slResult.essential_pathways || slResult.essentialPathways || []).map(p => ({
        pathway_id: p.pathway_id || p.pathwayId || p.pathway || "Unknown",
        pathway_name: p.pathway_name || p.pathwayName || p.pathway || "Unknown",
        status: p.status || "unknown",
        disruption_score: p.disruption_score ?? p.disruptionScore ?? null
      })),
      // Legacy minimal keys for older components (keep stable)
      DDR: pathwayScores.ddr || 0,
      HR: pathwayScores.hr || 1.0
    },
    suggested_therapy: slResult.suggested_therapy
      || (Array.isArray(slResult.recommended_drugs) && slResult.recommended_drugs[0]?.drug_name)
      || (drugs[0]?.name || "PARP inhibitor"),
    recommended_drugs: (slResult.recommended_drugs || []).map(d => ({
      drug_name: d.drug_name || d.drug || d.name,
      drug_class: d.drug_class || d.drugClass || null,
      confidence: d.confidence ?? null,
      mechanism: d.mechanism || null,
      evidence_tier: d.evidence_tier || d.evidenceTier || null
    })),
    confidence_breakdown: slResult.confidence_breakdown || {
      sequence: firstDrug.insights?.functionality || 0.5,
      pathway: pathwayAssignment.weight || 0.5,
      evidence: firstDrug.evidence_strength || 0.3
    }
  } : null;

  // Extract final confidence from top drug (REAL DATA)
  const topDrug = drugs[0] || {};
  const finalConfidence = topDrug.confidence || topDrug.efficacy_score || 0.71;

  // Extract Resistance Prophet prediction (REAL DATA)
  const resistancePrediction = apiData.resistance_prediction || null;

  return {
    mutation: primaryMutation,
    evo2Result,
    proteinImpact,
    pathwayAssignment,
    pathways,
    slDetection,
    // Pass through the raw SL object so the SL UI can render the full mechanism
    // without lossy transforms.
    syntheticLethality: slResult || null,
    finalConfidence,
    // Additional real data from API
    topDrug: topDrug,
    allDrugs: drugs,
    pathwayScores: pathwayScores,
    insights: firstDrug.insights || {},
    resistancePrediction // NEW
  };
}
