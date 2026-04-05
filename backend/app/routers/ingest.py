from fastapi import APIRouter, File, UploadFile
from typing import List

from app.schemas import IngestResponse
from app.utils.pdf_extractor import extract_text_and_chunks
from app.utils.validators import validate_extraction
from app.services import (
    p2_store_original_pdf,
    p1_extract_policy,
    p2_store_policies,
    p1_generate_embeddings,
    p2_store_embeddings,
    p1_compute_score,
    p2_store_score,
    p2_store_version
)

router = APIRouter(prefix="/ingest", tags=["ingest"])

@router.post("", response_model=IngestResponse)
async def ingest_pdf(file: UploadFile = File(...)):
    """
    Orchestrates the ingestion pipeline for a new PDF policy.
    - Extracts text/chunks
    - Relies on P1 for unstructured data extraction
    - Relies on P4 validators for schema enforcement
    - Relies on P2 for storage and uniqueness deduplication
    """
    errors = []
    policies_extracted = 0
    
    try:
        # 1. Read PDF bytes
        pdf_bytes = await file.read()
        
        # 2. Persist original PDF via P2 storage helper
        pdf_uri = p2_store_original_pdf(file.filename, pdf_bytes)
        
        # 3. Extract text via P4 pdf utility
        try:
            full_text, chunks = extract_text_and_chunks(pdf_bytes)
        except ValueError as e:
            # Handle empty/scanned PDFs explicitly
            return IngestResponse(
                status="error",
                message="PDF text extraction failed",
                errors=[str(e)]
            )
            
        # 4. Call P1 extractor on text
        raw_json_data = p1_extract_policy(full_text)
        
        # 5. Validate extracted policy objects (ensure 12-field compliance)
        validated_policies = validate_extraction(raw_json_data)
        policies_extracted = len(validated_policies)
        
        # 6. Insert policy records via P2 policy helpers (DB does dedup)
        record_ids = p2_store_policies(validated_policies)
        
        # 7. Insert version tracking via P2
        p2_store_version(record_ids, raw_json_data)
        
        # 8. Generate embeddings via P1 embedder
        embeddings = p1_generate_embeddings(chunks)
        
        # 9. Store embeddings via P2 helper
        p2_store_embeddings(record_ids, chunks, embeddings)
        
        # 10. Compute & 11. store scores contextually
        for i, policy in enumerate(validated_policies):
            score_data = p1_compute_score(policy)
            if i < len(record_ids):
                p2_store_score(record_ids[i], policy.payer, policy.drug_name, score_data)
                
        return IngestResponse(
            status="ok",
            message="Ingestion pipeline completed successfully.",
            policies_extracted=policies_extracted
        )
        
    except Exception as e:
        # Resilient to partial failures
        import traceback
        full_trace = traceback.format_exc()
        errors.append(f"Unexpected error during orchestration: {str(e)}")
        print(f"PIPELINE EXCEPTION TRACEBACK:\n{full_trace}")
        return IngestResponse(
            status="error",
            message="Ingestion pipeline failed partially or entirely.",
            errors=[str(e), full_trace]
        )
