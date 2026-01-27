/**
 * CoPilot Utility Functions
 * Helper functions for CoPilot integration
 */

export const CoPilotUtils = {
  // Extract variant information from different sources
  extractVariantFromUrl: (pathname) => {
    // Extract from URL patterns
    const patterns = [
      /\/variant\/([^\/]+)\/([^\/]+)/,  // /variant/GENE/VARIANT
      /\/gene\/([^\/]+).*?([cp]\.\w+\d+\w+)/, // /gene/GENE/.../p.Val600Glu
    ];

    for (const pattern of patterns) {
      const match = pathname.match(pattern);
      if (match) {
        return {
          gene: match[1],
          hgvs_p: match[2]
        };
      }
    }

    return null;
  },

  // Format variant for display
  formatVariant: (variant) => {
    if (!variant) return '';
    return `${variant.gene} ${variant.hgvs_p}`;
  },

  // Generate CoPilot-friendly descriptions
  generateVariantDescription: (variant, disease) => {
    let description = `Analyzing ${variant.gene} ${variant.hgvs_p}`;

    if (disease) {
      description += ` in the context of ${disease}`;
    }

    return description;
  },

  // Create search queries for CoPilot
  createSearchQuery: (variant, disease, type) => {
    const variantStr = `${variant.gene} ${variant.hgvs_p}`;

    const queries = {
      'functional_impact': `What is the functional impact of ${variantStr}?`,
      'clinical_outcomes': `What are the clinical outcomes for ${variantStr}?`,
      'treatment_options': `What treatment options are available for ${variantStr}?`,
      'population_frequency': `How common is ${variantStr} in the population?`,
      'research_papers': `What research papers discuss ${variantStr}?`,
      'disease_specific': `How does ${variantStr} affect ${disease} treatment and prognosis?`
    };

    return queries[type] || queries['functional_impact'];
  }
};

