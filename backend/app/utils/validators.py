from typing import Union, List, Dict
from app.schemas import PolicyData

def validate_extraction(raw_data: Union[List[Dict], Dict]) -> List[PolicyData]:
    """
    Validates unstructured JSON output against the 12-field schema.
    Rejects hallucinated keys by mapping strictly to PolicyData.
    Allows missing data as None.
    Handles single object vs array of objects smoothly.
    """
    if isinstance(raw_data, dict):
        raw_data = [raw_data]
        
    validated_policies = []
    
    for item in raw_data:
        # Pydantic's BaseModel automatically filters out hallucinated fields
        # if they aren't defined in the schema (standard behavior or explicit exclude).
        # We instantiate it directly, feeding the raw dict.
        # Any missing fields become None due to schema setup.
        
        # We use model_validate which handles dictionaries in v2
        validated_policies.append(PolicyData.model_validate(item))
        
    return validated_policies
