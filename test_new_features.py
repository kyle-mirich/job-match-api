"""Test script for Job Match and ATS features"""
import sys
import logging
import json

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from services import ResumeScorer

# Sample resume text
resume_text = """
JOHN DOE - SOFTWARE ENGINEER
Email: john.doe@email.com | Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Senior Software Engineer with 6+ years of experience building scalable web applications
and RESTful APIs. Passionate about clean code and Test-Driven Development.

WORK EXPERIENCE

Senior Software Engineer | Tech Company | 2020 - Present
- Developed Python Flask REST APIs serving 1M+ requests per day
- Implemented CI/CD pipelines using GitHub Actions, reducing deployment time by 60%
- Led team of 3 engineers on microservices migration project
- Built real-time data processing pipeline handling 50K events/second

Software Engineer | StartupCo | 2018 - 2020
- Created RESTful APIs using FastAPI and PostgreSQL
- Optimized database queries improving response time by 40%
- Collaborated with cross-functional teams on product features
- Implemented automated testing suite with 85% code coverage

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL, Go
Frameworks: Flask, FastAPI, React, Next.js, Django
Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes, Terraform, CI/CD
Databases: PostgreSQL, Redis, MongoDB, MySQL
Tools: Git, GitHub, Jira, Postman

EDUCATION
Bachelor of Science in Computer Science | State University | 2018
GPA: 3.8/4.0
"""

# Sample job description with specific requirements
job_description = """
Senior Python Backend Engineer

We are looking for an experienced Senior Backend Engineer to join our team.

Required Skills:
- 5+ years of Python development
- Strong experience with Flask or Django
- RESTful API design and implementation
- PostgreSQL or MySQL database experience
- Docker and Kubernetes
- AWS cloud services
- Git version control

Nice to Have:
- GraphQL experience
- Microservices architecture
- Message queues (RabbitMQ, Kafka)
- Monitoring tools (Prometheus, Grafana)
- Leadership experience

Responsibilities:
- Design and build scalable backend services
- Mentor junior developers
- Participate in architecture decisions
- Write clean, testable code
"""

print("="*70)
print("TESTING NEW FEATURES: Job Match Score + ATS Compatibility")
print("="*70)

print("\nInitializing ResumeScorer...")
try:
    scorer = ResumeScorer()
    print("[OK] ResumeScorer initialized\n")
except Exception as e:
    print(f"[ERROR] Failed to initialize: {e}")
    sys.exit(1)

# Test 1: With job description (should include job match score)
print("\n" + "="*70)
print("TEST 1: Resume analysis WITH job description")
print("="*70)
try:
    result_with_jd = scorer.score_resume(
        resume_text=resume_text,
        job_description=job_description
    )

    print("\n[SUCCESS] Analysis complete!\n")
    print(f"Overall Score: {result_with_jd['overall_score']}/100")
    print(f"ATS Score: {result_with_jd['ats_score']}/100")

    if 'job_match_score' in result_with_jd:
        print(f"Job Match Score: {result_with_jd['job_match_score']}/100")
        print(f"\nMissing Keywords: {result_with_jd.get('missing_keywords', [])}")
    else:
        print("[WARNING] Job match score not returned")

    print(f"\nATS Issues ({len(result_with_jd.get('ats_issues', []))}):")
    for issue in result_with_jd.get('ats_issues', []):
        print(f"  - {issue}")

    print(f"\nATS Recommendations ({len(result_with_jd.get('ats_recommendations', []))}):")
    for rec in result_with_jd.get('ats_recommendations', []):
        print(f"  - {rec}")

except Exception as e:
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 2: Without job description (should NOT include job match score)
print("\n" + "="*70)
print("TEST 2: Resume analysis WITHOUT job description")
print("="*70)
try:
    result_without_jd = scorer.score_resume(
        resume_text=resume_text,
        job_description=None
    )

    print("\n[SUCCESS] Analysis complete!\n")
    print(f"Overall Score: {result_without_jd['overall_score']}/100")
    print(f"ATS Score: {result_without_jd['ats_score']}/100")

    if 'job_match_score' in result_without_jd and result_without_jd['job_match_score'] is not None:
        print(f"[WARNING] Job match score should be None, but got: {result_without_jd['job_match_score']}")
    else:
        print("[OK] Job match score correctly omitted")

    print(f"\nATS Issues ({len(result_without_jd.get('ats_issues', []))}):")
    for issue in result_without_jd.get('ats_issues', []):
        print(f"  - {issue}")

except Exception as e:
    print(f"[ERROR] {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "="*70)
print("ALL TESTS COMPLETED SUCCESSFULLY!")
print("="*70)
print("\nFull response structure (with JD):")
print(json.dumps(result_with_jd, indent=2))
