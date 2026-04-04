create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists policies (
    id uuid primary key default gen_random_uuid(),
    policy_hash text not null unique,
    source_file_name text,
    storage_path text,
    storage_url text,
    policy_text text,
    raw_extraction_json jsonb not null default '{}'::jsonb,

    drug_name text,
    brand_name text,
    hcpcs_code text,
    payer text,
    coverage_status text,
    covered_indications jsonb not null default '[]'::jsonb,
    pa_required boolean,
    pa_criteria jsonb not null default '[]'::jsonb,
    step_therapy_required boolean,
    step_therapy_details text,
    site_of_care jsonb not null default '[]'::jsonb,
    effective_date date,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists policy_versions (
    id uuid primary key default gen_random_uuid(),
    policy_id uuid not null references policies(id) on delete cascade,
    version_label text,
    effective_date date,
    version_hash text,
    raw_extraction_json jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

create table if not exists policy_embeddings (
    id uuid primary key default gen_random_uuid(),
    policy_id uuid not null references policies(id) on delete cascade,
    chunk_index integer not null,
    chunk_text text not null,
    embedding vector(384) not null,
    created_at timestamptz not null default now()
);

create table if not exists policy_scores (
    id uuid primary key default gen_random_uuid(),
    policy_id uuid not null references policies(id) on delete cascade,
    payer text not null,
    drug_name text not null,
    score integer not null check (score between 1 and 10),
    reason text,
    created_at timestamptz not null default now()
);

create index if not exists idx_policies_payer on policies(payer);
create index if not exists idx_policies_drug_name on policies(drug_name);
create index if not exists idx_policies_brand_name on policies(brand_name);
create index if not exists idx_policies_hcpcs_code on policies(hcpcs_code);
create index if not exists idx_policies_effective_date on policies(effective_date);

create index if not exists idx_policy_versions_policy_id on policy_versions(policy_id);
create index if not exists idx_policy_embeddings_policy_id on policy_embeddings(policy_id);
create index if not exists idx_policy_scores_policy_id on policy_scores(policy_id);