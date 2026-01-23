"use client";

import { useState, useRef, useCallback } from "react";
import { type GeneFromSearch, type GeneBounds, type ClinvarVariant, type GeneInfo, type GeneData } from "./utils/genome-api";

import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { GeneInformation } from "./gene-information";
import { GeneSequence } from "./gene-sequence";
import KnownVariants from "./known-variants";
import { VariantComparisonModal } from "./variant-comparison-modal";
import VariantAnalysis, {
  type VariantAnalysisHandle,
} from "./variant-analysis";

export default function GeneViewer({
  geneData,
  genomeId,
  onClose,
}: {
  geneData: GeneData;
  genomeId: string;
  onClose: () => void;
}) {
  const [comparisonVariant, setComparisonVariant] =
    useState<ClinvarVariant | null>(null);

  const [activeSequencePosition, setActiveSequencePosition] = useState<
    number | null
  >(null);
  const [activeReferenceNucleotide, setActiveReferenceNucleotide] = useState<
    string | null
  >(null);
  
  const variantAnalysisRef = useRef<VariantAnalysisHandle>(null);

  // --- RESTORED STATE ---
  const { gene_info, sequence, clinvar_variants } = geneData;
  const geneBounds = { min: gene_info.start_pos, max: gene_info.end_pos };
  
  const [startPosition, setStartPosition] = useState<string>(
    geneBounds.min.toString(),
  );
  const [endPosition, setEndPosition] = useState<string>(
    Math.min(geneBounds.max, geneBounds.min + 10000).toString(),
  );

  const handleSequenceClick = useCallback(
    (position: number, nucleotide: string) => {
      setActiveSequencePosition(position);
      setActiveReferenceNucleotide(nucleotide);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (variantAnalysisRef.current) {
        variantAnalysisRef.current.focusAlternativeInput();
      }
    },
    [],
  );

  const showComparison = (variant: ClinvarVariant) => {
    if (variant.evo2Result) {
      setComparisonVariant(variant);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="cursor-pointer text-[#3c4f3d] hover:bg-[#e9eeea]/70"
        onClick={onClose}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to results
      </Button>

      <VariantAnalysis
        ref={variantAnalysisRef}
        gene={gene_info}
        genomeId={genomeId}
        chromosome={gene_info.chromosome}
        clinvarVariants={clinvar_variants}
        referenceSequence={activeReferenceNucleotide}
        sequencePosition={activeSequencePosition}
        geneBounds={geneBounds}
      />

      <KnownVariants
        clinvarVariants={clinvar_variants}
        showComparison={showComparison}
      />

      <GeneSequence
        geneBounds={geneBounds}
        sequenceData={sequence}
        onSequenceClick={handleSequenceClick}
        // --- PASS RESTORED PROPS ---
        startPosition={startPosition}
        endPosition={endPosition}
        onStartPositionChange={setStartPosition}
        onEndPositionChange={setEndPosition}
        sequenceRange={{ start: geneBounds.min, end: Math.min(geneBounds.max, geneBounds.min + 10000) }}
        isLoading={false} // Data is pre-loaded now
        error={null}
        onSequenceLoadRequest={() => {}} // No longer needed, but prop must be passed
        maxViewRange={10000}
      />

      <GeneInformation
        gene={gene_info}
        geneBounds={geneBounds}
      />

      <VariantComparisonModal
        comparisonVariant={comparisonVariant}
        onClose={() => setComparisonVariant(null)}
      />
    </div>
  );
}
