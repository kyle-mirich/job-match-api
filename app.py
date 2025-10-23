import os
import logging
import time
import json
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from config import Config
from middleware import require_api_key
from utils import decode_base64_pdf, extract_text_from_pdf, validate_pdf_content
from services import ResumeScorer, ResumeChatService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS with explicit configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "X-API-Key"],
        "supports_credentials": True
    }
})

# Create uploads directory if it doesn't exist
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

# Initialize ResumeScorer
try:
    scorer = ResumeScorer()
    logger.info("ResumeScorer initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize ResumeScorer: {e}")
    scorer = None

# Initialize Chat Service
try:
    chat_service = ResumeChatService(google_api_key=Config.GOOGLE_API_KEY)
    logger.info("Chat service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize chat service: {e}")
    chat_service = None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Resume Insight Scoring API',
        'version': '1.0.0'
    }), 200


@app.route('/analyze-resume-stream', methods=['POST'])
@require_api_key
def analyze_resume_stream():
    """
    Analyze a resume with real-time progress updates using Server-Sent Events

    Request Body:
        {
            "file": "<base64 encoded PDF>",
            "job_description": "Optional JD text for tailored scoring"
        }

    Response: Server-Sent Events stream with progress updates
    """
    def generate_analysis():
        try:
            # Check if scorer is initialized
            if scorer is None:
                yield f"event: error\ndata: {json.dumps({'error': 'Service unavailable'})}\n\n"
                return

            # Validate request
            if not request.is_json:
                yield f"event: error\ndata: {json.dumps({'error': 'Invalid request'})}\n\n"
                return

            data = request.get_json()

            # Validate required fields
            if 'file' not in data:
                yield f"event: error\ndata: {json.dumps({'error': 'Missing required field: file'})}\n\n"
                return

            base64_pdf = data['file']
            job_description = data.get('job_description')

            # Progress 1: Decoding PDF (0-15%)
            yield f"event: progress\ndata: {json.dumps({'stage': 'decoding', 'progress': 0, 'message': 'Decoding PDF...'})}\n\n"
            time.sleep(0.3)

            try:
                pdf_file = decode_base64_pdf(base64_pdf)
                logger.info("PDF decoded successfully")
                yield f"event: progress\ndata: {json.dumps({'stage': 'decoding', 'progress': 15, 'message': 'PDF decoded successfully'})}\n\n"
            except ValueError as e:
                yield f"event: error\ndata: {json.dumps({'error': 'Invalid PDF', 'message': str(e)})}\n\n"
                return

            # Progress 2: Extracting text (15-30%)
            yield f"event: progress\ndata: {json.dumps({'stage': 'extracting', 'progress': 15, 'message': 'Extracting text from PDF...'})}\n\n"
            time.sleep(0.3)

            try:
                resume_text = extract_text_from_pdf(pdf_file)
                logger.info(f"Extracted {len(resume_text)} characters from PDF")
                yield f"event: progress\ndata: {json.dumps({'stage': 'extracting', 'progress': 30, 'message': f'Extracted {len(resume_text.split())} words'})}\n\n"
            except Exception as e:
                yield f"event: error\ndata: {json.dumps({'error': 'PDF extraction failed', 'message': str(e)})}\n\n"
                return

            # Progress 3: Validating content (30-35%)
            yield f"event: progress\ndata: {json.dumps({'stage': 'validating', 'progress': 30, 'message': 'Validating resume content...'})}\n\n"
            time.sleep(0.2)

            try:
                validate_pdf_content(resume_text)
                yield f"event: progress\ndata: {json.dumps({'stage': 'validating', 'progress': 35, 'message': 'Content validated'})}\n\n"
            except ValueError as e:
                yield f"event: error\ndata: {json.dumps({'error': 'Invalid resume content', 'message': str(e)})}\n\n"
                return

            # Progress 4: ATS Analysis (35-55%)
            yield f"event: progress\ndata: {json.dumps({'stage': 'ats_analysis', 'progress': 35, 'message': 'Running ATS compatibility check...'})}\n\n"
            time.sleep(0.4)

            # Progress 5: AI Analysis (55-90%)
            yield f"event: progress\ndata: {json.dumps({'stage': 'ai_analysis', 'progress': 55, 'message': 'AI analyzing your resume...'})}\n\n"
            time.sleep(0.5)

            yield f"event: progress\ndata: {json.dumps({'stage': 'ai_analysis', 'progress': 70, 'message': 'Evaluating skills and experience...'})}\n\n"
            time.sleep(0.5)

            yield f"event: progress\ndata: {json.dumps({'stage': 'ai_analysis', 'progress': 85, 'message': 'Generating recommendations...'})}\n\n"

            # Step 6: Score the resume
            try:
                analysis_result = scorer.score_resume(
                    resume_text=resume_text,
                    job_description=job_description
                )
                logger.info("Resume analysis completed successfully")

                # Progress 6: Finalizing (90-100%)
                yield f"event: progress\ndata: {json.dumps({'stage': 'finalizing', 'progress': 90, 'message': 'Finalizing results...'})}\n\n"
                time.sleep(0.3)

                # Add metadata
                response = {
                    **analysis_result,
                    'metadata': {
                        'resume_length_chars': len(resume_text),
                        'resume_length_words': len(resume_text.split()),
                        'has_job_description': job_description is not None
                    }
                }

                yield f"event: progress\ndata: {json.dumps({'stage': 'complete', 'progress': 100, 'message': 'Analysis complete!'})}\n\n"

                # Send final result
                yield f"event: result\ndata: {json.dumps(response)}\n\n"

            except Exception as e:
                logger.error(f"Resume scoring failed: {e}", exc_info=True)
                yield f"event: error\ndata: {json.dumps({'error': 'Analysis failed', 'message': str(e)})}\n\n"

        except Exception as e:
            logger.error(f"Unexpected error in analyze_resume_stream: {e}", exc_info=True)
            yield f"event: error\ndata: {json.dumps({'error': 'Internal server error', 'message': str(e)})}\n\n"

    return Response(
        stream_with_context(generate_analysis()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive'
        }
    )


@app.route('/analyze-resume', methods=['POST'])
@require_api_key
def analyze_resume():
    """
    Analyze a resume and return scoring results

    Request Body:
        {
            "file": "<base64 encoded PDF>",
            "job_description": "Optional JD text for tailored scoring"
        }

    Response:
        {
            "overall_score": 86,
            "section_scores": {
                "skills": 90,
                "experience": 80,
                "clarity": 85,
                "keywords": 88
            },
            "strengths": ["Strong technical skills", "Clear project outcomes"],
            "weaknesses": ["Limited leadership examples"],
            "recommendations": [
                "Add metrics to describe impact",
                "Include a summary section with top skills"
            ]
        }
    """
    try:
        # Check if scorer is initialized
        if scorer is None:
            logger.error("ResumeScorer not initialized")
            return jsonify({
                'error': 'Service unavailable',
                'message': 'Resume scoring service is not properly configured. Please check GOOGLE_API_KEY.'
            }), 503

        # Validate request
        if not request.is_json:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Content-Type must be application/json'
            }), 400

        data = request.get_json()

        # Validate required fields
        if 'file' not in data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Missing required field: file (base64 encoded PDF)'
            }), 400

        base64_pdf = data['file']
        job_description = data.get('job_description')

        logger.info("Processing resume analysis request...")

        # Step 1: Decode base64 PDF
        try:
            pdf_file = decode_base64_pdf(base64_pdf)
            logger.info("PDF decoded successfully")
        except ValueError as e:
            logger.warning(f"PDF decoding failed: {e}")
            return jsonify({
                'error': 'Invalid PDF',
                'message': str(e)
            }), 400

        # Step 2: Extract text from PDF
        try:
            resume_text = extract_text_from_pdf(pdf_file)
            logger.info(f"Extracted {len(resume_text)} characters from PDF")
        except ValueError as e:
            logger.warning(f"PDF text extraction failed: {e}")
            return jsonify({
                'error': 'PDF extraction failed',
                'message': str(e)
            }), 400
        except Exception as e:
            logger.error(f"Unexpected error during PDF extraction: {e}")
            return jsonify({
                'error': 'PDF processing failed',
                'message': 'Unable to extract text from PDF. Please ensure it is not password-protected or corrupted.'
            }), 400

        # Step 3: Validate content
        try:
            validate_pdf_content(resume_text)
        except ValueError as e:
            logger.warning(f"PDF validation failed: {e}")
            return jsonify({
                'error': 'Invalid resume content',
                'message': str(e)
            }), 400

        # Step 4: Score the resume
        try:
            analysis_result = scorer.score_resume(
                resume_text=resume_text,
                job_description=job_description
            )
            logger.info("Resume analysis completed successfully")

            # Add metadata
            response = {
                **analysis_result,
                'metadata': {
                    'resume_length_chars': len(resume_text),
                    'resume_length_words': len(resume_text.split()),
                    'has_job_description': job_description is not None
                }
            }

            return jsonify(response), 200

        except Exception as e:
            logger.error(f"Resume scoring failed: {e}", exc_info=True)
            return jsonify({
                'error': 'Analysis failed',
                'message': 'An error occurred while analyzing the resume. Please try again.'
            }), 500

    except Exception as e:
        logger.error(f"Unexpected error in analyze_resume: {e}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred. Please try again later.'
        }), 500


@app.route('/api/chat', methods=['POST', 'OPTIONS'])
def chat():
    """
    Chat with AI about resume analysis using LangChain with memory

    Request Body:
        {
            "message": "User's question",
            "session_id": "unique-session-id",
            "analysis": { ... resume analysis data ... }
        }

    Response:
        {
            "response": "AI assistant's response"
        }
    """
    try:
        # Handle OPTIONS for CORS (before auth check)
        if request.method == 'OPTIONS':
            return '', 204

        # Check API key for POST requests
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != Config.API_KEY:
            return jsonify({'error': 'Unauthorized'}), 401

        if chat_service is None:
            logger.error("Chat service not initialized")
            return jsonify({
                'error': 'Service unavailable',
                'message': 'Chat service is not available'
            }), 503

        if not request.is_json:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Content-Type must be application/json'
            }), 400

        data = request.get_json()

        # Validate required fields
        if 'message' not in data or 'session_id' not in data or 'analysis' not in data:
            return jsonify({
                'error': 'Invalid request',
                'message': 'Missing required fields: message, session_id, analysis'
            }), 400

        message = data['message']
        session_id = data['session_id']
        analysis = data['analysis']

        logger.info(f"Processing chat message for session {session_id}: {message[:50]}...")
        logger.info(f"Analysis data keys: {list(analysis.keys())}")

        # Get response from chat service
        response = chat_service.chat(session_id, message, analysis)

        logger.info(f"Chat response generated: {response[:100]}...")

        return jsonify({
            'response': response
        }), 200

    except Exception as e:
        logger.error(f"Chat endpoint error: {e}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred processing your message'
        }), 500


@app.route('/api/chat/stream', methods=['POST', 'OPTIONS'])
def chat_stream():
    """
    Stream chat responses with AI about resume analysis using LangChain with memory

    Request Body:
        {
            "message": "User's question",
            "session_id": "unique-session-id",
            "analysis": { ... resume analysis data ... }
        }

    Response: Server-Sent Events stream with chat tokens
    """
    try:
        # Handle OPTIONS for CORS (before auth check)
        if request.method == 'OPTIONS':
            return '', 204

        # Check API key for POST requests
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != Config.API_KEY:
            return jsonify({'error': 'Unauthorized'}), 401

        if chat_service is None:
            logger.error("Chat service not initialized")
            def error_stream():
                yield f"data: {json.dumps({'error': 'Service unavailable'})}\n\n"
            return Response(stream_with_context(error_stream()), mimetype='text/event-stream')

        if not request.is_json:
            def error_stream():
                yield f"data: {json.dumps({'error': 'Invalid request'})}\n\n"
            return Response(stream_with_context(error_stream()), mimetype='text/event-stream')

        data = request.get_json()

        # Validate required fields
        if 'message' not in data or 'session_id' not in data or 'analysis' not in data:
            def error_stream():
                yield f"data: {json.dumps({'error': 'Missing required fields'})}\n\n"
            return Response(stream_with_context(error_stream()), mimetype='text/event-stream')

        message = data['message']
        session_id = data['session_id']
        analysis = data['analysis']

        logger.info(f"Streaming chat message for session {session_id}: {message[:50]}...")

        def generate_chat_stream():
            try:
                for token in chat_service.chat_stream(session_id, message, analysis):
                    yield f"data: {json.dumps({'token': token})}\n\n"
                # Send completion signal
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                logger.error(f"Streaming error: {e}", exc_info=True)
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return Response(
            stream_with_context(generate_chat_stream()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no',
                'Connection': 'keep-alive'
            }
        )

    except Exception as e:
        logger.error(f"Chat stream endpoint error: {e}", exc_info=True)
        def error_stream():
            yield f"data: {json.dumps({'error': 'Internal server error'})}\n\n"
        return Response(stream_with_context(error_stream()), mimetype='text/event-stream')


@app.route('/', methods=['GET'])
def root():
    """API information endpoint"""
    return jsonify({
        'service': 'Resume Insight Scoring API',
        'version': '1.0.0',
        'endpoints': {
            'health': {
                'method': 'GET',
                'path': '/health',
                'description': 'Health check endpoint'
            },
            'analyze_resume': {
                'method': 'POST',
                'path': '/analyze-resume',
                'description': 'Analyze a resume and get scoring results',
                'authentication': 'X-API-Key header required'
            }
        },
        'documentation': 'See README.md for detailed usage instructions'
    }), 200


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Not found',
        'message': 'The requested endpoint does not exist'
    }), 404


@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({
        'error': 'Method not allowed',
        'message': f'The {request.method} method is not allowed for this endpoint'
    }), 405


@app.errorhandler(500)
def internal_server_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {error}", exc_info=True)
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred. Please try again later.'
    }), 500


if __name__ == '__main__':
    logger.info(f"Starting Resume Insight Scoring API on {Config.HOST}:{Config.PORT}")
    logger.info(f"Debug mode: {Config.DEBUG}")

    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
