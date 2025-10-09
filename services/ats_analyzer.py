"""
ATS (Applicant Tracking System) Compatibility Analyzer

Analyzes resumes for common ATS parsing issues and provides actionable feedback.
Uses rule-based detection to identify formatting and structure problems.
"""
import re
import logging
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)


class ATSAnalyzer:
    """Analyzes resume for ATS compatibility issues"""

    # Common ATS-friendly section headers
    STANDARD_SECTIONS = {
        'experience', 'work experience', 'employment', 'professional experience',
        'education', 'academic background',
        'skills', 'technical skills', 'core competencies',
        'summary', 'professional summary', 'objective',
        'certifications', 'certificates',
        'projects', 'portfolio'
    }

    # Problematic special characters that ATS may not handle well
    PROBLEMATIC_CHARS = ['★', '●', '◆', '■', '▪', '→', '►', '✓', '✔', '•']

    def __init__(self):
        """Initialize the ATS analyzer"""
        self.base_score = 100
        self.issues = []
        self.recommendations = []

    def analyze(self, resume_text: str) -> Dict:
        """
        Analyze resume for ATS compatibility

        Args:
            resume_text: Extracted text from resume

        Returns:
            Dictionary with:
                - ats_score: int (0-100)
                - ats_issues: List[str]
                - ats_recommendations: List[str]
        """
        self.base_score = 100
        self.issues = []
        self.recommendations = []

        logger.info("Starting ATS compatibility analysis...")

        # Run all checks
        self._check_length(resume_text)
        self._check_special_characters(resume_text)
        self._check_section_headers(resume_text)
        self._check_contact_info(resume_text)
        self._check_formatting_indicators(resume_text)
        self._check_file_structure(resume_text)

        # Add bonus points for good practices
        self._check_standard_sections(resume_text)

        # Clamp score to valid range
        final_score = max(0, min(100, self.base_score))

        logger.info(f"ATS analysis complete. Score: {final_score}")

        return {
            'ats_score': final_score,
            'ats_issues': self.issues,
            'ats_recommendations': self.recommendations
        }

    def _deduct_points(self, points: int, issue: str, recommendation: str):
        """Helper to deduct points and track issues"""
        self.base_score -= points
        self.issues.append(issue)
        self.recommendations.append(recommendation)

    def _add_bonus(self, points: int):
        """Helper to add bonus points"""
        self.base_score += points

    def _check_length(self, text: str):
        """Check if resume is too short or too long"""
        word_count = len(text.split())

        if word_count < 100:
            self._deduct_points(
                20,
                "Resume is too short (less than 100 words)",
                "Add more detail about your experience, skills, and achievements. Aim for 300-800 words."
            )
        elif word_count > 1500:
            self._deduct_points(
                5,
                "Resume is very long (over 1500 words)",
                "Consider condensing content. Most ATS and recruiters prefer resumes under 800 words."
            )

    def _check_special_characters(self, text: str):
        """Check for special characters that may confuse ATS"""
        found_chars = set()

        for char in self.PROBLEMATIC_CHARS:
            if char in text:
                found_chars.add(char)

        if found_chars:
            self._deduct_points(
                5,
                f"Special characters detected: {', '.join(found_chars)}",
                "Replace special bullet points and symbols with standard characters (-, *, •) or simple text."
            )

    def _check_section_headers(self, text: str):
        """Check if standard section headers are present"""
        text_lower = text.lower()

        # Check for at least some standard sections
        has_experience = any(section in text_lower for section in ['experience', 'employment', 'work history'])
        has_education = 'education' in text_lower
        has_skills = 'skills' in text_lower

        if not has_experience:
            self._deduct_points(
                10,
                "Missing standard 'Experience' or 'Work History' section",
                "Add a clear 'Work Experience' or 'Professional Experience' section header."
            )

        if not has_education:
            self._deduct_points(
                5,
                "Missing 'Education' section",
                "Add an 'Education' section even if it's brief. ATS often looks for this."
            )

        if not has_skills:
            self._deduct_points(
                10,
                "Missing 'Skills' section",
                "Add a dedicated 'Skills' or 'Technical Skills' section with relevant keywords."
            )

    def _check_contact_info(self, text: str):
        """Check for contact information"""
        # Check for email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        has_email = bool(re.search(email_pattern, text))

        # Check for phone (various formats)
        phone_pattern = r'(\d{3}[-.\s]??\d{3}[-.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-.\s]??\d{4})'
        has_phone = bool(re.search(phone_pattern, text))

        if not has_email:
            self._deduct_points(
                15,
                "No email address detected",
                "Include a professional email address at the top of your resume."
            )
        else:
            self._add_bonus(5)  # Bonus for having email

        if not has_phone:
            self._deduct_points(
                5,
                "No phone number detected",
                "Include a phone number in your contact information."
            )

    def _check_formatting_indicators(self, text: str):
        """Check for indicators of complex formatting"""
        # Check for table-like structures (multiple consecutive spaces/tabs)
        if re.search(r'\s{4,}', text):
            self._deduct_points(
                10,
                "Detected potential tables or complex spacing",
                "Avoid tables and multi-column layouts. Use simple, single-column text with bullet points."
            )

        # Check for unusual line breaks (might indicate columns)
        lines = text.split('\n')
        very_short_lines = sum(1 for line in lines if 0 < len(line.strip()) < 20)

        if very_short_lines > len(lines) * 0.3:  # More than 30% of lines are very short
            self._deduct_points(
                5,
                "Many short lines detected (possible multi-column layout)",
                "Use a single-column format. Multi-column resumes are hard for ATS to parse correctly."
            )

    def _check_file_structure(self, text: str):
        """Check basic structure indicators"""
        # Check for chronological order indicators
        years = re.findall(r'\b(19|20)\d{2}\b', text)

        if not years:
            self._deduct_points(
                5,
                "No dates found in resume",
                "Include dates for your work experience and education (e.g., 'Jan 2020 - Present')."
            )

        # Check for action verbs (good practice)
        action_verbs = [
            'led', 'managed', 'developed', 'created', 'implemented', 'designed',
            'analyzed', 'improved', 'increased', 'reduced', 'built', 'launched'
        ]
        text_lower = text.lower()
        found_verbs = sum(1 for verb in action_verbs if verb in text_lower)

        if found_verbs >= 3:
            self._add_bonus(5)  # Bonus for using action verbs

    def _check_standard_sections(self, text: str):
        """Give bonus points for well-structured resumes"""
        text_lower = text.lower()

        # Count standard sections present
        sections_found = sum(1 for section in self.STANDARD_SECTIONS if section in text_lower)

        if sections_found >= 4:
            self._add_bonus(10)  # Well-structured resume
        elif sections_found >= 3:
            self._add_bonus(5)

        # Bonus for bullets
        if '•' in text or '-' in text or '*' in text:
            self._add_bonus(5)  # Using bullet points


def analyze_ats_compatibility(resume_text: str) -> Dict:
    """
    Convenience function to analyze ATS compatibility

    Args:
        resume_text: Extracted text from resume

    Returns:
        Dictionary with ats_score, ats_issues, and ats_recommendations
    """
    analyzer = ATSAnalyzer()
    return analyzer.analyze(resume_text)
