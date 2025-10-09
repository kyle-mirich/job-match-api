import pdfplumber
import PyPDF2
from io import BytesIO
import base64
import logging

logger = logging.getLogger(__name__)


def decode_base64_pdf(base64_string: str) -> BytesIO:
    """
    Decode base64 encoded PDF string to BytesIO object

    Args:
        base64_string: Base64 encoded PDF content

    Returns:
        BytesIO object containing PDF data
    """
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]

        pdf_data = base64.b64decode(base64_string)
        return BytesIO(pdf_data)
    except Exception as e:
        logger.error(f"Failed to decode base64 PDF: {str(e)}")
        raise ValueError("Invalid base64 encoded PDF")


def extract_text_from_pdf(pdf_file: BytesIO, method: str = 'pdfplumber') -> str:
    """
    Extract text content from PDF file

    Args:
        pdf_file: BytesIO object containing PDF data
        method: Extraction method ('pdfplumber' or 'pypdf2')

    Returns:
        Extracted text content as string
    """
    try:
        if method == 'pdfplumber':
            return _extract_with_pdfplumber(pdf_file)
        elif method == 'pypdf2':
            return _extract_with_pypdf2(pdf_file)
        else:
            raise ValueError(f"Unknown extraction method: {method}")
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        # Try fallback method
        if method == 'pdfplumber':
            logger.info("Trying fallback extraction with PyPDF2")
            pdf_file.seek(0)  # Reset file pointer
            return _extract_with_pypdf2(pdf_file)
        raise


def _extract_with_pdfplumber(pdf_file: BytesIO) -> str:
    """Extract text using pdfplumber (better formatting preservation)"""
    text_content = []

    with pdfplumber.open(pdf_file) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                text_content.append(text)

    if not text_content:
        raise ValueError("No text could be extracted from the PDF")

    return "\n\n".join(text_content)


def _extract_with_pypdf2(pdf_file: BytesIO) -> str:
    """Extract text using PyPDF2 (fallback method)"""
    text_content = []

    pdf_reader = PyPDF2.PdfReader(pdf_file)

    for page in pdf_reader.pages:
        text = page.extract_text()
        if text:
            text_content.append(text)

    if not text_content:
        raise ValueError("No text could be extracted from the PDF")

    return "\n\n".join(text_content)


def validate_pdf_content(text: str, min_length: int = 50) -> bool:
    """
    Validate that extracted PDF content is meaningful

    Args:
        text: Extracted text content
        min_length: Minimum expected text length

    Returns:
        True if valid, raises ValueError otherwise
    """
    if not text or len(text.strip()) < min_length:
        raise ValueError(
            f"PDF content too short (minimum {min_length} characters required)"
        )

    return True
