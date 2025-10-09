import json
import logging
from typing import Dict, Any, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from config import Config
from .ats_analyzer import analyze_ats_compatibility

logger = logging.getLogger(__name__)


class SectionScores(BaseModel):
    """Section-wise scores for resume analysis"""
    skills: int = Field(description="Score for skills relevance and depth (0-100)")
    experience: int = Field(description="Score for experience depth and clarity (0-100)")
    clarity: int = Field(description="Score for structure and readability (0-100)")
    keywords: int = Field(description="Score for keyword optimization (0-100)")


class ResumeAnalysis(BaseModel):
    """Complete resume analysis structure"""
    overall_score: int = Field(description="Overall resume score (0-100)")
    section_scores: SectionScores
    job_match_score: Optional[int] = Field(default=None, description="Job match percentage (0-100), only when job description provided")
    missing_keywords: Optional[list[str]] = Field(default=None, description="Keywords from job description missing in resume")
    ats_score: int = Field(description="ATS compatibility score (0-100)")
    ats_issues: list[str] = Field(default_factory=list, description="List of ATS compatibility issues")
    ats_recommendations: list[str] = Field(default_factory=list, description="Recommendations to improve ATS compatibility")
    strengths: list[str] = Field(description="List of key strengths (2-5 items)")
    weaknesses: list[str] = Field(description="List of weaknesses (2-5 items)")
    recommendations: list[str] = Field(description="List of actionable recommendations (3-7 items)")


class ResumeScorer:
    """Resume scoring service using LangChain and Google Generative AI"""

    def __init__(self):
        """Initialize the scorer with LangChain and Google AI"""
        if not Config.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY is required in environment variables")

        self.llm = ChatGoogleGenerativeAI(
            model=Config.MODEL_NAME,
            google_api_key=Config.GOOGLE_API_KEY,
            temperature=0.3,
            convert_system_message_to_human=True
        )

        self.parser = PydanticOutputParser(pydantic_object=ResumeAnalysis)

    def _build_scoring_prompt(self, job_description: Optional[str] = None) -> ChatPromptTemplate:
        """
        Build the scoring prompt with job description context

        Args:
            job_description: Optional job description for tailored scoring

        Returns:
            ChatPromptTemplate for resume analysis
        """
        jd_context = ""
        job_match_instructions = ""

        if job_description:
            jd_context = f"""
Job Description Context:
{job_description}

Weight your scoring to reflect how well the resume matches this job description.
"""
            job_match_instructions = """

IMPORTANT - JOB MATCH ANALYSIS:
Since a job description was provided, you MUST also include:
1. job_match_score: Calculate a percentage (0-100) indicating how well this resume matches the job description
   - Consider: required skills, experience level, qualifications, responsibilities
   - 90-100: Excellent match, meets all key requirements
   - 70-89: Good match, meets most requirements
   - 50-69: Partial match, missing some key requirements
   - Below 50: Poor match, significant gaps

2. missing_keywords: List 3-8 important keywords/skills from the job description that are NOT present in the resume
   - Focus on technical skills, tools, certifications, or key qualifications
   - Only include genuinely important missing items
   - If all key items are present, return an empty list
"""
        else:
            job_match_instructions = """

NOTE: No job description was provided, so job_match_score and missing_keywords should be null/omitted.
"""

        # Build the prompt - using regular string concatenation to avoid f-string escaping issues
        system_prompt = """You are an expert resume reviewer and career coach with 15+ years of experience in talent acquisition and career development. Your task is to analyze resumes objectively and provide actionable feedback.

SCORING RUBRIC:

1. Skills Match (0-100):
   - Relevance of skills to the role/industry
   - Depth and breadth of technical/professional skills
   - Modern, in-demand technologies and methodologies
   - Certifications and continuous learning evidence

2. Experience Depth (0-100):
   - Clear job responsibilities and outcomes
   - Career progression and growth
   - Quantified achievements (metrics, percentages, impact)
   - Leadership and ownership examples
   - Relevant tenure and consistency

3. Clarity & Structure (0-100):
   - Professional formatting and organization
   - Concise, action-oriented language
   - Grammar and spelling accuracy
   - Logical flow and readability
   - Appropriate length (not too verbose or sparse)

4. Keyword Optimization (0-100):
   - Industry-relevant keywords and terminology
   - ATS (Applicant Tracking System) friendliness
   - Role-specific vocabulary
   - Proper use of technical terms

5. Achievement Impact (implicit in experience score):
   - Results-oriented descriptions
   - Quantifiable outcomes
   - Business impact demonstration

""" + jd_context + job_match_instructions + """

IMPORTANT: Return your analysis as valid JSON matching this format:
{format_instructions}

Be constructive, specific, and actionable in your feedback.

Resume to analyze:
{resume_text}"""

        return ChatPromptTemplate.from_template(system_prompt)

    def score_resume(
        self,
        resume_text: str,
        job_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Score a resume using LangChain and Google Generative AI

        Args:
            resume_text: Extracted text content from resume
            job_description: Optional job description for tailored scoring

        Returns:
            Dictionary containing analysis results
        """
        try:
            logger.info("Starting resume analysis...")

            # Step 1: Run ATS analysis first (fast, rule-based)
            logger.info("Running ATS compatibility analysis...")
            ats_results = analyze_ats_compatibility(resume_text)
            logger.info(f"ATS Score: {ats_results['ats_score']}")

            # Step 2: Build prompt with job description context
            prompt = self._build_scoring_prompt(job_description)

            # Create chain
            chain = prompt | self.llm

            # Get format instructions
            format_instructions = self.parser.get_format_instructions()

            # Invoke the chain
            response = chain.invoke({
                "resume_text": resume_text,
                "format_instructions": format_instructions
            })

            # Parse response
            logger.info("Parsing LLM response...")

            # Extract content from AIMessage
            content = response.content

            # Try to parse as JSON
            try:
                # Clean the response - sometimes LLMs wrap JSON in markdown
                content_clean = content.strip()
                if content_clean.startswith("```json"):
                    content_clean = content_clean[7:]
                if content_clean.startswith("```"):
                    content_clean = content_clean[3:]
                if content_clean.endswith("```"):
                    content_clean = content_clean[:-3]
                content_clean = content_clean.strip()

                # Parse JSON
                result = json.loads(content_clean)

                # Merge ATS results into the analysis
                result.update(ats_results)

                # Validate structure
                validated_result = self._validate_and_normalize_result(result)

                logger.info("Resume analysis completed successfully")
                return validated_result

            except json.JSONDecodeError as je:
                logger.error(f"Failed to parse JSON response: {je}")
                logger.debug(f"Response content: {content}")

                # Fallback: try to extract information manually
                fallback = self._create_fallback_response(resume_text)
                # Merge ATS results even in fallback
                fallback.update(ats_results)
                return fallback

        except Exception as e:
            logger.error(f"Resume scoring failed: {str(e)}", exc_info=True)
            raise

    def _validate_and_normalize_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and normalize the scoring result

        Args:
            result: Raw result dictionary

        Returns:
            Validated and normalized result
        """
        # Ensure overall_score is present and valid
        overall_score = result.get('overall_score', 0)
        if not isinstance(overall_score, int) or not (0 <= overall_score <= 100):
            overall_score = 50  # Default to middle score if invalid

        # Ensure section_scores exists
        section_scores = result.get('section_scores', {})
        required_sections = ['skills', 'experience', 'clarity', 'keywords']

        for section in required_sections:
            if section not in section_scores:
                section_scores[section] = overall_score  # Use overall score as default
            else:
                # Clamp to valid range
                score = section_scores[section]
                if not isinstance(score, int) or not (0 <= score <= 100):
                    section_scores[section] = overall_score

        # Ensure lists exist and have reasonable length
        strengths = result.get('strengths', [])
        if not isinstance(strengths, list):
            strengths = []
        strengths = strengths[:5]  # Limit to 5

        weaknesses = result.get('weaknesses', [])
        if not isinstance(weaknesses, list):
            weaknesses = []
        weaknesses = weaknesses[:5]  # Limit to 5

        recommendations = result.get('recommendations', [])
        if not isinstance(recommendations, list):
            recommendations = []
        recommendations = recommendations[:7]  # Limit to 7

        # Handle job match score (optional, only when job description provided)
        job_match_score = result.get('job_match_score')
        if job_match_score is not None:
            if not isinstance(job_match_score, int) or not (0 <= job_match_score <= 100):
                job_match_score = None

        # Handle missing keywords (optional)
        missing_keywords = result.get('missing_keywords')
        if missing_keywords is not None and not isinstance(missing_keywords, list):
            missing_keywords = None
        elif isinstance(missing_keywords, list):
            missing_keywords = missing_keywords[:10]  # Limit to 10

        # Handle ATS score (required, should always be present from ATS analyzer)
        ats_score = result.get('ats_score', 75)
        if not isinstance(ats_score, int) or not (0 <= ats_score <= 100):
            ats_score = 75  # Default to medium score

        # Handle ATS issues and recommendations
        ats_issues = result.get('ats_issues', [])
        if not isinstance(ats_issues, list):
            ats_issues = []

        ats_recommendations = result.get('ats_recommendations', [])
        if not isinstance(ats_recommendations, list):
            ats_recommendations = []

        validated = {
            'overall_score': overall_score,
            'section_scores': section_scores,
            'strengths': strengths,
            'weaknesses': weaknesses,
            'recommendations': recommendations,
            'ats_score': ats_score,
            'ats_issues': ats_issues,
            'ats_recommendations': ats_recommendations
        }

        # Add optional fields only if they exist
        if job_match_score is not None:
            validated['job_match_score'] = job_match_score
        if missing_keywords is not None:
            validated['missing_keywords'] = missing_keywords

        return validated

    def _create_fallback_response(self, resume_text: str) -> Dict[str, Any]:
        """
        Create a basic fallback response if LLM parsing fails

        Args:
            resume_text: Resume text content

        Returns:
            Basic analysis result
        """
        logger.warning("Using fallback response due to parsing failure")

        # Basic heuristics
        word_count = len(resume_text.split())
        has_metrics = any(char.isdigit() for char in resume_text)

        base_score = 60
        if word_count > 200:
            base_score += 10
        if has_metrics:
            base_score += 10

        # Try to get ATS analysis even in fallback
        try:
            ats_results = analyze_ats_compatibility(resume_text)
        except Exception as e:
            logger.error(f"ATS analysis failed in fallback: {e}")
            ats_results = {
                'ats_score': 70,
                'ats_issues': [],
                'ats_recommendations': []
            }

        return {
            'overall_score': base_score,
            'section_scores': {
                'skills': base_score,
                'experience': base_score,
                'clarity': base_score,
                'keywords': base_score
            },
            'ats_score': ats_results['ats_score'],
            'ats_issues': ats_results['ats_issues'],
            'ats_recommendations': ats_results['ats_recommendations'],
            'strengths': [
                "Resume content extracted successfully"
            ],
            'weaknesses': [
                "Detailed analysis unavailable - please try again"
            ],
            'recommendations': [
                "Ensure resume includes clear section headers",
                "Add quantifiable achievements with metrics",
                "Use industry-standard terminology"
            ]
        }
