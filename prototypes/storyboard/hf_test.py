import urllib.request
import json
import sys

# We'll use a dummy text to test if the API responds with a 401 or something else, 
# rather than timing out or failing.
url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
data = json.dumps({"inputs": "test"}).encode("utf-8")
headers = {"Content-Type": "application/json"}
# Intentionally omitting auth to see what happens (should be 401 if reachable)

req = urllib.request.Request(url, data=data, headers=headers, method="POST")
try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.status)
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
except Exception as e:
    print("Other Error:", str(e))
