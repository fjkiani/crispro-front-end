
import json
import urllib.request
import urllib.parse

def verify_workflow():
    base_url = "http://localhost:8000/api/workflow"
    
    # 1. GET State (Should be empty initially or contain existing)
    print("--- 1. Get Initial State ---")
    with urllib.request.urlopen(f"{base_url}/state") as response:
        state = json.loads(response.read().decode())
        print(f"Initial State Keys: {list(state.keys())}")
        
    # 2. SAVE Trial (Review Required)
    print("\n--- 2. Save Trial ---")
    mock_trial = {
        "nct_id": "NCT_MOCK_001",
        "title": "Mock Trial for Workflow Test",
        "llm_assessment": {"eligibility_status": "Review Required"}
    }
    req = urllib.request.Request(
        f"{base_url}/save",
        data=json.dumps({"trial": mock_trial, "status": "review_required"}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as r:
        print(f"Save Response: {r.read().decode()}")

    # 3. VERIFY Save
    print("\n--- 3. Verify Save ---")
    with urllib.request.urlopen(f"{base_url}/state") as response:
        state = json.loads(response.read().decode())
        reviews = state.get("review_required", [])
        found = any(t.get("nct_id") == "NCT_MOCK_001" for t in reviews)
        print(f"Trial found in 'review_required': {found}")
        if not found:
            print("❌ Verification Failed: Trial not in list")
            return

    # 4. MOVE Trial (to Applied)
    print("\n--- 4. Move Trial ---")
    move_payload = {"nct_id": "NCT_MOCK_001", "to_status": "applied"}
    req = urllib.request.Request(
        f"{base_url}/move",
        data=json.dumps(move_payload).encode(),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as r:
        print(f"Move Response: {r.read().decode()}")
        
    # 5. VERIFY Move
    print("\n--- 5. Verify Move ---")
    with urllib.request.urlopen(f"{base_url}/state") as response:
        state = json.loads(response.read().decode())
        applied = state.get("applied", [])
        reviews = state.get("review_required", [])
        
        in_applied = any(t.get("nct_id") == "NCT_MOCK_001" for t in applied)
        in_reviews = any(t.get("nct_id") == "NCT_MOCK_001" for t in reviews)
        
        print(f"Trial in 'applied': {in_applied}")
        print(f"Trial in 'review_required': {in_reviews}")
        
        if in_applied and not in_reviews:
            print("✅ Move Verified Successfully")
        else:
            print("❌ Move Verification Failed")

    # 6. DELETE (Cleanup)
    print("\n--- 6. Cleanup (Delete) ---")
    req = urllib.request.Request(f"{base_url}/NCT_MOCK_001", method="DELETE")
    with urllib.request.urlopen(req) as r:
         print(f"Delete Response: {r.read().decode()}")

if __name__ == "__main__":
    verify_workflow()
