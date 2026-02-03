"""
Test script for evaluation backend
Run this to test the backend without the frontend
"""

import requests
import json

# Backend URL
BASE_URL = "http://localhost:8001"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*70)
    print("Testing Health Endpoint")
    print("="*70)

    response = requests.get(f"{BASE_URL}/api/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_available_metrics():
    """Test available metrics endpoint"""
    print("\n" + "="*70)
    print("Testing Available Metrics Endpoint")
    print("="*70)

    response = requests.get(f"{BASE_URL}/api/available-metrics")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_run_evaluation():
    """Test run evaluation endpoint with sample data"""
    print("\n" + "="*70)
    print("Testing Run Evaluation Endpoint")
    print("="*70)

    # Sample evaluation request
    payload = {
        "evaluationName": "Test Run - Sample Data",
        "dataset": {
            "name": "sample_dataset",
            "version": 1,
            "data": [
                {
                    "id": 1,
                    "user_query": "What is artificial intelligence?",
                    "expected_response": "Artificial Intelligence (AI) is the simulation of human intelligence in machines."
                },
                {
                    "id": 2,
                    "user_query": "What are the benefits of AI?",
                    "expected_response": "AI offers benefits like automation, improved efficiency, data analysis, and personalized experiences."
                }
            ]
        },
        "fieldMappings": {
            "query": "{{item.user_query}}",
            "response": "{{item.expected_response}}",
            "context": "not_available",
            "ground_truth": "{{item.expected_response}}",
            "tool_calls": "not_available",
            "tool_definitions": "not_available"
        },
        "judgeModel": "evaluator-gpt-4o",
        "criteriaData": {
            "selectedMetrics": ["faithfulness", "relevance"],
            "customPrompt": None,
            "modelUnderTest": "gpt-4",
            "temperature": 0.7
        }
    }

    print("\nSending evaluation request...")
    print(f"Test Cases: {len(payload['dataset']['data'])}")
    print(f"Metrics: {', '.join(payload['criteriaData']['selectedMetrics'])}")

    try:
        response = requests.post(
            f"{BASE_URL}/api/run-evaluation",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=300  # 5 minutes timeout
        )

        print(f"\nStatus Code: {response.status_code}")

        if response.status_code == 200:
            result = response.json()
            print("\n✅ Evaluation Completed Successfully!")
            print(f"Total Tests: {result['totalTests']}")
            print(f"Completed Tests: {result['completedTests']}")
            print(f"Overall Score: {result['overallScore']:.2f}")
            print(f"\nDetailed Results:")
            print(json.dumps(result, indent=2))
        else:
            print(f"\n❌ Error: {response.text}")

    except requests.exceptions.Timeout:
        print("\n⏱️ Request timed out - evaluation may still be running on server")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("🧪 EVALUATION BACKEND TEST SUITE")
    print("="*70)
    print("Make sure the backend server is running on http://localhost:8001")
    print("Start it with: python evaluation_backend.py")
    print("="*70)

    try:
        # Test 1: Health Check
        test_health()

        # Test 2: Available Metrics
        test_available_metrics()

        # Test 3: Run Evaluation (comment out if you want to test quickly)
        user_input = input("\n\nDo you want to run a full evaluation test? (y/n): ")
        if user_input.lower() == 'y':
            test_run_evaluation()
        else:
            print("\nSkipping evaluation test. You can test it from the frontend.")

        print("\n" + "="*70)
        print("✅ ALL TESTS COMPLETED")
        print("="*70 + "\n")

    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to backend server")
        print("Make sure the server is running: python evaluation_backend.py")
    except Exception as e:
        print(f"\n❌ Unexpected Error: {str(e)}")

if __name__ == "__main__":
    main()
