import io
import pdfplumber

def extract_text_and_chunks(pdf_bytes: bytes, chunk_size: int = 1000) -> tuple[str, list[str]]:
    """
    Extracts text from a PDF file buffer.
    Fails if the document yields no text (e.g. scanned image).
    Also generates naive chunks for P1 embeddings.
    """
    full_text = ""
    
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                full_text += page_text + "\n"
                
    full_text = full_text.strip()
    
    if not full_text:
        raise ValueError("PDF text extraction failed. File may be empty or a scanned image without OCR.")
        
    # Robust character-based chunking with overlap
    chunk_size = 2000
    overlap = 200
    chunks = []
    
    if len(full_text) <= chunk_size:
        chunks.append(full_text)
    else:
        start = 0
        while start < len(full_text):
            end = start + chunk_size
            chunk = full_text[start:end]
            chunks.append(chunk.strip())
            start += (chunk_size - overlap)
            
    return full_text, chunks
