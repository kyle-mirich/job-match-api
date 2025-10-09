from functools import wraps
from flask import request, jsonify
from config import Config
import logging

logger = logging.getLogger(__name__)


def require_api_key(f):
    """
    Decorator to require API key authentication via X-API-Key header

    Usage:
        @app.route('/protected')
        @require_api_key
        def protected_route():
            return jsonify({'message': 'Access granted'})
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get API key from header
        api_key = request.headers.get('X-API-Key')

        if not api_key:
            logger.warning("Request missing X-API-Key header")
            return jsonify({
                'error': 'Authentication required',
                'message': 'X-API-Key header is required'
            }), 401

        if api_key != Config.API_KEY:
            logger.warning(f"Invalid API key attempted: {api_key[:10]}...")
            return jsonify({
                'error': 'Authentication failed',
                'message': 'Invalid API key'
            }), 403

        logger.debug("API key authentication successful")
        return f(*args, **kwargs)

    return decorated_function
