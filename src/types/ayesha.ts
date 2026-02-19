export interface Mutation {
    gene: string;
    hgvs_p?: string;
    hgvs_c?: string;
    consequence?: string;
    classification?: string;
    data_origin?: string; // "scenario_inferred" etc.
    chrom?: string;
    pos?: number;
    ref?: string;
    alt?: string;
}

export interface TumorContext {
    completeness_score: number;
    hrd_score?: number;
    hrd_status?: string;
    tmb?: number;
    tmb_status?: string;
    msi_status?: string;
    pd_l1_status?: string;
    pd_l1_cps?: number;
    er_status?: string;
    er_percent?: number;
    sig7_exposure?: number;
    genome_build?: string;
    ca125_value?: number;
    ca125_units?: string;
    expression?: Record<string, number>;
    expression_source?: string;
    somatic_mutations?: Mutation[]; // Sometimes context carries mutations
}

export interface InputsUsed {
    mutations: Mutation[];
    tumor_context: TumorContext;
}

export interface DrugEfficacy {
    name: string;
    confidence: number;
    rationale: string;
}

export interface Efficacy {
    drugs: DrugEfficacy[];
    pathway_scores: Record<string, number>;
    provenance: {
        model?: string;
        version?: string;
        status?: string;
    };
}

export interface Completeness {
    level: "L1" | "L2" | "L3";
    level_name: string;
    completeness_score: number;
    missing: string[];
    confidence_cap?: number | null;
    has_germline?: boolean;
    has_somatic_ngs?: boolean;
    has_ihc?: boolean;
    has_hrd?: boolean;
    has_tmb?: boolean;
    has_expression?: boolean;
    has_ca125?: boolean;
}

export interface LevelData {
    is_preview: boolean;
    effective_assembly: string;
    inputs_used: InputsUsed;
    efficacy: Efficacy;
    synthetic_lethality?: any; // Define properly if needed
    completeness: Completeness;
}

export interface TestNeeded {
    test: string;
    unlocks: string[];
    why: string;
    status: "missing" | "pending" | "complete";
    source: "recommended" | "ordered";
}

export interface AyeshaBundle {
    contract_version: string;
    patient_id: string;
    requested_levels: string[];
    generated_at: string;
    levels: {
        L1: LevelData;
        L2: LevelData;
        L3: LevelData;
    };
    tests_needed: TestNeeded[];
}

// Scenario Metadata (from /scenarios endpoint)
export interface ScenarioMeta {
    id: string;
    name: string;
    locked: boolean;
    requires: string[];
    meta: {
        description: string;
        completeness_score?: number;
        tumor_context_additions?: any;
    };
}

export interface ScenarioCatalog {
    l2_scenarios: ScenarioMeta[];
    l3_scenarios: ScenarioMeta[];
}
