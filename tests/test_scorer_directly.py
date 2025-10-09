"""Direct test of ResumeScorer to see actual error"""
import sys
import logging

# Configure logging to see the full error
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from services import ResumeScorer

# Sample resume text
resume_text = """
JOHN DOE - SOFTWARE ENGINEER
Email: john.doe@email.com | Phone: 555-1234

EXPERIENCE
Senior Software Engineer at Tech Company (2020-2024)
- Developed Python Flask APIs serving 1M+ requests per day
- Implemented CI/CD pipelines reducing deployment time by 60%
- Worked with LangChain and AI integration projects
- Built scalable microservices using Docker and Kubernetes

Software Engineer at StartupCo (2018-2020)
- Created RESTful APIs using FastAPI and PostgreSQL
- Optimized database queries improving response time by 40%
- Collaborated with cross-functional teams on product features

SKILLS
Programming: Python, JavaScript, TypeScript, SQL
Frameworks: Flask, FastAPI, React, Next.js
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD
Databases: PostgreSQL, Redis, MongoDB

EDUCATION
Bachelor of Science in Computer Science
State University, 2018
"""

job_description = "Looking for a Senior Python developer with Flask and API experience"

print("Initializing ResumeScorer...")
try:
    scorer = ResumeScorer()
    print("[OK] ResumeScorer initialized")
except Exception as e:
    print(f"[ERROR] Failed to initialize: {e}")
    sys.exit(1)

print("\nScoring resume...")
try:
    result = scorer.score_resume(
        resume_text=resume_text,
        job_description=job_description
    )
    print("[SUCCESS]")
    print("\nResults:")
    import json
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
