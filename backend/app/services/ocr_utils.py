"""
Shared OCR response helpers used by both the async parse_pdf flow
and the sync Celery import task.
"""


def extract_ocr_text(ocr_response: dict) -> str:
    """
    Extract plain text from a Mistral Document AI OCR response.

    Supports both the pages/markdown format and the chat-completions
    fallback format.  Raises ValueError if the response is empty or
    has an unexpected structure.
    """
    ocr_text = ""

    if "pages" in ocr_response:
        for page in ocr_response["pages"]:
            if "markdown" in page:
                ocr_text += page["markdown"] + "\n"
    elif "choices" in ocr_response:
        # Chat completions format fallback
        ocr_text = ocr_response["choices"][0]["message"]["content"]
    else:
        raise ValueError(
            "Unexpected OCR response format. Could not extract text."
        )

    if not ocr_text.strip():
        raise ValueError(
            "OCR could not extract any text from the PDF. "
            "The file may be empty or in an unsupported format."
        )

    return ocr_text
