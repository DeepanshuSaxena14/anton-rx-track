import logging
from typing import Union, List, Dict
from pydantic import ValidationError
from app.schemas import PolicyData

logger = logging.getLogger("rx-track-p4")

def validate_extraction(raw_data: Union[List[Dict], Dict]) -> List[PolicyData]:
    """
    Validates unstructured JSON output against the 12-field schema.
    Extra keys are Forbidden natively by Pydantic.
    Fails loudly if the schema shape is malformed or if arrays are passed as strings.
    """
    if isinstance(raw_data, dict):
        raw_data = [raw_data]
        
    validated_policies = []
    
    for idx, item in enumerate(raw_data):
        try:
            # model_validate will fail loudly if arrays are strings or keys are hallucinated
            policy = PolicyData.model_validate(item, strict=False) 
            # Note: strict=False allows basic coercion, but arrays must be sequences.
            # extra='forbid' in the schema handles hallucinated keys.
            validated_policies.append(policy)
        except ValidationError as e:
            logger.error(f"Validation failed loudly on policy extraction item {idx}: {e.errors()}")
            # Fail loudly with an explicit message to be bubbled up to the router
            raise ValueError(f"Malformed extraction payload: {e.errors()}")
            
    return validated_policies
