-- Enable pgvector extension
create extension if not exists vector;

-- Add embedding column if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'recordings' and column_name = 'embedding') then
        alter table recordings add column embedding vector(1536);
    end if;
end $$;

-- Create vector search function
create or replace function match_recordings(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 5
)
returns table (
  id uuid,
  name text,
  transcript text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    recordings.id,
    recordings.name,
    recordings.transcript,
    1 - (recordings.embedding <=> query_embedding) as similarity
  from recordings
  where 1 - (recordings.embedding <=> query_embedding) > match_threshold
  order by recordings.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create index for faster searches
create index if not exists recordings_embedding_idx on recordings 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
