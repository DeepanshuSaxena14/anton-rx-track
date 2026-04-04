from typing import List
import logging

logger = logging.getLogger(__name__)

_model = None

def get_embedder_model():
    """
    Lazy loads the sentence-transformers model so it doesn't drag on app boot
    unless explicitly called.
    """
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            # Using local model all-MiniLM-L6-v2 as requested avoiding heavy API reliance
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("Loaded sentence-transformers model all-MiniLM-L6-v2")
        except ImportError as e:
            logger.error("sentence-transformers is not installed. P2/P4 should install it in requirements.")
            raise RuntimeError("Missing sentence-transformers package") from e
    return _model

def embed_text(chunks: List[str]) -> List[List[float]]:
    """
    Converts text chunks to float vectors.
    """
    if not chunks:
        return []
    
    model = get_embedder_model()
    try:
        # model.encode returns a numpy array structure, which must be coerced to python floats for JSON APIs/DBs
        embeddings = model.encode(chunks)
        return [emb.tolist() for emb in embeddings]
    except Exception as e:
        logger.error(f"Failed to encode chunks: {str(e)}")
        raise RuntimeError("Embedding generation failed.") from e
