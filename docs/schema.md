x# Database Schema Plan

## Purpose
This document defines the database schema contract for the Anton RX Track backend.  
It is the source of truth for:
- extracted policy fields
- SQL field types
- table design
- relationships
- defaults and constraints

---

## 1. Required Extracted Fields

Every policy PDF must be parsed into these 12 fields:

1. `drug_name`
2. `brand_name`
3. `hcpcs_code`
4. `payer`
5. `coverage_status`
6. `covered_indications`
7. `pa_required`
8. `pa_criteria`
9. `step_therapy_required`
10. `step_therapy_details`
11. `site_of_care`
12. `effective_date`

If a field is not found in the source PDF, return `null`.  
Never guess missing values.

---

## 2. SQL Types for Extracted Fields

| Field | SQL Type | Notes |
|------|----------|------|
| `drug_name` | `text` | Generic drug name |
| `brand_name` | `text` | Brand name |
| `hcpcs_code` | `text` | J-code / HCPCS identifier |
| `payer` | `text` | Insurance company name |
| `coverage_status` | `text` | Allowed values: `covered`, `not_covered`, `conditional` |
| `covered_indications` | `jsonb` | Array of approved diagnoses/conditions |
| `pa_required` | `boolean` | Prior authorization required or not |
| `pa_criteria` | `jsonb` | Array of approval requirements |
| `step_therapy_required` | `boolean` | Whether step therapy is required |
| `step_therapy_details` | `text` | Which therapies must be tried first |
| `site_of_care` | `jsonb` | Array of allowed sites of care |
| `effective_date` | `date` | Policy effective date |

---

## 3. Normalized Values

### coverage_status
Allowed normalized values:
- `covered`
- `not_covered`
- `conditional`

### site_of_care
Allowed normalized values:
- `hospital_outpatient`
- `physician_office`
- `home_infusion`

### payer
Expected normalized payer names for demo:
- `UHC`
- `Cigna`
- `BCBS NC`

---

## 4. Main Tables

### 4.1 policies
Main table for extracted and normalized policy records.

Suggested columns:
- `id`
- `policy_hash`
- `source_file_name`
- `storage_path`
- `storage_url`
- `policy_text`
- `raw_extraction_json`
- `drug_name`
- `brand_name`
- `hcpcs_code`
- `payer`
- `coverage_status`
- `covered_indications`
- `pa_required`
- `pa_criteria`
- `step_therapy_required`
- `step_therapy_details`
- `site_of_care`
- `effective_date`
- `created_at`
- `updated_at`

### 4.2 policy_versions
Stores multiple versions of the same policy for change tracking.

Suggested columns:
- `id`
- `policy_id`
- `version_label`
- `effective_date`
- `version_hash`
- `raw_extraction_json`
- `created_at`

### 4.3 policy_embeddings
Stores chunked text and vector embeddings for semantic search.

Suggested columns:
- `id`
- `policy_id`
- `chunk_index`
- `chunk_text`
- `embedding`
- `created_at`

### 4.4 policy_scores
Stores payer restrictiveness scores for leaderboard/ranking.

Suggested columns:
- `id`
- `policy_id`
- `payer`
- `drug_name`
- `score`
- `reason`
- `created_at`

---

## 5. Relationships

- `policy_versions.policy_id` references `policies.id`
- `policy_embeddings.policy_id` references `policies.id`
- `policy_scores.policy_id` references `policies.id`

---

## 6. Constraints and Defaults

### policies
- `policy_hash` must be unique
- `raw_extraction_json` defaults to empty JSON object
- `covered_indications` defaults to empty array
- `pa_criteria` defaults to empty array
- `site_of_care` defaults to empty array
- `created_at` defaults to current timestamp
- `updated_at` defaults to current timestamp

### policy_scores
- `score` must be between 1 and 10

---

## 7. Storage Metadata

Storage metadata will be kept in the `policies` table using:
- `source_file_name`
- `storage_path`
- `storage_url`

A separate storage table is not required for the prototype.

---

## 8. Notes for Team

- P1 extraction output must match these 12 fields exactly
- P2 database schema and models must follow this contract
- P4 routers should expect these normalized fields
- P3 frontend compare/search pages should render these same fields
- Prior authorization and step therapy are separate concepts and must not be merged
- Effective date must always be stored and shown when available