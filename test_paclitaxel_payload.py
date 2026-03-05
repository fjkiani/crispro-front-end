import asyncio
import os
import sys

# Add backend dir to path
sys.path.append("/Users/fahadkiani/Desktop/development/crispr-assistant-main/oncology-coPilot/oncology-backend-minimal")

from api.routers.ayesha_therapy_fit import ayesha_analysis_bundle, BundleRequest

async def main():
    bundle = await ayesha_analysis_bundle(
        level="l1",
        include_synthetic_lethality=False,
        efficacy_mode="comprehensive",
        body=BundleRequest()
    )
    
    l1_drugs = bundle["levels"]["L1"]["efficacy"]["drugs"]
    paclitaxel = next((d for d in l1_drugs if "paclitaxel" in d.get("name", "").lower()), None)
    
    if paclitaxel:
        print(f"FOUND PACLITAXEL:")
        print(f"Citations Court: {paclitaxel.get('citations_count')}")
        print(f"Evidence Tier: {paclitaxel.get('evidence_tier')}")
        print(f"Label Status: {paclitaxel.get('label_status')}")
        print(f"Rationale: {paclitaxel.get('rationale')}")
    else:
        print("PACLITAXEL NOT FOUND IN L1 PANEL")

if __name__ == "__main__":
    asyncio.run(main())
