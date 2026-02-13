
import asyncio
import json
import sys
import os

# Fix path to include project root
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.services.holistic_score import get_holistic_score_service
from api.services.personalized_outreach.intelligence_extractor import IntelligenceExtractor

async def debug_signals():
    # 1. Setup Data
    mock_trial = {
        "nct_id": "NCT01234567",
        "title": "Phase III Trial of Olaparib in High Grade Serous Ovarian Cancer",
        "criteria": "Inclusion Criteria:\n- High grade serous ovarian cancer\n- Platinum sensitive\n- BRCA mutation or HRD positive\n\nExclusion Criteria:\n- Prior PARP inhibitor\n- ECOG > 1",
        "locations": [{"facility": "Memorial Sloan Kettering", "status": "Recruiting", "city": "New York", "state": "NY", "country": "United States"}],
        "detailed_description": "This study evaluates Olaparib maintenance...",
        "interventions": [{"intervention_name": "Olaparib", "intervention_type": "Drug"}]
    }
    
    patient_profile = {
        "age": 55,
        "conditions": ["High Grade Serous Ovarian Cancer"],
        "biomarkers": {"hrd_score": 75, "brca_status": "mutated"},
        "location": "New York, NY"
    }
    
    pharmacogenes = []
    
    print("--- 1. Raw HolisticScoreService Output ---")
    holistic_service = get_holistic_score_service()
    # We strip the async call to compute_batch or use internal logic if easier, 
    # but compute_batch is the main entry.
    results = await holistic_service.compute_batch(
        patient_profile=patient_profile,
        trials=[mock_trial],
        pharmacogenes=pharmacogenes
    )
    result = results[0]
    print(json.dumps({
        "eligibility_score": result.get("eligibility_score"),
        "caveats (breakdown)": result.get("caveats")
    }, indent=2))
    
    print("\n--- 2. Raw IntelligenceExtractor Output ---")
    extractor = IntelligenceExtractor()
    intel = await extractor.analyze_biomarker_intelligence(mock_trial)
    print(json.dumps(intel, indent=2))
    
    print("\n--- 3. Adapter Output (Simulated) ---")
    from api.services.ayesha_care_plan.eligibility_adapter import EligibilityAssessmentAdapter
    
    assessment = EligibilityAssessmentAdapter.assess(
        trial=mock_trial,
        strict_score=result["eligibility_score"],
        strict_breakdown=result.get("caveats", []),
        biomarker_intelligence=intel,
        patient_context=patient_profile
    )
    print(json.dumps(assessment, indent=2))

if __name__ == "__main__":
    asyncio.run(debug_signals())
