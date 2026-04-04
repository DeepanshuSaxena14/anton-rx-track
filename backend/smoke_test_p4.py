import urllib.request
import json
import urllib.parse
from urllib.error import URLError, HTTPError

BASE_URL = "http://localhost:8000"

def check(endpoint, method="GET", payload=None):
    url = f"{BASE_URL}{endpoint}"
    print(f"Testing {method} {url}... ", end="")
    
    req = urllib.request.Request(url, method=method)
    if payload:
        req.add_header('Content-Type', 'application/json')
        data = json.dumps(payload).encode('utf-8')
        req.data = data
        
    try:
        with urllib.request.urlopen(req) as res:
            res_data = res.read()
            print("OK 200")
    except HTTPError as e:
        print(f"FAILED {e.code}")
    except URLError as e:
        print(f"FAILED {e.reason}")

print("--- P4 SMOKE TESTS ---")
check("/health")
check("/search?drug_name=Keytruda")
check("/changes?drug_name=Keytruda&payer=Medicare")
check("/scores?drug_name=Keytruda")
check("/compare?drug_name=Keytruda&payers=Medicare")
check("/query", method="POST", payload={"question": "What is the PA criteria?"})
check("/appeal", method="POST", payload={"drug": "Keytruda", "payer": "Medicare", "denial_reason": "Missing step therapy"})
print("----------------------")
print("Smoke tests dispatched! If all are OK 200, endpoints are ready for handoff.")
