import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(name, method, path, data=None, params=None):
    print(f"\n--- Testing {name} [{method} {path}] ---")
    url = f"{BASE_URL}{path}"
    try:
        if method == "GET":
            resp = requests.get(url, params=params)
        else:
            resp = requests.post(url, json=data)
        
        if resp.status_code == 200:
            print(f"[SUCCESS] {name}")
            # print(json.dumps(resp.json(), indent=2)[:500] + "...")
        else:
            print(f"[FAILED] {name}: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"[ERROR] {name}: {str(e)}")

if __name__ == "__main__":
    # 1. Health
    test_endpoint("Health Check", "GET", "/health")

    # 2. Search
    test_endpoint("Search Policy", "GET", "/search", params={"drug_name": "rituximab"})

    # 3. Smart Query (RAG)
    test_endpoint("Smart Query (RAG)", "POST", "/query", data={"question": "What is the authorization period for RA?"})

    # 4. Scores
    test_endpoint("Restrictiveness Scores", "GET", "/scores", params={"drug_name": "rituximab"})

    # 5. Comparison
    test_endpoint("Policy Comparison", "GET", "/compare", params={"drug_name": "rituximab", "payers": ["Cigna"]})

    # 6. Appeal Letter
    test_endpoint("Appeal Generator", "POST", "/appeal", data={
        "drug": "Rituxan", 
        "payer": "Cigna", 
        "denial_reason": "Not tried biosimilars",
        "extra_context": "Patient has severe allergy to Ruxience stabilising agents."
    })

    # 7. Changes (Will likely be empty but shouldn't fail)
    test_endpoint("Policy Analytics (Changes)", "GET", "/changes", params={"drug_name": "rituximab", "payer": "Cigna"})
