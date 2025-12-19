-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table for recordings
create table public.recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users, -- Nullable for anonymous usage in Level 2b 
  name text not null,
  duration integer not null, -- seconds
  timestamp timestamptz default now(),
  transcript text,
  audio_url text, -- Store the Storage Public URL or Path
  created_at timestamptz default now(),
  embedding vector(1536) -- OpenAI text-embedding-3-small dimensions
);

-- Enable RLS
alter table public.recordings enable row level security;

-- Policy: Allow generic access (simplistic for demo)
create policy "Allow generic access"
on public.recordings
for all
using (true)
with check (true);

-- Storage Bucket
insert into storage.buckets (id, name, public) 
values ('recordings', 'recordings', true);

-- Storage Policy
create policy "Public Access"
on storage.objects for all
using ( bucket_id = 'recordings' )
with check ( bucket_id = 'recordings' );

-- Function to search for similar recordings
create or replace function match_recordings (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
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
