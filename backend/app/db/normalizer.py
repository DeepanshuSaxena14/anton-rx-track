from __future__ import annotations

from typing import Any


PAYER_MAP = {
    "uhc": "UHC",
    "unitedhealthcare": "UHC",
    "united healthcare": "UHC",
    "united health care": "UHC",
    "cigna": "Cigna",
    "cigna healthcare": "Cigna",
    "blue cross blue shield nc": "BCBS NC",
    "blue cross blue shield of north carolina": "BCBS NC",
    "bcbs nc": "BCBS NC",
    "bcbsnc": "BCBS NC",
}

COVERAGE_STATUS_MAP = {
    "covered": "covered",
    "not covered": "not_covered",
    "not_covered": "not_covered",
    "non-covered": "not_covered",
    "non covered": "not_covered",
    "conditional": "conditional",
    "covered with conditions": "conditional",
    "covered with criteria": "conditional",
}

SITE_OF_CARE_MAP = {
    "hospital outpatient": "hospital_outpatient",
    "outpatient hospital": "hospital_outpatient",
    "hospital_outpatient": "hospital_outpatient",
    "physician office": "physician_office",
    "physician_office": "physician_office",
    "doctor office": "physician_office",
    "provider office": "physician_office",
    "home infusion": "home_infusion",
    "home_infusion": "home_infusion",
}

DRUG_ALIAS_MAP = {
    "keytruda": {
        "drug_name": "pembrolizumab",
        "brand_name": "Keytruda",
        "hcpcs_code": "J9271",
    },
    "pembrolizumab": {
        "drug_name": "pembrolizumab",
        "brand_name": "Keytruda",
        "hcpcs_code": "J9271",
    },
    "j9271": {
        "drug_name": "pembrolizumab",
        "brand_name": "Keytruda",
        "hcpcs_code": "J9271",
    },
    "dupixent": {
        "drug_name": "dupilumab",
        "brand_name": "Dupixent",
        "hcpcs_code": "J0173",
    },
    "dupilumab": {
        "drug_name": "dupilumab",
        "brand_name": "Dupixent",
        "hcpcs_code": "J0173",
    },
    "j0173": {
        "drug_name": "dupilumab",
        "brand_name": "Dupixent",
        "hcpcs_code": "J0173",
    },
}


def _clean(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _key(value: str | None) -> str | None:
    cleaned = _clean(value)
    return cleaned.lower() if cleaned else None


def normalize_payer(raw_payer: str | None) -> str | None:
    key = _key(raw_payer)
    if not key:
        return None
    return PAYER_MAP.get(key, raw_payer.strip())


def normalize_coverage_status(raw_status: str | None) -> str | None:
    key = _key(raw_status)
    if not key:
        return None
    mapped = COVERAGE_STATUS_MAP.get(key)
    if not mapped:
        raise ValueError(f"Invalid coverage_status '{raw_status}'. Allowed values are 'covered', 'not_covered', 'conditional' or their aliases.")
    return mapped


def normalize_site_of_care(values: list[str] | None) -> list[str]:
    if not values:
        return []

    normalized: list[str] = []
    seen: set[str] = set()

    for value in values:
        key = _key(value)
        if not key:
            continue
        mapped = SITE_OF_CARE_MAP.get(key, key.replace(" ", "_"))
        if mapped not in seen:
            seen.add(mapped)
            normalized.append(mapped)

    return normalized


def normalize_drug_identity(
    drug_name: str | None,
    brand_name: str | None,
    hcpcs_code: str | None,
) -> dict[str, str | None]:
    candidates = [drug_name, brand_name, hcpcs_code]

    for candidate in candidates:
        key = _key(candidate)
        if key and key in DRUG_ALIAS_MAP:
            return DRUG_ALIAS_MAP[key].copy()

    return {
        "drug_name": _clean(drug_name),
        "brand_name": _clean(brand_name),
        "hcpcs_code": _clean(hcpcs_code),
    }


def normalize_policy_payload(payload: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(payload)

    drug_identity = normalize_drug_identity(
        payload.get("drug_name"),
        payload.get("brand_name"),
        payload.get("hcpcs_code"),
    )

    normalized["drug_name"] = drug_identity["drug_name"]
    normalized["brand_name"] = drug_identity["brand_name"]
    normalized["hcpcs_code"] = drug_identity["hcpcs_code"]
    normalized["payer"] = normalize_payer(payload.get("payer"))
    normalized["coverage_status"] = normalize_coverage_status(
        payload.get("coverage_status")
    )
    normalized["site_of_care"] = normalize_site_of_care(
        payload.get("site_of_care", [])
    )

    return normalized