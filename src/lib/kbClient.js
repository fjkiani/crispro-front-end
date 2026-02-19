import { API_ROOT as API_BASE } from './apiConfig';

/**
 * Knowledge Base Client
 * Provides frontend access to the KB API for VUS Explorer and Dossier integration
 */


class KBClient {
  constructor() {
    this.baseUrl = `${API_BASE}/api/kb`;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached item or fetch from API
   */
  async _fetchWithCache(url, cacheKey) {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Fetch from API
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`KB API error for ${url}:`, error);
      throw error;
    }
  }

  /**
   * List items of a specific type
   */
  async listItems(type, limit = 50, offset = 0) {
    const url = `${this.baseUrl}/items?type=${type}&limit=${limit}&offset=${offset}`;
    const cacheKey = `items_${type}_${limit}_${offset}`;
    return this._fetchWithCache(url, cacheKey);
  }

  /**
   * Get a single item by ID
   */
  async getItem(itemId) {
    const url = `${this.baseUrl}/item/${itemId}`;
    const cacheKey = `item_${itemId}`;
    return this._fetchWithCache(url, cacheKey);
  }

  /**
   * Search across KB items
   */
  async search(query, types = null, limit = 20) {
    let url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    if (types && types.length > 0) {
      url += `&types=${types.join(',')}`;
    }

    const cacheKey = `search_${query}_${types ? types.join(',') : 'all'}_${limit}`;
    return this._fetchWithCache(url, cacheKey);
  }

  /**
   * Get gene information with helper copy
   */
  async getGeneInfo(geneSymbol) {
    try {
      const item = await this.getItem(`gene/${geneSymbol}`);
      return {
        symbol: item.symbol,
        name: item.name,
        function: item.function,
        helperCopy: item.helper_copy,
        pathways: item.pathways || [],
        diseases: item.diseases || []
      };
    } catch (error) {
      console.warn(`Could not fetch gene info for ${geneSymbol}:`, error);
      return null;
    }
  }

  /**
   * Get variant information with helper copy
   */
  async getVariantInfo(geneSymbol, hgvsP) {
    try {
      const item = await this.getItem(`variant/${geneSymbol}_${hgvsP}`);
      return {
        gene: item.gene,
        hgvsP: item.hgvs_p,
        mechanism: item.mechanism,
        helperCopy: item.helper_copy,
        pathogenicityScore: item.pathogenicity_score,
        amCovered: item.am_covered,
        clinvarPrior: item.clinvar_prior
      };
    } catch (error) {
      console.warn(`Could not fetch variant info for ${geneSymbol}_${hgvsP}:`, error);
      return null;
    }
  }

  /**
   * Get pathway information
   */
  async getPathwayInfo(pathwayId) {
    try {
      const item = await this.getItem(`pathway/${pathwayId}`);
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        genes: item.genes || [],
        helperCopy: item.helper_copy,
        mechanism: item.mechanism
      };
    } catch (error) {
      console.warn(`Could not fetch pathway info for ${pathwayId}:`, error);
      return null;
    }
  }

  /**
   * Get cohort coverage information
   */
  async getCohortCoverage(studyId) {
    try {
      const item = await this.getItem(`cohort/${studyId}`);
      return {
        study: item.study,
        nSamples: item.n_samples,
        nVariants: item.n_variants,
        byGene: item.by_gene || [],
        coverageSummary: item.coverage_summary
      };
    } catch (error) {
      console.warn(`Could not fetch cohort coverage for ${studyId}:`, error);
      return null;
    }
  }

  /**
   * Get policy profile information
   */
  async getPolicyProfile(profileName) {
    try {
      const item = await this.getItem(`policy/${profileName}`);
      return {
        name: item.name,
        version: item.version,
        weights: item.weights,
        gates: item.gates,
        flags: item.flags,
        notes: item.notes
      };
    } catch (error) {
      console.warn(`Could not fetch policy profile for ${profileName}:`, error);
      return null;
    }
  }

  /**
   * Search for genes with helper copy
   */
  async searchGenes(query, limit = 10) {
    try {
      const results = await this.search(query, ['gene'], limit);
      return results.hits.map(hit => ({
        id: hit.id,
        symbol: hit.title,
        score: hit.score,
        snippet: hit.snippet
      }));
    } catch (error) {
      console.warn(`Could not search genes for ${query}:`, error);
      return [];
    }
  }

  /**
   * Search for variants with helper copy
   */
  async searchVariants(query, limit = 10) {
    try {
      const results = await this.search(query, ['variant'], limit);
      return results.hits.map(hit => ({
        id: hit.id,
        title: hit.title,
        score: hit.score,
        snippet: hit.snippet
      }));
    } catch (error) {
      console.warn(`Could not search variants for ${query}:`, error);
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const kbClient = new KBClient();
export default kbClient;



