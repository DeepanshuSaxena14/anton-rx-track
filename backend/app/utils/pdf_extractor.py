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
        
    # Naive chunking by word count or char count. Let's do simple char blocks.
    chunks = []
    # simple chunking logic preserving basic block boundaries if possible
    blocks = full_text.split('\n\n')
    current_chunk = ""
    for block in blocks:
        if len(current_chunk) + len(block) < chunk_size:
            current_chunk += block + "\n\n"
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = block + "\n\n"
            
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
        
    return full_text, chunks
