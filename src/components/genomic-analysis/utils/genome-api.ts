import { API_ROOT } from '../../../lib/apiConfig';

export interface GeneInfo {
  gene_id: string;
  symbol: string;
  name: string;
  chrom: string;
  description: string;
  [key: string]: any;
}

export interface GauntletResult {
  zeta_score: number;
  confidence: number;
  verdict: string;
  commentary: string;
}

export interface ForgeResult {
  new_protein_name: string;
  new_protein_sequence: string;
  new_zeta_score: number;
  commentary: string;
}

export interface ClinvarVariant {
  id: string;
  title: string;
  [key: string]: any;
}


export interface GeneData {
  gene_info: GeneInfo;
  sequence: string;
  clinvar_variants: ClinvarVariant[];
}

// Restored Types For component compatibility
export interface GeneFromSearch {
  symbol: string;
  name: string;
  chrom: string;
  description: string;
  gene_id: string;
}
export interface GeneBounds {
  min: number;
  max: number;
}
export interface AnalysisResult {
  zeta_score: number;
  delta_score: number;
  prediction: string;
  classification_confidence: number;
  position: number;
  reference: string;
  alternative: string;
}


export async function fetchGeneData(geneSymbol: string): Promise<GeneData> {
  console.log(`[DEBUG] fetchGeneData called with symbol: ${geneSymbol}`);
  const encodedGeneSymbol = encodeURIComponent(geneSymbol);
  const url = `${API_ROOT}/api/gene/${encodedGeneSymbol}/details`;
  console.log(`[DEBUG] Calling backend URL: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Genomic Intel API Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data as GeneData;
  } catch (error) {
    console.error("Failed to fetch gene data from backend:", error);
    throw error;
  }
}

// --- Functions restored for component compatibility ---

async function fetchSequenceForAnalysis(
  chrom: string,
  start: number,
  end: number,
  genomeId: string,
): Promise<{ sequence: string; error?: string }> {
  try {
    const chromosome = chrom.startsWith("chr") ? chrom : `chr${chrom}`;
    const apiStart = start - 1;
    const apiEnd = end;
    const apiUrl = `https://api.genome.ucsc.edu/getData/sequence?genome=${genomeId};chrom=${chromosome};start=${apiStart};end=${apiEnd}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`UCSC API Error: ${response.statusText}`);

    const data = await response.json();
    if (data.error || !data.dna) {
      return { sequence: "", error: data.error || "No DNA sequence returned" };
    }
    return { sequence: data.dna.toUpperCase() };
  } catch (err) {
    return { sequence: "", error: err instanceof Error ? err.message : "Failed to fetch sequence" };
  }
}

export async function analyzeVariantWithAPI({ position, alternative, genomeId, chromosome }: { position: number, alternative: string, genomeId: string, chromosome: string }): Promise<AnalysisResult> {
  const window = 2048;
  const start = Math.max(0, position - window / 2);
  const end = position + window / 2;

  const { sequence: baseline_sequence, error } = await fetchSequenceForAnalysis(chromosome, start, end, genomeId);
  if (error || !baseline_sequence) {
    throw new Error(`Failed to fetch sequence for analysis: ${error}`);
  }

  const variantIndexInWindow = position - start;
  if (variantIndexInWindow < 0 || variantIndexInWindow >= baseline_sequence.length) {
    throw new Error("Variant position is outside the fetched sequence window.");
  }

  const perturbed_sequence =
    baseline_sequence.substring(0, variantIndexInWindow) +
    alternative +
    baseline_sequence.substring(variantIndexInWindow + 1);

  const response = await fetch(`${API_ROOT}/api/oracle/calculate_zeta_score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ baseline_sequence, perturbed_sequence }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Zeta Oracle API request failed');
  }

  const oracleResponse = await response.json();

  return {
    ...oracleResponse,
    position: position,
    reference: baseline_sequence.charAt(variantIndexInWindow),
    alternative: alternative,
  };
}


// --- Functions and types restored for backwards compatibility ---

export interface GeneDetailsFromSearch {
  [key: string]: any;
}

export async function fetchGeneDetails(geneId: string): Promise<{
  geneDetails: GeneDetailsFromSearch | null;
  geneBounds: GeneBounds | null;
  initialRange: { start: number; end: number } | null;
}> {
  try {
    const detailUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${geneId}&retmode=json`;
    const detailsResponse = await fetch(detailUrl);

    if (!detailsResponse.ok) {
      console.error(`Failed to fetch gene details: ${detailsResponse.statusText}`);
      return { geneDetails: null, geneBounds: null, initialRange: null };
    }

    const detailData = await detailsResponse.json();

    if (detailData.result && detailData.result[geneId]) {
      const detail = detailData.result[geneId];

      if (detail.genomicinfo && detail.genomicinfo.length > 0) {
        const info = detail.genomicinfo[0];

        const minPos = Math.min(info.chrstart, info.chrstop);
        const maxPos = Math.max(info.chrstart, info.chrstop);
        const bounds = { min: minPos, max: maxPos };

        const geneSize = maxPos - minPos;
        const seqStart = minPos;
        const seqEnd = geneSize > 10000 ? minPos + 10000 : maxPos;
        const range = { start: seqStart, end: seqEnd };

        return { geneDetails: detail, geneBounds: bounds, initialRange: range };
      }
    }

    return { geneDetails: null, geneBounds: null, initialRange: null };
  } catch (err) {
    return { geneDetails: null, geneBounds: null, initialRange: null };
  }
}

export async function fetchGeneSequence(
  chrom: string,
  start: number,
  end: number,
  genomeId: string,
): Promise<{
  sequence: string;
  actualRange: { start: number; end: number };
  error?: string;
}> {
  try {
    const chromosome = chrom.startsWith("chr") ? chrom : `chr${chrom}`;
    const apiStart = start - 1;
    const apiEnd = end;
    const apiUrl = `https://api.genome.ucsc.edu/getData/sequence?genome=${genomeId};chrom=${chromosome};start=${apiStart};end=${apiEnd}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const actualRange = { start, end };

    if (data.error || !data.dna) {
      return { sequence: "", actualRange, error: data.error };
    }
    const sequence = data.dna.toUpperCase();
    return { sequence, actualRange };
  } catch (err) {
    return {
      sequence: "",
      actualRange: { start, end },
      error: "Internal error in fetch gene sequence",
    };
  }
}

export async function fetchClinvarVariants(
  chrom: string,
  geneBound: GeneBounds,
  genomeId: string,
): Promise<ClinvarVariant[]> {
  const chromFormatted = chrom.replace(/^chr/i, "");
  const minBound = Math.min(geneBound.min, geneBound.max);
  const maxBound = Math.max(geneBound.min, geneBound.max);
  const positionField = genomeId === "hg19" ? "chrpos37" : "chrpos38";
  const searchTerm = `${chromFormatted}[chromosome] AND ${minBound}:${maxBound}[${positionField}]`;
  const searchUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
  const searchParams = new URLSearchParams({ db: "clinvar", term: searchTerm, retmode: "json", retmax: "50" });
  const searchResponse = await fetch(`${searchUrl}?${searchParams.toString()}`);
  if (!searchResponse.ok) throw new Error("ClinVar search failed: " + searchResponse.statusText);

  const searchData = await searchResponse.json();
  if (!searchData.esearchresult || !searchData.esearchresult.idlist || searchData.esearchresult.idlist.length === 0) {
    return [];
  }

  const variantIds = searchData.esearchresult.idlist;
  const summaryUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";
  const summaryParams = new URLSearchParams({ db: "clinvar", id: variantIds.join(","), retmode: "json" });
  const summaryResponse = await fetch(`${summaryUrl}?${summaryParams.toString()}`);
  if (!summaryResponse.ok) throw new Error("Failed to fetch variant details: " + summaryResponse.statusText);

  const summaryData = await summaryResponse.json();
  if (!summaryData.result) return [];

  return Object.values(summaryData.result)
    .filter((v: any) => v.uid && v.title)
    .map((v: any) => ({
      id: v.uid, // FIX: Map 'uid' to 'id'
      clinvar_id: v.uid,
      title: v.title,
      classification: v.clinical_significance?.description || "Unknown",
      review_status: v.clinical_significance?.review_status || "Unknown",
      variation_type: v.obj_type || "Unknown",
      location: v.variation_set[0]?.variation_loc.find((loc: any) => loc.assembly_name === (genomeId === 'hg19' ? 'GRCh37' : 'GRCh38'))?.chr_stop || "N/A",
    }));
}
