"""
LangChain-powered chat service with conversation memory for resume analysis
"""
import logging
from typing import Dict, Any, Iterator
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.callbacks.base import BaseCallbackHandler

logger = logging.getLogger(__name__)


class StreamingCallbackHandler(BaseCallbackHandler):
    """Callback handler for streaming LLM responses"""

    def __init__(self):
        self.tokens = []

    def on_llm_new_token(self, token: str, **kwargs) -> None:
        """Called when a new token is generated"""
        self.tokens.append(token)

    def get_tokens(self) -> list:
        """Get all accumulated tokens"""
        return self.tokens

class ResumeChatService:
    """Chat service with memory for discussing resume analysis"""

    def __init__(self, google_api_key: str):
        """Initialize chat service with LangChain and memory"""
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            google_api_key=google_api_key,
            temperature=0.7,
            streaming=True  # Enable streaming
        )

        # Store conversation memories and chains by session ID
        self.sessions: Dict[str, Dict[str, Any]] = {}

        # Custom prompt template for resume discussion with proper memory
        self.prompt_template = PromptTemplate(
            input_variables=["history", "input", "resume_context"],
            template="""You are an expert resume consultant AI assistant. You have analyzed a resume and are now helping the user understand the results and improve their resume.

Resume Analysis Context:
{resume_context}

Previous Conversation:
{history}

Current User Message: {input}

Assistant Response:"""
        )
        
    def get_or_create_session(self, session_id: str, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get existing session or create new one with analysis context"""
        if session_id not in self.sessions:
            # Create new memory for this session - use simple string memory
            memory = ConversationBufferMemory(
                memory_key="history",
                input_key="input",
                return_messages=False  # Return as string for proper prompt formatting
            )

            # Create LLM chain with custom prompt and memory
            chain = LLMChain(
                llm=self.llm,
                prompt=self.prompt_template,
                memory=memory,
                verbose=True
            )

            # Store the analysis context and chain
            self.sessions[session_id] = {
                'chain': chain,
                'memory': memory,
                'analysis': analysis_data
            }

            logger.info(f"Created new chat session: {session_id}")

        return self.sessions[session_id]
    
    def _build_resume_context(self, analysis: Dict[str, Any]) -> str:
        """Build resume context string from analysis data"""
        context_parts = [
            f"Overall Score: {analysis.get('overall_score', 'N/A')}/100",
            f"ATS Score: {analysis.get('ats_score', 'N/A')}/100",
        ]

        if analysis.get('job_match_score'):
            context_parts.append(f"Job Match Score: {analysis['job_match_score']}%")

        # Add section scores
        if 'section_scores' in analysis:
            context_parts.append("\nSection Scores:")
            for section, score in analysis['section_scores'].items():
                context_parts.append(f"  - {section.title()}: {score}/100")

        # Add strengths
        if analysis.get('strengths'):
            context_parts.append(f"\nStrengths ({len(analysis['strengths'])}):")
            for strength in analysis['strengths'][:3]:  # Top 3
                context_parts.append(f"  - {strength}")

        # Add weaknesses
        if analysis.get('weaknesses'):
            context_parts.append(f"\nWeaknesses ({len(analysis['weaknesses'])}):")
            for weakness in analysis['weaknesses'][:3]:  # Top 3
                context_parts.append(f"  - {weakness}")

        # Add recommendations
        if analysis.get('recommendations'):
            context_parts.append(f"\nRecommendations ({len(analysis['recommendations'])}):")
            for rec in analysis['recommendations'][:3]:  # Top 3
                context_parts.append(f"  - {rec}")

        return "\n".join(context_parts)

    def chat(self, session_id: str, message: str, analysis_data: Dict[str, Any]) -> str:
        """Process a chat message with context from resume analysis"""
        try:
            # Get or create session
            session = self.get_or_create_session(session_id, analysis_data)
            chain = session['chain']
            analysis = session['analysis']

            # Build resume context
            resume_context = self._build_resume_context(analysis)

            # Run chain with proper inputs - memory will handle history automatically
            response = chain.run(
                input=message,
                resume_context=resume_context
            )

            logger.info(f"Chat response generated for session {session_id}")
            logger.info(f"Memory now has {len(session['memory'].chat_memory.messages)} messages")

            return response

        except Exception as e:
            logger.error(f"Chat error for session {session_id}: {e}", exc_info=True)
            return "I apologize, but I encountered an error processing your question. Please try rephrasing or ask something else about your resume analysis."
    
    def chat_stream(self, session_id: str, message: str, analysis_data: Dict[str, Any]) -> Iterator[str]:
        """Stream chat responses token by token with simulated streaming"""
        import time
        import re

        try:
            # Get or create session
            session = self.get_or_create_session(session_id, analysis_data)
            chain = session['chain']
            analysis = session['analysis']

            # Build resume context
            resume_context = self._build_resume_context(analysis)

            # Get full response first - memory will handle history automatically
            response = chain.run(
                input=message,
                resume_context=resume_context
            )

            logger.info(f"Chat response generated for session {session_id}")
            logger.info(f"Memory now has {len(session['memory'].chat_memory.messages)} messages")

            # Simulate streaming by splitting response into chunks
            # Split on word boundaries, punctuation, and whitespace
            words = re.findall(r'\S+\s*', response)

            for word in words:
                yield word
                time.sleep(0.02)  # Small delay for streaming effect

            logger.info(f"Streaming chat response completed for session {session_id}")

        except Exception as e:
            logger.error(f"Chat streaming error for session {session_id}: {e}", exc_info=True)
            yield "I apologize, but I encountered an error processing your question. Please try rephrasing or ask something else about your resume analysis."

    def clear_session(self, session_id: str):
        """Clear a chat session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Cleared chat session: {session_id}")
