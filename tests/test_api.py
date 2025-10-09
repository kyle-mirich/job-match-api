#!/usr/bin/env python3
"""
Test script for Resume Insight Scoring API

Usage:
    python test_api.py <path_to_resume.pdf>
    python test_api.py <path_to_resume.pdf> --api-key YOUR_API_KEY
    python test_api.py <path_to_resume.pdf> --url http://localhost:5000
"""

import sys
import os
import base64
import requests
import json
from pathlib import Path
import argparse


def encode_pdf_file(file_path: str) -> str:
    """Encode PDF file to base64 string"""
    try:
        with open(file_path, 'rb') as f:
            pdf_data = f.read()
            return base64.b64encode(pdf_data).decode('utf-8')
    except FileNotFoundError:
        print(f"Error: File not found: {file_path}")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)


def analyze_resume(
    pdf_base64: str,
    api_url: str,
    api_key: str,
    job_description: str = None
):
    """Send resume to API for analysis"""
    endpoint = f"{api_url}/analyze-resume"

    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': api_key
    }

    payload = {
        'file': pdf_base64
    }

    if job_description:
        payload['job_description'] = job_description

    print(f"\nSending request to {endpoint}...")
    print(f"API Key: {api_key[:10]}...")
    print(f"PDF size: {len(pdf_base64)} characters (base64)")

    try:
        response = requests.post(
            endpoint,
            headers=headers,
            json=payload,
            timeout=120  # 2 minute timeout
        )

        print(f"\nResponse Status: {response.status_code}")

        if response.status_code == 200:
            return response.json()
        else:
            print(f"\nError Response:")
            print(json.dumps(response.json(), indent=2))
            return None

    except requests.exceptions.Timeout:
        print("\nError: Request timed out (120 seconds)")
        print("The AI model may be taking longer than expected. Try again.")
        return None
    except requests.exceptions.ConnectionError:
        print(f"\nError: Could not connect to {api_url}")
        print("Make sure the API server is running.")
        return None
    except Exception as e:
        print(f"\nError making request: {e}")
        return None


def print_results(analysis: dict):
    """Pretty print analysis results"""
    if not analysis:
        return

    print("\n" + "=" * 80)
    print("RESUME ANALYSIS RESULTS")
    print("=" * 80)

    # Overall score
    score = analysis.get('overall_score', 0)
    print(f"\nOVERALL SCORE: {score}/100")

    # Score bar
    bar_length = 50
    filled = int((score / 100) * bar_length)
    bar = '█' * filled + '░' * (bar_length - filled)
    print(f"[{bar}] {score}%")

    # Section scores
    section_scores = analysis.get('section_scores', {})
    if section_scores:
        print("\n" + "-" * 80)
        print("SECTION SCORES:")
        print("-" * 80)
        for section, score in section_scores.items():
            filled = int((score / 100) * 30)
            bar = '█' * filled + '░' * (30 - filled)
            print(f"  {section.capitalize():15} [{bar}] {score}/100")

    # Strengths
    strengths = analysis.get('strengths', [])
    if strengths:
        print("\n" + "-" * 80)
        print("STRENGTHS:")
        print("-" * 80)
        for i, strength in enumerate(strengths, 1):
            print(f"  {i}. {strength}")

    # Weaknesses
    weaknesses = analysis.get('weaknesses', [])
    if weaknesses:
        print("\n" + "-" * 80)
        print("AREAS FOR IMPROVEMENT:")
        print("-" * 80)
        for i, weakness in enumerate(weaknesses, 1):
            print(f"  {i}. {weakness}")

    # Recommendations
    recommendations = analysis.get('recommendations', [])
    if recommendations:
        print("\n" + "-" * 80)
        print("RECOMMENDATIONS:")
        print("-" * 80)
        for i, rec in enumerate(recommendations, 1):
            print(f"  {i}. {rec}")

    # Metadata
    metadata = analysis.get('metadata', {})
    if metadata:
        print("\n" + "-" * 80)
        print("METADATA:")
        print("-" * 80)
        print(f"  Resume Length: {metadata.get('resume_length_words', 0)} words")
        print(f"  Characters: {metadata.get('resume_length_chars', 0)}")
        print(f"  Job Description Provided: {metadata.get('has_job_description', False)}")

    print("\n" + "=" * 80)


def main():
    parser = argparse.ArgumentParser(
        description='Test Resume Insight Scoring API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python test_api.py resume.pdf
  python test_api.py resume.pdf --api-key my-secret-key
  python test_api.py resume.pdf --url http://localhost:5000
  python test_api.py resume.pdf --jd "Senior Python Developer with 5+ years..."
        """
    )

    parser.add_argument(
        'pdf_file',
        help='Path to PDF resume file'
    )
    parser.add_argument(
        '--api-key',
        default='your-secret-api-key-change-this',
        help='API key for authentication (default: your-secret-api-key-change-this)'
    )
    parser.add_argument(
        '--url',
        default='http://localhost:5000',
        help='API base URL (default: http://localhost:5000)'
    )
    parser.add_argument(
        '--jd', '--job-description',
        dest='job_description',
        help='Job description text for tailored scoring'
    )

    args = parser.parse_args()

    # Validate file exists
    if not os.path.isfile(args.pdf_file):
        print(f"Error: File not found: {args.pdf_file}")
        sys.exit(1)

    # Validate file is PDF
    if not args.pdf_file.lower().endswith('.pdf'):
        print(f"Warning: File does not have .pdf extension: {args.pdf_file}")
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)

    print("=" * 80)
    print("RESUME INSIGHT SCORING API - TEST SCRIPT")
    print("=" * 80)
    print(f"\nPDF File: {args.pdf_file}")
    print(f"API URL: {args.url}")

    # Encode PDF
    print("\nEncoding PDF to base64...")
    pdf_base64 = encode_pdf_file(args.pdf_file)
    print(f"Encoded successfully ({len(pdf_base64)} chars)")

    # Analyze
    analysis = analyze_resume(
        pdf_base64=pdf_base64,
        api_url=args.url,
        api_key=args.api_key,
        job_description=args.job_description
    )

    # Print results
    if analysis:
        print_results(analysis)
        print("\nTest completed successfully!")
    else:
        print("\nTest failed. Check the errors above.")
        sys.exit(1)


if __name__ == '__main__':
    main()
