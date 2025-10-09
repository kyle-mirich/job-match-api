import base64
import requests
import json

# Simulate what the frontend sends
API_URL = "http://localhost:5000/analyze-resume"
API_KEY = "1234"

# Create a minimal valid PDF for testing
def create_test_pdf_base64():
    """Create a minimal PDF for testing"""
    # This is a minimal valid PDF with some text
    pdf_content = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 500 >>
stream
BT
/F1 12 Tf
100 700 Td
(JOHN DOE - SOFTWARE ENGINEER) Tj
0 -20 Td
(Email: john.doe@email.com | Phone: 555-1234) Tj
0 -40 Td
(EXPERIENCE) Tj
0 -20 Td
(Senior Software Engineer at Tech Company) Tj
0 -15 Td
(- Developed Python Flask APIs) Tj
0 -15 Td
(- Worked with LangChain and AI) Tj
0 -15 Td
(- Built scalable microservices) Tj
0 -40 Td
(SKILLS) Tj
0 -20 Td
(Python, Flask, FastAPI, Docker, AWS) Tj
0 -15 Td
(React, TypeScript, PostgreSQL, Redis) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000304 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
398
%%EOF"""

    return base64.b64encode(pdf_content).decode('utf-8')

def test_analyze_resume():
    """Test the analyze-resume endpoint"""

    # Create payload matching what frontend sends
    payload = {
        "file": create_test_pdf_base64(),
        "job_description": "Looking for a Python developer with Flask experience"
    }

    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }

    print("Sending request to:", API_URL)
    print("Payload size:", len(json.dumps(payload)), "bytes")
    print("\nHeaders:", headers)

    try:
        response = requests.post(API_URL, json=payload, headers=headers)

        print("\n" + "="*60)
        print("Response Status:", response.status_code)
        print("="*60)

        if response.ok:
            print("\n[SUCCESS]")
            result = response.json()
            print(json.dumps(result, indent=2))
        else:
            print("\n[ERROR]")
            print("Response:", response.text)

    except Exception as e:
        print(f"\n[FAILED] Request failed: {e}")

if __name__ == "__main__":
    test_analyze_resume()
