"""
LangChain-powered chat service with conversation memory for resume analysis
"""
import logging
from typing import Dict, Any
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate

logger = logging.getLogger(__name__)

class ResumeChatService:
    """Chat service with memory for discussing resume analysis"""
    
    def __init__(self, google_api_key: str):
        """Initialize chat service with LangChain and memory"""
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            google_api_key=google_api_key,
            temperature=0.7
        )
        
        # Store conversation memories by session ID
        self.sessions: Dict[str, ConversationBufferMemory] = {}
        
        # Custom prompt template for resume discussion
        self.prompt_template = PromptTemplate(
            input_variables=["history", "input", "resume_context"],
            template="""You are an expert resume consultant AI assistant. You have analyzed a resume and are now helping the user understand the results and improve their resume.

Resume Analysis Context:
{resume_context}

Conversation History:
{history}

User: {input}
Assistant: Let me help you with that."""
        )
        
    def get_or_create_session(self, session_id: str, analysis_data: Dict[str, Any]) -> ConversationChain:
        """Get existing session or create new one with analysis context"""
        if session_id not in self.sessions:
            # Create new memory for this session
            memory = ConversationBufferMemory(
                memory_key="history",
                return_messages=True
            )
            
            # Create conversation chain with memory
            chain = ConversationChain(
                llm=self.llm,
                memory=memory,
                verbose=True
            )
            
            # Store the analysis context
            self.sessions[session_id] = {
                'chain': chain,
                'analysis': analysis_data
            }
            
            logger.info(f"Created new chat session: {session_id}")
        
        return self.sessions[session_id]
    
    def chat(self, session_id: str, message: str, analysis_data: Dict[str, Any]) -> str:
        """Process a chat message with context from resume analysis"""
        try:
            # Get or create session
            session = self.get_or_create_session(session_id, analysis_data)
            chain = session['chain']
            analysis = session['analysis']
            
            # Build context from analysis
            context_parts = [
                f"Overall Score: {analysis.get('overall_score', 'N/A')}/100",
                f"ATS Score: {analysis.get('ats_score', 'N/A')}/100",
            ]
            
            if analysis.get('job_match_score'):
                context_parts.append(f"Job Match Score: {analysis['job_match_score']}%")
            
            # Add section scores
            if 'section_scores' in analysis:
                context_parts.append("\\nSection Scores:")
                for section, score in analysis['section_scores'].items():
                    context_parts.append(f"  - {section.title()}: {score}/100")
            
            # Add strengths
            if analysis.get('strengths'):
                context_parts.append(f"\\nStrengths ({len(analysis['strengths'])}):")
                for strength in analysis['strengths'][:3]:  # Top 3
                    context_parts.append(f"  - {strength}")
            
            # Add weaknesses
            if analysis.get('weaknesses'):
                context_parts.append(f"\\nWeaknesses ({len(analysis['weaknesses'])}):")
                for weakness in analysis['weaknesses'][:3]:  # Top 3
                    context_parts.append(f"  - {weakness}")
            
            # Add recommendations
            if analysis.get('recommendations'):
                context_parts.append(f"\\nRecommendations ({len(analysis['recommendations'])}):")
                for rec in analysis['recommendations'][:3]:  # Top 3
                    context_parts.append(f"  - {rec}")
            
            resume_context = "\\n".join(context_parts)
            
            # Create enhanced prompt with context
            enhanced_message = f"""Resume Analysis Summary:
{resume_context}

User Question: {message}

Please provide a helpful, specific answer based on the resume analysis above. Be conversational and actionable."""
            
            # Get response from chain
            response = chain.predict(input=enhanced_message)
            
            logger.info(f"Chat response generated for session {session_id}")
            return response
            
        except Exception as e:
            logger.error(f"Chat error for session {session_id}: {e}", exc_info=True)
            return "I apologize, but I encountered an error processing your question. Please try rephrasing or ask something else about your resume analysis."
    
    def clear_session(self, session_id: str):
        """Clear a chat session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            logger.info(f"Cleared chat session: {session_id}")
