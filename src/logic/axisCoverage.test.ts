import { describe, expect, it } from "vitest";
import {
  CANONICAL_MISSING_STRINGS,
  computeAxisCoverage,
  getCanonicalAxesFromMechanismPanel,
} from "./axisCoverage";

const AXES = ["DDR", "MAPK", "PI3K", "VEGF", "HER2", "IO", "Efflux"];

describe("axisCoverage", () => {
  it("A1: L1 base -> all Unknown when no pathway_scores or mechanism_panel values", () => {
    const completeness = {
      missing: [
        CANONICAL_MISSING_STRINGS.NGS_COORDS,
        CANONICAL_MISSING_STRINGS.HRD,
        CANONICAL_MISSING_STRINGS.TMB,
        CANONICAL_MISSING_STRINGS.RNA,
        CANONICAL_MISSING_STRINGS.CA125,
      ],
    };

    const out = computeAxisCoverage({
      mechanismPanel: { mechanism_axes: AXES, current_mechanism_vector: [] },
      pathwayScores: {},
      completeness,
    });

    expect(out).toHaveLength(AXES.length);
    for (const row of out) {
      expect(row.status).toBe("Unknown");
      expect(row.recommendedTest).toBe(CANONICAL_MISSING_STRINGS.NGS_COORDS);
      expect(row.missingData).toContain(CANONICAL_MISSING_STRINGS.CA125);
    }
  });

  it("A2: L2 preview -> uses pathway_scores when present (preferred)", () => {
    const out = computeAxisCoverage({
      mechanismPanel: { mechanism_axes: AXES, current_mechanism_vector: AXES.map(() => 0.1) },
      pathwayScores: {
        ddr: 0.8,
        mapk: 0.5,
      },
      completeness: { missing: [CANONICAL_MISSING_STRINGS.RNA, CANONICAL_MISSING_STRINGS.CA125] },
    });

    const ddr = out.find((x) => x.axis === "DDR");
    const mapk = out.find((x) => x.axis === "MAPK");
    const vegf = out.find((x) => x.axis === "VEGF");

    expect(ddr?.status).toBe("High");
    expect(ddr?.evidence.kind).toBe("pathway_scores");
    expect(mapk?.status).toBe("Neutral");
    expect(mapk?.evidence.kind).toBe("pathway_scores");

    // VEGF has no pathway_scores; should fall back to mechanism panel (preview).
    expect(vegf?.status).toBe("Low");
    expect(vegf?.evidence.kind).toBe("mechanism_panel");
  });

  it("A3/B1: L3 VEGF-high -> VEGF resolves from mechanism_panel when pathway_scores absent", () => {
    const out = computeAxisCoverage({
      mechanismPanel: {
        mechanism_axes: AXES,
        current_mechanism_vector: [0.1, 0.2, 0.2, 0.85, 0.2, 0.2, 0.2],
      },
      pathwayScores: {},
      completeness: { missing: [] },
    });

    const vegf = out.find((x) => x.axis === "VEGF");
    expect(vegf?.status).toBe("High");
    expect(vegf?.evidence.kind).toBe("mechanism_panel");
  });

  it("A3/B2: L3 Efflux-high -> Efflux resolves from mechanism_panel when pathway_scores absent", () => {
    const out = computeAxisCoverage({
      mechanismPanel: {
        mechanism_axes: AXES,
        current_mechanism_vector: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.9],
      },
      pathwayScores: {},
      completeness: { missing: [] },
    });

    const efflux = out.find((x) => x.axis === "Efflux");
    expect(efflux?.status).toBe("High");
    expect(efflux?.evidence.kind).toBe("mechanism_panel");
  });

  it("A3/B3: L3 Inflamed -> IO resolves from mechanism_panel when pathway_scores absent", () => {
    const out = computeAxisCoverage({
      mechanismPanel: {
        mechanism_axes: AXES,
        current_mechanism_vector: [0.2, 0.2, 0.2, 0.2, 0.2, 0.8, 0.2],
      },
      pathwayScores: {},
      completeness: { missing: [] },
    });

    const io = out.find((x) => x.axis === "IO");
    expect(io?.status).toBe("High");
    expect(io?.evidence.kind).toBe("mechanism_panel");
  });

  it("PI3K ambiguity: if PI3K axis present but no value in structured sources -> Unknown", () => {
    const out = computeAxisCoverage({
      mechanismPanel: { mechanism_axes: AXES, current_mechanism_vector: [0.2, 0.2 /* missing PI3K */] as any },
      pathwayScores: {},
      completeness: {
        missing: [CANONICAL_MISSING_STRINGS.RNA, CANONICAL_MISSING_STRINGS.CA125],
      },
    });

    const pi3k = out.find((x) => x.axis === "PI3K");
    expect(pi3k?.status).toBe("Unknown");
    expect(pi3k?.recommendedTest).toBe(CANONICAL_MISSING_STRINGS.RNA);
  });

  it("axes list uses mechanism_panel.mechanism_axes when present, else falls back to canonical list", () => {
    expect(getCanonicalAxesFromMechanismPanel({ mechanism_axes: ["DDR", "MAPK"], current_mechanism_vector: [0.1, 0.2] })).toEqual([
      "DDR",
      "MAPK",
    ]);
    expect(getCanonicalAxesFromMechanismPanel(null)).toEqual(AXES);
  });
});

