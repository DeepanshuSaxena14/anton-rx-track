-- Migration 002: Add Vector Search RPC

create or replace function match_policy_embeddings (
  query_embedding vector(384),
  match_limit int default 5
)
returns table (
  policy_id uuid,
  chunk_index integer,
  chunk_text text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    policy_embeddings.policy_id,
    policy_embeddings.chunk_index,
    policy_embeddings.chunk_text,
    1 - (policy_embeddings.embedding <=> query_embedding) as similarity
  from policy_embeddings
  order by policy_embeddings.embedding <=> query_embedding
  limit match_limit;
end;
$$;
