"""Test script for SSE endpoint"""
import requests
import base64
import json
from pathlib import Path

API_URL = "http://localhost:5000"
API_KEY = "1234"

def test_sse_endpoint():
    """Test the SSE streaming endpoint"""

    # Create a simple test PDF content
    test_pdf_path = Path("test_resume.pdf")

    if not test_pdf_path.exists():
        print("ERROR: test_resume.pdf not found. Please create one first.")
        return

    # Read and encode PDF
    with open(test_pdf_path, 'rb') as f:
        pdf_content = f.read()
        base64_pdf = base64.b64encode(pdf_content).decode('utf-8')

    print(f"PDF encoded, size: {len(base64_pdf)} characters")

    # Prepare payload
    payload = {
        "file": base64_pdf,
        "job_description": "Software Engineer position requiring Python and Flask experience"
    }

    print("\nSending request to /analyze-resume-stream...")
    print("Watching for SSE events...\n")

    # Make streaming request
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
    }

    response = requests.post(
        f"{API_URL}/analyze-resume-stream",
        json=payload,
        headers=headers,
        stream=True
    )

    if response.status_code != 200:
        print(f"ERROR: Status {response.status_code}")
        print(response.text)
        return

    print("Connection established, receiving events:\n")

    # Parse SSE stream
    buffer = ""
    for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
        if chunk:
            buffer += chunk

            # Split by double newline
            while '\n\n' in buffer:
                message, buffer = buffer.split('\n\n', 1)

                if message.strip():
                    # Parse event and data
                    lines = message.split('\n')
                    event_type = None
                    data = None

                    for line in lines:
                        if line.startswith('event: '):
                            event_type = line[7:].strip()
                        elif line.startswith('data: '):
                            data = line[6:].strip()

                    if event_type and data:
                        data_obj = json.loads(data)

                        if event_type == 'progress':
                            print(f"📊 PROGRESS: {data_obj['progress']}% - {data_obj['stage']} - {data_obj['message']}")
                        elif event_type == 'result':
                            print(f"\n✅ RESULT RECEIVED")
                            print(f"   Overall Score: {data_obj['overall_score']}")
                            print(f"   ATS Score: {data_obj['ats_score']}")
                            if 'job_match_score' in data_obj:
                                print(f"   Job Match: {data_obj['job_match_score']}%")
                            print("\n   Analysis complete!")
                        elif event_type == 'error':
                            print(f"❌ ERROR: {data_obj.get('message', 'Unknown error')}")

    print("\nStream ended.")

if __name__ == '__main__':
    test_sse_endpoint()
