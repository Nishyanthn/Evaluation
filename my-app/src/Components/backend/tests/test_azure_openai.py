"""
Direct Azure OpenAI API Test
This script tests your Azure OpenAI connection without DeepEval
"""

import os
from dotenv import load_dotenv
from pathlib import Path
import httpx
import json

print("\n" + "="*70)
print("🧪 AZURE OPENAI API DIRECT TEST")
print("="*70)

# Load .env file (prefer backend, fallback to repo root)
current_dir = Path(__file__).parent
backend_env = current_dir.parent / '.env'
root_env = current_dir.parent.parent.parent / '.env'

env_file = None
if backend_env.exists():
    env_file = backend_env
elif root_env.exists():
    env_file = root_env

if env_file:
    print(f"✅ Found .env file: {env_file}")
    load_dotenv(env_file)
else:
    print(f"❌ .env file not found!")
    print(f"   Checked: {backend_env}")
    print(f"   Checked: {root_env}")
    exit(1)

# Get environment variables
model_name = os.getenv("AZURE_OPENAI_MODEL_NAME")
deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")
api_key = os.getenv("AZURE_OPENAI_API_KEY")
api_version = os.getenv("AZURE_OPENAI_API_VERSION")
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")

print("\n📋 Configuration:")
print("="*70)
print(f"Model Name: {model_name}")
print(f"Deployment Name: {deployment_name}")
print(f"API Version: {api_version}")
print(f"Endpoint: {endpoint}")
print(f"API Key: {'*' * 40}{api_key[-4:] if api_key and len(api_key) > 4 else 'NOT SET'}")
print("="*70)

# Validate configuration
if not all([model_name, deployment_name, api_key, api_version, endpoint]):
    print("\n❌ ERROR: Some environment variables are missing!")
    if not model_name:
        print("   - AZURE_OPENAI_MODEL_NAME is missing")
    if not deployment_name:
        print("   - AZURE_OPENAI_DEPLOYMENT_NAME is missing")
    if not api_key:
        print("   - AZURE_OPENAI_API_KEY is missing")
    if not api_version:
        print("   - AZURE_OPENAI_API_VERSION is missing")
    if not endpoint:
        print("   - AZURE_OPENAI_ENDPOINT is missing")
    exit(1)

# Validate endpoint format
print("\n🔍 Step 1: Validate Endpoint Format")
print("="*70)

if '.cognitiveservices.azure.com' in endpoint:
    print("⚠️  WARNING: Endpoint uses Cognitive Services format")
    print(f"   Your endpoint: {endpoint}")
    print(f"   This may not work with standard Azure OpenAI SDK")
    print(f"\n   If using Azure AI Foundry:")
    print(f"   - You may need a different endpoint format")
    print(f"   - Or you may need to use Azure AI Foundry SDK instead")
elif '.openai.azure.com' in endpoint:
    print("✅ Endpoint format looks correct (Azure OpenAI)")
else:
    print(f"⚠️  Unusual endpoint format: {endpoint}")

if not endpoint.endswith('/'):
    print(f"⚠️  WARNING: Endpoint should end with '/'")
    endpoint = endpoint + '/'
    print(f"   Auto-correcting to: {endpoint}")

# Test 1: DNS Resolution
print("\n🔍 Step 2: Test DNS Resolution")
print("="*70)

import socket
try:
    # Extract hostname from endpoint
    hostname = endpoint.replace('https://', '').replace('http://', '').rstrip('/')
    print(f"Resolving: {hostname}")
    ip = socket.gethostbyname(hostname)
    print(f"✅ DNS Resolution successful: {ip}")
except socket.gaierror as e:
    print(f"❌ DNS Resolution failed: {e}")
    print(f"   The hostname '{hostname}' cannot be resolved")
    print(f"   This means the endpoint URL is incorrect or doesn't exist")
    print(f"\n   💡 Check your Azure Portal for the correct endpoint")
    exit(1)

# Test 2: Build API URL
print("\n🔍 Step 3: Build API Request")
print("="*70)

# Construct the full API URL
# Format: {endpoint}openai/deployments/{deployment}/chat/completions?api-version={version}
api_url = f"{endpoint}openai/deployments/{deployment_name}/chat/completions?api-version={api_version}"
print(f"API URL: {api_url}")

# Test 3: Make API Call
print("\n🔍 Step 4: Test API Call")
print("="*70)
print("Sending test request to Azure OpenAI...")

headers = {
    "Content-Type": "application/json",
    "api-key": api_key
}

payload = {
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user",
            "content": "Say 'Hello, this is a test!' and nothing else."
        }
    ],
    "max_tokens": 50,
    "temperature": 0
}

print(f"\n📤 Request Details:")
print(f"   URL: {api_url}")
print(f"   Headers: {{'Content-Type': 'application/json', 'api-key': '***'}}")
print(f"   Payload: {json.dumps(payload, indent=2)}")

try:
    with httpx.Client(timeout=30.0) as client:
        response = client.post(
            api_url,
            headers=headers,
            json=payload
        )

        print(f"\n📥 Response:")
        print(f"   Status Code: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ SUCCESS!")
            print(f"\n   Response Data:")
            print(json.dumps(result, indent=2))

            if 'choices' in result and len(result['choices']) > 0:
                message = result['choices'][0].get('message', {}).get('content', '')
                print(f"\n   🤖 AI Response: {message}")
                print(f"\n{'='*70}")
                print(f"✅ AZURE OPENAI CONNECTION WORKS PERFECTLY!")
                print(f"{'='*70}")
                print(f"\nYour Azure OpenAI API is working correctly.")
                print(f"The issue might be with DeepEval integration.")
                print(f"Let's check DeepEval compatibility next.")

        elif response.status_code == 401:
            print(f"   ❌ AUTHENTICATION FAILED (401)")
            print(f"   Your API key is invalid or expired")
            print(f"\n   💡 Solutions:")
            print(f"   1. Go to Azure Portal → Your OpenAI Resource")
            print(f"   2. Click 'Keys and Endpoint'")
            print(f"   3. Copy Key 1 or Key 2")
            print(f"   4. Update AZURE_OPENAI_API_KEY in .env")

        elif response.status_code == 404:
            print(f"   ❌ NOT FOUND (404)")
            print(f"   The deployment name or endpoint is incorrect")
            print(f"\n   Response: {response.text}")
            print(f"\n   💡 Solutions:")
            print(f"   1. Check deployment name: '{deployment_name}'")
            print(f"   2. Go to Azure Portal → Your OpenAI Resource → Deployments")
            print(f"   3. Verify the deployment name matches exactly (case-sensitive)")
            print(f"   4. Check if the endpoint format is correct")

        elif response.status_code == 400:
            print(f"   ❌ BAD REQUEST (400)")
            print(f"   Response: {response.text}")
            print(f"\n   💡 Possible issues:")
            print(f"   1. API version '{api_version}' might not be supported")
            print(f"   2. Request format might be incorrect")

        else:
            print(f"   ❌ ERROR ({response.status_code})")
            print(f"   Response: {response.text}")

except httpx.ConnectError as e:
    print(f"   ❌ CONNECTION ERROR")
    print(f"   Error: {e}")
    print(f"\n   💡 This means:")
    print(f"   - The endpoint URL is unreachable")
    print(f"   - DNS resolution failed")
    print(f"   - Network/firewall issue")
    print(f"\n   Check your endpoint in Azure Portal")

except httpx.TimeoutException:
    print(f"   ❌ TIMEOUT ERROR")
    print(f"   The request took too long")
    print(f"   Azure OpenAI service might be slow or down")

except Exception as e:
    print(f"   ❌ UNEXPECTED ERROR")
    print(f"   Error Type: {type(e).__name__}")
    print(f"   Error: {e}")
    import traceback
    print(f"\n   Full Traceback:")
    traceback.print_exc()

print("\n" + "="*70)
print("🏁 TEST COMPLETE")
print("="*70 + "\n")
