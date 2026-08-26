import urllib.request
import json
import sys

API_KEY = "YOUR_FAKE_KEY" # This won't work, but let's see if we can trigger the same error!
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        print(response.read())
except Exception as e:
    print(e)
