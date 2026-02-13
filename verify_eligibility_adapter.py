
import json
import urllib.request
import sys

def verify_eligibility():
    url = "http://localhost:8000/api/ayesha/complete_care_plan"
    
    # Payload mimicking Ayesha
    payload = {
        "patient_context": {
            "stage": "IVB",
            "germline_status": "positive",
            "treatment_history": [],
            "biomarkers": {"hrd_score": 75}
        },
        "mutations": [
            {"gene": "TP53", "variant": "R273H"},
            {"gene": "MBD4", "variant": "loss"}
        ]
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            
            # Navigate to trials
            trials_data = data.get("trials", {})
            trials_list = trials_data.get("trials", [])
            
            if not trials_list:
                print("❌ No trials returned.")
                return
            
            print(f"✅ Found {len(trials_list)} trials.")
            
            # Inspect first trial
            first_trial = trials_list[0]
            assessment = first_trial.get("llm_assessment")
            
            if not assessment:
                print("❌ 'llm_assessment' field MISSING in first trial.")
                return
            
            print("✅ 'llm_assessment' field PRESENT.")
            
            # Check keys
            required_keys = ["eligibility_status", "met_criteria", "unmet_criteria", "scores", "provenance"]
            missing = [k for k in required_keys if k not in assessment]
            
            if missing:
                print(f"❌ Schema Validation FAILED. Missing keys: {missing}")
                print(json.dumps(assessment, indent=2))
            else:
                print("✅ Schema Validation PASSED (All keys present).")
                print("\n--- Sample Assessment ---")
                print(json.dumps(assessment, indent=2))
                
                # Check for IntelligenceExtractor contribution
                met = assessment.get("met_criteria", [])
                has_intelligence = any(item.get("source") == "IntelligenceExtractor" for item in met)
                
                if has_intelligence:
                    print("\n✅ IntelligenceExtractor logic detected in 'met_criteria'.")
                else:
                    print("\n⚠️ No IntelligenceExtractor logic detected in top trial (might be low fit).")

    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    verify_eligibility()
