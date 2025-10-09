import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""

    # API Settings
    API_KEY = os.getenv('API_KEY', 'your-secret-api-key-change-this')

    # Google AI Settings
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    MODEL_NAME = os.getenv('MODEL_NAME', 'gemini-1.5-pro')

    # Flask Settings
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))

    # File Upload Settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'uploads'

    # Scoring Settings
    MAX_SCORE = 100
    MIN_SCORE = 0
